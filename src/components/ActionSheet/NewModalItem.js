import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {Text} from '@gluestack-ui/themed';
import {ActionsheetItem, Box} from '@gluestack-ui/themed';
import UpvoteIcon from '../../assets/ModalUpvote.svg';
import {theme} from '../../theme/styling';

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
          allowFontScaling={false}
          style={[
            styles.boldText,
            {color: danger ? styles.dangerText.color : 'black'},
          ]}>
          {boldText}{' '}
        </Text>
        <Text allowFontScaling={false} style={styles.normalText}>
          {normalText}
        </Text>
      </Box>
      {num !== undefined && (
        <Box
          style={[
            styles.numContainer,
            numStyle === 1 && styles.numContainerActive,
          ]}>
          <Text
            allowFontScaling={false}
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
    paddingHorizontal: 0,
    width: '100%',
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
    width: 40,
    height: 40,
  },
  boldText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  normalText: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  numContainer: {
    backgroundColor: '#E7F4FA',
    justifyContent: 'flex-end',
    marginLeft: 'auto',

    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  numText: {
    fontWeight: 'bold',
    color: '#118ED1',
  },
  numContainerActive: {
    backgroundColor: '#E7E7E7',
  },
  numTextActive: {
    color: '#636363',
  },
  dangerText: {
    color: 'red',
  },
});
