using System.Collections.Generic;
using UnityEngine;

namespace MimicBoss.Optimization
{
    public class ObjectPoolManager : MonoBehaviour
    {
        private static ObjectPoolManager instance;
        public static ObjectPoolManager Instance
        {
            get
            {
                if (instance == null)
                {
                    GameObject go = new GameObject("ObjectPoolManager");
                    instance = go.AddComponent<ObjectPoolManager>();
                    DontDestroyOnLoad(go);
                }
                return instance;
            }
        }
        
        [System.Serializable]
        public class PoolInfo
        {
            public string poolName;
            public GameObject prefab;
            public int poolSize = 10;
            public bool expandable = true;
        }
        
        [SerializeField] private List<PoolInfo> poolInfos = new List<PoolInfo>();
        private Dictionary<string, ObjectPool> pools = new Dictionary<string, ObjectPool>();
        
        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
                return;
            }
            
            instance = this;
            DontDestroyOnLoad(gameObject);
            
            InitializePools();
        }
        
        private void InitializePools()
        {
            foreach (var info in poolInfos)
            {
                CreatePool(info.poolName, info.prefab, info.poolSize, info.expandable);
            }
            
            CreateDefaultPools();
        }
        
        private void CreateDefaultPools()
        {
            GameObject goldCoinPrefab = Resources.Load<GameObject>("Prefabs/GoldCoinProjectile");
            if (goldCoinPrefab != null)
                CreatePool("GoldCoin", goldCoinPrefab, 50, true);
            
            GameObject hitEffectPrefab = Resources.Load<GameObject>("Prefabs/HitEffect");
            if (hitEffectPrefab != null)
                CreatePool("HitEffect", hitEffectPrefab, 20, true);
            
            GameObject dustCloudPrefab = Resources.Load<GameObject>("Prefabs/DustCloud");
            if (dustCloudPrefab != null)
                CreatePool("DustCloud", dustCloudPrefab, 10, true);
        }
        
        public void CreatePool(string poolName, GameObject prefab, int size, bool expandable = true)
        {
            if (pools.ContainsKey(poolName))
            {
                Debug.LogWarning($"Pool {poolName} already exists");
                return;
            }
            
            GameObject poolHolder = new GameObject($"Pool_{poolName}");
            poolHolder.transform.SetParent(transform);
            
            ObjectPool pool = new ObjectPool(prefab, size, expandable, poolHolder.transform);
            pools[poolName] = pool;
        }
        
        public GameObject Spawn(string poolName, Vector3 position, Quaternion rotation)
        {
            if (!pools.ContainsKey(poolName))
            {
                Debug.LogError($"Pool {poolName} doesn't exist");
                return null;
            }
            
            return pools[poolName].Spawn(position, rotation);
        }
        
        public T Spawn<T>(string poolName, Vector3 position, Quaternion rotation) where T : Component
        {
            GameObject obj = Spawn(poolName, position, rotation);
            if (obj != null)
            {
                return obj.GetComponent<T>();
            }
            return null;
        }
        
        public void Despawn(string poolName, GameObject obj, float delay = 0f)
        {
            if (!pools.ContainsKey(poolName))
            {
                Debug.LogError($"Pool {poolName} doesn't exist");
                Destroy(obj);
                return;
            }
            
            if (delay > 0)
            {
                StartCoroutine(DespawnAfterDelay(poolName, obj, delay));
            }
            else
            {
                pools[poolName].Despawn(obj);
            }
        }
        
        private System.Collections.IEnumerator DespawnAfterDelay(string poolName, GameObject obj, float delay)
        {
            yield return new WaitForSeconds(delay);
            Despawn(poolName, obj);
        }
        
        public void PrewarmPool(string poolName, int amount)
        {
            if (!pools.ContainsKey(poolName))
            {
                Debug.LogError($"Pool {poolName} doesn't exist");
                return;
            }
            
            pools[poolName].Prewarm(amount);
        }
        
        public int GetPoolSize(string poolName)
        {
            if (!pools.ContainsKey(poolName))
                return 0;
            
            return pools[poolName].GetPoolSize();
        }
        
        public int GetActiveCount(string poolName)
        {
            if (!pools.ContainsKey(poolName))
                return 0;
            
            return pools[poolName].GetActiveCount();
        }
        
        public void ClearPool(string poolName)
        {
            if (pools.ContainsKey(poolName))
            {
                pools[poolName].Clear();
            }
        }
        
        public void ClearAllPools()
        {
            foreach (var pool in pools.Values)
            {
                pool.Clear();
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
    
    public class ObjectPool
    {
        private GameObject prefab;
        private Queue<GameObject> availableObjects = new Queue<GameObject>();
        private HashSet<GameObject> activeObjects = new HashSet<GameObject>();
        private Transform poolParent;
        private bool expandable;
        
        public ObjectPool(GameObject prefab, int initialSize, bool expandable, Transform parent)
        {
            this.prefab = prefab;
            this.expandable = expandable;
            this.poolParent = parent;
            
            for (int i = 0; i < initialSize; i++)
            {
                CreateObject();
            }
        }
        
        private GameObject CreateObject()
        {
            GameObject obj = GameObject.Instantiate(prefab, poolParent);
            obj.SetActive(false);
            availableObjects.Enqueue(obj);
            return obj;
        }
        
        public GameObject Spawn(Vector3 position, Quaternion rotation)
        {
            GameObject obj = null;
            
            if (availableObjects.Count > 0)
            {
                obj = availableObjects.Dequeue();
            }
            else if (expandable)
            {
                obj = CreateObject();
                availableObjects.Dequeue();
            }
            else
            {
                Debug.LogWarning($"Pool for {prefab.name} is empty and not expandable");
                return null;
            }
            
            if (obj != null)
            {
                obj.transform.position = position;
                obj.transform.rotation = rotation;
                obj.SetActive(true);
                activeObjects.Add(obj);
                
                var poolable = obj.GetComponent<IPoolable>();
                poolable?.OnSpawn();
            }
            
            return obj;
        }
        
        public void Despawn(GameObject obj)
        {
            if (obj == null) return;
            
            if (activeObjects.Contains(obj))
            {
                var poolable = obj.GetComponent<IPoolable>();
                poolable?.OnDespawn();
                
                obj.SetActive(false);
                obj.transform.SetParent(poolParent);
                activeObjects.Remove(obj);
                availableObjects.Enqueue(obj);
            }
        }
        
        public void Prewarm(int amount)
        {
            for (int i = 0; i < amount; i++)
            {
                if (availableObjects.Count < amount)
                {
                    CreateObject();
                }
            }
        }
        
        public int GetPoolSize()
        {
            return availableObjects.Count + activeObjects.Count;
        }
        
        public int GetActiveCount()
        {
            return activeObjects.Count;
        }
        
        public void Clear()
        {
            foreach (var obj in activeObjects)
            {
                if (obj != null)
                    GameObject.Destroy(obj);
            }
            
            foreach (var obj in availableObjects)
            {
                if (obj != null)
                    GameObject.Destroy(obj);
            }
            
            activeObjects.Clear();
            availableObjects.Clear();
        }
    }
    
    public interface IPoolable
    {
        void OnSpawn();
        void OnDespawn();
    }
}