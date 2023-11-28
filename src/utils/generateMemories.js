import useDatabaseHooks from './hooks/useDatabaseHooks';
import useSettingsHooks from './hooks/useSettingsHooks';
import Config from 'react-native-config';
import moment from 'moment';
import {EventTypes} from './Enums';
import getBestLocationTag from './getBestLocationTag';
import {decode, encode} from 'base-64';
// import Config from 'react-native-config';
const AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: Config.AWS_ACCESS_KEY,
  secretAccessKey: Config.AWS_SECRET_KEY,
  region: Config.AWS_REGION,
});

const Rekognition = new AWS.Rekognition();

const {Configuration, OpenAIApi} = require('openai');
const configuration = new Configuration({
  apiKey: Config.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const {
  retrieveSpecificData,
  saveEntryData,
  updateEntryData,
  createEntryTable,
  createMemoriesTable,
  saveMemoryData,
  retrieveRoutePointsForVisitData,
  retrievePreviousVisitWithDeparture,
} = useDatabaseHooks();

const getAverage = arr => {
  let reducer = (total, currentValue) => total + currentValue;
  let sum = arr.reduce(reducer);
  return sum / arr.length;
};

const analyzePhoto = async photo => {
  return new Promise(async (resolve, reject) => {
    console.log(photo);
    const image = decode(photo.data);
    const length = image.length;
    const imageBytes = new ArrayBuffer(length);
    const ua = new Uint8Array(imageBytes);
    for (var i = 0; i < length; i++) {
      ua[i] = image.charCodeAt(i);
    }
    var responseLabels;
    var responseOCR;
    var labelsWithTitle;
    var textDetections;

    try {
      responseOCR = await Rekognition.detectText({
        Image: {Bytes: ua},
      }).promise();
      console.log('Rekognition.detectText Response', responseOCR);
      responseOCR = responseOCR.TextDetections.filter(
        textDetection =>
          textDetection.Confidence >= 80 && textDetection.Type === 'LINE',
      );
      textDetections = responseOCR.map(textDetection => {
        return {
          Text: textDetection.DetectedText,
          Confidence: textDetection.Confidence,
        };
      });
    } catch (e) {
      console.error('Error with AWS OCR', e);
    }
    try {
      responseLabels = await Rekognition.detectLabels({
        Image: {Bytes: ua},
      }).promise();
      const labels = responseLabels.Labels;
      const labelsFiltered = labels.filter(label => label.Confidence >= 80);
      labelsWithTitle = labelsFiltered.map(label => {
        if (
          label.Categories.filter(category => category.Name).some(
            r =>
              [
                'Person Description',
                'Actions',
                'Events and Attractions',
              ].indexOf(r) >= 0,
          )
        ) {
          return {
            ...label,
            title: `${label.Instances.length}x${label.Name}`,
          };
        } else {
          return {
            ...label,
            title: label.Name,
          };
        }
      });
    } catch (e) {
      console.error('Error with AWS Labelling', e);
    }
    resolve({
      labelsWithTitle,
      textDetections,
    });
  });
};

const generateGenericMemory = async ({data, type, time}) => {
  var messages = [];
  var systemPrompt = `You are my assistant. I will give you an event that happened today (location visit, photo taken, route, etc) and I want you to write a brief concise natural description as if it were apart of a diary. Assume that other entries could exist before and after. Write in the ${useSettingsHooks.getString(
    'language',
  )} language. ${
    JSON.parse(useSettingsHooks.getString('settings.globalWritingSettings'))
      .generate
  }`;
  var userPrompt = '';
  var photoAnalysis =
    useSettingsHooks.getBoolean('settings.photoAnalysis') || false;

  console.log('photoAnalysis', {photoAnalysis});

  switch (type) {
    case EventTypes.LOCATION_ROUTE:
      messages = [
        {
          role: 'system',
          content: `You are a facts writer to write text entries without titles from the previous data, based on these instructions:
1. Write in first person, in today's past tense, but don't say 'today'
2. Don't write about things that are not described in data provided
3. Don't write about the weather
4. Mention times as 'early morning',  'around noon', etc. Ie. as we would refer times in a typical conversation (not exact times)
5. Write about approximate duration.
6. Write location by area name, based on cross roads, or nearby landmark. Ie. as we would refer places in a typical conversation. (Don't use exact addresses and don't mention country).
7. Don't mention Latitude or Longitude coordinates
8. Guess at the travel method based on the average speed of the journey
9. Don't mention dates.
10. Use up to 100 characters 
-----

Examples:

I walked to Central Park from Manhattan, which took 2.5 hours in the afternoon.

----`,
        },
        {
          role: 'user',
          content: `{
 "routeDetails": {
"avgSpeed": 17.8816, //m/s
 "start": {
 "locationTag": "Central Park",
 "time": "2023-10-30T14:00:00--4:00"
},
"end": {
 "locationTag": "Manhattan",
"time": "2023-10-30T16:30:00--4:00"
}

}
}`,
        },
        {
          role: 'assistant',
          content: `I left Central Park in the early afternoon and drove to Manhattan, which took approximately 2.5 hours. `,
        },
        {
          role: 'user',
          content: `{
          "routeDetails": {
          "avgSpeed": ${getAverage(
            data.points.map(point => point.speed),
          )}, //m/s
          "start": {
          "locationTag": "${getBestLocationTag(
            data.start.description?.split('@')[0] || undefined,
          )}",
          "time": "${new Date(data.start.end).toLocaleString()}",
          },
          "end": {
          "locationTag": "${getBestLocationTag(
            data.end.description?.split('@')[0] || undefined,
          )}",
          "time": "${new Date(data.end.start).toLocaleString()}",
          }

          }
          }`,
          //           content: `{
          //  "routeDetails": {
          // "avgSpeed": 17.8816, //m/s
          //  "start": {
          //  "locationTag": "Central Park",
          //  "time": "2023-10-30T14:00:00--4:00"
          // },
          // "end": {
          //  "locationTag": "Manhattan",
          // "time": "2023-10-30T16:30:00--4:00"
          // }

          // }
          // }`,
        },
      ];
      break;
    case EventTypes.LOCATION:
      if (data.end === null) {
        messages = [
          {
            role: 'system',
            content: `You are a facts writer to write text entries without titles from the provided data, based on these instructions:

1. Write in first person, in today's past tent, but don't say 'today'.
2. Don’t write about things that are not described in data provided.
3. Don't write about weather!
4. Mention times as ‘early. morning’, ‘around noon’, etc. Ie. as we would refer times in a typical conversation (not exact times)
5. Write about approximate duration.
6. Write location by area name, based on cross roads, or nearby landmark. Ie. as we would refer places in a typical conversation. (Don’t use exact addresses and don't mention country). 
7. Don't mention latitude or longitude coordinates.
8. Don't mention dates.
9. Use up to 100 characters.
10. This entry is only about arriving at a location

-----

Examples:

I got to Central Park in the morning's early hours

----`,
          },
          {
            role: 'user',
            content: `{
  "geoLocationStay": {
    "locationTag": "Central Park, New York, US",
    "location":
      "latitude": "40.7829° N",
      "longitude": "73.9654° W"
    },
    "time": {
      "start": "2023-10-30T14:00:00-04:00"
    },
    "timezone": "EDT"
  }
}`,
          },
          {
            role: 'assistant',
            content: `I arrived near Central Park in the early afternoon.`,
          },
          {
            role: 'user',
            content: `{
  "geoLocationStay": {
    "locationTag": "${getBestLocationTag(
      data.description?.split('@')[0] || undefined,
    )}",
    "location":
      "latitude": "${data.latitude}",
      "longitude": "${data.longitude}"
    },
    "time": {
      "start": "${new Date(data.start).toLocaleString()}",
    }
  }
}`,
          },
        ];
      } else {
        messages = [
          {
            role: 'system',
            content: `You are a facts writer to write text entries without titles from the provided data, based on these instructions:

1. Write in first person, in today's past tent, but don't say 'today'.
2. Don’t write about things that are not described in data provided.
3. Don't write about weather!
4. Mention times as ‘early. morning’, ‘around noon’, etc. Ie. as we would refer times in a typical conversation (not exact times)
5. Write about approximate duration.
6. Write location by area name, based on cross roads, or nearby landmark. Ie. as we would refer places in a typical conversation. (Don’t use exact addresses and don't mention country). 
7. Don't mention latitude or longitude coordinates.
8. Don't mention dates.
9. Use up to 100 characters.

-----

Examples:

I visited a place near 350 Fifth Avenue, New York. I spent about an hour there in the early afternoon.

I spent a good three hours in the evening at Yoyogi-Kamizono-cho, Shibuya.

I spent a good part of my evening, around three hours, in the Yoyogi-Kamizono-cho area of Shibuya.

I spent a couple of hours in the late afternoon at a place near Via Baccina.

I spent about an hour late afternoon near Rue du Faubourg Saint-Honoré.

I spent afternoon exploring the charming streets near Rue du Faubourg Saint-Honoré in Paris. I wandered around for about an hour.

I spent about an hour late afternoon near Rue du Faubourg Saint-Honoré.

I spent about an hour late this afternoon near Rue du Faubourg Saint-Honoré.

I spent a couple of hours around mid-morning near the intersection of G St NW.

I spent about half an hour in the mid-afternoon at a place near Pall Mall in St. James's.

I spent about half an hour in the afternoon at a place near St. James's area, close to Pall Mall.

----`,
          },
          {
            role: 'user',
            content: `{
  "geoLocationStay": {
    "locationTag": "Central Park, New York, US",
    "location":
      "latitude": "40.7829° N",
      "longitude": "73.9654° W"
    },
    "time": {
      "start": "2023-10-30T14:00:00-04:00",
      "end": "2023-10-30T16:30:00-04:00"
    },
    "timezone": "EDT"
  }
}`,
          },
          {
            role: 'assistant',
            content: `I spent a pleasant afternoon near Central Park, soaking in the ambiance of the area, which was alive with the hustle and bustle that's so characteristic of the place. I stayed for around 2 and a half hours.`,
          },
          {
            role: 'user',
            content: `{
  "geoLocationStay": {
    "locationTag": "${getBestLocationTag(
      data.description?.split('@')[0] || undefined,
    )}",
    "location":
      "latitude": "${data.latitude}",
      "longitude": "${data.longitude}"
    },
    "time": {
      "start": "${new Date(data.start).toLocaleString()}",
      "end": "${new Date(data.end).toLocaleString()}",
    }
  }
}`,
          },
        ];
      }

      break;
    case EventTypes.CALENDAR_EVENT:
      userPrompt = `Calendar Event: ${data.title} @${
        data.isAllDay === 'true'
          ? `All-Day`
          : `${moment(parseInt(data.start) * 1000).format('LT')}-${moment(
              parseInt(data.end) * 1000,
            ).format('LT')}`
      }`;
      messages = [
        {
          role: 'system',
          content: `Your role is to write text entries without titles from the data provided, based on these instructions:

1. Write in first person
2. Don’t write about anything that is not described by data provided
3. Text should be written in neutral, informative and descriptive tone, while also keeping it short and to the point
4. Don’t write about ending times, rather refer to approximate duration
5. Don’t refer time as exacts but rather ‘early morning’, ‘around noon’, etc. Ie. as we would refer times in a typical conversation
6. Don’t write contact data if available (emails, phone numbers, etc), but you can use indicative information if available/relevant ie. persons name
8. Don’t assume meetings to be in person or virtual, just don’t use anything that would indicate either one if factual information this is not available
9. Don't mention timezones
10. Write in today's past tent
11. Use up to 150 characters
---`,
        },
        {
          role: 'user',
          content: `{
  "calendarEntry": {
    "title": "Team Sync-Up Meeting",
    "calendarName": "Work Calendar",
    "location": "Zoom (Virtual)",
    "time": {
      "start": "2023-10-30T09:00:00-04:00",
      "end": "2023-10-30T09:45:00-04:00"
    },
    "repeatPattern": {
      "frequency": "Weekly",
      "day": "Monday"
    },
    "timezone": "EDT"
  }
}`,
        },
        {
          role: 'assistant',
          content: `I had a Team Sync-Up Meeting today, which is a weekly occurrence on Mondays. It took place virtually on Zoom. The meeting started in the early morning at around 9:00 AM and lasted for approximately 45 minutes.`,
        },
        {
          role: 'user',
          content: `{
  "calendarEntry": {
    "title": "${data.title}",
    "calendarName": "${data.title}",
    "time": {
      "start": "${new Date(
        Math.floor(parseFloat(data.start) * 1000),
      ).toLocaleString()}",
      "end": "${new Date(
        Math.floor(parseFloat(data.end) * 1000),
      ).toLocaleString()}"
    },
    "isAllDay": ${data.isAllDay}
  }
}`,
        },
      ];
      break;
    case EventTypes.PHOTO:
      // data.data = '';
      // var photo = data;
      if (photoAnalysis === true) {
        const {labelsWithTitle, textDetections} = await analyzePhoto(data);
        console.log({labelsWithTitle});
        data = {
          ...data,
          data: '',
          labels: labelsWithTitle,
          text: textDetections,
        };
      } else {
        data = {
          ...data,
          data: '',
        };
      }

      var alias = getBestLocationTag(
        data.description?.split('@')[0] || undefined,
      );
      // userPrompt = `Photo Taken: ${
      //   data.labels !== undefined
      //     ? `Labels: ${data.labels.map(label => label.title).toString()}`
      //     : ''
      // } ${
      //   data.description !== ''
      //     ? `${data.description}`
      //     : `${data.lat !== 'null' ? `Lat: ${data.lat}` : ''} ${
      //         data.long !== 'null' ? `Long: ${data.long}` : ''
      //       }`
      // } @${moment(Math.floor(parseFloat(data.creation) * 1000)).format('LT')}`;
      messages = [
        {
          role: 'system',
          content: `Your role is to write text entry without titles for a photo that is shown in context of your text, based on the data provided and following these instructions:

1. Write in first person
2. Don’t write about anything that is not described by data provided
3. Write in neutral but informative tone
4. Use up to 500 characters
5. Don't mention exact times, but refer time as ‘early morning’, ‘around noon’, like we would in a typical conversation
6. Don’t write about ending times, rather refer to approximate duration
7. Don’t use exact addresses, but refer to location and/or popular landmarks names. Ie. as we would refer places in a typical conversation
8. Write in today's past tent
9. Don't mention timezones
10. Don't mention latitude or longitude coordinates
11. Don't mention dates
12. Don't mention method moved unless known
13. Dont mention weather if not provided
14. Don’t write contact data if available (emails, phone numbers, etc), but you can use indicative information if available/relevant ie. persons name
15. Focus on what image is about and where its taken
16. Dont mention camera settings
17. Dont mention image recognition labels
18. If the object has no image recognition labels don't write about what the image shows

-----`,
        },
        {
          role: 'user',
          content: `{
  "photo": {
    "fileName": "IMG_20230415_1720.jpg",
    "locationTag": "Griffith Observatory, Los Angeles",
    "coordinates": {
      "latitude": "34.1184° N",
      "longitude": "118.3004° W"
    },
    "timeTaken": "2023-04-15T17:20:00-07:00",
    "cameraSettings": {
      "aperture": "f/4.0",
      "shutterSpeed": "1/500 sec",
      "ISO": "200",
      "focalLength": "28mm"
    },
    "imageRecognitionLabels": [
      { "label": "Architecture", "confidence": 100 },
      { "label": "Building", "confidence": 100 },
      { "label": "Multiple People", "confidence": 98 }
    ],
    "timezone": "PDT"
  }
}`,
        },
        {
          role: 'assistant',
          content: `I spent the late afternoon at Griffith Observatory, Los Angeles. The architecture and observatory dome are prominent in the photos. People in casual clothing enjoyed the outdoor surroundings, with some wearing T-shirts and shorts. The observatory's peak and planetarium are visible. Later, I explored a lush area with slopes, vegetation, and a bicycle.`,
        },
        {
          role: 'user',
          content: `{
  "photo": {
    "fileName": "${data.name}",
    "locationTag": "${alias}",
    "coordinates": {
      "latitude": "${data.lat}",
      "longitude": "${data.lon}"
    },
    "timeTaken": "${new Date(data.creation).toLocaleString()}",
    "imageRecognitionLabels": [
      ${data.labels?.map(label => {
        return `{ "label": "${label.title}", "confidence": ${label.Confidence} },
`;
      })}
    ],
    "textRecognitionLabels": [
      ${data.text?.map(label => {
        return `{ "line": "${label.Text}", "confidence": ${label.Confidence} },
`;
      })}
    ],
  }
}`,
        },
      ];
      console.log('photo message', JSON.stringify(messages));
      break;
    case EventTypes.PHOTO_GROUP:
      const MAX_PHOTO_GROUP_LENGTH = 10;
      const processGroup = async data => {
        if (photoAnalysis === true) {
          return await Promise.all(
            data.map(async photo => {
              const {labelsWithTitle, textDetections} = await analyzePhoto(
                photo,
              );
              return {
                ...photo,
                data: '',
                labels: labelsWithTitle,
                text: textDetections,
              };
            }),
          );
        } else {
          return data.map(photo => {
            return {
              ...photo,
              data: '',
            };
          });
        }
      };
      const photoGroup = await processGroup(
        data.slice(0, MAX_PHOTO_GROUP_LENGTH),
      );
      console.log({photoGroup});
      messages = [
        {
          role: 'system',
          content: `Your role is to write text entry without titles for a set of photos that are shown in context of your text, based on the data provided and following these instructions:

1. Write in first person
2. Don’t write about anything that is not included in data provided
3. Write in neutral and informative tone
4. Use up to 500 characters
5. Don't mention exact times, but refer time as ‘early morning’, ‘around noon’, like we would in a typical conversation
6. Don’t write about ending times, rather refer to approximate duration
7. Don’t write street names, instead refer to a area location/district and/or popular landmarks names. Ie. like in a typical conversation
8. Write in today's past tent, but dont say today
9. Don't mention timezones
10. Don't mention latitude or longitude coordinates
11. Don't mention dates
12. Write only one description while utilizing relevant data available from all photos provided
13. Don't mention weather if not provided
14. Don’t write contact data if available (emails, phone numbers, etc), but you can use indicative information if available/relevant ie. persons name
15. Focus on what image is about and where its taken
16. Don't mention camera settings
17. Don't mention image recognition labels
18. Don't add reference labels
-----`,
        },
        {
          role: 'user',
          content: `{
  "photo": {
    "fileName": "IMG_20230415_1720.jpg",
    "locationTag": "Griffith Observatory, Los Angeles",
    "coordinates": {
      "latitude": "34.1184° N",
      "longitude": "118.3004° W"
    },
    "timeTaken": "2023-04-15T17:20:00-07:00",
    "cameraSettings": {
      "aperture": "f/4.0",
      "shutterSpeed": "1/500 sec",
      "ISO": "200",
      "focalLength": "28mm"
    },
    "imageRecognitionLabels": [
      { "label": "Architecture", "confidence": 100 },
      { "label": "Building", "confidence": 100 },
      { "label": "Multiple People", "confidence": 98 }
    ],
    "timezone": "PDT"
  }
}`,
        },
        {
          role: 'assistant',
          content: `I spent the late afternoon at Griffith Observatory, Los Angeles. The architecture and observatory dome are prominent in the photos. People in casual clothing enjoyed the outdoor surroundings, with some wearing T-shirts and shorts. The observatory's peak and planetarium are visible. Later, I explored a lush area with slopes, vegetation, and a bicycle.`,
        },
        {
          role: 'user',
          content: `[
            ${photoGroup.map(
              photo => `{
  "photo": {
    "fileName": "${photo.name}",
    "locationTag": "${getBestLocationTag(
      photo.description?.split('@')[0] || undefined,
    )}",
    "coordinates": {
      "latitude": "${photo.lat}",
      "longitude": "${photo.lon}"
    },
    "timeTaken": "${new Date(photo.creation).toLocaleString()}",
    "imageRecognitionLabels": [
      ${photo.labels?.map(label => {
        return `{ "label": "${label.title}", "confidence": ${label.Confidence} },
`;
      })}
    ],
    "textRecognitionLabels": [
      ${photo.text?.map(label => {
        return `{ "line": "${label.Text}", "confidence": ${label.Confidence} },
`;
      })}
    ],
  }
},
`,
            )} ${
            data.length > MAX_PHOTO_GROUP_LENGTH &&
            `...${data.length - MAX_PHOTO_GROUP_LENGTH} more`
          }
          ]`,
        },
      ];

      if (data.length > MAX_PHOTO_GROUP_LENGTH) {
        data = [
          ...photoGroup,
          ...data.slice(MAX_PHOTO_GROUP_LENGTH, data.length - 1).map(photo => {
            return {
              ...photo,
              data: '',
            };
          }),
        ];
      } else {
        data = photoGroup;
      }

      console.log('photo message', JSON.stringify(messages));
      break;
    default:
      messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: JSON.stringify(data),
        },
      ];
      break;
  }
  const completion = await openai.createChatCompletion({
    // model: 'gpt-4',
    model: 'gpt-3.5-turbo-1106',
    temperature: 0.5,
    max_tokens: 1053,
    messages,
  });
  const response = completion.data.choices[0].message?.content;
  // const response = `This morning I took a photo of a red bird outside.`;
  console.log(response);
  createMemoriesTable();
  saveMemoryData({
    tags: JSON.stringify({
      roles: [],
      body: [],
      other: [],
    }),
    type,
    body: response,
    bodyModifiedAt: time,
    bodyModifiedSource: 'auto',
    emotion: 0,
    eventsData: JSON.stringify(data),
    time: time,
    vote: 0,
  });
  return {
    tags: [],
    type,
    body: response,
    bodyModifiedAt: time,
    bodyModifiedSource: 'auto',
    emotion: 0,
    eventsData: data,
    time: time,
    vote: 0,
  };
};

