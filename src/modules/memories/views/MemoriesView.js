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

export default MemoriesView = ({}) => {
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
  const getNextMemoryTime = () => {
    // const now = new Date(Date.now());
    const lastMemoryCheckTime = new Date(
      useSettingsHooks.getNumber('settings.lastMemoryCheckTime'),
      // 0,
    );
    var timeStr = '';
    if (
      lastMemoryCheckTime.getHours() >= 22 ||
      lastMemoryCheckTime.getHours() < 8
    ) {
      if (lastMemoryCheckTime.getHours() >= 22) {
        lastMemoryCheckTime.setDate(lastMemoryCheckTime.getDate() + 1);
      }
      lastMemoryCheckTime.setHours(8);
      lastMemoryCheckTime.setMinutes(0);
      lastMemoryCheckTime.setSeconds(0);
      lastMemoryCheckTime.setMilliseconds(0);
      timeStr = lastMemoryCheckTime.toLocaleString();
    } else if (lastMemoryCheckTime.getHours() < 15) {
      lastMemoryCheckTime.setHours(15);
      lastMemoryCheckTime.setMinutes(0);
      lastMemoryCheckTime.setSeconds(0);
      lastMemoryCheckTime.setMilliseconds(0);
      timeStr = lastMemoryCheckTime.toLocaleString();
    } else {
      lastMemoryCheckTime.setHours(22);
      lastMemoryCheckTime.setMinutes(0);
      lastMemoryCheckTime.setSeconds(0);
      lastMemoryCheckTime.setMilliseconds(0);
      timeStr = lastMemoryCheckTime.toLocaleString();
    }
    return timeStr;
  };
  const [itemHeights, setItemHeights] = useState([]);
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const gifScale = scrollOffsetY.interpolate({
    inputRange: [-100, 0],
    outputRange: [75, 0],
    extrapolate: 'clamp',
  });
  const [memoryLoadingMessage, setMemoryLoadingMessage] =
    useState('Not Needed');
  const [memoryLoadingState, setMemoryLoadingState] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [actionsheetScreen, setActionsheetScreen] = useState(
    ActionSheetScreens.MEMORIES.BASE,
  );
  const openActionSheet = () => {
    setShowModal(true);
    setActionsheetScreen(ActionSheetScreens.MEMORIES.BASE);
  };
  const timeToSegment = time => {
    const date = new Date(time);
    const hour = date.getHours();
    if (hour < 2) {
      return 'Night';
    } else if (hour < 12) {
      return 'Morning';
    } else if (hour < 17) {
      return 'Afternoon';
    } else if (hour < 23) {
      return 'Evening';
    } else {
      return 'Night';
    }
  };
  const scrollRef = createRef();
  const [highlightedMemory, setHighlightedMemory] = useState({
    index: -1,
    id: null,
  });
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
  const emotions = {
    NA: 0,
    HORRIBLE: 1,
    BAD: 2,
    NEUTRAL: 3,
    GOOD: 4,
    GREAT: 5,
  };

  const emotionAttributes = {
    BORDER: 0,
    BACKGROUND: 1,
    STROKE: 2,
  };

  const emotionToColor = ({emotion, need}) => {
    switch (emotion) {
      case emotions.HORRIBLE:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#E93535';
          case emotionAttributes.BACKGROUND:
            return '#FDEBEB';
          default:
            return 'black';
        }
      case emotions.BAD:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#C839D4';
          case emotionAttributes.BACKGROUND:
            return '#F9EBFB';
          default:
            return 'black';
        }
      case emotions.NEUTRAL:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#6D6D6D';
          case emotionAttributes.BACKGROUND:
            return '#E7E7E7';
          default:
            return 'black';
        }
      case emotions.GOOD:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#118ED1';
          case emotionAttributes.BACKGROUND:
            return '#E7F4FA';
          default:
            return 'black';
        }
      case emotions.GREAT:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#11A833';
          case emotionAttributes.BACKGROUND:
            return '#E7F6EB';
          default:
            return 'black';
        }
      default:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return 'black';
          case emotionAttributes.BACKGROUND:
            return 'black';
          default:
            return 'black';
        }
    }
  };

  const emotionToIcon = ({emotion, active, color}) => {
    const primaryColor =
      color === undefined
        ? active
          ? emotionToColor({
              emotion,
              need: emotionAttributes.STROKE,
            })
          : '#0b0b0b99'
        : color;
    switch (emotion) {
      case emotions.HORRIBLE:
        return <AngerIcon primaryColor={primaryColor} />;
      case emotions.BAD:
        return <FrownIcon primaryColor={primaryColor} />;
      case emotions.NEUTRAL:
        return <NeutralIcon primaryColor={primaryColor} />;
      case emotions.GOOD:
        return <SmileIcon primaryColor={primaryColor} />;
      case emotions.GREAT:
        return <GrinIcon primaryColor={primaryColor} />;
      default:
        return <></>;
    }
  };

  const emotionToString = emotion => {
    switch (emotion) {
      case emotions.HORRIBLE:
        return 'Bad';
      case emotions.BAD:
        return 'Sad';
      case emotions.NEUTRAL:
        return 'Neutral';
      case emotions.GOOD:
        return 'Glad';
      case emotions.GREAT:
        return 'Happy';

      default:
        return 'N/A';
    }
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
          setHighlightedMemory({
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
            {actionsheetScreen === ActionSheetScreens.MEMORIES.BASE && (
              <>
                <Box
                  flexDirection="row"
                  justifyContent="center"
                  gap={10}
                  mb={5}>
                  {[1, 2, 3, 4, 5].map(val => {
                    return (
                      <Pressable
                        key={val}
                        onPress={() => {
                          var updatedMemories = [...memories];
                          var memory = updatedMemories[highlightedMemory.index];
                          memory.emotion = memory.emotion === val ? 0 : val;
                          updatedMemories[highlightedMemory.index] = memory;
                          setMemories(updatedMemories);
                          updateMemoryData({
                            tags: JSON.stringify(memory.tags),
                            type: memory.type,
                            body: memory.body,
                            bodyModifiedAt: memory.bodyModifiedAt,
                            bodyModifiedSource: memory.bodyModifiedSource,
                            emotion: memory.emotion,
                            eventsData: JSON.stringify(memory.eventsData),
                            time: memory.time,
                            vote: memory.vote,
                            id: highlightedMemory.id,
                          });
                        }}>
                        <Box
                          width={50}
                          height={50}
                          backgroundColor={
                            memories[highlightedMemory.index]?.emotion === val
                              ? emotionToColor({
                                  emotion: val,
                                  need: emotionAttributes.BACKGROUND,
                                })
                              : 'white'
                          }
                          borderWidth={1}
                          justifyContent="center"
                          alignItems="center"
                          borderColor={
                            memories[highlightedMemory.index]?.emotion === val
                              ? emotionToColor({
                                  emotion: val,
                                  need: emotionAttributes.BACKGROUND,
                                })
                              : emotionToColor({
                                  need: emotionAttributes.BORDER,
                                })
                          }
                          rounded={'$md'}>
                          <Box aspectRatio={1} height={'65%'} width={'65%'}>
                            {emotionToIcon({
                              emotion: val,
                              active:
                                memories[highlightedMemory.index]?.emotion ===
                                val,
                            })}
                            {/* <AngerIcon
                              primaryColor={
                                memories[highlightedMemory.index]?.emotion ===
                                val
                                  ? emotionToColor({
                                      emotion: val,
                                      need: emotionAttributes.STROKE,
                                    })
                                  : '#0b0b0b99'
                              }
                              // fill={
                              //   // memories[highlightedMemory.index]?.emotion ===
                              //   // val
                              //   //   ? emotionToColor({
                              //   //       need: emotionAttributes.BORDER,
                              //   //     })
                              //   //   : emotionToColor({
                              //   //       need: emotionAttributes.BORDER,
                              //   //     })
                              //   '#000'
                              // }
                              // fill={'#000'}
                            /> */}
                          </Box>
                          {/* default stroke: 6D6D6D */}
                        </Box>
                      </Pressable>
                    );
                  })}
                </Box>
                <Divider backgroundColor="black" height={1} />
                <NewModalItem
                  boldText={'Upvote'}
                  normalText={'as more meaningful'}
                  icon={
                    <UpvoteIcon
                      primaryColor={'black'}
                      // stroke={theme.entry.buttons.toggle.icon.inactive}
                    />
                  }
                  onPress={() => {
                    var updatedMemories = [...memories];
                    var memory = updatedMemories[highlightedMemory.index];
                    memory.vote += 1;
                    updatedMemories[highlightedMemory.index] = memory;
                    setMemories(updatedMemories);
                    updateMemoryData({
                      tags: JSON.stringify(memory.tags),
                      type: memory.type,
                      body: memory.body,
                      bodyModifiedAt: memory.bodyModifiedAt,
                      bodyModifiedSource: memory.bodyModifiedSource,
                      emotion: memory.emotion,
                      eventsData: JSON.stringify(memory.eventsData),
                      time: memory.time,
                      vote: memory.vote,
                      id: highlightedMemory.id,
                    });
                  }}
                  num={
                    memories[highlightedMemory.index]?.vote > 0
                      ? memories[highlightedMemory.index]?.vote
                      : undefined
                  }
                />
                <NewModalItem
                  boldText={'Downvote'}
                  normalText={'as less meaningful'}
                  icon={<DownvoteIcon primaryColor={'black'} />}
                  onPress={() => {
                    var updatedMemories = [...memories];
                    var memory = updatedMemories[highlightedMemory.index];
                    memory.vote -= 1;
                    updatedMemories[highlightedMemory.index] = memory;
                    setMemories(updatedMemories);
                    updateMemoryData({
                      tags: JSON.stringify(memory.tags),
                      type: memory.type,
                      body: memory.body,
                      bodyModifiedAt: memory.bodyModifiedAt,
                      bodyModifiedSource: memory.bodyModifiedSource,
                      emotion: memory.emotion,
                      eventsData: JSON.stringify(memory.eventsData),
                      time: memory.time,
                      vote: memory.vote,
                      id: highlightedMemory.id,
                    });
                  }}
                  num={
                    memories[highlightedMemory.index]?.vote < 0
                      ? Math.abs(memories[highlightedMemory.index]?.vote)
                      : undefined
                  }
                  numStyle={1}
                />
                <NewModalItem
                  boldText={'Add labels'}
                  normalText={'for additional meaning'}
                  icon={<LabelIcon primaryColor={'black'} />}
                  onPress={() =>
                    setActionsheetScreen(ActionSheetScreens.MEMORIES.LABELS)
                  }
                  num={
                    Object.values(
                      memories[highlightedMemory.index]?.tags || [],
                    ).flat().length
                  }
                />
                {/* <NewModalItem
                  boldText={'Redo'}
                  normalText={''}
                  icon={
                    <DownvoteIcon
                      stroke={theme.entry.buttons.toggle.icon.inactive}
                    />
                  }
                  onPress={() => {
                    var updatedMemories = [...memories];
                    var memory = updatedMemories[highlightedMemory.index];
                    memory.tags = {
                      roles: [],
                      modes: [],
                      other: [],
                    };
                    updatedMemories[highlightedMemory.index] = memory;
                    setMemories(updatedMemories);
                    updateMemoryData({
                      tags: JSON.stringify(memory.tags),
                      type: memory.type,
                      body: memory.body,
                      bodyModifiedAt: memory.bodyModifiedAt,
                      bodyModifiedSource: memory.bodyModifiedSource,
                      emotion: memory.emotion,
                      eventsData: JSON.stringify(memory.eventsData),
                      time: memory.time,
                      vote: memory.vote,
                      id: highlightedMemory.id,
                    });
                  }}
                /> */}
                <NewModalItem
                  boldText={'Edit'}
                  normalText={'manually or with the help of AI'}
                  icon={<PenIcon />}
                  onPress={() =>
                    setActionsheetScreen(ActionSheetScreens.MEMORIES.EDIT)
                  }
                />

                <Divider backgroundColor="black" height={1} />
                <NewModalItem
                  boldText={'Delete Memory'}
                  icon={<BinIcon />}
                  danger={true}
                  onPress={() => {
                    var updatedMemories = [...memories];
                    updatedMemories.splice(highlightedMemory.index, 1);
                    setMemories(updatedMemories);
                    deleteMemoryData({
                      id: highlightedMemory.id,
                    });
                    setShowModal(false);
                  }}
                />
              </>
            )}
            {actionsheetScreen === ActionSheetScreens.MEMORIES.LABELS && (
              <LabellingSheet
                activeLabels={memories[highlightedMemory.index]?.tags}
                update={({labels}) => {
                  var updatedMemories = [...memories];
                  var memory = updatedMemories[highlightedMemory.index];
                  memory.tags = labels;
                  updatedMemories[highlightedMemory.index] = memory;
                  setMemories(updatedMemories);
                  updateMemoryData({
                    tags: JSON.stringify(memory.tags),
                    type: memory.type,
                    body: memory.body,
                    bodyModifiedAt: memory.bodyModifiedAt,
                    bodyModifiedSource: memory.bodyModifiedSource,
                    emotion: memory.emotion,
                    eventsData: JSON.stringify(memory.eventsData),
                    time: memory.time,
                    vote: memory.vote,
                    id: highlightedMemory.id,
                  });
                }}
              />
            )}
            {actionsheetScreen === ActionSheetScreens.MEMORIES.EDIT && (
              <EditSheet
                type="memory"
                body={memories[highlightedMemory.index]?.body}
                success={({body}) => {
                  var updatedMemories = [...memories];
                  var memory = updatedMemories[highlightedMemory.index];
                  memory.body = body;
                  updatedMemories[highlightedMemory.index] = memory;
                  setMemories(updatedMemories);
                  updateMemoryData({
                    tags: JSON.stringify(memory.tags),
                    type: memory.type,
                    body: memory.body,
                    bodyModifiedAt: memory.bodyModifiedAt,
                    bodyModifiedSource: memory.bodyModifiedSource,
                    emotion: memory.emotion,
                    eventsData: JSON.stringify(memory.eventsData),
                    time: memory.time,
                    vote: memory.vote,
                    id: highlightedMemory.id,
                  });
                  setShowModal(false);
                }}
                cancel={() => {
                  setShowModal(false);
                }}
              />
            )}
            {actionsheetScreen === ActionSheetScreens.MEMORIES.CREATE && (
              <EditSheet
                type="memory"
                body={''}
                create={true}
                success={async ({body}) => {
                  var newMemory = {
                    tags: {
                      roles: [],
                      modes: [],
                      other: [],
                    },
                    type: -1,
                    body: body,
                    bodyModifiedAt: 0,
                    bodyModifiedSource: 'manual',
                    emotion: 0,
                    eventsData: {},
                    time: Date.now(),
                    vote: 0,
                  };
                  try {
                    createMemoriesTable();
                    const saveResult = await saveMemoryData({
                      ...newMemory,
                      tags: JSON.stringify(newMemory.tags),
                      eventsData: JSON.stringify(newMemory.eventsData),
                    });
                    newMemory.id = saveResult.insertId;
                  } catch (e) {
                    console.error({e});
                    newMemory.saved = false;
                  }
                  var updatedMemories = [newMemory, ...memories];
                  setMemories(updatedMemories);
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
          // backgroundColor: 'green',
          flex: 1,
          // height: Dimensions.get('screen').height,
        }}>
        {devMode === true && (
          <>
            <Text>Next Memory Creation: {getNextMemoryTime()}</Text>
            <Text>Memory Length: {memories?.length || 0}</Text>
            <Text>
              Last Time Memories Generated:{' '}
              {new Date(
                useSettingsHooks.getNumber('settings.lastMemoryCheckTime'),
                // 0,
              ).toLocaleString()}
            </Text>
            <Text>Generation Status: {memoryLoadingMessage}</Text>
            <Text>Visible Memory: {memories[visibleIndex]?.time}</Text>
            <Text>Visible Memory: {visibleIndex}</Text>
          </>
        )}
        {/* <WritingAnimation /> */}
        <Box
          elevation={5}
          shadowRadius={3}
          overflow={'hidden'}
          p={20}
          height={100}>
          <Box gap={5}>
            <Text
              allowFontScaling={false}
              style={{fontWeight: 400, fontSize: 16, fontStyle: 'italic'}}>
              {toDateString(memories[visibleIndex]?.time)}
            </Text>
            <Text
              allowFontScaling={false}
              style={{fontWeight: 600, fontSize: 24}}>
              {timeToSegment(memories[visibleIndex]?.time)}
            </Text>
          </Box>
        </Box>
        <Animated.View
          style={{
            // backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
            // aspectRatio: 1,
            height: memoryLoadingState === true ? 75 : gifScale || 0,
            zIndex: 999,
            left: 0,
            right: 0,
            top: 100,
            position: memoryLoadingState === true ? 'relative' : 'absolute',
            overflow: 'hidden',
          }}>
          <Image
            source={require('../../../assets/writing.gif')}
            style={{width: 75, height: 75}}
          />
        </Animated.View>

        <FlatList
          data={memories}
          keyExtractor={memory => memory.id}
          ref={scrollRef}
          // onLayout={event => {
          //   const {height} = event.nativeEvent.layout;
          //   console.log('onLayout nativeEvent', {event: event.nativeEvent});

          //   console.log({height});
          //   setItemHeights([...itemHeights, height]);
          // }}
          removeClippedSubviews={true}
          initialNumToRender={2}
          maxToRenderPerBatch={1}
          updateCellsBatchingPeriod={100}
          windowSize={7}
          ListEmptyComponent={() => {
            return (
              <View>
                <Text>No Memories yet</Text>
              </View>
            );
          }}
          // onScroll={Animated.event(
          //   [{nativeEvent: {contentOffset: {y: scrollOffsetY}}}],
          //   {useNativeDriver: false},
          // )}
          onScroll={event => {
            const {contentOffset, layoutMeasurement, contentSize} =
              event.nativeEvent;
            const yOffset = contentOffset.y;
            const visibleHeight = layoutMeasurement.height;

            let totalHeight = 0;
            let visibleIndex = 0;

            for (let i = 0; i < itemHeights.length; i++) {
              totalHeight += itemHeights[i];
              if (totalHeight >= yOffset) {
                visibleIndex = i;
                break;
              }
            }
            if (visibleIndex >= itemHeights.length) {
              visibleIndex = itemHeights.length - 1;
            }

            setVisibleIndex(visibleIndex);
            // console.log({
            //   visibleIndex,
            //   totalHeight,
            //   itemHeights,
            //   yOffset,
            // });
            //   Animated.event(
            //    [{nativeEvent: {contentOffset: {y: scrollOffsetY}}}],
            //   {useNativeDriver: false},
            //  )
            scrollOffsetY.setValue(event.nativeEvent.contentOffset.y);
          }}
          // scrollEventThrottle={16}
          style={{flex: 1}}
          renderItem={({item, index}) => (
            <View
              onLayout={event => {
                if (index === 0) {
                  setItemHeights([event.nativeEvent.layout.height]);
                } else {
                  setItemHeights([
                    ...itemHeights,
                    event.nativeEvent.layout.height +
                      itemHeights.reduce((partialSum, a) => partialSum + a, 0),
                  ]);
                }
                console.log(`onLayout inner ${index}`, {
                  nativeEvent: event.nativeEvent.layout.height,
                  itemHeights,
                });
              }}
              style={{
                padding: 20,
                paddingBottom: index === memories.length - 1 && 400,
                // paddingTop: 5,
                borderRadius: 20,
                backgroundColor: '#F6F6F6',
              }}>
              <Pressable
                onPressIn={() => {
                  setHighlightedMemory({index, id: item.id});
                }}
                onPress={() => {
                  setHighlightedMemory({index, id: item.id});
                  openActionSheet();
                }}
                px={10}
                py={15}
                rounded={'$md'}
                backgroundColor={
                  highlightedMemory.index === index ? '#E9E9E9' : '#F6F6F6'
                }>
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
                          numberOfLines={
                            item.type === EventTypes.PHOTO ? 1 : undefined
                          }
                          style={{
                            color: 'rgba(11, 11, 11, 0.8)',
                            fontWeight: 600,
                            marginRight: 50,
                          }}>
                          {item.type === EventTypes.LOCATION &&
                            item.eventsData.description}
                          {item.type === EventTypes.PHOTO &&
                            item.eventsData.name}
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

                {[EventTypes.PHOTO, EventTypes.LOCATION].includes(
                  item.type,
                ) && (
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
                    <Box
                      px={10}
                      py={5}
                      flexDirection="row"
                      justifyContent="center"
                      alignItems="center"
                      gap={5}
                      rounded={'$full'}
                      backgroundColor={emotionToColor({
                        emotion: item.emotion,
                        need: emotionAttributes.BACKGROUND,
                      })}>
                      <Box
                        aspectRatio={1}
                        height={30}
                        width={30}
                        p={4}
                        justifyContent="center"
                        alignItems="center"
                        rounded={'$md'}
                        backgroundColor={emotionToColor({
                          emotion: item.emotion,
                          need: emotionAttributes.STROKE,
                        })}>
                        {emotionToIcon({
                          emotion: item.emotion,
                          active: false,
                          color: '#fff',
                        })}
                      </Box>

                      <Text
                        style={{
                          fontWeight: 600,
                          color: emotionToColor({
                            emotion: item.emotion,
                            need: emotionAttributes.STROKE,
                          }),
                        }}>
                        {emotionToString(item.emotion)}
                      </Text>
                    </Box>
                  )}
                  {item.vote !== 0 && (
                    <Box
                      px={10}
                      py={5}
                      backgroundColor={item.vote > 0 ? '#DFECF2' : '#E7E7E7'}
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
                        backgroundColor={item.vote > 0 ? '#118ED1' : '#6D6D6D'}>
                        {item.vote > 0 ? (
                          <UpvoteIcon primaryColor={'white'} />
                        ) : (
                          <DownvoteIcon primaryColor={'white'} />
                        )}
                      </Box>
                      <Text
                        style={{
                          color: item.vote > 0 ? '#118ED1' : '#6D6D6D',
                          fontWeight: 600,
                        }}>
                        {item.vote}
                      </Text>
                    </Box>
                  )}
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
                        <LabelIcon primaryColor={'white'} />
                      </Box>
                      <Text style={{color: '#118ED1', fontWeight: 600}}>
                        {Object.values(item.tags).flat().length}
                      </Text>
                    </Box>
                  )}
                </Box>
              </Pressable>
              {index !== memories.length - 1 && (
                <View
                  style={{
                    height: 1,
                    width: '100%',
                    marginTop: 20,
                    backgroundColor: 'rgba(11, 11, 11, 0.1)',
                  }}></View>
              )}
            </View>
          )}></FlatList>
        <Animated.View
          style={{
            position: 'absolute',
            right: 30,
            bottom: 30,
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 50,
            borderWidth: 1,
            borderColor: 'rgba(11, 11, 11, 0.1)',
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.44,
            shadowRadius: 10.32,

            elevation: 16,

            shadowColor: '#000',
          }}>
          <TouchableOpacity
            onPress={async () => {
              // const date = new Date(Date.now());
              // const mode = 'manual';
              // if (mode === 'generate') {
              //   await generateEntry({
              //     data: await getPermissionsAndData({date: date.getTime()}),
              //     date: date.getTime(),
              //   });
              // } else if (mode === 'manual') {
              //   createManualEntry(date.getTime());
              // }
              setShowModal(true);
              setActionsheetScreen(ActionSheetScreens.MEMORIES.CREATE);
            }}>
            <NewEntryIcon />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};
