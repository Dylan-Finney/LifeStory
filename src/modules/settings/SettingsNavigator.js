import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {TouchableOpacity} from 'react-native';

import SettingsView from './views/SettingsView';
import LocationAliases from './views/LocationAliases';

const SettingsStack = createNativeStackNavigator();

const SettingsNavigator = () => {
  return (
    <SettingsStack.Navigator initialRouteName="ThreadsNavigator">
      <SettingsStack.Screen
        name="Settings_Base"
        component={SettingsView}
        options={{
          headerShown: false,
        }}
      />
      <SettingsStack.Screen
        name="Locations"
        component={LocationAliases}
        // options={{
        //   headerLeft: () => <BackButton navigation={navigation} />,
        // }}
      />
    </SettingsStack.Navigator>
  );
};

export default SettingsNavigator;
