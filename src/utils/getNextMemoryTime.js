import getFormatedTimeString from './getFormattedTimeString';
import useSettingsHooks from './hooks/useSettingsHooks';

export default getNextMemoryTime = () => {
  // const now = new Date(Date.now());
  const lastMemoryCheckTime = new Date(
    useSettingsHooks.getNumber('settings.lastMemoryCheckTime'),
    // 0,
  );
  var timeStr = '';
  if (
    lastMemoryCheckTime.getHours() >= 22 ||
    lastMemoryCheckTime.getHours() < 8
  ) {
    if (lastMemoryCheckTime.getHours() >= 22) {
      lastMemoryCheckTime.setDate(lastMemoryCheckTime.getDate() + 1);
    }
    lastMemoryCheckTime.setHours(8);
    lastMemoryCheckTime.setMinutes(0);
    lastMemoryCheckTime.setSeconds(0);
    lastMemoryCheckTime.setMilliseconds(0);
    // timeStr = lastMemoryCheckTime.toLocaleString();
    timeStr = lastMemoryCheckTime.getHours();
  } else if (lastMemoryCheckTime.getHours() < 15) {
    lastMemoryCheckTime.setHours(15);
    lastMemoryCheckTime.setMinutes(0);
    lastMemoryCheckTime.setSeconds(0);
    lastMemoryCheckTime.setMilliseconds(0);
    // timeStr = lastMemoryCheckTime.toLocaleString();
    timeStr = lastMemoryCheckTime.getHours();
  } else {
    lastMemoryCheckTime.setHours(22);
    lastMemoryCheckTime.setMinutes(0);
    lastMemoryCheckTime.setSeconds(0);
    lastMemoryCheckTime.setMilliseconds(0);
    // timeStr = lastMemoryCheckTime.toLocaleString();
    timeStr = lastMemoryCheckTime.getHours();
  }

  timeStr = getFormatedTimeString(lastMemoryCheckTime.getTime());
  return timeStr;
};
