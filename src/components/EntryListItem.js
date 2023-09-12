import {Text, TouchableOpacity, View} from 'react-native';
import {theme} from '../../Styling';
import moment from 'moment';
import ExpandIcon from '../assets/expand.svg';

const EntryListItem = ({entry, index, startOfWeek, endOfWeek, open}) => {
  return (
    <View
      key={index}
      style={{
        marginTop: startOfWeek ? 20 : 0,
        marginBottom: endOfWeek ? 20 : 0,
        borderTopLeftRadius: startOfWeek ? 15 : 0,
        borderTopRightRadius: startOfWeek ? 15 : 0,
        borderLeftWidth: 15,
        borderLeftColor: theme.home.entryItem.highlightBorder,
        borderTopColor: theme.home.entryItem.normalBorder,
        borderRightColor: theme.home.entryItem.normalBorder,
        borderBottomColor: theme.home.entryItem.normalBorder,
        borderTopWidth: startOfWeek ? 1 : 0,
        borderBottomWidth: endOfWeek ? 1 : 1,

        padding: 20,
        // marginTop: 3,
        borderBottomLeftRadius: endOfWeek ? 15 : 0,
        borderBottomRightRadius: endOfWeek ? 15 : 0,
        borderWidth: 1,
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text>
          <Text style={{fontWeight: 700, fontSize: 18}}>
            {moment(entry.time).format('dddd')}
          </Text>{' '}
          <Text
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: theme.general.timeText,
            }}>
            ({moment(entry.time).format('L')})
          </Text>
        </Text>
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: theme.home.entryItem.expandIconBorder,
            borderRadius: 5,
            padding: 2,
          }}
          onPress={() => {
            open();
          }}>
          <ExpandIcon />
        </TouchableOpacity>
      </View>

      <Text>{entry.title}</Text>
      <Text>{entry.entry}</Text>
    </View>
  );
};
export default EntryListItem;
