import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import 'react-native-url-polyfill/auto';

import AIRewriteIcon from './src/assets/ai-rewrite-icon.svg';
import ContentTaggingIcon from './src/assets/content-tagging-icon.svg';
import ContentVotingIcon from './src/assets/content-voting-icon.svg';
import EmotionTaggingIcon from './src/assets/emotion-tagging-icon.svg';
import {emotions, baseContentTags, days, emotionTags, toneTags} from './Utils';
import MenuIcon from './src/assets/menu-icon.svg';
import RefreshIcon from './src/assets/refresh-icon.svg';
import AlignLeft from './src/assets/align-left-icon.svg';
import WordCountIcon from './src/assets/open-book.svg';
import UndoIcon from './src/assets/flip-backward.svg';
import HelpIcon from './src/assets/help-circle.svg';
import EmotionCalendarIcon from './src/assets/calendar-heart-01.svg';
import FileIcon from './src/assets/file-heart-03.svg';
import ClockIcon from './src/assets/clock.svg';
import DownvoteIcon from './src/assets/arrow-block-down.svg';
import UpvoteIcon from './src/assets/arrow-block-up.svg';
import LocationIcon from './src/assets/location-pin-svgrepo-com.svg';
import CalendarIcon from './src/assets/event-svgrepo-com.svg';
import {CustomInput} from './NativeJournal';
import moment from 'moment';
import AppContext from './Context';
import _ from 'lodash';
import {ImageAsset} from './NativeImage';
import Config from 'react-native-config';
import {theme} from './Styling';
import {textChangeHelperFuncs} from './Utils';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from './src/utils/Metrics';
import {useKeyboard} from '@react-native-community/hooks';
import {useHeaderHeight} from '@react-navigation/elements';
const diff = require('diff');
const {width, height} = Dimensions.get('window');
const {Configuration, OpenAIApi} = require('openai');
const configuration = new Configuration({
  apiKey: Config.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);
const baseLoading = {attribute: '', action: '', stage: 0};

function getDifferenceUnit(diff) {
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff >= week) {
    // return diff / week > 1
    //   ? `${Math.floor(diff / week)}wks`
    //   : `${Math.floor(diff / week)}wk`;
    return `${Math.floor(diff / week)}wk`;
  } else if (diff >= day) {
    return `${Math.floor(diff / day)}d`;
  } else if (diff >= hour) {
    return `${Math.floor(diff / hour)}h`;
  } else {
    return `${Math.floor(diff / minute)}m`;
  }
}

