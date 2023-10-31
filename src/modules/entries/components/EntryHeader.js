import React, {useState, useEffect} from 'react';
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

const EntryHeader = ({
  countedWords,
  tagsLength,
  emotionsLength,
  votesLength,
}) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: theme.general.barMenu,
        paddingVertical: verticalScale(10),
        paddingHorizontal: horizontalScale(30),
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <WordCountIcon></WordCountIcon>
          <Text style={{color: 'white'}}>{countedWords}</Text>
        </View>
        <Text style={{color: 'white', fontSize: moderateScale(13)}}>Words</Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <ContentTaggingIcon width={17} height={16} fill={'white'} />
          <Text style={{color: 'white'}}>{tagsLength}</Text>
        </View>
        <Text style={{color: 'white', fontSize: moderateScale(13)}}>Tags</Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <EmotionTaggingIcon width={17} height={16} stroke={'white'} />
          <Text style={{color: 'white'}}>{emotionsLength}</Text>
        </View>
        <Text style={{color: 'white', fontSize: moderateScale(13)}}>
          Emotions
        </Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <UpvoteIcon stroke={'white'} />
          <Text style={{color: 'white'}}>{votesLength}</Text>
        </View>
        <Text style={{color: 'white', fontSize: moderateScale(13)}}>Votes</Text>
      </View>
    </View>
  );
};

export default EntryHeader;
