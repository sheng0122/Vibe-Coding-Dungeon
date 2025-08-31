using UnityEngine;
using System.Collections;

namespace MimicBoss.Optimization
{
    public class MimicLODController : MonoBehaviour
    {
        [Header("LOD Settings")]
        [SerializeField] private float[] lodDistances = { 10f, 25f, 50f, 100f };
        [SerializeField] private float updateInterval = 0.5f;
        
        [Header("LOD0 - Full Detail")]
        [SerializeField] private bool lod0_EnableAnimation = true;
        [SerializeField] private int lod0_MaxParticles = 100;
        [SerializeField] private bool lod0_EnableShadows = true;
        [SerializeField] private bool lod0_EnableVFX = true;
        
        [Header("LOD1 - Medium Detail")]
        [SerializeField] private bool lod1_EnableAnimation = true;
        [SerializeField] private int lod1_MaxParticles = 50;
        [SerializeField] private bool lod1_EnableShadows = true;
        [SerializeField] private bool lod1_EnableVFX = true;
        
        [Header("LOD2 - Low Detail")]
        [SerializeField] private bool lod2_EnableAnimation = false;
        [SerializeField] private int lod2_MaxParticles = 10;
        [SerializeField] private bool lod2_EnableShadows = false;
        [SerializeField] private bool lod2_EnableVFX = false;
        
        [Header("LOD3 - Minimal Detail")]
        [SerializeField] private bool lod3_EnableAnimation = false;
        [SerializeField] private int lod3_MaxParticles = 0;
        [SerializeField] private bool lod3_EnableShadows = false;
        [SerializeField] private bool lod3_EnableVFX = false;
        
        private Camera mainCamera;
        private Animator animator;
        private ParticleSystem[] particleSystems;
        private Renderer[] renderers;
        private Light[] lights;
        private int currentLOD = -1;
        private float lastUpdateTime;
        
        private void Start()
        {
            mainCamera = Camera.main;
            animator = GetComponent<Animator>();
            particleSystems = GetComponentsInChildren<ParticleSystem>();
            renderers = GetComponentsInChildren<Renderer>();
            lights = GetComponentsInChildren<Light>();
            
            StartCoroutine(LODUpdateRoutine());
        }
        
        private IEnumerator LODUpdateRoutine()
        {
            while (true)
            {
                UpdateLOD();
                yield return new WaitForSeconds(updateInterval);
            }
        }
        
        private void UpdateLOD()
        {
            if (mainCamera == null)
            {
                mainCamera = Camera.main;
                if (mainCamera == null) return;
            }
            
            float distance = Vector3.Distance(transform.position, mainCamera.transform.position);
            int newLOD = CalculateLOD(distance);
            
            if (newLOD != currentLOD)
            {
                ApplyLOD(newLOD);
                currentLOD = newLOD;
            }
        }
        
        private int CalculateLOD(float distance)
        {
            for (int i = 0; i < lodDistances.Length; i++)
            {
                if (distance < lodDistances[i])
                {
                    return i;
                }
            }
            
            return lodDistances.Length;
        }
        
        private void ApplyLOD(int level)
        {
            switch (level)
            {
                case 0:
                    ApplyLOD0();
                    break;
                case 1:
                    ApplyLOD1();
                    break;
                case 2:
                    ApplyLOD2();
                    break;
                case 3:
                    ApplyLOD3();
                    break;
                default:
                    DisableObject();
                    break;
            }
        }
        
        private void ApplyLOD0()
        {
            SetAnimatorEnabled(lod0_EnableAnimation);
            SetParticleMaxCount(lod0_MaxParticles);
            SetShadowsEnabled(lod0_EnableShadows);
            SetVFXEnabled(lod0_EnableVFX);
            SetUpdateRate(1f);
            SetRenderDistance(lodDistances[0]);
        }
        
