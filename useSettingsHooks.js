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
  return {
    onBoarding,
    setOnBoarding,
  };
};

export default useSettingsHooks;
