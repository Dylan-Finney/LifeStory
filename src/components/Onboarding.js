import React, {useState, useRef, useEffect} from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
} from 'react-native';

import 'react-native-url-polyfill/auto';

import OnboardStep4Image from '../assets/OnboardStep4.svg';
import LogoImage from '../assets/logo.svg';

import {theme} from '../../Styling';
import Svg, {Defs, Rect, LinearGradient, Stop} from 'react-native-svg';
import useSettingsHooks from '../../useSettingsHooks';
import {horizontalScale, moderateScale, verticalScale} from '../utils/Metrics';
import LottieView from 'lottie-react-native';
// import Video from 'react-native-video';
// import animation1 from '../assets/OnboardingAnimation1.mp4';
// import animation2 from '../assets/OnboaringAnim1.mov';
const FROM_COLOR = 'rgb(255, 255, 255)';
const TO_COLOR = 'rgb(0,102,84)';

const Step = ({isActive}) => {
  return (
    <View
      style={{
        height: verticalScale(4),
        width: horizontalScale(40),
        backgroundColor: isActive
          ? theme.onboarding.tab.active
          : theme.onboarding.tab.inactive,
        borderRadius: moderateScale(2),
      }}
    />
  );
};

const Onboarding = ({endOnboarding, generateEntry, getPermissionsAndData}) => {
  const [onBoardingStep, setOnBoardingStep] = useState(0);
  const [gettingData, setGettingData] = useState(false);
  const [gettingPermissions, setGettingPermissions] = useState(false);
  const {createEntryTime, setCreateEntryTime} = useSettingsHooks();
  const [initalScreen, setInitalScreen] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    fadeIn();
  }, []);
  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setInitalScreen(false);
      // Animated.timing(fadeAnim, {
      //   toValue: 0,
      //   duration: 5000,
      //   useNativeDriver: true,
      // }).start();
    });
  };

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        // justifyContent: 'space-between',
        background: theme.onboarding.background,
        height: '99%',
        marginHorizontal: horizontalScale(20),
      }}>
      <View style={{flexGrow: initalScreen === true ? 0 : 1, marginTop: 10}}>
        {/* {onBoardingStep < 3 ? (
          <Image
            source={
              (onBoardingStep === 0 && require('../assets/OnboardStep1.gif')) ||
              (onBoardingStep === 1 && require('../assets/OnboardStep2.gif')) ||
              (onBoardingStep === 2 && require('../assets/OnboardStep3.gif'))
            }
            style={{
              alignSelf: 'center',
              display: 'flex',
              justifyContent: 'center',
            }}
          />
        ) : (
          <View style={{alignSelf: 'center'}}>
            <LogoImage />
          </View>
        )} */}
        {/* <View style={{alignSelf: 'center'}}>
          <LogoImage />
        </View> */}
        {/* <Video
          source={animation1}
          repeat={false}
          paused={false}
          hideShutterView={true}
          style={{width: 500, height: 500}}
        /> */}
        {initalScreen === true ? (
          <>
            <View style={{alignSelf: 'center'}}>
              <LogoImage />
            </View>
          </>
        ) : (
          <>
            {onBoardingStep === 0 && (
              <LottieView
                source={require('../assets/OnboardingAnimation1.json')}
                style={{width: 500, height: 500, alignSelf: 'center'}}
                autoPlay
                loop={false}
              />
            )}
            {onBoardingStep === 1 && (
              <LottieView
                source={require('../assets/OnboardingAnimation2.json')}
                style={{width: 500, height: 500, alignSelf: 'center'}}
                autoPlay
                loop={false}
              />
            )}
            {onBoardingStep === 2 && (
              <LottieView
                source={require('../assets/OnboardingAnimation3.json')}
                style={{width: 500, height: 500, alignSelf: 'center'}}
                autoPlay
                loop={false}
              />
            )}
            {onBoardingStep === 3 && (
              <View
                style={{
                  alignSelf: 'center',
                  justifyContent: 'center',
                  flexGrow: 1,
                }}>
                <OnboardStep4Image />
              </View>
            )}
            {onBoardingStep === 4 && gettingPermissions === false && (
              <View
                style={{
                  alignSelf: 'center',
                  justifyContent: 'center',
                  flexGrow: 1,
                }}>
                <LogoImage />
              </View>
            )}
          </>
        )}
      </View>
      {initalScreen === true ? (
        <>
          <Text
            style={{
              color: theme.onboarding.title,
              fontWeight: '700',
              fontSize: moderateScale(28),
              marginBottom: verticalScale(40),
              marginTop: 40,
              // alignSelf: 'center',
              textAlign: 'center',
              flexGrow: 1,
            }}>
            Welcome new StoryWriter!
          </Text>
        </>
      ) : (
        <>
          <Text
            style={{
              color: theme.onboarding.title,
              fontWeight: '700',
              fontSize: moderateScale(28),
              marginBottom: verticalScale(40),
            }}>
            {onBoardingStep === 0 &&
              initalScreen === false &&
              'Automated Journaling'}
            {onBoardingStep === 0 &&
              initalScreen === true &&
              'Welcome StoryTeller!'}
            {onBoardingStep === 1 && 'You are the lead in your story'}
            {onBoardingStep === 2 && 'Private by default'}
            {onBoardingStep === 3 && 'Start your story'}
            {onBoardingStep === 4 &&
              gettingPermissions === false &&
              "You've successfully set up your LifeStory app!"}
          </Text>
          <Text
            style={{
              color: theme.onboarding.text,
              fontWeight: '400',
              fontSize: moderateScale(18),
              marginBottom: verticalScale(40),
            }}>
            {onBoardingStep === 0 &&
              initalScreen === false &&
              'Lifestory creates your daily journal entries automatically based on your photos, location and more.'}
            {onBoardingStep === 1 &&
              'With Lifestory you can reflect your life and memories via beautiful stories on daily basis.'}
            {onBoardingStep === 2 &&
              'All your personal data and stories remain ‘private by default’. You are the owner of your data and always in control how it is used.'}
            {onBoardingStep === 3 &&
              'Lifestory needs access to location data, photos and calender to journal your days.'}
            {onBoardingStep === 4 &&
              gettingPermissions === false &&
              "Would you prefer to receive your fresh daily stories as a reflective evening digest at the day's end, or as a morning read to start the next day with a reminiscent smile? Your choice will guide the timing of your daily LifeStory notifications."}
          </Text>
          {gettingPermissions === false && (
            <>
              {onBoardingStep < 4 || gettingPermissions === true ? (
                <>
                  <TouchableOpacity
                    style={{
                      backgroundColor: 'white',
                      marginHorizontal: horizontalScale(10),
                      borderRadius: moderateScale(5),
                      paddingVertical: verticalScale(15),
                      marginBottom: verticalScale(20),
                    }}
                    onPress={async () => {
                      console.log({onBoardingStep});
                      setOnBoardingStep(onBoardingStep + 1);
                      if (onBoardingStep === 3) {
                        setGettingPermissions(true);
                        await getPermissionsAndData(Date.now());
                        setGettingPermissions(false);
                      }
                    }}>
                    <Text
                      style={{
                        color: '#026AA2',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: moderateScale(18),
                      }}>
                      {onBoardingStep === 3 ? 'Grant Permissions' : 'Next'}
                    </Text>
                  </TouchableOpacity>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      width: 'auto',
                      justifyContent: 'space-evenly',
                      marginHorizontal: horizontalScale(30),
                      marginVertical: verticalScale(15),
                    }}>
                    <Step isActive={onBoardingStep === 0} />
                    <Step isActive={onBoardingStep === 1} />
                    <Step isActive={onBoardingStep === 2} />
                    <Step isActive={onBoardingStep === 3} />
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={{
                      // backgroundColor: 'white',
                      borderColor: 'white',
                      borderWidth: 1,
                      marginHorizontal: horizontalScale(10),
                      borderRadius: moderateScale(5),
                      paddingVertical: verticalScale(15),
                      marginBottom: verticalScale(20),
                    }}
                    onPress={async () => {
                      setCreateEntryTime(8);
                      endOnboarding();
                      // if (onBoardingStep === 3) {
                      //   setGettingData(true);
                      //   const data = await getPermissionsAndData(Date.now());
                      //   setGettingData(false);
                      //   await generateEntry({
                      //     data,
                      //     date: Date.now(),
                      //   });
                      //   // await onPress();
                      //   endOnboarding();
                      // }
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: moderateScale(18),
                      }}>
                      8 AM
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      borderColor: 'white',
                      borderWidth: 1,
                      marginHorizontal: horizontalScale(10),
                      borderRadius: moderateScale(5),
                      paddingVertical: verticalScale(15),
                      marginBottom: verticalScale(20),
                    }}
                    onPress={async () => {
                      setCreateEntryTime(20);
                      endOnboarding();
                      // if (onBoardingStep === 3) {
                      //   setGettingData(true);
                      //   const data = await getPermissionsAndData(Date.now());
                      //   setGettingData(false);
                      //   await generateEntry({
                      //     data,
                      //     date: Date.now(),
                      //   });
                      //   // await onPress();
                      //   endOnboarding();
                      // }
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: moderateScale(18),
                      }}>
                      8 PM
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
};
export default Onboarding;
