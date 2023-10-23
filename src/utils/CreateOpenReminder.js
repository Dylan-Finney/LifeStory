import notifee, {TriggerType, RepeatFrequency} from '@notifee/react-native';
// import useSettingsHooks from '../../useSettingsHooks';

export default async function onCreateTriggerReminder({remindTime}) {
  const date = new Date(Date.now());
  if (date.getHours() >= remindTime) {
    date.setDate(date.getDate() + 1);
  }
  date.setHours(remindTime);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  //   date.setSeconds(date.getSeconds() + 10);
  // Create a time-based trigger
  const trigger = {
    type: TriggerType.TIMESTAMP,
    // timestamp: Date.now() + 5000,
    timestamp: date.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  await notifee.requestPermission();
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  var messageBody;

  switch (remindTime) {
    case 8:
      messageBody = 'Open for Morning Memories';
      break;
    case 15:
      messageBody = 'Open for Afternoon Memories';
      break;
    case 22:
      messageBody = 'Open for Evening Memories';
      break;
  }

  const id = `lifestory.reminder.${remindTime}`;
  // Create a trigger notification
  const ids = await notifee.getTriggerNotificationIds();

  if (!ids.includes(id)) {
    await notifee.createTriggerNotification(
      {
        id: `lifestory.reminder.${remindTime}`,
        title: '✨ LifeStory AI',
        ios: {badgeCount: (await notifee.getBadgeCount()) + 1},
        body: messageBody,
        android: {
          channelId,
        },
      },
      trigger,
    );
  }

  // await notifee.incrementBadgeCount();
}
