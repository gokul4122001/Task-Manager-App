import { database } from '../database/database';
import NetInfo from '@react-native-community/netinfo';

// Simulated server storage
let serverTasks = new Map([
  ['initial-task-1', {
    id: 'initial-task-1',
    title: 'Welcome Task',
    description: 'This task was fetched from the simulated server API.',
    status: 'Pending',
    lastUpdated: Date.now() - 1000000,
    isSynced: true
  }],
  ['initial-task-2', {
    id: 'initial-task-2',
    title: 'Review Documentation',
    description: 'Ensure all assignment requirements are met before submission.',
    status: 'Completed',
    lastUpdated: Date.now() - 500000,
    isSynced: true
  }]
]);

class SyncService {
  constructor() {
    this.isOnline = true;
    this.isSyncing = false;

    // Monitor network status
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      // If coming back online, trigger sync
      if (wasOffline && this.isOnline) {
        console.log('Network restored - triggering sync');
        this.syncTasks().catch(err => console.error('Auto-sync failed', err));
      }
    });
  }

  async syncTasks() {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping');
      return;
    }

    const netInfo = await NetInfo.fetch();

    if (!netInfo.isConnected) {
      console.log('Offline - sync deferred');
      return;
    }

    this.isSyncing = true;
    try {
      // Step 1: Handle pending deletes first
      await this.syncDeletes();

      // Step 2: Sync unsynced local changes to server
      await this.syncLocalToServer();

      // Step 3: Sync server changes to local (simulated)
      await this.syncServerToLocal();

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync error:', error);
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  async syncDeletes() {
    const pendingDeletes = await database.getPendingDeleteTasks();

    for (const task of pendingDeletes) {
      try {
        // Simulate DELETE /tasks/:id API call
        await this.simulateApiDelete(task.id);
        // Permanently delete from local DB after successful server delete
        await database.deleteTaskPermanently(task.id);
      } catch (error) {
        console.error(`Failed to delete task ${task.id} from server:`, error);
      }
    }
  }

  async syncLocalToServer() {
    const unsyncedTasks = await database.getUnsyncedTasks();

    for (const task of unsyncedTasks) {
      try {
        if (task.pendingDelete) {
          continue; // Already handled in syncDeletes
        }

        // Check if task exists on server
        const serverTask = serverTasks.get(task.id);

        if (serverTask) {
          // Conflict resolution: Last Write Wins
          // Compare timestamps to determine which version is newer
          if (task.lastUpdated > serverTask.lastUpdated) {
            // Local is newer - update server
            await this.simulateApiUpdate(task);
          } else if (task.lastUpdated < serverTask.lastUpdated) {
            // Server is newer - update local (handled in syncServerToLocal)
            continue;
          }
          // If timestamps are equal, no conflict
        } else {
          // New task - create on server
          await this.simulateApiCreate(task);
        }

        // Mark as synced
        await database.markTaskAsSynced(task.id);
      } catch (error) {
        console.error(`Failed to sync task ${task.id}:`, error);
      }
    }
  }

  async syncServerToLocal() {
    // Simulate fetching all tasks from server
    const serverTaskList = Array.from(serverTasks.values());
    if (serverTaskList.length === 0) return;

    // Build a map of local tasks and pending deletes for O(1) lookup
    const localTasks = await database.getAllTasks();
    const pendingDeletes = await database.getPendingDeleteTasks();

    const localTaskMap = new Map(localTasks.map(t => [t.id, t]));
    const pendingDeleteSet = new Set(pendingDeletes.map(t => t.id));

    for (const serverTask of serverTaskList) {
      const localTask = localTaskMap.get(serverTask.id);

      if (!localTask) {
        // Task exists on server but not locally - add it if it wasn't recently deleted
        if (!pendingDeleteSet.has(serverTask.id)) {
          console.log(`Adding missing task from server: ${serverTask.id}`);
          await database.insertTask({
            ...serverTask,
            isSynced: true,
          });
        }
      } else if (!localTask.isSynced && localTask.lastUpdated < serverTask.lastUpdated) {
        // Server has newer version - update local
        console.log(`Updating local task with newer server version: ${serverTask.id}`);
        await database.updateTask({
          ...serverTask,
          isSynced: true,
        });
      }
    }
  }

  // Simulated API calls with reduced latency to prevent perceived lag
  simulateApiCreate(task) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) { // Reduced failure rate for smoother demo
          reject(new Error('Network error'));
        } else {
          serverTasks.set(task.id, { ...task, isSynced: true });
          resolve();
        }
      }, 100); // Reduced from 300ms
    });
  }

  simulateApiUpdate(task) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) {
          reject(new Error('Network error'));
        } else {
          serverTasks.set(task.id, { ...task, isSynced: true });
          resolve();
        }
      }, 100);
    });
  }

  simulateApiDelete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.05) {
          reject(new Error('Network error'));
        } else {
          serverTasks.delete(id);
          resolve();
        }
      }, 100);
    });
  }

  // For testing: Get server state
  getServerTasks() {
    return Array.from(serverTasks.values());
  }

  // For testing: Clear server
  clearServer() {
    serverTasks.clear();
  }
}

export const syncService = new SyncService();
