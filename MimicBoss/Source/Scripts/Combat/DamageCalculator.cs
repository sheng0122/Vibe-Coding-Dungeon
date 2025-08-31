using UnityEngine;

namespace MimicBoss.Combat
{
    public class DamageCalculator
    {
        private MimicController controller;
        
        public DamageCalculator(MimicController controller)
        {
            this.controller = controller;
        }
        
        public float CalculateDamage(float baseDamage)
        {
            float finalDamage = baseDamage;
            
            PhaseData phaseData = controller.Data.GetPhaseData(controller.CurrentPhase);
            if (phaseData != null)
            {
                finalDamage *= phaseData.damageMultiplier;
            }
            
            if (controller.CurrentPhase == 3)
            {
                float healthPercent = controller.CurrentHealth / controller.Data.maxHealth;
                if (healthPercent < 0.1f)
                {
                    finalDamage *= 2f;
                }
            }
            
            finalDamage += Random.Range(-baseDamage * 0.1f, baseDamage * 0.1f);
            
            return Mathf.Round(finalDamage);
        }
        
        public float CalculateCriticalDamage(float baseDamage, float critChance = 0.2f, float critMultiplier = 2f)
        {
            float damage = CalculateDamage(baseDamage);
            
            if (Random.value < critChance)
            {
                damage *= critMultiplier;
                Debug.Log("Critical Hit!");
            }
            
            return damage;
        }
        
        public float CalculateDefense(float incomingDamage)
        {
            float defense = controller.Data.defense;
            
            PhaseData phaseData = controller.Data.GetPhaseData(controller.CurrentPhase);
            if (phaseData != null && controller.CurrentPhase == 1)
            {
                defense *= 1.2f;
            }
            
            float damageReduction = defense / (defense + 100f);
            float finalDamage = incomingDamage * (1f - damageReduction);
            
            return Mathf.Max(finalDamage, 1f);
        }
        
        public bool CalculateDodge(float dodgeChance = 0.1f)
        {
            if (controller.CurrentPhase >= 2)
            {
                dodgeChance += 0.05f * controller.CurrentPhase;
            }
            
            return Random.value < dodgeChance;
        }
        
        public float CalculateKnockback(float baseKnockback)
        {
            return baseKnockback * (1f + controller.CurrentPhase * 0.2f);
        }
        
        public float CalculateStatusEffectDuration(float baseDuration)
        {
            if (controller.CurrentPhase >= 2)
            {
                return baseDuration * 1.5f;
            }
            return baseDuration;
        }
        
        public float CalculateAttackSpeed(float baseSpeed)
        {
            PhaseData phaseData = controller.Data.GetPhaseData(controller.CurrentPhase);
            if (phaseData != null)
            {
                return baseSpeed * phaseData.attackSpeedMultiplier;
            }
            return baseSpeed;
        }
    }
}