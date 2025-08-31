using System.Collections;
using UnityEngine;

namespace MimicBoss.Combat
{
    public class BoomerangProjectile : MonoBehaviour
    {
        [Header("Boomerang Settings")]
        [SerializeField] private float damage = 35f;
        [SerializeField] private float speed = 12f;
        [SerializeField] private float maxDistance = 8f;
        [SerializeField] private float returnSpeed = 15f;
        [SerializeField] private float rotationSpeed = 720f;
        
        [Header("Physics")]
        [SerializeField] private AnimationCurve speedCurve;
        [SerializeField] private AnimationCurve heightCurve;
        
        [Header("Effects")]
        [SerializeField] private GameObject hitEffect;
        [SerializeField] private GameObject trailEffect;
        [SerializeField] private AudioClip throwSound;
        [SerializeField] private AudioClip hitSound;
        
        private Transform owner;
        private Vector3 startPosition;
        private Vector3 targetDirection;
        private float travelDistance = 0f;
        private bool isReturning = false;
        private HashSet<GameObject> hitTargets = new HashSet<GameObject>();
        
        public void Initialize(float dmg, Transform thrower, float distance)
        {
            damage = dmg;
            owner = thrower;
            maxDistance = distance;
            startPosition = transform.position;
            targetDirection = transform.forward;
            
            if (throwSound != null)
            {
                AudioSource.PlayClipAtPoint(throwSound, transform.position);
            }
            
            if (trailEffect != null)
            {
                GameObject trail = Instantiate(trailEffect, transform);
            }
            
            StartCoroutine(BoomerangFlight());
        }
        
        private IEnumerator BoomerangFlight()
        {
            while (true)
            {
                if (!isReturning)
                {
                    MoveForward();
                    
                    travelDistance += speed * Time.deltaTime;
                    if (travelDistance >= maxDistance)
                    {
                        isReturning = true;
                    }
                }
                else
                {
                    if (owner == null)
                    {
                        Destroy(gameObject);
                        yield break;
                    }
                    
                    MoveTowardsOwner();
                    
                    float distanceToOwner = Vector3.Distance(transform.position, owner.position);
                    if (distanceToOwner < 1f)
                    {
                        Destroy(gameObject);
                        yield break;
                    }
                }
                
                transform.Rotate(0, 0, rotationSpeed * Time.deltaTime);
                
                yield return null;
            }
        }
        
        private void MoveForward()
        {
            float normalizedDistance = travelDistance / maxDistance;
            float currentSpeed = speed;
            
            if (speedCurve != null && speedCurve.keys.Length > 0)
            {
                currentSpeed *= speedCurve.Evaluate(normalizedDistance);
            }
            
            Vector3 movement = targetDirection * currentSpeed * Time.deltaTime;
            
            if (heightCurve != null && heightCurve.keys.Length > 0)
            {
                float height = heightCurve.Evaluate(normalizedDistance) * 2f;
                movement.y = height - transform.position.y + startPosition.y;
            }
            
            transform.position += movement;
        }
        
        private void MoveTowardsOwner()
        {
            Vector3 directionToOwner = (owner.position - transform.position).normalized;
            transform.position += directionToOwner * returnSpeed * Time.deltaTime;
            
            float normalizedReturn = 1f - (Vector3.Distance(transform.position, owner.position) / maxDistance);
            if (heightCurve != null && heightCurve.keys.Length > 0)
            {
                float height = heightCurve.Evaluate(normalizedReturn) * 1f;
                transform.position = new Vector3(transform.position.x, owner.position.y + height, transform.position.z);
            }
        }
        
        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player") && !hitTargets.Contains(other.gameObject))
            {
                DealDamage(other.gameObject);
                hitTargets.Add(other.gameObject);
                
                if (isReturning)
                {
                    hitTargets.Clear();
                }
            }
            else if (other.CompareTag("Wall") || other.CompareTag("Obstacle"))
            {
                if (!isReturning)
                {
                    isReturning = true;
                    CreateHitEffect(transform.position);
                }
            }
        }
        
        private void DealDamage(GameObject target)
        {
            var damageable = target.GetComponent<IDamageable>();
            if (damageable != null)
            {
                damageable.TakeDamage(damage);
            }
            
            CreateHitEffect(target.transform.position);
            
            if (hitSound != null)
            {
                AudioSource.PlayClipAtPoint(hitSound, transform.position);
            }
            
            var rb = target.GetComponent<Rigidbody>();
            if (rb != null)
            {
                Vector3 knockback = (target.transform.position - transform.position).normalized * 5f;
                rb.AddForce(knockback, ForceMode.Impulse);
            }
        }
        
        private void CreateHitEffect(Vector3 position)
        {
            if (hitEffect != null)
            {
                GameObject effect = Instantiate(hitEffect, position, Quaternion.identity);
                Destroy(effect, 2f);
            }
        }
        
        private void OnDrawGizmosSelected()
        {
            if (Application.isPlaying)
            {
                Gizmos.color = Color.yellow;
                Gizmos.DrawLine(startPosition, startPosition + targetDirection * maxDistance);
                
                if (isReturning && owner != null)
                {
                    Gizmos.color = Color.green;
                    Gizmos.DrawLine(transform.position, owner.position);
                }
            }
        }
    }
}