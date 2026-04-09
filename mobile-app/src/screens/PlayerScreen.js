import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  Dimensions, StatusBar
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
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
  const [status, setStatus] = useState({});
  const [controlsVisible, setControlsVisible] = useState(true);
  const videoRef = useRef(null);
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
      setError(err?.error || 'No se pudo cargar el stream');
      setLoading(false);
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setControlsVisible(false), 4000);
  };

  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const formatTime = (ms) => {
    const secs = Math.floor(ms / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <StatusBar hidden />
        <ActivityIndicator color={theme.colors.accent} size="large" />
        <Text style={styles.loadingText}>Cargando stream...</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <StatusBar hidden />
        <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
        <Text style={styles.errorTitle}>Error de Stream</Text>
        <Text style={styles.errorMsg}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadStreamUrl}>
          <Text style={styles.retryText}>🔄 Reintentar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = status.positionMillis || 0;
  const duration = status.durationMillis || 0;
  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Video Player con expo-av */}
      <TouchableOpacity style={styles.videoWrapper} onPress={showControls} activeOpacity={1}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: streamUrl }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onPlaybackStatusUpdate={setStatus}
          useNativeControls={false}
        />
      </TouchableOpacity>

      {/* Controles */}
      {controlsVisible && (
        <View style={styles.controls}>
          {/* Top */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
            {type === 'live' && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>● LIVE</Text>
              </View>
            )}
          </View>

          {/* Centro */}
          <View style={styles.centerControls}>
            {type !== 'live' && (
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => videoRef.current?.setPositionAsync(Math.max(0, progress - 10000))}
              >
                <Text style={styles.controlIcon}>⏮ 10s</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlayPause}>
              <Text style={styles.playPauseIcon}>
                {status.isPlaying ? '⏸' : '▶'}
              </Text>
            </TouchableOpacity>
            {type !== 'live' && (
              <TouchableOpacity
                style={styles.skipBtn}
                onPress={() => videoRef.current?.setPositionAsync(progress + 10000)}
              >
                <Text style={styles.controlIcon}>10s ⏭</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom */}
          <View style={styles.bottomBar}>
            {type !== 'live' && duration > 0 && (
              <>
                <Text style={styles.timeText}>{formatTime(progress)}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </>
            )}
            {type === 'live' && (
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                Transmisión en vivo
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  videoWrapper: { flex: 1 },
  video: { width: '100%', height: '100%' },
  centered: {
    flex: 1, backgroundColor: '#0a0a0f',
    alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32
  },
  loadingText: { color: 'white', fontSize: 14 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: 'white' },
  errorMsg: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center' },
  retryBtn: {
    backgroundColor: theme.colors.accent, borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8
  },
  retryText: { color: 'white', fontSize: 14, fontWeight: '600' },
  cancelBtn: { paddingHorizontal: 24, paddingVertical: 12 },
  cancelText: { color: theme.colors.textSecondary, fontSize: 14 },
  controls: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between'
  },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12
  },
  backBtn: {
    width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center'
  },
  backText: { color: 'white', fontSize: 20 },
  titleText: { flex: 1, fontSize: 15, fontWeight: '600', color: 'white' },
  liveBadge: {
    backgroundColor: theme.colors.accent, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3
  },
  liveText: { color: 'white', fontSize: 10, fontWeight: '800' },
  centerControls: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 32
  },
  skipBtn: { padding: 8 },
  controlIcon: { color: 'white', fontSize: 14, fontWeight: '600' },
  playPauseBtn: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: 'rgba(229,9,20,0.85)',
    alignItems: 'center', justifyContent: 'center'
  },
  playPauseIcon: { fontSize: 28, color: 'white' },
  bottomBar: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 8
  },
  timeText: { fontSize: 12, color: 'white', fontWeight: '600', minWidth: 42 },
  progressBar: {
    flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2, overflow: 'hidden'
  },
  progressFill: { height: '100%', backgroundColor: theme.colors.accent }
});
