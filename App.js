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
  Dimensions,
} from 'react-native';

import 'react-native-url-polyfill/auto';

import EntryView from './EntryView.js';
import LocationAliases from './LocationAliases.js';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Home from './Home';
import AppContext from './Context';

import useDatabaseHooks from './useDatabaseHooks';
import useSettingsHooks from './useSettingsHooks.js';
import SettingsView from './SettingsView';
import notifee, {
  TimestampTrigger,
  TriggerType,
  EventType,
} from '@notifee/react-native';
const {createVisitsTable, insertData, retrieveData} = useDatabaseHooks();
// const {calendars} = useSettingsHooks();
export default App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  // moment.locale('en-gb');

  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const {onBoarding, calendars} = useSettingsHooks();

  useEffect(() => {
    const getEntries = async () => {
      try {
        console.log('LOADING ENTRIES DATA');
        const localEntries = await retrieveData('Entries');
        console.log({localEntries});
        var updatedEntries = localEntries.map(localEntry => {
          return {
            ...localEntry,
            tags: localEntry.tags === '' ? [] : JSON.parse(localEntry.tags),
            time: parseInt(localEntry.time),
            emotion: parseInt(localEntry.emotion),
            emotions:
              localEntry.emotions === '' ? [] : JSON.parse(localEntry.emotions),
            votes: localEntry.votes === '' ? [] : JSON.parse(localEntry.votes),
            title: localEntry.title,
            origins: {
              entry: {
                time: parseInt(localEntry.bodyModifiedAt),
                source: localEntry.bodyModifiedSource,
              },
              title: {
                time: parseInt(localEntry.titleModifiedAt),
                source: localEntry.titleModifiedSource,
              },
            },
            events:
              localEntry.events === '' ? [] : JSON.parse(localEntry.events),
            entry: localEntry.body,
            generated: parseInt(localEntry.generated) === 0 ? false : true,
          };
        });
        console.log({updatedEntries});
        setEntries(updatedEntries);
        setLoadingEntries(false);
      } catch (e) {
        console.error(e);
      }
    };
    if (onBoarding === false) {
      setLoadingEntries(true);
      getEntries();
      console.log({calendars});
      try {
        NativeModules.Location.setCalendarIdentifiers(JSON.parse(calendars));
      } catch (E) {
        console.error(E);
      }
    } else {
      setLoadingEntries(false);
    }
  }, []);
  const {width, height} = Dimensions.get('window');
  console.log({width, height});
  const RootStack = createNativeStackNavigator();

  const contextValues = {
    entries,
    setEntries,
    loadingEntries,
  };

  const CounterEvents = new NativeEventEmitter(NativeModules.Location);
  CounterEvents.removeAllListeners('onCalendar');
  CounterEvents.addListener('onCalendar', res => {
    console.log(`TEST ${new Date().toISOString()}`, res);
  });

  NativeModules.Location.enablePermissions()
    .then(res => {
      CounterEvents.removeAllListeners('locationChange');
      CounterEvents.addListener('locationChange', res => {
        console.log('locationChange event', res);
        createVisitsTable();
        insertData(res.date || Date.now(), res.lat, res.lon, res.description);
        retrieveData('Visits', steps => {
          console.log({steps});
        });
      });
    })
    .catch(e => console.log(e.message, e.code));
  const navTheme = DefaultTheme;
  navTheme.colors.background = '#FBFBFB';

  notifee.setBadgeCount(0);
  return (
    <NavigationContainer>
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
        <RootStack.Screen
          name="Settings"
          options={{headerShown: true, title: ''}}
          children={params => (
            <AppContext.Provider value={contextValues}>
              <SettingsView {...params} />
            </AppContext.Provider>
          )}
        />
        <RootStack.Screen
          name="Locations"
          options={{headerShown: true, title: ''}}
          component={LocationAliases}
          // children={params => (
          //   <AppContext.Provider value={contextValues}>
          //     <SettingsView {...params} />
          //   {/* </AppContext.Provider> */}
          // )}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
