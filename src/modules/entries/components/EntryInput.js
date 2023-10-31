import React, {useState, useEffect} from 'react';
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  useColorScheme,
  View,
  Dimensions,
} from 'react-native';

import moment from 'moment';

import _ from 'lodash';

import {ImageAsset} from '../../../utils/native-modules/NativeImage';
import Config from 'react-native-config';
import {theme} from '../../../theme/styling';

import {textChangeHelperFuncs} from '../../../utils/utils';

import {
  verticalScale,
  moderateScale,
  horizontalScale,
} from '../../../utils/metrics';

import {useKeyboard} from '@react-native-community/hooks';
import {useHeaderHeight} from '@react-navigation/elements';

import {CustomInput} from '../../../utils/native-modules/NativeJournal';

const diff = require('diff');
const {width, height} = Dimensions.get('window');
const {Configuration, OpenAIApi} = require('openai');
const configuration = new Configuration({
  apiKey: Config.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
const baseLoading = {attribute: '', action: '', stage: 0};

const EntryInput = ({
  changeTitle,
  title,
  changeEntry,
  entry,
  onContextMenu,
}) => {
  const keyboard = useKeyboard();
  return (
    <View
      style={{
        paddingTop: verticalScale(10),
        paddingHorizontal: horizontalScale(10),
        paddingBottom:
          height > 900
            ? keyboard.keyboardShown
              ? keyboard.keyboardHeight + 114
              : 30
            : height > 800
            ? keyboard.keyboardShown
              ? keyboard.keyboardHeight + 139
              : 30
            : keyboard.keyboardShown
            ? keyboard.keyboardHeight + 145
            : 30,
        // paddingBottom: isKeyboardVisible
        //   ? verticalScale(475)
        //   : 0,
        // padding: 10,
        // backgroundColor: 'red',
      }}>
      <TextInput
        style={{
          paddingTop: verticalScale(3),
          paddingHorizontal: horizontalScale(3),
          fontSize: moderateScale(20),
          fontWeight: '700',
          color: theme.general.strongText,
        }}
        value={title}
        onChangeText={changeTitle}
      />
      <CustomInput
        style={{height: '88%'}}
        onTxtChange={changeEntry}
        initalTxtString={entry}
        onEventMenu={onContextMenu}
      />
    </View>
  );
};

export default EntryInput;
