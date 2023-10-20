import 'react-native-url-polyfill/auto';

import React from 'react';
import {Text, View} from 'react-native';

import ClockIcon from '../assets/clock.svg';

import moment from 'moment';

import _ from 'lodash';

import {theme} from '../theme/styling';

import {horizontalScale, verticalScale} from '../utils/metrics';

const TimeDivider = ({previousTime, currentTime, index}) => {
  const isSameDay = (first, second) => {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  };

  const DividerLine = ({height}) => {
    return (
      <View
        style={{
          alignSelf: 'center',
          width: horizontalScale(2),
          height: verticalScale(height),
          backgroundColor: theme.general.timeDivider,
        }}
      />
    );
  };

  const isDifferentDay =
    previousTime === null
      ? false
      : !isSameDay(new Date(previousTime), new Date(currentTime));
  const isDifferentHour =
    previousTime === null
      ? false
      : new Date(previousTime).getHours() !== new Date(currentTime).getHours();

  return (
    <>
      <View
        style={{
          alignItems: 'center',
        }}>
        {index === 0 ? (
          <>
            <DividerLine height={20} />
            <Text
              style={{
                color: theme.general.timeText,
                paddingLeft: horizontalScale(3),
                fontWeight: 600,
              }}>
              {moment(currentTime).format('L')}
            </Text>
            <DividerLine height={10} />
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: horizontalScale(5),
              }}>
              <ClockIcon />
              <Text style={{color: theme.general.timeText}}>
                {new Date(currentTime).getHours()}:00
              </Text>
            </View>
            <DividerLine height={20} />
          </>
        ) : (
          <>
            {isDifferentDay && (
              <>
                <DividerLine height={isDifferentHour ? 20 : 10} />
                <Text
                  style={{
                    color: theme.general.timeText,
                    paddingLeft: horizontalScale(3),
                    fontWeight: 600,
                  }}>
                  {moment(currentTime).format('L')}
                </Text>
              </>
            )}
            <DividerLine height={10} />
            {isDifferentHour && (
              <>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: horizontalScale(5),
                  }}>
                  <ClockIcon />
                  <Text style={{color: theme.general.timeText}}>
                    {new Date(currentTime).getHours()}:00
                  </Text>
                </View>
                <DividerLine height={isDifferentDay ? 20 : 10} />
              </>
            )}
          </>
        )}
      </View>
    </>
  );
};

export default TimeDivider;
