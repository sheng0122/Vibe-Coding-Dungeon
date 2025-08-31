using System;
using System.Collections.Generic;
using UnityEngine;

namespace MimicBoss.Core
{
    [CreateAssetMenu(fileName = "MimicBossData", menuName = "MimicBoss/Boss Data")]
    public class MimicData : ScriptableObject
    {
        [Header("Base Stats")]
        public float maxHealth = 500f;
        public float defense = 20f;
        public float moveSpeed = 3.5f;
        public float attackRange = 2f;
        public float detectionRange = 5f;
        public float chaseRange = 8f;
        
        [Header("Phase Multipliers")]
        public PhaseData[] phases;
        
        [Header("Attack Configurations")]
        public AttackData[] attacks;
        
        [Header("Rewards")]
        public RewardData rewards;
        
        public AttackData GetAttackByName(string name)
        {
            foreach (var attack in attacks)
            {
                if (attack.attackName == name)
                    return attack;
            }
            return null;
        }
        
        public PhaseData GetPhaseData(int phase)
        {
            if (phase > 0 && phase <= phases.Length)
                return phases[phase - 1];
            return phases[0];
        }
    }
    
    [Serializable]
    public class PhaseData
    {
        public string phaseName = "Phase 1";
        public float healthRangeMin = 0.6f;
        public float healthRangeMax = 1.0f;
        public float attackSpeedMultiplier = 1.0f;
        public float damageMultiplier = 1.0f;
        public float moveSpeedMultiplier = 1.0f;
        public string[] availableAttacks;
        public bool hasRageMode = false;
        public bool dropsGoldContinuously = false;
    }
    
    [Serializable]
    public class AttackData
    {
        [Header("Basic Info")]
        public string attackName = "Bite";
        public float damage = 30f;
        public float range = 2f;
        public float cooldown = 2f;
        public float castTime = 0.5f;
        
        [Header("Animation")]
        public string animationName = "Attack_Bite";
        public float animationDuration = 1f;
        public int frameCount = 15;
        
        [Header("Hitbox")]
        public HitboxType hitboxType = HitboxType.Circle;
        public Vector3 hitboxSize = Vector3.one;
        public float hitboxAngle = 90f;
        public Vector3 hitboxOffset = Vector3.zero;
        
        [Header("Effects")]
        public GameObject effectPrefab;
        public AudioClip soundEffect;
        public StatusEffectData statusEffect;
        
        [Header("Special Properties")]
        public bool isRanged = false;
        public bool isAOE = false;
        public bool piercing = false;
        public int projectileCount = 1;
        public float projectileSpeed = 10f;
        
        public enum HitboxType
        {
            Circle,
            Rectangle,
            Cone,
            Line
        }
    }
    
    [Serializable]
    public class StatusEffectData
    {
        public StatusEffectType type = StatusEffectType.None;
        public float value = 0f;
        public float duration = 0f;
        
        public enum StatusEffectType
        {
            None,
            Slow,
            Stun,
            Poison,
            Burn,
            Freeze
        }
    }
    
    [Serializable]
    public class RewardData
    {
        [Header("Gold Rewards")]
        public int minGold = 100;
        public int maxGold = 200;
        public int perfectKillBonus = 100;
        public int speedKillBonus = 50;
        
        [Header("Item Drops")]
        public float rareItemChance = 0.3f;
        public float epicItemChance = 0.1f;
        public string[] possibleDrops;
        
        [Header("Experience")]
        public int baseExperience = 100;
        public float experienceMultiplier = 1f;
    }
}