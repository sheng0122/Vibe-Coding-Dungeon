using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace MimicBoss.Core
{
    public class MimicResourceManager : MonoBehaviour
    {
        private static MimicResourceManager instance;
        public static MimicResourceManager Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = FindObjectOfType<MimicResourceManager>();
                    if (instance == null)
                    {
                        GameObject go = new GameObject("MimicResourceManager");
                        instance = go.AddComponent<MimicResourceManager>();
                    }
                }
                return instance;
            }
        }
        
        [Header("Resource Paths")]
        private const string SPRITES_BASE_PATH = "Assets/Boss/MimicBoss/Sprites/";
        private const string VFX_BASE_PATH = "Assets/Boss/MimicBoss/VFX/";
        private const string AUDIO_BASE_PATH = "Assets/Audio/";
        private const string CONFIG_PATH = "Assets/Resources/MimicBossConfig.json";
        
        private Dictionary<string, Sprite> spriteCache = new Dictionary<string, Sprite>();
        private Dictionary<string, GameObject> vfxCache = new Dictionary<string, GameObject>();
        private Dictionary<string, AudioClip> audioCache = new Dictionary<string, AudioClip>();
        
        [System.Serializable]
        public class AnimationSprites
        {
            public string animationName;
            public List<Sprite> frames = new List<Sprite>();
        }
        
        private Dictionary<string, AnimationSprites> animationSpriteGroups = new Dictionary<string, AnimationSprites>();
        
        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
                return;
            }
            
            instance = this;
            DontDestroyOnLoad(gameObject);
            
            LoadAllResources();
        }
        
        private void LoadAllResources()
        {
            LoadAnimationSprites();
            LoadVFXPrefabs();
            LoadAudioClips();
        }
        
        private void LoadAnimationSprites()
        {
            // Load Attack animations
            LoadSpriteGroup("Attack", new string[] {
                "boss_attack_frame1",
                "boss_attack_frame2",
                "boss_attack_frame3",
                "boss_attack_frame4",
                "boss_attack_frame5",
                "boss_attack_frame6",
                "boss_attack_frame7"
            });
            
            // Load Idle animations
            LoadSpriteGroup("Idle", new string[] {
                "Idle_Disguise"
            });
            
            // Load Transform animations
            LoadSpriteGroup("Transform", new string[] {
                "micmic_transform_frame_1",
                "micmic_transform_frame_2",
                "micmic_transform_frame_3",
                "micmic_transform_frame_4",
                "micmic_transform_frame_5",
                "micmic_transform_frame_6",
                "micmic_transform_frame_7",
                "micmic_transform_frame_8",
                "micmic_transform_frame_9"
            });
        }
        
        private void LoadSpriteGroup(string groupName, string[] spriteNames)
        {
            AnimationSprites animGroup = new AnimationSprites();
            animGroup.animationName = groupName;
            
            foreach (string spriteName in spriteNames)
            {
                string fullPath = SPRITES_BASE_PATH + groupName + "/" + spriteName;
                Sprite sprite = Resources.Load<Sprite>(fullPath);
                
                if (sprite != null)
                {
                    animGroup.frames.Add(sprite);
                    spriteCache[spriteName] = sprite;
                }
                else
                {
                    Debug.LogWarning($"Failed to load sprite: {fullPath}");
                }
            }
            
            animationSpriteGroups[groupName] = animGroup;
        }
        
        private void LoadVFXPrefabs()
        {
            string[] vfxNames = new string[] {
                "GoldExplosion",
                "TongueWhip",
                "JumpImpact",
                "RageAura",
                "DeathExplosion"
            };
            
            foreach (string vfxName in vfxNames)
            {
                string fullPath = VFX_BASE_PATH + vfxName;
                GameObject vfx = Resources.Load<GameObject>(fullPath);
                
                if (vfx != null)
                {
                    vfxCache[vfxName] = vfx;
                }
            }
        }
        
        private void LoadAudioClips()
        {
            string[] sfxNames = new string[] {
                "SFX/mimic_roar",
                "SFX/mimic_bite",
                "SFX/mimic_jump",
                "SFX/mimic_death",
                "SFX/gold_spray",
                "SFX/phase_transition"
            };
            
            foreach (string sfxName in sfxNames)
            {
                string fullPath = AUDIO_BASE_PATH + sfxName;
                AudioClip clip = Resources.Load<AudioClip>(fullPath);
                
                if (clip != null)
                {
                    string key = System.IO.Path.GetFileNameWithoutExtension(sfxName);
                    audioCache[key] = clip;
                }
            }
        }
        
        public Sprite GetSprite(string spriteName)
        {
            if (spriteCache.ContainsKey(spriteName))
            {
                return spriteCache[spriteName];
            }
            
            Debug.LogWarning($"Sprite not found in cache: {spriteName}");
            return null;
        }
        
        public List<Sprite> GetAnimationFrames(string animationName)
        {
            if (animationSpriteGroups.ContainsKey(animationName))
            {
                return animationSpriteGroups[animationName].frames;
            }
            
            Debug.LogWarning($"Animation group not found: {animationName}");
            return new List<Sprite>();
        }
        
        public GameObject GetVFXPrefab(string vfxName)
        {
            if (vfxCache.ContainsKey(vfxName))
            {
                return vfxCache[vfxName];
            }
            
            Debug.LogWarning($"VFX prefab not found: {vfxName}");
            return null;
        }
        
        public AudioClip GetAudioClip(string clipName)
        {
            if (audioCache.ContainsKey(clipName))
            {
                return audioCache[clipName];
            }
            
            Debug.LogWarning($"Audio clip not found: {clipName}");
            return null;
        }
        
        public GameObject SpawnVFX(string vfxName, Vector3 position, Quaternion rotation, float destroyDelay = 2f)
        {
            GameObject vfxPrefab = GetVFXPrefab(vfxName);
            if (vfxPrefab != null)
            {
                GameObject vfxInstance = Instantiate(vfxPrefab, position, rotation);
                if (destroyDelay > 0)
                {
                    Destroy(vfxInstance, destroyDelay);
                }
                return vfxInstance;
            }
            return null;
        }
        
        public void PlaySound(string soundName, AudioSource audioSource, float volume = 1f)
        {
            AudioClip clip = GetAudioClip(soundName);
            if (clip != null && audioSource != null)
            {
                audioSource.PlayOneShot(clip, volume);
            }
        }
        
        public void PreloadAnimation(string animationName)
        {
            if (!animationSpriteGroups.ContainsKey(animationName))
            {
                Debug.LogWarning($"Attempting to preload non-existent animation: {animationName}");
            }
        }
        
        public void ClearCache()
        {
            spriteCache.Clear();
            vfxCache.Clear();
            audioCache.Clear();
            animationSpriteGroups.Clear();
        }
        
        private void OnDestroy()
        {
            ClearCache();
        }
    }
}