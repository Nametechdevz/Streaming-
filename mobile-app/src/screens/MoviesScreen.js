import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, SafeAreaView, ScrollView, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { streamService, categoryService } from '../services/api';
import { MovieCard } from '../components/ContentCard';
import HeroBanner from '../components/HeroBanner';
import theme from '../utils/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 20 * 2 - 12 * 2) / 3;

export default function MoviesScreen() {
  const navigation = useNavigation();
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [heroMovie, setHeroMovie] = useState(null);

  useEffect(() => {
    Promise.all([
      streamService.movies(),
      categoryService.list('movie')
    ]).then(([data, cats]) => {
      const movieList = data.movies || [];
      setMovies(movieList);
      setHeroMovie(movieList[Math.floor(Math.random() * Math.min(5, movieList.length))]);
      setCategories([{ id: '', name: 'All', icon: '🎬' }, ...cats]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = movies.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || m.categoryId === activeCategory;
    return matchSearch && matchCat;
  });

  const handlePress = (movie) => {
    navigation.navigate('MovieDetail', { movie });
  };

  const handlePlay = (movie) => {
    navigation.navigate('Player', { title: movie.name, movieId: movie.id, type: 'movie' });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <MovieCard item={item} onPress={handlePress} width={CARD_WIDTH} />
        )}
        ListHeaderComponent={
          <>
            {/* Hero Banner */}
            {heroMovie && !search && !activeCategory && (
              <HeroBanner
                item={heroMovie}
                onPlay={handlePlay}
                onInfo={handlePress}
              />
            )}

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Movies</Text>
              <Text style={styles.headerCount}>{movies.length} titles</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search movies..."
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

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catsContent}
              style={styles.catsScroll}
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
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎬</Text>
            <Text style={styles.emptyTitle}>No movies found</Text>
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
  headerCount: { fontSize: 13, color: theme.colors.textMuted },
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
  catsScroll: { marginBottom: 16 },
  catsContent: { paddingHorizontal: 20, gap: 8 },
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
  listContent: { paddingBottom: 30 },
  row: { paddingHorizontal: 20, justifyContent: 'flex-start', gap: 12, marginBottom: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: theme.colors.textSecondary, fontWeight: '600' }
});
