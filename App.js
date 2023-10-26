import 'react-native-url-polyfill/auto';

import React, {useState, useEffect} from 'react';

import MainNavigator from './src/navigation/MainNavigator';

import {GluestackUIProvider} from '@gluestack-ui/themed';

import {config} from '@gluestack-ui/config';

export default App = () => {
  // moment.locale('en-gb');

  return (
    <GluestackUIProvider config={config}>
      <MainNavigator />
    </GluestackUIProvider>
  );
};
