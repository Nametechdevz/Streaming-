import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../utils/theme';

export function MovieCard({ item, onPress, width = 140 }) {
  const height = width * 1.5;
  return (
    <TouchableOpacity style={[styles.card, { width }]} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={[styles.imageContainer, { height }]}>
        <Image
          source={{ uri: item.streamIcon || item.cover }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.gradient} />
        {item.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
      {item.year && <Text style={styles.year}>{item.year}</Text>}
    </TouchableOpacity>
  );
}

export function LiveChannelCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.liveCard} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={styles.liveThumb}>
        <Image
          source={{ uri: item.streamIcon }}
          style={styles.liveIcon}
          resizeMode="contain"
        />
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>● LIVE</Text>
        </View>
      </View>
      <View style={styles.liveInfo}>
        <Text style={styles.liveName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.liveNum}>CH {item.num}</Text>
      </View>
    </TouchableOpacity>
  );
}

export function SeriesCard({ item, onPress, width = 140 }) {
  const height = width * 1.5;
  return (
    <TouchableOpacity style={[styles.card, { width }]} onPress={() => onPress(item)} activeOpacity={0.85}>
      <View style={[styles.imageContainer, { height }]}>
        <Image
          source={{ uri: item.cover }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.gradient} />
        {item.rating && (
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.year}>{item.genre}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginRight: 12
  },
  imageContainer: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    marginBottom: 8
  },
  image: {
    width: '100%',
    height: '100%'
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent'
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  ratingText: {
    fontSize: 10,
    color: '#f6ad55',
    fontWeight: '700'
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2
  },
  year: {
    fontSize: 11,
    color: theme.colors.textMuted
  },

  // Live channel
  liveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  liveThumb: {
    width: 72,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    position: 'relative'
  },
  liveIcon: {
    width: 60,
    height: 40
  },
  liveBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: theme.colors.accent,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1
  },
  liveBadgeText: {
    fontSize: 7,
    color: 'white',
    fontWeight: '800'
  },
  liveInfo: { flex: 1 },
  liveName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 3
  },
  liveNum: {
    fontSize: 11,
    color: theme.colors.textMuted
  }
});
