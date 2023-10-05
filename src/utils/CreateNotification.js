import notifee, {TriggerType, RepeatFrequency} from '@notifee/react-native';
// import useSettingsHooks from '../../useSettingsHooks';

export default async function onCreateTriggerNotification({
  first,
  time = null,
  createEntryTime,
}) {
  const date = new Date(Date.now());
  if (time === null) {
    if (date.getHours() >= createEntryTime) {
      date.setDate(date.getDate() + 1);
    }
    date.setHours(createEntryTime);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }
  //   date.setSeconds(date.getSeconds() + 10);
  // Create a time-based trigger
  const trigger = {
    type: TriggerType.TIMESTAMP,
    // timestamp: Date.now() + 5000,
    timestamp: time === null ? date.getTime() : time,
    // repeatFrequency: RepeatFrequency.DAILY,
  };

  await notifee.requestPermission();
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  // Create a trigger notification
  await notifee.createTriggerNotification(
    {
      title: '✨ LifeStory AI',
      ios: {badgeCount: (await notifee.getBadgeCount()) + 1},
      body:
        first === true
          ? 'Your first story is ready!'
          : 'Your new story is ready!',
      android: {
        channelId,
      },
    },
    trigger,
  );

  // await notifee.incrementBadgeCount();
}
