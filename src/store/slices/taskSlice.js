import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {database} from '../../database/database';
import {syncService} from '../../services/syncService';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
  syncing: false,
};

// Async thunks
export const loadTasks = createAsyncThunk('tasks/loadTasks', async () => {
  const tasks = await database.getAllTasks();
  return tasks;
});

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (input) => {
    const newTask = {
      id: Date.now().toString(),
      title: input.title,
      description: input.description,
      status: 'Pending',
      lastUpdated: Date.now(),
      isSynced: false,
    };
    await database.insertTask(newTask);
    return newTask;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (input) => {
    const existingTask = await database.getTaskById(input.id);
    if (!existingTask) throw new Error('Task not found');

    const updatedTask = {
      ...existingTask,
      title: input.title ?? existingTask.title,
      description: input.description ?? existingTask.description,
      status: input.status ?? existingTask.status,
      lastUpdated: Date.now(),
      isSynced: false,
    };
    await database.updateTask(updatedTask);
    return updatedTask;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id) => {
    await database.markTaskForDelete(id);
    return id;
  }
);

export const toggleTaskStatus = createAsyncThunk(
  'tasks/toggleTaskStatus',
  async (id) => {
    const task = await database.getTaskById(id);
    if (!task) throw new Error('Task not found');

    const updatedTask = {
      ...task,
      status: task.status === 'Pending' ? 'Completed' : 'Pending',
      lastUpdated: Date.now(),
      isSynced: false,
    };
    await database.updateTask(updatedTask);
    return updatedTask;
  }
);

export const syncTasks = createAsyncThunk(
  'tasks/syncTasks',
  async (_, {dispatch}) => {
    await syncService.syncTasks();
    dispatch(loadTasks());
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSyncing: (state, action) => {
      state.syncing = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Load tasks
    builder
      .addCase(loadTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load tasks';
      });

    // Add task
    builder
      .addCase(addTask.pending, state => {
        state.loading = true;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add task';
      });

    // Update task
    builder
      .addCase(updateTask.pending, state => {
        state.loading = true;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, state => {
        state.loading = true;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete task';
      });

    // Toggle task status
    builder
      .addCase(toggleTaskStatus.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      });

    // Sync tasks
    builder
      .addCase(syncTasks.pending, state => {
        state.syncing = true;
      })
      .addCase(syncTasks.fulfilled, state => {
        state.syncing = false;
      })
      .addCase(syncTasks.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.error.message || 'Sync failed';
      });
  },
});

export const {setSyncing, clearError} = taskSlice.actions;
export default taskSlice.reducer;
