import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { streamService, categoryService } from '../services/api';
import { LiveChannelCard } from '../components/ContentCard';
import theme from '../utils/theme';

export default function LiveTVScreen() {
  const navigation = useNavigation();
  const [channels, setChannels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    Promise.all([
      streamService.liveChannels(),
      categoryService.list('live')
    ]).then(([streamData, cats]) => {
      setChannels(streamData.streams || []);
      setCategories([{ id: '', name: 'All', icon: '📺' }, ...cats]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = channels.filter(ch => {
    const matchSearch = ch.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || ch.categoryId === activeCategory;
    return matchSearch && matchCat;
  });

  const handlePlay = async (channel) => {
    navigation.navigate('Player', {
      title: channel.name,
      channelId: channel.id,
      type: 'live'
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
          <Text style={styles.loadingText}>Loading channels...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live TV</Text>
        <Text style={styles.headerCount}>{channels.length} channels</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search channels..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, activeCategory === cat.id && styles.catChipActive]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Text style={styles.catChipIcon}>{cat.icon}</Text>
            <Text style={[styles.catChipText, activeCategory === cat.id && styles.catChipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Channel list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <LiveChannelCard item={item} onPress={handlePlay} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyTitle}>No channels found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { color: theme.colors.textMuted, fontSize: 14 },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: theme.colors.text },
  headerCount: { fontSize: 13, color: theme.colors.textMuted, marginLeft: 2 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12,
    height: 46
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 14 },
  clearBtn: { color: theme.colors.textMuted, fontSize: 14, padding: 4 },
  categoriesContainer: { marginBottom: 12 },
  categoriesContent: { paddingHorizontal: 20, gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  catChipActive: {
    backgroundColor: 'rgba(229,9,20,0.15)',
    borderColor: theme.colors.accent
  },
  catChipIcon: { fontSize: 13 },
  catChipText: { fontSize: 12, fontWeight: '500', color: theme.colors.textSecondary },
  catChipTextActive: { color: theme.colors.accent, fontWeight: '700' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: theme.colors.textSecondary, fontWeight: '600' }
});
