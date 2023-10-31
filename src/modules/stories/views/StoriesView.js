import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  StyleSheet,
  Image,
  Button,
  NativeEventEmitter,
  Animated,
  RefreshControl,
  FlatList,
  // Modal,
} from 'react-native';

import Modal from 'react-native-modal';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import Svg, {Defs, Rect, LinearGradient, Stop} from 'react-native-svg';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AIRewriteIcon from '../../../assets/ai-rewrite-icon.svg';
import FirstEntryIcon from '../../../assets/first-entry.svg';
import AngerIcon from '../../../assets/emotions/Anger.svg';
import FrownIcon from '../../../assets/emotions/Frown.svg';
import GrinIcon from '../../../assets/emotions/Grin.svg';
import NeutralIcon from '../../../assets/emotions/Neutral.svg';
import SmileIcon from '../../../assets/emotions/Smile.svg';

import notifee, {
  EventType,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

// import AMImage from '../../../assets/am_image.svg';
// import AMImage from '../../../assets/AMImage.png';

import moment from 'moment';
import AppContext from '../../../contexts/AppContext';
import useDatabaseHooks from '../../../utils/hooks/useDatabaseHooks';
import Location from '../../../utils/native-modules/NativeFuncs';

import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';
import Config from 'react-native-config';
import CreateEntryButton from '../../../modules/entries/components/CreateEntryButton';
import {theme} from '../../../theme/styling';
import Onboarding from '../../../components/Onboarding';
import HomeTop from '../../../components/HomeTop';
import HomeHeading from '../../../components/HomeHeading';
import EntryList from '../../../modules/entries/components/EntryList';
import * as RNLocalize from 'react-native-localize';
import {NativeModules} from 'react-native';

import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';

import DatePicker from 'react-native-date-picker';

import {decode, encode} from 'base-64';
import {useAppState} from '@react-native-community/hooks';
import onCreateTriggerNotification from '../../../utils/createNotification';
import {Swipeable} from 'react-native-gesture-handler';
import toDateString from '../../../utils/toDateString';
import DownvoteIcon from '../../../assets/ModalDownvote.svg';
import UpvoteIcon from '../../../assets/ModalUpvote.svg';
import NewEntryIcon from '../../../assets/NewEntry.svg';
import SettingsIcon from '../../../assets/Settings.svg';
import CalendarEventIcon from '../../../assets/calendar-event.svg';
import LabelIcon from '../../../assets/Labelling.svg';
import DaysMenuIcon from '../../../assets/days-menu.svg';
import MomentsMenuIcon from '../../../assets/moments-menu.svg';
import SearchMenuIcon from '../../../assets/search-menu.svg';
import LocationEventIcon from '../../../assets/event-location.svg';
import PhotoEventIcon from '../../../assets/event-photo.svg';
import BinIcon from '../../../assets/Bin.svg';
import PenIcon from '../../../assets/Pen.svg';
import WritingAnimation from '../../../assets/writing.gif';

import {emotions} from '../../../utils/utils';
import {ImageAsset} from '../../../utils/native-modules/NativeImage';
import MapView, {Marker} from 'react-native-maps';
import OnboardingButton from '../../../components/OnboardingButton';
import OnboardingBackground from '../../../components/OnboardingBackground';
import onCreateTriggerReminder from '../../../utils/createOpenReminder';
import SingleMapMemo from '../../../components/SingleMapMemo';
import generateMemories from '../../../utils/generateMemories';
import generateEntry from '../../../utils/generateEntry';
import {ActionSheetScreens, EventTypes} from '../../../utils/Enums';
import getMemories from '../../../utils/getMemories';
import NewModalItem from '../../../NewModalItem';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  Box,
  Divider,
} from '@gluestack-ui/themed';
import LabellingSheet from '../../../LabellingSheet';
import {KeyboardAvoidingView} from '@gluestack-ui/themed';
import EditSheet from '../../../EditSheet';
import {Pressable} from '@gluestack-ui/themed';