export default FullEntryView = ({route, navigation}) => {
  const {baseEntry} = route.params;

  const isDarkMode = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [modalScreen, setModalScreen] = useState(5);
  // const {entries, setEntries} = useContext(AppContext);
  const baseWritingSettings = {
    tone: -1,
    emotion: -1,
  };
  const [writingSettings, setWritingSettings] = useState(baseWritingSettings);

  const [contentTags, setContentTags] = useState(baseContentTags);
  const EmotionScrollViewRef = createRef();
  const [customTagInput, setCustomTagInput] = useState('');

  const [entry, setEntry] = useState(baseEntry);
  const [highlightedText, setHighlightedText] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempEntry, setTempEntry] = useState('');
  const [tempOrigins, setTempOrigins] = useState({
    entry: 0,
    title: 0,
    highlight: 0,
  });
  const [tempVotes, setTempVotes] = useState([]);
  const [tempEmotions, setTempEmotions] = useState({});

  const [loading, setLoading] = useState(baseLoading);

  const [recentEvent, setRecentEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(Date.now());

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const {
    addAtMiddle,
    addAtStart,
    deleteAtEnd,
    deleteAtMiddle,
    deleteAtStart,
    removeEmpty,
    replaceAtEnd,
    replaceAtMiddle,
    replaceAtStart,
  } = textChangeHelperFuncs;

  useEffect(() => {
    console.log('useeffect', entry);
    navigation.setOptions({
      headerLeft: () => (
        <Button
          onPress={() => {
            navigation.navigate({
              name: 'Home',
              params: {entry},
              merge: true,
            });
          }}
          title="< Home"
        />
      ),
      headerBackVisible: false,
    });
  }, [navigation, entry]);
  useEffect(() => {
    if (recentEvent) {
      let len = recentEvent.range
        .replace(/[{}]/g, '')
        .split(',')
        .map(val => parseInt(val));
      len[1] = len[0] + len[1];
      console.log('RECENT EVENT', {recentEvent});
      switch (recentEvent.action) {
        //Vote
        case 1.1:
        case 1.2:
        case 1.3:
          console.log({entry: entry.entry.substring(len[0], len[1])});
          setTempVotes([
            ...entry.votes,
            {
              // string: recentEvent.str,
              startIndex: len[0],
              endIndex: len[1],
              time: Date.now(),
              vote:
                recentEvent.action === 1.1
                  ? 1
                  : recentEvent.action === 1.2
                  ? -1
                  : 0,
            },
          ]);
          setModalVisible(true);
          setModalScreen(3);
          EmotionScrollViewRef.current?.scrollToEnd({animated: true});
          break;
        //AI Rewrite
        case 2:
          setModalVisible(true);
          setModalScreen(1);
          setHighlightedText({str: recentEvent.str, position: len});
          break;
        //Emotion
        case 3.1:
        case 3.2:
        case 3.3:
        case 3.4:
        case 3.5:
        case 3.6:
          setModalVisible(true);
          setModalScreen(4);
          setTempEmotions({
            emotions: [
              ...entry.emotions,
              {
                startIndex: len[0],
                endIndex: len[1],
                time: Date.now(),
                emotion:
                  recentEvent.action === 3.6
                    ? -1
                    : 4 +
                      1 -
                      parseInt((recentEvent.action - 3).toFixed(2) * 10),
              },
            ],
            emotion: entry.emotion,
          });
          EmotionScrollViewRef.current?.scrollToEnd({animated: true});
          break;
        //Tag
        case 4:
          setModalVisible(true);
          setModalScreen(2);
          break;
        default:
          break;
      }
      // setRecentEvent(null);
    }
  }, [recentEvent]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        console.log('setKeyboardVisible', true);
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        console.log('setKeyboardVisible', false);
        setKeyboardVisible(false); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // useEffect(() => {
  //   startTimer();
  //   return () => {
  //     clearInterval(interval.current);
  //   };
  // },[]);

  const onModalCloseCancel = () => {
    setRecentEvent(null);
    setModalVisible(false);
  };

  const updateEntry = ({nativeEvent: {nativeStr}}) => {
    {
      console.log({nativeStr});
      /*Check if the entry has any registered emotion or votes attached.
            If so,
              Adjust the positioning of the markers accordingly so they keep track of the correct substrings
            If not,
              Just set the text contents of the entry to the new contents. Saves Performance.
            */
      if (entry.emotions.length > 0 || entry.votes.length > 0) {
        var diffCalc = diff.diffChars(entry.entry, nativeStr);
        var indice = 0;
        var votes = entry.votes;
        var emotions = entry.emotions;
        if (
          diffCalc.filter(
            diffObj => diffObj.added === true || diffObj.removed === true,
          ).length === 2
        ) {
          //REPLACE
          //START
          if (diffCalc[0].removed === true) {
            votes = replaceAtStart(votes, diffCalc);
            emotions = replaceAtStart(emotions, diffCalc);
          }

          //END
          if (diffCalc[1].removed === true && diffCalc.length === 3) {
            votes = replaceAtEnd(votes, diffCalc);
            emotions = replaceAtEnd(emotions, diffCalc);
          }

          //MIDDLE
          if (diffCalc[1].removed === true && diffCalc.length === 4) {
            votes = replaceAtMiddle(votes, diffCalc);
            emotions = replaceAtMiddle(emotions, diffCalc);
          }
        } else {
          //JUST ADD OR REMOVE
          for (var i = 0; i < diffCalc.length; i++) {
            if (diffCalc[i].added !== undefined) {
              //ADD
              // START
              if (i === 0) {
                votes = addAtStart(votes, diffCalc[i]);
                emotions = addAtStart(emotions, diffCalc[i]);
              }
              //END
              if (i === 1 && diffCalc.length === 2) {
              }
              //MIDDLE
              if (i === 1 && diffCalc.length === 3) {
                votes = addAtMiddle(votes, diffCalc[i], indice);
                emotions = addAtMiddle(emotions, diffCalc[i], indice);
              }
            } else if (diffCalc[i].removed !== undefined) {
              //DELETE
              if (i === 0) {
                votes = deleteAtStart(votes, diffCalc);
                emotions = deleteAtStart(emotions, diffCalc);
              }
              //END
              if (i === 1 && diffCalc.length === 2) {
                votes = deleteAtEnd(votes, diffCalc, indice);
                emotions = deleteAtEnd(emotions, diffCalc, indice);
              }
              //MIDDLE
              if (i === 1 && diffCalc.length === 3) {
                votes = deleteAtMiddle(votes, diffCalc[i], indice);
                emotions = deleteAtMiddle(emotions, diffCalc[i], indice);
              }
            } else if (
              diffCalc[i].added === undefined &&
              diffCalc[i].removed === undefined
            ) {
              indice = indice + diffCalc[i].count;
            }
          }
        }

        votes = removeEmpty(votes);
        emotions = removeEmpty(emotions);
        console.log(diff.diffChars(entry.entry, nativeStr));
        console.log('Votes', {before: entry.votes, after: votes});
        setEntry({
          ...entry,
          entry: nativeStr,
          // entryArr: copyArr,
          votes,
          emotions,
          origins: {
            ...entry.origins,
            entry: {time: Date.now(), source: 'manual'},
          },
        });
      } else {
        setEntry({
          ...entry,
          entry: nativeStr,
          // entryArr: copyArr,
          origins: {
            ...entry.origins,
            entry: {time: Date.now(), source: 'manual'},
          },
        });
      }
    }
  };

  const rewriteRequest = async ({attr, action}) => {
    setLoading({
      attribute: attr === 'title' ? 'title' : 'entry',
      action,
      stage: 1,
    });
    var messages;
    switch (attr) {
      case 'highlight':
        switch (action) {
          case 'new':
            messages = [
              {
                role: 'system',
                content: `You are an editor. Rewrite the provided text${
                  writingSettings.tone > -1
                    ? ` in a ${toneTags[writingSettings.tone]} tone`
                    : ''
                }${
                  writingSettings.emotion > -1 && writingSettings.tone > -1
                    ? ` and`
                    : ''
                }${
                  writingSettings.emotion > -1
                    ? ` to show a ${
                        emotionTags[writingSettings.emotion]
                      } emotion`
                    : ''
                }.`,
              },
              {
                role: 'user',
                content: `Text: "${highlightedText.str}"`,
              },
            ];
            break;
          case 'shorten':
            messages = [
              {
                role: 'system',
                content: `You are an editor. Rewrite the provided text${
                  writingSettings.tone > -1
                    ? ` in a ${toneTags[writingSettings.tone]} tone`
                    : ''
                }${
                  writingSettings.emotion > -1 && writingSettings.tone > -1
                    ? ` and`
                    : ''
                }${
                  writingSettings.emotion > -1
                    ? ` to show a ${
                        emotionTags[writingSettings.emotion]
                      } emotion`
                    : ''
                }. Shorten it too.`,
              },
              {
                role: 'user',
                content: `Text: "${highlightedText.str}"`,
              },
            ];
            break;
          case 'lengthen':
            messages = [
              {
                role: 'system',
                content: `You are an editor. Rewrite the provided text${
                  writingSettings.tone > -1
                    ? ` in a ${toneTags[writingSettings.tone]} tone`
                    : ''
                }${
                  writingSettings.emotion > -1 && writingSettings.tone > -1
                    ? ` and`
                    : ''
                }${
                  writingSettings.emotion > -1
                    ? ` to show a ${
                        emotionTags[writingSettings.emotion]
                      } emotion`
                    : ''
                }. Lengthen it too.`,
              },
              {
                role: 'user',
                content: `Text: "${highlightedText.str}"`,
              },
            ];
            break;
        }
        break;
      case 'title':
        switch (action) {
          case 'new':
            messages = [
              {
                role: 'system',
                content:
                  'You are a title rewriter. Given a diary entry, provide a suitable diary entry title that adheres to the provided tone and emotion. The title should be picked based on the contents of the diary entry. Respond with just the title, e.g. Today was a good day.',
              },
              {
                role: 'user',
                content: `${
                  writingSettings.tone > -1
                    ? `Tone: ${toneTags[writingSettings.tone]}`
                    : ''
                } ${
                  writingSettings.emotion > -1
                    ? `Emotion: ${emotionTags[writingSettings.emotion]}`
                    : ''
                } Diary Entry: "${tempEntry}"`,
              },
            ];
            break;
          case 'shorten':
            messages = [
              {
                role: 'system',
                content:
                  'You are a title rewriter. Given a diary entry title, shorten the title such that it provides the same information but with less characters. Respond with just the title, e.g. Today was a good day.',
              },
              {
                role: 'user',
                content: `Diary Entry Title: "${tempTitle}"`,
              },
            ];
            break;
          case 'lengthen':
            messages = [
              {
                role: 'system',
                content:
                  'You are a title rewriter. Given a diary entry title, lengthen the title such that it provides the same information but with more characters. Respond with just the title, e.g. Today was a good day.',
              },
              {
                role: 'user',
                content: `Diary Entry Title: "${tempTitle}"`,
              },
            ];
            break;
        }
        break;
      case 'entry':
        switch (action) {
          case 'new':
            messages = [
              {
                role: 'system',
                content:
                  'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone. The diary entry should be based on the current contents of the diary entry. Keep it short. Respond with just the diary entry contents, e.g. Today was a good day.',
              },
              {
                role: 'user',
                content: `${
                  writingSettings.tone > -1
                    ? `Tone: ${toneTags[writingSettings.tone]}`
                    : ''
                } ${
                  writingSettings.emotion > -1
                    ? `Emotion: ${emotionTags[writingSettings.emotion]}`
                    : ''
                } Diary Entry: "${tempEntry}"`,
              },
            ];
            break;
          case 'shorten':
            messages = [
              {
                role: 'system',
                content:
                  'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone, and shorten the entry such that it provides the same information in less characters. The diary entry should be based on the current contents of the diary entry. Respond with just the diary entry contents, e.g. Today was a good day.',
              },
              {
                role: 'user',
                content: `${
                  writingSettings.tone > -1
                    ? `Tone: ${toneTags[writingSettings.tone]}`
                    : ''
                } ${
                  writingSettings.emotion > -1
                    ? `Emotion: ${emotionTags[writingSettings.emotion]}`
                    : ''
                } Diary Entry: "${tempEntry}"`,
              },
            ];
            break;
          case 'lengthen':
            messages = [
              {
                role: 'system',
                content:
                  'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone, and lengthen the entry such that it provides the same information in more characters. The diary entry should be based on the current contents of the diary entry. Respond with just the diary entry contents, e.g. Today was a good day.',
              },
              {
                role: 'user',
                content: `${
                  writingSettings.tone > -1
                    ? `Tone: ${toneTags[writingSettings.tone]}`
                    : ''
                } ${
                  writingSettings.emotion > -1
                    ? `Emotion: ${emotionTags[writingSettings.emotion]}`
                    : ''
                } Diary Entry: "${tempEntry}"`,
              },
            ];
            break;
        }
        break;
    }
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
    });
    console.log({
      messages,
      completion: completion.data.choices[0].message.content,
    });
    switch (attr) {
      case 'entry':
        setTempEntry(completion.data.choices[0].message.content);
        setTempOrigins({
          ...tempOrigins,
          entry: Date.now(),
        });
        break;
      case 'highlight':
        setHighlightedText({
          ...highlightedText,
          str: completion.data.choices[0].message.content,
        });
        break;
      case 'title':
        setTempTitle(completion.data.choices[0].message.content);
        setTempOrigins({
          ...tempOrigins,
          title: Date.now(),
        });
        break;
    }
    setLoading({});
  };

  return (
    <SafeAreaView style={{flexGrow: 1}}>
      <StatusBar barStyle={'light-content'} backgroundColor={'#F9F9F9'} />
      <Modal
        visible={modalVisible}
        presentationStyle="formSheet"
        onRequestClose={() => {
          onModalCloseCancel();
        }}
        animationType="slide">
        <View
          style={{
            alignItems: 'center',
            backgroundColor: theme.entry.modal.background,
            flexGrow: 1,
          }}>
          <View
            style={{
              backgroundColor: theme.entry.modal.header.swiper,
              // backgroundColor: 'black',
              height: verticalScale(5),
              minWidth: horizontalScale(150),
              maxWidth: horizontalScale(150),
              display: 'flex',
            }}
          />
          {/* AI Rewrite */}
          {modalScreen === 1 && (
            <View style={{width: '100%'}}>
              <ModalScreenHeader
                close={() => {
                  onModalCloseCancel();
                  setWritingSettings(baseWritingSettings);
                }}
                update={() => {
                  if (recentEvent) {
                    setEntry({
                      ...entry,
                      entry:
                        entry.entry.substring(0, highlightedText.position[0]) +
                        highlightedText.str +
                        entry.entry.substring(highlightedText.position[1] + 1),
                    });
                    setModalVisible(false);
                  } else {
                    setEntry({
                      ...entry,
                      entry: tempEntry,
                      title: tempTitle,
                      origins: {
                        entry:
                          tempEntry !== entry.entry
                            ? {
                                source: 'auto',
                                time: Date.now(),
                              }
                            : entry.origins.entry,
                        title:
                          tempTitle !== entry.title
                            ? {
                                source: 'auto',
                                time: Date.now(),
                              }
                            : entry.origins.title,
                      },
                    });
                    setWritingSettings(baseWritingSettings);
                    setModalVisible(false);
                  }
                }}
                title={'AI Rewrite'}
                icon={<AIRewriteIcon stroke={'black'} />}
                updateable={
                  recentEvent
                    ? highlightedText.str === recentEvent.str
                    : tempEntry === entry.entry && tempTitle === entry.title
                }
              />
              <ScrollView
                style={{height: '90%'}}
                contentContainerStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: verticalScale(20),
                  paddingHorizontal: horizontalScale(20),
                  paddingVertical: verticalScale(20),
                  // padding: 20
                }}>
                {recentEvent ? (
                  <>
                    <AIRewriteAttr
                      attribute={'entry'}
                      changedSince={null}
                      changes={highlightedText.str !== recentEvent.str}
                      isAutogenerated={true}
                      loading={loading}
                      refresh={async () => {
                        rewriteRequest({attr: 'highlight', action: 'new'});
                      }}
                      lengthen={async () => {
                        rewriteRequest({attr: 'highlight', action: 'lengthen'});
                      }}
                      shorten={async () => {
                        rewriteRequest({attr: 'highlight', action: 'shorten'});
                      }}
                      tempValue={highlightedText.str}
                      title={'Highlighted Text'}
                      undo={() => {
                        setHighlightedText({
                          ...highlightedText,
                          str: recentEvent.str,
                        });
                      }}
                    />
                  </>
                ) : (
                  <>
                    {/* Title */}
                    <AIRewriteTitle
                      currentDate={currentDate}
                      entry={entry}
                      loading={loading}
                      setLoading={setLoading}
                      setTempOrigins={setTempOrigins}
                      setTempTitle={setTempTitle}
                      tempOrigins={tempOrigins}
                      tempTitle={tempTitle}
                      tempEntry={tempEntry}
                      writingSettings={writingSettings}
                      rewriteRequest={rewriteRequest}
                    />
                    {/* Content */}
                    <AIRewriteContents
                      tempEntry={tempEntry}
                      currentDate={currentDate}
                      entry={entry}
                      loading={loading}
                      setLoading={setLoading}
                      setTempOrigins={setTempOrigins}
                      setTempEntry={setTempEntry}
                      tempOrigins={tempOrigins}
                      tempTitle={tempTitle}
                      writingSettings={writingSettings}
                      rewriteRequest={rewriteRequest}
                    />
                  </>
                )}
                <View
                  style={{
                    backgroundColor: 'white',
                    paddingHorizontal: horizontalScale(10),
                    paddingVertical: verticalScale(10),
                    gap: verticalScale(5),
                  }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: theme.general.strongText,
                      fontSize: moderateScale(16),
                      fontWeight: 600,
                    }}>
                    Writing settings
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      color: theme.general.strongText,
                      fontSize: moderateScale(12),
                      fontWeight: 500,
                    }}>
                    Customize output by using the options below
                  </Text>
                  <View
                    style={{
                      height: verticalScale(0.5),
                      backgroundColor: theme.home.entryItem.highlightBorder,
                    }}
                  />
                  <View
                    style={{
                      paddingHorizontal: horizontalScale(10),
                      paddingVertical: verticalScale(10),
                      borderColor: theme.home.entryItem.highlightBorder,
                      borderWidth: 1,
                      borderRadius: 5,
                    }}>
                    <Text
                      allowFontScaling={false}
                      style={{
                        paddingHorizontal: horizontalScale(2),
                        paddingVertical: verticalScale(2),
                        paddingBottom: verticalScale(10),
                        fontWeight: 500,
                      }}>
                      Tone
                    </Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: horizontalScale(10),
                      }}>
                      {toneTags.map((toneStr, i) => {
                        return (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              setWritingSettings({
                                ...writingSettings,
                                tone: writingSettings.tone === i ? -1 : i,
                              });
                            }}>
                            <View
                              style={{
                                backgroundColor:
                                  writingSettings.tone === i
                                    ? theme.entry.buttons.toggle.background
                                        .active
                                    : theme.entry.buttons.toggle.background
                                        .inactive,
                                borderColor:
                                  writingSettings.tone === i
                                    ? theme.entry.buttons.toggle.border.active
                                    : theme.entry.buttons.toggle.border
                                        .inactive,
                                borderWidth: 1,
                                borderRadius: 5,
                              }}>
                              <Text
                                allowFontScaling={false}
                                key={i}
                                style={{
                                  paddingHorizontal: horizontalScale(5),
                                  paddingVertical: verticalScale(5),
                                  color:
                                    writingSettings.tone === i
                                      ? theme.entry.buttons.toggle.text.active
                                      : theme.entry.buttons.toggle.text
                                          .inactive,
                                }}>
                                {toneStr}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  <View
                    style={{
                      paddingHorizontal: horizontalScale(10),
                      paddingVertical: verticalScale(10),
                      borderColor: theme.home.entryItem.highlightBorder,
                      borderWidth: 1,
                      borderRadius: 5,
                    }}>
                    <Text
                      allowFontScaling={false}
                      style={{
                        paddingHorizontal: horizontalScale(2),
                        paddingVertical: verticalScale(2),
                        paddingBottom: verticalScale(10),
                        fontWeight: 500,
                      }}>
                      Emotion
                    </Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: horizontalScale(10),
                      }}>
                      {emotionTags.map((emotionStr, i) => {
                        return (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              setWritingSettings({
                                ...writingSettings,
                                emotion: writingSettings.emotion === i ? -1 : i,
                              });
                            }}>
                            <View
                              style={{
                                backgroundColor:
                                  writingSettings.emotion === i
                                    ? theme.entry.buttons.toggle.background
                                        .active
                                    : theme.entry.buttons.toggle.background
                                        .inactive,
                                borderColor:
                                  writingSettings.emotion === i
                                    ? theme.entry.buttons.toggle.border.active
                                    : theme.entry.buttons.toggle.border
                                        .inactive,
                                borderWidth: 1,
                                borderRadius: 5,
                              }}>
                              <Text
                                allowFontScaling={false}
                                key={i}
                                style={{
                                  paddingHorizontal: horizontalScale(5),
                                  paddingVertical: verticalScale(5),
                                  color:
                                    writingSettings.emotion === i
                                      ? theme.entry.buttons.toggle.text.active
                                      : theme.entry.buttons.toggle.text
                                          .inactive,
                                }}>
                                {emotionStr}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
          {/* Content Tagging */}
          {modalScreen === 2 && (
            <View style={{width: '100%'}}>
              <ModalScreenHeader
                close={() => {
                  setModalVisible(false);
                }}
                icon={<ContentTaggingIcon stroke={'black'} />}
                title={'Content Tagging'}
                update={() => {
                  setModalVisible(false);
                }}
                updateable={false}
              />
              <ScrollView
                style={{height: '90%'}}
                contentContainerStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: verticalScale(20),
                  paddingHorizontal: horizontalScale(20),
                  paddingVertical: verticalScale(20),
                }}>
                <View
                  style={{
                    backgroundColor: theme.entry.modal.tagging.background,
                    paddingHorizontal: horizontalScale(10),
                    paddingVertical: verticalScale(10),
                    gap: verticalScale(5),
                  }}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: horizontalScale(10),
                      alignItems: 'center',
                    }}>
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: theme.general.strongText,
                        fontSize: moderateScale(16),
                        fontWeight: 600,
                      }}>
                      {entry.title}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: theme.entry.tags.text,
                        fontSize: moderateScale(14),
                        fontWeight: 500,
                        backgroundColor: theme.entry.tags.background,
                        paddingHorizontal: horizontalScale(3),
                        paddingVertical: verticalScale(3),
                        borderRadius: 5,
                      }}>
                      {entry.tags.length} tags applied
                    </Text>
                  </View>

                  <Text
                    allowFontScaling={false}
                    style={{
                      color: theme.general.strongText,
                      fontSize: moderateScale(16),
                      fontWeight: 600,
                    }}>
                    Tagging helps your group and find content easily
                  </Text>
                  <View
                    style={{
                      height: verticalScale(0.5),
                      backgroundColor: theme.entry.modal.divider,
                    }}
                  />
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <TextInput
                      allowFontScaling={false}
                      style={{
                        backgroundColor: 'white',
                        paddingHorizontal: horizontalScale(10),
                        paddingVertical: verticalScale(10),
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: theme.entry.textInput.border,
                        flex: 1,
                      }}
                      value={customTagInput}
                      onChangeText={text => {
                        setCustomTagInput(text);
                      }}
                      onSubmitEditing={() => {
                        setContentTags([...contentTags, customTagInput]);
                        setCustomTagInput('');
                      }}
                      placeholder="Create custom tags"></TextInput>
                    <TouchableOpacity
                      onPress={() => {
                        setContentTags([...contentTags, customTagInput]);
                        setCustomTagInput('');
                      }}
                      style={{
                        alignItems: 'center',
                        position: 'absolute',
                        right: horizontalScale(10),
                        backgroundColor:
                          theme.entry.buttons.tagSubmit.background,
                        paddingHorizontal: horizontalScale(5),
                        paddingVertical: verticalScale(5),
                        borderRadius: 5,
                      }}>
                      {/* <View> */}
                      <Text
                        allowFontScaling={false}
                        style={{color: theme.general.strongText}}>
                        ↵Submit
                      </Text>
                      {/* </View> */}
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: horizontalScale(10),
                    }}>
                    {contentTags.map((tagStr, i) => {
                      return (
                        <TouchableOpacity
                          key={i}
                          onPress={() => {
                            if (entry.tags.includes(tagStr)) {
                              setEntry({
                                ...entry,
                                tags: entry.tags.filter(
                                  item => item !== tagStr,
                                ),
                              });
                            } else {
                              setEntry({
                                ...entry,
                                tags: [...entry.tags, tagStr],
                              });
                            }
                          }}>
                          <View
                            key={i}
                            style={{
                              backgroundColor: entry.tags.includes(tagStr)
                                ? theme.entry.buttons.toggle.background.active
                                : theme.entry.buttons.toggle.background
                                    .inactive,
                              borderColor: entry.tags.includes(tagStr)
                                ? theme.entry.buttons.toggle.border.active
                                : theme.entry.buttons.toggle.border.inactive,
                              borderWidth: 1,
                              borderRadius: 5,
                            }}>
                            <Text
                              allowFontScaling={false}
                              key={i}
                              style={{
                                paddingHorizontal: horizontalScale(5),
                                paddingVertical: verticalScale(5),
                                color: entry.tags.includes(tagStr)
                                  ? theme.entry.buttons.toggle.text.active
                                  : theme.entry.buttons.toggle.text.inactive,
                              }}>
                              {tagStr}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
          {/* Content Voting */}
          {modalScreen === 3 && (
            <View style={{width: '100%'}}>
              <ModalScreenHeader
                close={() => {
                  setModalVisible(false);
                  setRecentEvent(null);
                }}
                icon={<ContentVotingIcon stroke={'black'} />}
                title={'Content Voting'}
                update={() => {
                  setEntry({
                    ...entry,
                    votes: tempVotes,
                  });
                  setModalVisible(false);
                  setRecentEvent(null);
                }}
                updateable={
                  recentEvent ? false : _.isEqual(tempVotes, entry.votes)
                }
              />
              <ScrollView
                ref={EmotionScrollViewRef}
                // onLayout={() => {
                //   if (recentEvent) {
                //     EmotionScrollViewRef.current?.scrollToEnd({animated: true});
                //   }
                // }}
                style={{height: '90%'}}
                contentContainerStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  // gap: 20,
                  paddingHorizontal: horizontalScale(20),
                  paddingVertical: verticalScale(20),
                }}>
                <View>
                  {tempVotes
                    .sort((a, b) => a.time - b.time)
                    .map((extract, extractIndex) => {
                      return (
                        <View key={extractIndex}>
                          <TimeDivider
                            currentTime={extract.time}
                            index={extractIndex}
                            previousTime={
                              extractIndex > 0
                                ? tempVotes.sort((a, b) => a.time - b.time)[
                                    extractIndex - 1
                                  ].time
                                : null
                            }
                          />
                          <View
                            style={{
                              backgroundColor: 'white',
                              paddingHorizontal: horizontalScale(10),
                              paddingVertical: verticalScale(10),
                              gap: verticalScale(5),
                            }}>
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                gap: horizontalScale(10),
                              }}>
                              <View
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                }}>
                                <View
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <FileIcon />
                                  <Text allowFontScaling={false}>Item</Text>
                                </View>
                                <View
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: horizontalScale(5),
                                  }}>
                                  {[1, -1].map((vote, voteIndex) => {
                                    return (
                                      <TouchableOpacity
                                        key={voteIndex}
                                        onPress={() => {
                                          var copyArray = [...tempVotes];
                                          var index = copyArray.findIndex(
                                            extractCopy =>
                                              JSON.stringify(extractCopy) ===
                                              JSON.stringify(extract),
                                          );
                                          copyArray.splice(index, 1, {
                                            ...extract,
                                            vote:
                                              copyArray[index].vote === vote
                                                ? 0
                                                : vote,
                                          });
                                          setTempVotes(copyArray);
                                        }}>
                                        <View
                                          style={{
                                            paddingHorizontal:
                                              horizontalScale(3),
                                            paddingVertical: verticalScale(3),
                                            backgroundColor:
                                              extract.vote === vote
                                                ? theme.entry.buttons.toggle
                                                    .background.active
                                                : theme.entry.buttons.toggle
                                                    .background.inactive,
                                            borderColor:
                                              extract.vote === vote
                                                ? theme.entry.buttons.toggle
                                                    .border.active
                                                : theme.entry.buttons.toggle
                                                    .border.inactive,
                                            borderWidth: 1,
                                            borderRadius: 5,
                                          }}>
                                          {vote === 1 && (
                                            <UpvoteIcon
                                              stroke={
                                                extract.vote === vote
                                                  ? theme.entry.buttons.toggle
                                                      .icon.active
                                                  : theme.entry.buttons.toggle
                                                      .icon.inactive
                                              }
                                            />
                                          )}
                                          {vote === -1 && (
                                            <DownvoteIcon
                                              stroke={
                                                extract.vote === -1
                                                  ? theme.entry.buttons.toggle
                                                      .icon.active
                                                  : theme.entry.buttons.toggle
                                                      .icon.inactive
                                              }
                                            />
                                          )}
                                        </View>
                                      </TouchableOpacity>
                                    );
                                  })}
                                </View>
                              </View>
                              <View
                                style={{
                                  backgroundColor: theme.entry.modal.background,
                                  display: 'flex',
                                  flexDirection: 'row',
                                  paddingHorizontal: horizontalScale(7),
                                  paddingVertical: verticalScale(7),
                                  gap: horizontalScale(2),
                                  width: '100%',
                                }}>
                                <Text
                                  allowFontScaling={false}
                                  style={{
                                    color: theme.general.strongText,
                                    fontSize: moderateScale(15),
                                  }}>
                                  {extract.string !== undefined
                                    ? extract.string
                                    : entry.entry.substring(
                                        extract.startIndex,
                                        extract.endIndex,
                                      )}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                </View>
              </ScrollView>
            </View>
          )}
          {/* Emotion Tagging */}
          {modalScreen === 4 && (
            <View style={{width: '100%'}}>
              <ModalScreenHeader
                close={() => {
                  onModalCloseCancel();
                }}
                update={() => {
                  setEntry({
                    ...entry,
                    emotions: tempEmotions.emotions,
                    emotion: tempEmotions.emotion,
                  });
                  setModalVisible(false);
                }}
                updateable={
                  recentEvent !== null
                    ? false
                    : tempEmotions.emotion === entry.emotion &&
                      _.isEqual(tempEmotions.emotions, entry.emotions)
                }
                title={'Emotion Tagging'}
                icon={<EmotionTaggingIcon stroke={'black'} />}
              />

              <ScrollView
                ref={EmotionScrollViewRef}
                onLayout={() => {
                  if (recentEvent) {
                    EmotionScrollViewRef.current?.scrollToEnd({animated: true});
                  }
                }}
                style={{height: '90%'}}
                contentContainerStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  // gap: 20,
                  paddingHorizontal: horizontalScale(20),
                  paddingVertical: verticalScale(20),
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    paddingHorizontal: horizontalScale(10),
                    paddingVertical: verticalScale(10),
                    gap: verticalScale(5),
                  }}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <EmotionCalendarIcon />
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: theme.general.strongText,
                        fontSize: moderateScale(16),
                        fontWeight: 600,
                      }}>
                      {days[new Date(entry.time).getDay()]}{' '}
                      {moment(entry.time).format('L')}
                    </Text>
                  </View>

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <HelpIcon />
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: theme.general.strongText,
                        fontSize: moderateScale(12),
                        fontWeight: 500,
                      }}>
                      Log your daily vibe with emotion tagging.
                    </Text>
                  </View>
                  <View
                    style={{
                      height: verticalScale(0.5),
                      backgroundColor: theme.entry.modal.divider,
                    }}
                  />
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: horizontalScale(10),
                    }}>
                    {emotions.map((emotion, i) => {
                      return (
                        <TouchableOpacity
                          key={i}
                          onPress={() => {
                            setTempEmotions({...tempEmotions, emotion: i});
                          }}>
                          <View
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: horizontalScale(3),
                              paddingVertical: verticalScale(3),
                              gap: horizontalScale(2),
                              backgroundColor:
                                tempEmotions.emotion === i
                                  ? theme.entry.buttons.toggle.background.active
                                  : theme.entry.buttons.toggle.background
                                      .inactive,
                              borderColor:
                                tempEmotions.emotion === i
                                  ? theme.entry.buttons.toggle.border.active
                                  : theme.entry.buttons.toggle.border.inactive,
                              borderWidth: 1,
                              borderRadius: 5,
                            }}>
                            {emotion.icon(tempEmotions.emotion === i)}
                            <Text
                              allowFontScaling={false}
                              key={i}
                              style={{
                                fontWeight: 500,
                                color:
                                  tempEmotions.emotion === i
                                    ? theme.entry.buttons.toggle.text.active
                                    : theme.entry.buttons.toggle.text.inactive,
                              }}>
                              {emotion.txt}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                <View
                  style={{
                    paddingHorizontal: horizontalScale(10),
                    paddingVertical: verticalScale(10),
                  }}>
                  <View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <FileIcon />
                        <Text allowFontScaling={false}>Detailed Breakdown</Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: theme.entry.tags.background,
                          borderRadius: 10,
                          paddingHorizontal: horizontalScale(8),
                          paddingVertical: verticalScale(5),
                        }}>
                        <Text
                          allowFontScaling={false}
                          style={{
                            color: theme.entry.tags.text,
                            fontWeight: 500,
                          }}>
                          {
                            entry.emotions.filter(
                              extract => extract.emotion >= 0,
                            ).length
                          }{' '}
                          emotions logged
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <HelpIcon />
                      <Text allowFontScaling={false}>
                        Emotions added to individual journal items.
                      </Text>
                    </View>
                  </View>
                  {tempEmotions.emotions
                    .sort((a, b) => a.time - b.time)
                    .map((extract, extractIndex) => {
                      return (
                        <View key={extractIndex}>
                          <TimeDivider
                            currentTime={extract.time}
                            index={extractIndex}
                            previousTime={
                              extractIndex > 0
                                ? tempEmotions.emotions.sort(
                                    (a, b) => a.time - b.time,
                                  )[extractIndex - 1].time
                                : null
                            }
                          />
                          <EmotionItem
                            changeEmotion={newEmotion => {
                              var copyArray = [...tempEmotions.emotions];
                              var index = copyArray.findIndex(
                                extractCopy =>
                                  JSON.stringify(extractCopy) ===
                                  JSON.stringify(extract),
                              );
                              copyArray.splice(index, 1, {
                                ...extract,
                                emotion:
                                  copyArray[index].emotion === newEmotion
                                    ? -1
                                    : newEmotion,
                              });
                              setTempEmotions({
                                ...tempEmotions,
                                emotions: copyArray,
                              });
                            }}
                            extract={{
                              ...extract,
                              string:
                                extract.string !== undefined
                                  ? extract.string
                                  : entry.entry.substring(
                                      extract.startIndex,
                                      extract.endIndex,
                                    ),
                            }}
                            extractIndex={extractIndex}
                          />
                        </View>
                      );
                    })}
                </View>
              </ScrollView>
            </View>
          )}
          {/* Events */}
          {modalScreen === 5 && (
            <View style={{width: '100%'}}>
              <ModalScreenHeader
                close={() => {
                  setModalVisible(false);
                }}
                icon={<></>}
                title={'Events'}
                update={() => {}}
                updateable={true}
              />
              {entry.events.length > 0 ? (
                <ScrollView
                  ref={EmotionScrollViewRef}
                  onLayout={() => {
                    if (recentEvent) {
                      EmotionScrollViewRef.current?.scrollToEnd({
                        animated: true,
                      });
                    }
                  }}
                  style={{height: '90%'}}
                  contentContainerStyle={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: verticalScale(20),
                    paddingHorizontal: horizontalScale(20),
                    paddingVertical: verticalScale(20),
                  }}>
                  {entry.events?.map((event, i) => (
                    <View
                      key={i}
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          alignItems: 'center',
                          backgroundColor:
                            theme.entry.modal.events.id.background,
                          paddingHorizontal: horizontalScale(5),
                          paddingVertical: verticalScale(5),
                        }}>
                        <Text allowFontScaling={false}>{event.id}</Text>
                      </View>
                      <View
                        style={{
                          display: 'flex',
                          flexGrow: 1,
                          paddingHorizontal: horizontalScale(10),
                          paddingVertical: verticalScale(10),
                        }}>
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text allowFontScaling={false}>
                            {moment(event.time).format('LLL')}
                          </Text>
                          <View style={{display: 'flex', flexDirection: 'row'}}>
                            {event.type === 'location' && <LocationIcon />}
                            {event.type === 'calendar' && <CalendarIcon />}
                            <Text allowFontScaling={false}>
                              {event.type.charAt(0).toUpperCase() +
                                event.type.slice(1)}
                            </Text>
                          </View>
                        </View>
                        <Text
                          allowFontScaling={false}
                          style={{fontWeight: 600}}>
                          {event.title}
                        </Text>
                        {event.type === 'calendar' && (
                          <View
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: horizontalScale(5),
                            }}>
                            <View
                              style={{
                                width: horizontalScale(10),
                                height: verticalScale(10),
                                borderRadius: 10,
                                backgroundColor: event.calendar.color,
                              }}
                            />
                            <Text allowFontScaling={false}>
                              {event.calendar.title}
                            </Text>
                          </View>
                        )}
                        {console.log(event)}
                        {event.type === 'photo' ? (
                          <>
                            <View
                              style={{
                                height: verticalScale(100),
                                width: horizontalScale(100),
                              }}>
                              <ImageAsset
                                localIdentifier={event.localIdentifier}
                                setHeight={100}
                                setWidth={100}
                                // height={1}
                                style={{flex: 1, height: '100%', width: '100%'}}
                              />
                            </View>
                            <Text allowFontScaling={false}>
                              {event.description}
                            </Text>
                            {event.lat ? (
                              <>
                                <Text allowFontScaling={false}>
                                  {event.loc}
                                </Text>
                              </>
                            ) : (
                              <>
                                <Text allowFontScaling={false}>
                                  No location or Photo was downloaded
                                </Text>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <Text allowFontScaling={false}>
                              {event.additionalNotes}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View>
                  <Text allowFontScaling={false}>
                    There are no events for this entry
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
      <EntryHeader
        countedWords={entry.entry.match(/(\w+)/g)?.length || 0}
        emotionsLength={entry.emotions.length}
        tagsLength={entry.tags.length}
        votesLength={entry.votes.filter(vote => vote.vote !== 0).length}
      />
      <EntryInput
        changeTitle={text =>
          setEntry({
            ...entry,
            title: text,
            origins: {
              ...entry.origins,
              title: {time: Date.now(), source: 'manual'},
            },
          })
        }
        title={entry.title}
        changeEntry={updateEntry}
        entry={entry.entry}
        onContextMenu={({nativeEvent: {nativeEventMenu}}) => {
          console.log(nativeEventMenu);
          setRecentEvent(nativeEventMenu);
        }}
        isKeyboardVisible={isKeyboardVisible}
      />
      {/* <Text allowFontScaling={false}Input placeholder="Hey" /> */}
      <EntryFooter
        openModalScreen={screen => {
          setModalScreen(screen);
          setModalVisible(true);
        }}
        setTempEmotions={() => {
          setTempEmotions({emotions: entry.emotions, emotion: entry.emotion});
        }}
        setTempEntry={() => {
          setTempEntry(entry.entry);
        }}
        setTempTitle={() => {
          setTempTitle(entry.title);
        }}
        setTempVotes={() => {
          setTempVotes(entry.votes);
        }}
        setCurrentDate={() => {
          setCurrentDate(Date.now());
        }}
      />
    </SafeAreaView>
  );
};

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
        allowFontScaling={false}
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
          <Text allowFontScaling={false}>Events</Text>
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
          <Text allowFontScaling={false} style={{color: 'white'}}>
            {countedWords}
          </Text>
        </View>
        <Text
          allowFontScaling={false}
          style={{color: 'white', fontSize: moderateScale(13)}}>
          Words
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
          <ContentTaggingIcon width={17} height={16} fill={'white'} />
          <Text allowFontScaling={false} style={{color: 'white'}}>
            {tagsLength}
          </Text>
        </View>
        <Text
          allowFontScaling={false}
          style={{color: 'white', fontSize: moderateScale(13)}}>
          Tags
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
          <EmotionTaggingIcon width={17} height={16} stroke={'white'} />
          <Text allowFontScaling={false} style={{color: 'white'}}>
            {emotionsLength}
          </Text>
        </View>
        <Text
          allowFontScaling={false}
          style={{color: 'white', fontSize: moderateScale(13)}}>
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
          <Text allowFontScaling={false} style={{color: 'white'}}>
            {votesLength}
          </Text>
        </View>
        <Text
          allowFontScaling={false}
          style={{color: 'white', fontSize: moderateScale(13)}}>
          Votes
        </Text>
      </View>
    </View>
  );
};

const ModalScreenClose = ({close}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        close();
      }}
      style={{flexGrow: 1, flexBasis: 0, alignItems: 'flex-start'}}>
      <Text allowFontScaling={false}>Cancel</Text>
    </TouchableOpacity>
  );
};

