using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace MimicBoss.Core
{
    public enum MimicState
    {
        Disguised,
        Awakening,
        Idle,
        Moving,
        Attacking,
        Hit,
        PhaseTransition,
        Dying,
        Dead
    }
    
    public class MimicStateMachine : MonoBehaviour
    {
        private Dictionary<MimicState, IState> states = new Dictionary<MimicState, IState>();
        private Dictionary<MimicState, List<MimicState>> validTransitions;
        private IState currentStateInstance;
        private MimicState currentState;
        private MimicController controller;
        
        public MimicState CurrentState => currentState;
        
        public void Initialize(MimicController mimicController)
        {
            controller = mimicController;
            InitializeStates();
            InitializeTransitions();
        }
        
        private void InitializeStates()
        {
            states[MimicState.Disguised] = new DisguisedState(controller);
            states[MimicState.Awakening] = new AwakeningState(controller);
            states[MimicState.Idle] = new IdleState(controller);
            states[MimicState.Moving] = new MovingState(controller);
            states[MimicState.Attacking] = new AttackingState(controller);
            states[MimicState.Hit] = new HitState(controller);
            states[MimicState.PhaseTransition] = new PhaseTransitionState(controller);
            states[MimicState.Dying] = new DyingState(controller);
            states[MimicState.Dead] = new DeadState(controller);
        }
        
        private void InitializeTransitions()
        {
            validTransitions = new Dictionary<MimicState, List<MimicState>>
            {
                [MimicState.Disguised] = new List<MimicState> { MimicState.Awakening },
                [MimicState.Awakening] = new List<MimicState> { MimicState.Idle },
                [MimicState.Idle] = new List<MimicState> { MimicState.Moving, MimicState.Attacking, MimicState.Hit, MimicState.PhaseTransition, MimicState.Dying },
                [MimicState.Moving] = new List<MimicState> { MimicState.Idle, MimicState.Attacking, MimicState.Hit },
                [MimicState.Attacking] = new List<MimicState> { MimicState.Idle, MimicState.Hit },
                [MimicState.Hit] = new List<MimicState> { MimicState.Idle, MimicState.Dying },
                [MimicState.PhaseTransition] = new List<MimicState> { MimicState.Idle },
                [MimicState.Dying] = new List<MimicState> { MimicState.Dead },
                [MimicState.Dead] = new List<MimicState>()
            };
        }
        
        public void ChangeState(MimicState newState)
        {
            if (!CanTransition(currentState, newState))
            {
                Debug.LogWarning($"Invalid state transition from {currentState} to {newState}");
                return;
            }
            
            currentStateInstance?.OnExit();
            currentState = newState;
            currentStateInstance = states[newState];
            currentStateInstance?.OnEnter();
        }
        
        private bool CanTransition(MimicState from, MimicState to)
        {
            if (!validTransitions.ContainsKey(from))
                return false;
            
            return validTransitions[from].Contains(to);
        }
        
        private void Update()
        {
            currentStateInstance?.OnUpdate();
        }
        
        private void FixedUpdate()
        {
            currentStateInstance?.OnFixedUpdate();
        }
    }
    
    public interface IState
    {
        void OnEnter();
        void OnUpdate();
        void OnFixedUpdate();
        void OnExit();
    }
    
    public abstract class BaseState : IState
    {
        protected MimicController controller;
        protected float stateTimer;
        
        public BaseState(MimicController controller)
        {
            this.controller = controller;
        }
        
        public virtual void OnEnter()
        {
            stateTimer = 0f;
        }
        
        public virtual void OnUpdate()
        {
            stateTimer += Time.deltaTime;
        }
        
        public virtual void OnFixedUpdate()
        {
        }
        
        public virtual void OnExit()
        {
        }
    }
    
    public class DisguisedState : BaseState
    {
        public DisguisedState(MimicController controller) : base(controller) { }
        
        public override void OnEnter()
        {
            base.OnEnter();
            controller.Animator?.Play("Idle_Disguise");
        }
        
        public override void OnUpdate()
        {
            base.OnUpdate();
        }
    }
    
    public class AwakeningState : BaseState
    {
        private float awakeningDuration = 2f;
        
        public AwakeningState(MimicController controller) : base(controller) { }
        
        public override void OnEnter()
        {
            base.OnEnter();
            controller.Animator?.Play("Transform_Awaken");
        }
        
        public override void OnUpdate()
        {
            base.OnUpdate();
            
            if (stateTimer >= awakeningDuration)
            {
                controller.StateMachine.ChangeState(MimicState.Idle);
            }
        }
    }
    
    public class IdleState : BaseState
    {
        private float decisionInterval = 1f;
        private float lastDecisionTime;
        
        public IdleState(MimicController controller) : base(controller) { }
        
        public override void OnEnter()
        {
            base.OnEnter();
            controller.Animator?.Play("Idle_Combat");
            lastDecisionTime = 0f;
        }
        
        public override void OnUpdate()
        {
            base.OnUpdate();
            
            if (Time.time - lastDecisionTime >= decisionInterval)
            {
                lastDecisionTime = Time.time;
                MakeDecision();
            }
        }
        
        private void MakeDecision()
        {
            float distance = controller.GetDistanceToPlayer();
            
            if (distance <= controller.Data.attackRange)
            {
                controller.StateMachine.ChangeState(MimicState.Attacking);
            }
            else if (distance <= controller.Data.chaseRange)
            {
                controller.StateMachine.ChangeState(MimicState.Moving);
            }
        }
    }
    
    public class MovingState : BaseState
    {
        public MovingState(MimicController controller) : base(controller) { }
        
        public override void OnEnter()
        {
            base.OnEnter();
            controller.Animator?.Play("Move_Chase");
        }
        
        public override void OnUpdate()
        {
            base.OnUpdate();
            
            Vector3 direction = controller.GetDirectionToPlayer();
            controller.Move(direction, controller.Data.moveSpeed);
            
            float distance = controller.GetDistanceToPlayer();
            if (distance <= controller.Data.attackRange)
            {
                controller.StateMachine.ChangeState(MimicState.Attacking);
            }
        }
    }
    
    public class AttackingState : BaseState
    {
        private bool isAttacking;
        private float attackDuration = 1.5f;
        
        public AttackingState(MimicController controller) : base(controller) { }
        
        public override void OnEnter()
        {
            base.OnEnter();
            isAttacking = true;
            PerformAttack();
        }
        
        public override void OnUpdate()
        {
            base.OnUpdate();
            
            if (stateTimer >= attackDuration)
            {
                controller.StateMachine.ChangeState(MimicState.Idle);
            }
        }
        
        private void PerformAttack()
        {
            float distance = controller.GetDistanceToPlayer();
            string attackType = SelectAttackType(distance);
            
            controller.Animator?.Play($"Attack_{attackType}");
        }
        
        private string SelectAttackType(float distance)
        {
            if (distance < 3f)
            {
                return Random.value > 0.5f ? "Bite" : "Tongue_Whip";
            }
            else if (distance < 5f)
            {
                return "Jump";
            }
            else
            {
                return "Gold_Spray";
            }
        }
    }
    
    public class HitState : BaseState
    {
        private float hitStunDuration = 0.5f;
        
        public HitState(MimicController controller) : base(controller) { }
        
        public override void OnEnter()
        {
            base.OnEnter();
            controller.Animator?.Play("Hit_Light");
        }
        
        public override void OnUpdate()
        {
            base.OnUpdate();
            
            if (stateTimer >= hitStunDuration)
            {
                controller.StateMachine.ChangeState(MimicState.Idle);
            }
        }
    }
    
    public class PhaseTransitionState : BaseState
    {
        private float transitionDuration = 1.5f;
        
        public PhaseTransitionState(MimicController controller) : base(controller) { }
        
        public override void OnEnter()
        {
            base.OnEnter();
            
            if (controller.CurrentPhase == 2)
                controller.Animator?.Play("Transform_Phase2");
            else if (controller.CurrentPhase == 3)
                controller.Animator?.Play("Transform_Rage");
        }
        
        public override void OnUpdate()
        {
            base.OnUpdate();
            
            if (stateTimer >= transitionDuration)
            {
                controller.StateMachine.ChangeState(MimicState.Idle);
            }
        }
    }
    
    public class DyingState : BaseState
    {
        public DyingState(MimicController controller) : base(controller) { }
        
        public override void OnEnter()
        {
            base.OnEnter();
            controller.Animator?.Play("Death_Explode");
        }
    }
    
    public class DeadState : BaseState
    {
        public DeadState(MimicController controller) : base(controller) { }
        
        public override void OnEnter()
        {
            base.OnEnter();
        }
    }
}