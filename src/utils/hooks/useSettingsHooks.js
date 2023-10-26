import {MMKV} from 'react-native-mmkv';

const storage = new MMKV();

// console.log('STORAGE', storage.getBoolean('onboarding'));

if (storage.getBoolean('onboarding') === undefined) {
  storage.set('onboarding', true);
}
if (storage.getBoolean('settings.photoAnalysis') === undefined) {
  storage.set('settings.photoAnalysis', false);
}
if (storage.getBoolean('settings.includeDownloadedPhotos') === undefined) {
  storage.set('settings.includeDownloadedPhotos', false);
}
if (storage.getString('settings.calendars') === undefined) {
  storage.set('settings.calendars', '[]');
}
if (storage.getString('settings.locationAliases') === undefined) {
  storage.set('settings.locationAliases', '[]');
}
if (storage.getNumber('settings.createEntryTime') === undefined) {
  storage.set('settings.createEntryTime', 0);
}
if (storage.getNumber('settings.lastMemoryCheckTime') === undefined) {
  storage.set('settings.lastMemoryCheckTime', 0);
}
if (storage.getNumber('settings.onboardingTime') === undefined) {
  storage.set('settings.onboardingTime', 0);
}
if (storage.getString('settings.language') === undefined) {
  storage.set('settings.language', 'English');
}
if (storage.getString('settings.globalWritingSettings') === undefined) {
  storage.set(
    'settings.globalWritingSettings',
    '{"title": "", "body": "", "generate": ""}',
  );
}

if (storage.getString('settings.customLabels') === undefined) {
  storage.set(
    'settings.customLabels',
    '{"modes": [], "roles": [], "other": []}',
  );
}

export default storage;
/*
const settingsStorage = new MMKVLoader()
  .withInstanceID('settings')
  .initialize();
const useSettingsHooks = () => {
  const [onBoarding, setOnBoarding] = useMMKVStorage(
    'onboarding',
    settingsStorage,
    true,
  );
  const [photoAnalysis, setPhotoAnalysis] = useMMKVStorage(
    'photoAnalysis',
    settingsStorage,
    false,
  );
  const [includeDownloadedPhotos, setIncludeDownloadedPhotos] = useMMKVStorage(
    'includeDownloadedPhotos',
    settingsStorage,
    false,
  );

  const [calendars, setCalendars] = useMMKVStorage(
    'calendars',
    settingsStorage,
    '[]',
  );

  const [locationAliases, setLocationAliases] = useMMKVStorage(
    'locationAliases',
    settingsStorage,
    '[]',
  );

  const [createEntryTime, setCreateEntryTime] = useMMKVStorage(
    'createEntryTime',
    settingsStorage,
    0,
  );

  const [onboardingTime, setOnboardingTime] = useMMKVStorage(
    'onboardingTime',
    settingsStorage,
    0,
  );

  const [language, setLanguage] = useMMKVStorage(
    'language',
    settingsStorage,
    'English',
  );
  const [globalWritingSettings, setGlobalWritingSettings] = useMMKVStorage(
    'writingSettings',
    settingsStorage,
    '{"title": "", "body": "", "generate": ""}',
  );

  return {
    onBoarding,
    setOnBoarding,
    calendars,
    setCalendars,
    photoAnalysis,
    setPhotoAnalysis,
    includeDownloadedPhotos,
    setIncludeDownloadedPhotos,
    locationAliases,
    setLocationAliases,
    createEntryTime,
    setCreateEntryTime,
    language,
    setLanguage,
    globalWritingSettings,
    setGlobalWritingSettings,
    onboardingTime,
    setOnboardingTime,
  };
};

export default useSettingsHooks;
*/
