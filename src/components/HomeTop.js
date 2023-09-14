import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import 'react-native-url-polyfill/auto';
import SettingsIcon from '../assets/settings-svgrepo-com.svg';
import {theme} from '../../Styling';
import {horizontalScale, verticalScale} from '../utils/Metrics';
const HomeTop = ({navigation}) => {
  return (
    <View
      style={{
        backgroundColor: theme.home.header,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <TouchableOpacity
        style={{
          padding: 10,
          justifyContent: 'flex-end',
          marginLeft: 'auto',
          // alignItems: 'flex-end',
        }}
        onPress={() => {
          navigation.navigate('Settings');
        }}>
        <SettingsIcon />
      </TouchableOpacity>
      <Text
        style={{
          color: 'white',
          fontSize: 30,
          fontWeight: 700,
          paddingHorizontal: horizontalScale(20),
          paddingTop: verticalScale(20),
          paddingBottom: verticalScale(10),
        }}>
        Journal home
      </Text>
    </View>
  );
};

export default HomeTop;
