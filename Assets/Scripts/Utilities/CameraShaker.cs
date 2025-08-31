using System.Collections;
using UnityEngine;

namespace MimicBoss
{
    public class CameraShaker : MonoBehaviour
    {
        private static CameraShaker instance;
        public static CameraShaker Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = FindObjectOfType<CameraShaker>();
                    if (instance == null)
                    {
                        GameObject go = new GameObject("CameraShaker");
                        instance = go.AddComponent<CameraShaker>();
                    }
                }
                return instance;
            }
        }
        
        [Header("Shake Settings")]
        [SerializeField] private AnimationCurve shakeCurve = AnimationCurve.EaseInOut(0, 1, 1, 0);
        [SerializeField] private float traumaDecay = 1f;
        [SerializeField] private float maxOffset = 1f;
        [SerializeField] private float maxRotation = 5f;
        
        private Camera targetCamera;
        private float trauma = 0f;
        private Vector3 originalPosition;
        private Quaternion originalRotation;
        private Coroutine shakeCoroutine;
        
        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
                return;
            }
            
            instance = this;
            DontDestroyOnLoad(gameObject);
            
            targetCamera = Camera.main;
            if (targetCamera != null)
            {
                originalPosition = targetCamera.transform.localPosition;
                originalRotation = targetCamera.transform.localRotation;
            }
        }
        
        public void Shake(float intensity, float duration)
        {
            if (targetCamera == null)
            {
                targetCamera = Camera.main;
                if (targetCamera == null) return;
            }
            
            trauma = Mathf.Clamp01(trauma + intensity);
            
            if (shakeCoroutine != null)
                StopCoroutine(shakeCoroutine);
            
            shakeCoroutine = StartCoroutine(ShakeRoutine(duration));
        }
        
        private IEnumerator ShakeRoutine(float duration)
        {
            float elapsed = 0f;
            
            while (elapsed < duration || trauma > 0)
            {
                elapsed += Time.deltaTime;
                
                if (elapsed < duration)
                {
                    trauma = Mathf.Max(trauma, shakeCurve.Evaluate(elapsed / duration));
                }
                else
                {
                    trauma = Mathf.Max(0, trauma - traumaDecay * Time.deltaTime);
                }
                
                if (trauma > 0)
                {
                    float shake = trauma * trauma;
                    
                    float offsetX = maxOffset * shake * Random.Range(-1f, 1f);
                    float offsetY = maxOffset * shake * Random.Range(-1f, 1f);
                    
                    float rotationZ = maxRotation * shake * Random.Range(-1f, 1f);
                    
                    targetCamera.transform.localPosition = originalPosition + new Vector3(offsetX, offsetY, 0);
                    targetCamera.transform.localRotation = originalRotation * Quaternion.Euler(0, 0, rotationZ);
                }
                else
                {
                    targetCamera.transform.localPosition = originalPosition;
                    targetCamera.transform.localRotation = originalRotation;
                }
                
                yield return null;
            }
            
            trauma = 0f;
            targetCamera.transform.localPosition = originalPosition;
            targetCamera.transform.localRotation = originalRotation;
            shakeCoroutine = null;
        }
        
        public void AddTrauma(float amount)
        {
            trauma = Mathf.Clamp01(trauma + amount);
        }
        
        public void SetTrauma(float amount)
        {
            trauma = Mathf.Clamp01(amount);
        }
        
        public void StopShake()
        {
            if (shakeCoroutine != null)
            {
                StopCoroutine(shakeCoroutine);
                shakeCoroutine = null;
            }
            
            trauma = 0f;
            
            if (targetCamera != null)
            {
                targetCamera.transform.localPosition = originalPosition;
                targetCamera.transform.localRotation = originalRotation;
            }
        }
        
        private void OnDestroy()
        {
            if (instance == this)
            {
                instance = null;
            }
        }
    }
}