import React, { useEffect, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, Animated
} from 'react-native';
import theme from '../utils/theme';

const { width } = Dimensions.get('window');

export default function HeroBanner({ item, onPlay, onInfo }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [item]);

  if (!item) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Image
        source={{ uri: item.streamIcon || item.cover || item.backdropPath?.[0] }}
        style={styles.backdrop}
        resizeMode="cover"
      />
      {/* Dark overlay */}
      <View style={styles.overlay} />
      <View style={styles.bottomGradient} />

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.genre || item.streamType || 'Featured'}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
        {item.plot && (
          <Text style={styles.description} numberOfLines={3}>{item.plot}</Text>
        )}
        {item.rating && (
          <Text style={styles.rating}>⭐ {item.rating}</Text>
        )}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.playBtn} onPress={() => onPlay(item)} activeOpacity={0.85}>
            <Text style={styles.playBtnText}>▶  Play</Text>
          </TouchableOpacity>
          {onInfo && (
            <TouchableOpacity style={styles.infoBtn} onPress={() => onInfo(item)} activeOpacity={0.85}>
              <Text style={styles.infoBtnText}>ℹ  Info</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width,
    height: 320,
    position: 'relative'
  },
  backdrop: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.4)'
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(10,10,15,0)',
    // In real app, use LinearGradient from react-native-linear-gradient
  },
  content: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20
  },
  badge: {
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.8
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8
  },
  description: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
    marginBottom: 8
  },
  rating: {
    fontSize: 12,
    color: '#f6ad55',
    fontWeight: '600',
    marginBottom: 16
  },
  actions: {
    flexDirection: 'row',
    gap: 10
  },
  playBtn: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  playBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000'
  },
  infoBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)'
  },
  infoBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white'
  }
});
