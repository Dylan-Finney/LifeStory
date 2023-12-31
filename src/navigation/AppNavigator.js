import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Home from '../../Home';
import EntryView from '../modules/entries/views/EntryView';

import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {TouchableOpacity, View, StyleSheet} from 'react-native';
import SettingsIcon from '../assets/icons/SettingsIcon';
import MemoriesIcon from '../assets/icons/MemoriesIcon';
import StoriesIcon from '../assets/icons/StoriesIcon';

import SettingsNavigator from '../modules/settings/SettingsNavigator';

const Tab = createBottomTabNavigator();

const AppNavigator = ({routes}) => {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({focused}) => (
            <TouchableOpacity>
              {focused ? <StoriesIcon fill="#118ED1CC" /> : <StoriesIcon />}
            </TouchableOpacity>
          ),
        }}
        children={params => (
          <GestureHandlerRootView style={{flex: 1}}>
            <Home {...params} />
          </GestureHandlerRootView>
        )}
      />
      <Tab.Screen
        name="Entry"
        component={EntryView}
        options={{
          tabBarIcon: ({focused}) => (
            <TouchableOpacity>
              {focused ? <MemoriesIcon fill="#118ED1CC" /> : <MemoriesIcon />}
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: ({focused}) => (
            <TouchableOpacity>
              {focused ? <SettingsIcon fill="#118ED1CC" /> : <SettingsIcon />}
            </TouchableOpacity>
          ),
        }}
        children={params => <SettingsNavigator {...params} />}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
