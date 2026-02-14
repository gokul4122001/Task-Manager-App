// Task Status Types
export const TaskStatus = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
};

// No runtime types needed for JS - using JSDoc for documentation

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'Pending'|'Completed'} status
 * @property {number} lastUpdated
 * @property {boolean} isSynced
 * @property {boolean} [pendingDelete]
 */

/**
 * @typedef {Object} CreateTaskInput
 * @property {string} title
 * @property {string} description
 */

/**
 * @typedef {Object} UpdateTaskInput
 * @property {string} id
 * @property {string} [title]
 * @property {string} [description]
 * @property {'Pending'|'Completed'} [status]
 */
