import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  Button,
  Image,
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
import OnboardStep4Image from './src/assets/OnboardStep4.svg';
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
import CalendarIcon from './src/assets/calendar-heart-01.svg';
import FileIcon from './src/assets/file-heart-03.svg';
import ClockIcon from './src/assets/clock.svg';
import DownvoteIcon from './src/assets/arrow-block-down.svg';
import UpvoteIcon from './src/assets/arrow-block-up.svg';
import ExpandIcon from './src/assets/expand.svg';
import {CustomInput} from './NativeJournal';
import moment from 'moment';
import EntryView from './EntryView.js';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AppContext from './Context';
import useDatabaseHooks from './useDatabaseHooks';
import Location from './NativeFuncs';
import {ImageAsset} from './NativeImage';
const {Configuration, OpenAIApi} = require('openai');
const configuration = new Configuration({
  apiKey: 'API_KEY_ENV',
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
const {retrieveSpecificData} = useDatabaseHooks();
export default App = ({route, navigation}) => {
  // const {retrieveSpecificData} = useDatabaseHooks();
  // const retrieveSpecificData = () => {};
  const baseEntry = {
    tags: [],
    time: Date.now(),
    emotion: -1,
    emotions: [
      {
        string: 'Today was a busy and productive day for me!',
        emotion: -1,
        time: Date.now(),
      },
      {
        string: 'Today was a busy and productive day for me!2',
        emotion: -1,
        time: 1689856646,
      },
      {
        string: 'Today was a busy and productive day for me!2',
        emotion: -1,
        time: 1689857646,
      },
    ],
    votes: [
      {
        string: 'Today was a busy and productive day for me!2',
        vote: 0,
        time: 1689856646,
      },
      {
        string: 'Today was a busy and productive day for me!',
        vote: 0,
        time: Date.now(),
      },
    ],
    title: 'Today was a good day',
    origins: {
      entry: {
        time: 0,
        source: 'auto',
      },
      title: {
        time: 0,
        source: 'manual',
      },
    },
    entryArr: [
      {
        ref: '',
        source: '',
        entry:
          'Today was a busy and productive day for me! In the morning, I had a team meeting to discuss exciting projects and milestones.',
      },
      {
        ref: '',
        source: '',
        entry:
          'Then, I met a client for lunch at this cool restaurant, Baba Mal where we talked about potential collaborations.',
      },
    ],
    entry:
      'Today was a good day. I want to the beach. It was fun. I even went swimming.',
    //     entry: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut commodo lectus sed ante tincidunt, a pretium dui placerat. Donec euismod felis sagittis lacus luctus dignissim. Suspendisse ac elit eget arcu pulvinar hendrerit id sed ipsum. Nulla commodo ultricies risus, vel scelerisque est facilisis vitae. Morbi venenatis consequat leo, rutrum pellentesque eros egestas et. Duis finibus enim eu felis egestas euismod. Morbi elementum, ipsum nec facilisis aliquet, erat ante gravida nisi, ut blandit elit magna ac nibh. Vestibulum cursus condimentum sapien sit amet facilisis. Sed id imperdiet arcu, in condimentum lacus.

    // Aenean feugiat mauris nisi, nec maximus nibh gravida sed. Curabitur cursus odio quis ante hendrerit vestibulum. Suspendisse fermentum augue pellentesque ante congue varius in quis dui. Proin auctor a neque vel aliquet. Nulla rhoncus neque ultrices pharetra venenatis. Aliquam porta est ut mollis hendrerit. Maecenas nunc libero, rhoncus id auctor at, iaculis quis arcu. Nam non rutrum ipsum. Vestibulum vehicula vitae lectus eget pretium. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Etiam feugiat convallis elit.

    // Etiam id massa efficitur, fermentum orci ac, maximus dolor. Pellentesque eget vulputate turpis. Ut non nisl orci. Fusce id felis cursus, semper quam id, laoreet ipsum. Ut felis enim, ultrices ac posuere at, semper vitae nunc. Cras tristique sagittis massa, ac viverra nibh eleifend a. Mauris posuere tristique felis, vel laoreet magna rutrum id. Ut aliquet auctor ornare. Curabitur elit mi, maximus in lacinia semper, mattis sit amet est. Mauris tempus tempor tortor id eleifend. Nullam sollicitudin consectetur lectus, quis efficitur erat viverra in. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;

    // `,
  };

  moment.locale('en-gb');
  const [entry, setEntry] = useState(null);
  const {entries, setEntries} = useContext(AppContext);
  // const [entries, setEntries] = useState(
  //   [
  //     baseEntry,
  //     {
  //       ...baseEntry,
  //       time: 1690285514000,
  //     },
  //     {
  //       ...baseEntry,
  //       time: 1690372313000,
  //     },
  //     {
  //       ...baseEntry,
  //       time: 1690113113000,
  //     },
  //     {
  //       ...baseEntry,
  //       time: 1690026713000,
  //     },
  //     {
  //       ...baseEntry,
  //       time: 1689940313000,
  //     },
  //   ]
  //     .sort((a, b) => a.time - b.time)
  //     .sort((a, b) => moment(b.time).week() - moment(a.time).week()),
  // );

  const [loading, setLoading] = useState(false);
  const [onBoarding, setOnBoarding] = useState(false);
  const [onBoardingStep, setOnBoardingStep] = useState(0);
  useEffect(() => {
    console.log(route);
    if (route.params?.entry) {
      setLoading(true);
      console.log(route);
      var entriesCopy = [...entries];
      // .sort((a, b) => a.time - b.time)
      // .sort((a, b) => moment(b.time).week() - moment(a.time).week());
      console.log(entriesCopy);
      const {index, ...newEntry} = route.params.entry;
      entriesCopy.splice(index, 1, newEntry);
      console.log(entriesCopy);
      setEntries(entriesCopy);
      setLoading(false);
    }
  }, [route.params]);
  useEffect(() => {
    console.log('home entries useEffect', {entries});
  }, [entries]);

  return (
    // <View>
    //   <TouchableOpacity
    //     onPress={() => {
    //       navigation.navigate('Entry', {
    //         baseEntry: {
    //           ...entries[0],
    //           index: 0,
    //         },
    //       });
    //     }}>
    //     <ExpandIcon />
    //   </TouchableOpacity>
    // </View>
    <SafeAreaView style={{flexGrow: 1}}>
      <StatusBar
        barStyle={'light-content'}
        backgroundColor={onBoarding === true ? 'white' : '#F9F9F9'}
      />
      {onBoarding === true ? (
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            // justifyContent: 'space-between',
            backgroundColor: '#FBFBFB',
            height: '100%',
            marginHorizontal: 20,
          }}>
          <View style={{flexGrow: 1, justifyContent: 'center'}}>
            {onBoardingStep < 3 ? (
              <Image
                source={
                  (onBoardingStep === 0 &&
                    require('./src/assets/OnboardStep1.gif')) ||
                  (onBoardingStep === 1 &&
                    require('./src/assets/OnboardStep2.gif')) ||
                  (onBoardingStep === 2 &&
                    require('./src/assets/OnboardStep3.gif'))
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
                  color: '#494949',
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
                  color: '#767676',
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
                    var events = [];
                    var locations = [];
                    // GET CALENDAR EVENTS
                    let startOfUnixTime = moment(Date.now())
                      .startOf('day')
                      .unix();

                    let endOfUnixTime = moment(Date.now()).endOf('day').unix();
                    try {
                      events = await Location.sendDataToNative(
                        startOfUnixTime,
                        endOfUnixTime,
                      );
                      console.log(events);
                    } catch (e) {
                      if (e.message === 'DENIED') {
                        console.error(
                          'GIVE PERMISSION TO APP FOR CALENDAR USAGE',
                        );
                      } else {
                        console.error(e);
                      }
                    }

                    // GET LOCATIONS
                    retrieveSpecificData(
                      startOfUnixTime * 1000,
                      endOfUnixTime * 1000,
                      res => {
                        (locations = res.map(obj => {
                          return {
                            description: obj.description.split(',')[0],
                            time: obj.date,
                          };
                        })),
                          console.log(locations);
                      },
                    );

                    locations = [
                      {
                        description: '21 Winchmore Hill Road',
                        time: 1691762203882,
                      },
                    ];
                    var str = `${
                      locations.length > 0
                        ? `Locations Visited:
                  ${locations.map(
                    location =>
                      `${location.description} @${moment(location.time).format(
                        'LT',
                      )}`,
                  )}`
                        : ''
                    }

                  ${
                    events.length > 0
                      ? `Events:
                  ${events.map(
                    event => `${event.title} @${
                      event.isAllDay === 'true'
                        ? `All-Day`
                        : `${moment(parseInt(event.start) * 1000).format(
                            'LT',
                          )}-${moment(parseInt(event.end) * 1000).format('LT')}`
                    } ${event.notes ? `Notes: ${event.notes}` : ``}
                  `,
                  )}`
                      : ''
                  }
                  `;

                    // ASK CHATGPT TO CREATE ENTRY
                    console.log('CREATE NEW ENTRY', str);
                    // const completion = await openai.createChatCompletion({
                    //   model: 'gpt-3.5-turbo',
                    //   // model: 'gpt-4',
                    //   messages: [
                    //     {
                    //       role: 'system',
                    //       content:
                    //         'You are to act as my journal writer. I will give you a list of events that took place today and you are to generate a journal entry based on that. The diary entry should be a transcription of the events that you are told. Do not add superfluous details that you are unsure if they actually happened as this will be not useful to me. Add a [[X]] every time one of the events has been completed, e.g. I went to a meeting [[X]] then I went to the beach [[X]]. Replace X with the number assigned to the event. There is no need for sign ins (Dear Diary) or send offs (Yours sincerely). Do not introduce any details, events, etc not supplied by the user.',
                    //     },
                    //     {role: 'user', content: str},
                    //   ],
                    // });
                    // const response =
                    //   completion.data.choices[0].message?.content || "";
                    const response = '';
                    console.log(response);

                    var entriesCopy = [...entries];
                    // .sort((a, b) => a.time - b.time)
                    // .sort((a, b) => moment(b.time).week() - moment(a.time).week());
                    entriesCopy.push({
                      ...baseEntry,
                      time: startOfUnixTime * 1000,
                      entry: response,
                      title: 'New Entry',
                    });
                    setEntries(entriesCopy);
                    setOnBoarding(false);
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
                <View
                  style={{
                    height: 4,
                    width: 40,
                    backgroundColor: onBoardingStep === 0 ? 'black' : '#C0C0C0',
                    borderRadius: 2,
                  }}
                />
                <View
                  style={{
                    height: 4,
                    width: 40,
                    backgroundColor: onBoardingStep === 1 ? 'black' : '#C0C0C0',
                    borderRadius: 2,
                  }}
                />
                <View
                  style={{
                    height: 4,
                    width: 40,
                    backgroundColor: onBoardingStep === 2 ? 'black' : '#C0C0C0',
                    borderRadius: 2,
                  }}
                />
                <View
                  style={{
                    height: 4,
                    width: 40,
                    backgroundColor: onBoardingStep === 3 ? 'black' : '#C0C0C0',
                    borderRadius: 2,
                  }}
                />
              </View>
            </>
          ) : (
            <View style={{flexGrow: 1, marginHorizontal: 20}}>
              <Text
                style={{
                  color: '#494949',
                  fontWeight: '700',
                  fontSize: 22,
                  marginBottom: 20,
                  textAlign: 'center',
                }}>
                Your story is being created
              </Text>
              <Text
                style={{
                  color: '#767676',
                  fontWeight: '400',
                  fontSize: 18,
                  marginBottom: 40,
                  textAlign: 'center',
                }}>
                We will notify you when your first story is ready...
              </Text>
              <Image
                source={require('./src/assets/Spin-1s-200px-2.gif')}
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
      ) : (
        <>
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
                <Text style={{color: 'white'}}>{entries.length || 0}</Text>
              </View>
              <Text style={{color: 'white', fontSize: 13}}>Entries</Text>
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
                <Text style={{color: 'white'}}>0</Text>
              </View>
              <Text style={{color: 'white', fontSize: 13}}>Manual</Text>
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
                {/* <TouchableOpacity
                  onPress={() => {
                    console.log(
                      entries
                        .map(entry => entry.events)
                        .flat()
                        .filter(event => event.type !== 'photo'),
                    );
                  }}> */}
                <Text style={{color: 'white'}}>
                  {
                    entries
                      .map(entry => entry.events)
                      .flat()
                      .filter(event => event.type !== 'photo').length
                  }
                </Text>
                {/* </TouchableOpacity> */}
              </View>
              <Text style={{color: 'white', fontSize: 13}}>Events</Text>
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
                  {
                    entries
                      .map(entry => entry.events)
                      .flat()
                      .filter(event => event.type === 'photo').length
                  }
                </Text>
              </View>
              <Text style={{color: 'white', fontSize: 13}}>Photos</Text>
            </View>
          </View>
          <ScrollView>
            <TouchableOpacity>
              <Text
                onPress={async () => {
                  //DAY
                  var events = [];
                  var locations = [];
                  var counter = 1;
                  var photos = [];
                  // GET CALENDAR EVENTS
                  let startOfUnixTime = moment(Date.now())
                    .startOf('day')
                    .unix();

                  let endOfUnixTime = moment(Date.now()).endOf('day').unix();
                  try {
                    events = await Location.sendDataToNative(
                      startOfUnixTime,
                      endOfUnixTime,
                    );
                    console.log(events);
                  } catch (e) {
                    if (e.message === 'DENIED') {
                      console.error(
                        'GIVE PERMISSION TO APP FOR CALENDAR USAGE',
                      );
                    } else {
                      console.error(e);
                    }
                  }

                  // GET LOCATIONS
                  retrieveSpecificData(
                    startOfUnixTime * 1000,
                    endOfUnixTime * 1000,
                    res => {
                      (locations = res.map(obj => {
                        return {
                          description: obj.description.split(',')[0],
                          time: obj.date,
                        };
                      })),
                        console.log(locations);
                    },
                  );
                  try {
                    photos = await Location.getPhotosFromNative();
                    console.log({photos});
                  } catch (e) {
                    console.error({e});
                  }
                  // console.log({photos});

                  var entriesCopy = [...entries];
                  // .sort((a, b) => a.time - b.time)
                  // .sort((a, b) => moment(b.time).week() - moment(a.time).week());
                  var entryEvents = [];
                  locations = [
                    {
                      description: '21 Winchmore Hill Road',
                      time: 1691762203882,
                      id: 1,
                    },
                  ];
                  locations = locations.map(location => {
                    entryEvents.push({
                      type: 'location',
                      id: counter,
                      time: location.time,
                      title: location.description.split(',')[0],
                      additionalNotes: '',
                    });
                    return {
                      ...location,
                      id: counter++,
                    };
                  });
                  events = events.map(event => {
                    entryEvents.push({
                      type: 'calendar',
                      id: counter,
                      time: parseInt(event.start) * 1000,
                      title: event.title,
                      additionalNotes: event.notes,
                    });
                    return {
                      ...event,
                      time: parseInt(event.start) * 1000,
                      id: counter++,
                    };
                  });
                  photos = photos.map(photo => {
                    entryEvents.push({
                      type: 'photo',
                      id: counter,
                      time: Math.floor(parseFloat(photo.creation) * 1000),
                      localIdentifier: photo.localIdentifier,
                      title: photo.name,
                    });
                    return {
                      ...photo,
                      creation: Math.floor(parseFloat(photo.creation) * 1000),
                      id: counter++,
                    };
                  });
                  var str = `${
                    locations.length > 0
                      ? `Locations Visited:
              ${locations.map(
                location =>
                  `${location.description} @${moment(location.time).format(
                    'LT',
                  )} (id:${location.id})`,
              )}`
                      : ''
                  }

              ${
                events.length > 0
                  ? `Events:
              ${events.map(
                event => `${event.title} @${
                  event.isAllDay === 'true'
                    ? `All-Day`
                    : `${moment(event.start).format('LT')}-${moment(
                        parseInt(event.end) * 1000,
                      ).format('LT')}`
                } ${event.notes ? `Notes: ${event.notes} (id:${event.id})` : ``}
              `,
              )}`
                  : ''
              }

              ${
                photos.length > 0
                  ? `Photos Taken:
              ${photos.map(
                photo =>
                  `${photo.lat !== 'null' ? `Lat: ${photo.lat}` : ''} ${
                    photo.lon !== 'null' ? `Lon: ${photo.lon}` : ''
                  } @${moment(photo.creation).format('LT')}(id:${photo.id})`,
              )}`
                  : ''
              }
              `;

                  // ASK CHATGPT TO CREATE ENTRY
                  console.log('CREATE NEW ENTRY', str);
                  // const completion = await openai.createChatCompletion({
                  //   // model: 'gpt-3.5-turbo',
                  //   model: 'gpt-4',
                  //   messages: [
                  //     {
                  //       role: 'system',
                  //       content:
                  //         'You are to act as my journal writer. I will give you a list of events that took place today and you are to generate a journal entry based on that. The diary entry should be a transcription of the events that you are told. Do not add superfluous details that you are unsure if they actually happened as this will be not useful to me. Add a [[X]] every time one of the events has been completed, e.g. I went to a meeting [[X]] then I went to the beach [[X]]. Replace X with the number assigned to the event. There is no need for sign ins (Dear Diary) or send offs (Yours sincerely). Do not introduce any details, events, etc not supplied by the user.',
                  //     },
                  //     {role: 'user', content: str},
                  //   ],
                  // });
                  // const response =
                  //   completion.data.choices[0].message?.content || '';
                  const response = 'This is a test entry. Please respond. &gt;';
                  // console.log(response);

                  entriesCopy.push({
                    ...baseEntry,
                    time: startOfUnixTime * 1000,
                    entry: '',
                    events: entryEvents,
                    entry: response,
                    title: 'New Entry',
                  });
                  setEntries(entriesCopy);
                }}>
                Create new entry
              </Text>
            </TouchableOpacity>
            {/* <Image
              style={{width: 200, height: 300}}
              source={{
                uri: `lifestory://asset?id=0DBB35F8-FF65-4AB4-BE03-5D68535A5474/L0/001`,
              }}
            /> */}

            {!loading &&
              entries
                .sort((a, b) => b.time - a.time)
                .map((currEntry, currEntryIndex) => {
                  const startOfWeek = () =>
                    currEntryIndex === 0
                      ? true
                      : moment(entries[currEntryIndex - 1].time).week() !==
                        moment(currEntry.time).week()
                      ? true
                      : false;
                  const endOfWeek = () =>
                    currEntryIndex === entries.length - 1
                      ? true
                      : moment(entries[currEntryIndex + 1].time).week() !==
                        moment(currEntry.time).week()
                      ? true
                      : false;

                  return (
                    <View key={currEntryIndex}>
                      {startOfWeek() && (
                        <Text>
                          {moment(currEntry.time)
                            .startOf('week')
                            .format('MMMM')}{' '}
                          {moment(currEntry.time).startOf('week').format('Do')}{' '}
                          -{' '}
                          {moment(currEntry.time).endOf('week').format('MMMM')}{' '}
                          {moment(currEntry.time).endOf('week').format('Do')}
                        </Text>
                      )}
                      <View
                        key={currEntryIndex}
                        style={{
                          marginTop: startOfWeek() ? 20 : 0,
                          marginBottom: endOfWeek() ? 20 : 0,
                          borderTopLeftRadius: startOfWeek() ? 20 : 0,
                          borderTopRightRadius: startOfWeek() ? 20 : 0,
                          borderLeftWidth: 20,
                          borderLeftColor: '#D1E9FF',
                          borderTopColor: '#667085',
                          borderBottomColor: '#667085',
                          borderTopWidth: startOfWeek() ? 1 : 0,
                          borderBottomWidth: endOfWeek() ? 1 : 0,

                          padding: 20,
                          borderBottomLeftRadius: endOfWeek() ? 20 : 0,
                          borderBottomRightRadius: endOfWeek() ? 20 : 0,
                          borderWidth: 1,
                        }}>
                        <Text>
                          {moment(currEntry.time).format('dddd')} (
                          {moment(currEntry.time).format('L')})
                        </Text>
                        <Text>{currEntry.title}</Text>
                        <Text>{currEntry.entry}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('Entry', {
                              baseEntry: {
                                ...currEntry,
                                index: currEntryIndex,
                              },
                            });
                          }}>
                          <ExpandIcon />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};
// const styles = StyleSheet.create({
//   nativeBtn: {height: '100%', height: '100%'},
// });
