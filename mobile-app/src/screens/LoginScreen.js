import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Animated, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import theme from '../utils/theme';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const btnScale = useRef(new Animated.Value(1)).current;

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onPressIn = () => Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Background decoration */}
      <View style={styles.bgGlow} />
      <View style={styles.bgGrid} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>📺</Text>
          </View>
          <Text style={styles.appTitle}>IPTV Stream</Text>
          <Text style={styles.appSubtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor={theme.colors.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={theme.colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Text>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginBtnText}>🔐  Sign In</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Features preview */}
        <View style={styles.features}>
          {[
            { icon: '📡', text: 'Live TV' },
            { icon: '🎬', text: 'Movies' },
            { icon: '🎭', text: 'Series' }
          ].map((f, i) => (
            <View key={i} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  bgGlow: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(229,9,20,0.06)'
  },
  bgGrid: {
    position: 'absolute',
    inset: 0
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center'
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8
  },
  logoEmoji: { fontSize: 38 },
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -1,
    marginBottom: 6
  },
  appSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted
  },
  form: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14
  },
  eyeBtn: { padding: 4 },
  loginBtn: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24
  },
  featureItem: { alignItems: 'center', gap: 4 },
  featureIcon: { fontSize: 24 },
  featureText: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '500' }
});
