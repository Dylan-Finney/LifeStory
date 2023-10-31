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

import {
  emotions,
  baseContentTags,
  days,
  emotionTags,
  toneTags,
} from '../../../utils/utils';

import AIRewriteIcon from '../../../assets/ai-rewrite-icon.svg';
import ContentTaggingIcon from '../../../assets/content-tagging-icon.svg';
import ContentVotingIcon from '../../../assets/content-voting-icon.svg';
import EmotionTaggingIcon from '../../../assets/emotion-tagging-icon.svg';
import MenuIcon from '../../../assets/menu-icon.svg';
import RefreshIcon from '../../../assets/refresh-icon.svg';
import AlignLeft from '../../../assets/align-left-icon.svg';
import WordCountIcon from '../../../assets/open-book.svg';
import UndoIcon from '../../../assets/flip-backward.svg';
import HelpIcon from '../../../assets/help-circle.svg';
import EmotionCalendarIcon from '../../../assets/calendar-heart-01.svg';
import FileIcon from '../../../assets/file-heart-03.svg';
import ClockIcon from '../../../assets/clock.svg';
import DownvoteIcon from '../../../assets/arrow-block-down.svg';
import UpvoteIcon from '../../../assets/arrow-block-up.svg';
import LocationIcon from '../../../assets/location-pin-svgrepo-com.svg';
import CalendarIcon from '../../../assets/event-svgrepo-com.svg';

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

const EntryFooter = ({
  openModalScreen,
  setTempEmotions,
  setTempEntry,
  setTempTitle,
  setTempVotes,
  setCurrentDate,
}) => {
  const keyboard = useKeyboard();
  return (
    <View
      style={{
        bottom:
          height > 900
            ? keyboard.keyboardShown
              ? keyboard.keyboardHeight + 40
              : 30
            : height > 800
            ? keyboard.keyboardShown
              ? keyboard.keyboardHeight + 50
              : 30
            : keyboard.keyboardShown
            ? keyboard.keyboardHeight + 48
            : 5,
        position: 'absolute',
        width: '100%',
        transition: 'bottom 1s',
      }}>
      <View
        style={{
          backgroundColor: theme.entry.footer.divider,
          height: verticalScale(0.5),
        }}
      />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          // padding: 15,
          paddingHorizontal: horizontalScale(15),
          paddingVertical: verticalScale(15),
        }}>
        <TouchableOpacity
          onPress={() => {
            // setCurrentDate(Date.now());
            // setModalScreen(1);
            // setModalVisible(true);
            openModalScreen(1);
            setCurrentDate();
            setTempEntry();
            setTempTitle();
          }}>
          <AIRewriteIcon stroke={'black'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            openModalScreen(2);
          }}>
          <ContentTaggingIcon fill={'black'} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            openModalScreen(5);
          }}>
          <Text>Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            openModalScreen(3);
            setTempVotes();
          }}>
          <ContentVotingIcon />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            openModalScreen(4);
            setTempEmotions();
          }}>
          <EmotionTaggingIcon stroke={'black'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EntryFooter;