export default StoriesView = () => {
  const {
    retrieveSpecificData,
    saveEntryData,
    updateEntryData,
    createEntryTable,
    createMemoriesTable,
    saveMemoryData,
    updateMemoryData,
    deleteMemoryData,
  } = useDatabaseHooks();
  const {
    loadingEntries,
    entries,
    setEntries,
    onBoarding,
    setOnBoarding,
    memories,
    setMemories,
    devMode,
  } = useContext(AppContext);
  const [highlightedStory, setHighlightedStory] = useState({
    index: -1,
    id: null,
  });
  const [showModal, setShowModal] = useState(false);
  const [storyLoadingMessage, setStoryLoadingMessage] = useState('Busy');
  const [actionsheetScreen, setActionsheetScreen] = useState(
    ActionSheetScreens.STORIES.BASE,
  );
  const openActionSheet = () => {
    setShowModal(true);
    setActionsheetScreen(ActionSheetScreens.STORIES.BASE);
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        // backgroundColor: 'red'
      }}>
      <StatusBar
        barStyle={'dark-content'}
        // backgroundColor={onBoarding === true ? 'white' : '#F9F9F9'}
        backgroundColor={'white'}
      />
      <Actionsheet
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setHighlightedStory({
            index: -1,
            id: null,
          });
        }}>
        <ActionsheetBackdrop />
        <ActionsheetContent pb={50} maxHeight={'80%'}>
          <ActionsheetDragIndicatorWrapper pb={10}>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <ScrollView>
            {actionsheetScreen === ActionSheetScreens.STORIES.BASE && (
              <>
                <NewModalItem
                  boldText={'Add labels'}
                  normalText={'for additional meaning'}
                  icon={<LabelIcon primaryColor={'black'} />}
                  onPress={() =>
                    setActionsheetScreen(ActionSheetScreens.STORIES.LABELS)
                  }
                  num={
                    Object.values(
                      entries[highlightedStory.index]?.tags || [],
                    ).flat().length
                  }
                />
                <NewModalItem
                  boldText={'Edit'}
                  normalText={'manually or with the help of AI'}
                  icon={<PenIcon />}
                  onPress={() =>
                    setActionsheetScreen(ActionSheetScreens.STORIES.EDIT)
                  }
                />
              </>
            )}
            {actionsheetScreen === ActionSheetScreens.STORIES.LABELS && (
              <LabellingSheet
                activeLabels={
                  JSON.stringify(entries[highlightedStory.index]?.tags) === '[]'
                    ? {
                        roles: [],
                        modes: [],
                        other: [],
                      }
                    : entries[highlightedStory.index]?.tags
                }
                update={({labels}) => {
                  var updatedStories = [...entries];
                  var story = updatedStories[highlightedStory.index];
                  story.tags = labels;
                  updatedStories[highlightedStory.index] = story;
                  console.log({story});
                  setEntries(updatedStories);
                  updateEntryData(
                    JSON.stringify(story.tags),
                    story.title,
                    story.time,
                    story.emotion,
                    story.vote,
                    story.bodyModifiedAt,
                    story.bodyModifiedSource,
                    story.titleModifiedAt,
                    story.titleModifiedSource,
                    JSON.stringify(story.events),
                    story.body,
                    highlightedStory.id,
                  );
                }}
              />
            )}
            {actionsheetScreen === ActionSheetScreens.STORIES.EDIT && (
              <EditSheet
                type="story"
                body={entries[highlightedStory.index]?.body}
                title={entries[highlightedStory.index]?.title}
                success={({body, title}) => {
                  var updatedStories = [...entries];
                  var story = updatedStories[highlightedStory.index];
                  story.body = body;
                  story.title = title;
                  updatedStories[highlightedStory.index] = story;
                  console.log({story});
                  setEntries(updatedStories);
                  updateEntryData(
                    JSON.stringify(story.tags),
                    story.title,
                    story.time,
                    story.emotion,
                    story.vote,
                    story.bodyModifiedAt,
                    story.bodyModifiedSource,
                    story.titleModifiedAt,
                    story.titleModifiedSource,
                    JSON.stringify(story.events),
                    story.body,
                    highlightedStory.id,
                  );
                  setShowModal(false);
                }}
                cancel={() => {
                  setShowModal(false);
                }}
              />
            )}
          </ScrollView>
        </ActionsheetContent>
      </Actionsheet>
      <View
        style={{
          flex: 1,
          // backgroundColor: 'red'
        }}>
        <View style={{flex: 1}}>
          {devMode === true && (
            <>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    setStoryLoadingMessage('Generating');
                    createEntryTable();
                    const newEntry = await generateEntry({
                      // memories: [
                      //   {
                      //     id: 1,
                      //     time: 1697994699000,
                      //     body: 'At 3:00 PM, I had a driving test. After my third attempt, I finally passed.',
                      //   },
                      //   {
                      //     id: 2,
                      //     time: 1698023499000,
                      //     body: 'At 6:00 PM, I had a wonderful meal at a resturant. The buffet was a let down but was cheap enough',
                      //   },
                      // ],
                      memories,
                    });
                    setEntries([newEntry, ...entries]);
                    setStoryLoadingMessage('Finished');
                  } catch (e) {
                    console.error({e});
                    setStoryLoadingMessage('Finished with error');
                  }
                }}>
                <Text>Generate</Text>
              </TouchableOpacity>
              <Text>Generation Status: {storyLoadingMessage}</Text>
              <Text>
                Selected Entry Creation Time:{' '}
                {useSettingsHooks.getNumber('settings.createEntryTime')}
                {':00'}
              </Text>
            </>
          )}
          <Box height={100} p={20}>
            <Box gap={5}>
              <Text
                allowFontScaling={false}
                style={{fontWeight: 400, fontSize: 16, fontStyle: 'italic'}}>
                Today
              </Text>
              <Text
                allowFontScaling={false}
                style={{fontWeight: 600, fontSize: 24}}>
                {entries[0]?.title}
              </Text>
            </Box>
          </Box>
          <FlatList
            data={entries}
            keyExtractor={entry => entry.id}
            removeClippedSubviews={true}
            initialNumToRender={2}
            maxToRenderPerBatch={1}
            updateCellsBatchingPeriod={100}
            windowSize={7}
            ListEmptyComponent={() => {
              return (
                <View>
                  <Text>No Stories yet</Text>
                </View>
              );
            }}
            style={{flex: 1}}
            renderItem={({item, index}) => (
              <View
                key={index}
                style={{
                  marginHorizontal: 20,
                  padding: 10,
                  borderRadius: 20,
                }}>
                <Pressable
                  onPress={() => {
                    setHighlightedStory({index, id: item.id});
                    openActionSheet();
                  }}>
                  <Text>{item.body}</Text>
                  <Text>{item.id || 'Empty'}</Text>
                  <Text>{JSON.stringify(item)}</Text>
                </Pressable>
                {/* {console.log({item, index})} */}
                {/* <Text>Test</Text> */}

                {index !== entries.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      width: '100%',
                      marginVertical: 20,
                      backgroundColor: 'rgba(11, 11, 11, 0.1)',
                    }}></View>
                )}
              </View>
            )}></FlatList>
        </View>
      </View>
    </SafeAreaView>
  );
};
