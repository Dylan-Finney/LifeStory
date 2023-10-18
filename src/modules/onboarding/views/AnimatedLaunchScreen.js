import React, {useEffect, useRef} from 'react';
import {Animated, Easing, View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import OnboardingBackground from '../../../components/OnboardingBackground';
import AnimatedLaunchScreenLogo from '../../../assets/animated-launch-screen-logo.svg';

const AnimatedLaunchScreen = () => {
  const whiteScreenFade = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(whiteScreenFade, {
        toValue: 0,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(whiteScreenFade, {
          toValue: 0,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(1000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => navigation.replace('MainApp'));
  }, [fadeAnim, navigation, whiteScreenFade]);

  return (
    <>
      <View style={styles.whiteScreen} />
      <OnboardingBackground />
      <View style={styles.container}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <AnimatedLaunchScreenLogo />
        </Animated.View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  whiteScreen: {
    backgroundColor: 'white',
    ...StyleSheet.absoluteFill,
  },
  container: {
    flex: 1,
    paddingTop: 140,
    alignItems: 'center',
    width: '100%',
  },
});

export default AnimatedLaunchScreen;
