import useSettingsHooks from './hooks/useSettingsHooks';
export default isMemoryReadyToGenerate = () => {
  /*
      MEMORY GENERATION
    */
  const date = new Date(Date.now());
  const lastMemoryCheckTime = new Date(
    useSettingsHooks.getNumber('settings.lastMemoryCheckTime'),
    // 0,
  );
  //If current time between 22:00:00 and 07:59:59
  if (date.getHours() >= 22 || date.getHours() < 8) {
    // to generate 15-21:59
    //check if can
    // console.log('current time between 10:00PM and 08:00AM');

    // console.log(lastMemoryCheckTime.toLocaleString());
    const yesterday = new Date(date.getTime());
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      (date.getHours() >= 22 &&
        ((lastMemoryCheckTime.getHours() < 22 &&
          lastMemoryCheckTime.toDateString() === date.toDateString()) ||
          lastMemoryCheckTime.toDateString() !== date.toDateString())) ||
      (date.getHours() < 8 &&
        ((lastMemoryCheckTime.getHours() < 22 &&
          lastMemoryCheckTime.toDateString() === yesterday.toDateString()) ||
          (lastMemoryCheckTime.toDateString() !== date.toDateString() &&
            lastMemoryCheckTime.toDateString() !== yesterday.toDateString())))
    ) {
      return true;
    } else {
      return false;
    }
  }
  //If current time between 08:00:00 and 14:59:59
  else if (
    date.getHours() < 15 &&
    ((lastMemoryCheckTime.getHours() < 8 &&
      lastMemoryCheckTime.toDateString() === date.toDateString()) ||
      lastMemoryCheckTime.toDateString() !== date.toDateString())
  ) {
    return true;
  }
  //If current time between 15:00:00 and 21:59:59
  else if (
    date.getHours() >= 15 &&
    ((lastMemoryCheckTime.getHours() < 15 &&
      lastMemoryCheckTime.toDateString() === date.toDateString()) ||
      lastMemoryCheckTime.toDateString() !== date.toDateString())
  ) {
    return true;
  } else {
    return false;
  }
};
