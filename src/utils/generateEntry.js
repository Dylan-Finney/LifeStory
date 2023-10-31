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

export default generateEntry = async ({memories}) => {
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
  // generateEntry2({memories: memoriesFiltered});
  console.log(memories);
  var string = 'Entries:\n---\n';
  memoriesFiltered.map(memory => {
    string += memory.body + '\n---\n';
  });
  console.log(string);
  const ids = memoriesFiltered.map(memory => memory.id);

  console.log(ids);
  var body = 'No Events Found';
  if (ids.length > 0) {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo-16k',
      max_tokens: 2048,
      messages: [
        {
          role: 'system',
          content:
            'You are a diary writer. I will give a series of "memories", descriptions of events that happened today, and I want you to generate a diary entry based on this. Keep the entry concise and stick to the facts given. The purpose of this is to have a concise summary of what happened during today. In an order that most makes sense, e.g. chronological. Not not hallucinate details that have not been provided, stick to what I know/said. There is no need for "Dear Diary" or "[Your Name]"',
        },
        {role: 'user', content: `${string}`},
      ],
    });
    const response = completion.data.choices[0].message?.content;
    body = response;
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
    id,
  };
};
