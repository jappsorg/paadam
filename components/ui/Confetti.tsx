import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { colors } from "@/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

const CONFETTI_COLORS = [
  colors.primary,
  colors.success,
  colors.secondary,
  colors.coral400,
  colors.orange400,
  colors.blue400,
];

const NUM_PIECES = 30;

interface ConfettiPieceProps {
  index: number;
  trigger: boolean;
}

function ConfettiPiece({ index, trigger }: ConfettiPieceProps) {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(SCREEN_WIDTH / 2);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (!trigger) return;

    const targetX = Math.random() * SCREEN_WIDTH;
    const targetY = SCREEN_HEIGHT * (0.3 + Math.random() * 0.5);
    const delay = index * 40;

    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(1200, withTiming(0, { duration: 400 }))
      )
    );
    translateX.value = withDelay(
      delay,
      withTiming(targetX, {
        duration: 1400,
        easing: Easing.out(Easing.quad),
      })
    );
    translateY.value = withDelay(
      delay,
      withTiming(targetY, {
        duration: 1400,
        easing: Easing.in(Easing.quad),
      })
    );
    rotate.value = withDelay(
      delay,
      withTiming(360 * (1 + Math.random() * 2), {
        duration: 1400,
      })
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(800, withTiming(0.3, { duration: 400 }))
      )
    );
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = 8 + Math.random() * 8;
  const isCircle = index % 3 === 0;

  return (
    <Animated.View
      style={[
        styles.piece,
        animatedStyle,
        {
          backgroundColor: color,
          width: size,
          height: isCircle ? size : size * 0.6,
          borderRadius: isCircle ? size / 2 : 2,
        },
      ]}
    />
  );
}

interface ConfettiProps {
  trigger: boolean;
}

export function Confetti({ trigger }: ConfettiProps) {
  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: NUM_PIECES }).map((_, i) => (
        <ConfettiPiece key={i} index={i} trigger={trigger} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  piece: {
    position: "absolute",
  },
});
