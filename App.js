import React, {Component, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  requireNativeComponent,
  Text,
  Touchable,
  TouchableOpacity,
} from 'react-native';
import {Switch} from './Switch';
export default App = () => {
  const [text, setText] = useState('Hey Thereaaaa');
  useEffect(() => {
    console.log({text});
  }, [text]);
  return (
    <View style={styles.container}>
      <Switch
        style={styles.nativeBtn}
        isOn={false}
        onTxtChange={({nativeEvent: {nativeStr}}) => {
          console.log(nativeStr);
          setText(nativeStr);
        }}
        initalTxtString={text}
        onEventMenu={({nativeEvent: {nativeEventMenu}}) => {
          console.log(nativeEventMenu);
        }}
      />
      <TouchableOpacity
        onPress={() => {
          setText(text + ' Hey');
        }}>
        <Text>Hey</Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeBtn: {height: 100, width: 300, backgroundColor: 'yellow'},
});