const ModalScreenUpdate = ({update, updateable}) => {
  console.log({updateable});
  return (
    <TouchableOpacity
      onPress={() => {
        update();
      }}
      style={{
        flexGrow: 1,
        flexBasis: 0,
        alignItems: 'flex-end',
      }}>
      <Text
        allowFontScaling={false}
        style={{
          color: updateable
            ? theme.entry.modal.header.updateText.active
            : theme.entry.modal.header.updateText.inactive,
        }}>
        Update entry
      </Text>
    </TouchableOpacity>
  );
};

const AIRewriteTitle = ({
  entry,
  tempTitle,
  tempOrigins,
  currentDate,
  setTempTitle,
  loading,
  rewriteRequest,
}) => {
  return (
    <AIRewriteAttr
      changes={entry.title !== tempTitle}
      lengthen={async () => {
        rewriteRequest({attr: 'title', action: 'lengthen'});
      }}
      loading={loading}
      refresh={async () => {
        rewriteRequest({attr: 'title', action: 'new'});
      }}
      shorten={async () => {
        rewriteRequest({attr: 'title', action: 'shorten'});
      }}
      undo={() => {
        setTempTitle(entry.title);
      }}
      attribute={'title'}
      changedSince={
        tempTitle !== entry.title
          ? tempOrigins.title - currentDate
          : entry.origins.title.time - currentDate
      }
      isAutogenerated={
        entry.origins.title.source === 'auto' || entry.title !== tempTitle
      }
      title={'Entry Title'}
      tempValue={tempTitle}
    />
  );
};

