import {MMKVLoader, useMMKVStorage} from 'react-native-mmkv-storage';
const settingsStorage = new MMKVLoader()
  .withInstanceID('settings')
  .initialize();
const useSettingsHooks = () => {
  const [onBoarding, setOnBoarding] = useMMKVStorage(
    'onboarding',
    settingsStorage,
    true,
  );
  const [calendars, setCalendars] = useMMKVStorage(
    'calendars',
    settingsStorage,
    '[]',
  );

  return {
    onBoarding,
    setOnBoarding,
    calendars,
    setCalendars,
  };
};

export default useSettingsHooks;
