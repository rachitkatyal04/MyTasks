import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationComplete }) => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(50)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const circleScale = useRef(new Animated.Value(0)).current;
  const particleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      // Background circles appear
      Animated.timing(circleScale, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),

      // Logo appears with bounce
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // Title slides up
      Animated.parallel([
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // Subtitle fades in
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      // Particles appear
      Animated.timing(particleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),

      // Hold for a moment
      Animated.delay(800),
    ]);

    animationSequence.start(() => {
      onAnimationComplete();
    });

    // Continuous floating animation for logo
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    setTimeout(() => {
      floatingAnimation.start();
    }, 1400);

    return () => {
      animationSequence.stop();
      floatingAnimation.stop();
    };
  }, []);

  const renderParticles = () => {
    const particles = [];
    for (let i = 0; i < 8; i++) {
      const randomX = Math.random() * width;
      const randomY = Math.random() * height;
      const randomSize = Math.random() * 4 + 2;

      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              left: randomX,
              top: randomY,
              width: randomSize,
              height: randomSize,
              opacity: particleOpacity,
            },
          ]}
        />
      );
    }
    return particles;
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#8b5cf6", "#a855f7", "#c084fc", "#e879f9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Background circles */}
        <Animated.View
          style={[
            styles.backgroundCircle,
            styles.circle1,
            {
              transform: [{ scale: circleScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundCircle,
            styles.circle2,
            {
              transform: [{ scale: circleScale }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.backgroundCircle,
            styles.circle3,
            {
              transform: [{ scale: circleScale }],
            },
          ]}
        />

        {/* Floating particles */}
        {renderParticles()}

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
                opacity: logoOpacity,
              },
            ]}
          >
            <View style={styles.logo}>
              <Text style={styles.logoText}>✓</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                transform: [{ translateY: titleTranslateY }],
                opacity: titleOpacity,
              },
            ]}
          >
            <Text style={styles.title}>MyTasks</Text>
          </Animated.View>

          {/* Subtitle */}
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: subtitleOpacity,
              },
            ]}
          >
            Organize your life, one task at a time
          </Animated.Text>
        </View>

        {/* Loading indicator */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  opacity: subtitleOpacity,
                },
              ]}
            />
          </View>
          <Animated.Text
            style={[
              styles.loadingText,
              {
                opacity: subtitleOpacity,
              },
            ]}
          >
            Loading your workspace...
          </Animated.Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backgroundCircle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 1000,
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: height * 0.3,
    left: -75,
  },
  particle: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 10,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 60,
    color: "#ffffff",
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  titleContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -1.5,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 80,
    alignItems: "center",
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  loadingProgress: {
    height: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 2,
    width: "100%",
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});

export default SplashScreen;
