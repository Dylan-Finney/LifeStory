import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {Text} from '@gluestack-ui/themed';
import {ActionsheetItem, Box} from '@gluestack-ui/themed';
import UpvoteIcon from './assets/ModalUpvote.svg';
import {theme} from './theme/styling';

export default NewModalItem = ({
  icon,
  boldText,
  normalText,
  onPress,
  danger = false,
  num,
  numStyle = 0,
}) => {
  return (
    <ActionsheetItem
      style={styles.container}
      alignItems="center"
      gap={10}
      width={'100%'}
      onPress={onPress}>
      <Box style={styles.boxContainer}>{icon}</Box>
      <Box flexDirection="row">
        <Text
          style={[
            styles.boldText,
            {color: danger ? styles.dangerText.color : 'black'},
          ]}>
          {boldText}{' '}
        </Text>
        <Text style={styles.normalText}>{normalText}</Text>
      </Box>
      {num !== undefined && (
        <Box
          style={[
            styles.numContainer,
            numStyle === 1 && styles.numContainerActive,
          ]}>
          <Text
            style={[styles.numText, numStyle === 1 && styles.numTextActive]}>
            {num}
          </Text>
        </Box>
      )}
    </ActionsheetItem>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  boxContainer: {
    paddingHorizontal: 6,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderColor: '#0b0b0b1a',
    borderRadius: 5,
    borderWidth: 1,
  },
  boldText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  normalText: {
    fontWeight: 'normal',
  },
  numContainer: {
    backgroundColor: '#E7E7E7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  numText: {
    fontWeight: 'bold',
    color: '#636363',
  },
  numContainerActive: {
    backgroundColor: '#E7F4FA',
  },
  numTextActive: {
    color: '#118ED1',
  },
  dangerText: {
    color: 'red',
  },
});
