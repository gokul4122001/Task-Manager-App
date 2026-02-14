import SQLite from 'react-native-sqlite-2';

const openDatabase = SQLite.openDatabase;

const DATABASE_NAME = 'TaskManager.db';

class Database {
  constructor() {
    this.db = null;
  }

  init() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      try {
        this.db = openDatabase({
          name: DATABASE_NAME,
          location: 'default',
        }, () => {
          this.createTables()
            .then(() => {
              console.log('Database initialized successfully');
              resolve();
            })
            .catch((error) => {
              console.error('Database initialization error:', error);
              this.initPromise = null;
              reject(error);
            });
        }, (error) => {
          console.error('Database initialization error:', error);
          this.initPromise = null;
          reject(error);
        });
      } catch (error) {
        console.error('Database initialization error:', error);
        this.initPromise = null;
        reject(error);
      }
    });
    return this.initPromise;
  }

  async createTables() {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          `CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL,
            lastUpdated INTEGER NOT NULL,
            isSynced INTEGER DEFAULT 0,
            pendingDelete INTEGER DEFAULT 0
          )`,
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getAllTasks() {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          'SELECT * FROM tasks WHERE pendingDelete = 0 ORDER BY lastUpdated DESC',
          [],
          (_, results) => {
            const tasks = [];
            const len = results.rows.length;
            for (let i = 0; i < len; i++) {
              tasks.push(this.mapRowToTask(results.rows.item(i)));
            }
            resolve(tasks);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getTaskById(id) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          'SELECT * FROM tasks WHERE id = ? AND pendingDelete = 0',
          [id],
          (_, results) => {
            if (results.rows.length === 0) {
              resolve(null);
            } else {
              resolve(this.mapRowToTask(results.rows.item(0)));
            }
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getUnsyncedTasks() {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          'SELECT * FROM tasks WHERE isSynced = 0',
          [],
          (_, results) => {
            const tasks = [];
            const len = results.rows.length;
            for (let i = 0; i < len; i++) {
              tasks.push(this.mapRowToTask(results.rows.item(i)));
            }
            resolve(tasks);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getPendingDeleteTasks() {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          'SELECT * FROM tasks WHERE pendingDelete = 1',
          [],
          (_, results) => {
            const tasks = [];
            const len = results.rows.length;
            for (let i = 0; i < len; i++) {
              tasks.push(this.mapRowToTask(results.rows.item(i)));
            }
            resolve(tasks);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async insertTask(task) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          `INSERT INTO tasks (id, title, description, status, lastUpdated, isSynced, pendingDelete)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            task.id,
            task.title,
            task.description,
            task.status,
            task.lastUpdated,
            task.isSynced ? 1 : 0,
            task.pendingDelete ? 1 : 0,
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async updateTask(task) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          `UPDATE tasks 
           SET title = ?, description = ?, status = ?, lastUpdated = ?, isSynced = ?
           WHERE id = ?`,
          [
            task.title,
            task.description,
            task.status,
            task.lastUpdated,
            task.isSynced ? 1 : 0,
            task.id,
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async markTaskForDelete(id) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          'UPDATE tasks SET pendingDelete = 1, isSynced = 0 WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async deleteTaskPermanently(id) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          'DELETE FROM tasks WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async markTaskAsSynced(id) {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          'UPDATE tasks SET isSynced = 1 WHERE id = ?',
          [id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async clearAllTasks() {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      this.db.transaction((txn) => {
        txn.executeSql(
          'DELETE FROM tasks',
          [],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  mapRowToTask(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      lastUpdated: row.lastUpdated,
      isSynced: row.isSynced === 1,
      pendingDelete: row.pendingDelete === 1,
    };
  }
}

export const database = new Database();
