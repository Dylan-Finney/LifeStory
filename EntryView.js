import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  Button,
  KeyboardAvoidingView,
  Modal,
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
import FaceFrownIcon from './src/assets/face-frown.svg';
import FaceHappyIcon from './src/assets/face-happy.svg';
import FaceNeutralIcon from './src/assets/face-neutral.svg';
import FaceSadIcon from './src/assets/face-sad.svg';
import MenuIcon from './src/assets/menu-icon.svg';
import RefreshIcon from './src/assets/refresh-icon.svg';
import AlignLeft from './src/assets/align-left-icon.svg';
import WordCountIcon from './src/assets/open-book.svg';
// import DownvoteIcon from './src/assets/downvote.svg';
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
import {ImageAsset} from './NativeImage';
import Config from 'react-native-config';

const diff = require('diff');
// import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
const {Configuration, OpenAIApi} = require('openai');
const configuration = new Configuration({
  apiKey: Config.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

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

export default App = ({route, navigation}) => {
  const {baseEntry} = route.params;

  const isDarkMode = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [modalScreen, setModalScreen] = useState(5);
  // const {entries, setEntries} = useContext(AppContext);
  const [writingSettings, setWritingSettings] = useState({
    tone: -1,
    emotion: -1,
  });
  const baseContentTags = [
    'Travel',
    'Personal',
    'Work',
    'Relationships',
    'Gratitude',
    'Health',
    'Achievements',
    'Growth',
    'Creativity',
    'Happiness',
    'Reflections',
    'Challenges',
    'Family',
    'Outdoors',
    'Lessons Learned',
    'Parenting',
    'Events & celebrations',
    'Nostalgia',
    'Books',
    'Movies',
    'Food',
    'Dining',
    'Fitness',
    'Dreams',
    'Goals',
    'Memories',
    'Inspiration',
  ];
  const toneTags = [
    'Informative',
    'Direct',
    'Professional',
    'Funny',
    'Reflective',
    'Creative',
    'Poetic',
  ];
  const emotionTags = [
    'Neutral',
    'Positive',
    'Excited',
    'Disheartened',
    'Sad',
    'Angry',
  ];
  const emotions = [
    {
      icon: picked => (
        <FaceSadIcon
          stroke={picked ? '#0AA2E8' : '#646E83'}
          height={20}
          width={25}
          strokeWidth={3.2}
        />
      ),
      txt: 'Annoyed',
    },
    {
      icon: picked => (
        <FaceFrownIcon
          stroke={picked ? '#0AA2E8' : '#646E83'}
          height={20}
          width={25}
          strokeWidth={3.2}
        />
      ),
      txt: 'Sad',
    },
    {
      icon: picked => (
        <FaceNeutralIcon
          stroke={picked ? '#0AA2E8' : '#646E83'}
          height={20}
          width={25}
          strokeWidth={3.2}
        />
      ),
      txt: 'Indifferent',
    },
    {
      icon: picked => (
        <EmotionTaggingIcon
          stroke={picked ? '#0AA2E8' : '#646E83'}
          height={20}
          strokeWidth={3.2}
        />
      ),
      txt: 'Good',
    },
    {
      icon: picked => (
        <FaceHappyIcon
          stroke={picked ? '#0AA2E8' : '#646E83'}
          height={20}
          width={25}
          strokeWidth={3.2}
        />
      ),
      txt: 'Great',
    },
  ];

  const [contentTags, setContentTags] = useState(baseContentTags);
  const EmotionScrollViewRef = createRef();
  const [customTagInput, setCustomTagInput] = useState('');

  // const baseEntry = {
  //   tags: [],
  //   time: Date.now(),
  //   emotion: -1,
  //   emotions: [
  //     {
  //       string: 'Today was a busy and productive day for me!',
  //       emotion: -1,
  //       time: Date.now(),
  //     },
  //     {
  //       string: 'Today was a busy and productive day for me!2',
  //       emotion: -1,
  //       time: 1689856646,
  //     },
  //     {
  //       string: 'Today was a busy and productive day for me!2',
  //       emotion: -1,
  //       time: 1689857646,
  //     },
  //   ],
  //   votes: [
  //     {
  //       string: 'Today was a busy and productive day for me!2',
  //       vote: 0,
  //       time: 1689856646,
  //     },
  //     {
  //       string: 'Today was a busy and productive day for me!',
  //       vote: 0,
  //       time: Date.now(),
  //     },
  //   ],
  //   title: 'Today was a good day',
  //   origins: {
  //     entry: {
  //       time: 0,
  //       source: 'auto',
  //     },
  //     title: {
  //       time: 0,
  //       source: 'manual',
  //     },
  //   },
  //   entryArr: [
  //     {
  //       ref: '',
  //       source: '',
  //       entry:
  //         'Today was a busy and productive day for me! In the morning, I had a team meeting to discuss exciting projects and milestones.',
  //     },
  //     {
  //       ref: '',
  //       source: '',
  //       entry:
  //         'Then, I met a client for lunch at this cool restaurant, Baba Mal where we talked about potential collaborations.',
  //     },
  //   ],
  //   entry:
  //     'Today was a good day. I want to the beach. It was fun. I even went swimming.',
  //   //     entry: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut commodo lectus sed ante tincidunt, a pretium dui placerat. Donec euismod felis sagittis lacus luctus dignissim. Suspendisse ac elit eget arcu pulvinar hendrerit id sed ipsum. Nulla commodo ultricies risus, vel scelerisque est facilisis vitae. Morbi venenatis consequat leo, rutrum pellentesque eros egestas et. Duis finibus enim eu felis egestas euismod. Morbi elementum, ipsum nec facilisis aliquet, erat ante gravida nisi, ut blandit elit magna ac nibh. Vestibulum cursus condimentum sapien sit amet facilisis. Sed id imperdiet arcu, in condimentum lacus.

  //   // Aenean feugiat mauris nisi, nec maximus nibh gravida sed. Curabitur cursus odio quis ante hendrerit vestibulum. Suspendisse fermentum augue pellentesque ante congue varius in quis dui. Proin auctor a neque vel aliquet. Nulla rhoncus neque ultrices pharetra venenatis. Aliquam porta est ut mollis hendrerit. Maecenas nunc libero, rhoncus id auctor at, iaculis quis arcu. Nam non rutrum ipsum. Vestibulum vehicula vitae lectus eget pretium. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Etiam feugiat convallis elit.

  //   // Etiam id massa efficitur, fermentum orci ac, maximus dolor. Pellentesque eget vulputate turpis. Ut non nisl orci. Fusce id felis cursus, semper quam id, laoreet ipsum. Ut felis enim, ultrices ac posuere at, semper vitae nunc. Cras tristique sagittis massa, ac viverra nibh eleifend a. Mauris posuere tristique felis, vel laoreet magna rutrum id. Ut aliquet auctor ornare. Curabitur elit mi, maximus in lacinia semper, mattis sit amet est. Mauris tempus tempor tortor id eleifend. Nullam sollicitudin consectetur lectus, quis efficitur erat viverra in. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;

  //   // `,
  // };
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
  const baseLoading = {attribute: '', action: '', stage: 0};
  const [loading, setLoading] = useState(baseLoading);

  const [recentEvent, setRecentEvent] = useState(null);
  const interval = useRef();
  const [currentDate, setCurrentDate] = useState(Date.now());
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const startTimer = () => {
    interval.current = setInterval(() => {
      setCurrentDate(Date.now());
    }, 1000);
  };
  useEffect(() => {
    // async function test() {
    //   const result = await launchImageLibrary();
    //   if (!result.didCancel && !result.errorCode) {
    //     console.log(result.assets);
    //   } else {
    //   }
    // }
    console.log('entry useeffect', {entry});
    // test();
  }, [entry]);
  useEffect(() => {
    console.log('useeffect', entry);
    navigation.setOptions({
      headerLeft: () => (
        <Button
          onPress={() => {
            // console.log('Before Back', entry);
            // var entriesCopy = entries
            //   .sort((a, b) => a.time - b.time)
            //   .sort((a, b) => moment(b.time).week() - moment(a.time).week());
            // console.log(entriesCopy);
            // entriesCopy.splice(route.params.entry.index, 1, route.params.entry);
            // console.log(entriesCopy);
            // setEntries(entriesCopy);
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
      // headerBackTitle: 'ahE',
    });
  }, [navigation, entry]);
  useEffect(() => {
    if (recentEvent) {
      let len = recentEvent.range
        .replace(/[{}]/g, '')
        .split(',')
        .map(val => parseInt(val));
      len[1] = len[0] + len[1];
      //len: [start, length]
      //end = start + length - 1
      // console.log(len);
      switch (recentEvent.action) {
        //Vote
        case 1.1:
        case 1.2:
        case 1.3:
          setModalVisible(true);
          setModalScreen(3);
          console.log({entry: entry.entry.substring(len[0], len[1])});
          // var newEntry = `${entry.entry.substring(
          //   0,
          //   len[0],
          // )}<emotion id=1>${entry.entry.substring(
          //   len[0],
          //   len[1],
          // )}</e>${entry.entry.substring(len[1], entry.entry.length)}`;

          // console.log({newEntry});
          setEntry({
            ...entry,
            votes: [
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
            ],
          });
          setTempVotes(entry.votes);
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
          setEntry({
            ...entry,
            emotions: [
              ...entry.emotions,
              {
                string: recentEvent.str,
                time: Date.now(),
                emotion:
                  recentEvent.action === 3.6
                    ? -1
                    : 4 +
                      1 -
                      parseInt((recentEvent.action - 3).toFixed(2) * 10),
              },
            ],
          });
          setTempEmotions({emotions: entry.emotions, emotion: entry.emotion});
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
    }
  }, [recentEvent]);

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
            backgroundColor: '#F2F4F7',
            flexGrow: 1,
          }}>
          <View
            style={{
              backgroundColor: '#B4B7BB',
              // backgroundColor: '#000',
              height: 5,
              minWidth: 150,
              maxWidth: 150,
              display: 'flex',
            }}
          />
          {modalScreen === 1 && (
            <View style={{width: '100%'}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 10,
                  // backgroundColor: '#000',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    onModalCloseCancel();
                  }}
                  style={{flexGrow: 1, flexBasis: 0, alignItems: 'flex-start'}}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                  <AIRewriteIcon stroke={'black'} />
                  <Text style={{fontSize: 20, fontWeight: 600}}>
                    AI Rewrite
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (recentEvent) {
                      setEntry({
                        ...entry,
                        entry:
                          entry.entry.substring(
                            0,
                            highlightedText.position[0],
                          ) +
                          highlightedText.str +
                          entry.entry.substring(
                            highlightedText.position[1] + 1,
                          ),
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
                      setModalVisible(false);
                    }
                  }}
                  style={{
                    flexGrow: 1,
                    flexBasis: 0,
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    style={{
                      color: recentEvent
                        ? highlightedText.str === recentEvent.str
                          ? '#D0D5DD'
                          : '#0BA5EC'
                        : tempEntry === entry.entry && tempTitle === entry.title
                        ? '#D0D5DD'
                        : '#0BA5EC',
                    }}>
                    Insert Text
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                style={{height: '90%'}}
                contentContainerStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  padding: 20,
                }}>
                {recentEvent ? (
                  <>
                    <View
                      style={{backgroundColor: '#fff', padding: 10, gap: 5}}>
                      <Text
                        style={{
                          color: '#475467',
                          fontSize: 16,
                          fontWeight: 600,
                        }}>
                        Highlighted Text
                      </Text>
                      <View style={{height: 0.5, backgroundColor: '#EAECF0'}} />
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <View>
                          <Text>Auto-generated</Text>
                        </View>
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 5,
                          }}>
                          <TouchableOpacity
                            onPress={async () => {
                              const messages = [
                                {
                                  role: 'system',
                                  content: `You are an editor. Rewrite the provided text${
                                    writingSettings.tone > -1
                                      ? ` in a ${
                                          toneTags[writingSettings.tone]
                                        } tone`
                                      : ''
                                  }${
                                    writingSettings.emotion > -1 &&
                                    writingSettings.tone > -1
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
                                  content: `Text: "${recentEvent.str}"`,
                                },
                              ];
                              const completion =
                                await openai.createChatCompletion({
                                  model: 'gpt-3.5-turbo',
                                  messages,
                                });
                              console.log({
                                messages,
                                completion:
                                  completion.data.choices[0].message.content,
                              });
                              setHighlightedText({
                                ...highlightedText,
                                str: completion.data.choices[0].message.content,
                              });
                            }}
                            style={{
                              backgroundColor: '#EAECF0',
                              padding: 2.5,
                              borderRadius: 3,
                            }}>
                            <RefreshIcon stroke={'#667085'} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#EAECF0',
                              padding: 2.5,
                              borderRadius: 3,
                            }}>
                            <MenuIcon />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#EAECF0',
                              padding: 2.5,
                              borderRadius: 3,
                            }}>
                            <AlignLeft />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <ScrollView style={{height: 200}}>
                        <Text>{highlightedText.str}</Text>
                      </ScrollView>
                    </View>
                  </>
                ) : (
                  <>
                    {/* Title */}
                    <View
                      style={{backgroundColor: '#fff', padding: 10, gap: 5}}>
                      <Text
                        style={{
                          color: '#475467',
                          fontSize: 16,
                          fontWeight: 600,
                        }}>
                        Entry title
                      </Text>
                      <View style={{height: 0.5, backgroundColor: '#EAECF0'}} />
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        {entry.origins.title.source === 'auto' ||
                        entry.title !== tempTitle ? (
                          <View
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              backgroundColor: '#EAF4FB',
                              borderRadius: 10,
                              paddingHorizontal: 10,
                              paddingVertical: 3,
                            }}>
                            <AIRewriteIcon
                              width={17}
                              height={16}
                              stroke={'#0AA2E8'}
                            />
                            <Text
                              style={{
                                color: '#02689F',
                                fontWeight: 500,
                              }}>
                              Auto-generated{' '}
                              {getDifferenceUnit(
                                Math.abs(
                                  tempTitle !== entry.title
                                    ? tempOrigins.title - currentDate
                                    : entry.origins.title.time - currentDate,
                                ),
                              )}
                            </Text>
                          </View>
                        ) : (
                          <View>
                            <Text>Manual</Text>
                          </View>
                        )}
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 5,
                          }}>
                          {entry.title !== tempTitle && (
                            <TouchableOpacity
                              onPress={() => {
                                setTempTitle(entry.title);
                              }}
                              style={{
                                backgroundColor: '#EAECF0',
                                padding: 2.5,
                                borderRadius: 3,
                              }}>
                              <UndoIcon />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={async () => {
                              setLoading({
                                attribute: 'title',
                                action: 'new',
                                stage: 1,
                              });
                              const messages = [
                                {
                                  role: 'system',
                                  content:
                                    'You are a title rewriter. Given a diary entry, provide a suitable diary entry title that adheres to the provided tone and emotion. The title should be picked based on the contents of the diary entry. Respond with just the title, e.g. Today was a good day.',
                                },
                                {
                                  role: 'user',
                                  content: `${
                                    writingSettings.tone > -1
                                      ? `Tone: ${
                                          toneTags[writingSettings.tone]
                                        }`
                                      : ''
                                  } ${
                                    writingSettings.emotion > -1
                                      ? `Emotion: ${
                                          emotionTags[writingSettings.emotion]
                                        }`
                                      : ''
                                  } Diary Entry: "${tempEntry}"`,
                                },
                              ];
                              const completion =
                                await openai.createChatCompletion({
                                  model: 'gpt-3.5-turbo',
                                  messages,
                                });
                              console.log({
                                messages,
                                completion:
                                  completion.data.choices[0].message.content,
                              });
                              setTempTitle(
                                completion.data.choices[0].message.content,
                              );
                              setLoading(baseEntry);
                              setTempOrigins({
                                ...tempOrigins,
                                title: Date.now(),
                              });
                            }}
                            style={{
                              backgroundColor:
                                loading.attribute === 'title' &&
                                loading.action === 'new'
                                  ? '#DAEDFA'
                                  : '#EAECF0',
                              padding: 2.5,
                              borderRadius: 3,
                              borderWidth: 1,
                              borderColor:
                                loading.attribute === 'title' &&
                                loading.action === 'new'
                                  ? '#0AA2E8'
                                  : '#EAECF0',
                            }}>
                            <RefreshIcon
                              stroke={
                                loading.attribute === 'title' &&
                                loading.action === 'new'
                                  ? '#02689F'
                                  : '#667085'
                              }
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={async () => {
                              setLoading({
                                attribute: 'title',
                                action: 'shorten',
                                stage: 1,
                              });
                              const messages = [
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
                              const completion =
                                await openai.createChatCompletion({
                                  model: 'gpt-3.5-turbo',
                                  messages,
                                });
                              console.log({
                                messages,
                                completion:
                                  completion.data.choices[0].message.content,
                              });
                              setTempTitle(
                                completion.data.choices[0].message.content,
                              );
                              setLoading(baseEntry);
                              setTempOrigins({
                                ...tempOrigins,
                                title: Date.now(),
                              });
                            }}
                            style={{
                              backgroundColor:
                                loading.attribute === 'title' &&
                                loading.action === 'shorten'
                                  ? '#DAEDFA'
                                  : '#EAECF0',
                              padding: 2.5,
                              borderRadius: 3,
                              borderWidth: 1,
                              borderColor:
                                loading.attribute === 'title' &&
                                loading.action === 'shorten'
                                  ? '#0AA2E8'
                                  : '#EAECF0',
                            }}>
                            <MenuIcon
                              stroke={
                                loading.attribute === 'title' &&
                                loading.action === 'shorten'
                                  ? '#02689F'
                                  : '#667085'
                              }
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={async () => {
                              setLoading({
                                attribute: 'title',
                                action: 'lengthen',
                                stage: 1,
                              });
                              const messages = [
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
                              const completion =
                                await openai.createChatCompletion({
                                  model: 'gpt-3.5-turbo',
                                  messages,
                                });
                              console.log({
                                messages,
                                completion:
                                  completion.data.choices[0].message.content,
                              });
                              setTempTitle(
                                completion.data.choices[0].message.content,
                              );
                              setLoading(baseEntry);
                              setTempOrigins({
                                ...tempOrigins,
                                title: Date.now(),
                              });
                            }}
                            style={{
                              backgroundColor:
                                loading.attribute === 'title' &&
                                loading.action === 'lengthen'
                                  ? '#DAEDFA'
                                  : '#EAECF0',
                              padding: 2.5,
                              borderRadius: 3,
                              borderWidth: 1,
                              borderColor:
                                loading.attribute === 'title' &&
                                loading.action === 'lengthen'
                                  ? '#0AA2E8'
                                  : '#EAECF0',
                            }}>
                            <AlignLeft
                              stroke={
                                loading.attribute === 'title' &&
                                loading.action === 'lengthen'
                                  ? '#02689F'
                                  : '#667085'
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={{fontSize: 18, fontWeight: 600}}>
                        {tempTitle}
                      </Text>
                    </View>
                    {/* Content */}
                    <View
                      style={{backgroundColor: '#fff', padding: 10, gap: 5}}>
                      <Text
                        style={{
                          color: '#475467',
                          fontSize: 16,
                          fontWeight: 600,
                        }}>
                        Entry Content
                      </Text>
                      <View style={{height: 0.5, backgroundColor: '#EAECF0'}} />
                      <View
                        style={{
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        {entry.origins.entry.source === 'auto' ||
                        entry.entry !== tempEntry ? (
                          <View
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              backgroundColor: '#EAF4FB',
                              borderRadius: 10,
                              paddingHorizontal: 10,
                              paddingVertical: 3,
                            }}>
                            <AIRewriteIcon
                              width={17}
                              height={16}
                              stroke={'#0AA2E8'}
                            />
                            <Text
                              style={{
                                color: '#02689F',
                                fontWeight: 500,
                              }}>
                              Auto-generated{' '}
                              {getDifferenceUnit(
                                Math.abs(
                                  tempEntry !== entry.entry
                                    ? tempOrigins.entry - currentDate
                                    : entry.origins.entry.time - currentDate,
                                ),
                              )}
                            </Text>
                          </View>
                        ) : (
                          <View>
                            <Text>Manual</Text>
                          </View>
                        )}

                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 5,
                          }}>
                          {entry.entry !== tempEntry && (
                            <TouchableOpacity
                              onPress={() => {
                                setTempEntry(entry.entry);
                              }}
                              style={{
                                backgroundColor: '#EAECF0',
                                padding: 2.5,
                                borderRadius: 3,
                              }}>
                              <UndoIcon />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={async () => {
                              setLoading({
                                attribute: 'entry',
                                action: 'new',
                                stage: 1,
                              });
                              const messages = [
                                {
                                  role: 'system',
                                  content:
                                    'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone. The diary entry should be based on the current contents of the diary entry. Keep it short. Respond with just the diary entry contents, e.g. Today was a good day.',
                                },
                                {
                                  role: 'user',
                                  content: `${
                                    writingSettings.tone > -1
                                      ? `Tone: ${
                                          toneTags[writingSettings.tone]
                                        }`
                                      : ''
                                  } ${
                                    writingSettings.emotion > -1
                                      ? `Emotion: ${
                                          emotionTags[writingSettings.emotion]
                                        }`
                                      : ''
                                  } Diary Entry: "${tempEntry}"`,
                                },
                              ];
                              const completion =
                                await openai.createChatCompletion({
                                  model: 'gpt-3.5-turbo',
                                  messages,
                                });
                              console.log({
                                messages,
                                completion:
                                  completion.data.choices[0].message.content,
                                origins: Date.now(),
                                currentDate,
                              });
                              setTempEntry(
                                completion.data.choices[0].message.content,
                              );
                              setLoading(baseLoading);
                              setTempOrigins({
                                ...tempOrigins,
                                entry: Date.now(),
                              });
                            }}
                            style={{
                              backgroundColor:
                                loading.attribute === 'entry' &&
                                loading.action === 'new'
                                  ? '#DAEDFA'
                                  : '#EAECF0',
                              padding: 2.5,
                              borderRadius: 3,
                              borderWidth: 1,
                              borderColor:
                                loading.attribute === 'entry' &&
                                loading.action === 'new'
                                  ? '#0AA2E8'
                                  : '#EAECF0',
                            }}>
                            <RefreshIcon
                              stroke={
                                loading.attribute === 'entry' &&
                                loading.action === 'new'
                                  ? '#02689F'
                                  : '#667085'
                              }
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={async () => {
                              setLoading({
                                attribute: 'entry',
                                action: 'shorten',
                                stage: 1,
                              });
                              const messages = [
                                {
                                  role: 'system',
                                  content:
                                    'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone, and shorten the entry such that it provides the same information in less characters. The diary entry should be based on the current contents of the diary entry. Respond with just the diary entry contents, e.g. Today was a good day.',
                                },
                                {
                                  role: 'user',
                                  content: `${
                                    writingSettings.tone > -1
                                      ? `Tone: ${
                                          toneTags[writingSettings.tone]
                                        }`
                                      : ''
                                  } ${
                                    writingSettings.emotion > -1
                                      ? `Emotion: ${
                                          emotionTags[writingSettings.emotion]
                                        }`
                                      : ''
                                  } Diary Entry: "${tempEntry}"`,
                                },
                              ];
                              const completion =
                                await openai.createChatCompletion({
                                  model: 'gpt-3.5-turbo',
                                  messages,
                                });
                              console.log({
                                messages,
                                completion:
                                  completion.data.choices[0].message.content,
                              });
                              setTempEntry(
                                completion.data.choices[0].message.content,
                              );
                              setLoading(baseLoading);
                              setTempOrigins({
                                ...tempOrigins,
                                entry: Date.now(),
                              });
                            }}
                            style={{
                              backgroundColor:
                                loading.attribute === 'entry' &&
                                loading.action === 'shorten'
                                  ? '#DAEDFA'
                                  : '#EAECF0',
                              padding: 2.5,
                              borderRadius: 3,
                              borderWidth: 1,
                              borderColor:
                                loading.attribute === 'entry' &&
                                loading.action === 'shorten'
                                  ? '#0AA2E8'
                                  : '#EAECF0',
                            }}>
                            <MenuIcon
                              stroke={
                                loading.attribute === 'entry' &&
                                loading.action === 'shorten'
                                  ? '#02689F'
                                  : '#667085'
                              }
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={async () => {
                              setLoading({
                                attribute: 'entry',
                                action: 'lengthen',
                                stage: 1,
                              });
                              const messages = [
                                {
                                  role: 'system',
                                  content:
                                    'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone, and lengthen the entry such that it provides the same information in more characters. The diary entry should be based on the current contents of the diary entry. Respond with just the diary entry contents, e.g. Today was a good day.',
                                },
                                {
                                  role: 'user',
                                  content: `${
                                    writingSettings.tone > -1
                                      ? `Tone: ${
                                          toneTags[writingSettings.tone]
                                        }`
                                      : ''
                                  } ${
                                    writingSettings.emotion > -1
                                      ? `Emotion: ${
                                          emotionTags[writingSettings.emotion]
                                        }`
                                      : ''
                                  } Diary Entry: "${tempEntry}"`,
                                },
                              ];
                              const completion =
                                await openai.createChatCompletion({
                                  model: 'gpt-3.5-turbo',
                                  messages,
                                });
                              console.log({
                                messages,
                                completion:
                                  completion.data.choices[0].message.content,
                              });
                              setTempEntry(
                                completion.data.choices[0].message.content,
                              );
                              setLoading(baseLoading);
                              setTempOrigins({
                                ...tempOrigins,
                                entry: Date.now(),
                              });
                            }}
                            style={{
                              backgroundColor:
                                loading.attribute === 'entry' &&
                                loading.action === 'lengthen'
                                  ? '#DAEDFA'
                                  : '#EAECF0',
                              padding: 2.5,
                              borderRadius: 3,
                              borderWidth: 1,
                              borderColor:
                                loading.attribute === 'entry' &&
                                loading.action === 'lengthen'
                                  ? '#0AA2E8'
                                  : '#EAECF0',
                            }}>
                            <AlignLeft
                              stroke={
                                loading.attribute === 'entry' &&
                                loading.action === 'lengthen'
                                  ? '#02689F'
                                  : '#667085'
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <ScrollView style={{height: 200}}>
                        <Text>{tempEntry}</Text>
                      </ScrollView>
                    </View>
                  </>
                )}
                <View style={{backgroundColor: '#fff', padding: 10, gap: 5}}>
                  <Text
                    style={{color: '#475467', fontSize: 16, fontWeight: 600}}>
                    Writing settings
                  </Text>
                  <Text
                    style={{color: '#475467', fontSize: 12, fontWeight: 500}}>
                    Customize output by using the options below
                  </Text>
                  <View style={{height: 0.5, backgroundColor: '#EAECF0'}} />
                  <View
                    style={{
                      padding: 10,
                      borderColor: '#EAECF0',
                      borderWidth: 1,
                      borderRadius: 5,
                    }}>
                    <Text
                      style={{padding: 2, paddingBottom: 10, fontWeight: 500}}>
                      Tone
                    </Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}>
                      {toneTags.map((toneStr, i) => {
                        return (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              setWritingSettings({...writingSettings, tone: i});
                            }}>
                            <View
                              style={{
                                backgroundColor:
                                  writingSettings.tone === i
                                    ? '#F0F9FF'
                                    : '#EAECF0',
                                borderColor:
                                  writingSettings.tone === i
                                    ? '#0BA5EC'
                                    : '#EAECF0',
                                borderWidth: 1,
                                borderRadius: 5,
                              }}>
                              <Text
                                key={i}
                                style={{
                                  padding: 5,
                                  color:
                                    writingSettings.tone === i
                                      ? '#026AA2'
                                      : '#344054',
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
                      padding: 10,
                      borderColor: '#EAECF0',
                      borderWidth: 1,
                      borderRadius: 5,
                    }}>
                    <Text
                      style={{padding: 2, paddingBottom: 10, fontWeight: 500}}>
                      Emotion
                    </Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}>
                      {emotionTags.map((emotionStr, i) => {
                        return (
                          <TouchableOpacity
                            key={i}
                            onPress={() => {
                              setWritingSettings({
                                ...writingSettings,
                                emotion: i,
                              });
                            }}>
                            <View
                              style={{
                                backgroundColor:
                                  writingSettings.emotion === i
                                    ? '#F0F9FF'
                                    : '#EAECF0',
                                borderColor:
                                  writingSettings.emotion === i
                                    ? '#0BA5EC'
                                    : '#EAECF0',
                                borderWidth: 1,
                                borderRadius: 5,
                              }}>
                              <Text
                                key={i}
                                style={{
                                  padding: 5,
                                  color:
                                    writingSettings.emotion === i
                                      ? '#026AA2'
                                      : '#344054',
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
          {modalScreen === 2 && (
            <View style={{width: '100%'}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 10,
                  // backgroundColor: '#000',
                }}>
                <View style={{flexGrow: 1, flexBasis: 0}} />
                <View style={{display: 'flex', flexDirection: 'row'}}>
                  <ContentTaggingIcon />
                  <Text style={{fontSize: 20, fontWeight: 600}}>
                    Content Tagging
                  </Text>
                </View>

                <View
                  style={{flexGrow: 1, flexBasis: 0, alignItems: 'flex-end'}}>
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                    }}>
                    <Text style={{color: '#0BA5EC', fontWeight: 600}}>
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView
                style={{height: '90%'}}
                contentContainerStyle={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                  padding: 20,
                }}>
                <View style={{backgroundColor: '#F9FAFB', padding: 10, gap: 5}}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 10,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{color: '#475467', fontSize: 16, fontWeight: 600}}>
                      Monday 06/01/23
                    </Text>
                    <Text
                      style={{
                        color: '#026AA2',
                        fontSize: 14,
                        fontWeight: 500,
                        backgroundColor: '#F0F9FF',
                        padding: 3,
                        borderRadius: 5,
                      }}>
                      {entry.tags.length} tags applied
                    </Text>
                  </View>

                  <Text
                    style={{color: '#475467', fontSize: 16, fontWeight: 600}}>
                    Tagging helps your group and find content easily
                  </Text>
                  <View style={{height: 0.5, backgroundColor: '#EAECF0'}} />
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <TextInput
                      style={{
                        backgroundColor: '#fff',
                        padding: 10,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#D0D5DD',
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
                        right: 10,
                        backgroundColor: '#F2F4F7',
                        padding: 5,
                        borderRadius: 5,
                      }}>
                      {/* <View> */}
                      <Text style={{color: '#475467'}}>↵Submit</Text>
                      {/* </View> */}
                    </TouchableOpacity>
                  </View>

                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 10,
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
                                ? '#F0F9FF'
                                : '#EAECF0',
                              borderColor: entry.tags.includes(tagStr)
                                ? '#0BA5EC'
                                : '#EAECF0',
                              borderWidth: 1,
                              borderRadius: 5,
                            }}>
                            <Text
                              key={i}
                              style={{
                                padding: 5,
                                color: entry.tags.includes(tagStr)
                                  ? '#026AA2'
                                  : '#344054',
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
          {modalScreen === 3 && (
            <View style={{width: '100%'}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 10,
                  // backgroundColor: '#000',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    onModalCloseCancel();
                  }}
                  style={{flexGrow: 1, flexBasis: 0, alignItems: 'flex-start'}}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                  <ContentVotingIcon stroke={'black'} />
                  <Text style={{fontSize: 20, fontWeight: 600}}>
                    Content Voting
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setEntry({
                      ...entry,
                      votes: tempVotes,
                    });
                    setModalVisible(false);
                  }}
                  style={{
                    flexGrow: 1,
                    flexBasis: 0,
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    style={{
                      color: recentEvent
                        ? highlightedText.str === recentEvent.str
                          ? '#D0D5DD'
                          : '#0BA5EC'
                        : tempEntry === entry.entry && tempTitle === entry.title
                        ? '#D0D5DD'
                        : '#0BA5EC',
                    }}>
                    Update entry
                  </Text>
                </TouchableOpacity>
              </View>
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
                  padding: 20,
                }}>
                <View>
                  {tempVotes
                    .sort((a, b) => a.time - b.time)
                    .map((extract, extractIndex) => {
                      return (
                        <View key={extractIndex}>
                          {/* {extractIndex > 0 && (
                          <>
                            {console.log({
                              a: new Date(
                                entry.emotions.sort((a, b) => a.time - b.time)[
                                  extractIndex - 1
                                ].time,
                              ).getHours(),
                              b: new Date(extract.time).getHours(),
                            })}
                          </>
                        )} */}
                          {extractIndex === 0 ||
                          new Date(
                            tempVotes.sort((a, b) => a.time - b.time)[
                              extractIndex - 1
                            ].time,
                          ).getHours() !== new Date(extract.time).getHours() ? (
                            <View
                              style={{
                                alignItems: 'center',
                              }}>
                              <View
                                style={{
                                  alignSelf: 'center',
                                  width: 2,
                                  height: 20,
                                  backgroundColor: '#D0D5DD',
                                }}
                              />
                              <View
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 5,
                                }}>
                                <ClockIcon />
                                <Text style={{color: '#667085'}}>
                                  {new Date(extract.time).getHours()}:00
                                </Text>
                              </View>

                              <View
                                style={{
                                  alignSelf: 'center',
                                  width: 2,
                                  height: 20,
                                  backgroundColor: '#D0D5DD',
                                }}
                              />
                            </View>
                          ) : (
                            <View
                              style={{
                                alignSelf: 'center',
                                width: 2,
                                height: 15,
                                backgroundColor: '#D0D5DD',
                              }}
                            />
                          )}
                          <View
                            style={{
                              backgroundColor: '#fff',
                              padding: 10,
                              gap: 5,
                            }}>
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                gap: 10,
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
                                  <Text>Item</Text>
                                </View>
                                <View
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 5,
                                  }}>
                                  <TouchableOpacity
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
                                          copyArray[index].vote === 1 ? 0 : 1,
                                      });
                                      setTempVotes(copyArray);
                                    }}>
                                    <View
                                      style={{
                                        padding: 3,
                                        backgroundColor:
                                          extract.vote === 1
                                            ? '#F0F9FF'
                                            : '#EAECF0',
                                        borderColor:
                                          extract.vote === 1
                                            ? '#0BA5EC'
                                            : '#EAECF0',
                                        borderWidth: 1,
                                        borderRadius: 5,
                                      }}>
                                      <UpvoteIcon
                                        stroke={
                                          extract.vote === 1
                                            ? '#0AA2E8'
                                            : '#667085'
                                        }
                                      />
                                    </View>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => {
                                      var copyArray = [...tempVotes];
                                      var index = copyArray.findIndex(
                                        extractCopy =>
                                          JSON.stringify(extractCopy) ===
                                          JSON.stringify(extract),
                                      );
                                      console.log({copyArray, extract, index});
                                      copyArray.splice(index, 1, {
                                        ...extract,
                                        vote:
                                          copyArray[index].vote === -1 ? 0 : -1,
                                      });
                                      console.log({copyArray, index});
                                      setTempVotes(copyArray);
                                    }}>
                                    <View
                                      style={{
                                        padding: 3,
                                        backgroundColor:
                                          extract.vote === -1
                                            ? '#F0F9FF'
                                            : '#EAECF0',
                                        borderColor:
                                          extract.vote === -1
                                            ? '#0BA5EC'
                                            : '#EAECF0',
                                        borderWidth: 1,
                                        borderRadius: 5,
                                      }}>
                                      <DownvoteIcon
                                        stroke={
                                          extract.vote === -1
                                            ? '#0AA2E8'
                                            : '#667085'
                                        }
                                      />
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              </View>
                              <View
                                style={{
                                  backgroundColor: '#F2F4F7',
                                  display: 'flex',
                                  flexDirection: 'row',
                                  padding: 7,
                                  gap: 2,
                                  width: '100%',
                                }}>
                                <Text style={{color: '#475467', fontSize: 15}}>
                                  {extract.string}{' '}
                                  {entry.entry.substring(
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
          {modalScreen === 4 && (
            <View style={{width: '100%'}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 10,
                  // backgroundColor: '#000',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    onModalCloseCancel();
                  }}
                  style={{flexGrow: 1, flexBasis: 0, alignItems: 'flex-start'}}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                  <EmotionTaggingIcon stroke={'black'} />
                  <Text style={{fontSize: 20, fontWeight: 600}}>
                    Emotion tagging
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (recentEvent) {
                      setEntry({
                        ...entry,
                        entry:
                          entry.entry.substring(
                            0,
                            highlightedText.position[0],
                          ) +
                          highlightedText.str +
                          entry.entry.substring(
                            highlightedText.position[1] + 1,
                          ),
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
                              : tempOrigins.entry,
                          title:
                            tempTitle !== entry.title
                              ? {
                                  source: 'auto',
                                  time: tempOrigins.title,
                                }
                              : entry.origins.title,
                        },
                      });
                      setModalVisible(false);
                    }
                  }}
                  style={{
                    flexGrow: 1,
                    flexBasis: 0,
                    alignItems: 'flex-end',
                  }}>
                  <Text
                    style={{
                      color: recentEvent
                        ? highlightedText.str === recentEvent.str
                          ? '#D0D5DD'
                          : '#0BA5EC'
                        : tempEntry === entry.entry && tempTitle === entry.title
                        ? '#D0D5DD'
                        : '#0BA5EC',
                    }}>
                    Update entry
                  </Text>
                </TouchableOpacity>
              </View>
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
                  padding: 20,
                }}>
                <View style={{backgroundColor: '#fff', padding: 10, gap: 5}}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <EmotionCalendarIcon />
                    <Text
                      style={{color: '#475467', fontSize: 16, fontWeight: 600}}>
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
                      style={{color: '#475467', fontSize: 12, fontWeight: 500}}>
                      Log your daily vibe with emotion tagging.
                    </Text>
                  </View>
                  <View style={{height: 0.5, backgroundColor: '#EAECF0'}} />
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 10,
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
                              padding: 3,
                              gap: 2,
                              backgroundColor:
                                tempEmotions.emotion === i
                                  ? '#F0F9FF'
                                  : '#EAECF0',
                              borderColor:
                                tempEmotions.emotion === i
                                  ? '#0BA5EC'
                                  : '#EAECF0',
                              borderWidth: 1,
                              borderRadius: 5,
                            }}>
                            {emotion.icon(tempEmotions.emotion === i)}
                            <Text
                              key={i}
                              style={{
                                fontWeight: 500,
                                color:
                                  entry.emotion === i ? '#026AA2' : '#344054',
                              }}>
                              {emotion.txt}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                <View style={{padding: 10}}>
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
                        <Text>Detailed Breakdown</Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: '#E4EEF7',
                          borderRadius: 10,
                          padding: 5,
                          paddingHorizontal: 8,
                        }}>
                        <Text
                          style={{
                            color: '#03659D',
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
                      <Text>Emotions added to individual journal items.</Text>
                    </View>
                  </View>
                  {tempEmotions.emotions
                    .sort((a, b) => a.time - b.time)
                    .map((extract, extractIndex) => {
                      return (
                        <View key={extractIndex}>
                          {/* {extractIndex > 0 && (
                          <>
                            {console.log({
                              a: new Date(
                                entry.emotions.sort((a, b) => a.time - b.time)[
                                  extractIndex - 1
                                ].time,
                              ).getHours(),
                              b: new Date(extract.time).getHours(),
                            })}
                          </>
                        )} */}
                          {extractIndex === 0 ||
                          new Date(
                            tempEmotions.emotions.sort(
                              (a, b) => a.time - b.time,
                            )[extractIndex - 1].time,
                          ).getHours() !== new Date(extract.time).getHours() ? (
                            <View
                              style={{
                                alignItems: 'center',
                              }}>
                              <View
                                style={{
                                  alignSelf: 'center',
                                  width: 2,
                                  height: 20,
                                  backgroundColor: '#D0D5DD',
                                }}
                              />
                              <View
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 5,
                                }}>
                                <ClockIcon />
                                <Text style={{color: '#667085'}}>
                                  {new Date(extract.time).getHours()}:00
                                </Text>
                              </View>

                              <View
                                style={{
                                  alignSelf: 'center',
                                  width: 2,
                                  height: 20,
                                  backgroundColor: '#D0D5DD',
                                }}
                              />
                            </View>
                          ) : (
                            <View
                              style={{
                                alignSelf: 'center',
                                width: 2,
                                height: 15,
                                backgroundColor: '#D0D5DD',
                              }}
                            />
                          )}
                          <View
                            style={{
                              backgroundColor: '#fff',
                              padding: 10,
                              gap: 5,
                            }}>
                            <View
                              style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                gap: 10,
                              }}>
                              <View
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  height: 35,
                                  padding: 10,
                                }}>
                                <View
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <FileIcon />
                                  <Text>Item</Text>
                                </View>
                                {extract.emotion > -1 ? (
                                  <View
                                    style={{
                                      backgroundColor: '#E4EEF7',
                                      borderRadius: 10,
                                      padding: 1,
                                      paddingHorizontal: 6,
                                      display: 'flex',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    {emotions[extract.emotion].icon(true)}
                                    <Text
                                      style={{
                                        color: '#03659D',
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
                                  backgroundColor: '#F2F4F7',
                                  display: 'flex',
                                  flexDirection: 'row',
                                  padding: 7,
                                  gap: 2,
                                  width: '100%',
                                }}>
                                <View
                                  style={{
                                    width: 2,
                                    height: 'auto',
                                    backgroundColor: '#0BA5EC',
                                  }}
                                />
                                <Text style={{color: '#475467', fontSize: 15}}>
                                  {extract.string}
                                </Text>
                              </View>

                              {emotions.map((emotion, i) => {
                                return (
                                  <TouchableOpacity
                                    key={i}
                                    onPress={() => {
                                      var copyArray = [
                                        ...tempEmotions.emotions,
                                      ];
                                      var index = copyArray.findIndex(
                                        extractCopy =>
                                          JSON.stringify(extractCopy) ===
                                          JSON.stringify(extract),
                                      );
                                      copyArray.splice(index, 1, {
                                        ...extract,
                                        emotion:
                                          copyArray[index].emotion === i
                                            ? -1
                                            : i,
                                      });
                                      setTempEmotions({
                                        ...tempEmotions,
                                        emotions: copyArray,
                                      });
                                    }}>
                                    <View
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 3,
                                        gap: 2,
                                        backgroundColor:
                                          extract.emotion === i
                                            ? '#F0F9FF'
                                            : '#EAECF0',
                                        borderColor:
                                          extract.emotion === i
                                            ? '#0BA5EC'
                                            : '#EAECF0',
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
                        </View>
                      );
                    })}
                </View>
              </ScrollView>
            </View>
          )}
          {modalScreen === 5 && (
            <View style={{width: '100%'}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 10,
                  // backgroundColor: '#000',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    onModalCloseCancel();
                  }}
                  style={{flexGrow: 1, flexBasis: 0, alignItems: 'flex-start'}}>
                  <Text>Close</Text>
                </TouchableOpacity>
                <View style={{display: 'flex', flexDirection: 'row'}}>
                  {/* <EmotionTaggingIcon stroke={'black'} /> */}
                  <Text style={{fontSize: 20, fontWeight: 600}}>Events</Text>
                </View>
                <View
                  style={{
                    flexGrow: 1,
                    flexBasis: 0,
                    alignItems: 'flex-end',
                  }}>
                  {/* <Text
                    style={{
                      color: recentEvent
                        ? highlightedText.str === recentEvent.str
                          ? '#D0D5DD'
                          : '#0BA5EC'
                        : tempEntry === entry.entry && tempTitle === entry.title
                        ? '#D0D5DD'
                        : '#0BA5EC',
                    }}>
                    Update entry
                  </Text> */}
                </View>
              </View>
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
                    gap: 20,
                    padding: 20,
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
                          backgroundColor: '#E1E3E6',
                          padding: 5,
                        }}>
                        <Text>{event.id}</Text>
                      </View>
                      <View style={{display: 'flex', flexGrow: 1, padding: 10}}>
                        <View
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text>{moment(event.time).format('LLL')}</Text>
                          <View style={{display: 'flex', flexDirection: 'row'}}>
                            {event.type === 'location' && <LocationIcon />}
                            {event.type === 'calendar' && <CalendarIcon />}
                            <Text>
                              {event.type.charAt(0).toUpperCase() +
                                event.type.slice(1)}
                            </Text>
                          </View>
                        </View>
                        <Text>{event.title}</Text>

                        {event.type === 'photo' ? (
                          <>
                            <View style={{height: 100, width: 100}}>
                              <ImageAsset
                                localIdentifier={event.localIdentifier}
                                setHeight={100}
                                setWidth={100}
                                // height={1}
                                style={{flex: 1, height: '100%', width: '100%'}}
                              />
                            </View>
                            {event.lat ? (
                              <>
                                <Text>{event.loc}</Text>
                              </>
                            ) : (
                              <>
                                <Text>No location or Photo was downloaded</Text>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <Text>{event.additionalNotes}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View>
                  <Text>There are no events for this entry</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: '#0B4A6F',
          padding: 10,
          paddingLeft: 30,
          paddingRight: 30,
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
            <Text style={{color: 'white'}}>
              {entry.entry.match(/(\w+)/g)?.length || 0}
            </Text>
          </View>
          <Text style={{color: 'white', fontSize: 13}}>Words</Text>
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
            <Text style={{color: 'white'}}>{entry.tags.length}</Text>
          </View>
          <Text style={{color: 'white', fontSize: 13}}>Tags</Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            <EmotionTaggingIcon width={17} height={16} stroke={'#fff'} />
            <Text style={{color: 'white'}}>{entry.emotions.length}</Text>
          </View>
          <Text style={{color: 'white', fontSize: 13}}>Emotions</Text>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View style={{display: 'flex', flexDirection: 'row'}}>
            {/* {entry.votes.filter(vote => vote.vote !== 0).length > 0 ? (
              entry.votes
                .filter(vote => vote.vote !== 0)
                .reduce((prevVal, currentVal) => {
                  return prevVal.vote + currentVal.vote;
                }).vote
            ) : 0 || 0 >= 0 ? (
              <UpvoteIcon stroke={'#FFF'} />
            ) : (
              <DownvoteIcon stroke={'#FFF'} />
            )} */}
            <UpvoteIcon stroke={'#FFF'} />
            <Text style={{color: 'white'}}>
              {/* {entry.votes.filter(vote => vote.vote !== 0).length > 0
                ? entry.votes
                    .filter(vote => vote.vote !== 0)
                    .reduce((prevVal, currentVal) => {
                      return prevVal + currentVal.vote;
                    }, 0)
                : 0 || 0} */}
              {entry.votes.filter(vote => vote.vote !== 0).length}
            </Text>
          </View>
          <Text style={{color: 'white', fontSize: 13}}>Votes</Text>
        </View>
      </View>
      <KeyboardAvoidingView
        keyboardVerticalOffset={200}
        behavior="padding"
        style={{height: '85%', padding: 10}}>
        <TextInput
          style={{
            padding: 3,
            fontSize: 20,
            fontWeight: '700',
            color: '#475467',
          }}
          value={entry.title}
          onChangeText={text =>
            setEntry({
              ...entry,
              title: text,
              origins: {
                ...entry.origins,
                title: {time: Date.now(), source: 'manual'},
              },
            })
          }
        />
        <CustomInput
          style={{height: '100%'}}
          isOn={false}
          onTxtChange={({nativeEvent: {nativeStr}}) => {
            // console.log(nativeStr);
            // var indexs = [];
            // const string = entry.entryArr
            //   .map((currentExtract, extractIndex) => {
            //     const output = `${currentExtract.entry}${
            //       currentExtract.ref !== '' ? `[${extractIndex + 1}]` : ``
            //     } `;
            //     console.log(currentExtract, {
            //       current: indexs,
            //       future:
            //         output.length +
            //         (indexs.length > 0 ? 0 : indexs.reduce((a, b) => a + b, 0)),
            //     });
            //     indexs.push(
            //       output.length +
            //         (indexs.length === 0
            //           ? 0
            //           : indexs.reduce((a, b) => a + b, 0)),
            //     );
            //     return output;
            //   })
            //   .join('');
            // var newIndex = {index: -1, char: ''};
            // string.split('').every((val, i) => {
            //   if (val !== nativeStr.charAt(i)) {
            //     newIndex = {index: i, char: nativeStr.charAt(i)};
            //     return false;
            //   }
            //   return true;
            // });
            // console.log({string, indexs, newIndex});
            // var copyArr = [];
            // indexs.every((index, i) => {
            //   if (newIndex.index <= index - 1) {
            //     copyArr = entry.entryArr;
            //     const minimum = indexs.slice(0, i).reduce((a, b) => a + b, 0);
            //     const relIndex = newIndex.index - minimum;
            //     copyArr.splice(i, 1, {
            //       ...entry.entryArr[i],
            //       source: 'manual',
            //       entry:
            //         relIndex === 0
            //           ? `${newIndex.char}${entry.entryArr[i].entry}`
            //           : `${entry.entryArr[i].entry.slice(0, relIndex)}${
            //               newIndex.char
            //             }${entry.entryArr[i].entry.slice(relIndex)}`,
            //     });

            //     return false;
            //   }
            //   return true;
            // });
            // var updatedVotes = entry.votes
            // updatedVotes.map((vote)=>{

            //   return {

            //   }
            // })

            // console.log({
            //   ...entry,
            //   entry: nativeStr,
            //   // entryArr: copyArr,
            //   origins: {
            //     ...entry.origins,
            //     entry: {time: Date.now(), source: 'manual'},
            //   },
            //   votes: updatedVotes
            // });
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
              if (
                diffCalc.filter(
                  diffObj => diffObj.added === true || diffObj.removed === true,
                ).length === 2
              ) {
                //REPLACE
                //START
                if (diffCalc[0].removed === true) {
                  votes = votes.map(vote => {
                    var startIndex =
                      vote.startIndex === 0
                        ? 0
                        : vote.startIndex +
                          (diffCalc[1].count - diffCalc[0].count);
                    var endIndex =
                      vote.endIndex + (diffCalc[1].count - diffCalc[0].count);
                    return {
                      ...vote,
                      startIndex,
                      endIndex,
                    };
                  });
                }

                //END
                if (diffCalc[1].removed === true && diffCalc.length === 3) {
                  votes = votes.map(vote => {
                    var startIndex = vote.startIndex;
                    var endIndex =
                      vote.endIndex > diffCalc[0].count
                        ? vote.endIndex +
                          (diffCalc[2].count - diffCalc[1].count)
                        : vote.endIndex;
                    return {
                      ...vote,
                      startIndex,
                      endIndex,
                    };
                  });
                }

                //MIDDLE
                if (diffCalc[1].removed === true && diffCalc.length === 4) {
                  votes = votes.map(vote => {
                    var startIndex =
                      vote.startIndex > diffCalc[0].count + 1
                        ? vote.startIndex +
                          (diffCalc[2].count - diffCalc[1].count)
                        : vote.startIndex;
                    var endIndex =
                      vote.endIndex > diffCalc[0].count
                        ? vote.endIndex +
                          (diffCalc[2].count - diffCalc[1].count)
                        : vote.endIndex;
                    return {
                      ...vote,
                      startIndex,
                      endIndex,
                    };
                  });
                }
              } else {
                //JUST ADD OR REMOVE
                for (var i = 0; i < diffCalc.length; i++) {
                  if (diffCalc[i].added !== undefined) {
                    //ADD
                    // START
                    if (i === 0) {
                      votes = votes.map(vote => {
                        var startIndex = vote.startIndex + diffCalc[i].count;
                        var endIndex = vote.endIndex + diffCalc[i].count;
                        return {
                          ...vote,
                          startIndex,
                          endIndex,
                        };
                      });
                    }
                    //END
                    if (i === 1 && diffCalc.length === 2) {
                    }
                    //MIDDLE
                    if (i === 1 && diffCalc.length === 3) {
                      votes = votes.map(vote => {
                        var startIndex =
                          indice > vote.startIndex
                            ? vote.startIndex
                            : vote.startIndex + diffCalc[i].count;
                        var endIndex =
                          indice > vote.endIndex
                            ? vote.endIndex
                            : vote.endIndex + diffCalc[i].count;
                        return {
                          ...vote,
                          startIndex,
                          endIndex,
                        };
                      });
                    }
                  } else if (diffCalc[i].removed !== undefined) {
                    //DELETE
                    if (i === 0) {
                      votes = votes.map(vote => {
                        var startIndex =
                          vote.startIndex === 0 ? 0 : vote.startIndex - 1;
                        var endIndex = vote.endIndex - 1;
                        return {
                          ...vote,
                          startIndex,
                          endIndex,
                        };
                      });
                    }
                    //END
                    if (i === 1 && diffCalc.length === 2) {
                      votes = votes.map(vote => {
                        var startIndex = vote.startIndex;
                        var endIndex =
                          vote.endIndex >= indice ? indice : vote.endIndex;
                        return {
                          ...vote,
                          startIndex,
                          endIndex,
                        };
                      });
                    }
                    //MIDDLE
                    if (i === 1 && diffCalc.length === 3) {
                      votes = votes.map(vote => {
                        var startIndex =
                          indice > vote.startIndex
                            ? vote.startIndex
                            : vote.startIndex - diffCalc[i].count;
                        var endIndex =
                          indice > vote.endIndex
                            ? vote.endIndex
                            : vote.endIndex - diffCalc[i].count;
                        return {
                          ...vote,
                          startIndex,
                          endIndex,
                        };
                      });
                    }
                  } else if (
                    diffCalc[i].added === undefined &&
                    diffCalc[i].removed === undefined
                  ) {
                    indice = indice + diffCalc[i].count;
                  }
                }
              }

              // for (var i = 0; i < diffCalc.length; i++) {
              //   if (diffCalc[i].added !== undefined) {
              //     // votes.map((vote)=>{
              //     //   var startIndex = vote.startIndex
              //     //   var endIndex = vote.startIndex
              //     //   if (vote.startIndex!==0){
              //     //   }
              //     //   return {
              //     //     ...vote
              //     //   }
              //     // })
              //   } else if (diffCalc[i].removed !== undefined) {
              //     votes.map(vote => {
              //       var startIndex = vote.startIndex;
              //       var endIndex = vote.startIndex;
              //       if (vote.startIndex !== 0) {
              //         startIndex -= diffCalc[i].count;
              //       }
              //       endIndex -= diffCalc[i].count;
              //       return {
              //         ...vote,
              //         startIndex,
              //         endIndex,
              //       };
              //     });
              //   }
              //   indice = indice + diffCalc[i].count;
              // }
              votes = votes.filter(vote => {
                if (vote.startIndex < vote.endIndex) {
                  return true;
                } else {
                  return false;
                }
              });
              console.log(diff.diffChars(entry.entry, nativeStr));
              console.log('Votes', {before: entry.votes, after: votes});
              setEntry({
                ...entry,
                entry: nativeStr,
                // entryArr: copyArr,
                votes,
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
          }}
          initalTxtString={entry.entry}
          // initalTxtString={entry.entryArr
          //   .map(
          //     (currentExtract, extractIndex) =>
          //       `${currentExtract.entry}${
          //         currentExtract.ref !== '' ? `[${extractIndex + 1}]` : ``
          //       } `,
          //   )
          //   .join('')}
          onEventMenu={({nativeEvent: {nativeEventMenu}}) => {
            console.log(nativeEventMenu);
            setRecentEvent(nativeEventMenu);
          }}
        />
      </KeyboardAvoidingView>
      <KeyboardAvoidingView
        behavior="position"
        keyboardVerticalOffset={100}
        contentContainerStyle={{backgroundColor: '#fff'}}>
        <View style={{backgroundColor: '#B3B3B3', height: 0.5}} />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.75)',
            padding: 15,
          }}>
          <TouchableOpacity
            onPress={() => {
              setCurrentDate(Date.now());
              setModalScreen(1);
              setModalVisible(true);
              setTempEntry(entry.entry);
              setTempTitle(entry.title);
            }}>
            <AIRewriteIcon stroke={'black'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalScreen(2);
              setModalVisible(true);
            }}>
            <ContentTaggingIcon fill={'black'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalScreen(5);
              setModalVisible(true);
            }}>
            <Text>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalScreen(3);
              setModalVisible(true);
              setTempVotes(entry.votes);
            }}>
            <ContentVotingIcon />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setModalScreen(4);
              setModalVisible(true);
              setTempEmotions({
                emotions: entry.emotions,
                emotion: entry.emotion,
              });
            }}>
            <EmotionTaggingIcon stroke={'#000'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
// const styles = StyleSheet.create({
//   nativeBtn: {height: '100%', height: '100%'},
// });
