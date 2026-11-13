import { Component } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('CodeCrib encountered an unexpected screen error.', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text accessibilityRole="header" style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              CodeCrib hit an unexpected problem. Your saved data stays on this device.
            </Text>
            <Text accessibilityRole="alert" style={styles.error}>
              {this.state.error.message || 'Unknown application error'}
            </Text>
            <Pressable
              accessibilityHint="Renders the app again after the error"
              accessibilityLabel="Try again"
              accessibilityRole="button"
              onPress={() => this.setState({ error: null })}
              style={styles.button}
            >
              <Text style={styles.buttonLabel}>Try again</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F6F7FB',
    flex: 1,
  },
  content: {
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#172033',
    fontSize: 24,
    fontWeight: '700',
  },
  message: {
    color: '#596579',
    fontSize: 16,
    lineHeight: 24,
  },
  error: {
    color: '#9B2C2C',
    fontSize: 13,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#4355D8',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