const generateMemories = async ({data, date}) => {
  console.log('Generate Memories');
  var {locations, events, photosGroups} = data;

  var newMemories = [];

  //Generate Location Memories
  // setLoadingMessage('Creating Location Memories');
  console.log({locations});
  // await Promise.all(
  //   locations.map(async (location, index) => {
  //     // setLoadingMessage(
  //     //   `Creating Location Events - ${index + 1}/${locations.length}`,
  //     // );
  //     var newLocationMemory = await generateGenericMemory({
  //       data: location,
  //       type: EventTypes.LOCATION,
  //       time: location.time,
  //     });
  //     newMemories.push(newLocationMemory);
  //   }),
  // );

  // const uniqueLocations = locations.reduce(
  //   (acc, obj) => {
  //     const attrValue = getBestLocationTag(
  //       obj.description?.split('@')[0] || undefined,
  //     );
  //     if (!acc[attrValue]) {
  //       acc[attrValue] = true;

  //       acc.resultArray.push(obj);
  //     }
  //     return acc;
  //   },
  //   {resultArray: []},
  // ).resultArray;

  const uniqueLocations = locations;
  const uniqueLocationDepartures = uniqueLocations.filter(
    uniqueLocation => uniqueLocation.end === null,
  );
  await Promise.allSettled(
    //The reduce functions acts as a way to only use location events that have a unique address to prevent several similar memories being generated

    uniqueLocations.map(async (location, index) => {
      // setLoadingMessage(
      //   `Creating Location Events - ${index + 1}/${locations.length}`,
      // );
      console.log('TEST LOCATION', {location});
      if (location.end === null) {
        // console.log('NO END', {location});
        const test = await retrievePreviousVisitWithDeparture(location.id);
        if (test.length > 0) {
          const previousLocation = test[0];
          const routePoints = await retrieveRoutePointsForVisitData(
            previousLocation.end,
            location.start,
          );
          console.log('NO END', {location, test, routePoints});
          const route = {
            start: previousLocation,
            end: location,
            points: routePoints,
          };
          console.log('I HAVE A ROUTE', {route});
          var newRouteMemory = await generateGenericMemory({
            data: route,
            type: EventTypes.LOCATION_ROUTE,
            time: route.end.start,
          });
          newMemories.push(newRouteMemory);
        }
        var newLocationMemory = await generateGenericMemory({
          data: location,
          type: EventTypes.LOCATION,
          time: location.end,
        });
        newMemories.push(newLocationMemory);
      }
    }),
  ).then(async () => {
    console.log('location finished');
    console.log({events});
    await Promise.allSettled(
      events.map(async (event, index) => {
        // setLoadingMessage(
        //   `Creating Calendar Event Memories - ${index + 1}/${events.length}`,
        // );
        var newCalendarMemory = await generateGenericMemory({
          data: event,
          type: EventTypes.CALENDAR_EVENT,
          time: parseInt(event.end) * 1000,
        });
        newMemories.push(newCalendarMemory);
      }),
    ).then(async () => {
      console.log('event finished');
      console.log({photosGroups});
      try {
        await Promise.allSettled(
          photosGroups.map(async (photoGroup, index) => {
            try {
              if (photoGroup.length > 1) {
                var newPhotoGroupMemory = await generateGenericMemory({
                  data: photoGroup,
                  type: EventTypes.PHOTO_GROUP,
                  time: photoGroup[0].creation,
                });
                newMemories.push(newPhotoGroupMemory);
              } else {
                var newPhotoMemory = await generateGenericMemory({
                  data: photoGroup[0],
                  type: EventTypes.PHOTO,
                  time: photoGroup[0].creation,
                });
                newMemories.push(newPhotoMemory);
              }
            } catch (e) {
              console.error(e);
            }
          }),
        );
      } catch (e) {
        console.error('photosGroups error', e);
      } finally {
        console.log('photosGroups finished');
      }
    });
  });

  // console.log('promise check', a);

  //Generate Calendar Events Memories
  // setLoadingMessage('Creating Calendar Event Memories');

  //Generate Calendar Events Memories
  // setLoadingMessage('Creating Photos Memories');

  return newMemories;
};

export default generateMemories;
