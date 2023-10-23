import useDatabaseHooks from '../../useDatabaseHooks';
import useSettingsHooks from '../../useSettingsHooks';
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
      break;
    case EventTypes.CALENDAR_EVENT:
      userPrompt = `Calendar Event: ${data.title} @${
        data.isAllDay === 'true'
          ? `All-Day`
          : `${moment(parseInt(data.start) * 1000).format('LT')}-${moment(
              parseInt(data.end) * 1000,
            ).format('LT')}`
      }`;
      break;
    case EventTypes.PHOTO:
      data.data = '';
      var address = data.description?.split(',')[0] || '';
      var alias = address === '' ? '' : getAddressName(address);
      userPrompt = `Photo Taken: ${
        data.labels !== undefined
          ? `Labels: ${data.labels.map(label => label.title).toString()}`
          : ''
      } ${
        data.description !== ''
          ? `${data.description}`
          : `${data.lat !== 'null' ? `Lat: ${data.lat}` : ''} ${
              data.long !== 'null' ? `Long: ${data.long}` : ''
            }`
      } @${moment(Math.floor(parseFloat(data.creation) * 1000)).format('LT')}`;
      break;
    default:
      break;
  }
  const completion = await openai.createChatCompletion({
    // model: 'gpt-3.5-turbo',
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {role: 'user', content: userPrompt},
    ],
  });
  const response = completion.data.choices[0].message?.content;
  console.log(response);
  createMemoriesTable();
  saveMemoryData({
    tags: '',
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
          var newPhotoMemory = await generateGenericMemory({
            data: photo,
            type: EventTypes.PHOTO,
            time: Math.floor(parseFloat(photo.creation) * 1000),
          });
          newMemories.push(newPhotoMemory);
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
