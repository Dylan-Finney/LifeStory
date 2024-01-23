import AppContext from '../../../contexts/AppContext';
import {useContext, useEffect, useState, useRef, useCallback} from 'react';
import {EventTypes} from '../../../utils/Enums';
import {
  CUSTOM_HYPERLINK_REGEX,
  LINK_DOMAIN_REGEX,
  URL_REGEX,
} from '../../../utils/regex';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  AppState,
} from 'react-native';
import {ImageAsset} from '../../../utils/native-modules/NativeImage';
import ProfileIcon from '../../../assets/icons/ProfileIcon';
import PhotosIcon from '../../../assets/insights/PhotosIcon';
import EventsIcon from '../../../assets/insights/EventsIcon';
import LocationsIcon from '../../../assets/insights/LocationsIcon';
import LinksIcon from '../../../assets/insights/LinksIcon';
import {getLinkDataForMemory} from '../../../utils/getLinkDataForMemory';
import {useFocusEffect} from '@react-navigation/native';
// import AppContext from '../../../contexts/AppContext';

// import {
//   Canvas,
//   Circle,
//   Group,
//   RoundedRect,
//   Line,
//   vec,
//   Path,
// } from '@shopify/react-native-skia';
// import {PieChart} from 'react-native-gifted-charts';

const Header = ({txt, first}) => {
  return (
    <>
      {first !== true && (
        <View
          style={{
            height: 1,
            width: '100%',
            backgroundColor: 'black',
            marginVertical: 10,
          }}
        />
      )}

      <Text allowFontScaling={false} style={{fontWeight: 700, fontSize: 17}}>
        {txt}
      </Text>
    </>
  );
};

