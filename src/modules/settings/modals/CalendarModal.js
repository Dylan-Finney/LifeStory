import React, {useState} from 'react';
import {
  Text,
  View,
  NativeModules,
  NativeEventEmitter,
  ScrollView,
} from 'react-native';

import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';

import CalendarIcon from '../../../assets/settings/calendar.svg';

import CustomModalWrapper from '../../../components/modals/CustomModalWrapper';
import {useTheme} from '../../../theme/ThemeContext';

const CalendarModal = ({visible, onUpdate, onClose}) => {
  const {theme} = useTheme();

  //not needed?
  const [tempWritingSettings, setTempWritingSettings] = useState(
    JSON.parse(useSettingsHooks.getString('settings.globalWritingSettings')),
  );
  const CalendarEvents = new NativeEventEmitter(NativeModules.Location);

  return (
    <CustomModalWrapper
      visible={visible}
      onClose={onClose}
      //not needed?
      onUpdate={() => {
        useSettingsHooks.set(
          'settings.globalWritingSettings',
          JSON.stringify(tempWritingSettings),
        );
      }}
      leftButton="Cancel"
      heading={{
        text: 'Calendar',
        icon: <CalendarIcon />,
      }}
      rightButton={{
        text: 'Update',
        disabled:
          //not needed?
          JSON.parse(
            useSettingsHooks.getString('settings.globalWritingSettings'),
          ) === tempWritingSettings ||
          tempWritingSettings.title.length > 200 ||
          tempWritingSettings.body.length > 200 ||
          tempWritingSettings.generate.length > 200,
      }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(24),
          paddingVertical: verticalScale(16),
        }}>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: theme.colors.border,
            paddingVertical: verticalScale(16),
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: theme.colors.tertiary,
              fontWeight: 500,
              fontSize: 14,
            }}
            onPress={() => {
              NativeModules.Location.chooserOpen();
              CalendarEvents.addListener('calendarChange', event => {
                console.log('calendarChange EVENT', {event});
                if (event !== 'null') {
                  // setCalendars(JSON.stringify(event));
                  useSettingsHooks.set(
                    'settings.calendars',
                    JSON.stringify(event),
                  );
                }
                CalendarEvents.removeAllListeners('calendarChange');
              });
            }}>
            Change Connected Calendars
          </Text>
        </View>
      </ScrollView>
    </CustomModalWrapper>
  );
};

export default CalendarModal;
