using System.Collections;
using UnityEngine;

namespace MimicBoss.Combat
{
    public class GoldCoinTrap : MonoBehaviour
    {
        [Header("Trap Settings")]
        [SerializeField] private float damage = 50f;
        [SerializeField] private float activationDelay = 2f;
        [SerializeField] private float explosionRadius = 3f;
        [SerializeField] private float explosionForce = 500f;
        
        [Header("Visual")]
        [SerializeField] private GameObject warningIndicator;
        [SerializeField] private GameObject explosionEffect;
        [SerializeField] private float blinkSpeed = 2f;
        
        [Header("Audio")]
        [SerializeField] private AudioClip armSound;
        [SerializeField] private AudioClip explodeSound;
        
        private bool isArmed = false;
        private bool hasExploded = false;
        private Renderer trapRenderer;
        private Color originalColor;
        
        public void Initialize(float dmg, float delay)
        {
            damage = dmg;
            activationDelay = delay;
            
            trapRenderer = GetComponent<Renderer>();
            if (trapRenderer != null)
            {
                originalColor = trapRenderer.material.color;
            }
            
            StartCoroutine(ArmTrap());
        }
        
        private IEnumerator ArmTrap()
        {
            if (warningIndicator != null)
            {
                warningIndicator.SetActive(true);
            }
            
            if (armSound != null)
            {
                AudioSource.PlayClipAtPoint(armSound, transform.position);
            }
            
            float elapsed = 0f;
            while (elapsed < activationDelay)
            {
                elapsed += Time.deltaTime;
                
                if (trapRenderer != null)
                {
                    float blink = Mathf.PingPong(Time.time * blinkSpeed, 1f);
                    trapRenderer.material.color = Color.Lerp(originalColor, Color.red, blink);
                }
                
                yield return null;
            }
            
            isArmed = true;
            
            if (trapRenderer != null)
            {
                trapRenderer.material.color = Color.red;
            }
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!isArmed || hasExploded) return;
            
            if (other.CompareTag("Player"))
            {
                Explode();
            }
        }
        
        private void OnTriggerStay(Collider other)
        {
            if (!isArmed || hasExploded) return;
            
            if (other.CompareTag("Player"))
            {
                Explode();
            }
        }
        
        private void Explode()
        {
            if (hasExploded) return;
            hasExploded = true;
            
            Collider[] hits = Physics.OverlapSphere(transform.position, explosionRadius);
            
            foreach (var hit in hits)
            {
                if (hit.CompareTag("Player"))
                {
                    var damageable = hit.GetComponent<IDamageable>();
                    if (damageable != null)
                    {
                        float distance = Vector3.Distance(transform.position, hit.transform.position);
                        float falloff = 1f - (distance / explosionRadius);
                        damageable.TakeDamage(damage * falloff);
                    }
                    
                    var rb = hit.GetComponent<Rigidbody>();
                    if (rb != null)
                    {
                        Vector3 direction = (hit.transform.position - transform.position).normalized;
                        rb.AddForce(direction * explosionForce + Vector3.up * explosionForce * 0.5f, ForceMode.Impulse);
                    }
                }
            }
            
            CreateExplosionEffect();
            
            if (explodeSound != null)
            {
                AudioSource.PlayClipAtPoint(explodeSound, transform.position);
            }
            
            CameraShaker.Instance?.Shake(0.3f, 0.2f);
            
            Destroy(gameObject, 0.1f);
        }
        
        private void CreateExplosionEffect()
        {
            if (explosionEffect != null)
            {
                GameObject effect = Instantiate(explosionEffect, transform.position, Quaternion.identity);
                Destroy(effect, 3f);
            }
            
            for (int i = 0; i < 10; i++)
            {
                GameObject coinPrefab = Resources.Load<GameObject>("Prefabs/GoldCoinProjectile");
                if (coinPrefab != null)
                {
                    Vector3 randomDirection = Random.insideUnitSphere;
                    randomDirection.y = Mathf.Abs(randomDirection.y);
                    
                    GameObject coin = Instantiate(coinPrefab, transform.position + Vector3.up * 0.5f, Quaternion.identity);
                    var rb = coin.GetComponent<Rigidbody>();
                    if (rb != null)
                    {
                        rb.velocity = randomDirection * Random.Range(5f, 15f);
                    }
                }
            }
        }
        
        private void OnDrawGizmosSelected()
        {
            Gizmos.color = new Color(1f, 0f, 0f, 0.3f);
            Gizmos.DrawSphere(transform.position, explosionRadius);
        }
    }
}