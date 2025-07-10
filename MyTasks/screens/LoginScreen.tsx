import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

interface LoginScreenProps {
  onShowRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onShowRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation will be handled by App.tsx based on auth state
    } catch (error: any) {
      let errorMessage = "An error occurred during login";

      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
          errorMessage =
            "Invalid credentials. Please check your email and password";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your connection";
          break;
        default:
          // For any other authentication errors, show generic invalid credentials message
          if (error.code && error.code.startsWith("auth/")) {
            errorMessage =
              "Invalid credentials. Please check your email and password";
          } else {
            errorMessage = error.message || "Login failed";
          }
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    onShowRegister();
  };

  return (
    <LinearGradient
      colors={["#8b5cf6", "#a855f7", "#c084fc"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>Sign in to manage your tasks</Text>
          </View>

          <View style={styles.formContainer}>
            <TextInput
              style={[
                styles.input,
                focusedInput === "email" && styles.inputFocused,
              ]}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />

            <TextInput
              style={[
                styles.input,
                focusedInput === "password" && styles.inputFocused,
              ]}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={navigateToRegister}
            >
              <Text style={styles.linkText}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 32,
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  checkIcon: {
    fontSize: 32,
    color: "#ffffff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    lineHeight: 24,
  },
  formContainer: {
    paddingHorizontal: 32,
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    borderRadius: 24,
    paddingVertical: 32,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  input: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontWeight: "500",
    color: "#1e293b",
  },
  inputFocused: {
    borderColor: "#8b5cf6",
    backgroundColor: "#ffffff",
  },
  button: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#8b5cf6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkText: {
    color: "#8b5cf6",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },
});

export default LoginScreen;
