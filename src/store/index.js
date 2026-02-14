import {configureStore} from '@reduxjs/toolkit';
import taskReducer from './slices/taskSlice';

export const store = configureStore({
  reducer: {
    tasks: taskReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['tasks/loadTasks/fulfilled'],
      },
    }),
});
