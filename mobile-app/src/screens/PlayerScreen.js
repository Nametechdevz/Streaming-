import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Dimensions, StatusBar, SafeAreaView, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { streamService } from '../services/api';
import theme from '../utils/theme';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen({ route }) {
  const navigation = useNavigation();
  const { title, channelId, movieId, seriesId, episodeId, type } = route.params;
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const controlsTimer = useRef(null);

  useEffect(() => {
    loadStreamUrl();
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  const loadStreamUrl = async () => {
    try {
      let data;
      if (type === 'live') data = await streamService.liveStreamUrl(channelId);
      else if (type === 'movie') data = await streamService.movieStreamUrl(movieId);
      else data = await streamService.seriesEpisodeUrl(seriesId, episodeId);
      setStreamUrl(data.url);
      setLoading(false);
    } catch (err) {
      setError(err?.error || 'Failed to load stream');
      setLoading(false);
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setControlsVisible(false), 4000);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar hidden />
        <ActivityIndicator color={theme.colors.accent} size="large" />
        <Text style={styles.loadingText}>Loading stream...</Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar hidden />
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Stream Error</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadStreamUrl}>
          <Text style={styles.retryText}>🔄 Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Video Player Placeholder - In real app use react-native-video */}
      <TouchableOpacity
        style={styles.videoArea}
        onPress={showControls}
        activeOpacity={1}
      >
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoPlaceholderIcon}>📺</Text>
          <Text style={styles.videoPlaceholderText}>Stream Ready</Text>
          <Text style={styles.videoUrl} numberOfLines={2}>{streamUrl}</Text>
          <Text style={styles.videoNote}>
            Integration with react-native-video:{'\n'}
            {'<Video source={{ uri: streamUrl }} ... />'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Controls overlay */}
      {controlsVisible && (
        <View style={styles.controls}>
          {/* Top bar */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.streamTitle} numberOfLines={1}>{title}</Text>
            {type === 'live' && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>● LIVE</Text>
              </View>
            )}
          </View>

          {/* Center controls */}
          <View style={styles.centerControls}>
            <TouchableOpacity style={styles.controlBtn}>
              <Text style={styles.controlBtnText}>⏮</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playPauseBtn}
              onPress={() => setPaused(!paused)}
            >
              <Text style={styles.playPauseBtnText}>{paused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn}>
              <Text style={styles.controlBtnText}>⏭</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom bar */}
          <View style={styles.bottomControls}>
            {type !== 'live' && (
              <>
                <Text style={styles.timeText}>{formatTime(progress)}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${duration > 0 ? (progress / duration) * 100 : 0}%` }]} />
                </View>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </>
            )}
            <TouchableOpacity style={styles.fullscreenBtn}>
              <Text style={styles.controlBtnText}>⛶</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16
  },
  loadingText: { color: 'white', fontSize: 14 },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32
  },
  errorIcon: { fontSize: 48 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: 'white' },
  errorMsg: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center' },
  retryBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8
  },
  retryText: { color: 'white', fontSize: 14, fontWeight: '600' },
  cancelBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12
  },
  cancelText: { color: theme.colors.textSecondary, fontSize: 14 },
  videoArea: {
    flex: 1,
    backgroundColor: '#000'
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  videoPlaceholderIcon: { fontSize: 64, marginBottom: 16 },
  videoPlaceholderText: { fontSize: 18, color: 'white', fontWeight: '700', marginBottom: 8 },
  videoUrl: {
    fontSize: 11,
    color: theme.colors.accent,
    textAlign: 'center',
    backgroundColor: 'rgba(229,9,20,0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontFamily: 'monospace'
  },
  videoNote: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'monospace'
  },
  controls: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between'
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  backBtnText: { color: 'white', fontSize: 18 },
  streamTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: 'white'
  },
  liveBadge: {
    backgroundColor: theme.colors.accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  liveBadgeText: { color: 'white', fontSize: 10, fontWeight: '800' },
  centerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32
  },
  controlBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  controlBtnText: { fontSize: 24, color: 'white' },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(229,9,20,0.8)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  playPauseBtnText: { fontSize: 28, color: 'white' },
  bottomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8
  },
  timeText: { fontSize: 12, color: 'white', fontWeight: '600', minWidth: 40 },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent
  },
  fullscreenBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
