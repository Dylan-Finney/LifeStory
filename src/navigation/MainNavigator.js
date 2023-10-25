import React, {useState, useEffect} from 'react';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import {
  StyleSheet,
  View,
  NativeModules,
  NativeEventEmitter,
  Dimensions,
} from 'react-native';

import {createNativeStackNavigator} from '@react-navigation/native-stack';

import notifee from '@notifee/react-native';

import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

import useDatabaseHooks from '../utils/hooks/useDatabaseHooks';
import useSettingsHooks from '../utils/hooks/useSettingsHooks';

import {EventTypes} from '../utils/Enums';
import getMemories from '../utils/getMemories';

import AnimatedLaunchScreen from '../modules/onboarding/views/AnimatedLaunchScreen';
import AppContext from '../contexts/AppContext';
import OnboardingView from '../../OnboardingView';

const RootStack = createNativeStackNavigator();

const MainNavigator = () => {
  const {createVisitsTable, insertData, retrieveData} = useDatabaseHooks();
  // const {calendars} = useSettingsHooks();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);

  //// future authentication implementation here
  const isAuthenticated = true;

  useEffect(() => {
    setIsLoading(true);
  }, []);

  const [entries, setEntries] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [onBoarding, setOnBoarding] = useState(
    useSettingsHooks.getBoolean('onboarding'),
  );
  // const {onBoarding, calendars} = useSettingsHooks();

  const getFormatedTimeString = (time1, time2 = null) => {
    const date = new Date(time1);
    var hours = date.getHours();
    // Minutes part from the timestamp
    var minutes = '0' + date.getMinutes();

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? '0' + hours : 12;
    // Seconds part from the timestamp
    var formattedTime =
      hours.toString().slice(-2) +
      ':' +
      minutes.toString().slice(-2) +
      ' ' +
      ampm;
    if (time2 === null) {
      return formattedTime;
    } else {
      return `${formattedTime}-${getFormatedTimeString(time2)}`;
    }
  };

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
    const refreshMemories = async () => {
      try {
        console.log('LOADING MEMORIES DATA');
        const updatedMemories = await getMemories();
        // if (updatedMemories === undefined)
        console.log({updatedMemories});
        setMemories(updatedMemories);
        // setEntries(updatedEntries);
        // setLoadingEntries(false);
      } catch (e) {
        console.error('initial memory load', e);
      }
    };
    if (onBoarding === false) {
      setLoadingEntries(true);
      getEntries();
      refreshMemories();
      console.log({
        calendars: useSettingsHooks.getString('settings.calendars'),
      });
      try {
        NativeModules.Location.setCalendarIdentifiers(
          JSON.parse(useSettingsHooks.getString('settings.calendars')),
        );
      } catch (E) {
        console.error(E);
      }
    } else {
      setLoadingEntries(false);
    }
  }, []);
  const {width, height} = Dimensions.get('window');
  console.log({width, height});

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
        insertData(
          Math.floor(parseInt(res.arrivalTime)) * 1000 || Date.now(),
          res.lat,
          res.lon,
          res.description,
        );
        retrieveData('Visits', steps => {
          console.log({steps});
        });
      });
    })
    .catch(e => console.log(e.message, e.code));
  const navTheme = DefaultTheme;
  navTheme.colors.background = '#FBFBFB';

  notifee.setBadgeCount(0);

  // console.log('main navigator', entries, loadingEntries);

  const [firstEntryGenerated, setFirstEntryGenerated] = useState(false);

  const contextValues = {
    entries,
    setEntries,
    memories,
    setMemories,
    loadingEntries,
    onBoarding,
    setOnBoarding,
    devMode,
    setDevMode,
    firstEntryGenerated,
    setFirstEntryGenerated,
  };

  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="AnimatedLaunchScreen"
        screenOptions={{headerShown: false}}>
        <RootStack.Screen
          name="AnimatedLaunchScreen"
          component={AnimatedLaunchScreen}
        />

        <RootStack.Screen
          name="MainApp"
          children={() => (
            <View style={styles.safeArea}>
              {isAuthenticated ? (
                <AppContext.Provider value={contextValues}>
                  {onBoarding === true || firstEntryGenerated === true ? (
                    <OnboardingView />
                  ) : (
                    <AppNavigator />
                  )}
                </AppContext.Provider>
              ) : (
                <AuthNavigator />
              )}
            </View>
          )}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  activityIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default MainNavigator;
