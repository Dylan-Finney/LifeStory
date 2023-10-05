import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  StyleSheet,
  Image,
  Button,
  NativeEventEmitter,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Svg, {Defs, Rect, LinearGradient, Stop} from 'react-native-svg';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import notifee, {
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

// import AMImage from './src/assets/am_image.svg';
// import AMImage from './src/assets/AMImage.png';

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
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from './src/utils/Metrics';
import DatePicker from 'react-native-date-picker';
import {decode, encode} from 'base-64';
import {useAppState} from '@react-native-community/hooks';
import onCreateTriggerNotification from './src/utils/CreateNotification';
// const {
//   DetectFacesCommand,
//   DetectLabelsCommand,
//   RekognitionClient,
// } = require('@aws-sdk/client-rekognition');

const {RNShare} = NativeModules;
const {Configuration, OpenAIApi} = require('openai');
// import {Rekognition} from 'aws-sdk/'
// var AWS = require('aws-sdk/dist/aws-sdk-react-native');
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: Config.AWS_ACCESS_KEY,
  secretAccessKey: Config.AWS_SECRET_KEY,
  region: Config.AWS_REGION,
});
const Rekognition = new AWS.Rekognition();

const configuration = new Configuration({
  apiKey: Config.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const {retrieveSpecificData, saveEntryData, updateEntryData, createEntryTable} =
  useDatabaseHooks();
export default FullHomeView = ({route, navigation}) => {
  const {
    onBoarding,
    setOnBoarding,
    photoAnalysis,
    includeDownloadedPhotos,
    setIncludeDownloadedPhotos,
    setPhotoAnalysis,
    locationAliases,
    createEntryTime,
    language,
    globalWritingSettings,
    onboardingTime,
  } = useSettingsHooks();
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
  const {entries, setEntries, loadingEntries} = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [generatingEntry, setGeneratingEntry] = useState(false);
  const [clickedNotification, setClickedNotification] = useState(null);
  // const CalendarEvents = new NativeEventEmitter(NativeModules.Location);

  // const [onBoarding, setOnBoarding] = useState(false);
  // console.log('TIMEZONE', RNLocalize.getTimeZone());

  const [onBoardingStep, setOnBoardingStep] = useState(0);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(false);
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

  const getPermissionsAndData = async date => {
    if (onBoarding === false) {
      setGeneratingEntry(true);
    }
    console.log('Get Permissions and Data');
    // setGettingData(true);
    // setLoading(true);
    //DAY
    var events = [];
    var locations = [];
    var photos = [];
    // GET CALENDAR EVENTS
    // let startOfUnixTime = moment(date).startOf('day').unix();

    // let endOfUnixTime = moment(date).endOf('day').unix();
    let endOfUnixTime = new Date(date);
    endOfUnixTime.setHours(createEntryTime);
    endOfUnixTime.setMinutes(0);
    endOfUnixTime.setSeconds(0);
    endOfUnixTime.setMilliseconds(0);
    let startOfUnixTime = new Date(endOfUnixTime.getTime());
    startOfUnixTime.setDate(startOfUnixTime.getDate() - 1);
    endOfUnixTime = Math.floor(endOfUnixTime.getTime() / 1000);
    startOfUnixTime = Math.floor(startOfUnixTime.getTime() / 1000);

    Location.setDateRange(startOfUnixTime, endOfUnixTime);
    try {
      console.log('events', {startOfUnixTime, endOfUnixTime});
      events = await Location.getCalendarEvents(startOfUnixTime, endOfUnixTime);
      // CalendarEvents.addListener('calendarChange', event => {
      //   console.log('calendarChange EVENT', {event});
      //   if (event !== 'null') {
      //     setCalendars(JSON.stringify(event));
      //   }
      //   CalendarEvents.removeAllListeners('calendarChange');
      // });
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
    var includeDownloadedPhotosCheck = includeDownloadedPhotos || false;
    try {
      photos = await Location.getPhotosFromNative();
      console.log({photos});
      if (onBoarding === true) {
        await new Promise((resolve, reject) => {
          Alert.alert(
            'Send Photos for Analysis',
            'Photos taken from the camera will be sent to Amazon to be analyzed. We WILL NOT store these photos.\nDo you wish to proceed?',

            [
              {
                text: 'Yes',
                style: 'default',
                onPress: () => {
                  setPhotoAnalysis(true);
                  resolve(true);
                },
              },
              {
                text: 'No',
                style: 'cancel',
                onPress: () => {
                  setPhotoAnalysis(false);
                  resolve(false);
                },
              },
            ],
          );
        });

        await new Promise((resolve, reject) => {
          Alert.alert(
            'Include Other Photos',
            'Photos downloaded or from Third Party apps WILL be included in your entries.\nDo you wish to proceed? Select no to exclude these photos.',

            [
              {
                text: 'Yes',
                style: 'default',
                onPress: () => {
                  setIncludeDownloadedPhotos(true);
                  includeDownloadedPhotosCheck = true;
                  resolve(true);
                },
              },
              {
                text: 'No',
                style: 'cancel',
                onPress: () => {
                  setIncludeDownloadedPhotos(false);
                  includeDownloadedPhotosCheck = false;
                  resolve(false);
                },
              },
            ],
          );
        });
      }
    } catch (e) {
      console.error({e});
    }
    console.log({photos});
    console.log({includeDownloadedPhotosCheck});
    if (includeDownloadedPhotosCheck !== true) {
      photos = photos.filter(photo => photo.lat !== 'null');
    }

    // NOTIFICATIONS
    await notifee.requestPermission();
    //RETURNS
    return {
      photos,
      locations,
      events,
    };
  };

  const generateEntry = async ({data, date}) => {
    setGeneratingEntry(true);
    console.log('Generate');
    var {locations, events, photos} = data;

    console.log({photos});

    var entryCreationTime = new Date(Date.now());
    entryCreationTime.setHours(createEntryTime);
    entryCreationTime.setMinutes(0);
    entryCreationTime.setSeconds(0);
    entryCreationTime.setMilliseconds(0);
    // console.log({entryCreationTime});
    // entryCreationTime = entryCreationTime.getTime();
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
    // let startOfUnixTime = moment(date).startOf('day').unix();

    // let endOfUnixTime = moment(date).endOf('day').unix();
    let endOfUnixTime = new Date(date);
    endOfUnixTime.setHours(createEntryTime);
    endOfUnixTime.setMinutes(0);
    endOfUnixTime.setSeconds(0);
    endOfUnixTime.setMilliseconds(0);
    let startOfUnixTime = new Date(endOfUnixTime.getTime());
    startOfUnixTime.setDate(startOfUnixTime.getDate() - 1);
    endOfUnixTime = Math.floor(endOfUnixTime.getTime() / 1000);
    startOfUnixTime = Math.floor(startOfUnixTime.getTime() / 1000);
    // ASK CHATGPT TO CREATE ENTRY

    var autoGenerate =
      locations.length === 0 && events.length === 0 && photos.length === 0
        ? false
        : true;
    if (photos.length > 0 && photoAnalysis === true) {
      await Promise.all(
        photos.map(async photo => {
          const image = decode(photo.data);
          const length = image.length;
          const imageBytes = new ArrayBuffer(length);
          const ua = new Uint8Array(imageBytes);
          for (var i = 0; i < length; i++) {
            ua[i] = image.charCodeAt(i);
          }
          var response;
          try {
            response = await Rekognition.detectLabels({
              Image: {Bytes: ua},
            }).promise();
            console.log('Rekognition.detectLabels Response', response);
            /*
            {
                  Labels: [
                    {
                      Name: 'Clothing',
                      Confidence: 100,
                      Instances: [],
                      Parents: [],
                      Aliases: [{Name: 'Apparel'}],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                    {
                      Name: 'Coat',
                      Confidence: 100,
                      Instances: [],
                      Parents: [{Name: 'Clothing'}],
                      Aliases: [],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                    {
                      Name: 'Plant',
                      Confidence: 99.12316131591797,
                      Instances: [],
                      Parents: [],
                      Aliases: [],
                      Categories: [{Name: 'Plants and Flowers'}],
                    },
                    {
                      Name: 'Vegetation',
                      Confidence: 99.12316131591797,
                      Instances: [],
                      Parents: [{Name: 'Plant'}],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Adult',
                      Confidence: 98.13746643066406,
                      Instances: [
                        {
                          BoundingBox: {
                            Width: 0.33328601717948914,
                            Height: 0.581555187702179,
                            Left: 0.3377372920513153,
                            Top: 0.4164018929004669,
                          },
                          Confidence: 98.13746643066406,
                        },
                      ],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Person Description'}],
                    },
                    {
                      Name: 'Female',
                      Confidence: 98.13746643066406,
                      Instances: [
                        {
                          BoundingBox: {
                            Width: 0.33328601717948914,
                            Height: 0.581555187702179,
                            Left: 0.3377372920513153,
                            Top: 0.4164018929004669,
                          },
                          Confidence: 98.13746643066406,
                        },
                      ],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Person Description'}],
                    },
                    {
                      Name: 'Person',
                      Confidence: 98.13746643066406,
                      Instances: [
                        {
                          BoundingBox: {
                            Width: 0.33328601717948914,
                            Height: 0.581555187702179,
                            Left: 0.3377372920513153,
                            Top: 0.4164018929004669,
                          },
                          Confidence: 98.13746643066406,
                        },
                      ],
                      Parents: [],
                      Aliases: [{Name: 'Human'}],
                      Categories: [{Name: 'Person Description'}],
                    },
                    {
                      Name: 'Woman',
                      Confidence: 98.13746643066406,
                      Instances: [
                        {
                          BoundingBox: {
                            Width: 0.33328601717948914,
                            Height: 0.581555187702179,
                            Left: 0.3377372920513153,
                            Top: 0.4164018929004669,
                          },
                          Confidence: 98.13746643066406,
                        },
                      ],
                      Parents: [
                        {Name: 'Adult'},
                        {Name: 'Female'},
                        {Name: 'Person'},
                      ],
                      Aliases: [],
                      Categories: [{Name: 'Person Description'}],
                    },
                    {
                      Name: 'Land',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [{Name: 'Nature'}, {Name: 'Outdoors'}],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Nature',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [{Name: 'Outdoors'}],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Outdoors',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Tree',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [{Name: 'Plant'}],
                      Aliases: [],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Woodland',
                      Confidence: 96.8377685546875,
                      Instances: [],
                      Parents: [
                        {Name: 'Land'},
                        {Name: 'Nature'},
                        {Name: 'Outdoors'},
                        {Name: 'Plant'},
                        {Name: 'Tree'},
                        {Name: 'Vegetation'},
                      ],
                      Aliases: [{Name: 'Forest'}],
                      Categories: [{Name: 'Nature and Outdoors'}],
                    },
                    {
                      Name: 'Jacket',
                      Confidence: 92.2098159790039,
                      Instances: [],
                      Parents: [{Name: 'Clothing'}, {Name: 'Coat'}],
                      Aliases: [],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                    {
                      Name: 'Standing',
                      Confidence: 65.57921600341797,
                      Instances: [],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Actions'}],
                    },
                    {
                      Name: 'Hair',
                      Confidence: 63.32209014892578,
                      Instances: [],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Beauty and Personal Care'}],
                    },
                    {
                      Name: 'Raincoat',
                      Confidence: 56.83426284790039,
                      Instances: [],
                      Parents: [{Name: 'Clothing'}, {Name: 'Coat'}],
                      Aliases: [],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                    {
                      Name: 'Walking',
                      Confidence: 56.17829513549805,
                      Instances: [],
                      Parents: [{Name: 'Person'}],
                      Aliases: [],
                      Categories: [{Name: 'Actions'}],
                    },
                    {
                      Name: 'Hood',
                      Confidence: 55.42615509033203,
                      Instances: [],
                      Parents: [{Name: 'Clothing'}],
                      Aliases: [],
                      Categories: [{Name: 'Apparel and Accessories'}],
                    },
                  ],
                  LabelModelVersion: '3.0',
                }; 
            */
          } catch (e) {
            console.error('Error with Rekognition.detectLabels', e);
            return photo;
          }
          const labels = response.Labels;
          const labelsFiltered = labels.filter(label => label.Confidence >= 80);
          const labelsWithTitle = labelsFiltered.map(label => {
            if (
              label.Categories.filter(category => category.Name).some(
                r =>
                  [
                    'Person Description',
                    'Actions',
                    'Events and Attractions',
                  ].indexOf(r) >= 0,
              )
            ) {
              return {
                ...label,
                title: `${label.Instances.length}x${label.Name}`,
              };
            } else {
              return {
                ...label,
                title: label.Name,
              };
            }
            // return `${label.Instances.length}x${label.Name}`;
          });
          const str = `an image has been described through tags, these are the tags used:
                ${labelsWithTitle.map(label => label.title).toString()}
          string these tags together into a full ${language} description of the image, do not make up any details not described by those tags. Do not try to describe how the image feels. Keep it short.`;
          console.log({
            str,
            labelsWithTitle,
            response: JSON.stringify(labels),
          });
          try {
            const completion = await openai.createChatCompletion({
              // model: 'gpt-3.5-turbo',
              model: 'gpt-4',
              messages: [{role: 'user', content: str}],
            });
            console.log({
              completion: completion.data.choices[0].message?.content,
            });
            return {
              ...photo,
              labels: labelsWithTitle,
              description: completion.data.choices[0].message?.content,
            };
          } catch (e) {
            console.error('Error with creating photo caption', e);
            return {...photo, labels: 'null'};
          }
        }),
      ).then(res => {
        console.log({res});
        photos = res;
      });
    }
    var locationAliasesArray = JSON.parse(locationAliases);
    const getAddressName = address => {
      var aliasObj = locationAliasesArray.find(
        locationAliasObj => locationAliasObj.address === address,
      );
      if (aliasObj !== undefined) {
        return aliasObj.alias;
      } else {
        return '';
      }
    };
    var response = '';
    if (autoGenerate === true) {
      locations = locations.map(location => {
        var address = location.description.split(',')[0];
        var alias = getAddressName(address);
        entryEvents.push({
          type: 'location',
          id: counter,
          time: location.time,
          title: alias !== '' ? `${alias} (${address})` : address,
          additionalNotes: '',
        });
        return {
          ...location,
          id: counter++,
          alias,
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
          description: photo.description,
        });
        return {
          ...photo,
          creation: Math.floor(parseFloat(photo.creation) * 1000),
          id: counter++,
          description: photo.description || 'None',
        };
      });

      var eventListStr = `${
        locations.length > 0
          ? `Locations Visited:
              ${locations.map(
                location =>
                  `${
                    location.alias !== ''
                      ? location.alias
                      : location.description
                  } @${moment(location.time).format('LT')} (id:${location.id})`,
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
                  `${
                    photo.labels !== 'null'
                      ? `Labels: ${photo.labels
                          .map(label => label.title)
                          .toString()}`
                      : ''
                  } ${photo.lat !== 'null' ? `Lat: ${photo.lat}` : ''} ${
                    photo.lon !== 'null' ? `Lon: ${photo.lon}` : ''
                  } @${moment(photo.creation).format('LT')}(id:${photo.id})`,
              )}`
                  : ''
              }
              `;
      console.log('CREATE NEW ENTRY', eventListStr);
      console.log('EVENTS', {photos, locations, events});

      try {
        const completion = await openai.createChatCompletion({
          // model: 'gpt-3.5-turbo',
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are to act as my journal writer. I will give you a list of events that took place today and you are to generate a journal entry based on that. The diary entry should be a transcription of the events that you are told. Do not add superfluous details that you are unsure if they actually happened as this will be not useful to me. Add a [[X]] every time one of the events has been completed, e.g. I went to a meeting [[X]] then I went to the beach [[X]]. Replace X with the number assigned to the event. There is no need for sign ins (Dear Diary) or send offs (Yours sincerely). Do not introduce any details, events, etc not supplied by the user. Keep it short. Each photo will be described by a series of tags. Write the entry in the ${language} language. ${
                JSON.parse(globalWritingSettings).generate
              }`,
            },
            {role: 'user', content: eventListStr},
          ],
        });
        console.log({completion});
        response = completion.data.choices[0].message?.content;
      } catch (e) {
        console.error({e});
      }

      // const response =
      //   'This is a test entry. Please respond. &gt;';
      console.log(response);

      entriesCopy.push({
        ...baseEntry,
        time: entryCreationTime.getTime(),
        entry: '',
        events: entryEvents,
        entry: response,
        title: 'New Entry',
      });
    } else {
      entriesCopy.push({
        ...baseEntry,
        time: entryCreationTime.getTime(),
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
        time: entryCreationTime.getTime(),
        emotion: -1,
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

  const createManualEntry = date => {
    setGeneratingEntry(true);
    var entriesCopy = [...entries];
    var newEntry = {
      ...baseEntry,
      time: date,
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
        emotion: -1,
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

  const checkIfReadyToGenerate = async () => {
    var now = new Date(Date.now());
    if (entries.length > 0) {
      if (
        new Date(entries.sort((a, b) => b.time - a.time)[0].time).getDate() <
          now.getDate() &&
        now.getHours() >= createEntryTime
      ) {
        console.log('Time to generate entry');
        await generateEntry({
          data: await getPermissionsAndData(now.getTime()),
          date: now.getTime(),
        });
        onCreateTriggerNotification({
          first: false,
          createEntryTime,
          time: null,
        });
      } else {
        console.log('Not Ready');
      }
    } else {
      if (onboardingTime < Date.now()) {
        console.log('Time to generate entry');
        await generateEntry({
          data: await getPermissionsAndData(now.getTime()),
          date: now.getTime(),
        });
        onCreateTriggerNotification({
          first: false,
          createEntryTime,
          time: null,
        });
      } else {
        console.log('Not Ready');
      }
    }
  };

  useEffect(() => {
    console.log({loadingEntries});
  }, [loadingEntries]);
  useEffect(() => {
    if (
      ((!loadingEntries && clickedNotification === null) ||
        (!loadingEntries && clickedNotification === true)) &&
      !onBoarding
    ) {
      console.log({loadingEntries, clickedNotification});
      checkIfReadyToGenerate();
      if (clickedNotification === true) {
        setClickedNotification(false);
      }
    }
  }, [loadingEntries, clickedNotification]);
  var inital = null;
  const bootStrap = async () => {
    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
      console.log(
        'Notification caused application to open',
        initialNotification.notification,
      );
      console.log(
        'Press action used to open the app',
        initialNotification.pressAction,
      );
      inital = true;
    }
  };
  useEffect(() => {
    bootStrap();
    return notifee.onForegroundEvent(({type, detail}) => {
      console.log('foreground', {type, detail});
      switch (type) {
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          if (inital !== true) {
            setClickedNotification(true);
          } else {
            inital = false;
          }

          // checkIfReadyToGenerate();
          break;
        case 7:
          break;
      }
    });
  }, []);

  return (
    <SafeAreaView style={{flexGrow: 1}}>
      <StatusBar
        barStyle={'dark-content'}
        // backgroundColor={onBoarding === true ? 'white' : '#F9F9F9'}
        backgroundColor={'white'}
      />
      {onBoarding === true ? (
        <>
          <Svg
            height={`${Dimensions.get('window').height}`}
            width={`${Dimensions.get('window').width}`}
            style={StyleSheet.absoluteFillObject}>
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop
                  offset="0%"
                  stopColor={theme.onboarding.background.from}
                />
                <Stop
                  offset="100%"
                  stopColor={theme.onboarding.background.to}
                />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grad)" />
          </Svg>
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
        </>
      ) : (
        <>
          <DatePicker
            modal
            mode="date"
            open={open}
            date={date}
            onConfirm={async date => {
              setOpen(false);
              // console.log({date: });
              if (mode === 'generate') {
                await generateEntry({
                  data: await getPermissionsAndData(date.getTime()),
                  date: date.getTime(),
                });
              } else if (mode === 'manual') {
                createManualEntry(date.getTime());
              }
              // setDate(date);
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />

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
                <Text style={{fontSize: moderateScale(14)}}>Loading...</Text>
              ) : (
                <>
                  <CreateEntryButton
                    onPress={async () => {
                      // await generateEntry(await getPermissionsAndData());
                      setOpen(true);
                      setMode('generate');
                    }}
                    text={'Generate new entry'}
                  />
                  <CreateEntryButton
                    onPress={() => {
                      setOpen(true);
                      setMode('manual');
                    }}
                    text={'Create new entry (Manual)'}
                  />
                  {/* <Button
                    title="Create Trigger Notification"
                    onPress={() => onCreateTriggerNotification()}
                  /> */}
                </>
              )}
            </View>

            {/* <Image
              style={{width: 200, height: 300}}
              source={{
                uri: `lifestory://asset?id=0DBB35F8-FF65-4AB4-BE03-5D68535A5474/L0/001`,
              }}
            /> */}

            {!loading && !loadingEntries ? (
              <>
                {entries.length === 0 ? (
                  <View style={{gap: 20}}>
                    <Image
                      source={
                        createEntryTime === 8
                          ? require('./src/assets/AMImage.png')
                          : require('./src/assets/PMImage.png')
                      }
                      resizeMode="contain"
                      style={{
                        alignSelf: 'center',
                        display: 'flex',
                        marginTop: 50,
                        width: horizontalScale(250),
                        height: verticalScale(250),
                        justifyContent: 'center',
                      }}
                    />
                    <Text
                      style={{
                        fontWeight: 600,
                        textAlign: 'center',
                        fontSize: 23,
                      }}>
                      Please wait till 8{createEntryTime === 8 ? 'AM' : 'PM'}
                    </Text>
                    <Text
                      style={{
                        fontWeight: 400,
                        textAlign: 'center',
                        fontSize: 18,
                      }}>
                      We will notify you as soon as your first daily summary
                      will be ready
                    </Text>
                  </View>
                ) : (
                  <EntryList entries={entries} navigation={navigation} />
                )}
              </>
            ) : (
              //
              <>
                {console.log({loading, loadingEntries})}
                <Text>Loading Entries...</Text>
              </>
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
};
