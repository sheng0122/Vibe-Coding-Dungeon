using System.Collections;
using UnityEngine;
using UnityEngine.Events;

namespace MimicBoss.Animation
{
    public class AnimationEvents : MonoBehaviour
    {
        [Header("Attack Events")]
        [SerializeField] private Transform attackOrigin;
        [SerializeField] private GameObject biteFX;
        [SerializeField] private GameObject tongueFX;
        [SerializeField] private GameObject landingFX;
        [SerializeField] private GameObject goldSprayFX;
        
        [Header("Sound Effects")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip biteSound;
        [SerializeField] private AudioClip tongueSound;
        [SerializeField] private AudioClip jumpSound;
        [SerializeField] private AudioClip landSound;
        [SerializeField] private AudioClip transformSound;
        [SerializeField] private AudioClip goldSound;
        [SerializeField] private AudioClip footstepSound;
        
        [Header("Camera Effects")]
        [SerializeField] private float landShakeIntensity = 0.5f;
        [SerializeField] private float landShakeDuration = 0.3f;
        
        [Header("Custom Events")]
        public UnityEvent<string> OnCustomEvent;
        
        private MimicController controller;
        private AttackSystem attackSystem;
        
        private void Start()
        {
            controller = GetComponent<MimicController>();
            attackSystem = GetComponent<AttackSystem>();
            
            if (audioSource == null)
                audioSource = GetComponent<AudioSource>();
        }
        
        public void OnBiteHit()
        {
            PlaySound(biteSound);
            SpawnEffect(biteFX, GetAttackPosition());
            
            CheckBiteDamage();
        }
        
        public void OnTongueWhip()
        {
            PlaySound(tongueSound);
            SpawnEffect(tongueFX, GetAttackPosition());
            
            CheckTongueDamage();
        }
        
        public void OnJumpStart()
        {
            PlaySound(jumpSound);
        }
        
        public void OnLandImpact()
        {
            PlaySound(landSound);
            SpawnEffect(landingFX, transform.position);
            
            CreateShockwave();
            ShakeCamera();
        }
        
        public void OnGoldCoinSpawn()
        {
            PlaySound(goldSound);
            SpawnGoldCoins();
        }
        
        public void OnFootstep()
        {
            PlaySound(footstepSound);
            
            if (controller.CurrentPhase >= 2)
            {
                GameObject dustFX = Resources.Load<GameObject>("Prefabs/DustCloud");
                SpawnEffect(dustFX, transform.position);
            }
        }
        
        public void OnTransformStart()
        {
            PlaySound(transformSound);
            
            GameObject transformFX = Resources.Load<GameObject>("Prefabs/TransformFX");
            SpawnEffect(transformFX, transform.position + Vector3.up);
        }
        
        public void OnTransformComplete()
        {
            if (controller.CurrentPhase == 3)
            {
                StartCoroutine(RageEffectRoutine());
            }
        }
        
        public void OnDeathExplosion()
        {
            GameObject deathFX = Resources.Load<GameObject>("Prefabs/DeathExplosion");
            SpawnEffect(deathFX, transform.position + Vector3.up);
            
            SpawnDeathRewards();
            
            ShakeCamera(1f, 0.5f);
        }
        
        private void CheckBiteDamage()
        {
            Vector3 hitboxPos = GetAttackPosition();
            Collider[] hits = Physics.OverlapSphere(hitboxPos, 2f);
            
            foreach (var hit in hits)
            {
                if (hit.CompareTag("Player"))
                {
                    var damageable = hit.GetComponent<IDamageable>();
                    if (damageable != null)
                    {
                        float damage = controller.Data.GetAttackByName("Bite").damage;
                        damageable.TakeDamage(damage);
                    }
                }
            }
        }
        
        private void CheckTongueDamage()
        {
            Vector3 origin = GetAttackPosition();
            Vector3 direction = transform.forward;
            float range = 5f;
            float angle = 120f;
            
            Collider[] allHits = Physics.OverlapSphere(origin, range);
            
            foreach (var hit in allHits)
            {
                if (hit.CompareTag("Player"))
                {
                    Vector3 dirToTarget = (hit.transform.position - origin).normalized;
                    float angleToTarget = Vector3.Angle(direction, dirToTarget);
                    
                    if (angleToTarget <= angle / 2f)
                    {
                        var damageable = hit.GetComponent<IDamageable>();
                        if (damageable != null)
                        {
                            float damage = controller.Data.GetAttackByName("TongueWhip").damage;
                            damageable.TakeDamage(damage);
                        }
                        
                        var statusEffect = hit.GetComponent<IStatusEffect>();
                        if (statusEffect != null)
                        {
                            statusEffect.ApplySlow(0.5f, 3f);
                        }
                    }
                }
            }
        }
        
        private void CreateShockwave()
        {
            float radius = 3f;
            float force = 500f;
            
            if (controller.CurrentPhase >= 2)
            {
                radius *= 1.5f;
                force *= 1.5f;
            }
            
            Collider[] hits = Physics.OverlapSphere(transform.position, radius);
            
            foreach (var hit in hits)
            {
                if (hit.CompareTag("Player"))
                {
                    var rb = hit.GetComponent<Rigidbody>();
                    if (rb != null)
                    {
                        Vector3 direction = (hit.transform.position - transform.position).normalized;
                        rb.AddForce(direction * force + Vector3.up * force * 0.5f, ForceMode.Impulse);
                    }
                    
                    var damageable = hit.GetComponent<IDamageable>();
                    if (damageable != null)
                    {
                        float damage = controller.Data.GetAttackByName("Jump").damage;
                        damageable.TakeDamage(damage);
                    }
                }
            }
        }
        
        private void SpawnGoldCoins()
        {
            GameObject coinPrefab = Resources.Load<GameObject>("Prefabs/GoldCoinProjectile");
            
            int coinCount = 5 + controller.CurrentPhase * 2;
            
            for (int i = 0; i < coinCount; i++)
            {
                float angle = (360f / coinCount) * i;
                Vector3 direction = Quaternion.Euler(0, angle, 0) * Vector3.forward;
                
                Vector3 spawnPos = transform.position + Vector3.up + direction * 0.5f;
                GameObject coin = Instantiate(coinPrefab, spawnPos, Quaternion.identity);
                
                var rb = coin.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    rb.velocity = direction * 10f + Vector3.up * 5f;
                }
            }
        }
        