const AIRewriteContents = ({
  entry,
  tempOrigins,
  currentDate,
  setTempEntry,
  loading,
  tempEntry,
  rewriteRequest,
}) => {
  return (
    <AIRewriteAttr
      attribute={'entry'}
      changedSince={
        tempEntry !== entry.entry
          ? tempOrigins.entry - currentDate
          : entry.origins.entry.time - currentDate
      }
      changes={entry.entry !== tempEntry}
      isAutogenerated={
        entry.origins.entry.source === 'auto' || entry.entry !== tempEntry
      }
      lengthen={async () => {
        rewriteRequest({attr: 'entry', action: 'lengthen'});
      }}
      loading={loading}
      refresh={async () => {
        rewriteRequest({attr: 'entry', action: 'new'});
      }}
      shorten={async () => {
        rewriteRequest({attr: 'entry', action: 'shorten'});
      }}
      title={'Entry Content'}
      undo={() => {
        setTempEntry(entry.entry);
      }}
      tempValue={tempEntry}
    />
  );
};

const AIRewriteAttr = ({
  isAutogenerated,
  title,
  changedSince,
  changes,
  loading,
  undo,
  refresh,
  shorten,
  lengthen,
  attribute,
  tempValue,
}) => {
  return (
    <View
      style={{
        backgroundColor: 'white',
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(10),
        gap: verticalScale(5),
      }}>
      <Text
        allowFontScaling={false}
        style={{
          color: theme.general.strongText,
          fontSize: 16,
          fontWeight: 600,
        }}>
        {title}
      </Text>
      <View
        style={{
          height: verticalScale(0.5),
          backgroundColor: theme.entry.modal.divider,
        }}
      />
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {isAutogenerated ? (
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              backgroundColor: theme.entry.tags.background,
              borderRadius: 10,
              paddingHorizontal: horizontalScale(10),
              paddingVertical: verticalScale(3),
            }}>
            <AIRewriteIcon
              width={17}
              height={16}
              stroke={theme.entry.buttons.toggle.icon.active}
            />
            <Text
              allowFontScaling={false}
              style={{
                color: theme.entry.tags.text,
                fontWeight: 500,
              }}>
              Auto-generated{' '}
              {changedSince === null
                ? ''
                : getDifferenceUnit(Math.abs(changedSince))}
            </Text>
          </View>
        ) : (
          <View>
            <Text allowFontScaling={false}>Manual</Text>
          </View>
        )}
        <AIRewriteOptions
          changes={changes}
          lengthen={lengthen}
          loading={loading}
          refresh={refresh}
          shorten={shorten}
          undo={undo}
          attribute={attribute}
        />
      </View>
      {attribute === 'entry' ? (
        <ScrollView style={{height: verticalScale(200)}}>
          <Text allowFontScaling={false}>{tempValue}</Text>
        </ScrollView>
      ) : (
        <Text
          allowFontScaling={false}
          style={{fontSize: moderateScale(18), fontWeight: 600}}>
          {tempValue}
        </Text>
      )}
    </View>
  );
};

