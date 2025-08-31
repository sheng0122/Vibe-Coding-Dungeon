using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace MimicBoss.Combat
{
    public class AttackSystem : MonoBehaviour
    {
        [Header("Attack Configuration")]
        [SerializeField] private LayerMask targetLayers;
        [SerializeField] private Transform attackOrigin;
        [SerializeField] private GameObject hitEffectPrefab;
        
        private MimicController controller;
        private DamageCalculator damageCalculator;
        private Dictionary<string, ISkill> skills = new Dictionary<string, ISkill>();
        private Coroutine currentAttackCoroutine;
        
        public void Initialize(MimicController mimicController)
        {
            controller = mimicController;
            damageCalculator = new DamageCalculator(controller);
            RegisterSkills();
        }
        
        private void RegisterSkills()
        {
            skills["Bite"] = new BiteSkill(this, controller);
            skills["TongueWhip"] = new TongueWhipSkill(this, controller);
            skills["Jump"] = new JumpAttackSkill(this, controller);
            skills["GoldSpray"] = new GoldSpraySkill(this, controller);
            skills["TrapSet"] = new TrapSetSkill(this, controller);
            skills["WoodBoomerang"] = new WoodBoomerangSkill(this, controller);
            skills["RageCombo"] = new RageComboSkill(this, controller);
            skills["GoldBarrage"] = new GoldBarrageSkill(this, controller);
        }
        
        public void ExecuteAttack(string attackName)
        {
            if (skills.ContainsKey(attackName))
            {
                if (currentAttackCoroutine != null)
                    StopCoroutine(currentAttackCoroutine);
                
                currentAttackCoroutine = StartCoroutine(ExecuteSkillCoroutine(attackName));
            }
            else
            {
                Debug.LogWarning($"Attack {attackName} not found");
            }
        }
        
        private IEnumerator ExecuteSkillCoroutine(string attackName)
        {
            var skill = skills[attackName];
            var attackData = controller.Data.GetAttackByName(attackName);
            
            if (attackData != null && controller.CanUseSkill(attackName))
            {
                controller.UseSkill(attackName, attackData.cooldown);
                
                yield return StartCoroutine(skill.Execute());
                
                currentAttackCoroutine = null;
            }
        }
        
        public void CreateHitbox(Vector3 position, Vector3 size, AttackData.HitboxType type, float damage)
        {
            Collider[] hits = null;
            
            switch (type)
            {
                case AttackData.HitboxType.Circle:
                    hits = Physics.OverlapSphere(position, size.x, targetLayers);
                    break;
                    
                case AttackData.HitboxType.Rectangle:
                    hits = Physics.OverlapBox(position, size / 2f, transform.rotation, targetLayers);
                    break;
                    
                case AttackData.HitboxType.Cone:
                    hits = GetConeHits(position, transform.forward, size.x, size.y);
                    break;
            }
            
            if (hits != null)
            {
                foreach (var hit in hits)
                {
                    ApplyDamage(hit.gameObject, damage);
                }
            }
        }
        
        private Collider[] GetConeHits(Vector3 origin, Vector3 direction, float range, float angle)
        {
            List<Collider> validHits = new List<Collider>();
            Collider[] allHits = Physics.OverlapSphere(origin, range, targetLayers);
            
            foreach (var hit in allHits)
            {
                Vector3 dirToTarget = (hit.transform.position - origin).normalized;
                float angleToTarget = Vector3.Angle(direction, dirToTarget);
                
                if (angleToTarget <= angle / 2f)
                {
                    validHits.Add(hit);
                }
            }
            
            return validHits.ToArray();
        }
        
        public void ApplyDamage(GameObject target, float baseDamage)
        {
            var damageable = target.GetComponent<IDamageable>();
            if (damageable != null)
            {
                float finalDamage = damageCalculator.CalculateDamage(baseDamage);
                damageable.TakeDamage(finalDamage);
                
                if (hitEffectPrefab != null)
                {
                    Instantiate(hitEffectPrefab, target.transform.position, Quaternion.identity);
                }
            }
        }
        
        public void ApplyStatusEffect(GameObject target, StatusEffectData effectData)
        {
            var statusEffectable = target.GetComponent<IStatusEffect>();
            if (statusEffectable != null)
            {
                switch (effectData.type)
                {
                    case StatusEffectData.StatusEffectType.Slow:
                        statusEffectable.ApplySlow(effectData.value, effectData.duration);
                        break;
                        
                    case StatusEffectData.StatusEffectType.Stun:
                        statusEffectable.ApplyStun(effectData.duration);
                        break;
                }
            }
        }
        
        public GameObject SpawnProjectile(GameObject projectilePrefab, Vector3 position, Vector3 direction, float speed)
        {
            if (projectilePrefab == null) return null;
            
            GameObject projectile = Instantiate(projectilePrefab, position, Quaternion.LookRotation(direction));
            var rb = projectile.GetComponent<Rigidbody>();
            
            if (rb != null)
            {
                rb.velocity = direction * speed;
            }
            
            return projectile;
        }
        
        public void CreateShockwave(Vector3 center, float radius, float force, float damage)
        {
            Collider[] hits = Physics.OverlapSphere(center, radius, targetLayers);
            
            foreach (var hit in hits)
            {
                var rb = hit.GetComponent<Rigidbody>();
                if (rb != null)
                {
                    Vector3 direction = (hit.transform.position - center).normalized;
                    rb.AddForce(direction * force + Vector3.up * force * 0.5f, ForceMode.Impulse);
                }
                
                ApplyDamage(hit.gameObject, damage);
            }
        }
        
        private void OnDrawGizmosSelected()
        {
            if (attackOrigin != null)
            {
                Gizmos.color = Color.red;
                Gizmos.DrawWireSphere(attackOrigin.position, 2f);
            }
        }
    }
}