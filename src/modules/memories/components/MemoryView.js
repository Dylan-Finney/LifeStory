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
import {EmotionBadge, LabelBadge, VoteBadge} from '../../../components/Badge';
import {
  emotionToColor,
  emotionToIcon,
  emotionToString,
} from '../../../utils/emotionFuncs';
import {View, Text, ScrollView} from 'react-native';
import {Pressable, Box} from '@gluestack-ui/themed';

const CustomImage = ({identifier, index, length}) => {
  const baseValues = {
    width: {
      base: 165,
    },
    height: {
      base: 200,
      small: 67,
    },
  };

  const width = () => {
    switch (index) {
      case 0:
        return baseValues.width.base;
      case 1:
      case 2:
        switch (length) {
          case 1:
          case 2:
          case 3:
            return baseValues.width.base;
          case 4:
          case 5:
            return baseValues.width.base / 2;
          default:
            return baseValues.width.base / 3;
        }
      case 3:
        switch (length) {
          case 1:
          case 2:
          case 3:
          case 4:
            return baseValues.width.base;
          case 5:
            return baseValues.width.base / 2;
          default:
            return baseValues.width.base / 3;
        }
      case 4:
        switch (length) {
          case 5:
            return baseValues.width.base / 2;
          case 6:
            return baseValues.width.base / 2;
          default:
            return baseValues.width.base / 3;
        }
      case 5:
      case 6:
        switch (length) {
          case 0:
            return baseValues.width.base / 3;
          case 1:
            return baseValues.width.base;
          case 6:
            return baseValues.width.base / 2;
          default:
            return baseValues.width.base / 3;
        }
      case 7:
      case 8:
      case 9:
        switch ((length - 1) % 3) {
          case 0:
            return baseValues.width.base / 3;
          case 1:
            return baseValues.width.base;
          case 2:
            return baseValues.width.base / 2;
        }
    }
  };

  const height = () => {
    switch (length) {
      case 1:
      case 2:
        return baseValues.height.base;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        switch (index) {
          case 0:
            return baseValues.height.base;
          default:
            return baseValues.height.base / 2;
        }
      case 7:
        switch (index) {
          case 0:
            return baseValues.height.base;
          default:
            return baseValues.height.base / 2;
        }
      case 9:
        switch (index) {
          case 0:
            return baseValues.height.base;
          default:
            return baseValues.height.small;
        }
      default:
        switch (index) {
          case 0:
            return baseValues.height.base;
          default:
            return baseValues.height.small;
        }
    }
  };

  const bordersTopLeft = () => {
    if (index === 0 || index === undefined) {
      return true;
    } else {
      return false;
    }
  };

  const bordersTopRight = () => {
    switch (length) {
      case 3:
        switch (index) {
          case 1:
            return true;
          default:
            return false;
        }
      default:
        switch (index) {
          case length - 1:
            return true;
          default:
            return false;
        }
    }
  };

  const bordersBottomLeft = () => {
    if (index === 0 || index === undefined) {
      return true;
    } else {
      return false;
    }
  };

  const bordersBottomRight = () => {
    switch (length) {
      case 1:
        return true;
      case 2:
        switch (index) {
          case 1:
            return true;
          default:
            return false;
        }
      case 4:
      case 3:
      case 5:
        switch (index) {
          case 2:
            return true;
          default:
            return false;
        }
      default:
        switch (index) {
          case 3:
            return true;
          default:
            return false;
        }
    }
  };
  return (
    <View
      style={{
        height: height(),
        // width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: 'green',
        overflow: 'hidden',
        // borderRadius: 20,
      }}>
      <View
        style={{
          height: height(),
          width: width(),
          // backgroundColor: 'red',
          borderRadius: 20,
          borderTopLeftRadius: bordersTopLeft() === true ? 20 : 0,
          borderTopRightRadius: bordersTopRight() === true ? 20 : 0,
          borderBottomLeftRadius: bordersBottomLeft() === true ? 20 : 0,
          borderBottomRightRadius: bordersBottomRight() === true ? 20 : 0,
          overflow: 'hidden',
        }}>
        <ImageAsset
          localIdentifier={identifier}
          setHeight={height()}
          setWidth={width()}
          // height={1}
          style={{
            // flex: 1,
            height: height(),
            width: width(),
          }}
        />
      </View>
    </View>
  );
};

const ImageCollage = ({photoGroupData}) => {
  const length = photoGroupData.length;
  switch (length) {
    case 2:
    case 3:
    case 4:
    case 5:
      return (
        <View style={{flexDirection: 'row'}}>
          <CustomImage
            identifier={photoGroupData[0].localIdentifier}
            index={0}
            length={length}
          />
          <View style={{flexDirection: 'column'}}>
            {length > 3 && (
              <View style={{flexDirection: 'row'}}>
                {[...Array(length - 3 > 2 ? 2 : length - 3)].map((e, i) => (
                  <CustomImage
                    key={i}
                    identifier={photoGroupData[3 + i].localIdentifier}
                    index={3 + i}
                    length={length}
                  />
                ))}
              </View>
            )}
            {length > 1 && (
              <View style={{flexDirection: length === 3 ? 'column' : 'row'}}>
                {[...Array(length - 1 > 2 ? 2 : length - 1)].map((e, i) => (
                  <CustomImage
                    key={i}
                    identifier={photoGroupData[1 + i].localIdentifier}
                    index={1 + i}
                    length={length}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      );
    default:
      return (
        <View style={{flexDirection: 'row'}}>
          <CustomImage
            identifier={photoGroupData[0].localIdentifier}
            index={0}
            length={length}
          />
          <View style={{flexDirection: 'column'}}>
            {length > 7 && (
              <View style={{flexDirection: 'row'}}>
                {[...Array(length - 7 > 3 ? 3 : length - 7)].map((e, i) => (
                  <CustomImage
                    key={i}
                    identifier={photoGroupData[7 + i].localIdentifier}
                    index={7 + i}
                    length={length}
                  />
                ))}
              </View>
            )}

            {length > 4 && (
              <View style={{flexDirection: 'row'}}>
                {[...Array(length - 4 > 3 ? 3 : length - 4)].map((e, i) => (
                  <CustomImage
                    key={i}
                    identifier={photoGroupData[4 + i].localIdentifier}
                    index={4 + i}
                    length={length}
                  />
                ))}
              </View>
            )}
            {length > 1 && (
              <View style={{flexDirection: 'row'}}>
                {[...Array(length - 1 > 3 ? 3 : length - 1)].map((e, i) => (
                  <CustomImage
                    key={i}
                    identifier={photoGroupData[1 + i].localIdentifier}
                    index={1 + i}
                    length={length}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      );
  }
};

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
      case EventTypes.PHOTO_GROUP:
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
                  {item.type === EventTypes.PHOTO && `1 Photo`}
                  {item.type === EventTypes.PHOTO_GROUP &&
                    `${item.eventsData.length} Photos`}
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
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: 20,
            }}>
            <View
              style={{
                height: 200,
                width: 400,
                borderRadius: 20,
                overflow: 'hidden',
              }}>
              <ImageAsset
                localIdentifier={item.eventsData.localIdentifier}
                setHeight={200}
                setWidth={400}
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
        {[EventTypes.PHOTO_GROUP].includes(item.type) && (
          <>
            <ImageCollage photoGroupData={item.eventsData.slice(0, 10)} />
          </>
        )}
        {/* {[EventTypes.CALENDAR_EVENT].includes(item.type) &&
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
          )} */}
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
            <LabelBadge tagCount={Object.values(item.tags).flat().length} />
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
