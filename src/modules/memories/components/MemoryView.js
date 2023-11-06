import {EventTypes, emotionAttributes} from '../../../utils/Enums';
// import CalendarEventIcon from '../../../assets/calendar-event.svg';
import LabelIcon from '../../../assets/Labelling.svg';
import AngerIcon from '../../../assets/emotions/Anger.svg';
import FrownIcon from '../../../assets/emotions/Frown.svg';
import GrinIcon from '../../../assets/emotions/Grin.svg';
import NeutralIcon from '../../../assets/emotions/Neutral.svg';
import SmileIcon from '../../../assets/emotions/Smile.svg';
import LocationEventIcon from '../../../assets/event-location.svg';
import PhotoEventIcon from '../../../assets/event-photo.svg';
import CalendarEventIcon from '../../../assets/calendar-event.svg';
import SingleMapMemo from '../../../components/SingleMapMemo';
import {ImageAsset} from '../../../utils/native-modules/NativeImage';
import {EmotionBadge, VoteBadge} from '../../../components/Badge';
import {
  emotionToColor,
  emotionToIcon,
  emotionToString,
} from '../../../utils/emotionFuncs';
import {View, Text, ScrollView} from 'react-native';
import {Pressable, Box} from '@gluestack-ui/themed';

export default MemoryView = ({
  item,
  index,
  onLayout,
  onPress,
  onPressIn,
  highlighted,
  devMode,
  lastItem,
}) => {
  const getEventIcon = type => {
    switch (type) {
      case EventTypes.LOCATION:
        return <LocationEventIcon />;
      case EventTypes.PHOTO:
        return <PhotoEventIcon />;
      case EventTypes.CALENDAR_EVENT:
        return <CalendarEventIcon />;
    }
  };

  return (
    <View
      onLayout={onLayout}
      style={{
        padding: 20,
        paddingBottom: lastItem && 400,
        // paddingTop: 5,
        borderRadius: 20,
        backgroundColor: '#F6F6F6',
      }}>
      <Pressable
        onPressIn={onPressIn}
        onPress={onPress}
        px={10}
        py={15}
        rounded={'$md'}
        backgroundColor={highlighted ? '#E9E9E9' : '#F6F6F6'}>
        <Text
          allowFontScaling={false}
          style={{
            fontSize: 18,
            lineHeight: 24,
            fontWeight: 400,
            color: '#0b0b0bcc',
          }}>
          {item.body}
        </Text>
        {/* <Text
                  allowFontScaling={false}
                  style={{
                    fontSize: 18,
                    lineHeight: 24,
                    fontWeight: 400,
                    color: '#0b0b0bcc',
                  }}>
                  {new Date(item.time).toLocaleString()}
                </Text> */}
        {devMode === true && (
          <Text allowFontScaling={false} style={{paddingVertical: 5}}>
            {JSON.stringify(item)}
          </Text>
        )}
        {item.type > -1 && (
          <View style={{marginTop: 20}}>
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
                {getEventIcon(item.type)}
              </View>
              <View>
                <Text
                  numberOfLines={item.type === EventTypes.PHOTO ? 1 : undefined}
                  style={{
                    color: 'rgba(11, 11, 11, 0.8)',
                    fontWeight: 600,
                    marginRight: 50,
                  }}>
                  {item.type === EventTypes.LOCATION &&
                    item.eventsData.description}
                  {item.type === EventTypes.PHOTO && item.eventsData.name}
                  {item.type === EventTypes.CALENDAR_EVENT &&
                    item.eventsData.title}
                </Text>
                <Text
                  style={{
                    color: 'rgba(11, 11, 11, 0.6)',
                  }}>
                  {item.formattedTime}
                </Text>
              </View>
            </View>
          </View>
        )}

        {[EventTypes.LOCATION].includes(item.type) && (
          <SingleMapMemo
            lat={item.eventsData.lat}
            long={item.eventsData.long}
          />
        )}
        {[EventTypes.PHOTO].includes(item.type) && (
          <View
            style={{
              height: 200,
              // width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: 20,
            }}>
            <View
              style={{
                height: 200,
                width: 200,
                borderRadius: 20,
                overflow: 'hidden',
              }}>
              <ImageAsset
                localIdentifier={item.eventsData.localIdentifier}
                setHeight={200}
                setWidth={200}
                // height={1}
                style={{
                  // flex: 1,
                  height: 200,
                  width: 200,
                }}
              />
            </View>
          </View>
        )}
        {[EventTypes.CALENDAR_EVENT].includes(item.type) &&
          item.eventsData.notes !== undefined && (
            <ScrollView style={{height: 200}}>
              <Text
                style={
                  {
                    // overflow: 'scroll',
                    // width: '100%',
                    // height: 200,
                  }
                }>
                {item.eventsData.notes}
              </Text>
            </ScrollView>
          )}
        <Box flexDirection="row" gap={10} my={20}>
          {item.emotion > 0 && (
            <>
              <EmotionBadge
                outerBackgroundColor={emotionToColor({
                  emotion: item.emotion,
                  need: emotionAttributes.BACKGROUND,
                })}
                innerBackgroundColor={emotionToColor({
                  emotion: item.emotion,
                  need: emotionAttributes.STROKE,
                })}
                textColor={emotionToColor({
                  emotion: item.emotion,
                  need: emotionAttributes.STROKE,
                })}
                icon={emotionToIcon({
                  emotion: item.emotion,
                  active: false,
                  color: '#fff',
                })}
                text={emotionToString(item.emotion)}
              />
            </>
          )}
          {item.vote !== 0 && <VoteBadge vote={item.vote} />}

          {Object.values(item.tags).flat().length > 0 && (
            <Box
              px={10}
              py={5}
              backgroundColor={'#DFECF2'}
              justifyContent="center"
              flexDirection="row"
              rounded={'$full'}
              gap={5}
              alignItems="center">
              <Box
                aspectRatio={1}
                height={30}
                width={30}
                p={4}
                justifyContent="center"
                alignItems="center"
                rounded={'$md'}
                backgroundColor={'#118ED1'}>
                <LabelIcon height={25} width={25} primaryColor={'white'} />
              </Box>
              <Text style={{color: '#118ED1', fontWeight: 600}}>
                {Object.values(item.tags).flat().length}
              </Text>
            </Box>
          )}
        </Box>
      </Pressable>
      {!lastItem && (
        <View
          style={{
            height: 1,
            width: '100%',
            marginTop: 20,
            backgroundColor: 'rgba(11, 11, 11, 0.1)',
          }}></View>
      )}
    </View>
  );
};
