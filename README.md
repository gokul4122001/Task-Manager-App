# Task Manager App - Offline-First React Native Application

A fully functional offline-first task manager built with React Native CLI, Redux Toolkit, and SQLite.

## Features

- **Offline-First Architecture**: All data is stored locally in SQLite database first
- **CRUD Operations**: Create, Read, Update, Delete tasks with local-first persistence
- **Sync Simulation**: Simulated REST API with conflict resolution (LWW)
- **Network Awareness**: Automatic sync when connection is toggled via NetInfo
- **Premium UI/UX**:
  - **Lottie Animations**: Professional animations for empty states, loading, and sync processes
  - **Vector Icons**: Integrated Material Design icons for improved navigation and feedback
  - **Toast Notifications**: Interactive feedback for all user actions (Add, Update, Delete, Sync)
  - **Custom Modals**: Premium custom delete confirmation modal
- **Responsive Design**: Uses `hp` and `wp` for consistent layout across all device sizes
- **Redux State Management**: Centralized state with Redux Toolkit and async thunks

## Task Properties

Each task object contains:
- `id`: Unique identifier (UUID/Timestamp)
- `title`: Task title (Required)
- `description`: Detailed task notes
- `status`: Current state (`Pending` or `Completed`)
- `lastUpdated`: Epoch timestamp of last modification
- `isSynced`: Boolean flag indicating server synchronization status
- `pendingDelete`: Flag for soft-delete during offline state

## Project Structure

```
src/

├── database/         # SQLite database layer
│   └── database.ts
├── navigation/       # React Navigation setup
│   └── AppNavigator.tsx
├── screens/          # Screen components
│   ├── TaskListScreen.tsx
│   └── TaskDetailScreen.tsx
├── services/         # Business logic & sync
│   └── syncService.ts
├── store/            # Redux store
│   ├── index.ts
│   └── slices/
│       └── taskSlice.ts
├── types/            # TypeScript types
│   └── task.ts
└── utils/            # Utilities
    └── responsive.ts # hp, wp helpers
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- React Native development environment
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. **Install dependencies**:
```bash
cd TaskManagerApp
npm install
```

2. **Install pods (iOS only)**:
```bash
cd ios && pod install && cd ..
```

3. **Run on Android**:
```bash
npx react-native run-android
```

4. **Run on iOS**:
```bash
npx react-native run-ios
```

## Technical Stack

- **React Native CLI**: Core framework
- **TypeScript**: Type safety
- **Redux Toolkit**: State management
- **React Navigation**: Screen navigation
- **SQLite**: Local database storage
- **react-native-responsive-screen**: Responsive dimensions (hp, wp)
- **@react-native-community/netinfo**: Network detection

## Architecture

### Offline-First Strategy

1. **Local Database as Source of Truth**: All operations are performed on SQLite first
2. **Sync Queue**: Unsynced changes are tracked with `isSynced` flag
3. **Background Sync**: Automatic sync when network is available
4. **Conflict Resolution**: Last Write Wins (LWW) based on timestamps

### Sync Process

```
┌─────────────────┐
│  Local Change   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update SQLite  │
│  (isSynced=0)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Network Check  │────▶│    Offline   │
└────────┬────────┘     └──────────────┘
         │ Online
         ▼
┌─────────────────┐
│  Sync to Server │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Mark Synced    │
│  (isSynced=1)   │
└─────────────────┘
```

### Conflict Resolution Strategy

When a task is updated both locally and on the server:

1. **Last Write Wins (LWW)**: Compare `lastUpdated` timestamps
2. If local timestamp > server timestamp: Local wins, update server
3. If server timestamp > local timestamp: Server wins, update local
4. If equal: No conflict, both in sync

### Simulated APIs

The app simulates REST API calls with 10% failure rate:
- `GET /tasks` - Fetch all tasks (simulated via server storage)
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

## Responsive Design

Using `react-native-responsive-screen`:

```typescript
import {wp, hp} from './src/utils/responsive';

// Width percentage (viewport width)
const cardWidth = wp('90%');  // 90% of screen width

// Height percentage (viewport height)
const headerHeight = hp('8%');  // 8% of screen height
```

## State Management

Redux Toolkit with async thunks:

```typescript
// Actions
dispatch(addTask({title, description}));
dispatch(updateTask({id, title, description, status}));
dispatch(deleteTask(id));
dispatch(toggleTaskStatus(id));
dispatch(syncTasks());

// Selectors
const tasks = useSelector(state => state.tasks.tasks);
const loading = useSelector(state => state.tasks.loading);
const syncing = useSelector(state => state.tasks.syncing);
```

## Database Schema

```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  lastUpdated INTEGER NOT NULL,
  isSynced INTEGER DEFAULT 0,
  pendingDelete INTEGER DEFAULT 0
);
```

## Future Enhancements

- Real backend API integration
- Push notifications for due tasks
- Task categories/tags
- Search and filter functionality
- Dark mode support
- Biometric authentication

## License

MIT
