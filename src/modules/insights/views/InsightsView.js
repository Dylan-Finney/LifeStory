import {View, Text, ScrollView} from 'react-native';
import AppContext from '../../../contexts/AppContext';
import {useContext} from 'react';
import {EventTypes} from '../../../utils/Enums';
import {
  CUSTOM_HYPERLINK_REGEX,
  LINK_DOMAIN_REGEX,
  URL_REGEX,
} from '../../../utils/regex';
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
      linksFinal.push(link.toLowerCase().split(LINK_DOMAIN_REGEX)[1]);
    });

    linkData.push(linksFinal);
  });
  linkData = linkData.flat();
  console.log(JSON.stringify(linkData));

  return (
    <ScrollView contentContainerStyle={{padding: 10}}>
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
          memories.filter(memory => memory.type === EventTypes.CALENDAR_EVENT)
            .length
        }
      </Text>
      <Text allowFontScaling={false}>
        <Text allowFontScaling={false} style={{fontWeight: 600}}>
          Total Number of Location Memories:
        </Text>{' '}
        Visits:{' '}
        {memories.filter(memory => memory.type === EventTypes.LOCATION).length}{' '}
        Route:{' '}
        {
          memories.filter(memory => memory.type === EventTypes.LOCATION_ROUTE)
            .length
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
          memories.filter(memory => memory.type === EventTypes.PHOTO).length}
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
                    memory.eventsData.labels.map(label => label.Name),
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
              return memory.eventsData.end.start - memory.eventsData.start.end;
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
    </ScrollView>
  );
};
