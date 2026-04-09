import React from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, SafeAreaView, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../utils/theme';

const { width } = Dimensions.get('window');

export default function MovieDetailScreen({ route }) {
  const navigation = useNavigation();
  const { movie } = route.params;

  const handlePlay = () => {
    navigation.navigate('Player', { title: movie.name, movieId: movie.id, type: 'movie' });
  };

  const InfoRow = ({ label, value }) => value ? (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  ) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdropContainer}>
          <Image
            source={{ uri: movie.streamIcon }}
            style={styles.backdrop}
            resizeMode="cover"
          />
          <View style={styles.backdropOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Poster + basic info */}
        <View style={styles.mainInfo}>
          <Image
            source={{ uri: movie.streamIcon }}
            style={styles.poster}
            resizeMode="cover"
          />
          <View style={styles.mainInfoText}>
            <Text style={styles.title}>{movie.name}</Text>
            {movie.rating && (
              <View style={styles.ratingRow}>
                <Text style={styles.ratingText}>⭐ {movie.rating}/10</Text>
              </View>
            )}
            <View style={styles.metaRow}>
              {movie.year && <Text style={styles.metaChip}>{movie.year}</Text>}
              {movie.duration && <Text style={styles.metaChip}>{movie.duration}</Text>}
              {movie.genre && <Text style={styles.metaChip}>{movie.genre}</Text>}
            </View>
          </View>
        </View>

        {/* Plot */}
        {movie.plot && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.plot}>{movie.plot}</Text>
          </View>
        )}

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Director" value={movie.director} />
            <InfoRow label="Cast" value={movie.cast} />
            <InfoRow label="Genre" value={movie.genre} />
            <InfoRow label="Year" value={movie.year?.toString()} />
            <InfoRow label="Duration" value={movie.duration} />
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.playBtn} onPress={handlePlay} activeOpacity={0.9}>
            <Text style={styles.playBtnText}>▶  Play Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.watchlistBtn} activeOpacity={0.9}>
            <Text style={styles.watchlistBtnText}>＋  Watchlist</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  backdropContainer: { width, height: 200, position: 'relative' },
  backdrop: { width: '100%', height: '100%' },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,15,0.6)'
  },
  backBtn: {
    position: 'absolute',
    top: 16, left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7
  },
  backBtnText: { color: 'white', fontSize: 13, fontWeight: '600' },
  mainInfo: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    marginTop: -50
  },
  poster: {
    width: 110,
    height: 165,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    flexShrink: 0
  },
  mainInfoText: { flex: 1, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
  ratingRow: { flexDirection: 'row', marginBottom: 8 },
  ratingText: { fontSize: 13, color: '#f6ad55', fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.card,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  plot: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 },
  infoCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10
  },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoLabel: { fontSize: 12, color: theme.colors.textMuted, width: 70, fontWeight: '600' },
  infoValue: { fontSize: 13, color: theme.colors.textSecondary, flex: 1 },
  actions: { paddingHorizontal: 20, paddingBottom: 30, gap: 10 },
  playBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  },
  playBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  watchlistBtn: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  watchlistBtnText: { color: theme.colors.text, fontSize: 15, fontWeight: '600' }
});
