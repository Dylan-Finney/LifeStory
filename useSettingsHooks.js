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
  };
};

export default useSettingsHooks;
