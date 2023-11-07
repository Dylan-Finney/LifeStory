import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import UpvoteIcon from '../assets/ModalUpvote.svg';
import DownvoteIcon from '../assets/ModalDownvote.svg';

import LabelIcon from '../assets/Labelling.svg';

export const EmotionBadge = ({
  outerBackgroundColor,
  innerBackgroundColor,
  textColor,
  icon,
  text,
}) => {
  return (
    <View
      style={[styles.badgeContainer, {backgroundColor: outerBackgroundColor}]}>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: innerBackgroundColor},
          ]}>
          <View style={styles.icon}>{icon}</View>
        </View>
      )}

      <Text style={[styles.text, {color: textColor}]}>{text}</Text>
    </View>
  );
};

export const VoteBadge = ({vote}) => {
  const backgroundColor = vote > 0 ? '#DFECF2' : '#E7E7E7';
  const iconColor = vote > 0 ? '#118ED1' : '#6D6D6D';

  return (
    <View style={[styles.badgeContainer, {backgroundColor}]}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: iconColor,
            paddingVertical: 3,
            paddingHorizontal: 5,
            marginRight: 6,
          },
        ]}>
        {vote > 0 ? (
          <UpvoteIcon primaryColor={'white'} height="12px" />
        ) : (
          <DownvoteIcon primaryColor={'white'} height="12px" />
        )}
      </View>
      <Text style={{color: iconColor, fontWeight: '600'}}>{vote}</Text>
    </View>
  );
};

export const LabelBadge = ({tagCount}) => {
  return (
    <View
      style={[
        styles.badgeContainer,
        {
          backgroundColor: '#DFECF2',
        },
      ]}>
      <View style={[styles.iconContainer, {backgroundColor: '#118ED1'}]}>
        <View style={styles.icon}>
          <LabelIcon primaryColor={'white'} height="12px" width="12px" />
        </View>
      </View>
      <Text style={{color: '#118ED1', fontWeight: '600'}}>{tagCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 29,
    borderRadius: 100,
  },
  iconContainer: {
    aspectRatio: 1,
    height: 16,
    width: 16,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3,
  },
  icon: {
    aspectRatio: 1,
    height: 12,
    width: 12,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
