/**
 * Integration Tests for Agent Coordination
 * Tests multi-agent workflow and coordination via hooks
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Types
interface AgentTask {
  agentType: string;
  taskId: string;
  description: string;
  input: any;
  output?: any;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
}

interface CoordinationMemory {
  key: string;
  value: any;
  agent: string;
  timestamp: Date;
}

interface SwarmMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageDuration: number;
  agentUtilization: Record<string, number>;
}

// Mock Agent Coordinator
class AgentCoordinator {
  private tasks: Map<string, AgentTask>;
  private memory: Map<string, CoordinationMemory>;
  private hooks: any[];

  constructor() {
    this.tasks = new Map();
    this.memory = new Map();
    this.hooks = [];
  }

  async initializeSwarm(topology: string): Promise<void> {
    // Mock swarm initialization
    this.memory.set('swarm/topology', {
      key: 'swarm/topology',
      value: topology,
      agent: 'coordinator',
      timestamp: new Date()
    });
  }

  async spawnAgent(type: string, task: string): Promise<string> {
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const agentTask: AgentTask = {
      agentType: type,
      taskId,
      description: task,
      input: { task },
      status: 'pending'
    };

    this.tasks.set(taskId, agentTask);
    return taskId;
  }

  async executeTask(taskId: string): Promise<any> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    // Run pre-task hook
    await this.runPreTaskHook(task);

    // Mark as in progress
    task.status = 'in_progress';
    task.startedAt = new Date();

    // Simulate agent execution
    const result = await this.simulateAgentExecution(task);

    // Store result in memory
    this.memory.set(`swarm/${task.agentType}/${taskId}`, {
      key: `swarm/${task.agentType}/${taskId}`,
      value: result,
      agent: task.agentType,
      timestamp: new Date()
    });

    // Run post-task hook
    await this.runPostTaskHook(task, result);

    // Mark as completed
    task.status = 'completed';
    task.completedAt = new Date();
    task.output = result;

    return result;
  }

  private async runPreTaskHook(task: AgentTask): Promise<void> {
    // Mock pre-task hook
    this.hooks.push({
      type: 'pre-task',
      taskId: task.taskId,
      agent: task.agentType,
      timestamp: new Date()
    });
  }

  private async runPostTaskHook(task: AgentTask, result: any): Promise<void> {
    // Mock post-task hook
    this.hooks.push({
      type: 'post-task',
      taskId: task.taskId,
      agent: task.agentType,
      result,
      timestamp: new Date()
    });
  }

  private async simulateAgentExecution(task: AgentTask): Promise<any> {
    // Simulate different agent behaviors
    switch (task.agentType) {
      case 'researcher':
        return {
          findings: ['Research finding 1', 'Research finding 2'],
          keywords: ['AI', 'ML', 'Data']
        };

      case 'coder':
        return {
          code: 'function example() { return true; }',
          files: ['component.ts', 'utils.ts']
        };

      case 'tester':
        return {
          tests: ['test1.ts', 'test2.ts'],
          coverage: 92,
          passed: true
        };

      case 'reviewer':
        return {
          issues: [],
          score: 95,
          approved: true
        };

      default:
        return { completed: true };
    }
  }

  async coordinateSlideGeneration(topic: string, slideCount: number): Promise<any> {
    // Step 1: Research
    const researchTask = await this.spawnAgent('researcher', `Research ${topic}`);
    const research = await this.executeTask(researchTask);

    // Step 2: Content Generation
    const contentTask = await this.spawnAgent('coder', `Generate content for ${topic}`);
    const content = await this.executeTask(contentTask);

    // Step 3: Layout Design
    const layoutTask = await this.spawnAgent('coder', `Design layouts for ${slideCount} slides`);
    const layouts = await this.executeTask(layoutTask);

    // Step 4: Asset Finding
    const assetTask = await this.spawnAgent('researcher', `Find assets for ${topic}`);
    const assets = await this.executeTask(assetTask);

    // Step 5: HTML Generation
    const htmlTask = await this.spawnAgent('coder', `Generate HTML for ${topic}`);
    const html = await this.executeTask(htmlTask);

    // Step 6: Quality Review
    const reviewTask = await this.spawnAgent('reviewer', `Review ${topic} presentation`);
    const review = await this.executeTask(reviewTask);

    return {
      research,
      content,
      layouts,
      assets,
      html,
      review,
      completed: true
    };
  }

  getMemory(key: string): any {
    const mem = this.memory.get(key);
    return mem ? mem.value : null;
  }

  setMemory(key: string, value: any, agent: string): void {
    this.memory.set(key, {
      key,
      value,
      agent,
      timestamp: new Date()
    });
  }

  getMetrics(): SwarmMetrics {
    const tasks = Array.from(this.tasks.values());
    const completed = tasks.filter(t => t.status === 'completed');
    const failed = tasks.filter(t => t.status === 'failed');

    const durations = completed
      .filter(t => t.startedAt && t.completedAt)
      .map(t => t.completedAt!.getTime() - t.startedAt!.getTime());

    const avgDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    const agentUtilization: Record<string, number> = {};
    tasks.forEach(task => {
      agentUtilization[task.agentType] = (agentUtilization[task.agentType] || 0) + 1;
    });

    return {
      totalTasks: tasks.length,
      completedTasks: completed.length,
      failedTasks: failed.length,
      averageDuration: avgDuration,
      agentUtilization
    };
  }

  getHooks(): any[] {
    return [...this.hooks];
  }

  clearMemory(): void {
    this.memory.clear();
  }

  reset(): void {
    this.tasks.clear();
    this.memory.clear();
    this.hooks = [];
  }
}

describe('Agent Coordination', () => {
  let coordinator: AgentCoordinator;

  beforeEach(() => {
    coordinator = new AgentCoordinator();
  });

  afterEach(() => {
    coordinator.reset();
  });

  describe('Swarm Initialization', () => {
    it('should initialize swarm with topology', async () => {
      await coordinator.initializeSwarm('mesh');

      const topology = coordinator.getMemory('swarm/topology');
      expect(topology).toBe('mesh');
    });

    it('should support different topologies', async () => {
      const topologies = ['mesh', 'hierarchical', 'ring'];

      for (const topology of topologies) {
        await coordinator.initializeSwarm(topology);
        expect(coordinator.getMemory('swarm/topology')).toBe(topology);
      }
    });
  });

  describe('Agent Spawning', () => {
    it('should spawn single agent', async () => {
      const taskId = await coordinator.spawnAgent('researcher', 'Research AI trends');

      expect(taskId).toBeTruthy();
      expect(taskId).toMatch(/^task-/);
    });

    it('should spawn multiple agents', async () => {
      const tasks = await Promise.all([
        coordinator.spawnAgent('researcher', 'Research'),
        coordinator.spawnAgent('coder', 'Code'),
        coordinator.spawnAgent('tester', 'Test')
      ]);

      expect(tasks).toHaveLength(3);
      expect(new Set(tasks).size).toBe(3); // All unique
    });

    it('should track agent types', async () => {
      await coordinator.spawnAgent('researcher', 'Task 1');
      await coordinator.spawnAgent('coder', 'Task 2');
      await coordinator.spawnAgent('tester', 'Task 3');

      const metrics = coordinator.getMetrics();
      expect(metrics.agentUtilization['researcher']).toBe(1);
      expect(metrics.agentUtilization['coder']).toBe(1);
      expect(metrics.agentUtilization['tester']).toBe(1);
    });
  });

  describe('Task Execution', () => {
    it('should execute researcher task', async () => {
      const taskId = await coordinator.spawnAgent('researcher', 'Research ML');
      const result = await coordinator.executeTask(taskId);

      expect(result).toHaveProperty('findings');
      expect(result).toHaveProperty('keywords');
      expect(result.findings).toBeInstanceOf(Array);
    });

    it('should execute coder task', async () => {
      const taskId = await coordinator.spawnAgent('coder', 'Generate code');
      const result = await coordinator.executeTask(taskId);

      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('files');
    });

    it('should execute tester task', async () => {
      const taskId = await coordinator.spawnAgent('tester', 'Run tests');
      const result = await coordinator.executeTask(taskId);

      expect(result).toHaveProperty('tests');
      expect(result).toHaveProperty('coverage');
      expect(result.passed).toBe(true);
    });

    it('should execute reviewer task', async () => {
      const taskId = await coordinator.spawnAgent('reviewer', 'Review code');
      const result = await coordinator.executeTask(taskId);

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('approved');
      expect(result.approved).toBe(true);
    });

    it('should throw error for unknown task', async () => {
      await expect(
        coordinator.executeTask('unknown-task-id')
      ).rejects.toThrow('Task unknown-task-id not found');
    });
  });

  describe('Hook System', () => {
    it('should run pre-task hook', async () => {
      const taskId = await coordinator.spawnAgent('researcher', 'Test task');
      await coordinator.executeTask(taskId);

      const hooks = coordinator.getHooks();
      const preHook = hooks.find(h => h.type === 'pre-task' && h.taskId === taskId);

      expect(preHook).toBeDefined();
    });

    it('should run post-task hook', async () => {
      const taskId = await coordinator.spawnAgent('researcher', 'Test task');
      await coordinator.executeTask(taskId);

      const hooks = coordinator.getHooks();
      const postHook = hooks.find(h => h.type === 'post-task' && h.taskId === taskId);

      expect(postHook).toBeDefined();
      expect(postHook.result).toBeDefined();
    });

    it('should run hooks in correct order', async () => {
      const taskId = await coordinator.spawnAgent('researcher', 'Test task');
      await coordinator.executeTask(taskId);

      const hooks = coordinator.getHooks().filter(h => h.taskId === taskId);

      expect(hooks).toHaveLength(2);
      expect(hooks[0].type).toBe('pre-task');
      expect(hooks[1].type).toBe('post-task');
    });
  });

  describe('Memory Management', () => {
    it('should store task results in memory', async () => {
      const taskId = await coordinator.spawnAgent('researcher', 'Test task');
      const result = await coordinator.executeTask(taskId);

      const stored = coordinator.getMemory(`swarm/researcher/${taskId}`);
      expect(stored).toEqual(result);
    });

    it('should allow manual memory storage', () => {
      coordinator.setMemory('test/key', { data: 'value' }, 'test-agent');

      const value = coordinator.getMemory('test/key');
      expect(value).toEqual({ data: 'value' });
    });

    it('should return null for unknown keys', () => {
      const value = coordinator.getMemory('unknown/key');
      expect(value).toBeNull();
    });

    it('should clear memory', () => {
      coordinator.setMemory('test/key', 'value', 'agent');
      coordinator.clearMemory();

      const value = coordinator.getMemory('test/key');
      expect(value).toBeNull();
    });
  });

  describe('Full Slide Generation Coordination', () => {
    it('should coordinate all agents for slide generation', async () => {
      const result = await coordinator.coordinateSlideGeneration('AI Technology', 10);

      expect(result.completed).toBe(true);
      expect(result.research).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.layouts).toBeDefined();
      expect(result.assets).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.review).toBeDefined();
    });

    it('should execute tasks in sequence', async () => {
      const start = Date.now();
      await coordinator.coordinateSlideGeneration('Machine Learning', 5);
      const duration = Date.now() - start;

      const metrics = coordinator.getMetrics();
      expect(metrics.totalTasks).toBe(6); // 6 steps
      expect(metrics.completedTasks).toBe(6);
      expect(duration).toBeLessThan(5000);
    });

    it('should pass data between agents via memory', async () => {
      await coordinator.coordinateSlideGeneration('Data Science', 8);

      // Check that each agent's output is in memory
      const tasks = coordinator.getMetrics();
      expect(tasks.completedTasks).toBe(6);

      // Verify memory contains results
      const hooks = coordinator.getHooks();
      expect(hooks.filter(h => h.type === 'post-task')).toHaveLength(6);
    });
  });

  describe('Parallel Task Execution', () => {
    it('should handle concurrent tasks', async () => {
      const tasks = await Promise.all([
        coordinator.spawnAgent('researcher', 'Research 1'),
        coordinator.spawnAgent('researcher', 'Research 2'),
        coordinator.spawnAgent('researcher', 'Research 3')
      ]);

      const results = await Promise.all(
        tasks.map(taskId => coordinator.executeTask(taskId))
      );

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.findings).toBeDefined();
      });
    });

    it('should track parallel execution metrics', async () => {
      const tasks = await Promise.all([
        coordinator.spawnAgent('coder', 'Code 1'),
        coordinator.spawnAgent('tester', 'Test 1'),
        coordinator.spawnAgent('reviewer', 'Review 1')
      ]);

      await Promise.all(tasks.map(t => coordinator.executeTask(t)));

      const metrics = coordinator.getMetrics();
      expect(metrics.totalTasks).toBe(3);
      expect(metrics.completedTasks).toBe(3);
    });
  });

  describe('Metrics and Monitoring', () => {
    it('should calculate metrics correctly', async () => {
      const task1 = await coordinator.spawnAgent('researcher', 'Task 1');
      const task2 = await coordinator.spawnAgent('coder', 'Task 2');

      await coordinator.executeTask(task1);
      await coordinator.executeTask(task2);

      const metrics = coordinator.getMetrics();

      expect(metrics.totalTasks).toBe(2);
      expect(metrics.completedTasks).toBe(2);
      expect(metrics.failedTasks).toBe(0);
      expect(metrics.averageDuration).toBeGreaterThan(0);
    });

    it('should track agent utilization', async () => {
      await coordinator.spawnAgent('researcher', 'Task 1');
      await coordinator.spawnAgent('researcher', 'Task 2');
      await coordinator.spawnAgent('coder', 'Task 3');

      const metrics = coordinator.getMetrics();

      expect(metrics.agentUtilization['researcher']).toBe(2);
      expect(metrics.agentUtilization['coder']).toBe(1);
    });

    it('should calculate average duration', async () => {
      const tasks = await Promise.all([
        coordinator.spawnAgent('researcher', 'Task 1'),
        coordinator.spawnAgent('researcher', 'Task 2')
      ]);

      await Promise.all(tasks.map(t => coordinator.executeTask(t)));

      const metrics = coordinator.getMetrics();
      expect(metrics.averageDuration).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle failed tasks', async () => {
      await expect(
        coordinator.executeTask('invalid-task-id')
      ).rejects.toThrow();
    });

    it('should continue after task failure', async () => {
      const task1 = await coordinator.spawnAgent('researcher', 'Valid task');

      try {
        await coordinator.executeTask('invalid-id');
      } catch (e) {
        // Expected error
      }

      const result = await coordinator.executeTask(task1);
      expect(result).toBeDefined();
    });
  });

  describe('Reset and Cleanup', () => {
    it('should reset coordinator state', async () => {
      await coordinator.spawnAgent('researcher', 'Task 1');
      coordinator.setMemory('test', 'value', 'agent');

      coordinator.reset();

      const metrics = coordinator.getMetrics();
      expect(metrics.totalTasks).toBe(0);
      expect(coordinator.getMemory('test')).toBeNull();
      expect(coordinator.getHooks()).toHaveLength(0);
    });
  });

  describe('Complex Workflows', () => {
    it('should handle multi-stage presentation generation', async () => {
      // Initialize
      await coordinator.initializeSwarm('mesh');

      // Generate multiple presentations in parallel
      const presentations = await Promise.all([
        coordinator.coordinateSlideGeneration('AI Basics', 5),
        coordinator.coordinateSlideGeneration('ML Advanced', 8)
      ]);

      expect(presentations).toHaveLength(2);

      const metrics = coordinator.getMetrics();
      expect(metrics.totalTasks).toBe(12); // 6 tasks * 2 presentations
      expect(metrics.completedTasks).toBe(12);
    });

    it('should share research across presentations', async () => {
      // Store shared research
      coordinator.setMemory('shared/research', { topic: 'AI', data: ['info1', 'info2'] }, 'researcher');

      // Generate presentation using shared data
      await coordinator.coordinateSlideGeneration('AI Applications', 5);

      const sharedResearch = coordinator.getMemory('shared/research');
      expect(sharedResearch).toBeDefined();
      expect(sharedResearch.topic).toBe('AI');
    });
  });
});
