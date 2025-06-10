# 📋 MyTasks - Smart Task Management App

**Developed by:** Rachit Katyal😎

## 📱 About MyTasks

MyTasks is a modern, feature-rich task management application built with React Native and Expo. The app provides an intuitive interface for managing daily tasks with smart notification reminders and priority-based organization.

### ✨ Key Features

- **Task Management**: Add, edit, delete, and mark tasks as complete
- **Priority Levels**: Organize tasks with High, Medium, and Low priority color coding
- **Smart Notifications**: Customizable reminder intervals (10 seconds, 1 minute, 5 minutes)
- **System Notifications**: Real expo-notifications that appear in your device's notification tray
- **Data Persistence**: Tasks are saved locally using AsyncStorage
- **Modern UI**: Dark theme with beautiful animations and responsive design
- **Mobile Optimized**: Proper spacing to avoid camera/notch overlap on modern phones

## 🚀 Setup Instructions

### Prerequisites

- Node.js (version 14 or higher)
- Expo Go app installed on your mobile device
- Wi-Fi connection (both computer and mobile device on same network)

### Installation Steps

1. **Clone or download the project**

   ```bash
   cd MyTasks
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npx expo start
   ```

4. **Run on your device**
   - Open Expo Go app on your mobile device
   - Scan the QR code displayed in your terminal/browser
   - The app will load automatically

### 📱 Running with Expo Go

1. **Download Expo Go:**

   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Connect to the same Wi-Fi:**

   - Ensure your computer and mobile device are on the same network

3. **Scan QR Code:**

   - Run `npx expo start` in the project directory
   - Scan the QR code with Expo Go (Android) or Camera app (iOS)

4. **Enable Notifications:**
   - When prompted, allow notifications for the best experience
   - Notifications will appear in your device's notification tray at scheduled times

## 💡 Technical Challenges & Design Choices

### 🔔 Notification System Implementation

**Challenge:** Expo-notifications in Expo Go has limitations with scheduled notifications due to SDK 53+ restrictions.

**Solution:** Implemented a hybrid notification system:

- **setTimeout-based scheduling** for precise timing control
- **expo-notifications** for system tray notifications that appear at the exact scheduled time
- **Dual timeout tracking** (system notifications + in-app alerts)
- **Task existence validation** before sending notifications to prevent notifications for deleted tasks

```typescript
// Innovative approach: setTimeout + immediate system notification
const systemNotificationTimeoutId = setTimeout(async () => {
  if (currentTask && !currentTask.completed) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📋 Task Reminder",
        body: `Time to complete: ${task.text}`,
      },
      trigger: null, // Send immediately when timeout fires
    });
  }
}, reminderInterval * 1000);
```

### 🎨 UI/UX Design Decisions

**Challenge:** Modern phones have camera notches and punch-holes that can overlap with UI elements.

**Solution:**

- Added dynamic top padding (`paddingTop: 50`) to the header
- Repositioned notification banners to avoid hardware overlap
- Used SafeAreaView for consistent cross-device compatibility

### 💾 Data Persistence Strategy

**Choice:** AsyncStorage for local data storage

- **Benefit:** Works offline, fast access, no external dependencies
- **Implementation:** Automatic save/load with React hooks
- **Data integrity:** JSON serialization with proper error handling

### 🔄 State Management Approach

**Design Choice:** React hooks over Redux for this project size

- **useState** for component state
- **useEffect** for lifecycle management
- **Custom state management** for notification tracking
- **Separation of concerns** between UI state and notification timers

### 📱 Cross-Platform Compatibility

**Challenge:** Ensuring consistent behavior across iOS and Android

**Solutions:**

- Platform-specific notification channel setup for Android
- Proper permission handling for both platforms
- Vibration patterns that work on both iOS and Android
- Responsive styling that adapts to different screen sizes

### 🛠️ Performance Optimizations

1. **Efficient Re-renders:** Proper dependency arrays in useEffect hooks
2. **Memory Management:** Cleanup of timeouts and notification listeners
3. **Optimized Storage:** Minimal data persistence with automatic cleanup
4. **Lazy Loading:** FlatList for efficient task rendering

## 📁 Project Structure

```
MyTasks/
├── App.tsx                 # Main application component
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── assets/               # App icons and images
└── README.md            # This file
```

## 🔧 Dependencies

- **expo**: Framework for React Native development
- **expo-notifications**: Local notification system
- **expo-device**: Device information access
- **expo-constants**: App constants and configuration
- **@react-native-async-storage/async-storage**: Local data storage
- **react-native**: Core React Native framework

## 🎯 Future Enhancements

- [ ] Task categories and filtering
- [ ] Due dates and calendar integration
- [ ] Recurring task support
- [ ] Task sharing capabilities
- [ ] Dark/light theme toggle
- [ ] Export/import functionality

## 📄 License

This project is open source and available under the MIT License.

---

**Note:** This app is optimized for Expo Go and provides full functionality including system notifications without requiring a development build. The notification system has been carefully designed to work within Expo Go's limitations while providing a native-like experience.
