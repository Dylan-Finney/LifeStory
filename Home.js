import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
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

import moment from 'moment';
import AppContext from './Context';
import useDatabaseHooks from './useDatabaseHooks';
import Location from './NativeFuncs';

import useSettingsHooks from './useSettingsHooks';
import Config from 'react-native-config';
import CreateEntryButton from './src/components/CreateEntryButton';
import {theme} from './Styling';
import Onboarding from './src/components/Onboarding';
import HomeTop from './src/components/HomeTop';
import HomeHeading from './src/components/HomeHeading';
import EntryList from './src/components/EntryList';
import * as RNLocalize from 'react-native-localize';
import {NativeModules} from 'react-native';
import {horizontalScale, verticalScale} from './src/utils/Metrics';
const {RNShare} = NativeModules;
const {Configuration, OpenAIApi} = require('openai');
const configuration = new Configuration({
  apiKey: Config.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const {retrieveSpecificData, saveEntryData, updateEntryData, createEntryTable} =
  useDatabaseHooks();
export default FullHomeView = ({route, navigation}) => {
  const {onBoarding, setOnBoarding} = useSettingsHooks();
  const baseEntry = {
    tags: [],
    time: Date.now(),
    emotion: -1,
    emotions: [
      // {
      //   startIndex: 0,
      //   endIndex: 5,
      //   emotion: 0,
      //   time: 1689856646,
      // },
    ],
    votes: [
      // {
      //   startIndex: 0,
      //   endIndex: 5,
      //   vote: 0,
      //   time: 1689856646,
      // },
    ],
    title: '',
    origins: {
      entry: {
        time: 0,
        source: 'manual',
      },
      title: {
        time: 0,
        source: 'manual',
      },
    },
    generated: false,
    entry: '',
  };
  const {entries, setEntries} = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [generatingEntry, setGeneratingEntry] = useState(false);

  // const [onBoarding, setOnBoarding] = useState(false);
  // console.log('TIMEZONE', RNLocalize.getTimeZone());

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
      updateEntryData(
        newEntry.tags.length === 0 ? '' : JSON.stringify(newEntry.tags),
        newEntry.title,
        newEntry.time,
        newEntry.emotion,
        newEntry.tags.emotions === 0 ? '' : JSON.stringify(newEntry.emotions),
        newEntry.tags.votes === 0 ? '' : JSON.stringify(newEntry.votes),
        newEntry.origins.entry.time,
        newEntry.origins.entry.source,
        newEntry.origins.title.time,
        newEntry.origins.title.source,
        newEntry.tags.events === 0 ? '' : JSON.stringify(newEntry.events),
        newEntry.entry,
        newEntry.id,
      );
      setEntries(entriesCopy);
      setLoading(false);
    }
  }, [route.params]);
  useEffect(() => {
    console.log('home entries useEffect', {entries});
  }, [entries]);
  useEffect(() => {
    setOnBoardingStep(0);
  }, [onBoarding]);

  const getPermissionsAndData = async () => {
    setGeneratingEntry(true);
    console.log('Get Permissions and Data');
    // setGettingData(true);
    // setLoading(true);
    //DAY
    var events = [];
    var locations = [];
    var photos = [];
    // GET CALENDAR EVENTS
    let startOfUnixTime = moment(Date.now()).startOf('day').unix();

    let endOfUnixTime = moment(Date.now()).endOf('day').unix();
    try {
      console.log('events', {startOfUnixTime, endOfUnixTime});
      events = await Location.getCalendarEvents(startOfUnixTime, endOfUnixTime);
      console.log({events});
    } catch (e) {
      if (e.message === 'DENIED') {
        console.error('GIVE PERMISSION TO APP FOR CALENDAR USAGE');
      } else {
        console.error(e);
      }
    }
    console.log('locations');
    // GET LOCATIONS
    retrieveSpecificData(startOfUnixTime * 1000, endOfUnixTime * 1000, res => {
      (locations = res.map(obj => {
        return {
          description: obj.description.split(',')[0],
          time: obj.date,
        };
      })),
        console.log(locations);
    });
    //GET PHOTOS
    console.log('photos');
    try {
      photos = await Location.getPhotosFromNative();
      console.log({photos});
    } catch (e) {
      console.error({e});
    }
    return {
      photos,
      locations,
      events,
    };
  };

  const generateEntry = async ({locations, events, photos}) => {
    setGeneratingEntry(true);
    console.log('Generate');
    // setGettingData(true);
    // setLoading(true);
    //DAY
    // var events = [];
    // var locations = [];
    var counter = 1;
    // var photos = [];
    var entriesCopy = [...entries];
    var entryEvents = [];
    // GET CALENDAR EVENTS
    let startOfUnixTime = moment(Date.now()).startOf('day').unix();

    let endOfUnixTime = moment(Date.now()).endOf('day').unix();

    // ASK CHATGPT TO CREATE ENTRY

    var autoGenerate =
      locations.length === 0 && events.length === 0 && photos.length === 0
        ? false
        : true;
    var response = '';
    if (autoGenerate === true) {
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
          endTime: parseInt(event.end) * 1000,
          title: event.title,
          additionalNotes: event.notes,
          calendar: {
            title: event.calendar,
            color: event.calendarColor,
          },
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
      var eventListStr = `${
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
                    : `${moment(parseInt(event.start) * 1000).format(
                        'LT',
                      )}-${moment(parseInt(event.end) * 1000).format('LT')}`
                } (id:${event.id})
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
      console.log('CREATE NEW ENTRY', eventListStr);
      const completion = await openai.createChatCompletion({
        // model: 'gpt-3.5-turbo',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content:
              'You are to act as my journal writer. I will give you a list of events that took place today and you are to generate a journal entry based on that. The diary entry should be a transcription of the events that you are told. Do not add superfluous details that you are unsure if they actually happened as this will be not useful to me. Add a [[X]] every time one of the events has been completed, e.g. I went to a meeting [[X]] then I went to the beach [[X]]. Replace X with the number assigned to the event. There is no need for sign ins (Dear Diary) or send offs (Yours sincerely). Do not introduce any details, events, etc not supplied by the user. Keep it short.',
          },
          {role: 'user', content: eventListStr},
        ],
      });
      response = completion.data.choices[0].message?.content;
      // const response =
      //   'This is a test entry. Please respond. &gt;';
      console.log(response);

      entriesCopy.push({
        ...baseEntry,
        time: startOfUnixTime * 1000,
        entry: '',
        events: entryEvents,
        entry: response,
        title: 'New Entry',
      });
    } else {
      entriesCopy.push({
        ...baseEntry,
        time: startOfUnixTime * 1000,
        entry: '',
        events: [],
        entry: 'No events found.',
        title: 'New Entry',
      });
      console.log('CREATE NEW ENTRY', 'No events found');
    }
    console.log({
      startOfUnixTime,
      entryEvents,
      entry: entriesCopy[entriesCopy.length - 1],
    });
    try {
      createEntryTable();
      saveEntryData({
        tags: '',
        title: 'New Entry',
        time: startOfUnixTime * 1000,
        emotion: 0,
        emotions: '',
        votes: '',
        titleModifiedAt: Date.now(),
        titleModifiedSource: 'auto',
        bodyModifiedAt: Date.now(),
        bodyModifiedSource: 'auto',
        events: entryEvents.length === 0 ? '' : JSON.stringify(entryEvents),
        body:
          entryEvents.length === 0
            ? 'No events found.'
            : entriesCopy[entriesCopy.length - 1].entry,
        generated: 1,
      });
    } catch (e) {
      console.error(e);
    }
    setEntries(entriesCopy);
    setGeneratingEntry(false);
    // setLoading(false);

    /*
      GET ALL DATA
      CHECK TO SEE IF AUTO GENERATE OR NOT
      CREATE MANUAL
      CREATE AUTO
      SAVE
      */
  };

  const createManualEntry = () => {
    setGeneratingEntry(true);
    var entriesCopy = [...entries];
    var newEntry = {
      ...baseEntry,
      time: Date.now(),
      events: [],
      entry: '',
      title: 'New Entry',
      generated: false,
    };
    entriesCopy.push(newEntry);
    try {
      createEntryTable();
      saveEntryData({
        tags: '',
        title: newEntry.title,
        time: newEntry.time,
        emotion: 0,
        emotions: '',
        votes: '',
        titleModifiedAt: Date.now(),
        titleModifiedSource: 'manual',
        bodyModifiedAt: Date.now(),
        bodyModifiedSource: 'manual',
        events: '',
        body: newEntry.entry,
        generated: 0,
      });
    } catch (e) {
      console.error(e);
    }
    setEntries(entriesCopy);
    setGeneratingEntry(false);
  };

  console.log(Dimensions.get('window'));

  return (
    <SafeAreaView style={{flexGrow: 1}}>
      <StatusBar
        barStyle={'dark-content'}
        // backgroundColor={onBoarding === true ? 'white' : '#F9F9F9'}
        backgroundColor={'white'}
      />
      {onBoarding === true ? (
        <Onboarding
          endOnboarding={() => {
            setOnBoarding(false);
          }}
          generateEntry={generateEntry}
          getPermissionsAndData={getPermissionsAndData}
          // onPress={async () => {
          //   await generateEntry(await getPermissionsAndData());
          //   // setOnBoarding(false);
          // }}
        />
      ) : (
        <>
          <HomeTop navigation={navigation} />
          <HomeHeading
            entries={entries.length}
            manual={entries.filter(entry => entry.generated !== true).length}
            events={
              entries
                .map(entry => entry.events)
                .flat()
                .filter(event => event.type !== 'photo').length
            }
            photos={
              entries
                .map(entry => entry.events)
                .flat()
                .filter(event => event.type === 'photo').length
            }
          />
          <ScrollView
            contentContainerStyle={{
              paddingVertical: verticalScale(10),
              paddingHorizontal: horizontalScale(10),
            }}
            style={{height: '70%'}}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                marginBottom: 10,
              }}>
              {generatingEntry ? (
                <Text>Loading...</Text>
              ) : (
                <>
                  <CreateEntryButton
                    onPress={async () => {
                      await generateEntry(await getPermissionsAndData());
                    }}
                    text={'Generate new entry'}
                  />
                  <CreateEntryButton
                    onPress={createManualEntry}
                    text={'Create new entry (Manual)'}
                  />
                </>
              )}
            </View>

            {/* <Image
              style={{width: 200, height: 300}}
              source={{
                uri: `lifestory://asset?id=0DBB35F8-FF65-4AB4-BE03-5D68535A5474/L0/001`,
              }}
            /> */}

            {!loading && (
              <EntryList entries={entries} navigation={navigation} />
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};
