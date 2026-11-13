import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EmptyState from '../components/EmptyState';
import FilterChips from '../components/FilterChips';
import SearchBar from '../components/SearchBar';
import SnippetCard from '../components/SnippetCard';
import UndoSnackbar from '../components/UndoSnackbar';
import PrimaryButton from '../components/PrimaryButton';
import { useSnippets } from '../context/SnippetsContext';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';
import { filterAndSortSnippets } from '../utils/search';

const difficultyOptions = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const sortOptions = ['A–Z', 'Newest', 'Difficulty'];
const initialSheetFilters = { difficulty: 'All', category: 'All', sort: 'A–Z' };

export default function SnippetListScreen({ navigation, route }) {
  const { colors, isDark } = useTheme();
  const { height } = useWindowDimensions();
  const {
    snippets,
    favorites,
    isLoading,
    error,
    refresh,
    recordViewed,
    recentSearches,
    recordSearch,
    clearRecentSearches,
    undoDeletedSnippet,
    toggleFavorite,
    setError,
  } = useSnippets();
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState(route.params?.language || 'All');
  const [difficulty, setDifficulty] = useState('All');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('A–Z');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const [isUndoVisible, setIsUndoVisible] = useState(false);
  const [draftFilters, setDraftFilters] = useState(initialSheetFilters);
  const languages = useMemo(
    () => ['All', ...new Set(snippets.map((snippet) => snippet.language))],
    [snippets],
  );
  const availableCategories = useMemo(
    () => [
      'All',
      ...new Set(
        snippets
          .filter((snippet) => language === 'All' || snippet.language === language)
          .map((snippet) => snippet.category),
      ),
    ],
    [language, snippets],
  );
  const visibleSnippets = useMemo(
    () => filterAndSortSnippets(snippets, { query, language, difficulty, category, sort }),
    [snippets, query, language, difficulty, category, sort],
  );
  const draftVisibleCount = useMemo(
    () => filterAndSortSnippets(snippets, { query, language, ...draftFilters }).length,
    [snippets, query, language, draftFilters],
  );
  const activeFilterCount = Number(difficulty !== 'All') + Number(category !== 'All') + Number(sort !== 'A–Z');
  const summaryParts = [
    language !== 'All' ? language : null,
    difficulty !== 'All' ? difficulty : null,
    category !== 'All' ? category : null,
  ].filter(Boolean);
  const summary = `${visibleSnippets.length} ${visibleSnippets.length === 1 ? 'snippet' : 'snippets'}${
    summaryParts.length ? ` · ${summaryParts.join(' · ')}` : ' · All languages'
  }`;
  const hasActiveFilters = Boolean(
    query.trim() || language !== 'All' || difficulty !== 'All' || category !== 'All' || sort !== 'A–Z',
  );

  useEffect(() => {
    if (route.params?.language) {
      setLanguage(route.params.language);
    }
  }, [route.params?.language]);

  useEffect(() => {
    if (!route.params?.undoToken) return;
    setIsUndoVisible(true);
    navigation.setParams({ undoToken: null });
  }, [navigation, route.params?.undoToken]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const resetFilters = () => {
    setQuery('');
    setLanguage('All');
    setDifficulty('All');
    setCategory('All');
    setSort('A–Z');
    setDraftFilters(initialSheetFilters);
    setIsFilterSheetVisible(false);
  };

  const openFilterSheet = () => {
    setDraftFilters({ difficulty, category, sort });
    setIsFilterSheetVisible(true);
  };

  const applyFilters = () => {
    setDifficulty(draftFilters.difficulty);
    setCategory(draftFilters.category);
    setSort(draftFilters.sort);
    setIsFilterSheetVisible(false);
  };

  const resetSheetFilters = () => {
    setDraftFilters(initialSheetFilters);
  };

  const selectLanguage = (nextLanguage) => {
    setLanguage(nextLanguage);
    if (
      category !== 'All' &&
      !snippets.some((snippet) => snippet.category === category && (nextLanguage === 'All' || snippet.language === nextLanguage))
    ) {
      setCategory('All');
      setDraftFilters((current) => ({ ...current, category: 'All' }));
    }
  };

  const handleToggleFavorite = async (snippetId) => {
    try {
      await toggleFavorite(snippetId);
    } catch (favoriteError) {
      setError(favoriteError.message || 'Could not update this favorite.');
    }
  };

  const handleSearchSubmit = () => {
    recordSearch(query).catch((searchError) => {
      setError(searchError.message || 'Could not save this recent search.');
    });
  };

  const handleClearRecentSearches = () => {
    clearRecentSearches().catch((searchError) => {
      setError(searchError.message || 'Could not clear recent searches.');
    });
  };

  const handleUndoDelete = async () => {
    try {
      const restored = await undoDeletedSnippet();
      if (!restored) {
        setError('This delete can no longer be undone.');
      }
      setIsUndoVisible(false);
    } catch (undoError) {
      setError(undoError.message || 'Could not restore the deleted snippet.');
    }
  };

  const listHeader = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleCopy}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR KNOWLEDGE, OFFLINE</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>Snippet library</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Search, explore, and revisit useful patterns.</Text>
        </View>
        <Pressable
          accessibilityLabel="Add a snippet"
          accessibilityRole="button"
          onPress={() => navigation.navigate('AddEditSnippet')}
          style={({ pressed }) => [
            styles.headerIcon,
            { backgroundColor: `${colors.primary}1A`, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons name="add" size={26} color={colors.primary} />
        </Pressable>
      </View>
      <SearchBar value={query} onChangeText={setQuery} onSubmitEditing={handleSearchSubmit} />
      {!query.trim() && recentSearches.length > 0 ? (
        <View style={styles.recentSearches}>
          <View style={styles.recentHeading}>
            <Text accessibilityRole="header" style={[styles.recentTitle, { color: colors.muted }]}>Recent searches</Text>
            <Pressable
              accessibilityLabel="Clear recent searches"
              accessibilityRole="button"
              onPress={handleClearRecentSearches}
              style={styles.clearRecentButton}
            >
              <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear</Text>
            </Pressable>
          </View>
          <View style={styles.recentChips}>
            {recentSearches.map((savedSearch) => (
              <Pressable
                accessibilityLabel={`Search again for ${savedSearch}`}
                accessibilityRole="button"
                key={savedSearch}
                onPress={() => setQuery(savedSearch)}
                style={[styles.recentChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Ionicons name="time-outline" size={14} color={colors.muted} />
                <Text numberOfLines={1} style={[styles.recentChipText, { color: colors.text }]}>{savedSearch}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
      <FilterChips label="Language" options={languages} value={language} onChange={selectLanguage} />
      <View style={styles.resultRow}>
        <Text accessibilityLiveRegion="polite" style={[styles.resultCount, { color: colors.text }]}>{summary}</Text>
      </View>
      <View style={styles.filterActions}>
        <Pressable
          accessibilityLabel={activeFilterCount ? `Filters, ${activeFilterCount} active` : 'Filters'}
          accessibilityRole="button"
          onPress={openFilterSheet}
          style={({ pressed }) => [
            styles.filterButton,
            { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Ionicons name="options-outline" size={18} color={colors.primary} />
          <Text style={[styles.filterButtonLabel, { color: colors.text }]}>Filters</Text>
          {activeFilterCount > 0 ? (
            <View style={[styles.filterCountBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.filterCountText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </Pressable>
        {hasActiveFilters ? (
          <Pressable
            accessibilityLabel="Clear all search and filters"
            accessibilityRole="button"
            onPress={resetFilters}
            style={styles.clearFilters}
          >
            <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Clear all</Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          <Text accessibilityRole="alert" style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <Pressable
            accessibilityLabel="Retry loading snippets"
            accessibilityRole="button"
            onPress={refresh}
            style={styles.retryButton}
          >
            <Text style={[styles.retryText, { color: isDark ? colors.background : '#FFFFFF' }]}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {isLoading && snippets.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>Loading your snippets…</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={visibleSnippets}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              icon={error ? 'cloud-offline-outline' : 'search-outline'}
              title={error ? 'Library unavailable' : 'No snippets found'}
              message={error ? 'Check the local library and try again.' : 'No snippets match this search and filter combination.'}
              actionTitle={error ? 'Retry' : 'Clear filters'}
              onAction={error ? refresh : resetFilters}
            />
          }
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl
              colors={[colors.primary]}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <SnippetCard
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
              snippet={item}
              onPress={() => {
                recordViewed(item.id);
                navigation.navigate('SnippetDetails', { snippetId: item.id });
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
      <Modal
        animationType="slide"
        onRequestClose={() => setIsFilterSheetVisible(false)}
        transparent
        visible={isFilterSheetVisible}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityLabel="Close filters"
            accessibilityRole="button"
            onPress={() => setIsFilterSheetVisible(false)}
            style={styles.modalBackdrop}
          />
          <View
            accessibilityViewIsModal
            style={[
              styles.filterSheet,
              { backgroundColor: colors.background, borderColor: colors.border, maxHeight: height * 0.88 },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleGroup}>
                <Text accessibilityRole="header" style={[styles.sheetTitle, { color: colors.text }]}>Filters</Text>
                <Text style={[styles.sheetSubtitle, { color: colors.muted }]}>Refine this offline library</Text>
              </View>
              <Pressable
                accessibilityLabel="Close filters"
                accessibilityRole="button"
                onPress={() => setIsFilterSheetVisible(false)}
                style={styles.sheetClose}
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView
              contentContainerStyle={styles.sheetContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <FilterChips
                label="Difficulty"
                options={difficultyOptions}
                value={draftFilters.difficulty}
                onChange={(value) => setDraftFilters((current) => ({ ...current, difficulty: value }))}
              />
              <FilterChips
                label="Category"
                options={availableCategories}
                value={availableCategories.includes(draftFilters.category) ? draftFilters.category : 'All'}
                onChange={(value) => setDraftFilters((current) => ({ ...current, category: value }))}
              />
              <FilterChips
                label="Sort by"
                options={sortOptions}
                value={draftFilters.sort}
                onChange={(value) => setDraftFilters((current) => ({ ...current, sort: value }))}
              />
            </ScrollView>
            <Text accessibilityLiveRegion="polite" style={[styles.liveCount, { color: colors.muted }]}>
              {`Show ${draftVisibleCount} ${draftVisibleCount === 1 ? 'snippet' : 'snippets'}`}
            </Text>
            <View style={styles.sheetActions}>
              <Pressable
                accessibilityLabel="Reset difficulty, category, and sort filters"
                accessibilityRole="button"
                onPress={resetSheetFilters}
                style={styles.sheetReset}
              >
                <Text style={[styles.clearFiltersText, { color: colors.primary }]}>Reset</Text>
              </Pressable>
              <View style={styles.applyButton}>
                <PrimaryButton title="Apply" onPress={applyFilters} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <UndoSnackbar
        visible={isUndoVisible}
        message="Snippet deleted"
        onAction={handleUndoDelete}
        onDismiss={() => setIsUndoVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  titleCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    letterSpacing: 1,
  },
  title: {
    fontSize: typography.heading,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.small,
    lineHeight: 20,
  },
  recentSearches: {
    gap: spacing.xs,
  },
  recentHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentTitle: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  clearRecentButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.xs,
  },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  recentChip: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    maxWidth: '100%',
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  recentChipText: {
    fontSize: typography.caption,
    maxWidth: 180,
  },
  headerIcon: {
    alignItems: 'center',
    borderRadius: radii.control,
    height: 48,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: 48,
  },
  resultRow: {
    marginTop: spacing.xs,
  },
  resultCount: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  filterActions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  filterButtonLabel: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  filterCountBadge: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 22,
    justifyContent: 'center',
    minWidth: 22,
    paddingHorizontal: spacing.xs,
  },
  filterCountText: {
    color: '#FFFFFF',
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
  },
  clearFilters: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  clearFiltersText: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  errorCard: {
    alignItems: 'center',
    borderRadius: radii.control,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  retryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 48,
  },
  retryText: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  filterSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetTitleGroup: {
    gap: spacing.xs,
  },
  sheetTitle: {
    fontSize: typography.title,
    fontWeight: fontWeights.bold,
  },
  sheetSubtitle: {
    fontSize: typography.caption,
  },
  sheetClose: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  sheetContent: {
    gap: spacing.lg,
    paddingBottom: spacing.sm,
  },
  liveCount: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
    paddingVertical: spacing.md,
  },
  sheetActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  sheetReset: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  applyButton: {
    flex: 1,
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.small,
  },
});
