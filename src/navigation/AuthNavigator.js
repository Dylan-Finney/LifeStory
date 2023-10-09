import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator>
    
      {/* <AuthStack.Screen name="LoginScreen" component={LoginScreen} /> */}
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;


// for later auth needs