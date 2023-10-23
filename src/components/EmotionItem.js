import 'react-native-url-polyfill/auto';

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {emotions} from '../utils/utils';

import FileIcon from '../assets/file-heart-03.svg';

import _ from 'lodash';

import {theme} from '../theme/styling';

import {horizontalScale, moderateScale, verticalScale} from '../utils/metrics';

const EmotionItem = ({extract, changeEmotion}) => {
  return (
    <View
      style={{
        backgroundColor: 'white',
        // padding: 10,
        // gap: 5,
        paddingVertical: verticalScale(10),
        paddingHorizontal: horizontalScale(10),
        gap: verticalScale(5),
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: horizontalScale(10),
        }}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            height: verticalScale(35),
            // paddingVertical: verticalScale(10),
            paddingHorizontal: horizontalScale(10),
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <FileIcon />
            <Text style={{fontSize: moderateScale(14)}}>Item</Text>
          </View>
          {extract.emotion > -1 ? (
            <View
              style={{
                backgroundColor: theme.entry.tags.background,
                borderRadius: 10,
                paddingVertical: verticalScale(1),
                paddingHorizontal: horizontalScale(6),
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {emotions[extract.emotion].icon(true)}
              <Text
                style={{
                  color: theme.entry.tags.text,
                  fontWeight: 500,
                }}>
                {emotions[extract.emotion].txt}
              </Text>
            </View>
          ) : (
            <View />
          )}
        </View>
        <View
          style={{
            backgroundColor: theme.entry.modal.background,
            display: 'flex',
            flexDirection: 'row',
            paddingVertical: verticalScale(7),
            paddingHorizontal: horizontalScale(7),
            gap: horizontalScale(2),
            width: '100%',
          }}>
          <View
            style={{
              width: horizontalScale(2),
              height: 'auto',
              backgroundColor: theme.entry.background,
            }}
          />
          <Text
            style={{
              color: theme.general.strongText,
              fontSize: moderateScale(15),
            }}>
            {extract.string}
          </Text>
        </View>

        {emotions.map((emotion, i) => {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => {
                changeEmotion(i);
              }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: verticalScale(3),
                  paddingHorizontal: horizontalScale(3),
                  gap: horizontalScale(2),
                  backgroundColor:
                    extract.emotion === i
                      ? theme.entry.buttons.toggle.background.active
                      : theme.entry.buttons.toggle.background.inactive,
                  borderColor:
                    extract.emotion === i
                      ? theme.entry.buttons.toggle.border.active
                      : theme.entry.buttons.toggle.border.inactive,
                  borderWidth: 1,
                  borderRadius: 5,
                }}>
                {emotion.icon(extract.emotion === i)}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default EmotionItem;
