import {EventTypes, emotionAttributes} from '../../../utils/Enums';
// import CalendarEventIcon from '../../../assets/calendar-event.svg';
import SingleMapMemo from '../../../components/SingleMapMemo';
import {EmotionBadge, LabelBadge, VoteBadge} from '../../../components/Badge';
import {
  emotionToColor,
  emotionToIcon,
  emotionToString,
} from '../../../utils/emotionFuncs';
import {View, Text, Linking} from 'react-native';
import {Pressable, Box} from '@gluestack-ui/themed';
import {
  TITLE_REGEX,
  URL_REGEX,
  CUSTOM_HYPERLINK_REGEX,
} from '../../../utils/regex';
import {parseLink} from '../../../utils/parseLink';
import {CustomImage} from './image/CustomImage';
import {ImageCollage} from './image/ImageCollage';
import {MemoryEventHeader} from './event/MemoryEventHeader';
import {LinkView} from './event/LinkView';
import toDateString from '../../../utils/toDateString';
import MemoryDivider from './MemoryDivider';
import RouteMapMemo from '../../../components/RouteMapMemo';
import {getLinkDataForMemory} from '../../../utils/getLinkDataForMemory';

export default MemoryView = ({
  item,
  index,
  onLayout,
  onPress,
  onPressIn,
  highlighted,
  devMode,
  lastItem,
  nextDay,
}) => {
  const {formattedText2, linksFinal} = getLinkDataForMemory(item);
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
      {index === 0 && (
        <MemoryDivider time={toDateString(item.time).toLocaleUpperCase()} />
      )}
      <Pressable
        onPressIn={onPressIn}
        onPress={onPress}
        px={10}
        py={15}
        rounded={'$md'}
        backgroundColor={highlighted ? '#E9E9E9' : '#F6F6F6'}>
        <Text allowFontScaling={false}>
          {formattedText2.map((text, index) => {
            var baseStyles = {
              fontSize: 18,
              lineHeight: 24,
              fontWeight: 400,
              color: '#0b0b0bcc',
            };
            const isLink = index % 2 === 1;
            return (
              <Text
                key={index}
                allowFontScaling={false}
                onPress={
                  isLink && linksFinal[Math.floor(index / 2)] !== null
                    ? () => {
                        Linking.openURL(
                          parseLink(linksFinal[Math.floor(index / 2)]),
                        );
                      }
                    : null
                }
                style={{
                  ...baseStyles,
                  color: isLink ? '#118ED1' : '#0b0b0bcc',
                  textDecorationLine: isLink ? 'underline' : 'none',
                }}>
                {text}
              </Text>
            );
          })}
        </Text>
        {devMode === true && (
          <Text allowFontScaling={false} style={{paddingVertical: 5}}>
            {JSON.stringify(item)}
          </Text>
        )}
        {item.type > -1 && (
          <MemoryEventHeader
            desc={item.formattedTime}
            type={item.type}
            eventsData={item.eventsData}
          />
        )}
        {[EventTypes.LOCATION].includes(item.type) && (
          <SingleMapMemo
            lat={
              item.eventsData.lat === undefined
                ? item.eventsData.latitude
                : item.eventsData.lat
            }
            long={
              item.eventsData.long === undefined
                ? item.eventsData.longitude
                : item.eventsData.long
            }
          />
        )}
        {[EventTypes.LOCATION_ROUTE].includes(item.type) && (
          <RouteMapMemo
            coordinates={item.eventsData.points}
            start={item.eventsData.start}
            end={item.eventsData.end}
          />
        )}
        {[EventTypes.PHOTO].includes(item.type) && (
          <CustomImage
            identifier={item.eventsData.localIdentifier}
            index={0}
            length={1}
          />
        )}
        {[EventTypes.PHOTO_GROUP].includes(item.type) && (
          <>
            <ImageCollage photoGroupData={item.eventsData.slice(0, 5)} />
          </>
        )}
        {linksFinal?.map(
          (url, index) =>
            url !== null && (
              <LinkView
                url={url}
                body={item.body}
                key={index}
                onPressIn={onPressIn}
              />
            ),
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
            <LabelBadge tagCount={Object.values(item.tags).flat().length} />
          )}
        </Box>
      </Pressable>
      {!lastItem && (
        <>
          <MemoryDivider time={nextDay} />
        </>
      )}
    </View>
  );
};
