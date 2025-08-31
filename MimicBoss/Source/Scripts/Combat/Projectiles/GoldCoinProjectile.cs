using System.Collections;
using UnityEngine;

namespace MimicBoss.Combat
{
    public class GoldCoinProjectile : MonoBehaviour
    {
        [Header("Projectile Settings")]
        [SerializeField] private float damage = 10f;
        [SerializeField] private float lifeTime = 5f;
        [SerializeField] private int maxBounces = 3;
        [SerializeField] private float bounceForce = 0.7f;
        
        [Header("Physics")]
        [SerializeField] private float gravity = -9.81f;
        [SerializeField] private bool usePhysics = true;
        
        [Header("Effects")]
        [SerializeField] private GameObject hitEffect;
        [SerializeField] private GameObject bounceEffect;
        [SerializeField] private AudioClip hitSound;
        [SerializeField] private AudioClip bounceSound;
        
        private Rigidbody rb;
        private MimicController owner;
        private int currentBounces = 0;
        private bool hasHit = false;
        private float spawnTime;
        
        public void Initialize(float dmg, MimicController controller)
        {
            damage = dmg;
            owner = controller;
            spawnTime = Time.time;
            
            rb = GetComponent<Rigidbody>();
            if (rb == null && usePhysics)
            {
                rb = gameObject.AddComponent<Rigidbody>();
                rb.mass = 0.1f;
                rb.drag = 0.5f;
                rb.angularDrag = 0.5f;
                rb.useGravity = true;
            }
            
            StartCoroutine(LifetimeRoutine());
        }
        
        private void Start()
        {
            if (rb != null && usePhysics)
            {
                rb.AddTorque(Random.insideUnitSphere * 500f);
            }
        }
        
        private void OnCollisionEnter(Collision collision)
        {
            if (collision.gameObject.CompareTag("Player") && !hasHit)
            {
                DealDamage(collision.gameObject);
                CreateHitEffect(collision.contacts[0].point);
                hasHit = true;
                Destroy(gameObject, 0.1f);
            }
            else if (collision.gameObject.CompareTag("Ground"))
            {
                HandleBounce(collision);
            }
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (!usePhysics && other.CompareTag("Player") && !hasHit)
            {
                DealDamage(other.gameObject);
                CreateHitEffect(transform.position);
                hasHit = true;
                Destroy(gameObject);
            }
        }
        
        private void DealDamage(GameObject target)
        {
            var damageable = target.GetComponent<IDamageable>();
            if (damageable != null)
            {
                damageable.TakeDamage(damage);
            }
            
            if (hitSound != null)
            {
                AudioSource.PlayClipAtPoint(hitSound, transform.position);
            }
        }
        
        private void HandleBounce(Collision collision)
        {
            if (currentBounces < maxBounces)
            {
                currentBounces++;
                
                if (rb != null)
                {
                    Vector3 reflectDirection = Vector3.Reflect(rb.velocity.normalized, collision.contacts[0].normal);
                    rb.velocity = reflectDirection * rb.velocity.magnitude * bounceForce;
                    rb.AddForce(Vector3.up * 200f);
                }
                
                CreateBounceEffect(collision.contacts[0].point);
                
                if (bounceSound != null)
                {
                    AudioSource.PlayClipAtPoint(bounceSound, transform.position);
                }
            }
            else
            {
                ConvertToPickup();
            }
        }
        
        private void ConvertToPickup()
        {
            if (rb != null)
            {
                rb.isKinematic = true;
            }
            
            GetComponent<Collider>().isTrigger = true;
            
            var pickup = gameObject.AddComponent<GoldPickup>();
            pickup.goldValue = Random.Range(1, 5);
            
            Destroy(this);
        }
        
        private void CreateHitEffect(Vector3 position)
        {
            if (hitEffect != null)
            {
                GameObject effect = Instantiate(hitEffect, position, Quaternion.identity);
                Destroy(effect, 2f);
            }
        }
        
        private void CreateBounceEffect(Vector3 position)
        {
            if (bounceEffect != null)
            {
                GameObject effect = Instantiate(bounceEffect, position, Quaternion.identity);
                Destroy(effect, 1f);
            }
        }
        
        private IEnumerator LifetimeRoutine()
        {
            yield return new WaitForSeconds(lifeTime);
            
            if (!hasHit)
            {
                ConvertToPickup();
            }
        }
    }
    
    public class GoldPickup : MonoBehaviour
    {
        public int goldValue = 1;
        private bool collected = false;
        
        private void OnTriggerEnter(Collider other)
        {
            if (collected) return;
            
            if (other.CompareTag("Player"))
            {
                collected = true;
                
                var inventory = other.GetComponent<IInventory>();
                if (inventory != null)
                {
                    inventory.AddGold(goldValue);
                }
                
                GameObject pickupEffect = Resources.Load<GameObject>("Prefabs/GoldPickupEffect");
                if (pickupEffect != null)
                {
                    Instantiate(pickupEffect, transform.position, Quaternion.identity);
                }
                
                AudioClip pickupSound = Resources.Load<AudioClip>("Audio/GoldPickup");
                if (pickupSound != null)
                {
                    AudioSource.PlayClipAtPoint(pickupSound, transform.position);
                }
                
                Destroy(gameObject);
            }
        }
    }
    
    public interface IInventory
    {
        void AddGold(int amount);
        void AddItem(string itemId);
    }
}