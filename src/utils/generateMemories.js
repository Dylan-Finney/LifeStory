import useDatabaseHooks from './hooks/useDatabaseHooks';
import useSettingsHooks from './hooks/useSettingsHooks';
import Config from 'react-native-config';
import moment from 'moment';
import {EventTypes} from './Enums';
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
} = useDatabaseHooks();

const getAddressName = address => {
  var locationAliasesArray = JSON.parse(
    useSettingsHooks.getString('settings.locationAliases'),
  );
  var aliasObj = locationAliasesArray.find(
    locationAliasObj => locationAliasObj.address === address,
  );
  if (aliasObj !== undefined) {
    return aliasObj.alias;
  } else {
    return '';
  }
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

  switch (type) {
    case EventTypes.LOCATION:
      var address = data.description?.split(',')[0] || '';
      var alias = getAddressName(address || '');
      userPrompt = `Visited ${
        address !== ''
          ? `${alias !== '' ? alias : address}`
          : `${data.lat !== 'null' ? `Lat: ${data.lat}` : ''} ${
              data.lon !== 'null' ? `Lon: ${data.lon}` : ''
            }`
      } @${moment(data.time).format('LT')}`;
      messages = [
        {
          role: 'system',
          content: `Your role is to write text entries without titles from the data provided, based on these instructions:

1. Write in first person
2. Don’t write about things that are not described in data provided
3. Text should be written in neutral, informative and descriptive tone, while also keeping it short and to the point
4. Don’t write about ending times, rather refer to approximate duration
5. Don’t refer time as exacts but rather ‘early morning’, ‘around noon’, etc. Ie. as we would refer times in a typical conversation
6. Don’t use exact addresses, but refer to location and/or popular landmarks names. Ie. as we would refer places in a typical conversation
7. Write in past tent
8. Don't mention timezones
9. Don't mention latitude or longitude coordinates
10. Don't mention dates
11. Use up to 150 characters

-----`,
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
          content: `I spent a pleasant afternoon near Central Park, soaking in the ambiance of the area, which was alive with the hustle and bustle that's so characteristic of the place. I arrived around early afternoon and stayed for about two and a half hours, watching the city's rhythm, with joggers passing by and the distant hum of street musicians adding a lively soundtrack to the scene. It was a refreshing break from my usual routine, with the greenery of the park providing a stark contrast to the concrete jungle that surrounds it.`,
        },
        {
          role: 'user',
          content: `{
  "geoLocationStay": {
    "locationTag": "${data.description}",
    "location":
      "latitude": "${data.lat}",
      "longitude": "${data.lon}"
    },
    "time": {
      "start": "${new Date(data.time).toLocaleString()}",
    }
  }
}`,
        },
      ];
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
      data.data = '';
      var address = data.description?.split(',')[0] || '';
      var alias = address === '' ? '' : getAddressName(address);
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
    "locationTag": "${data.description}",
    "coordinates": {
      "latitude": "${data.lat}",
      "longitude": "${data.lon}"
    },
    "timeTaken": "${new Date(
      Math.floor(parseFloat(data.creation) * 1000),
    ).toLocaleString()}",
    "imageRecognitionLabels": [
      ${data.labels?.map(label => {
        return `{ "label": "${label.title}", "confidence": ${label.Confidence} },
`;
      })}
    ],
  }
}`,
        },
      ];
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
    model: 'gpt-3.5-turbo',
    temperature: 0.5,
    messages,
  });
  const response = completion.data.choices[0].message?.content;
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
  var {locations, events, photos} = data;

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

  await Promise.allSettled(
    locations.map(async (location, index) => {
      // setLoadingMessage(
      //   `Creating Location Events - ${index + 1}/${locations.length}`,
      // );
      var newLocationMemory = await generateGenericMemory({
        data: location,
        type: EventTypes.LOCATION,
        time: location.time,
      });
      newMemories.push(newLocationMemory);
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
      console.log({photos});
      await Promise.allSettled(
        photos.map(async (photo, index) => {
          // setLoadingMessage(
          //   `Creating Photos Memories - ${index + 1}/${photos.length}`,
          // );
          try {
            var newPhotoMemory = await generateGenericMemory({
              data: photo,
              type: EventTypes.PHOTO,
              time: Math.floor(parseFloat(photo.creation) * 1000),
            });
            newMemories.push(newPhotoMemory);
          } catch (e) {
            console.error(e);
          }
        }),
      ).then(() => {
        console.log('photos finished');
      });
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