const Slideshow = ({
  slides = [],
  interval = 3000,
  data = 0,
  text = 'total',
  icon = <PhotosIcon />,
  backgroundColor = 'red',
}) => {
  // const colors = ['#0088FE', '#00C49F', '#FFBB28'];
  console.log({slides});

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const width = 185;
  const height = 160;

  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {x: scrollX}}}],
    {useNativeDriver: false},
  );

  const handlePagination = index => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({animated: true, x: index * width});
      setCurrentIndex(index);
    }
  };
  var frameCount = 0;
  var fps, fpsInterval, startTime, now, then, elapsed;
  fps = 0.5;
  const appState = useRef(AppState.currentState);
  var timer = null;
  const createTimer = () => {
    timer =
      slides.length > 0 &&
      setInterval(() => {
        const newIndex = (currentIndex + 1) % slides.length;
        console.log({newIndex, currentIndex, length: slides.length});
        handlePagination(newIndex);
      }, interval);
  };

  const clearTimer = () => {
    clearInterval(timer);
  };

  useFocusEffect(
    useCallback(() => {
      createTimer();
      const appStateSubscription = AppState.addEventListener(
        'change',
        nextAppState => {
          if (
            appState.current.match(/inactive|background|/) &&
            nextAppState === 'active'
          ) {
            console.log('App reopened, recreating timer');
            createTimer();
          } else if (
            nextAppState === 'background' ||
            nextAppState === 'inactive'
          ) {
            console.log('App closed, clearing timer');
            clearTimer();
          }
          appState.current = nextAppState;
        },
      );
      return () => {
        console.log('Screen change, removing intervals & subscriptions');
        clearTimer();
        appStateSubscription.remove();
      };
    }, [currentIndex, slides, interval]),
  );

  useEffect(() => {
    // const timer =
    //   slides.length > 0 &&
    //   setInterval(() => {
    //     const newIndex = (currentIndex + 1) % slides.length;
    //     console.log({newIndex, currentIndex, length: slides.length});
    //     handlePagination(newIndex);
    //   }, interval);
    // return () => clearInterval(timer);
    // function repeat() {
    //   requestAnimationFrame(repeat);
    //   console.log('test', Date.now());
    //   now = Date.now();
    //   elapsed = now - then;
    //   if (elapsed > fpsInterval) {
    //     then = now - (elapsed % fpsInterval);
    //     console.log('test', Date.now());
    //   }
    // }
    // fpsInterval = 1000 / fps;
    // then = Date.now();
    // startTime = then;
    // requestAnimationFrame(repeat);
  }, [currentIndex, slides, interval]);

  return (
    <View
      style={{
        width,
        height,
      }}>
      {slides.length > 0 ? (
        <>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{width, borderRadius: 20}}
            // onScroll={handleScroll}
            scrollEventThrottle={16}>
            {slides.map((slide, index) => (
              <View key={index} style={{width, height, overflow: 'hidden'}}>
                <ImageAsset
                  localIdentifier={slide}
                  setHeight={width}
                  setWidth={width}
                  // height={1}
                  style={{
                    // flex: 1,
                    height,
                    width,
                    backgroundColor: 'red',

                    // marginRight: 50,
                    // marginTop: -100,
                  }}
                />
              </View>
            ))}
          </ScrollView>
          <View
            style={{
              position: 'absolute',
              width,
              height,
              zIndex: 999,
              backgroundColor: 'rgba(0,0,0,0.4)',
              borderRadius: 20,
            }}></View>
        </>
      ) : (
        <View
          style={{
            borderRadius: 20,
            height,
            width,
            backgroundColor,
          }}
        />
      )}

      {/* <View
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          // marginLeft: -25,
          // marginTop: -25,
          zIndex: 999,
          alignItems: 'center',
        }}> */}
      <View
        style={{
          position: 'absolute',
          left: '39%',
          top: '10%',

          zIndex: 999,
          borderRadius: 30,
          borderWidth: 1,
          padding: 8,
          width: 40,
          height: 40,

          alignItems: 'center',
          justifyContent: 'center',
          borderColor: 'white',
        }}>
        {icon}
      </View>

      <Text
        numberOfLines={1}
        allowFontScaling={false}
        style={{
          color: 'white',
          position: 'absolute',
          left: '0%',
          top: '40%',
          zIndex: 999,
          textAlign: 'center',
          width: '100%',
          fontWeight: 700,
          fontSize: 36,
        }}>
        {data}
      </Text>
      <Text
        numberOfLines={1}
        allowFontScaling={false}
        style={{
          color: 'white',
          position: 'absolute',
          left: '0%',
          top: '70%',
          zIndex: 999,
          textAlign: 'center',
          width: '100%',
          fontWeight: 400,
          fontSize: 20,
        }}>
        {text}
      </Text>
      {/* </View> */}
    </View>
  );
};

const DataBlock = ({
  data,
  text,
  icon,
  backgroundColor = 'white',
  dataColor = '#484848',
  textColor = 'rgba(72,72,72,0.6)',
}) => {
  return (
    <View
      style={{
        margin: 10,
        borderRadius: 5,
        borderWidth: 1,
        flex: 1,
        borderColor: '#D3D3D3',
        justifyContent: 'center',
        textAlign: 'center',
        backgroundColor,
        alignItems: 'center',
      }}>
      {icon && <View style={{padding: 10}}>{icon}</View>}

      <Text
        allowFontScaling={false}
        numberOfLines={1}
        ellipsizeMode="clip"
        style={{
          textAlign: 'center',
          color: dataColor,
          padding: 5,
          paddingHorizontal: 10,
          fontSize: 20,
        }}>
        {data}
      </Text>
      <Text
        allowFontScaling={false}
        style={{textAlign: 'center', color: textColor, padding: 5}}>
        {text}
      </Text>
    </View>
  );
};

const Divider = () => {
  return (
    <View
      style={{
        width: '100%',
        marginVertical: 10,
        backgroundColor: '#D3D3D3',
        height: 1,
      }}
    />
  );
};

