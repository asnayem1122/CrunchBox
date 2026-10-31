import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { triggerHaptic, playMechanicalClick } from '../../utils/soundEffects';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class HardwareErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });
    console.error('CRUNCHBOX CB-09 SYSTEM FAULT:', error, errorInfo);
  }

  handleRetry = (): void => {
    playMechanicalClick();
    triggerHaptic(true, 'medium');
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleEmergencyReset = async (): Promise<void> => {
    playMechanicalClick();
    triggerHaptic(true, 'heavy');
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear();
        }
      } else {
        await AsyncStorage.clear();
      }
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const errorMessage = this.state.error?.message || 'UNKNOWN SYSTEM HALT';
    const componentStack = this.state.errorInfo?.componentStack || '';

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.chassis}>
          {/* Top Hazard Warning Strip */}
          <View style={styles.hazardStrip}>
            <Text style={styles.hazardText}>⚠️ CB-09 // HARDWARE EXCEPTION DETECTED ⚠️</Text>
          </View>

          {/* Stenciled Header Badge */}
          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CHASSIS FAULT RECOVERY</Text>
            </View>
            <Text style={styles.headerSub}>SYS_ERROR_0xDEADBEEF // CRUNCHBOX HALT</Text>
          </View>

          {/* Recessed Amber LCD Terminal */}
          <View style={styles.lcdTerminalContainer}>
            <View style={styles.lcdHeader}>
              <Text style={styles.lcdStatusText}>CORE: DUMP</Text>
              <Text style={styles.lcdStatusText}>STACK: ACTIVE</Text>
            </View>
            <ScrollView style={styles.lcdScroll} contentContainerStyle={styles.lcdContent}>
              <Text style={styles.lcdErrorLine}>[ERR] {errorMessage}</Text>
              {componentStack ? (
                <Text style={styles.lcdStackTrace}>{componentStack.trim()}</Text>
              ) : null}
            </ScrollView>
          </View>

          {/* Tactile Action Buttons */}
          <View style={styles.buttonRow}>
            {/* Retry Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.button, styles.retryButton]}
              onPress={this.handleRetry}
            >
              <Text style={styles.retryButtonText}>REBOOT UNIT</Text>
            </TouchableOpacity>

            {/* Emergency Reset Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.button, styles.resetButton]}
              onPress={this.handleEmergencyReset}
            >
              <Text style={styles.resetButtonText}>PURGE STORAGE</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Chassis Stencil */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>CRUNCHBOX CB-09 MIL-SPEC RESILIENCE HARNESS</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#161D18',
  },
  chassis: {
    flex: 1,
    backgroundColor: '#D5DBD2',
    margin: 12,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1B241E',
    overflow: 'hidden',
    padding: 16,
    justifyContent: 'space-between',
  },
  hazardStrip: {
    backgroundColor: '#D99E32',
    borderWidth: 2,
    borderColor: '#1B241E',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  hazardText: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 12,
    color: '#1B241E',
    letterSpacing: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: '#1B241E',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 13,
    color: '#8FA893',
    letterSpacing: 2,
  },
  headerSub: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 11,
    color: '#2E3B33',
    letterSpacing: 1,
  },
  lcdTerminalContainer: {
    flex: 1,
    backgroundColor: '#E5A823',
    borderWidth: 2.5,
    borderColor: '#1B241E',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  lcdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1.5,
    borderBottomColor: '#1F1500',
    paddingBottom: 6,
    marginBottom: 8,
  },
  lcdStatusText: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 10,
    color: '#1F1500',
    letterSpacing: 1,
  },
  lcdScroll: {
    flex: 1,
  },
  lcdContent: {
    paddingBottom: 10,
  },
  lcdErrorLine: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 13,
    color: '#1F1500',
    marginBottom: 8,
  },
  lcdStackTrace: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 10,
    color: '#382800',
    lineHeight: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#1B241E',
    justifyContent: 'center',
    alignItems: 'center',
    // 3D bottom shadow
    elevation: 4,
    shadowColor: '#1B241E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  retryButton: {
    backgroundColor: '#425246',
  },
  retryButtonText: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 13,
    color: '#D5DBD2',
    letterSpacing: 1,
  },
  resetButton: {
    backgroundColor: '#D96B27',
  },
  resetButtonText: {
    fontFamily: 'monospace',
    fontWeight: '900',
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 4,
  },
  footerText: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 9,
    color: '#6B786E',
    letterSpacing: 1,
  },
});
