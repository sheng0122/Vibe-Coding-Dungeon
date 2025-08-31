using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace MimicBoss.AI
{
    public class MimicAI : MonoBehaviour
    {
        [Header("AI Settings")]
        [SerializeField] private float decisionInterval = 0.5f;
        [SerializeField] private float attackDecisionDelay = 0.3f;
        
        private MimicController controller;
        private BehaviorTree behaviorTree;
        private DecisionMaker decisionMaker;
        private float lastDecisionTime;
        
        public void Initialize(MimicController mimicController)
        {
            controller = mimicController;
            behaviorTree = new BehaviorTree();
            decisionMaker = new DecisionMaker(controller);
            
            BuildBehaviorTree();
        }
        
        private void Update()
        {
            if (!controller.IsAwakened) return;
            
            if (Time.time - lastDecisionTime >= decisionInterval)
            {
                lastDecisionTime = Time.time;
                behaviorTree.Execute();
            }
        }
        
        private void BuildBehaviorTree()
        {
            behaviorTree.Root = new Selector(
                new Sequence(
                    new ConditionNode(() => controller.CurrentHealth <= 0),
                    new ActionNode(() => { return NodeState.Success; })
                ),
                
                new Sequence(
                    new ConditionNode(() => controller.StateMachine.CurrentState == MimicState.PhaseTransition),
                    new ActionNode(() => { return NodeState.Success; })
                ),
                
                new Selector(
                    new Sequence(
                        new ConditionNode(() => IsPlayerInAttackRange()),
                        new Selector(
                            new Sequence(
                                new ConditionNode(() => IsCloseRange()),
                                new ActionNode(() => ExecuteMeleeAttack())
                            ),
                            new Sequence(
                                new ConditionNode(() => IsMidRange()),
                                new ActionNode(() => ExecuteRangedAttack())
                            )
                        )
                    ),
                    
                    new Sequence(
                        new ConditionNode(() => IsPlayerInChaseRange()),
                        new ActionNode(() => ChasePlayer())
                    ),
                    
                    new ActionNode(() => PatrolBehavior())
                )
            );
        }
        
        private bool IsPlayerInAttackRange()
        {
            float distance = controller.GetDistanceToPlayer();
            return distance <= controller.Data.attackRange;
        }
        
        private bool IsPlayerInChaseRange()
        {
            float distance = controller.GetDistanceToPlayer();
            return distance <= controller.Data.chaseRange;
        }
        
        private bool IsCloseRange()
        {
            float distance = controller.GetDistanceToPlayer();
            return distance < 3f;
        }
        
        private bool IsMidRange()
        {
            float distance = controller.GetDistanceToPlayer();
            return distance >= 3f && distance <= 5f;
        }
        
        private NodeState ExecuteMeleeAttack()
        {
            if (controller.StateMachine.CurrentState != MimicState.Idle &&
                controller.StateMachine.CurrentState != MimicState.Moving)
                return NodeState.Failure;
            
            string attack = decisionMaker.SelectMeleeAttack();
            if (controller.CanUseSkill(attack))
            {
                controller.StateMachine.ChangeState(MimicState.Attacking);
                StartCoroutine(PerformAttack(attack));
                return NodeState.Success;
            }
            
            return NodeState.Running;
        }
        
        private NodeState ExecuteRangedAttack()
        {
            if (controller.StateMachine.CurrentState != MimicState.Idle &&
                controller.StateMachine.CurrentState != MimicState.Moving)
                return NodeState.Failure;
            
            string attack = decisionMaker.SelectRangedAttack();
            if (controller.CanUseSkill(attack))
            {
                controller.StateMachine.ChangeState(MimicState.Attacking);
                StartCoroutine(PerformAttack(attack));
                return NodeState.Success;
            }
            
            return NodeState.Running;
        }
        
        private NodeState ChasePlayer()
        {
            if (controller.StateMachine.CurrentState == MimicState.Attacking ||
                controller.StateMachine.CurrentState == MimicState.Hit)
                return NodeState.Failure;
            
            controller.StateMachine.ChangeState(MimicState.Moving);
            return NodeState.Success;
        }
        
        private NodeState PatrolBehavior()
        {
            if (controller.StateMachine.CurrentState != MimicState.Idle)
                controller.StateMachine.ChangeState(MimicState.Idle);
            
            return NodeState.Success;
        }
        
        private IEnumerator PerformAttack(string attackName)
        {
            yield return new WaitForSeconds(attackDecisionDelay);
            
            var attackData = controller.Data.GetAttackByName(attackName);
            if (attackData != null)
            {
                controller.UseSkill(attackName, attackData.cooldown);
                controller.Animator?.Play(attackData.animationName);
                
                yield return new WaitForSeconds(attackData.animationDuration);
                
                if (controller.StateMachine.CurrentState == MimicState.Attacking)
                    controller.StateMachine.ChangeState(MimicState.Idle);
            }
        }
    }
}