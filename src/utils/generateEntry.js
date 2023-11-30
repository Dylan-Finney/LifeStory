import useDatabaseHooks from './hooks/useDatabaseHooks';
import useSettingsHooks from './hooks/useSettingsHooks';
import Config from 'react-native-config';
import moment from 'moment';
import {EventTypes} from './Enums';
import {TimeCategory} from './TimeCategory';
import getBestLocationTag from './getBestLocationTag';
import getMemories from './getMemories';
const {Configuration, OpenAIApi} = require('openai');
const configuration = new Configuration({
  apiKey: Config.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const {
  retrieveSpecificData,
  saveEntryData,
  retrieveLastVisit,
  updateEntryData,
  createEntryTable,
  createMemoriesTable,
  saveMemoryData,
} = useDatabaseHooks();

const processTitle = text => {
  if (text.charAt(0) === '"' || text.charAt(0) === "'") {
    return text.substring(1, text.length - 1);
  } else {
    return text;
  }
};

export default generateEntry = async ({
  memories = [],
  showAsYesterday = false,
}) => {
  if (memories.length === 0) {
    memories = await getMemories();
  }
  var end = new Date(Date.now());
  end.setHours(useSettingsHooks.getNumber('settings.createEntryTime'));
  end.setMinutes(0);
  end.setSeconds(0);
  end.setMilliseconds(0);
  var start = new Date(end);
  start.setDate(end.getDate() - 1);
  start.setMilliseconds(1);
  var memoriesFiltered = memories
    .filter(
      memory => memory.time >= start.getTime() && memory.time <= end.getTime(),
    )
    .sort((a, b) => b.time - a.time);
  const TimeCategoryKeys = Object.keys(TimeCategory);
  // generateEntry2({memories: memoriesFiltered});
  var regex =
    /(\d{1,2}:\d{2}(?::\d{2})?(?:[ap]m)?|\d{1,2}(?::\d{2})?[ap]m)(?![\w\d])/gi;

  // if (memoriesFiltered.length > 0) {
  //   var test = Object.assign({}, memoriesFiltered[0]);
  //   test.body = 'I visted  and took a photo of the door.';
  //   var time = new Date(test.time);
  //   time.setDate(time.getDate() - 1);
  //   time.setHours(16);
  //   test.time = time.getTime();
  //   memoriesFiltered.push(test);
  // }

  memoriesFiltered = memoriesFiltered.map(memory => {
    var Category = '';
    var hour = new Date(memory.time).getHours();
    var bodyWithoutTime = memory.body.replaceAll(regex, '');

    TimeCategoryKeys.map(TimeCategoryKey => {
      if (
        (TimeCategory[TimeCategoryKey].start <= hour &&
          TimeCategory[TimeCategoryKey].end > hour) ||
        (TimeCategory[TimeCategoryKey].start >
          TimeCategory[TimeCategoryKey].end &&
          (TimeCategory[TimeCategoryKey].start <= hour ||
            TimeCategory[TimeCategoryKey].end > hour))
      ) {
        Category = TimeCategoryKey;
      }
    });
    return {
      ...memory,
      timeCat: Category,
      body: bodyWithoutTime,
    };
  });

  console.log('memories used for generating new Story', memoriesFiltered);
  var string = '####';
  // memoriesFiltered.map(memory => {
  //   string += memory.body + '\n---\n';
  // });
  TimeCategoryKeys.map(TimeCategoryKey => {
    var memoriesFilteredForCategory = memoriesFiltered.filter(
      memory => memory.timeCat === TimeCategoryKey,
    );
    if (memoriesFilteredForCategory.length > 0) {
      string += `\n---${TimeCategoryKey}---\n---`;
      memoriesFilteredForCategory.map(memory => {
        string += '\n' + memory.body + '\n---';
      });
    }
  });
  var memoriesFilteredForLocations = memoriesFiltered.filter(
    memory => memory.type === EventTypes.LOCATION,
  );
  console.log({memoriesFilteredForLocations});
  if (memoriesFilteredForLocations.length === 0) {
    //Find Last Arrvied At Location
    try {
      console.log('lastVisitRecord');
      const lastVisitRecord = await retrieveLastVisit();
      console.log({lastVisitRecord});
      if (lastVisitRecord.length > 0) {
        string += '\n---All-Day--';
        string += `\nI spent the day at ${getBestLocationTag(
          lastVisitRecord[0].description.split(',')[0],
        )}`;
        string += `\n---`;
      }
    } catch (e) {
      console.error(e);
    }
  }
  string += '\n#####';
  console.log(string);
  const ids = memoriesFiltered.map(memory => memory.id);

  console.log(ids);
  var body = 'No Events Found';
  var title = 'New Entry';
  // if (ids.length > 0) {
  try {
    const completionBody = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-1106',
      max_tokens: 1000,
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: `You are a diary writer. I will give a series of "memories", descriptions of events that happened today, and I want you to generate a diary entry based on this. Keep the entry concise and stick to the facts given. The purpose of this is to have a concise summary of what happened during today. In an order that most makes sense, e.g. chronological. Not not hallucinate details that have not been provided, stick to what I know/said. There is no need for "Dear Diary" or "[Your Name]". 

Condense/group events where possible based on time. E.g. I took 2 photos. 

List of ALWAYS:
- write in first person
- use morning
- use "morning", "noon, "afternoon", "evening", or "night" to indicate the time of the event instead of the time itself.
- Join subsequent events by using: 'then', 'later',  etc
- write in prose

Never output contact details (emails or phone numbers). Make these anonymous or assume a name.

THESE INSTRUCTIONS ARE RELEVANT IN ALL CASES.`,
        },
        {role: 'user', content: `${string}`},
      ],
    });
    console.log({completionBody});
    const responseBody = completionBody.data.choices[0].message?.content;
    console.log(responseBody);
    body = responseBody;
  } catch (e) {
    console.error('story body', e);
    body = `${e}`;
  }

  try {
    const completionTitle = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-16k',
      max_tokens: 100,
      temperature: 1,
      messages: [
        {
          role: 'system',
          content: `Your role is to write a text entry title for a set of memories tht are shown in context of your text, based on the data provided and following these instructions:
          
          1. Write in first person
          2. Focus of the title should be based on the vote of the memory. Higher vote, more focus.
          
          ---`,
        },
        {
          role: 'user',
          content: `[
          ${memoriesFiltered.map(
            memory => `{text: "${memory.body}", vote: "${memory.vote}"}`,
          )}
        ]`,
        },
      ],
    });
    console.log({completionTitle});
    const responseTitle = processTitle(
      completionTitle.data.choices[0].message?.content,
    );
    console.log(responseTitle);
    title = responseTitle;
    console.log(title);
  } catch (e) {
    console.error('story title', e);
    title = `${e}`;
  }

  // }
  var id = -1;
  try {
    console.log('try');
    id = await saveEntryData({
      tags: JSON.stringify({
        roles: [],
        modes: [],
        other: [],
      }),
      title,
      time: Date.now(),
      emotion: -1,
      vote: 0,
      titleModifiedAt: Date.now(),
      titleModifiedSource: 'auto',
      bodyModifiedAt: Date.now(),
      bodyModifiedSource: 'auto',
      events: JSON.stringify(ids),
      showAsYesterday: showAsYesterday === true ? 1 : 0,
      body,
    });
    id = id.insertId;
    console.log('try end');
  } catch (e) {
    console.error({e});
  }

  return {
    tags: {
      roles: [],
      modes: [],
      other: [],
    },
    title,
    time: Date.now(),
    emotion: -1,
    vote: 0,
    titleModifiedAt: Date.now(),
    titleModifiedSource: 'auto',
    bodyModifiedAt: Date.now(),
    bodyModifiedSource: 'auto',
    events: ids.length === 0 ? [] : ids,
    body,
    generated: 1,
    showAsYesterday,
    id,
  };
};