const ModalScreenTitle = ({icon, title}) => {
  return (
    <View style={{display: 'flex', flexDirection: 'row'}}>
      {icon}
      <Text
        allowFontScaling={false}
        style={{fontSize: moderateScale(20), fontWeight: 600}}>
        {title}
      </Text>
    </View>
  );
};

const ModalScreenHeader = ({close, update, updateable, icon, title}) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // padding: 10,
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(10),
        // backgroundColor: 'black',
      }}>
      <ModalScreenClose
        close={() => {
          close();
        }}
      />
      <ModalScreenTitle title={title} icon={icon} />
      <ModalScreenUpdate
        update={() => {
          update();
        }}
        updateable={updateable}
      />
    </View>
  );
};

const AIRewriteOptions = ({
  loading,
  changes,
  undo,
  refresh,
  shorten,
  lengthen,
  attribute,
}) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: horizontalScale(5),
      }}>
      {changes && (
        <TouchableOpacity
          onPress={() => {
            undo();
          }}
          style={{
            backgroundColor:
              theme.entry.buttons.requestRewrite.background.inactive,
            // padding: 2.5,
            paddingHorizontal: horizontalScale(2.5),
            paddingVertical: verticalScale(2.5),
            borderRadius: 3,
          }}>
          <UndoIcon />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={async () => {
          refresh();
        }}
        style={{
          backgroundColor:
            loading.attribute === attribute && loading.action === 'new'
              ? theme.entry.buttons.requestRewrite.background.active
              : theme.entry.buttons.requestRewrite.background.inactive,
          paddingHorizontal: horizontalScale(2.5),
          paddingVertical: verticalScale(2.5),
          borderRadius: 3,
          borderWidth: 1,
          borderColor:
            loading.attribute === attribute && loading.action === 'new'
              ? theme.entry.buttons.requestRewrite.border.active
              : theme.entry.buttons.requestRewrite.border.inactive,
        }}>
        <RefreshIcon
          stroke={
            loading.attribute === attribute && loading.action === 'new'
              ? theme.entry.buttons.requestRewrite.icon.active
              : theme.entry.buttons.requestRewrite.icon.inactive
          }
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={async () => {
          shorten();
        }}
        style={{
          backgroundColor:
            loading.attribute === attribute && loading.action === 'shorten'
              ? theme.entry.buttons.requestRewrite.background.active
              : theme.entry.buttons.requestRewrite.background.inactive,
          paddingHorizontal: horizontalScale(2.5),
          paddingVertical: verticalScale(2.5),
          borderRadius: 3,
          borderWidth: 1,
          borderColor:
            loading.attribute === attribute && loading.action === 'shorten'
              ? theme.entry.buttons.requestRewrite.border.active
              : theme.entry.buttons.requestRewrite.border.inactive,
        }}>
        <MenuIcon
          stroke={
            loading.attribute === attribute && loading.action === 'shorten'
              ? theme.entry.buttons.requestRewrite.icon.active
              : theme.entry.buttons.requestRewrite.icon.inactive
          }
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          lengthen();
        }}
        style={{
          backgroundColor:
            loading.attribute === attribute && loading.action === 'lengthen'
              ? theme.entry.buttons.requestRewrite.background.active
              : theme.entry.buttons.requestRewrite.background.inactive,
          paddingHorizontal: horizontalScale(2.5),
          paddingVertical: verticalScale(2.5),
          borderRadius: 3,
          borderWidth: 1,
          borderColor:
            loading.attribute === attribute && loading.action === 'lengthen'
              ? theme.entry.buttons.requestRewrite.border.active
              : theme.entry.buttons.requestRewrite.border.inactive,
        }}>
        <AlignLeft
          stroke={
            loading.attribute === attribute && loading.action === 'lengthen'
              ? theme.entry.buttons.requestRewrite.icon.active
              : theme.entry.buttons.requestRewrite.icon.inactive
          }
        />
      </TouchableOpacity>
    </View>
  );
};

