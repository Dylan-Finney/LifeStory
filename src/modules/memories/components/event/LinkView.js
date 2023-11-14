import {View, Text, Image, Linking} from 'react-native';
import {MemoryEventHeader} from './MemoryEventHeader';
import {EventTypes} from '../../../../utils/Enums';
import {Pressable} from '@gluestack-ui/themed';
import {useEffect, useState} from 'react';
import {parseLink} from '../../../../utils/parseLink';
import {SvgUri, SvgFromUri} from 'react-native-svg';
import {
  META_TAGS_REGEX,
  TAGS_CONTENT_REGEX,
  TITLE_TAG_REGEX,
} from '../../../../utils/regex';

export const LinkView = ({url, body, onPressIn}) => {
  const [data, setData] = useState({
    link: parseLink(url),
  });

  const init = async () => {
    var newData = {
      link: parseLink(url),
    };

    var link = parseLink(url);
    const result = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    // console.log({result});

    const contentType = result.headers.get('content-type');
    // console.log('headers', contentType);
    if (contentType.startsWith('text/html')) {
      const html = await result.text();
      if (html) {
        const head = html.substring(0, html.indexOf('<body'));
        const metaMatches = head.match(META_TAGS_REGEX) || [];
        const titleMatches = head.match(TITLE_TAG_REGEX) || [];
        // console.log({head});
        // console.log({metaMatches});
        // console.log({titleMatches});
        const getAttribute = keywords => {
          const titleMatch = metaMatches.findIndex(element =>
            keywords.some(keyword => element.includes(keyword)),
          );

          //title
          if (titleMatch > -1) {
            return metaMatches[titleMatch].match(TAGS_CONTENT_REGEX)[1];
          }
          return '';
        };
        var titleKeywords = [
          'twitter:title',
          'og:title',
          'og:site_name',
          'title',
        ];
        var descKeywords = [
          'twitter:description',
          'og:description',
          'description',
        ];
        var imageKeywords = ['twitter:image', 'og:image'];
        // console.log(getAttribute(titleKeywords));
        // console.log(getAttribute(descKeywords));
        // console.log(getAttribute(imageKeywords));
        setData({
          ...newData,
          title: getAttribute(titleKeywords),
          description: getAttribute(descKeywords),
          image: getAttribute(imageKeywords),
        });

        // const title = TITLE_TAG_REGEX.exec(head);
        // console.log({title});
      }
    } else if (contentType.startsWith('image')) {
      // const html = await result.text();
      // console.log('test15', result.bodyUsed);
      // const head = html.substring(0, html.indexOf('<body'));
      // const titleMatches = head.match(TITLE_TAG_REGEX) || [];
      // console.log({titleMatches});
      setData({
        ...newData,
        title: link.substr(link.lastIndexOf('/') + 1),
        description: 'Online Image',
        image: link,
      });
    }
  };
  useEffect(() => {
    init();
  }, [body]);

  return (
    <Pressable
      onPress={() => {
        // console.log({data});
        Linking.openURL(data.link);
      }}
      onPressIn={onPressIn}
      style={{marginTop: 20}}>
      <MemoryEventHeader
        type={EventTypes.LINK}
        desc={data.description}
        eventsData={data.title}
      />
      {data.image && (
        <>
          {data.image.endsWith('.svg') ? (
            <View
              style={{
                justifyContent: 'center',
                alignContent: 'center',
                backgroundColor: '#E0E0E0',
                height: 200,
                borderRadius: 20,
              }}>
              <SvgUri
                uri={data.image}
                style={{
                  width: 330,
                  height: 200,
                  borderRadius: 20,
                  alignSelf: 'center',
                  // marginTop: 50,
                  // marginLeft: 100,
                }}
              />
            </View>
          ) : (
            <Image
              // resizeMode=""
              source={{uri: data.image}}
              style={{
                marginTop: 10,
                width: 330,
                height: 200,
                borderRadius: 20,
                // transform: [{scale: 0.5}],
              }}
            />
          )}
        </>
      )}
    </Pressable>
  );
};
