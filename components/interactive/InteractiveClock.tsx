import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, PanResponder, GestureResponderEvent } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '@/theme';

interface InteractiveClockProps {
  value: string;              // "HH:MM" format, e.g., "03:30"
  onChange: (time: string) => void;
  size?: number;
  disabled?: boolean;
}

const CLOCK_SIZE = 220;
const CENTER = CLOCK_SIZE / 2;
const HOUR_HAND_LENGTH = 50;
const MINUTE_HAND_LENGTH = 72;

function angleToTime(angle: number, isHour: boolean): number {
  // Convert angle (0 = 12 o'clock, clockwise) to hour or minute
  let normalized = ((angle % 360) + 360) % 360;
  if (isHour) {
    return Math.round(normalized / 30) % 12; // 360/12 = 30 degrees per hour
  }
  return Math.round(normalized / 6) % 60; // 360/60 = 6 degrees per minute
}

function timeToAngle(value: number, isHour: boolean): number {
  if (isHour) {
    return (value % 12) * 30; // 30 degrees per hour
  }
  return value * 6; // 6 degrees per minute
}

function getAngleFromCenter(x: number, y: number): number {
  const dx = x - CENTER;
  const dy = -(y - CENTER); // Invert Y for math coords
  let angle = Math.atan2(dx, dy) * (180 / Math.PI);
  return ((angle % 360) + 360) % 360;
}

export function InteractiveClock({ value, onChange, size, disabled }: InteractiveClockProps) {
  const clockSize = size || CLOCK_SIZE;
  const center = clockSize / 2;
  const hourLen = clockSize * 0.23;
  const minuteLen = clockSize * 0.33;

  const [dragging, setDragging] = useState<'hour' | 'minute' | null>(null);
  const layoutRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Parse current value
  const parts = value.split(':');
  let hours = parseInt(parts[0]) || 0;
  let minutes = parseInt(parts[1]) || 0;

  const hourAngle = timeToAngle(hours, true) + (minutes / 60) * 30; // Hour hand moves with minutes
  const minuteAngle = timeToAngle(minutes, false);

  const getHandEndpoint = (angle: number, length: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + Math.cos(rad) * length,
      y: center + Math.sin(rad) * length,
    };
  };

  const hourEnd = getHandEndpoint(hourAngle, hourLen);
  const minuteEnd = getHandEndpoint(minuteAngle, minuteLen);

  const handleTouch = useCallback((evt: GestureResponderEvent, gestureType: 'start' | 'move') => {
    if (disabled) return;
    const { locationX, locationY } = evt.nativeEvent;
    const angle = getAngleFromCenter(locationX * (CLOCK_SIZE / clockSize), locationY * (CLOCK_SIZE / clockSize));

    if (gestureType === 'start') {
      // Determine which hand is closer to touch point
      const touchDx = locationX - center;
      const touchDy = locationY - center;
      const dist = Math.sqrt(touchDx * touchDx + touchDy * touchDy);

      // If close to center, pick hour hand; further out, pick minute hand
      if (dist < clockSize * 0.28) {
        setDragging('hour');
      } else {
        setDragging('minute');
      }
    }

    if (dragging === 'hour' || (gestureType === 'start' && !dragging)) {
      const isHourDrag = dragging === 'hour' || (gestureType === 'start');
      if (isHourDrag && gestureType === 'start') {
        const touchDx = locationX - center;
        const touchDy = locationY - center;
        const dist = Math.sqrt(touchDx * touchDx + touchDy * touchDy);
        if (dist >= clockSize * 0.28) {
          // Actually minute hand
          const newMinutes = angleToTime(angle, false);
          onChange(`${String(hours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
          setDragging('minute');
          return;
        }
      }
      const newHours = angleToTime(angle, true);
      onChange(`${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    } else if (dragging === 'minute') {
      const newMinutes = angleToTime(angle, false);
      onChange(`${String(hours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`);
    }
  }, [dragging, hours, minutes, onChange, disabled, clockSize, center]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt) => handleTouch(evt, 'start'),
      onPanResponderMove: (evt) => handleTouch(evt, 'move'),
      onPanResponderRelease: () => setDragging(null),
    })
  ).current;

  // Generate hour markers
  const hourMarkers = [];
  for (let i = 1; i <= 12; i++) {
    const markerAngle = i * 30;
    const rad = (markerAngle - 90) * (Math.PI / 180);
    const markerRadius = clockSize * 0.40;
    const x = center + Math.cos(rad) * markerRadius;
    const y = center + Math.sin(rad) * markerRadius;
    hourMarkers.push(
      <Text
        key={i}
        style={[styles.hourNumber, {
          left: x - 10,
          top: y - 10,
          width: 20,
          height: 20,
          fontSize: clockSize < 200 ? 12 : 14,
        }]}
      >
        {i}
      </Text>
    );
  }

  // Minute tick marks
  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const tickAngle = i * 6;
    const rad = (tickAngle - 90) * (Math.PI / 180);
    const isHourTick = i % 5 === 0;
    const outerR = clockSize * 0.46;
    const innerR = isHourTick ? clockSize * 0.42 : clockSize * 0.44;
    ticks.push(
      <View
        key={`tick-${i}`}
        style={[styles.tick, {
          left: center + Math.cos(rad) * innerR,
          top: center + Math.sin(rad) * innerR,
          width: isHourTick ? 2 : 1,
          height: (outerR - innerR),
          transform: [{ rotate: `${tickAngle}deg` }],
          backgroundColor: isHourTick ? colors.textPrimary : colors.textTertiary,
        }]}
      />
    );
  }

  // Format display time
  const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayTime = `${displayHour}:${String(minutes).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <View
        style={[styles.clockFace, { width: clockSize, height: clockSize, borderRadius: clockSize / 2 }]}
        {...panResponder.panHandlers}
      >
        {/* Tick marks */}
        {ticks}

        {/* Hour numbers */}
        {hourMarkers}

        {/* Hour hand */}
        <View
          style={[styles.hand, styles.hourHand, {
            left: center - 3,
            top: center,
            width: 6,
            height: hourLen,
            transform: [
              { translateY: -hourLen },
              { rotate: `${hourAngle}deg` },
            ],
            transformOrigin: 'bottom',
          }]}
        />

        {/* Minute hand */}
        <View
          style={[styles.hand, styles.minuteHand, {
            left: center - 2,
            top: center,
            width: 4,
            height: minuteLen,
            transform: [
              { translateY: -minuteLen },
              { rotate: `${minuteAngle}deg` },
            ],
            transformOrigin: 'bottom',
          }]}
        />

        {/* Center dot */}
        <View style={[styles.centerDot, { left: center - 6, top: center - 6 }]} />
      </View>

      {/* Digital display */}
      <View style={styles.digitalDisplay}>
        <Text style={styles.digitalTime}>{displayTime}</Text>
        {!disabled && (
          <Text style={styles.dragHint}>Drag the hands to set the time</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  clockFace: {
    backgroundColor: '#FFFDF7',
    borderWidth: 4,
    borderColor: colors.violet400,
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  hourNumber: {
    position: 'absolute',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tick: {
    position: 'absolute',
  },
  hand: {
    position: 'absolute',
    borderRadius: 3,
  },
  hourHand: {
    backgroundColor: colors.textPrimary,
    zIndex: 2,
  },
  minuteHand: {
    backgroundColor: colors.coral500,
    zIndex: 3,
  },
  centerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.coral500,
    zIndex: 4,
  },
  digitalDisplay: {
    marginTop: 12,
    alignItems: 'center',
  },
  digitalTime: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  dragHint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
});
