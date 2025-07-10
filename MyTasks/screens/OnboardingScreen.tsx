import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface OnboardingPageProps {
  title: string;
  description: string;
  illustration: string;
  backgroundColor: [string, string, string];
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({
  title,
  description,
  illustration,
  backgroundColor,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  return (
    <LinearGradient
      colors={backgroundColor}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.page}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustration}>{illustration}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const pages: OnboardingPageProps[] = [
    {
      title: "Organize Your Tasks",
      description:
        "Keep track of everything you need to do with our intuitive task management system.",
      illustration: "📝",
      backgroundColor: ["#8b5cf6", "#a855f7", "#c084fc"] as [
        string,
        string,
        string
      ],
    },
    {
      title: "Stay Productive",
      description:
        "Set priorities, due dates, and get reminders to stay on top of your goals.",
      illustration: "🎯",
      backgroundColor: ["#06b6d4", "#0891b2", "#0e7490"] as [
        string,
        string,
        string
      ],
    },
    {
      title: "Track Your Progress",
      description:
        "Visualize your productivity with beautiful charts and insights.",
      illustration: "📊",
      backgroundColor: ["#10b981", "#059669", "#047857"] as [
        string,
        string,
        string
      ],
    },
    {
      title: "Achieve Your Goals",
      description: "Turn your dreams into reality, one task at a time.",
      illustration: "🚀",
      backgroundColor: ["#f59e0b", "#d97706", "#b45309"] as [
        string,
        string,
        string
      ],
    },
  ];

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      scrollViewRef.current?.scrollTo({
        x: nextPage * width,
        animated: true,
      });

      Animated.timing(indicatorAnim, {
        toValue: nextPage,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePageChange = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(pageIndex);

    Animated.timing(indicatorAnim, {
      toValue: pageIndex,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handlePageChange}
        style={styles.scrollView}
      >
        {pages.map((page, index) => (
          <OnboardingPage
            key={index}
            title={page.title}
            description={page.description}
            illustration={page.illustration}
            backgroundColor={page.backgroundColor}
          />
        ))}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Page Indicators */}
        <View style={styles.indicatorContainer}>
          {pages.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentPage === index && styles.activeIndicator,
              ]}
            />
          ))}
          <Animated.View
            style={[
              styles.indicatorProgress,
              {
                left: indicatorAnim.interpolate({
                  inputRange: [0, pages.length - 1],
                  outputRange: [0, (pages.length - 1) * 24],
                }),
              },
            ]}
          />
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={pages[currentPage].backgroundColor}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentPage === pages.length - 1 ? "Get Started" : "Next"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
  page: {
    width,
    height: height - 200,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  illustrationContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  illustration: {
    fontSize: 80,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  textContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: -0.8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 26,
    fontWeight: "500",
    letterSpacing: 0.3,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  controls: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  indicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "#8b5cf6",
  },
  indicatorProgress: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#8b5cf6",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
  },
  nextButton: {
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default OnboardingScreen;
