import useDatabaseHooks from '../../useDatabaseHooks';
import {EventTypes} from './Enums';
import getFormatedTimeString from './getFormattedTimeString';
const {createVisitsTable, insertData, retrieveData} = useDatabaseHooks();
const getMemories = async () => {
  try {
    console.log('LOADING MEMORIES DATA');
    const localMemories = await retrieveData('Memories');
    console.log({localMemories});
    var updatedMemories = localMemories
      .map(localMemory => {
        const time = parseInt(localMemory.time);
        const timeSection = time => {
          if (time >= 22 || time < 8) {
            return;
          } else if (time < 15) {
            return;
          } else {
            return;
          }
        };
        return {
          ...localMemory,
          type: parseInt(localMemory.type),
          tags: localMemory.tags === '' ? [] : JSON.parse(localMemory.tags),
          // body: localMemory,
          bodyModifiedAt: parseInt(localMemory.bodyModifiedAt),
          emotion: parseInt(localMemory.emotion),
          eventsData: JSON.parse(localMemory.eventsData),
          time: parseInt(localMemory.time),
          formattedTime: [EventTypes.CALENDAR_EVENT].includes(
            parseInt(localMemory.type),
          )
            ? getFormatedTimeString(
                parseInt(JSON.parse(localMemory.eventsData).start) * 1000,
                parseInt(JSON.parse(localMemory.eventsData).end) * 1000,
              )
            : getFormatedTimeString(parseInt(localMemory.time)),
          vote: parseInt(localMemory.vote),
        };
      })
      .sort((a, b) => b.time - a.time);
    console.log({updatedMemories});
    return updatedMemories;
    // setMemories(updatedMemories);
    // setEntries(updatedEntries);
    // setLoadingEntries(false);
  } catch (e) {
    console.error(e);
  }
};

export default getMemories;
