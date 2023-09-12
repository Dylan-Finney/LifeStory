import React from 'react';
import {Text, View} from 'react-native';

import 'react-native-url-polyfill/auto';

import ContentTaggingIcon from '../assets/content-tagging-icon.svg';
import EmotionTaggingIcon from '../assets/emotion-tagging-icon.svg';
import WordCountIcon from '../assets/open-book.svg';
import UpvoteIcon from '../assets/arrow-block-up.svg';
import {theme} from '../../Styling';
const HomeHeading = ({entries, manual, events, photos}) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: theme.general.barMenu,
        padding: 10,
        paddingLeft: 30,
        paddingRight: 30,
      }}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <WordCountIcon></WordCountIcon>
          <Text style={{color: 'white'}}>{entries || 0}</Text>
        </View>
        <Text style={{color: 'white', fontSize: 13}}>Entries</Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <ContentTaggingIcon width={17} height={16} fill={'white'} />
          <Text style={{color: 'white'}}>{manual || 0}</Text>
        </View>
        <Text style={{color: 'white', fontSize: 13}}>Manual</Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <EmotionTaggingIcon width={17} height={16} stroke={'white'} />
          <Text style={{color: 'white'}}>{events || 0}</Text>
        </View>
        <Text style={{color: 'white', fontSize: 13}}>Events</Text>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{display: 'flex', flexDirection: 'row'}}>
          <UpvoteIcon stroke={'white'} />
          <Text style={{color: 'white'}}>{photos || 0}</Text>
        </View>
        <Text style={{color: 'white', fontSize: 13}}>Photos</Text>
      </View>
    </View>
  );
};

export default HomeHeading;
