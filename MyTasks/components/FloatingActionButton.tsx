import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  text?: string;
  size?: number;
  colors?: [string, string, string];
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = "+",
  text,
  size = 56,
  colors = ["#8b5cf6", "#a855f7", "#c084fc"],
}) => {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, []);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  return (
    <View style={styles.container}>
      {/* Pulse effect background */}
      <Animated.View
        style={[
          styles.pulseBackground,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            transform: [{ scale: pulseValue }],
          },
        ]}
      />

      {/* Main button */}
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.buttonContent,
            {
              transform: [{ scale: scaleValue }, { rotate }],
            },
          ]}
        >
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradient,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          >
            <Text style={[styles.icon, { fontSize: size * 0.4 }]}>{icon}</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Text label (if provided) */}
      {text && (
        <View style={styles.textContainer}>
          <Text style={styles.text}>{text}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pulseBackground: {
    position: "absolute",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
  },
  button: {
    shadowColor: "#8b5cf6",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    color: "#ffffff",
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  textContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
});

export default FloatingActionButton;