        private void ApplyLOD1()
        {
            SetAnimatorEnabled(lod1_EnableAnimation);
            SetParticleMaxCount(lod1_MaxParticles);
            SetShadowsEnabled(lod1_EnableShadows);
            SetVFXEnabled(lod1_EnableVFX);
            SetUpdateRate(0.75f);
            SetRenderDistance(lodDistances[1]);
        }
        
        private void ApplyLOD2()
        {
            SetAnimatorEnabled(lod2_EnableAnimation);
            SetParticleMaxCount(lod2_MaxParticles);
            SetShadowsEnabled(lod2_EnableShadows);
            SetVFXEnabled(lod2_EnableVFX);
            SetUpdateRate(0.5f);
            SetRenderDistance(lodDistances[2]);
        }
        
        private void ApplyLOD3()
        {
            SetAnimatorEnabled(lod3_EnableAnimation);
            SetParticleMaxCount(lod3_MaxParticles);
            SetShadowsEnabled(lod3_EnableShadows);
            SetVFXEnabled(lod3_EnableVFX);
            SetUpdateRate(0.25f);
            SetRenderDistance(lodDistances[3]);
        }
        
        private void DisableObject()
        {
            gameObject.SetActive(false);
        }
        
        private void SetAnimatorEnabled(bool enabled)
        {
            if (animator != null)
            {
                animator.enabled = enabled;
                
                if (!enabled)
                {
                    animator.Rebind();
                }
            }
        }
        
        private void SetParticleMaxCount(int maxParticles)
        {
            foreach (var ps in particleSystems)
            {
                if (ps != null)
                {
                    var main = ps.main;
                    main.maxParticles = maxParticles;
                    
                    if (maxParticles == 0)
                    {
                        ps.Stop();
                        ps.Clear();
                    }
                    else if (!ps.isPlaying && ps.main.loop)
                    {
                        ps.Play();
                    }
                }
            }
        }
        
        private void SetShadowsEnabled(bool enabled)
        {
            foreach (var renderer in renderers)
            {
                if (renderer != null)
                {
                    renderer.shadowCastingMode = enabled ? 
                        UnityEngine.Rendering.ShadowCastingMode.On : 
                        UnityEngine.Rendering.ShadowCastingMode.Off;
                    
                    renderer.receiveShadows = enabled;
                }
            }
            
            foreach (var light in lights)
            {
                if (light != null)
                {
                    light.shadows = enabled ? LightShadows.Soft : LightShadows.None;
                }
            }
        }
        
        private void SetVFXEnabled(bool enabled)
        {
            var vfxComponents = GetComponentsInChildren<IVFXComponent>();
            foreach (var vfx in vfxComponents)
            {
                vfx?.SetEnabled(enabled);
            }
        }
        
        private void SetUpdateRate(float rate)
        {
            var controller = GetComponent<MimicController>();
            if (controller != null)
            {
                if (rate < 1f)
                {
                    Time.timeScale = Mathf.Max(0.5f, rate);
                }
            }
        }
        
        private void SetRenderDistance(float distance)
        {
            foreach (var renderer in renderers)
            {
                if (renderer != null && renderer is MeshRenderer meshRenderer)
                {
                    if (distance >= lodDistances[lodDistances.Length - 1])
                    {
                        meshRenderer.enabled = false;
                    }
                    else
                    {
                        meshRenderer.enabled = true;
                    }
                }
            }
        }
        
        public int GetCurrentLOD()
        {
            return currentLOD;
        }
        
        public void ForceLOD(int level)
        {
            if (level >= 0 && level <= lodDistances.Length)
            {
                ApplyLOD(level);
                currentLOD = level;
            }
        }
        
        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.green;
            for (int i = 0; i < lodDistances.Length; i++)
            {
                Gizmos.color = new Color(0, 1f - (i * 0.25f), 0, 0.3f);
                Gizmos.DrawWireSphere(transform.position, lodDistances[i]);
            }
        }
    }
    
    public interface IVFXComponent
    {
        void SetEnabled(bool enabled);
    }
}