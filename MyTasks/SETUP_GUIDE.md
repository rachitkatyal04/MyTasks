# MyTasks - Firebase Task Management App Setup Guide

## Overview

This is a comprehensive React Native task management app built with Expo that includes:

- 🔐 Firebase Authentication (email/password)
- ☁️ Cloud storage with Firestore
- 📝 Complete task management (CRUD operations)
- 🏷️ Task priority levels (low, medium, high)
- 📅 Due dates and overdue notifications
- 🔍 Advanced filtering and sorting
- 📱 Beautiful, modern UI

## Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- Firebase account
- React Native development environment

## Setup Instructions

### 1. Install Dependencies

```bash
cd MyTasks
npm install --legacy-peer-deps
```

### 2. Firebase Setup

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "MyTasks")
4. Enable Google Analytics (optional)
5. Create project

#### Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" → "Sign-in method"
2. Enable "Email/Password" authentication
3. Save changes

#### Step 3: Create Firestore Database

1. Go to "Firestore Database"
2. Click "Create database"
3. Start in "production mode" (we'll add security rules later)
4. Choose a location close to your users
5. Create database

#### Step 4: Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app
4. Register app with a nickname
5. Copy the configuration object

#### Step 5: Update Firebase Config

Open `firebaseConfig.ts` and replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
};
```

### 3. Firestore Security Rules

In the Firebase Console, go to Firestore Database → Rules and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own tasks
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Install Expo Plugins

Install required Expo plugins for navigation:

```bash
npx expo install react-native-gesture-handler react-native-safe-area-context react-native-screens
```

### 5. Run the App

```bash
npx expo start
```

Choose your preferred platform:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app for physical device

## App Features

### Authentication

- **Sign Up**: Create new account with email/password
- **Sign In**: Login with existing credentials
- **Error Handling**: Comprehensive error messages for various scenarios
- **Auto-logout**: Secure session management

### Task Management

- **Create Tasks**: Add tasks with title, description, due date, and priority
- **Edit Tasks**: Modify existing tasks
- **Delete Tasks**: Remove tasks with confirmation
- **Complete Tasks**: Mark tasks as done/undone
- **Priority Levels**: Low (green), Medium (blue), High (red)

### Advanced Features

- **Filtering**: Filter by priority (all/high/medium/low) and status (all/active/completed)
- **Sorting**: Automatic sorting by due date (earliest first)
- **Overdue Detection**: Visual indicators for overdue tasks
- **Real-time Sync**: Changes sync across devices instantly
- **Modern UI**: Clean, intuitive interface with proper spacing and colors

### Data Structure

Each task contains:

```typescript
{
  id: string; // Unique identifier
  title: string; // Task title
  description: string; // Detailed description
  completed: boolean; // Completion status
  priority: "low" | "medium" | "high"; // Priority level
  dueDate: Date; // When task is due
  createdAt: Date; // When task was created
  updatedAt: Date; // Last modification
  userId: string; // Owner's user ID
}
```

## Troubleshooting

### Common Issues

#### Firebase Connection Error

- Verify your Firebase configuration in `firebaseConfig.ts`
- Ensure Firestore is created and security rules are set
- Check that Authentication is enabled

#### Dependency Conflicts

- Run `npm install --legacy-peer-deps` if you encounter peer dependency issues
- Clear npm cache: `npm cache clean --force`

#### Expo Build Issues

- Clear Expo cache: `npx expo start --clear`
- Restart Metro bundler if needed

#### Authentication Issues

- Verify email/password authentication is enabled in Firebase Console
- Check error messages in app for specific authentication errors

### Support

If you encounter issues:

1. Check the error messages in the console
2. Verify all Firebase settings
3. Ensure all dependencies are properly installed

## Project Structure

```
MyTasks/
├── components/          # Reusable UI components
│   ├── TaskForm.tsx    # Task creation/editing form
│   └── TaskFilters.tsx # Filtering component
├── screens/            # Main screens
│   ├── LoginScreen.tsx # Authentication login
│   └── RegisterScreen.tsx # User registration
├── services/           # Business logic
│   └── taskService.ts  # Firestore operations
├── types/              # TypeScript definitions
│   └── Task.ts         # Task and filter interfaces
├── firebaseConfig.ts   # Firebase configuration
├── App.tsx            # Main app component
└── package.json       # Dependencies
```

## Next Steps

- Customize the UI colors and styling to match your preferences
- Add push notifications for due date reminders
- Implement task categories or tags
- Add file attachments to tasks
- Create team collaboration features

Happy task managing! 🚀
