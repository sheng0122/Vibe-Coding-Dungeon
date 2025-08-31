using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace MimicBoss.Combat
{
    public interface ISkill
    {
        IEnumerator Execute();
    }
    
    public abstract class BaseSkill : ISkill
    {
        protected AttackSystem attackSystem;
        protected MimicController controller;
        protected AttackData attackData;
        
        public BaseSkill(AttackSystem system, MimicController controller)
        {
            this.attackSystem = system;
            this.controller = controller;
        }
        
        public abstract IEnumerator Execute();
        
        protected void PlayAnimation(string animationName)
        {
            controller.Animator?.Play(animationName);
        }
        
        protected void PlaySound(AudioClip clip)
        {
            if (clip != null)
            {
                AudioSource.PlayClipAtPoint(clip, controller.transform.position);
            }
        }
        
        protected void SpawnEffect(GameObject effectPrefab, Vector3 position)
        {
            if (effectPrefab != null)
            {
                GameObject effect = GameObject.Instantiate(effectPrefab, position, Quaternion.identity);
                GameObject.Destroy(effect, 3f);
            }
        }
    }
    
    public class BiteSkill : BaseSkill
    {
        public BiteSkill(AttackSystem system, MimicController controller) : base(system, controller) 
        {
            attackData = controller.Data.GetAttackByName("Bite");
        }
        
        public override IEnumerator Execute()
        {
            PlayAnimation("Attack_Bite");
            
            yield return new WaitForSeconds(0.3f);
            
            Vector3 hitboxPos = controller.transform.position + controller.transform.forward * 1.5f;
            attackSystem.CreateHitbox(hitboxPos, Vector3.one * 2f, AttackData.HitboxType.Circle, attackData.damage);
            
            PlaySound(attackData.soundEffect);
            SpawnEffect(attackData.effectPrefab, hitboxPos);
            
            yield return new WaitForSeconds(0.5f);
        }
    }
    
    public class TongueWhipSkill : BaseSkill
    {
        public TongueWhipSkill(AttackSystem system, MimicController controller) : base(system, controller) 
        {
            attackData = controller.Data.GetAttackByName("TongueWhip");
        }
        
        public override IEnumerator Execute()
        {
            PlayAnimation("Attack_Tongue_Whip");
            
            yield return new WaitForSeconds(0.4f);
            
            Vector3 hitboxPos = controller.transform.position + controller.transform.forward * 3f;
            Vector3 hitboxSize = new Vector3(5f, 120f, 0f);
            attackSystem.CreateHitbox(hitboxPos, hitboxSize, AttackData.HitboxType.Cone, attackData.damage);
            
            Collider[] hits = Physics.OverlapSphere(hitboxPos, 5f);
            foreach (var hit in hits)
            {
                if (hit.CompareTag("Player"))
                {
                    attackSystem.ApplyStatusEffect(hit.gameObject, attackData.statusEffect);
                }
            }
            
            PlaySound(attackData.soundEffect);
            SpawnEffect(attackData.effectPrefab, hitboxPos);
            
            yield return new WaitForSeconds(0.4f);
        }
    }
    
    public class JumpAttackSkill : BaseSkill
    {
        public JumpAttackSkill(AttackSystem system, MimicController controller) : base(system, controller) 
        {
            attackData = controller.Data.GetAttackByName("Jump");
        }
        
        public override IEnumerator Execute()
        {
            PlayAnimation("Attack_Jump");
            
            Vector3 targetPos = controller.PlayerTarget.position;
            
            yield return new WaitForSeconds(0.2f);
            
            float jumpTime = 0.8f;
            float elapsed = 0f;
            Vector3 startPos = controller.transform.position;
            float jumpHeight = 4f;
            
            while (elapsed < jumpTime)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / jumpTime;
                
                Vector3 currentPos = Vector3.Lerp(startPos, targetPos, t);
                currentPos.y = startPos.y + Mathf.Sin(t * Mathf.PI) * jumpHeight;
                
                controller.transform.position = currentPos;
                yield return null;
            }
            
            controller.transform.position = targetPos;
            
            attackSystem.CreateShockwave(controller.transform.position, 3f, 10f, attackData.damage);
            
            CameraShaker.Instance?.Shake(0.5f, 0.3f);
            
            PlaySound(attackData.soundEffect);
            SpawnEffect(attackData.effectPrefab, controller.transform.position);
            
            yield return new WaitForSeconds(0.3f);
        }
    }
    
    public class GoldSpraySkill : BaseSkill
    {
        public GoldSpraySkill(AttackSystem system, MimicController controller) : base(system, controller) 
        {
            attackData = controller.Data.GetAttackByName("GoldSpray");
        }
        
        public override IEnumerator Execute()
        {
            PlayAnimation("Attack_Gold_Spray");
            
            yield return new WaitForSeconds(0.3f);
            
            GameObject coinPrefab = Resources.Load<GameObject>("Prefabs/GoldCoinProjectile");
            
            int coinCount = 10;
            float spreadAngle = 60f;
            
            for (int i = 0; i < coinCount; i++)
            {
                float angle = -spreadAngle / 2f + (spreadAngle / coinCount) * i;
                Vector3 direction = Quaternion.Euler(0, angle, 0) * controller.transform.forward;
                
                Vector3 spawnPos = controller.transform.position + Vector3.up + direction * 0.5f;
                GameObject coin = attackSystem.SpawnProjectile(coinPrefab, spawnPos, direction, 15f);
                
                if (coin != null)
                {
                    var projectile = coin.AddComponent<GoldCoinProjectile>();
                    projectile.Initialize(attackData.damage, controller);
                }
                
                yield return new WaitForSeconds(0.05f);
            }
            
            PlaySound(attackData.soundEffect);
            
            yield return new WaitForSeconds(0.5f);
        }
    }
    
    public class TrapSetSkill : BaseSkill
    {
        public TrapSetSkill(AttackSystem system, MimicController controller) : base(system, controller) 
        {
            attackData = controller.Data.GetAttackByName("TrapSet");
        }
        
        public override IEnumerator Execute()
        {
            PlayAnimation("Attack_Trap_Set");
            
            yield return new WaitForSeconds(0.3f);
            
            GameObject trapPrefab = Resources.Load<GameObject>("Prefabs/GoldCoinTrap");
            
            for (int i = 0; i < 3; i++)
            {
                Vector3 randomOffset = Random.insideUnitSphere * 3f;
                randomOffset.y = 0;
                Vector3 trapPos = controller.PlayerTarget.position + randomOffset;
                
                GameObject trap = GameObject.Instantiate(trapPrefab, trapPos, Quaternion.identity);
                var trapComponent = trap.AddComponent<GoldCoinTrap>();
                trapComponent.Initialize(attackData.damage, 2f);
            }
            
            PlaySound(attackData.soundEffect);
            
            yield return new WaitForSeconds(0.5f);
        }
    }
    
    public class WoodBoomerangSkill : BaseSkill
    {
        public WoodBoomerangSkill(AttackSystem system, MimicController controller) : base(system, controller) 
        {
            attackData = controller.Data.GetAttackByName("WoodBoomerang");
        }
        
        public override IEnumerator Execute()
        {
            PlayAnimation("Attack_Boomerang");
            
            yield return new WaitForSeconds(0.2f);
            
            GameObject boomerangPrefab = Resources.Load<GameObject>("Prefabs/WoodBoomerang");
            Vector3 spawnPos = controller.transform.position + Vector3.up;
            Vector3 direction = controller.GetDirectionToPlayer();
            
            GameObject boomerang = attackSystem.SpawnProjectile(boomerangPrefab, spawnPos, direction, 12f);
            
            if (boomerang != null)
            {
                var projectile = boomerang.AddComponent<BoomerangProjectile>();
                projectile.Initialize(attackData.damage, controller.transform, 8f);
            }
            
            PlaySound(attackData.soundEffect);
            
            yield return new WaitForSeconds(1f);
        }
    }
    
    public class RageComboSkill : BaseSkill
    {
        public RageComboSkill(AttackSystem system, MimicController controller) : base(system, controller) 
        {
            attackData = controller.Data.GetAttackByName("RageCombo");
        }
        
        public override IEnumerator Execute()
        {
            PlayAnimation("Attack_Rage_Combo");
            
            for (int i = 0; i < 3; i++)
            {
                yield return new WaitForSeconds(0.2f);
                
                Vector3 hitboxPos = controller.transform.position + controller.transform.forward * (1.5f + i * 0.5f);
                attackSystem.CreateHitbox(hitboxPos, Vector3.one * (2f + i * 0.5f), AttackData.HitboxType.Circle, attackData.damage);
                
                PlaySound(attackData.soundEffect);
                SpawnEffect(attackData.effectPrefab, hitboxPos);
            }
            
            yield return new WaitForSeconds(0.3f);
        }
    }
    
    public class GoldBarrageSkill : BaseSkill
    {
        public GoldBarrageSkill(AttackSystem system, MimicController controller) : base(system, controller) 
        {
            attackData = controller.Data.GetAttackByName("GoldBarrage");
        }
        
        public override IEnumerator Execute()
        {
            PlayAnimation("Attack_Gold_Barrage");
            
            yield return new WaitForSeconds(0.3f);
            
            GameObject coinPrefab = Resources.Load<GameObject>("Prefabs/GoldCoinProjectile");
            
            for (int wave = 0; wave < 3; wave++)
            {
                for (int i = 0; i < 8; i++)
                {
                    float angle = (360f / 8f) * i;
                    Vector3 direction = Quaternion.Euler(0, angle, 0) * Vector3.forward;
                    
                    Vector3 spawnPos = controller.transform.position + Vector3.up + direction * 0.5f;
                    GameObject coin = attackSystem.SpawnProjectile(coinPrefab, spawnPos, direction, 20f);
                    
                    if (coin != null)
                    {
                        var projectile = coin.AddComponent<GoldCoinProjectile>();
                        projectile.Initialize(attackData.damage * 0.5f, controller);
                    }
                }
                
                PlaySound(attackData.soundEffect);
                yield return new WaitForSeconds(0.3f);
            }
            
            yield return new WaitForSeconds(0.5f);
        }
    }
}