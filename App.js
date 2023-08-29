import React, {useState, useEffect, useRef, createRef} from 'react';
import {
  Alert,
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
  NativeModules,
  NativeEventEmitter,
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
import CalendarIcon from './src/assets/calendar-heart-01.svg';
import FileIcon from './src/assets/file-heart-03.svg';
import ClockIcon from './src/assets/clock.svg';
import DownvoteIcon from './src/assets/arrow-block-down.svg';
import UpvoteIcon from './src/assets/arrow-block-up.svg';
import ExpandIcon from './src/assets/expand.svg';
import {CustomInput} from './NativeJournal';
import moment from 'moment';
import EntryView from './EntryView.js';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './Home';
import AppContext from './Context';
import Location from './NativeFuncs';
import Geolocation from '@react-native-community/geolocation';
import useDatabaseHooks from './useDatabaseHooks';

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
const {
  createTable,
  insertData,
  retrieveData,
  calculateAverage,
  retrieveSpecificData,
} = useDatabaseHooks();
export default App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [modalVisible, setModalVisible] = useState(false);
  const [modalScreen, setModalScreen] = useState(0);
  const [locations, setLocations] = useState([]);
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
    events: [
      // {
      //   id: 0,
      //   stringIndex: 0,
      //   type: "",
      //   data: ""
      // },
      // {
      // }
    ],
    votes: [
      {
        startIndex: 0,
        endIndex: 5,
        vote: 0,
        time: 1689856646,
      },
      // {
      //   string: 'Today was a busy and productive day for me!',
      //   vote: 0,
      //   time: Date.now(),
      // },
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
    events: [
      {
        type: 'location',
        id: 1,
        time: Date.now(),
        title: '21 Winchmore Hill Road',
        additionalNotes: 'This is my house',
      },
      {
        type: 'calendar',
        id: 2,
        time: Date.now(),
        title: 'Test Event',
        additionalNotes: 'This is my house',
      },
      {
        type: 'photo',
        id: 3,
        time: Date.now(),
        localIdentifier: '0DBB35F8-FF65-4AB4-BE03-5D68535A5474/L0/001',
        title: 'Test Event',
        additionalNotes: 'This is my house',
      },
    ],
    entry:
      'Today was a good day. [[1]] I want to the beach. It was fun. I even went swimming.',
    //     entry: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut commodo lectus sed ante tincidunt, a pretium dui placerat. Donec euismod felis sagittis lacus luctus dignissim. Suspendisse ac elit eget arcu pulvinar hendrerit id sed ipsum. Nulla commodo ultricies risus, vel scelerisque est facilisis vitae. Morbi venenatis consequat leo, rutrum pellentesque eros egestas et. Duis finibus enim eu felis egestas euismod. Morbi elementum, ipsum nec facilisis aliquet, erat ante gravida nisi, ut blandit elit magna ac nibh. Vestibulum cursus condimentum sapien sit amet facilisis. Sed id imperdiet arcu, in condimentum lacus.

    // Aenean feugiat mauris nisi, nec maximus nibh gravida sed. Curabitur cursus odio quis ante hendrerit vestibulum. Suspendisse fermentum augue pellentesque ante congue varius in quis dui. Proin auctor a neque vel aliquet. Nulla rhoncus neque ultrices pharetra venenatis. Aliquam porta est ut mollis hendrerit. Maecenas nunc libero, rhoncus id auctor at, iaculis quis arcu. Nam non rutrum ipsum. Vestibulum vehicula vitae lectus eget pretium. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Etiam feugiat convallis elit.

    // Etiam id massa efficitur, fermentum orci ac, maximus dolor. Pellentesque eget vulputate turpis. Ut non nisl orci. Fusce id felis cursus, semper quam id, laoreet ipsum. Ut felis enim, ultrices ac posuere at, semper vitae nunc. Cras tristique sagittis massa, ac viverra nibh eleifend a. Mauris posuere tristique felis, vel laoreet magna rutrum id. Ut aliquet auctor ornare. Curabitur elit mi, maximus in lacinia semper, mattis sit amet est. Mauris tempus tempor tortor id eleifend. Nullam sollicitudin consectetur lectus, quis efficitur erat viverra in. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;

    // `,
  };
  moment.locale('en-gb');
  const [entry, setEntry] = useState(null);
  const [entries, setEntries] = useState(
    [
      baseEntry,
      {
        ...baseEntry,
        time: 1690285514000,
      },
      {
        ...baseEntry,
        time: 1690372313000,
      },
      {
        ...baseEntry,
        time: 1690113113000,
      },
      {
        ...baseEntry,
        time: 1690026713000,
      },
      {
        ...baseEntry,
        time: 1689940313000,
      },
    ]
      .sort((a, b) => a.time - b.time)
      .sort((a, b) => moment(b.time).week() - moment(a.time).week()),
  );
  const [highlightedText, setHighlightedText] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempEntry, setTempEntry] = useState('');
  const [tempOrigins, setTempOrigins] = useState({
    entry: 0,
    title: 0,
    highlight: 0,
  });
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
    // console.log({entry});
  }, [entry]);
  useEffect(() => {
    if (recentEvent) {
      let len = recentEvent.range
        .replace(/[{}]/g, '')
        .split(',')
        .map(val => parseInt(val));
      len[1] = len[0] + (len[1] - 1);
      //len: [start, length]
      //end = start + length - 1
      // console.log(len);
      switch (recentEvent.action) {
        case 2:
          setModalVisible(true);
          setModalScreen(1);
          setHighlightedText({str: recentEvent.str, position: len});
          break;
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
          EmotionScrollViewRef.current?.scrollToEnd({animated: true});
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
  const RootStack = createNativeStackNavigator();

  const contextValues = {
    entries,
    setEntries,
  };
  // console.log(Counter);
  // Counter.load(value => {
  //   console.log(JSON.stringify({value}));
  // });
  // instantiate the event emitter
  const CounterEvents = new NativeEventEmitter(NativeModules.Location);
  CounterEvents.removeAllListeners('onCalendar');
  CounterEvents.addListener('onCalendar', res => {
    console.log(`TEST ${new Date().toISOString()}`, res);
  });
  // Location.sendDataToNative(
  //   moment(Date.now()).startOf('day').unix(),
  //   moment(Date.now()).endOf('day').unix(),
  // );
  NativeModules.Location.enablePermissions()
    .then(res => {
      CounterEvents.removeAllListeners('locationChange');
      CounterEvents.addListener('locationChange', res => {
        console.log('locationChange event', res);
        insertData(res.date || Date.now(), res.lat, res.lon, res.description);
        retrieveData('Visits', steps => {
          console.log({steps});
        });
      });
    })
    .catch(e => console.log(e.message, e.code));
  const navTheme = DefaultTheme;
  navTheme.colors.background = '#FBFBFB';

  // useEffect(() => {
  //   async function test() {
  //     console.log(
  //       'getPhotos',
  //       await NativeModules.Location.getPhotosFromNative(),
  //     );
  //   }
  //   test();
  // }, []);

  // subscribe to event
  // CounterEvents.addListener('onIncrement', res =>
  //   console.log('onIncrement event', res),
  // );
  // Geolocation.getCurrentPosition(
  //   pos => {
  //     console.log(JSON.stringify(pos));
  //   },
  //   error => Alert.alert('GetC'),
  //   {
  //     enableHighAccuracy: true,
  //   },
  // );
  // Geolocation.setRNConfiguration({authorizationLevel: 'always'});
  // Geolocation.requestAuthorization(
  //   () => {},
  //   error => Alert.alert(JSON.stringify(error)),
  // );
  // Geolocation.watchPosition(
  //   pos => {
  //     console.log(JSON.stringify(pos));
  //     setLocations([...locations, pos]);
  //   },
  //   error => Alert.alert(JSON.stringify(error)),
  //   {
  //     useSignificantChanges: true,
  //     enableHighAccuracy: true,
  //     // timeout: 1000,
  //   },
  // );
  // useEffect(() => {
  //   console.log({locations, Date: Math.floor(Date.now() / 1000)});
  // }, [locations]);
  return (
    <NavigationContainer theme={navTheme}>
      {/* {entry ? (
        <EntryView
          baseEntry={entry}
          goHome={(newEntry, index) => {
            // if (entries) {
            //   var entriesCopy = entries
            //     .sort((a, b) => a.time - b.time)
            //     .sort((a, b) => moment(b.time).week() - moment(a.time).week());
            //   entriesCopy.splice(newEntry.index, 1, newEntry);
            //   setEntries(entriesCopy);
            setEntry(null);
            // }
          }}
        />
      ) : (
        <Home />
      )} */}

      <RootStack.Navigator screenOptions={{headerShown: false}}>
        <RootStack.Screen
          name="Home"
          children={params => (
            <AppContext.Provider value={contextValues}>
              <Home {...params} />
            </AppContext.Provider>
          )}
        />
        <RootStack.Screen
          name="Entry"
          component={EntryView}
          options={{headerShown: true, title: ''}}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
// const styles = StyleSheet.create({
//   nativeBtn: {height: '100%', height: '100%'},
// });