        private void SpawnDeathRewards()
        {
            GameObject goldPrefab = Resources.Load<GameObject>("Prefabs/GoldPickup");
            
            int goldAmount = Random.Range(100, 200);
            if (controller.CurrentPhase >= 3)
                goldAmount = Random.Range(300, 400);
            
            for (int i = 0; i < goldAmount / 10; i++)
            {
                Vector3 randomPos = transform.position + Random.insideUnitSphere * 3f;
                randomPos.y = transform.position.y + Random.Range(1f, 3f);
                
                GameObject gold = Instantiate(goldPrefab, randomPos, Quaternion.identity);
                var rb = gold.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    rb.velocity = Random.insideUnitSphere * 5f + Vector3.up * 10f;
                }
            }
        }
        
        private IEnumerator RageEffectRoutine()
        {
            GameObject rageFX = Resources.Load<GameObject>("Prefabs/RageAura");
            GameObject aura = Instantiate(rageFX, transform);
            
            while (controller.CurrentPhase == 3 && controller.CurrentHealth > 0)
            {
                yield return new WaitForSeconds(0.5f);
                
                GameObject goldPrefab = Resources.Load<GameObject>("Prefabs/GoldPickup");
                Vector3 dropPos = transform.position + Random.insideUnitSphere * 2f;
                dropPos.y = transform.position.y;
                Instantiate(goldPrefab, dropPos, Quaternion.identity);
            }
            
            if (aura != null)
                Destroy(aura);
        }
        
        private void PlaySound(AudioClip clip)
        {
            if (clip != null && audioSource != null)
            {
                audioSource.PlayOneShot(clip);
            }
        }
        
        private void SpawnEffect(GameObject effectPrefab, Vector3 position)
        {
            if (effectPrefab != null)
            {
                GameObject effect = Instantiate(effectPrefab, position, Quaternion.identity);
                Destroy(effect, 3f);
            }
        }
        
        private Vector3 GetAttackPosition()
        {
            if (attackOrigin != null)
                return attackOrigin.position;
            
            return transform.position + transform.forward * 1.5f + Vector3.up * 0.5f;
        }
        
        private void ShakeCamera(float intensity = -1f, float duration = -1f)
        {
            if (intensity < 0)
                intensity = landShakeIntensity;
            if (duration < 0)
                duration = landShakeDuration;
            
            CameraShaker.Instance?.Shake(intensity, duration);
        }
        
        public void TriggerCustomEvent(string eventName)
        {
            OnCustomEvent?.Invoke(eventName);
        }
    }
}