import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import theme from '../utils/theme';

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale }], opacity }]}>
        <View style={styles.logoIcon}>
          <Text style={styles.logoEmoji}>📺</Text>
        </View>
        <Text style={styles.logoText}>IPTV Stream</Text>
        <Text style={styles.tagline}>Your Premium Entertainment Hub</Text>
      </Animated.View>
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, i === 1 && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoContainer: { alignItems: 'center' },
  logoIcon: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10
  },
  logoEmoji: { fontSize: 48 },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -1
  },
  tagline: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 8
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 60,
    gap: 8
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border
  },
  dotActive: {
    width: 20,
    backgroundColor: theme.colors.accent
  }
});
