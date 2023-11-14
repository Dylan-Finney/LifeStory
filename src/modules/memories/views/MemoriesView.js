import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  Animated,
  RefreshControl,
  FlatList,
} from 'react-native';

import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import AngerIcon from '../../../assets/emotions/Anger.svg';
import FrownIcon from '../../../assets/emotions/Frown.svg';
import GrinIcon from '../../../assets/emotions/Grin.svg';
import NeutralIcon from '../../../assets/emotions/Neutral.svg';
import SmileIcon from '../../../assets/emotions/Smile.svg';

import AppContext from '../../../contexts/AppContext';
import useDatabaseHooks from '../../../utils/hooks/useDatabaseHooks';

import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';

import {Swipeable} from 'react-native-gesture-handler';
import toDateString from '../../../utils/toDateString';
import DownvoteIcon from '../../../assets/ModalDownvote.svg';
import UpvoteIcon from '../../../assets/ModalUpvote.svg';
import NewEntryIcon from '../../../assets/NewEntry.svg';

import CalendarEventIcon from '../../../assets/calendar-event.svg';
import LabelIcon from '../../../assets/Labelling.svg';

import LocationEventIcon from '../../../assets/event-location.svg';
import PhotoEventIcon from '../../../assets/event-photo.svg';
import BinIcon from '../../../assets/Bin.svg';
import PenIcon from '../../../assets/Pen.svg';

import {ImageAsset} from '../../../utils/native-modules/NativeImage';

import SingleMapMemo from '../../../components/SingleMapMemo';

