using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace MimicBoss.AI
{
    public class DecisionMaker
    {
        private MimicController controller;
        private System.Random random = new System.Random();
        
        private Dictionary<string, float> meleeAttackWeights = new Dictionary<string, float>
        {
            ["Bite"] = 0.4f,
            ["TongueWhip"] = 0.35f,
            ["Jump"] = 0.25f
        };
        
        private Dictionary<string, float> rangedAttackWeights = new Dictionary<string, float>
        {
            ["GoldSpray"] = 0.4f,
            ["TrapSet"] = 0.3f,
            ["WoodBoomerang"] = 0.3f
        };
        
        private Dictionary<string, float> phase3AttackWeights = new Dictionary<string, float>
        {
            ["RageCombo"] = 0.3f,
            ["GoldBarrage"] = 0.3f,
            ["UltimateSlam"] = 0.2f,
            ["TongueGrab"] = 0.2f
        };
        
        public DecisionMaker(MimicController controller)
        {
            this.controller = controller;
        }
        
        public string SelectMeleeAttack()
        {
            var availableAttacks = GetAvailableAttacks(meleeAttackWeights);
            return SelectWeightedRandom(availableAttacks);
        }
        
        public string SelectRangedAttack()
        {
            var availableAttacks = GetAvailableAttacks(rangedAttackWeights);
            return SelectWeightedRandom(availableAttacks);
        }
        
        public string SelectPhaseAttack()
        {
            int phase = controller.CurrentPhase;
            
            switch (phase)
            {
                case 3:
                    var rageAttacks = GetAvailableAttacks(phase3AttackWeights);
                    if (rageAttacks.Count > 0)
                        return SelectWeightedRandom(rageAttacks);
                    break;
                    
                case 2:
                    if (Random.value > 0.3f)
                    {
                        var specialAttacks = new Dictionary<string, float>
                        {
                            ["GoldSpray"] = 0.5f,
                            ["TrapSet"] = 0.5f
                        };
                        return SelectWeightedRandom(GetAvailableAttacks(specialAttacks));
                    }
                    break;
            }
            
            return Random.value > 0.5f ? SelectMeleeAttack() : SelectRangedAttack();
        }
        
        public AttackPattern GenerateAttackPattern()
        {
            var pattern = new AttackPattern();
            int phase = controller.CurrentPhase;
            float healthPercent = controller.CurrentHealth / controller.Data.maxHealth;
            
            if (phase == 3 && healthPercent < 0.1f)
            {
                pattern.attacks.Add("UltimateSlam");
                pattern.attacks.Add("GoldBarrage");
                pattern.attacks.Add("RageCombo");
                pattern.isUltimatePattern = true;
            }
            else if (phase >= 2)
            {
                int patternLength = Random.Range(2, 4);
                for (int i = 0; i < patternLength; i++)
                {
                    pattern.attacks.Add(SelectPhaseAttack());
                }
            }
            else
            {
                pattern.attacks.Add(SelectMeleeAttack());
                if (Random.value > 0.5f)
                    pattern.attacks.Add(SelectRangedAttack());
            }
            
            return pattern;
        }
        
        public Vector3 PredictPlayerPosition(float predictionTime)
        {
            if (controller.PlayerTarget == null)
                return controller.transform.position;
            
            var playerRb = controller.PlayerTarget.GetComponent<Rigidbody>();
            if (playerRb != null)
            {
                return controller.PlayerTarget.position + playerRb.velocity * predictionTime;
            }
            
            return controller.PlayerTarget.position;
        }
        
        public Vector3 SelectJumpPosition()
        {
            if (controller.PlayerTarget == null)
                return controller.transform.position;
            
            Vector3 playerPos = PredictPlayerPosition(0.5f);
            float jumpDistance = 3f + Random.Range(-1f, 1f);
            
            Vector3 direction = (playerPos - controller.transform.position).normalized;
            Vector3 jumpTarget = controller.transform.position + direction * jumpDistance;
            
            if (Physics.Raycast(jumpTarget + Vector3.up * 5f, Vector3.down, out RaycastHit hit, 10f))
            {
                jumpTarget = hit.point;
            }
            
            return jumpTarget;
        }
        
        public bool ShouldDodge()
        {
            float dodgeChance = 0.2f * controller.CurrentPhase;
            return Random.value < dodgeChance;
        }
        
        public bool ShouldUseSpecialAbility()
        {
            if (controller.CurrentPhase < 2)
                return false;
            
            float specialChance = 0.3f + (0.1f * controller.CurrentPhase);
            return Random.value < specialChance;
        }
        
        private Dictionary<string, float> GetAvailableAttacks(Dictionary<string, float> attackWeights)
        {
            var available = new Dictionary<string, float>();
            
            foreach (var kvp in attackWeights)
            {
                if (controller.CanUseSkill(kvp.Key))
                {
                    available[kvp.Key] = kvp.Value;
                }
            }
            
            return available;
        }
        
        private string SelectWeightedRandom(Dictionary<string, float> weights)
        {
            if (weights.Count == 0)
                return "Bite";
            
            float totalWeight = weights.Sum(x => x.Value);
            float randomValue = (float)(random.NextDouble() * totalWeight);
            float currentWeight = 0;
            
            foreach (var kvp in weights)
            {
                currentWeight += kvp.Value;
                if (randomValue <= currentWeight)
                    return kvp.Key;
            }
            
            return weights.Keys.First();
        }
        
        public class AttackPattern
        {
            public List<string> attacks = new List<string>();
            public bool isUltimatePattern = false;
            public float patternCooldown = 5f;
        }
    }
}