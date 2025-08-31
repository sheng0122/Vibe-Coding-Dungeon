using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace MimicBoss.Animation
{
    [RequireComponent(typeof(Animator))]
    public class AnimationController : MonoBehaviour
    {
        [Header("Animation Configuration")]
        [SerializeField] private Animator animator;
        [SerializeField] private float crossfadeTime = 0.1f;
        
        [Header("Animation Events")]
        public UnityEvent OnAttackHit;
        public UnityEvent OnStepFootstep;
        public UnityEvent OnLandImpact;
        public UnityEvent OnTransformComplete;
        
        private Dictionary<string, int> animationHashes;
        private string currentAnimation;
        private Coroutine blendCoroutine;
        
        private void Awake()
        {
            if (animator == null)
                animator = GetComponent<Animator>();
            
            InitializeAnimationHashes();
        }
        
        private void InitializeAnimationHashes()
        {
            animationHashes = new Dictionary<string, int>
            {
                ["Idle_Disguise"] = Animator.StringToHash("Idle_Disguise"),
                ["Idle_Combat"] = Animator.StringToHash("Idle_Combat"),
                ["Idle_Damaged"] = Animator.StringToHash("Idle_Damaged"),
                ["Transform_Awaken"] = Animator.StringToHash("Transform_Awaken"),
                ["Transform_Phase2"] = Animator.StringToHash("Transform_Phase2"),
                ["Transform_Rage"] = Animator.StringToHash("Transform_Rage"),
                ["Attack_Bite"] = Animator.StringToHash("Attack_Bite"),
                ["Attack_Tongue_Whip"] = Animator.StringToHash("Attack_Tongue_Whip"),
                ["Attack_Jump"] = Animator.StringToHash("Attack_Jump"),
                ["Attack_Gold_Spray"] = Animator.StringToHash("Attack_Gold_Spray"),
                ["Attack_Trap_Set"] = Animator.StringToHash("Attack_Trap_Set"),
                ["Attack_Boomerang"] = Animator.StringToHash("Attack_Boomerang"),
                ["Attack_Rage_Combo"] = Animator.StringToHash("Attack_Rage_Combo"),
                ["Attack_Gold_Barrage"] = Animator.StringToHash("Attack_Gold_Barrage"),
                ["Move_Jump"] = Animator.StringToHash("Move_Jump"),
                ["Move_Chase"] = Animator.StringToHash("Move_Chase"),
                ["Hit_Light"] = Animator.StringToHash("Hit_Light"),
                ["Hit_Heavy"] = Animator.StringToHash("Hit_Heavy"),
                ["Death_Explode"] = Animator.StringToHash("Death_Explode")
            };
        }
        
        public void PlayAnimation(string animationName, float fadeTime = -1f)
        {
            if (fadeTime < 0)
                fadeTime = crossfadeTime;
            
            if (animationHashes.TryGetValue(animationName, out int hash))
            {
                animator.CrossFade(hash, fadeTime);
                currentAnimation = animationName;
            }
            else
            {
                Debug.LogWarning($"Animation {animationName} not found in hash table");
            }
        }
        
        public void PlayAnimationImmediate(string animationName)
        {
            if (animationHashes.TryGetValue(animationName, out int hash))
            {
                animator.Play(hash);
                currentAnimation = animationName;
            }
        }
        
        public void SetAnimationSpeed(float speed)
        {
            animator.speed = speed;
        }
        
        public void SetBool(string parameter, bool value)
        {
            animator.SetBool(parameter, value);
        }
        
        public void SetFloat(string parameter, float value)
        {
            animator.SetFloat(parameter, value);
        }
        
        public void SetInteger(string parameter, int value)
        {
            animator.SetInteger(parameter, value);
        }
        
        public void SetTrigger(string parameter)
        {
            animator.SetTrigger(parameter);
        }
        
        public float GetCurrentAnimationLength()
        {
            AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(0);
            return stateInfo.length;
        }
        
        public float GetCurrentAnimationTime()
        {
            AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(0);
            return stateInfo.normalizedTime;
        }
        
        public bool IsAnimationComplete(float threshold = 0.95f)
        {
            AnimatorStateInfo stateInfo = animator.GetCurrentAnimatorStateInfo(0);
            return stateInfo.normalizedTime >= threshold;
        }
        
        public void BlendToAnimation(string animationName, float blendTime)
        {
            if (blendCoroutine != null)
                StopCoroutine(blendCoroutine);
            
            blendCoroutine = StartCoroutine(BlendCoroutine(animationName, blendTime));
        }
        
        private IEnumerator BlendCoroutine(string targetAnimation, float duration)
        {
            float elapsed = 0f;
            
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                
                if (animationHashes.TryGetValue(targetAnimation, out int hash))
                {
                    animator.CrossFade(hash, duration - elapsed);
                }
                
                yield return null;
            }
            
            currentAnimation = targetAnimation;
            blendCoroutine = null;
        }
        
        public void OnAnimationEvent(string eventName)
        {
            switch (eventName)
            {
                case "AttackHit":
                    OnAttackHit?.Invoke();
                    break;
                case "Footstep":
                    OnStepFootstep?.Invoke();
                    break;
                case "LandImpact":
                    OnLandImpact?.Invoke();
                    break;
                case "TransformComplete":
                    OnTransformComplete?.Invoke();
                    break;
            }
        }
        
        public void AttackHitEvent()
        {
            OnAttackHit?.Invoke();
        }
        
        public void FootstepEvent()
        {
            OnStepFootstep?.Invoke();
        }
        
        public void LandImpactEvent()
        {
            OnLandImpact?.Invoke();
        }
        
        public void TransformCompleteEvent()
        {
            OnTransformComplete?.Invoke();
        }
    }
}