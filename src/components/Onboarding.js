import React, {useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';

import 'react-native-url-polyfill/auto';

import OnboardStep4Image from '../assets/OnboardStep4.svg';

import {theme} from '../../Styling';

const Step = ({isActive}) => {
  return (
    <View
      style={{
        height: 4,
        width: 40,
        backgroundColor: isActive
          ? theme.onboarding.tab.active
          : theme.onboarding.tab.inactive,
        borderRadius: 2,
      }}
    />
  );
};

const Onboarding = ({endOnboarding, generateEntry, getPermissionsAndData}) => {
  const [onBoardingStep, setOnBoardingStep] = useState(0);
  const [gettingData, setGettingData] = useState(false);
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        // justifyContent: 'space-between',
        backgroundColor: theme.onboarding.background,
        height: '100%',
        marginHorizontal: 20,
      }}>
      <View style={{flexGrow: 1, justifyContent: 'center'}}>
        {onBoardingStep < 3 ? (
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
            <OnboardStep4Image />
          </View>
        )}
      </View>
      {onBoardingStep < 4 ? (
        <>
          <Text
            style={{
              color: theme.onboarding.title,
              fontWeight: '700',
              fontSize: 28,
              marginBottom: 40,
            }}>
            {onBoardingStep === 0 && 'Automated Journaling'}
            {onBoardingStep === 1 && 'You are the lead in your story'}
            {onBoardingStep === 2 && 'Private by default'}
            {onBoardingStep === 3 && 'Start your story'}
          </Text>
          <Text
            style={{
              color: theme.onboarding.text,
              fontWeight: '400',
              fontSize: 18,
              marginBottom: 40,
            }}>
            {onBoardingStep === 0 &&
              'Lifestory creates your daily journal entries automatically based on your photos, location and more.'}
            {onBoardingStep === 1 &&
              'With Lifestory you can reflect your life and memories via beautiful stories on daily basis.'}
            {onBoardingStep === 2 &&
              'All your personal data and stories remain ‘private by default’. You are the owner of your data and always in control how it is used.'}
            {onBoardingStep === 3 &&
              'Lifestory needs access to location data, photos and calender to journal your days.'}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: 'black',
              marginHorizontal: 10,
              borderRadius: 5,
              paddingVertical: 10,
              marginBottom: 10,
            }}
            onPress={async () => {
              console.log({onBoardingStep});
              setOnBoardingStep(onBoardingStep + 1);
              if (onBoardingStep === 3) {
                setGettingData(true);
                const data = await getPermissionsAndData();
                setGettingData(false);
                await generateEntry(data);
                // await onPress();
                endOnboarding();
              }
            }}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: 18,
              }}>
              Next
            </Text>
          </TouchableOpacity>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: 'auto',
              justifyContent: 'space-evenly',
              marginHorizontal: 30,
            }}>
            <Step isActive={onBoardingStep === 0} />
            <Step isActive={onBoardingStep === 1} />
            <Step isActive={onBoardingStep === 2} />
            <Step isActive={onBoardingStep === 3} />
          </View>
        </>
      ) : (
        <View style={{flexGrow: 1, marginHorizontal: 20}}>
          <Text
            style={{
              color: theme.onboarding.title,
              fontWeight: '700',
              fontSize: 22,
              marginBottom: 20,
              textAlign: 'center',
            }}>
            {gettingData === true
              ? 'Requesting Permissions and Getting Data'
              : 'Your story is being created'}
          </Text>
          <Text
            style={{
              color: theme.onboarding.text,
              fontWeight: '400',
              fontSize: 18,
              marginBottom: 40,
              textAlign: 'center',
            }}>
            We will notify you when your first story is ready...
          </Text>
          <Image
            source={require('../assets/Spin-1s-200px-2.gif')}
            resizeMethod="auto"
            style={{
              alignSelf: 'center',
              display: 'flex',
              width: 50,
              height: 50,
              justifyContent: 'center',
            }}
          />
        </View>
      )}
    </View>
  );
};
export default Onboarding;
