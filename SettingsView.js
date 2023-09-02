import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  Button,
  Image,
  KeyboardAvoidingView,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  useColorScheme,
  View,
  Alert,
} from 'react-native';
import useDatabaseHooks from './useDatabaseHooks';
import AppContext from './Context';
import useSettingsHooks from './useSettingsHooks';
export default SettingsView = ({route, navigation}) => {
  const {deleteTable, createEntryTable} = useDatabaseHooks();
  const {onBoarding, setOnBoarding} = useSettingsHooks();

  const {setEntries} = useContext(AppContext);
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        flexGrow: 1,
      }}>
      <Text
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          Alert.alert(
            'Delete Entries',
            'Are you sure you want to dlete all of your entries?\nThis action is irreversible.',
            [
              {
                text: 'Confirm',
                style: 'default',
                onPress: () => {
                  deleteTable('Entries');
                  setEntries([]);
                  createEntryTable();
                },
              },
              {text: 'Cancel', style: 'cancel'},
            ],
          );
        }}>
        Delete Entries
      </Text>
      <Text
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          Alert.alert(
            'Delete Location Data',
            'Are you sure you want to dlete all of your LifeStory Location Data?\nThis app can only gets your data from the point it has access and starts recording it.\nThis action is irreversible.',
            [
              {
                text: 'Confirm',
                style: 'default',
                onPress: () => {
                  deleteTable('Visits');
                },
              },
              {text: 'Cancel', style: 'cancel'},
            ],
          );
        }}>
        Delete Location History
      </Text>
      <Text
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          Alert.alert(
            'Warning!',
            'This will reset the App to its inital state.\nAll Data associated with the App, that the App owns, will be deleted.\nThis action is irreversible.\nDo you wish to proceed?',
            [
              {
                text: 'Confirm',
                style: 'default',
                onPress: () => {
                  deleteTable('Visits');
                  deleteTable('Entries');
                  setEntries([]);
                  setOnBoarding(true);
                  navigation.navigate({
                    name: 'Home',
                  });
                },
              },
              {text: 'Cancel', style: 'cancel'},
            ],
          );
        }}>
        Reset All Data
      </Text>
    </View>
  );
};