import {ActionSheetScreens, EventTypes} from '../../../utils/Enums';

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
import checkIfMemoryReadyToGenerate from '../../../utils/isMemoryReadyToGenerate';
import FloatingActionButton from '../../../components/FloatingActionButton';
import {EmotionBadge, TagBadge, VoteBadge} from '../../../components/Badge';
import {baseHighlight} from '../../../utils/baseObjects';
import EmptyMemoriesView from '../components/EmptyMemoriesView';
import getNextMemoryTime from '../../../utils/getNextMemoryTime';
import EmotionButton from '../../../components/EmotionButton';
import MemoryView from '../components/MemoryView';
import {
  emotionToIcon,
  emotionToString,
  emotionToColor,
} from '../../../utils/emotionFuncs';
import {getEventIcon} from '../../../utils/getEventIcon';
const itemHeights2 = new Array();
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
    checkIfReadyToGenerate,
    readyToGenerateMemory,
    memoryLoadingMessage,
    setMemoryLoadingMessage,
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

  const [itemHeights, setItemHeights] = useState([]);

  // var itemHeights = {};
  const [layoutCounter, setLayoutCounter] = useState(0);
  const [forceCheck, setForceCheck] = useState(false);
  const [isMemoryReadyToGenerate, setIsMemoryReadyToGenerate] = useState(false);
  const [previousYOffset, setPreviousYOffset] = useState(0);

  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const gifScale = scrollOffsetY.interpolate({
    inputRange: [-100, 0],
    outputRange: [75, 0],
    extrapolate: 'clamp',
  });
  // const [memoryLoadingMessage, setMemoryLoadingMessage] =
  //   useState('Not Needed');
  const [memoryLoadingState, setMemoryLoadingState] = useState(false);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [actionsheetScreen, setActionsheetScreen] = useState(
    ActionSheetScreens.MEMORIES.BASE,
  );

  const [refreshing, setRefreshing] = useState(false);

  const onFlatListRefresh = () => {
    setRefreshing(true);

    ///artificial delay should handle also the delay when data gets bigger
    setTimeout(() => {
      if (memories.length > 1) {
        setRefreshing(false);
      }
    }, 1000);
  };

  console.log('memmmm', memories.length);
  const openActionSheet = () => {
    setShowModal(true);
    setActionsheetScreen(ActionSheetScreens.MEMORIES.BASE);
  };
  const timeToSegment = time => {
    const date = new Date(time);
    const hour = date.getHours();
    const dateStr = toDateString(time);
    if (hour < 2) {
      switch (dateStr) {
        case 'Today':
          return 'Last Night';
        default:
          return 'Night';
      }
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
  const [highlightedMemory, setHighlightedMemory] = useState(baseHighlight);

  useEffect(() => {
    const test = async () => {
      console.log('test1');
      setMemoryLoadingState(true);
      await checkIfMemoryReadyToGenerate();
      setMemoryLoadingState(false);
      setIsMemoryReadyToGenerate(false);
      // console.log('test2');
    };
    if (isMemoryReadyToGenerate) {
      test();
    }
  }, [isMemoryReadyToGenerate]);

  useEffect(() => {
    if (memories.length === layoutCounter) {
      setItemHeights(itemHeights.sort((a, b) => a.index - b.index));
      console.log('reordered itemHeights', {layoutCounter, itemHeights});
    }
  }, [layoutCounter]);

  // useEffect(() => {
  //   itemHeights2 = itemHeights2.sort((a, b) => a.index - b.index);
  //   console.log('reordered', {itemHeights2});
  // }, [itemHeights2]);

  const FlatListHeaderComponent = () => {
    return (
      <Box backgroundColor="#F6F6F6" p={20}>
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
    );
  };

  const WritingAnimation = () => {
    return (
      <View
        style={{
          position: 'absolute',
          top: 10,
          alignSelf: 'center',
        }}>
        <Image
          source={require('../../../assets/writing.gif')}
          style={{width: 64, height: 64}}
        />
      </View>
    );
  };

  const FlatListRenderItem = ({item, index}) => {
    return (
      <View
        onLayout={event => {
          if (layoutCounter === memories.length) {
            console.log('RESET');
            setLayoutCounter(1);
            setItemHeights([
              {
                height: event.nativeEvent.layout.height,
                index,
              },
            ]);
            // setItemHeights(array);
          } else {
            setLayoutCounter(layoutCounter + 1);
            // var array = itemHeights;
            setItemHeights([
              ...itemHeights,
              {
                height: event.nativeEvent.layout.height,
                index,
              },
            ]);
            // setItemHeights(array);
          }
          // if (index === 0) {
          //   setItemHeights([]);
          // } else {
          //   setItemHeights([
          //     ...itemHeights,
          //     event.nativeEvent.layout.height +
          //       itemHeights.reduce((partialSum, a) => partialSum + a, 0),
          //   ]);
          // }
          console.log(`onLayout inner ${index}`, {
            nativeEvent: event.nativeEvent.layout.height,
            itemHeights,
            layoutCounter,
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
          x
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
          {[EventTypes.PHOTO, EventTypes.LOCATION].includes(item.type) && (
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
    );
  };

  const closeActionSheet = () => {
    setShowModal(false);
    setHighlightedMemory(baseHighlight);
  };

  return (
    <>
      <Actionsheet isOpen={showModal} onClose={closeActionSheet}>
        <ActionsheetBackdrop />
        <ActionsheetContent pb={50} maxHeight={'80%'}>
          <ActionsheetDragIndicatorWrapper pb={10}>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {/* <ScrollView> */}
          {actionsheetScreen === ActionSheetScreens.MEMORIES.BASE && (
            <>
              <Box flexDirection="row" justifyContent="center" gap={10} mb={5}>
                {[1, 2, 3, 4, 5].map((val, index) => {
                  return (
                    <EmotionButton
                      active={
                        memories[highlightedMemory.index]?.emotion === val
                      }
                      emotionNum={val}
                      key={index}
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
                      }}
                    />
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
                icon={
                  <LabelIcon height={25} width={25} primaryColor={'black'} />
                }
                onPress={() =>
                  setActionsheetScreen(ActionSheetScreens.MEMORIES.LABELS)
                }
                num={
                  Object.values(
                    memories[highlightedMemory.index]?.tags || [],
                  ).flat().length
                }
              />
              <NewModalItem
                boldText={'Edit'}
                normalText={'manually or with the help of AI'}
                icon={<PenIcon height={20} width={20} />}
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
                  // var newItemHeights = itemHeights2;
                  // console.log({newItemHeights});
                  for (
                    var i = highlightedMemory.index + 1;
                    i < itemHeights2.length;
                    i++
                  ) {
                    itemHeights2[i].index = itemHeights2[i].index - 1;
                  }
                  itemHeights2.splice(highlightedMemory.index, 1);
                  console.log({itemHeights2});
                  // itemHeights2 = newItemHeights;
                  closeActionSheet();
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
                memory.bodyModifiedAt = Date.now();
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
                closeActionSheet();
              }}
              cancel={() => {
                setActionsheetScreen(ActionSheetScreens.MEMORIES.BASE);
              }}
              bodyModifiedAt={memories[highlightedMemory.index]?.bodyModifiedAt}
              // bodyModifiedAt={1698767276000}
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
                  bodyModifiedAt: Date.now(),
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
                closeActionSheet();
              }}
              cancel={closeActionSheet}
            />
          )}
          {/* </ScrollView> */}
        </ActionsheetContent>
      </Actionsheet>
      <>
        {devMode === true && (
          <>
            <Pressable
              onPress={async () => {
                var start = new Date(Date.now());
                var end = new Date(Date.now());
                start.setHours(start.getHours() - 3);
                await readyToGenerateMemory({
                  start,
                  end,
                });
                setMemoryLoadingMessage('Finished');
              }}>
              <Text>Generate</Text>
            </Pressable>
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
            {memories.length > 0 && (
              <>
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
              </>
            )}
          </Box>
        </Box>
        <Animated.View
          style={{
            // backgroundColor: 'red',
            justifyContent: 'center',
            alignItems: 'center',
            // aspectRatio: 1,
            height:
              memoryLoadingState === true ||
              (memoryLoadingMessage !== 'Busy' &&
                memoryLoadingMessage !== 'Finished')
                ? 75
                : gifScale || 0,
            zIndex: 999,
            left: 0,
            right: 0,
            top:
              memoryLoadingState === true ||
              (memoryLoadingMessage !== 'Busy' &&
                memoryLoadingMessage !== 'Finished')
                ? -30
                : 100,
            position:
              memoryLoadingState === true ||
              (memoryLoadingMessage !== 'Busy' &&
                memoryLoadingMessage !== 'Finished')
                ? 'relative'
                : 'absolute',
            overflow: 'hidden',
          }}>
          {forceCheck ||
          (memoryLoadingMessage !== 'Busy' &&
            memoryLoadingMessage !== 'Finished') ? (
            <>
              {isMemoryReadyToGenerate ||
              (memoryLoadingMessage !== 'Busy' &&
                memoryLoadingMessage !== 'Finished') ? (
                <Image
                  source={require('../../../assets/writing.gif')}
                  style={{width: 75, height: 75}}
                />
              ) : (
                <Text>
                  Check back at {getNextMemoryTime()}:00 to create new
                  memories...
                </Text>
              )}
            </>
          ) : (
            <Text>Try slow scrolling to see if works</Text>
          )}
        </Animated.View>

        <FlatList
          data={memories}
          keyExtractor={memory => memory.id}
          ref={scrollRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onFlatListRefresh}
              tintColor="transparent"
              colors={['transparent']}
            />
          }
          removeClippedSubviews={true}
          initialNumToRender={2}
          maxToRenderPerBatch={1}
          updateCellsBatchingPeriod={100}
          windowSize={7}
          contentContainerStyle={{flexGrow: 1}}
          ListEmptyComponent={<EmptyMemoriesView />}
          // onScroll={Animated.event(
          //   [{nativeEvent: {contentOffset: {y: scrollOffsetY}}}],
          //   {useNativeDriver: false},
          // )}
          alwaysBounceVertical={false}
          // bounces={false}
          scrollEnabled={memories.length > 0}
          onScroll={event => {
            const {contentOffset, layoutMeasurement, contentSize} =
              event.nativeEvent;
            console.log({itemHeights2, contentOffset});
            const yOffset = contentOffset.y;
            const visibleHeight = layoutMeasurement.height;

            let totalHeight = 0;
            let visibleIndex = 0;
            // console.log({yOffset, previousYOffset, forceCheck});

            if (
              yOffset < -30 &&
              previousYOffset <= -1 &&
              previousYOffset >= -30 &&
              !forceCheck
            ) {
              console.log('setForceCheck(true);');
              // var test = isMemoryReadyToGenerateFunc();
              setForceCheck(true);
              // setIsMemoryReadyToGenerate(checkIfMemoryReadyToGenerate());
              setIsMemoryReadyToGenerate(true);
            } else if (
              yOffset >= 0 &&
              isMemoryReadyToGenerate === false &&
              forceCheck
            ) {
              console.log('setForceCheck(false);');
              setForceCheck(false);
            }

            for (let i = 0; i < itemHeights2.length; i++) {
              totalHeight += itemHeights2[i].height;
              if (totalHeight >= yOffset) {
                visibleIndex = i;
                break;
              }
            }
            if (
              visibleIndex >= memories.length
              // yOffset >= itemHeights.reduce()
            ) {
              visibleIndex = memories.length - 1;
            }
            // console.log({
            //   yOffset,
            //   visibleIndex,
            //   itemHeights,
            // });
            setVisibleIndex(visibleIndex);
            setPreviousYOffset(yOffset);
            scrollOffsetY.setValue(event.nativeEvent.contentOffset.y);
          }}
          onScrollEndDrag={() => {
            setHighlightedMemory(baseHighlight);
          }}
          // decelerationRate={'fast'}
          onLayout={() => {
            console.log('reset heights');
            // setItemHeights([]);
          }}
          onContentSizeChange={() => {
            console.log('reset?');
          }}
          style={{flex: 1, backgroundColor: '#F6F6F6'}}
          renderItem={({item, index}) => (
            <MemoryView
              key={index}
              item={item}
              index={index}
              nextDay={
                index < memories.length - 1
                  ? toDateString(memories[index + 1].time) !==
                    toDateString(memories[index].time)
                    ? toDateString(memories[index + 1].time).toLocaleUpperCase()
                    : undefined
                  : undefined
              }
              onLayout={event => {
                // if (
                //   itemHeights2.findIndex(
                //     itemHeight => itemHeight.index === index,
                //   ) === -1
                // ) {
                //   itemHeights2.push({
                //     height: event.nativeEvent.layout.height,
                //     index,
                //   });
                // }
                itemHeights2[index] = {
                  height: event.nativeEvent.layout.height,
                  index,
                };

                console.log(`onLayout inner ${index}`, {
                  nativeEvent: event.nativeEvent.layout.height,
                  itemHeights,
                  itemHeights2,
                  layoutCounter,
                });
              }}
              onPress={() => {
                setHighlightedMemory({index, id: item.id});
                openActionSheet();
              }}
              onPressIn={() => {
                setHighlightedMemory({index, id: item.id});
              }}
              highlighted={highlightedMemory.index === index}
              devMode={devMode}
              lastItem={index === memories.length - 1}
            />
          )}
          // ListHeaderComponent={FlatListHeaderComponent}
        ></FlatList>
        {refreshing && <WritingAnimation />}
        <FloatingActionButton
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
        </FloatingActionButton>
      </>
    </>
  );
};
