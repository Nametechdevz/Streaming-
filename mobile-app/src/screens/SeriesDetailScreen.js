import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, SafeAreaView, Dimensions, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { streamService } from '../services/api';
import theme from '../utils/theme';

const { width } = Dimensions.get('window');

export default function SeriesDetailScreen({ route }) {
  const navigation = useNavigation();
  const { seriesId } = route.params;
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);

  useEffect(() => {
    streamService.seriesDetail(seriesId).then(data => {
      setSeries(data);
      const seasons = Object.keys(data.seasons || {});
      if (seasons.length > 0) setSelectedSeason(parseInt(seasons[0]));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [seriesId]);

  const handlePlayEpisode = (episode) => {
    navigation.navigate('Player', {
      title: episode.title,
      seriesId: series.id,
      episodeId: episode.id,
      type: 'series'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!series) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Series not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const seasons = Object.keys(series.seasons || {}).map(Number).sort((a, b) => a - b);
  const episodes = series.seasons[selectedSeason] || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdropContainer}>
          <Image source={{ uri: series.cover }} style={styles.backdrop} resizeMode="cover" />
          <View style={styles.backdropOverlay} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Header info */}
        <View style={styles.mainInfo}>
          <Image source={{ uri: series.cover }} style={styles.poster} resizeMode="cover" />
          <View style={styles.mainInfoText}>
            <Text style={styles.title}>{series.name}</Text>
            {series.rating && (
              <Text style={styles.rating}>⭐ {series.rating}/10</Text>
            )}
            <View style={styles.metaRow}>
              {series.releaseDate && <Text style={styles.metaChip}>{series.releaseDate}</Text>}
              {series.genre && <Text style={styles.metaChip}>{series.genre}</Text>}
              {series.episodeRunTime && <Text style={styles.metaChip}>{series.episodeRunTime} min</Text>}
            </View>
            <Text style={styles.seasonCount}>{seasons.length} Season{seasons.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Plot */}
        {series.plot && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.plot}>{series.plot}</Text>
          </View>
        )}

        {/* Season selector */}
        {seasons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Episodes</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seasonTabsContent}
              style={styles.seasonTabs}
            >
              {seasons.map(season => (
                <TouchableOpacity
                  key={season}
                  style={[styles.seasonTab, selectedSeason === season && styles.seasonTabActive]}
                  onPress={() => setSelectedSeason(season)}
                >
                  <Text style={[styles.seasonTabText, selectedSeason === season && styles.seasonTabTextActive]}>
                    Season {season}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Episodes */}
            <View style={styles.episodeList}>
              {episodes.map((ep, i) => (
                <TouchableOpacity
                  key={ep.id}
                  style={styles.episodeCard}
                  onPress={() => handlePlayEpisode(ep)}
                  activeOpacity={0.85}
                >
                  <View style={styles.episodeThumb}>
                    <Image
                      source={{ uri: ep.info?.movieImage || series.cover }}
                      style={styles.episodeImage}
                      resizeMode="cover"
                    />
                    <View style={styles.episodePlayOverlay}>
                      <Text style={styles.episodePlayIcon}>▶</Text>
                    </View>
                  </View>
                  <View style={styles.episodeInfo}>
                    <Text style={styles.episodeNum}>
                      S{selectedSeason}E{ep.episodeNum}
                    </Text>
                    <Text style={styles.episodeTitle} numberOfLines={2}>{ep.title}</Text>
                    {ep.info?.duration && (
                      <Text style={styles.episodeDuration}>{ep.info.duration}</Text>
                    )}
                    {ep.info?.plot && (
                      <Text style={styles.episodePlot} numberOfLines={2}>{ep.info.plot}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: theme.colors.textSecondary, fontSize: 16 },
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
  title: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 6 },
  rating: { fontSize: 13, color: '#f6ad55', fontWeight: '700', marginBottom: 8 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
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
  seasonCount: { fontSize: 12, color: theme.colors.textMuted },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
  plot: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 },
  seasonTabs: { marginBottom: 16 },
  seasonTabsContent: { gap: 8 },
  seasonTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  seasonTabActive: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    borderColor: theme.colors.accent
  },
  seasonTabText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  seasonTabTextActive: { color: theme.colors.accent },
  episodeList: { gap: 12 },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  episodeThumb: {
    width: 120,
    height: 80,
    position: 'relative'
  },
  episodeImage: { width: '100%', height: '100%' },
  episodePlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  episodePlayIcon: { fontSize: 18, color: 'white' },
  episodeInfo: { flex: 1, padding: 10 },
  episodeNum: { fontSize: 10, color: theme.colors.accent, fontWeight: '700', marginBottom: 3 },
  episodeTitle: { fontSize: 13, fontWeight: '600', color: theme.colors.text, marginBottom: 3 },
  episodeDuration: { fontSize: 11, color: theme.colors.textMuted, marginBottom: 4 },
  episodePlot: { fontSize: 11, color: theme.colors.textMuted, lineHeight: 16 }
});
