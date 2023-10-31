import 'react-native-url-polyfill/auto';

import React from 'react';

import MainNavigator from './src/navigation/MainNavigator';

import {GluestackUIProvider} from '@gluestack-ui/themed';

import {SafeAreaProvider} from 'react-native-safe-area-context';

import {config} from '@gluestack-ui/config';

export default App = () => {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={config}>
        <MainNavigator />
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
};
