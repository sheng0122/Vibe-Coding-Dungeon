using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace MimicBoss.Core
{
    [RequireComponent(typeof(Rigidbody))]
    [RequireComponent(typeof(Collider))]
    public class MimicController : MonoBehaviour
    {
        [Header("Core Components")]
        [SerializeField] private MimicStateMachine stateMachine;
        [SerializeField] private MimicData mimicData;
        
        [Header("References")]
        [SerializeField] private Transform playerTarget;
        [SerializeField] private Animator animator;
        [SerializeField] private AudioSource audioSource;
        
        [Header("Stats")]
        [SerializeField] private float currentHealth;
        [SerializeField] private int currentPhase = 1;
        [SerializeField] private bool isAwakened = false;
        
        [Header("Events")]
        public UnityEvent<float> OnHealthChanged;
        public UnityEvent<int> OnPhaseChanged;
        public UnityEvent OnAwakened;
        public UnityEvent OnDeath;
        
        private Rigidbody rb;
        private Collider col;
        private float detectionRange;
        private float attackCooldown;
        private Dictionary<string, float> skillCooldowns = new Dictionary<string, float>();
        
        public MimicStateMachine StateMachine => stateMachine;
        public MimicData Data => mimicData;
        public Transform PlayerTarget => playerTarget;
        public Animator Animator => animator;
        public float CurrentHealth => currentHealth;
        public int CurrentPhase => currentPhase;
        public bool IsAwakened => isAwakened;
        
        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            col = GetComponent<Collider>();
            
            if (stateMachine == null)
                stateMachine = GetComponent<MimicStateMachine>();
            
            if (mimicData == null)
                mimicData = Resources.Load<MimicData>("MimicBossData");
            
            InitializeStats();
        }
        
        private void Start()
        {
            stateMachine.Initialize(this);
            stateMachine.ChangeState(MimicState.Disguised);
            
            FindPlayer();
            StartCoroutine(DetectionRoutine());
        }
        
        private void Update()
        {
            UpdateCooldowns();
            CheckPhaseTransition();
        }
        
        private void InitializeStats()
        {
            currentHealth = mimicData.maxHealth;
            detectionRange = mimicData.detectionRange;
            
            foreach (var attack in mimicData.attacks)
            {
                skillCooldowns[attack.attackName] = 0f;
            }
        }
        
        private void FindPlayer()
        {
            if (playerTarget == null)
            {
                GameObject player = GameObject.FindGameObjectWithTag("Player");
                if (player != null)
                    playerTarget = player.transform;
            }
        }
        
        private IEnumerator DetectionRoutine()
        {
            while (true)
            {
                if (!isAwakened && playerTarget != null)
                {
                    float distance = Vector3.Distance(transform.position, playerTarget.position);
                    if (distance <= detectionRange)
                    {
                        Awaken();
                    }
                }
                yield return new WaitForSeconds(0.2f);
            }
        }
        
        public void Awaken()
        {
            if (isAwakened) return;
            
            isAwakened = true;
            stateMachine.ChangeState(MimicState.Awakening);
            OnAwakened?.Invoke();
        }
        
        public void TakeDamage(float damage)
        {
            if (stateMachine.CurrentState == MimicState.Disguised && !isAwakened)
            {
                Awaken();
            }
            
            float actualDamage = damage - mimicData.defense;
            actualDamage = Mathf.Max(actualDamage, 1f);
            
            currentHealth -= actualDamage;
            currentHealth = Mathf.Max(currentHealth, 0f);
            
            OnHealthChanged?.Invoke(currentHealth);
            
            if (currentHealth <= 0)
            {
                Die();
            }
            else if (stateMachine.CurrentState != MimicState.Hit && 
                     stateMachine.CurrentState != MimicState.Dying)
            {
                stateMachine.ChangeState(MimicState.Hit);
            }
        }
        
        private void CheckPhaseTransition()
        {
            if (!isAwakened || currentHealth <= 0) return;
            
            float healthPercentage = currentHealth / mimicData.maxHealth;
            int newPhase = 1;
            
            if (healthPercentage <= 0.3f)
                newPhase = 3;
            else if (healthPercentage <= 0.6f)
                newPhase = 2;
            
            if (newPhase != currentPhase)
            {
                currentPhase = newPhase;
                OnPhaseChanged?.Invoke(currentPhase);
                stateMachine.ChangeState(MimicState.PhaseTransition);
            }
        }
        
        private void UpdateCooldowns()
        {
            List<string> keys = new List<string>(skillCooldowns.Keys);
            foreach (string key in keys)
            {
                if (skillCooldowns[key] > 0)
                {
                    skillCooldowns[key] -= Time.deltaTime;
                    skillCooldowns[key] = Mathf.Max(skillCooldowns[key], 0f);
                }
            }
        }
        
        public bool CanUseSkill(string skillName)
        {
            return skillCooldowns.ContainsKey(skillName) && skillCooldowns[skillName] <= 0;
        }
        
        public void UseSkill(string skillName, float cooldown)
        {
            if (skillCooldowns.ContainsKey(skillName))
            {
                skillCooldowns[skillName] = cooldown;
            }
        }
        
        public void Move(Vector3 direction, float speed)
        {
            if (stateMachine.CurrentState != MimicState.Moving) return;
            
            Vector3 movement = direction.normalized * speed * Time.deltaTime;
            rb.MovePosition(transform.position + movement);
            
            if (direction != Vector3.zero)
            {
                Quaternion targetRotation = Quaternion.LookRotation(direction);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, 10f * Time.deltaTime);
            }
        }
        
        public void Jump(Vector3 targetPosition)
        {
            StartCoroutine(JumpCoroutine(targetPosition));
        }
        
        private IEnumerator JumpCoroutine(Vector3 targetPosition)
        {
            float jumpDuration = 0.5f;
            float elapsed = 0f;
            Vector3 startPos = transform.position;
            float jumpHeight = 3f;
            
            while (elapsed < jumpDuration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / jumpDuration;
                
                Vector3 currentPos = Vector3.Lerp(startPos, targetPosition, t);
                currentPos.y = startPos.y + Mathf.Sin(t * Mathf.PI) * jumpHeight;
                
                transform.position = currentPos;
                yield return null;
            }
            
            transform.position = targetPosition;
            CreateLandingImpact();
        }
        
        private void CreateLandingImpact()
        {
            Collider[] nearbyColliders = Physics.OverlapSphere(transform.position, 3f);
            foreach (Collider col in nearbyColliders)
            {
                if (col.CompareTag("Player"))
                {
                    var damageable = col.GetComponent<IDamageable>();
                    damageable?.TakeDamage(mimicData.GetAttackByName("JumpAttack").damage);
                }
            }
        }
        
        private void Die()
        {
            if (stateMachine.CurrentState == MimicState.Dead) return;
            
            stateMachine.ChangeState(MimicState.Dying);
            OnDeath?.Invoke();
            StartCoroutine(DeathSequence());
        }
        
        private IEnumerator DeathSequence()
        {
            yield return new WaitForSeconds(2f);
            
            DropRewards();
            
            yield return new WaitForSeconds(1f);
            
            stateMachine.ChangeState(MimicState.Dead);
            Destroy(gameObject, 2f);
        }
        
        private void DropRewards()
        {
            int goldAmount = Random.Range(100, 200);
            
            if (currentPhase >= 3)
                goldAmount = Random.Range(300, 400);
            
            for (int i = 0; i < goldAmount / 10; i++)
            {
                Vector3 randomPos = transform.position + Random.insideUnitSphere * 2f;
                randomPos.y = transform.position.y + 1f;
            }
        }
        
        public float GetDistanceToPlayer()
        {
            if (playerTarget == null) return float.MaxValue;
            return Vector3.Distance(transform.position, playerTarget.position);
        }
        
        public Vector3 GetDirectionToPlayer()
        {
            if (playerTarget == null) return Vector3.zero;
            return (playerTarget.position - transform.position).normalized;
        }
        
        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, detectionRange);
            
            if (mimicData != null)
            {
                Gizmos.color = Color.red;
                Gizmos.DrawWireSphere(transform.position, mimicData.attackRange);
            }
        }
    }
    
    public interface IDamageable
    {
        void TakeDamage(float damage);
    }
    
    public interface IStatusEffect
    {
        void ApplySlow(float slowAmount, float duration);
        void ApplyStun(float duration);
    }
}