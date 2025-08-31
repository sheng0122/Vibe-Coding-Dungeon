using System;
using System.Collections.Generic;
using UnityEngine;

namespace MimicBoss.AI
{
    public enum NodeState
    {
        Running,
        Success,
        Failure
    }
    
    public class BehaviorTree
    {
        public BehaviorNode Root { get; set; }
        
        public NodeState Execute()
        {
            if (Root == null)
                return NodeState.Failure;
            
            return Root.Evaluate();
        }
    }
    
    public abstract class BehaviorNode
    {
        protected NodeState state;
        protected List<BehaviorNode> children = new List<BehaviorNode>();
        protected BehaviorNode parent;
        
        public BehaviorNode()
        {
            state = NodeState.Running;
        }
        
        public BehaviorNode(List<BehaviorNode> children)
        {
            this.children = children;
            foreach (var child in children)
            {
                child.parent = this;
            }
        }
        
        public abstract NodeState Evaluate();
        
        public void AddChild(BehaviorNode node)
        {
            children.Add(node);
            node.parent = this;
        }
        
        public void RemoveChild(BehaviorNode node)
        {
            children.Remove(node);
            node.parent = null;
        }
    }
    
    public class Selector : BehaviorNode
    {
        public Selector() : base() { }
        public Selector(params BehaviorNode[] nodes) : base(new List<BehaviorNode>(nodes)) { }
        
        public override NodeState Evaluate()
        {
            foreach (var child in children)
            {
                NodeState childState = child.Evaluate();
                
                if (childState == NodeState.Success)
                {
                    state = NodeState.Success;
                    return state;
                }
                
                if (childState == NodeState.Running)
                {
                    state = NodeState.Running;
                    return state;
                }
            }
            
            state = NodeState.Failure;
            return state;
        }
    }
    
    public class Sequence : BehaviorNode
    {
        public Sequence() : base() { }
        public Sequence(params BehaviorNode[] nodes) : base(new List<BehaviorNode>(nodes)) { }
        
        public override NodeState Evaluate()
        {
            foreach (var child in children)
            {
                NodeState childState = child.Evaluate();
                
                if (childState == NodeState.Failure)
                {
                    state = NodeState.Failure;
                    return state;
                }
                
                if (childState == NodeState.Running)
                {
                    state = NodeState.Running;
                    return state;
                }
            }
            
            state = NodeState.Success;
            return state;
        }
    }
    
    public class Parallel : BehaviorNode
    {
        private int successThreshold;
        
        public Parallel(int threshold) : base()
        {
            successThreshold = threshold;
        }
        
        public Parallel(int threshold, params BehaviorNode[] nodes) : base(new List<BehaviorNode>(nodes))
        {
            successThreshold = threshold;
        }
        
        public override NodeState Evaluate()
        {
            int successCount = 0;
            int failureCount = 0;
            
            foreach (var child in children)
            {
                NodeState childState = child.Evaluate();
                
                if (childState == NodeState.Success)
                    successCount++;
                else if (childState == NodeState.Failure)
                    failureCount++;
            }
            
            if (successCount >= successThreshold)
            {
                state = NodeState.Success;
            }
            else if (failureCount > children.Count - successThreshold)
            {
                state = NodeState.Failure;
            }
            else
            {
                state = NodeState.Running;
            }
            
            return state;
        }
    }
    
    public class ActionNode : BehaviorNode
    {
        private Func<NodeState> action;
        
        public ActionNode(Func<NodeState> action) : base()
        {
            this.action = action;
        }
        
        public override NodeState Evaluate()
        {
            if (action == null)
            {
                state = NodeState.Failure;
                return state;
            }
            
            state = action.Invoke();
            return state;
        }
    }
    
    public class ConditionNode : BehaviorNode
    {
        private Func<bool> condition;
        
        public ConditionNode(Func<bool> condition) : base()
        {
            this.condition = condition;
        }
        
        public override NodeState Evaluate()
        {
            if (condition == null)
            {
                state = NodeState.Failure;
                return state;
            }
            
            state = condition.Invoke() ? NodeState.Success : NodeState.Failure;
            return state;
        }
    }
    
    public class Inverter : BehaviorNode
    {
        public Inverter(BehaviorNode child) : base()
        {
            AddChild(child);
        }
        
        public override NodeState Evaluate()
        {
            if (children.Count == 0)
            {
                state = NodeState.Failure;
                return state;
            }
            
            NodeState childState = children[0].Evaluate();
            
            if (childState == NodeState.Success)
                state = NodeState.Failure;
            else if (childState == NodeState.Failure)
                state = NodeState.Success;
            else
                state = NodeState.Running;
            
            return state;
        }
    }
    
    public class Repeater : BehaviorNode
    {
        private int repeatCount;
        private int currentCount;
        
        public Repeater(int count, BehaviorNode child) : base()
        {
            repeatCount = count;
            currentCount = 0;
            AddChild(child);
        }
        
        public override NodeState Evaluate()
        {
            if (children.Count == 0)
            {
                state = NodeState.Failure;
                return state;
            }
            
            if (repeatCount > 0 && currentCount >= repeatCount)
            {
                state = NodeState.Success;
                return state;
            }
            
            NodeState childState = children[0].Evaluate();
            
            if (childState == NodeState.Success || childState == NodeState.Failure)
            {
                currentCount++;
                
                if (repeatCount <= 0 || currentCount < repeatCount)
                {
                    state = NodeState.Running;
                }
                else
                {
                    state = NodeState.Success;
                    currentCount = 0;
                }
            }
            else
            {
                state = NodeState.Running;
            }
            
            return state;
        }
    }
    
    public class RandomSelector : BehaviorNode
    {
        private System.Random random = new System.Random();
        
        public RandomSelector() : base() { }
        public RandomSelector(params BehaviorNode[] nodes) : base(new List<BehaviorNode>(nodes)) { }
        
        public override NodeState Evaluate()
        {
            if (children.Count == 0)
            {
                state = NodeState.Failure;
                return state;
            }
            
            int randomIndex = random.Next(0, children.Count);
            state = children[randomIndex].Evaluate();
            
            return state;
        }
    }
    
    public class WaitNode : BehaviorNode
    {
        private float waitTime;
        private float startTime;
        private bool isWaiting;
        
        public WaitNode(float time) : base()
        {
            waitTime = time;
            isWaiting = false;
        }
        
        public override NodeState Evaluate()
        {
            if (!isWaiting)
            {
                isWaiting = true;
                startTime = Time.time;
                state = NodeState.Running;
            }
            else if (Time.time - startTime >= waitTime)
            {
                isWaiting = false;
                state = NodeState.Success;
            }
            else
            {
                state = NodeState.Running;
            }
            
            return state;
        }
    }
}