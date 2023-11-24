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
  // console.log(item.body);
  var newBody = [];
  var newBody2 = [];
  var matches2 = [];
  var splitBody2 = [];
  var formattedText2 = [];
  var links2 = [];
  var linksFinal = [];
  // var match;
  // while ((match = /\[([^\]]+)\]\([^)]+\)/g.exec(item.body)) !== null) {
  //   console.log({match});
  //   if (match !== null) {
  //     newBody.push(match);
  //   }
  // }

  //Example Body: "This is a text based from the www.google.com website. This [image](www.imageurl.com) is from the internet."

  //Splits the memory body everytime there is a custom hyperlink
  //E.g. ["This is a text based from the www.google.com website. This ", "image", " is from the internet."]
  newBody = item.body.split(CUSTOM_HYPERLINK_REGEX);

  //Get all custom hyperlinks ([text](link)) from the memory
  //E.g. ["[image](www.imageurl.com)"]
  newBody2 = item.body.match(CUSTOM_HYPERLINK_REGEX);

  //Get all the either the first URL from the hyperlink or return null
  //E.g. ["www.imageurl.com"]
  newBody2?.map((test, testIndex) => {
    var newLinkStr = test.substring(
      `[${newBody[1 + 2 * testIndex]}](`.length,
      test.length - 1,
    );
    var matches = newLinkStr.match(URL_REGEX);
    links2.push(matches?.length > 0 ? matches[0] : null);
    // links2.push(test.match(URL_REGEX));
  });

  //For all parts of the body that is not a hyperlink, get all of the urls and split the part based on the url
  // E.g. ["This is a text based from the www.google.com website. This ", " is from the internet."] ->
  // [["www.google.com"], null]
  // [["This is a text based from the " , " website. This "], [" is from the internet."]]
  for (var i = 0; i < newBody.length; i = i + 2) {
    matches2.push(newBody[i].match(URL_REGEX));
    splitBody2.push(newBody[i].split(URL_REGEX));
  }

  //Creates an array of the formatted Text, every even index should be normal text. Every odd index should be either hyperlink or URL.
  //["This is a text based from the", "www.google.com", " website. This ","image", " is from the internet."]
  splitBody2.map((splitBody, index) => {
    splitBody.map((part, index2) => {
      formattedText2.push(part);
      if (matches2[index]?.length > 0 && index2 !== splitBody.length - 1) {
        formattedText2.push(matches2[index][index2]);
      }
    });
    // if (index % 2 === 1) {
    formattedText2.push(newBody[1 + 2 * index]);
    // }
    // formattedText2.push(matches2[index][index2]);
  });

  //Ordered array of links ordered as they appear in memory
  // ["www.google.com","www.imageurl.com"]
  for (var i = 0; i < Math.floor(newBody.length / 2); i++) {
    matches2[i]?.map(link => {
      linksFinal.push(link !== null && link);
    });
    // if (links2[i] !== null) linksFinal.push(links2[i]);
    linksFinal.push(links2[i]);
  }
  matches2[Math.floor(newBody.length / 2)]?.map(link => {
    linksFinal.push(link);
  });

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
        <Text>
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
            <ImageCollage photoGroupData={item.eventsData.slice(0, 10)} />
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
