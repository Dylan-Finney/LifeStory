import {View, Text} from 'react-native';
import {getEventIcon} from '../../../../utils/getEventIcon';
import {EventTypes} from '../../../../utils/Enums';

export const MemoryEventHeader = ({type, eventsData, desc}) => {
  return (
    <View style={{marginTop: 20, marginRight: 30}}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <View
          style={{
            padding: 5,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: '#EAEAEA',
            backgroundColor: 'white',
          }}>
          {getEventIcon(type)}
        </View>
        <View>
          <Text
            numberOfLines={
              [EventTypes.PHOTO, EventTypes.LINK].includes(type) ? 1 : undefined
            }
            style={{
              color: 'rgba(11, 11, 11, 0.8)',
              fontWeight: 600,
              marginRight: 50,
            }}>
            {type === EventTypes.LOCATION && eventsData.description}
            {type === EventTypes.PHOTO && `1 Photo`}
            {type === EventTypes.PHOTO_GROUP && `${eventsData.length} Photos`}
            {type === EventTypes.CALENDAR_EVENT && eventsData.title}
            {type === EventTypes.LINK && eventsData}
          </Text>
          <Text
            numberOfLines={4}
            style={{
              color: 'rgba(11, 11, 11, 0.6)',
            }}>
            {desc}
          </Text>
        </View>
      </View>
    </View>
  );
};
