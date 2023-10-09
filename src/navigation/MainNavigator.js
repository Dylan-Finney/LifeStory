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

import useDatabaseHooks from '../../useDatabaseHooks';
import useSettingsHooks from '../../useSettingsHooks';

const RootStack = createNativeStackNavigator();

const MainNavigator = () => {
  const {createVisitsTable, insertData, retrieveData} = useDatabaseHooks();
  // const {calendars} = useSettingsHooks();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //// future authentication implementation here
  const isAuthenticated = true;

  useEffect(() => {
    setIsLoading(true);
  }, []);

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

  console.log('main navigator', entries, loadingEntries);

  return (
    <NavigationContainer>
      <RootStack.Navigator
        // initialRouteName="AnimatedLaunchScreen"
        screenOptions={{headerShown: false}}>
        {/* <RootStack.Screen
          name="AnimatedLaunchScreen"
          component={AnimatedLaunchScreen}
        /> */}
        <RootStack.Screen
          name="MainApp"
          children={() => (
            <View style={styles.safeArea}>
              {isAuthenticated ? (
                <AppNavigator
                  entries={entries}
                  setEntries={setEntries}
                  loadingEntries={loadingEntries}
                />
              ) : (
                <AuthNavigator />
              )}
              {/* {isLoading ? (
                <View style={styles.activityIndicator}>
                  <ActivityIndicator size="large" />
                </View>
              ) : null} */}
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