export default InsightsView = ({}) => {
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
    checkIfMemoryReadyToGenerate,
  } = useContext(AppContext);
  const groupBy = (list, keyGetter) => {
    const map = new Map();
    list.forEach(item => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  };
  function indexOfMax(arr) {
    if (arr.length === 0) {
      return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        maxIndex = i;
        max = arr[i];
      }
    }

    return maxIndex;
  }

  function msToTime(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return seconds + ' Sec';
    else if (minutes < 60) return minutes + ' Min';
    else if (hours < 24) return hours + ' Hrs';
    else return days + ' Days';
  }

  const getAverage = arr => {
    let reducer = (total, currentValue) => total + currentValue;
    let sum = arr.reduce(reducer, 0);
    return sum / arr.length;
  };

  const testData = Array.from(
    groupBy(memories, memory => new Date(memory.time).toLocaleDateString()),
  );

  const testLocationMemory = [
    {
      eventsData: {
        city: 'London',
      },
    },
    {
      eventsData: {
        city: 'London',
      },
    },
    {
      eventsData: {
        city: 'London',
      },
    },
    {
      eventsData: {
        city: 'London',
      },
    },
    {
      eventsData: {
        city: 'New York',
      },
    },
    {
      eventsData: {
        city: 'New York',
      },
    },
    {
      eventsData: {
        city: 'New York',
      },
    },
    {
      eventsData: {
        city: 'New York',
      },
    },
    {
      eventsData: {
        city: 'New York',
      },
    },
    {
      eventsData: {
        city: 'New York2',
      },
    },
  ];
  const memoriesPerDay = testData.map(arr => arr[1].length);
  console.log(JSON.stringify(testData));

  const getAttrWithMost = groupedData => {
    const itemsPerAttr = groupedData.map(arr => arr[1].length);
    return groupedData.length === 0
      ? null
      : groupedData[indexOfMax(itemsPerAttr)][0];
  };

  const getItemWithMost = groupedData => {
    const itemsPerAttr = groupedData.map(arr => arr[1].length);
    return groupedData.length === 0
      ? null
      : itemsPerAttr[indexOfMax(itemsPerAttr)];
  };

  const countTagsOccurances = arrayOfObjects => {
    const occurances = {
      roles: {},
      modes: {},
      other: {},
    };
    arrayOfObjects.forEach(obj => {
      obj.roles.forEach(role => {
        occurances.roles[role] = (occurances.roles[role] || 0) + 1;
      });
      obj.modes?.forEach(mode => {
        occurances.modes[mode] = (occurances.modes[mode] || 0) + 1;
      });
      obj.other.forEach(other => {
        occurances.other[other] = (occurances.other[other] || 0) + 1;
      });
    });
    return occurances;
  };

  const countBasicOccurances = arrayOfObjects => {
    const occurances = {};
    arrayOfObjects.forEach(name => {
      occurances[name] = (occurances[name] || 0) + 1;
    });
    return occurances;
  };

  var linkData = [];

  memories.forEach(item => {
    linkData.push(getLinkDataForMemory(item).linksFinal);
  });
  linkData = linkData.flat();
  console.log(JSON.stringify(linkData));

  const photoLabelsData = Object.fromEntries(
    Object.entries(
      countBasicOccurances([
        ...memories
          .filter(memory => memory.type === EventTypes.PHOTO_GROUP)
          .map(memory =>
            memory.eventsData
              .map(eventData => eventData.labels.map(label => label.Name))
              .flat(),
          )
          .flat(),
        ...memories
          .filter(memory => memory.type === EventTypes.PHOTO)
          .map(memory => memory.eventsData.labels?.map(label => label.Name))
          .flat(),
      ]),
    ).sort((a, b) => b[1] - a[1]),
  );

  const domains = Object.fromEntries(
    Object.entries(countBasicOccurances(linkData)).sort((a, b) => b[1] - a[1]),
  );

  return (
    <ScrollView contentContainerStyle={{padding: 10}}>
      <View style={{flexDirection: 'row'}}>
        <DataBlock
          data={memories.length}
          text={'total memories'}
          backgroundColor="#118ED1"
          textColor="white"
          dataColor="white"
          icon={<ProfileIcon size={50} fill="#FFF" fillOpacity={1} />}
        />
        <View style={{flexDirection: 'column', flex: 1}}>
          <DataBlock
            data={(
              memoriesPerDay.reduce((total, num) => {
                return total + num;
              }, 0) / memoriesPerDay.length
            ).toFixed(3)}
            text={'memories per day'}
          />
          <DataBlock
            data={getAttrWithMost(testData)}
            text={'most memorable day'}
          />
        </View>
      </View>
      <Divider />
      <DataBlock
        data={memories.filter(memory => memory.vote >= 1).length}
        text={'upvoted memories'}
      />
      <DataBlock
        data={memories.filter(memory => memory.vote <= -1).length}
        text={'downvoted memories'}
      />
      <Divider />
      {/* Pictures */}
      <View style={{flexDirection: 'row'}}>
        <Slideshow
          slides={memories
            .filter(memory => memory.type === EventTypes.PHOTO)
            .map(memory => memory.eventsData.localIdentifier)
            //Get 5 random photos
            .sort(() => 0.5 - Math.random())
            .slice(0, 5)}
          data={
            memories
              .filter(memory => memory.type === EventTypes.PHOTO_GROUP)
              .map(memory => memory.eventsData.length)
              .reduce((total, num) => {
                return total + num;
              }, 0) +
            memories.filter(memory => memory.type === EventTypes.PHOTO).length
          }
        />
        <View style={{flexDirection: 'column', flex: 1}}>
          <DataBlock
            data={photoLabelsData[Object.keys(photoLabelsData)[0]]}
            text={`includes ${Object.keys(photoLabelsData)[0]}`}
          />

          <DataBlock
            data={photoLabelsData[Object.keys(photoLabelsData)[1]]}
            text={`includes ${Object.keys(photoLabelsData)[1]}`}
          />
        </View>
      </View>
      <Divider />
      {/* Events */}
      <View style={{flexDirection: 'row'}}>
        <Slideshow
          slides={memories
            .filter(memory => memory.type === EventTypes.PHOTO)
            .map(memory => memory.eventsData.localIdentifier)
            //Get 5 random photos
            .sort(() => 0.5 - Math.random())
            .slice(0, 5)}
          data={msToTime(
            memories
              .filter(memory => memory.type === EventTypes.CALENDAR_EVENT)
              .map(memory => {
                return (
                  parseInt(memory.eventsData.end) * 1000 -
                  parseInt(memory.eventsData.start) * 1000
                );
              })
              .filter(time => time >= 0)
              .reduce((total, num) => {
                return total + num;
              }, 0),
          )}
          text={'spent on events'}
          icon={<EventsIcon />}
        />
        <View style={{flexDirection: 'column', flex: 1}}>
          <DataBlock
            data={
              memories.filter(
                memory => memory.type === EventTypes.CALENDAR_EVENT,
              ).length
            }
            text={`total`}
          />
        </View>
      </View>
      <Divider />
      {/* Travel */}
      <View style={{flexDirection: 'row'}}>
        <Slideshow
          slides={memories
            .filter(memory => memory.type === EventTypes.PHOTO)
            .map(memory => memory.eventsData.localIdentifier)
            //Get 5 random photos
            .sort(() => 0.5 - Math.random())
            .slice(0, 5)}
          data={
            Object.keys(
              countBasicOccurances(
                memories
                  .filter(memory => {
                    if (memory.type === EventTypes.LOCATION) {
                      if (memory.eventsData.city !== undefined) return true;
                    }
                    return false;
                  })
                  .map(memory => memory.eventsData.city),
              ),
            ).length
          }
          text={'cities visited'}
          icon={<LocationsIcon />}
        />
        <View style={{flexDirection: 'column', flex: 1}}>
          <DataBlock
            data={getAttrWithMost(
              Array.from(
                groupBy(
                  memories.filter(memory => {
                    if (memory.type === EventTypes.LOCATION) {
                      if (memory.eventsData.city !== undefined) return true;
                    }
                    return false;
                  }),
                  memory => memory.eventsData.city,
                ),
              ),
            )}
            text={'Most Visited City'}
          />
          <DataBlock
            data={msToTime(
              memories
                .filter(memory => memory.type === EventTypes.LOCATION_ROUTE)
                .map(memory => {
                  return (
                    memory.eventsData.end.start - memory.eventsData.start.end
                  );
                })
                .filter(time => time >= 0)
                .reduce((total, num) => {
                  return total + num;
                }, 0),
            )}
            text={'days in travel'}
          />
        </View>
      </View>
      <Divider />
      {/* Links */}
      <View style={{flexDirection: 'row'}}>
        <Slideshow
          slides={[]}
          data={linkData.length}
          text={'Links'}
          icon={<LinksIcon />}
          backgroundColor="#10B09D"
        />
        <View style={{flexDirection: 'column', flex: 1}}>
          <DataBlock data={Object.keys(domains)[0]} text={'top domain'} />
        </View>
      </View>

      {devMode && (
        <>
          <Header txt={'General'} first={true} />
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Total Number of Memories:
            </Text>{' '}
            {memories.length}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Average Number of Memories a Day:
            </Text>{' '}
            {memoriesPerDay.reduce((total, num) => {
              return total + num;
            }, 0) / memoriesPerDay.length}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Day with Most Memories:
            </Text>{' '}
            {getAttrWithMost(testData)} with {getItemWithMost(testData)}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Total Number of Photos Group Memories:
            </Text>
            {
              memories.filter(memory => memory.type === EventTypes.PHOTO_GROUP)
                .length
            }
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Total Number of Photos Memories:
            </Text>
            {memories.filter(memory => memory.type === EventTypes.PHOTO).length}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Total Number of Calendar Events Memories:
            </Text>
            {
              memories.filter(
                memory => memory.type === EventTypes.CALENDAR_EVENT,
              ).length
            }
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Total Number of Location Memories:
            </Text>{' '}
            Visits:{' '}
            {
              memories.filter(memory => memory.type === EventTypes.LOCATION)
                .length
            }{' '}
            Route:{' '}
            {
              memories.filter(
                memory => memory.type === EventTypes.LOCATION_ROUTE,
              ).length
            }
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Tags:
            </Text>
            {JSON.stringify(
              countTagsOccurances(memories.map(memory => memory.tags)),
            )}
          </Text>
          <Header txt={'Photo'} />
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Total Number of Photos:
            </Text>
            {memories
              .filter(memory => memory.type === EventTypes.PHOTO_GROUP)
              .map(memory => memory.eventsData.length)
              .reduce((total, num) => {
                return total + num;
              }, 0) +
              memories.filter(memory => memory.type === EventTypes.PHOTO)
                .length}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Average Number of Photos Per Photo Group Memory:
            </Text>
            {memories
              .filter(memory => memory.type === EventTypes.PHOTO_GROUP)
              .map(memory => memory.eventsData.length)
              .reduce((total, num) => {
                return total + num;
              }, 0) /
              memories.filter(memory => memory.type === EventTypes.PHOTO_GROUP)
                .length}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Photo Labels:
            </Text>
            {JSON.stringify(
              Object.fromEntries(
                Object.entries(
                  countBasicOccurances([
                    ...memories
                      .filter(memory => memory.type === EventTypes.PHOTO_GROUP)
                      .map(memory =>
                        memory.eventsData
                          .map(eventData =>
                            eventData.labels.map(label => label.Name),
                          )
                          .flat(),
                      )
                      .flat(),
                    ...memories
                      .filter(memory => memory.type === EventTypes.PHOTO)
                      .map(memory =>
                        memory.eventsData.labels?.map(label => label.Name),
                      )
                      .flat(),
                  ]),
                ).sort((a, b) => b[1] - a[1]),
              ),
            )}
          </Text>
          <Header txt={'Location'} />
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Cities Visited:
            </Text>{' '}
            {/* {JSON.stringify(
          groupBy(
            memories.filter(memory => {
              if (memory.type === EventTypes.LOCATION) {
                if (memory.eventsData.description.split(',').length >= 3) {
                  return true;
                } else {
                  return false;
                }
              } else {
                return false;
              }
            }),
            memory => memory.eventsData.description.split(',')[2],
          ),
        )} */}
            {/* {JSON.stringify(
          Array.from(
            groupBy(
              memories.filter(memory => {
                if (memory.type === EventTypes.LOCATION) {
                  if (memory.eventsData.city !== undefined) return true;
                }
                return false;
              }),
              memory => memory.eventsData.city,
            ),
          ).map(obj => obj[0]),
        )} */}
            {JSON.stringify(
              countBasicOccurances(
                memories
                  .filter(memory => {
                    if (memory.type === EventTypes.LOCATION) {
                      if (memory.eventsData.city !== undefined) return true;
                    }
                    return false;
                  })
                  .map(memory => memory.eventsData.city),
              ),
            )}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              City with most visits:
            </Text>{' '}
            {getAttrWithMost(
              Array.from(
                groupBy(
                  memories.filter(memory => {
                    if (memory.type === EventTypes.LOCATION) {
                      if (memory.eventsData.city !== undefined) return true;
                    }
                    return false;
                  }),
                  memory => memory.eventsData.city,
                ),
              ),
            )}{' '}
            with{' '}
            {getItemWithMost(
              Array.from(
                groupBy(
                  memories.filter(memory => {
                    if (memory.type === EventTypes.LOCATION) {
                      if (memory.eventsData.city !== undefined) return true;
                    }
                    return false;
                  }),
                  memory => memory.eventsData.city,
                ),
              ),
            )}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Total Time travelling:
            </Text>{' '}
            {msToTime(
              memories
                .filter(memory => memory.type === EventTypes.LOCATION_ROUTE)
                .map(memory => {
                  return (
                    memory.eventsData.end.start - memory.eventsData.start.end
                  );
                })
                .filter(time => time >= 0)
                .reduce((total, num) => {
                  return total + num;
                }, 0),
            )}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Average Speeds ms^(-1):
            </Text>{' '}
            {JSON.stringify(
              memories
                .filter(memory => memory.type === EventTypes.LOCATION_ROUTE)
                .map(
                  memory =>
                    getAverage(
                      memory.eventsData.points.map(point => point.speed),
                    ) || -1,
                ),
            )}
          </Text>
          <Header txt={'Calendar'} />
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Total Time for Events:
            </Text>{' '}
            {msToTime(
              memories
                .filter(memory => memory.type === EventTypes.CALENDAR_EVENT)
                .map(memory => {
                  return (
                    parseInt(memory.eventsData.end) * 1000 -
                    parseInt(memory.eventsData.start) * 1000
                  );
                })
                .filter(time => time >= 0)
                .reduce((total, num) => {
                  return total + num;
                }, 0),
            )}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Per Calendar:
            </Text>{' '}
            {JSON.stringify(
              countBasicOccurances(
                memories
                  .filter(memory => memory.type === EventTypes.CALENDAR_EVENT)
                  .map(memory => memory.eventsData.calendar),
              ),
            )}
          </Text>
          <Header txt={'Links'} />
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Total Links:
            </Text>{' '}
            {linkData.length}
          </Text>
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Most used domains:
            </Text>{' '}
            {JSON.stringify(countBasicOccurances(linkData))}
          </Text>
          <Header txt={'Upvotes'} />
          <Text allowFontScaling={false}>
            <Text allowFontScaling={false} style={{fontWeight: 600}}>
              Upvoted Memories:
            </Text>
            {JSON.stringify(
              memories
                .filter(memory => memory.vote >= 1)
                .sort((a, b) => b.vote - a.vote),
            )}
          </Text>
        </>
      )}
    </ScrollView>
  );
};
