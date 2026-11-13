import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../components/PrimaryButton';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme/spacing';
import { fontWeights, typography } from '../theme/typography';

const slides = [
  {
    icon: 'search-outline',
    title: 'Find the code you need',
    description: 'Browse bite-sized examples across six programming languages, even without an internet connection.',
    accent: 'A practical library, always nearby',
  },
  {
    icon: 'bookmark-outline',
    usesAccent: true,
    title: 'Save what matters',
    description: 'Favorite helpful patterns and add your own notes to build a personal study collection.',
    accent: 'Your snippets stay on this device',
  },
  {
    icon: 'school-outline',
    title: 'Practice with confidence',
    description: 'Take quick quizzes, review explanations, and track your learning as you go.',
    accent: 'Learn at your own pace',
  },
];

export default function OnboardingScreen({ onComplete }) {
  const { colors, isDark } = useTheme();
  const { height } = useWindowDimensions();
  const isCompact = height <= 680;
  const [slideIndex, setSlideIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const slide = slides[slideIndex];
  const iconTint = slide.usesAccent ? colors.accent : colors.primary;
  const isLastSlide = slideIndex === slides.length - 1;
  const illustrationHeight = Math.min(260, Math.max(160, height * (isCompact ? 0.26 : 0.31)));

  const finish = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      await onComplete();
    } catch (saveError) {
      setError(saveError.message || 'Could not save your onboarding preference. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.container, isCompact && styles.containerCompact]} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="CodeCrib logo"
              source={isDark
                ? require('../../assets/images/logo-dark.png')
                : require('../../assets/images/logo.png')}
              style={styles.brandIcon}
            />
            <Text style={[styles.brandName, { color: colors.text }]}>CodeCrib</Text>
          </View>
          {!isLastSlide ? (
            <Pressable
              accessibilityLabel="Skip onboarding"
              accessibilityRole="button"
              onPress={finish}
              style={styles.skipButton}
            >
              <Text style={[styles.skipText, { color: colors.muted }]}>Skip</Text>
            </Pressable>
          ) : <View style={styles.skipPlaceholder} />}
        </View>

        <View style={[styles.main, isCompact && styles.mainCompact]}>
          <View style={[styles.illustration, isCompact && styles.illustrationCompact, { height: illustrationHeight, backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.illustrationGlow, { backgroundColor: `${colors.primary}1A` }]} />
            <View style={[styles.iconCircle, { backgroundColor: `${iconTint}20` }]}>
              <Ionicons name={slide.icon} size={54} color={iconTint} />
            </View>
            <View style={[styles.floatingTag, styles.tagTop, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
              <Text style={[styles.tagText, { color: colors.text }]}>Offline</Text>
            </View>
            <View style={[styles.floatingTag, styles.tagBottom, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="code-slash" size={18} color={colors.primary} />
              <Text style={[styles.tagText, { color: colors.text }]}>Learn</Text>
            </View>
          </View>

          <View style={[styles.copy, isCompact && styles.copyCompact]}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>YOUR STUDY COMPANION</Text>
            <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
            <Text style={[styles.description, isCompact && styles.descriptionCompact, { color: colors.muted }]}>{slide.description}</Text>
            <View style={[styles.accentNote, { backgroundColor: `${colors.accent}1A` }]}>
              <View style={[styles.accentDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.accentText, { color: colors.text }]}>{slide.accent}</Text>
            </View>
          </View>
        </View>

        {error ? <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <View style={styles.bottom}>
          <View accessibilityLabel={`Slide ${slideIndex + 1} of ${slides.length}`} style={styles.pagination}>
            {slides.map((item, index) => (
              <View
                key={item.title}
                style={[
                  styles.pageDot,
                  { backgroundColor: index === slideIndex ? colors.primary : colors.border },
                  index === slideIndex && styles.activePageDot,
                ]}
              />
            ))}
          </View>
          <PrimaryButton
            title={isLastSlide ? 'Get started' : 'Continue'}
            onPress={isLastSlide ? finish : () => setSlideIndex((current) => current + 1)}
            loading={isSaving}
          />
          {slideIndex > 0 ? (
            <Pressable
              accessibilityLabel="Go to previous onboarding slide"
              accessibilityRole="button"
              onPress={() => setSlideIndex((current) => Math.max(0, current - 1))}
              style={styles.back}
            >
              <Text style={[styles.backText, { color: colors.muted }]}>Back</Text>
            </Pressable>
          ) : <View style={styles.back} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  containerCompact: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  top: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  brandIcon: {
    borderRadius: radii.control,
    height: 40,
    width: 40,
  },
  brandName: {
    fontSize: typography.body,
    fontWeight: fontWeights.bold,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 56,
  },
  skipPlaceholder: {
    height: 44,
    width: 56,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  mainCompact: {
    paddingVertical: spacing.xs,
  },
  illustration: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    height: 260,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  illustrationCompact: {
    marginBottom: spacing.md,
  },
  illustrationGlow: {
    borderRadius: 120,
    height: 220,
    position: 'absolute',
    width: 220,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 52,
    height: 104,
    justifyContent: 'center',
    width: 104,
  },
  floatingTag: {
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
    position: 'absolute',
  },
  tagTop: {
    right: '10%',
    top: '18%',
  },
  tagBottom: {
    bottom: '17%',
    left: '10%',
  },
  tagText: {
    fontSize: typography.small,
    fontWeight: fontWeights.semibold,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.md,
  },
  copyCompact: {
    gap: spacing.sm,
  },
  eyebrow: {
    fontSize: typography.caption,
    fontWeight: fontWeights.bold,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  title: {
    fontSize: typography.heading,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.body,
    lineHeight: 25,
    maxWidth: 420,
    textAlign: 'center',
  },
  descriptionCompact: {
    lineHeight: 22,
  },
  accentNote: {
    alignItems: 'center',
    borderRadius: radii.pill,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  accentDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  accentText: {
    fontSize: typography.caption,
    fontWeight: fontWeights.semibold,
  },
  error: {
    fontSize: typography.small,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  bottom: {
    gap: spacing.sm,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    height: 24,
    justifyContent: 'center',
  },
  pageDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  activePageDot: {
    width: 24,
  },
  back: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
  },
  backText: {
    fontSize: typography.small,
    fontWeight: fontWeights.medium,
  },
});
