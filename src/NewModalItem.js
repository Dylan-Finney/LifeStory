import React from 'react';
import {Box, Center, Pressable, ActionsheetItem} from '@gluestack-ui/themed';
import {TouchableOpacity, View} from 'react-native';
import {Text} from '@gluestack-ui/themed';
import {theme} from './theme/styling';
import UpvoteIcon from './assets/ModalUpvote.svg';

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
    // <TouchableOpacity style={{flexDirection: 'row'}}>
    <ActionsheetItem
      flexDirection="row"
      alignItems="center"
      gap={10}
      width={'100%'}
      onPress={onPress}>
      <Box
        paddingHorizontal={6}
        paddingVertical={10}
        alignItems="center"
        justifyContent="center"
        backgroundColor="white"
        borderColor="#0b0b0b1a"
        borderRadius={5}
        borderWidth={1}>
        {icon}
      </Box>
      <Box flexDirection="row">
        <Text
          size={'md'}
          fontWeight={'bold'}
          allowFontScaling={false}
          color={danger ? 'red' : 'black'}>
          {boldText}{' '}
        </Text>
        <Text allowFontScaling={false} fontWeight={'normal'}>
          {normalText}
        </Text>
      </Box>
      {num !== undefined && (
        <Box
          ml={'auto'}
          backgroundColor={numStyle === 1 ? '#E7E7E7' : '#E7F4FA'}
          px={10}
          py={5}
          rounded="$full">
          <Text
            fontWeight="$bold"
            color={numStyle === 1 ? '#636363' : '#118ED1'}>
            {num}
          </Text>
        </Box>
      )}

      {/* </TouchableOpacity> */}
    </ActionsheetItem>
  );
};
