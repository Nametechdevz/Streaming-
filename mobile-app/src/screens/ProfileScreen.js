import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Alert
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import theme from '../utils/theme';

const MenuItem = ({ icon, title, subtitle, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Text style={styles.menuIconEmoji}>{icon}</Text>
    </View>
    <View style={styles.menuText}>
      <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>{title}</Text>
      {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [showCredentials, setShowCredentials] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  const expiryDate = user?.expiresAt ? new Date(user.expiresAt).toLocaleDateString() : 'Never';
  const isExpired = user?.expiresAt && new Date(user.expiresAt) < new Date();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email || 'IPTV User'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.maxConnections || 1}</Text>
              <Text style={styles.statLabel}>Connections</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, isExpired && { color: theme.colors.danger }]}>
                {expiryDate}
              </Text>
              <Text style={styles.statLabel}>Expires</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </View>
        </View>

        {/* Xtream Codes credentials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xtream Codes Info</Text>
          <TouchableOpacity
            style={styles.credCard}
            onPress={() => setShowCredentials(!showCredentials)}
          >
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Server</Text>
              <Text style={styles.credValue}>http://localhost:5000</Text>
            </View>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Username</Text>
              <Text style={styles.credValue}>{user?.username}</Text>
            </View>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Password</Text>
              <Text style={styles.credValue}>
                {showCredentials ? '••••••••' : '👁️ Tap to show'}
              </Text>
            </View>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>M3U URL</Text>
              <Text style={styles.credValue} numberOfLines={1}>
                .../get.php?username={user?.username}&password=***&type=m3u_plus
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="🌐"
              title="Server Settings"
              subtitle="Configure IPTV server connection"
            />
            <MenuItem
              icon="📺"
              title="Player Settings"
              subtitle="Video quality and buffer settings"
            />
            <MenuItem
              icon="🔔"
              title="Notifications"
              subtitle="Manage push notifications"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuItem icon="ℹ️" title="About" subtitle="App version 1.0.0" />
            <MenuItem icon="📝" title="Terms of Service" />
            <MenuItem
              icon="🚪"
              title="Sign Out"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        {/* Version */}
        <Text style={styles.version}>IPTV Stream v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: theme.colors.text },
  userCard: {
    margin: 20,
    padding: 24,
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    background: 'linear-gradient(135deg, #e50914, #9b59b6)',
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: 'white' },
  username: { fontSize: 22, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  email: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 20 },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-around'
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '700', color: theme.colors.text, marginBottom: 3 },
  statLabel: { fontSize: 11, color: theme.colors.textMuted },
  statDivider: { width: 1, backgroundColor: theme.colors.border },
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10
  },
  credCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 10
  },
  credRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  credLabel: { fontSize: 12, color: theme.colors.textMuted, fontWeight: '600', width: 80 },
  credValue: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
    textAlign: 'right'
  },
  menuCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuIconDanger: { backgroundColor: 'rgba(229,9,20,0.1)' },
  menuIconEmoji: { fontSize: 17 },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  menuTitleDanger: { color: theme.colors.danger },
  menuSubtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 1 },
  menuArrow: { fontSize: 18, color: theme.colors.textMuted },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: theme.colors.textMuted,
    paddingVertical: 20
  }
});
