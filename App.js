/**
 * Task Manager App
 * Offline-First Task Manager with Redux Toolkit and SQLite
 */

import React, { useEffect, useState } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { database } from './src/database/database';
import { colors, wp, hp } from './src/utils/responsive';
import Toast from 'react-native-toast-message';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize SQLite database
      await database.init();
      setIsReady(true);
    } catch (err) {
      console.error('Failed to initialize app:', err);
      setError('Failed to initialize database. Please restart the app.');
    }
  };

  if (error) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  const toastConfig = {
    success: (props) => (
      <View style={[styles.toastBase, styles.toastSuccess]}>
        <View style={styles.toastIconContainer}>
          <Text style={[styles.toastIcon, { color: '#5CB85C' }]}>✓</Text>
        </View>
        <View style={styles.toastContent}>
          <Text style={styles.toastType}>{props.text1 || 'Success'}</Text>
          <Text style={styles.toastMessage}>{props.text2}</Text>
        </View>
      </View>
    ),
    error: (props) => (
      <View style={[styles.toastBase, styles.toastError]}>
        <View style={styles.toastIconContainer}>
          <Text style={[styles.toastIcon, { color: '#D9534F' }]}>✕</Text>
        </View>
        <View style={styles.toastContent}>
          <Text style={styles.toastType}>{props.text1 || 'Error'}</Text>
          <Text style={styles.toastMessage}>{props.text2}</Text>
        </View>
      </View>
    ),
    info: (props) => (
      <View style={[styles.toastBase, styles.toastInfo]}>
        <View style={styles.toastIconContainer}>
          <Text style={[styles.toastIcon, { color: '#5BC0DE' }]}>ℹ</Text>
        </View>
        <View style={styles.toastContent}>
          <Text style={styles.toastType}>{props.text1 || 'Info'}</Text>
          <Text style={styles.toastMessage}>{props.text2}</Text>
        </View>
      </View>
    ),
  };

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppNavigator />
        <Toast config={toastConfig} />
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('4%'),
    color: colors.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: wp('10%'),
  },
  errorText: {
    fontSize: wp('4%'),
    color: colors.danger,
    textAlign: 'center',
  },
  toastBase: {
    height: hp('8%'),
    width: wp('90%'),
    backgroundColor: colors.white,
    borderRadius: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderLeftWidth: 6,
  },
  toastSuccess: {
    borderLeftColor: colors.completed || '#5CB85C',
  },
  toastError: {
    borderLeftColor: colors.danger || '#D9534F',
  },
  toastInfo: {
    borderLeftColor: colors.info || '#5BC0DE',
  },
  toastIconContainer: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  toastIcon: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: colors.dark,
  },
  toastContent: {
    flex: 1,
  },
  toastType: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: wp('3.2%'),
    color: colors.gray,
  },
});

export default App;