const TimeDivider = ({previousTime, currentTime, index}) => {
  const isSameDay = (first, second) => {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  };

  const DividerLine = ({height}) => {
    return (
      <View
        style={{
          alignSelf: 'center',
          width: horizontalScale(2),
          height: verticalScale(height),
          backgroundColor: theme.general.timeDivider,
        }}
      />
    );
  };

  const isDifferentDay =
    previousTime === null
      ? false
      : !isSameDay(new Date(previousTime), new Date(currentTime));
  const isDifferentHour =
    previousTime === null
      ? false
      : new Date(previousTime).getHours() !== new Date(currentTime).getHours();

  return (
    <>
      <View
        style={{
          alignItems: 'center',
        }}>
        {index === 0 ? (
          <>
            <DividerLine height={20} />
            <Text
              allowFontScaling={false}
              style={{
                color: theme.general.timeText,
                paddingLeft: horizontalScale(3),
                fontWeight: 600,
              }}>
              {moment(currentTime).format('L')}
            </Text>
            <DividerLine height={10} />
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(5),
              }}>
              <ClockIcon />
              <Text
                allowFontScaling={false}
                style={{color: theme.general.timeText}}>
                {new Date(currentTime).getHours()}:00
              </Text>
            </View>
            <DividerLine height={20} />
          </>
        ) : (
          <>
            {isDifferentDay && (
              <>
                <DividerLine height={isDifferentHour ? 20 : 10} />
                <Text
                  allowFontScaling={false}
                  style={{
                    color: theme.general.timeText,
                    paddingLeft: horizontalScale(3),
                    fontWeight: 600,
                  }}>
                  {moment(currentTime).format('L')}
                </Text>
              </>
            )}
            <DividerLine height={10} />
            {isDifferentHour && (
              <>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: horizontalScale(5),
                  }}>
                  <ClockIcon />
                  <Text
                    allowFontScaling={false}
                    style={{color: theme.general.timeText}}>
                    {new Date(currentTime).getHours()}:00
                  </Text>
                </View>
                <DividerLine height={isDifferentDay ? 20 : 10} />
              </>
            )}
          </>
        )}
      </View>
    </>
  );
};

