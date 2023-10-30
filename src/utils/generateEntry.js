import useDatabaseHooks from './hooks/useDatabaseHooks';
import useSettingsHooks from './hooks/useSettingsHooks';
import Config from 'react-native-config';
import moment from 'moment';
import {EventTypes} from './Enums';
import {TimeCategory} from './TimeCategory';
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

export default generateEntry = async ({
  memories = [],
  showAsYesterday = false,
}) => {
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
  string += '\n#####';
  console.log(string);
  const ids = memoriesFiltered.map(memory => memory.id);

  console.log(ids);
  var body = 'No Events Found';
  if (ids.length > 0) {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-16k',
      max_tokens: 1000,
      temperature: 1,
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

Never output contact details (emails or phone numbers). Make these anonymous or assume a name.`,
        },
        {role: 'user', content: `${string}`},
      ],
    });
    console.log({completion});

    const response = completion.data.choices[0].message?.content;
    console.log(response);
    body = response;
    console.log(body);
  }
  var id = -1;
  try {
    console.log('try');
    id = await saveEntryData({
      tags: JSON.stringify({
        roles: [],
        modes: [],
        other: [],
      }),
      title: 'New Entry',
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
    title: 'New Entry',
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
