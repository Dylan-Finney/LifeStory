import 'react-native-url-polyfill/auto';

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import _ from 'lodash';

import {theme} from '../theme/styling';

import {horizontalScale, moderateScale, verticalScale} from '../utils/metrics';

export const ModalScreenClose = ({close}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        close();
      }}
      style={{flexGrow: 1, flexBasis: 0, alignItems: 'flex-start'}}>
      <Text>Cancel</Text>
    </TouchableOpacity>
  );
};

export const ModalScreenUpdate = ({update, updateable}) => {
  console.log({updateable});
  return (
    <TouchableOpacity
      onPress={() => {
        update();
      }}
      style={{
        flexGrow: 1,
        flexBasis: 0,
        alignItems: 'flex-end',
      }}>
      <Text
        style={{
          color: updateable
            ? theme.entry.modal.header.updateText.active
            : theme.entry.modal.header.updateText.inactive,
        }}>
        Update entry
      </Text>
    </TouchableOpacity>
  );
};

export const ModalScreenTitle = ({icon, title}) => {
  return (
    <View style={{display: 'flex', flexDirection: 'row'}}>
      {icon}
      <Text style={{fontSize: moderateScale(20), fontWeight: 600}}>
        {title}
      </Text>
    </View>
  );
};

export const ModalScreenHeader = ({close, update, updateable, icon, title}) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // padding: 10,
        paddingHorizontal: horizontalScale(10),
        paddingVertical: verticalScale(10),
        // backgroundColor: 'black',
      }}>
      <ModalScreenClose
        close={() => {
          close();
        }}
      />
      <ModalScreenTitle title={title} icon={icon} />
      <ModalScreenUpdate
        update={() => {
          update();
        }}
        updateable={updateable}
      />
    </View>
  );
};