const EmotionItem = ({extract, changeEmotion}) => {
  return (
    <View
      style={{
        backgroundColor: 'white',
        // padding: 10,
        // gap: 5,
        paddingVertical: verticalScale(10),
        paddingHorizontal: horizontalScale(10),
        gap: verticalScale(5),
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: horizontalScale(10),
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: verticalScale(35),
            // paddingVertical: verticalScale(10),
            paddingHorizontal: horizontalScale(10),
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <FileIcon />
            <Text
              allowFontScaling={false}
              style={{fontSize: moderateScale(14)}}>
              Item
            </Text>
          </View>
          {extract.emotion > -1 ? (
            <View
              style={{
                backgroundColor: theme.entry.tags.background,
                borderRadius: 10,
                paddingVertical: verticalScale(1),
                paddingHorizontal: horizontalScale(6),
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {emotions[extract.emotion].icon(true)}
              <Text
                allowFontScaling={false}
                style={{
                  color: theme.entry.tags.text,
                  fontWeight: 500,
                }}>
                {emotions[extract.emotion].txt}
              </Text>
            </View>
          ) : (
            <View />
          )}
        </View>
        <View
          style={{
            backgroundColor: theme.entry.modal.background,
            display: 'flex',
            flexDirection: 'row',
            paddingVertical: verticalScale(7),
            paddingHorizontal: horizontalScale(7),
            gap: horizontalScale(2),
            width: '100%',
          }}>
          <View
            style={{
              width: horizontalScale(2),
              height: 'auto',
              backgroundColor: theme.entry.background,
            }}
          />
          <Text
            allowFontScaling={false}
            style={{
              color: theme.general.strongText,
              fontSize: moderateScale(15),
            }}>
            {extract.string}
          </Text>
        </View>

        {emotions.map((emotion, i) => {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                changeEmotion(i);
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: verticalScale(3),
                  paddingHorizontal: horizontalScale(3),
                  gap: horizontalScale(2),
                  backgroundColor:
                    extract.emotion === i
                      ? theme.entry.buttons.toggle.background.active
                      : theme.entry.buttons.toggle.background.inactive,
                  borderColor:
                    extract.emotion === i
                      ? theme.entry.buttons.toggle.border.active
                      : theme.entry.buttons.toggle.border.inactive,
                  borderWidth: 1,
                  borderRadius: 5,
                }}>
                {emotion.icon(extract.emotion === i)}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
