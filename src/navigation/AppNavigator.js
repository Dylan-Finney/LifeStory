import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Home from '../../Home';
import EntryView from '../modules/entries/views/EntryView';
import SettingsView from '../../SettingsView';
import LocationAliases from '../../LocationAliases';
import AppContext from '../../Context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const RootStack = createNativeStackNavigator();

const AppNavigator = ({
  entries,
  setEntries,
  loadingEntries,
  onBoarding,
  setOnBoarding,
}) => {
  const contextValues = {
    entries,
    setEntries,
    loadingEntries,
    onBoarding,
    setOnBoarding,
  };

  console.log('contextValues app navigator', contextValues);

  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      <RootStack.Screen
        name="Home"
        children={params => (
          <GestureHandlerRootView style={{flex: 1}}>
            <AppContext.Provider value={contextValues}>
              <Home {...params} />
            </AppContext.Provider>
          </GestureHandlerRootView>
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
      />
    </RootStack.Navigator>
  );
};

export default AppNavigator;
