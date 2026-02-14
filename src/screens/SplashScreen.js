import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import LottieView from 'lottie-react-native';
import {useNavigation} from '@react-navigation/native';
import {colors, sizes, wp, hp} from '../utils/responsive';
import {database} from '../database/database';

export const SplashScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialize Database
        await database.init();
        
        // Artificial delay for branding (2.5 seconds total minimum)
        setTimeout(() => {
          
          // Fade out animation
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
             // Navigate and reset history so user can't go back to splash
            navigation.reset({
              index: 0,
              routes: [{name: 'TaskList'}],
            });
          });
          
        }, 2500);
      } catch (error) {
        console.error('Initialization failed', error);
        // Still navigate or show error screen? For now navigate to list which might show empty or error state
        navigation.replace('TaskList');
      }
    };

    initApp();
  }, [navigation, fadeAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, {opacity: fadeAnim}]}>
        <View style={styles.lottieContainer}>
          <LottieView
            source={require('../assets/animations/Loading.json')}
            autoPlay
            loop
            style={styles.lottie}
            resizeMode="contain"
          />
        </View>
        
        {/* Placeholder for when user replaces JSON with real image */}
        {/* <Image source={require('../assets/images/logo.png')} style={styles.logo} /> */}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  lottieContainer: {
    width: wp('80%'),
    height: wp('80%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
});
