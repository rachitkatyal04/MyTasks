import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebaseConfig";

interface SettingItemProps {
  title: string;
  subtitle?: string;
  icon: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  rightComponent,
  showArrow = true,
}) => {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIcon}>
        <Text style={styles.settingIconText}>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent}
      {showArrow && !rightComponent && (
        <Text style={styles.settingArrow}>›</Text>
      )}
    </TouchableOpacity>
  );
};

const SettingsScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return unsubscribeAuth;
  }, []);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Feature Coming Soon",
              "Account deletion will be available in a future update."
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["#8b5cf6", "#a855f7", "#c084fc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your experience</Text>
        </LinearGradient>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </Text>
              </View>
              <View style={styles.profileDetails}>
                <Text style={styles.profileName}>
                  {user?.displayName || "User"}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              title="Push Notifications"
              subtitle="Get notified about task reminders"
              icon="🔔"
              rightComponent={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: "#e2e8f0", true: "#8b5cf6" }}
                  thumbColor={notifications ? "#ffffff" : "#f4f4f5"}
                />
              }
              showArrow={false}
            />
            <SettingItem
              title="Dark Mode"
              subtitle="Switch to dark theme"
              icon="🌙"
              rightComponent={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: "#e2e8f0", true: "#8b5cf6" }}
                  thumbColor={darkMode ? "#ffffff" : "#f4f4f5"}
                />
              }
              showArrow={false}
            />
            <SettingItem
              title="Auto Sync"
              subtitle="Automatically sync tasks across devices"
              icon="🔄"
              rightComponent={
                <Switch
                  value={autoSync}
                  onValueChange={setAutoSync}
                  trackColor={{ false: "#e2e8f0", true: "#8b5cf6" }}
                  thumbColor={autoSync ? "#ffffff" : "#f4f4f5"}
                />
              }
              showArrow={false}
            />
          </View>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              title="Export Data"
              subtitle="Download your tasks as CSV"
              icon="📋"
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Data export will be available soon."
                )
              }
            />
            <SettingItem
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              icon="🛡️"
              onPress={() =>
                Alert.alert(
                  "Privacy Policy",
                  "Your privacy is important to us. We collect minimal data and never share it with third parties."
                )
              }
            />
            <SettingItem
              title="Terms of Service"
              subtitle="Read our terms of service"
              icon="📄"
              onPress={() =>
                Alert.alert(
                  "Terms of Service",
                  "By using MyTasks, you agree to our terms of service."
                )
              }
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              title="Help Center"
              subtitle="Get help and support"
              icon="❓"
              onPress={() =>
                Alert.alert(
                  "Help Center",
                  "Need help? Contact us at support@mytasks.com"
                )
              }
            />
            <SettingItem
              title="Send Feedback"
              subtitle="Share your thoughts with us"
              icon="💬"
              onPress={() =>
                Alert.alert(
                  "Feedback",
                  "We'd love to hear from you! Send feedback to feedback@mytasks.com"
                )
              }
            />
            <SettingItem
              title="Rate MyTasks"
              subtitle="Rate us in the app store"
              icon="⭐"
              onPress={() =>
                Alert.alert(
                  "Rate MyTasks",
                  "Thank you for considering rating our app!"
                )
              }
            />
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingsGroup}>
            <SettingItem
              title="Sign Out"
              subtitle="Sign out of your account"
              icon="🚪"
              onPress={handleSignOut}
            />
            <SettingItem
              title="Delete Account"
              subtitle="Permanently delete your account"
              icon="🗑️"
              onPress={handleDeleteAccount}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>MyTasks v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>
            Made with ❤️ for productivity
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafb",
  },
  scrollView: {
    flex: 1,
  },
  gradientHeader: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  settingsGroup: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingIcon: {
    marginRight: 16,
  },
  settingIconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  settingArrow: {
    fontSize: 20,
    color: "#94a3b8",
    fontWeight: "300",
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 32,
  },
  appInfoText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  bottomPadding: {
    height: 50,
  },
});

export default SettingsScreen;
