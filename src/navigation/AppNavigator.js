import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

// import Home from '../../Home';
// import EntryView from '../modules/entries/views/EntryView';

import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {TouchableOpacity, View, StyleSheet} from 'react-native';
import SettingsIcon from '../assets/icons/SettingsIcon';
import MemoriesIcon from '../assets/icons/MemoriesIcon';
import StoriesIcon from '../assets/icons/StoriesIcon';

import SettingsNavigator from '../modules/settings/SettingsNavigator';
import MemoriesView from '../modules/memories/views/MemoriesView';
import StoriesView from '../modules/stories/views/StoriesView';
import InsightsView from '../modules/insights/views/InsightsView';

const Tab = createBottomTabNavigator();

const AppNavigator = ({routes}) => {
  return (
    <Tab.Navigator
      initialRouteName="Entry"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopRightRadius: 20,
          borderTopLeftRadius: 20,
        },
      }}>
      {/* <Tab.Screen
        name="Stories"
        options={{
          tabBarIcon: ({focused}) => (
            <>{focused ? <StoriesIcon fill="#118ED1CC" /> : <StoriesIcon />}</>
          ),
        }}
        children={params => (
          <GestureHandlerRootView style={{flex: 1}}>
            <StoriesView {...params} />
          </GestureHandlerRootView>
        )}
      /> */}
      {/* <Tab.Screen
        name="Insights"
        options={{
          tabBarIcon: ({focused}) => (
            <>{focused ? <StoriesIcon fill="#118ED1CC" /> : <StoriesIcon />}</>
          ),
        }}
        children={params => (
          <GestureHandlerRootView style={{flex: 1}}>
            <InsightsView {...params} />
          </GestureHandlerRootView>
        )}
      /> */}
      <Tab.Screen
        name="Entry"
        children={params => (
          <GestureHandlerRootView style={{flex: 1}}>
            <MemoriesView {...params} />
          </GestureHandlerRootView>
        )}
        options={{
          tabBarIcon: ({focused}) => (
            <>
              {/* <TouchableOpacity> */}
              {focused ? <MemoriesIcon fill="#118ED1CC" /> : <MemoriesIcon />}
              {/* </TouchableOpacity> */}
            </>
          ),
          tabBarLabel: 'Memories',
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          tabBarIcon: ({focused}) => (
            <>
              {/* <TouchableOpacity> */}
              {focused ? <SettingsIcon fill="#118ED1CC" /> : <SettingsIcon />}
              {/* </TouchableOpacity> */}
            </>
          ),
        }}
        children={params => (
          <GestureHandlerRootView style={{flex: 1}}>
            <SettingsNavigator {...params} />
          </GestureHandlerRootView>
        )}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
