import {Text, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import EntryListItem from './EntryListItem';
import {theme} from '../../../theme/styling';
const EntryList = ({entries, navigation}) => {
  return (
    <>
      {entries
        .sort((a, b) => b.time - a.time)
        .map((currEntry, currEntryIndex) => {
          const startOfWeek = () =>
            currEntryIndex === 0
              ? true
              : moment(entries[currEntryIndex - 1].time).week() !==
                moment(currEntry.time).week()
              ? true
              : false;
          const endOfWeek = () =>
            currEntryIndex === entries.length - 1
              ? true
              : moment(entries[currEntryIndex + 1].time).week() !==
                moment(currEntry.time).week()
              ? true
              : false;

          return (
            <View key={currEntryIndex}>
              {startOfWeek() && (
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontWeight: 700,
                      color: theme.general.timeText,
                    }}>
                    {moment(currEntry.time).startOf('week').format('MMMM')}{' '}
                  </Text>
                  <Text
                    allowFontScaling={false}
                    style={{
                      fontWeight: 700,
                      color: theme.general.timeText,
                    }}>
                    {moment(currEntry.time).startOf('week').format('Do')} -{' '}
                    {moment(currEntry.time).startOf('week').format('MMMM') ===
                    moment(currEntry.time).endOf('week').format('MMMM')
                      ? ''
                      : `${moment(currEntry.time)
                          .endOf('week')
                          .format('MMMM')} `}
                    {moment(currEntry.time).endOf('week').format('Do')}
                  </Text>
                </View>
              )}
              <EntryListItem
                entry={currEntry}
                index={currEntryIndex}
                startOfWeek={startOfWeek()}
                endOfWeek={endOfWeek()}
                open={() => {
                  navigation.navigate('Entry', {
                    baseEntry: {
                      ...currEntry,
                      index: currEntryIndex,
                    },
                  });
                }}
              />
            </View>
          );
        })}
    </>
  );
};

export default EntryList;
