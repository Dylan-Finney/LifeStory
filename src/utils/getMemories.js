import useDatabaseHooks from './hooks/useDatabaseHooks';
import {EventTypes} from './Enums';
import getFormatedTimeString from './getFormattedTimeString';
const {createVisitsTable, insertData, retrieveData} = useDatabaseHooks();

const formatTime = ({localMemory}) => {
  switch (parseInt(localMemory.type)) {
    case EventTypes.CALENDAR_EVENT:
      return getFormatedTimeString(
        parseInt(JSON.parse(localMemory.eventsData).start) * 1000,
        parseInt(JSON.parse(localMemory.eventsData).end) * 1000,
      );
    case EventTypes.LOCATION_ROUTE:
      return getFormatedTimeString(
        parseInt(JSON.parse(localMemory.eventsData).start.end),
        parseInt(JSON.parse(localMemory.eventsData).end.start),
      );
    case EventTypes.LOCATION:
      var eventsData = JSON.parse(localMemory.eventsData);
      if (eventsData.start === undefined) {
        return getFormatedTimeString(parseInt(localMemory.time));
      }
      if (eventsData.end === null) {
        return getFormatedTimeString(
          parseInt(JSON.parse(localMemory.eventsData).start),
        );
      }
      return getFormatedTimeString(
        parseInt(JSON.parse(localMemory.eventsData).start),
        parseInt(JSON.parse(localMemory.eventsData).end),
      );
    case EventTypes.PHOTO_GROUP:
      var eventsData = JSON.parse(localMemory.eventsData);
      return getFormatedTimeString(
        parseInt(eventsData[0].creation),
        parseInt(eventsData[eventsData.length - 1].creation),
      );
    default:
      return getFormatedTimeString(parseInt(localMemory.time));
  }
};

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
          tags: JSON.parse(localMemory.tags),
          // body: localMemory,
          bodyModifiedAt: parseInt(localMemory.bodyModifiedAt),
          emotion: parseInt(localMemory.emotion),
          eventsData: JSON.parse(localMemory.eventsData),
          time: parseInt(localMemory.time),
          formattedTime: formatTime({localMemory}),
          vote: parseInt(localMemory.vote),
        };
      })
      .sort((a, b) => {
        if (b.time > a.time) {
          return 1;
        } else if (b.time < a.time) {
          return -1;
        }

        if (b.id > a.id) {
          return 1;
        } else if (b.id < a.id) {
          return -1;
        }

        return 0;
      });
    console.log({updatedMemories});
    return updatedMemories;
    // setMemories(updatedMemories);
    // setEntries(updatedEntries);
    // setLoadingEntries(false);
  } catch (e) {
    console.error('get memory error', e);
    return [];
  }
};

export default getMemories;
