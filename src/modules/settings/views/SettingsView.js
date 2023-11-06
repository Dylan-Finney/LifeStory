import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  Text,
  View,
  Alert,
  NativeModules,
  NativeEventEmitter,
  ScrollView,
  Modal,
  Touchable,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import useDatabaseHooks from '../../../utils/hooks/useDatabaseHooks';
import AppContext from '../../../contexts/AppContext';
import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';
import {theme} from '../../../theme/styling';
import notifee from '@notifee/react-native';
// var langmap = require('langmap');

export default SettingsView = ({route, navigation}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalScreen, setModalScreen] = useState('');
  const [photos, setPhotos] = useState([]);
  const [startPhotosDate, setStartPhotosDate] = useState(0);
  const [endPhotosDate, setEndPhotosDate] = useState(0);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const {setOnBoarding, devMode, setDevMode} = useContext(AppContext);

  const [includeDownloadedPhotos, setIncludeDownloadedPhotos] = useState(
    useSettingsHooks.getBoolean('settings.includeDownloadedPhotos'),
  );
  const [analyzePhotos, setAnalyzePhotos] = useState(
    useSettingsHooks.getBoolean('settings.photoAnalysis'),
  );

  const {
    deleteTable,
    createEntryTable,
    createVisitsTable,
    resetTable,
    retrieveSpecificData,
  } = useDatabaseHooks();
  // const {
  //   setOnBoarding,
  //   calendars,
  //   setCalendars,
  //   photoAnalysis,
  //   setPhotoAnalysis,
  //   includeDownloadedPhotos,
  //   setIncludeDownloadedPhotos,
  //   language,
  //   setLanguage,
  //   globalWritingSettings,
  //   setGlobalWritingSettings,
  // } = useSettingsHooks();
  // useSettingsHooks;
  const [tempLanguage, setTempLanguage] = useState(
    useSettingsHooks.getString('settings.language'),
  );
  const [tempWritingSettings, setTempWritingSettings] = useState(
    JSON.parse(useSettingsHooks.getString('settings.globalWritingSettings')),
  );
  const CalendarEvents = new NativeEventEmitter(NativeModules.Location);

  const {setEntries} = useContext(AppContext);

  const Divider = ({title}) => {
    return (
      <>
        <Text
          allowFontScaling={false}
          style={{
            fontWeight: 700,
            color: theme.general.strongText,
            marginTop: 10,
          }}>
          {title}
        </Text>
        <View
          style={{
            width: '50%',
            height: 1,
            backgroundColor: theme.home.createEntryBorder,
          }}
        />
      </>
    );
  };
  // var languages = Object.keys(langmap).map(langCode => {
  //   return {
  //     code: langCode,
  //     ...langmap[langCode],
  //   };
  // });
  var languages = [
    {englishName: 'Albanian', nativeName: 'Shqip'},
    {englishName: 'Arabic', nativeName: 'العربية'},
    {englishName: 'Armenian', nativeName: 'Հայերեն'},
    {englishName: 'Awadhi', nativeName: 'अवधी'},
    {englishName: 'Azerbaijani', nativeName: 'Azərbaycanca'},
    {englishName: 'Bashkir', nativeName: 'Башҡорт'},
    {englishName: 'Basque', nativeName: 'Euskara'},
    {englishName: 'Belarusian', nativeName: 'Беларуская'},
    {englishName: 'Bengali', nativeName: 'বাংলা'},
    {englishName: 'Bhojpuri', nativeName: 'भोजपुरी'},
    {englishName: 'Bosnian', nativeName: 'Bosanski'},
    {englishName: 'Brazilian Portuguese', nativeName: 'português brasileiro'},
    {englishName: 'Bulgarian', nativeName: 'български'},
    {englishName: 'Cantonese (Yue)', nativeName: '粵語'},
    {englishName: 'Catalan', nativeName: 'Català'},
    {englishName: 'Chhattisgarhi', nativeName: 'छत्तीसगढ़ी'},
    {englishName: 'Chinese', nativeName: '中文'},
    {englishName: 'Croatian', nativeName: 'Hrvatski'},
    {englishName: 'Czech', nativeName: 'Čeština'},
    {englishName: 'Danish', nativeName: 'Dansk'},
    {englishName: 'Dogri', nativeName: 'डोगरी'},
    {englishName: 'Dutch', nativeName: 'Nederlands'},
    {englishName: 'English', nativeName: 'English'},
    {englishName: 'Estonian', nativeName: 'Eesti'},
    ,
    {englishName: 'Faroese', nativeName: 'Føroyskt'},
    {englishName: 'Finnish', nativeName: 'Suomi'},
    {englishName: 'French', nativeName: 'Français'},
    {englishName: 'Galician', nativeName: 'Galego'},
    {englishName: 'Georgian', nativeName: 'ქართული'},
    {englishName: 'German', nativeName: 'Deutsch'},
    {englishName: 'Greek', nativeName: 'Ελληνικά'},
    {englishName: 'Gujarati', nativeName: 'ગુજરાતી'},
    {englishName: 'Haryanvi', nativeName: 'हरियाणवी'},
    {englishName: 'Hindi', nativeName: 'हिंदी'},
    {englishName: 'Hungarian', nativeName: 'Magyar'},
    {englishName: 'Indonesian', nativeName: 'Bahasa Indonesia'},
    {englishName: 'Irish', nativeName: 'Gaeilge'},
    {englishName: 'Italian', nativeName: 'Italiano'},
    {englishName: 'Japanese', nativeName: '日本語'},
    {englishName: 'Javanese', nativeName: 'Basa Jawa'},
    {englishName: 'Kannada', nativeName: 'ಕನ್ನಡ'},
    {englishName: 'Kashmiri', nativeName: 'कश्मीरी'},
    {englishName: 'Kazakh', nativeName: 'Қазақша'},
    {englishName: 'Konkani', nativeName: 'कोंकणी'},
    {englishName: 'Korean', nativeName: '한국어'},
    {englishName: 'Kyrgyz', nativeName: 'Кыргызча'},
    {englishName: 'Latvian', nativeName: 'Latviešu'},
    {englishName: 'Lithuanian', nativeName: 'Lietuvių'},
    {englishName: 'Macedonian', nativeName: 'Македонски'},
    {englishName: 'Maithili', nativeName: 'मैथिली'},
    {englishName: 'Malay', nativeName: 'Bahasa Melayu'},
    {englishName: 'Maltese', nativeName: 'Malti'},
    {englishName: 'Mandarin', nativeName: '普通话'},
    {englishName: 'Mandarin Chinese', nativeName: '中文'},
    {englishName: 'Marathi', nativeName: 'मराठी'},
    {englishName: 'Marwari', nativeName: 'मारवाड़ी'},
    {englishName: 'Min Nan', nativeName: '閩南語'},
    {englishName: 'Moldovan', nativeName: 'Moldovenească'},
    {englishName: 'Mongolian', nativeName: 'Монгол'},
    {englishName: 'Montenegrin', nativeName: 'Crnogorski'},
    {englishName: 'Nepali', nativeName: 'नेपाली'},
    {englishName: 'Norwegian', nativeName: 'Norsk'},
    {englishName: 'Oriya', nativeName: 'ଓଡ଼ିଆ'},
    {englishName: 'Pashto', nativeName: 'پښتو'},
    {englishName: 'Persian (Farsi)', nativeName: 'فارسی'},
    {englishName: 'Polish', nativeName: 'Polski'},
    {englishName: 'Portuguese', nativeName: 'Português'},
    {englishName: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ'},
    {englishName: 'Rajasthani', nativeName: 'राजस्थानी'},
    {englishName: 'Romanian', nativeName: 'Română'},
    {englishName: 'Russian', nativeName: 'Русский'},
    {englishName: 'Sanskrit', nativeName: 'संस्कृतम्'},
    {englishName: 'Santali', nativeName: 'संताली'},
    {englishName: 'Serbian', nativeName: 'Српски'},
    {englishName: 'Sindhi', nativeName: 'سنڌي'},
    {englishName: 'Sinhala', nativeName: 'සිංහල'},
    {englishName: 'Slovak', nativeName: 'Slovenčina'},
    {englishName: 'Slovene', nativeName: 'Slovenščina'},
    {englishName: 'Slovenian', nativeName: 'Slovenščina'},
    {englishName: 'Spanish', nativeName: 'Slovenščina'},
    {englishName: 'Swahili', nativeName: 'Slovenščina'},
    {englishName: 'Swedish', nativeName: 'Slovenščina'},
    {englishName: 'Tajik', nativeName: 'Slovenščina'},
    {englishName: 'Tamil', nativeName: 'Slovenščina'},
    {englishName: 'Tatar', nativeName: 'Slovenščina'},
    {englishName: 'Telugu', nativeName: 'Slovenščina'},
    {englishName: 'Thai', nativeName: 'Slovenščina'},
    {englishName: 'Turkish', nativeName: 'Slovenščina'},
    {englishName: 'Turkmen', nativeName: 'Slovenščina'},
    {englishName: 'Ukrainian', nativeName: 'Українська'},
    {englishName: 'Urdu', nativeName: 'اردو'},
    {englishName: 'Uzbek', nativeName: 'Ўзбек'},
    {englishName: 'Vietnamese', nativeName: 'Việt Nam'},
    {englishName: 'Welsh', nativeName: 'Cymraeg'},
    {englishName: 'Wu', nativeName: '吴语'},
  ].sort((a, b) => a.englishName.localeCompare(b.englishName));
  return (
    <ScrollView
      contentContainerStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: verticalScale(10),
        flexGrow: 1,
      }}>
      <Modal
        visible={modalVisible}
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setModalVisible(false);
        }}
        animationType="slide">
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            // padding: 10,
            paddingHorizontal: horizontalScale(10),
            paddingVertical: verticalScale(10),
            // backgroundColor: 'black',
          }}>
          <Text
            allowFontScaling={false}
            onPress={() => {
              setModalVisible(false);
            }}>
            Cancel
          </Text>
          <Text
            allowFontScaling={false}
            style={{fontSize: moderateScale(20), fontWeight: 600}}>
            {modalScreen === 'language' && 'Set Languages'}
            {modalScreen === 'writing' && 'Writings Settings'}
          </Text>
          <Text
            allowFontScaling={false}
            onPress={() => {
              switch (modalScreen) {
                case 'language':
                  useSettingsHooks.set('settings.language', tempLanguage);
                  break;
                case 'writing':
                  useSettingsHooks.set(
                    'settings.globalWritingSettings',
                    JSON.stringify(tempWritingSettings),
                  );
                  break;
              }

              setModalVisible(false);
            }}
            disabled={
              (modalScreen === 'language' &&
                useSettingsHooks.getString('settings.language') ===
                  tempLanguage) ||
              (modalScreen === 'writing' &&
                (JSON.parse(
                  useSettingsHooks.getString('settings.globalWritingSettings'),
                ) === tempWritingSettings ||
                  tempWritingSettings.title.length > 200 ||
                  tempWritingSettings.body.length > 200 ||
                  tempWritingSettings.generate.length > 200))
            }>
            Save
          </Text>
        </View>

        <ScrollView contentContainerStyle={{padding: 10}}>
          {modalScreen === 'language' && (
            <>
              {languages.map((lang, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setTempLanguage(lang.englishName);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignContent: 'center',
                  }}>
                  <View style={{display: 'flex', flexDirection: 'column'}}>
                    <Text
                      allowFontScaling={false}
                      style={{
                        color: theme.general.strongText,
                        fontWeight: 600,
                        fontSize: 18,
                      }}>
                      {lang.englishName}
                    </Text>
                    <Text
                      allowFontScaling={false}
                      style={{color: theme.general.timeText, fontSize: 16}}>
                      {lang.nativeName}
                    </Text>
                  </View>
                  <View
                    style={{
                      marginLeft: 'auto',
                      width: 20,
                      height: 20,
                      backgroundColor:
                        lang.englishName !== tempLanguage ? 'white' : 'gray',
                      borderRadius: 20,
                      borderBlockColor: 'black',
                      borderWidth: 2,
                      alignSelf: 'center',
                    }}
                  />
                </TouchableOpacity>
              ))}
            </>
          )}
          {modalScreen === 'writing' && (
            <>
              <Text allowFontScaling={false}>
                These settings allow you to append to the prompts that are used
                in LifeStory for greater customization and power over your data.
              </Text>
              <View>
                <Text allowFontScaling={false}>Generate</Text>
                <TextInput
                  allowFontScaling={false}
                  multiline
                  value={tempWritingSettings.generate}
                  onChangeText={text => {
                    if (text.length <= 200) {
                      setTempWritingSettings({
                        ...tempWritingSettings,
                        generate: text,
                      });
                    }
                  }}
                />
                <Text allowFontScaling={false}>
                  {tempWritingSettings.generate.length}/200
                </Text>
                <Text allowFontScaling={false}>Title Rewrite</Text>
                <TextInput
                  allowFontScaling={false}
                  multiline
                  value={tempWritingSettings.title}
                  onChangeText={text => {
                    if (text.length <= 200) {
                      setTempWritingSettings({
                        ...tempWritingSettings,
                        title: text,
                      });
                    }
                  }}
                />
                <Text allowFontScaling={false}>
                  {tempWritingSettings.title.length}/200
                </Text>
                <Text allowFontScaling={false}>Body Rewrite</Text>
                <TextInput
                  allowFontScaling={false}
                  multiline
                  value={tempWritingSettings.body}
                  onChangeText={text => {
                    if (text.length <= 200) {
                      setTempWritingSettings({
                        ...tempWritingSettings,
                        body: text,
                      });
                    }
                  }}
                />
                <Text allowFontScaling={false}>
                  {tempWritingSettings.body.length}/200
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </Modal>
      <Text>
        Selected Entry Creation Time:{' '}
        {useSettingsHooks.getNumber('settings.createEntryTime')}
      </Text>
      <Divider title={'Prompt'} />
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          setTempLanguage(useSettingsHooks.getString('settings.language'));
          setModalScreen('language');
          setModalVisible(true);
        }}>
        Set Language
      </Text>
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          setTempWritingSettings(
            JSON.parse(
              useSettingsHooks.getString('settings.globalWritingSettings'),
            ),
          );
          setModalScreen('writing');
          setModalVisible(true);
        }}>
        Writing Profile
      </Text>
      <Divider title={'Photo'} />
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          if (analyzePhotos === true) {
            Alert.alert(
              'Warning!',
              'Photos taken from the camera will not be analyzed and, as such, no descriptions can be generated about them.\nDo you wish to proceed?',
              [
                {
                  text: 'Confirm',
                  style: 'default',
                  onPress: () => {
                    // setPhotoAnalysis(false);
                    setAnalyzePhotos(false);
                    useSettingsHooks.set('settings.photoAnalysis', false);
                  },
                },
                {text: 'Cancel', style: 'cancel'},
              ],
            );
          } else {
            Alert.alert(
              'Warning!',
              'Photos taken from the camera will be sent to Amazon to be analyzed. We WILL NOT store these photos.\nDo you wish to proceed?',

              [
                {
                  text: 'Confirm',
                  style: 'default',
                  onPress: () => {
                    setAnalyzePhotos(true);
                    useSettingsHooks.set('settings.photoAnalysis', true);
                  },
                },
                {text: 'Cancel', style: 'cancel'},
              ],
            );
          }
        }}>
        {analyzePhotos
          ? 'Stop photos being analyzed'
          : 'Allow photos to be analyzed'}
      </Text>
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          console.log(includeDownloadedPhotos);
          if (includeDownloadedPhotos === true) {
            Alert.alert(
              'Warning!',
              'Photos downloaded or from Third Party apps will NOT be included in your entries.\nDo you wish to proceed?',
              [
                {
                  text: 'Confirm',
                  style: 'default',
                  onPress: () => {
                    setIncludeDownloadedPhotos(false);
                    useSettingsHooks.set(
                      'settings.includeDownloadedPhotos',
                      false,
                    );
                  },
                },
                {text: 'Cancel', style: 'cancel'},
              ],
            );
          } else {
            Alert.alert(
              'Warning!',
              'Photos downloaded or from Third Party apps will be included in your entries.\nDo you wish to proceed?',

              [
                {
                  text: 'Confirm',
                  style: 'default',
                  onPress: () => {
                    setIncludeDownloadedPhotos(true);
                    useSettingsHooks.set(
                      'settings.includeDownloadedPhotos',
                      true,
                    );
                    // console.log(
                    //   useSettingsHooks.getBoolean(
                    //     'settings.includeDownloadedPhotos',
                    //   ),
                    // );
                  },
                },
                {text: 'Cancel', style: 'cancel'},
              ],
            );
          }
        }}>
        {includeDownloadedPhotos
          ? 'EXCLUDE Downloaded Photos'
          : 'INCLUDE Downloaded Photos'}
      </Text>
      <Divider title={'Location'} />
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          Alert.alert(
            'Delete Location Data',
            'Are you sure you want to delete all of your LifeStory Location Data?\nThis app can only gets your data from the point it has access and starts recording it.\nThis action is irreversible.',
            [
              {
                text: 'Confirm',
                style: 'default',
                onPress: () => {
                  resetTable('Visits');
                  // createVisitsTable();
                },
              },
              {text: 'Cancel', style: 'cancel'},
            ],
          );
        }}>
        Delete Location History
      </Text>
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          navigation.navigate('Locations');
        }}>
        Add Location Aliases
      </Text>
      <Divider title={'Calendar'} />
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          NativeModules.Location.chooserOpen();
          CalendarEvents.addListener('calendarChange', event => {
            console.log('calendarChange EVENT', {event});
            if (event !== 'null') {
              // setCalendars(JSON.stringify(event));
              useSettingsHooks.set('settings.calendars', JSON.stringify(event));
            }
            CalendarEvents.removeAllListeners('calendarChange');
          });
        }}>
        Change Connected Calendars
      </Text>
      <Divider title={'Other'} />
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          setDevMode(!devMode);
        }}>
        {devMode === true ? 'Disable' : 'Enable'} Dev Mode
      </Text>
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          Alert.alert(
            'Delete Entries',
            'Are you sure you want to delete all of your entries?\nThis action is irreversible.',
            [
              {
                text: 'Confirm',
                style: 'default',
                onPress: () => {
                  resetTable('Entries');
                  // resetTable('Memories');
                  deleteTable('Entries');
                  createEntryTable();
                  // deleteTable('Memories');
                  // useSettingsHooks.set('settings.lastMemoryCheckTime', 0);
                  setEntries([]);
                },
              },
              {text: 'Cancel', style: 'cancel'},
            ],
          );
        }}>
        Delete Entries
      </Text>
      <Text
        allowFontScaling={false}
        style={{color: 'red', fontWeight: 600}}
        onPress={() => {
          Alert.alert(
            'Warning!',
            'This will reset the App to its inital state.\nAll Data associated with the App, that the App owns, will be deleted.\nThis action is irreversible.\nDo you wish to proceed?',
            [
              {
                text: 'Confirm',
                style: 'default',
                onPress: () => {
                  resetTable('Visits');
                  resetTable('Entries');
                  setEntries([]);
                  // setOnBoarding(true);
                  useSettingsHooks.set('onboarding', true);
                  setOnBoarding(true);

                  notifee.cancelAllNotifications();
                  navigation.navigate({
                    name: 'Home',
                  });
                },
              },
              {text: 'Cancel', style: 'cancel'},
            ],
          );
        }}>
        Reset All Data
      </Text>
      {devMode === true && (
        <>
          <Divider title={'Dev Mode'} />

          <Divider title={'Photos'} />
          <Text
            allowFontScaling={false}
            style={{color: 'red', fontWeight: 600}}
            onPress={async () => {
              console.log('TEST GET PHOTOS');
              var endOfUnixTime = new Date(Date.now());
              var startOfUnixTime = new Date(Date.now());
              // endOfUnixTime.setTime(endOfUnixTime.getTime() - 2000);
              startOfUnixTime.setDate(startOfUnixTime.getDate() - 1);
              setStartPhotosDate(startOfUnixTime.getTime());
              setEndPhotosDate(endOfUnixTime.getTime());
              endOfUnixTime = Math.floor(endOfUnixTime.getTime() / 1000);
              startOfUnixTime = Math.floor(startOfUnixTime.getTime() / 1000);
              NativeModules.Location.setDateRange(
                startOfUnixTime,
                endOfUnixTime,
              );
              try {
                setLoadingPhotos(true);
                var photos = await NativeModules.Location.getPhotosFromNative(
                  true,
                );

                console.log(photos);
                photos = photos.map(photo => {
                  return {
                    ...photo,
                    data: '',
                    creation: new Date(
                      parseInt(photo.creation) * 1000,
                    ).toLocaleString(),
                  };
                });
                setPhotos(photos);
                setLoadingPhotos(false);
              } catch (e) {
                setPhotos([{error: 'Try/catch error'}]);
                setLoadingPhotos(false);
              }
            }}>
            Get Photos from past day
          </Text>
          <Text
            allowFontScaling={false}
            style={{color: 'red', fontWeight: 600}}>
            Photos Data: {loadingPhotos === true && 'Loading...'}
          </Text>
          <Text>
            Start: {new Date(startPhotosDate).toLocaleString()} End:
            {new Date(endPhotosDate).toLocaleString()}
          </Text>
          {loadingPhotos === false &&
            (photos.length > 0 ? (
              photos.map((photo, index) => {
                if (photo.error !== undefined) {
                  return (
                    <View key={index}>
                      <Text allowFontScaling={false} style={{color: 'red'}}>
                        {photo.error}
                      </Text>
                    </View>
                  );
                } else {
                  return (
                    <View key={index}>
                      <Text allowFontScaling={false}>{photo.name}</Text>
                      <Text allowFontScaling={false}>{photo.creation}</Text>
                      <Text allowFontScaling={false}>{photo.description}</Text>
                    </View>
                  );
                }
              })
            ) : (
              <Text>No Photos Detected</Text>
            ))}

          <Divider title={'Calendar Events'} />
          <Text
            allowFontScaling={false}
            style={{color: 'red', fontWeight: 600}}
            onPress={async () => {
              console.log('TEST GET PHOTOS');
              var endOfUnixTime = new Date(Date.now());
              var startOfUnixTime = new Date(Date.now());
              // endOfUnixTime.setTime(endOfUnixTime.getTime() - 2000);
              startOfUnixTime.setDate(startOfUnixTime.getDate() - 1);
              setStartPhotosDate(startOfUnixTime.getTime());
              setEndPhotosDate(endOfUnixTime.getTime());
              endOfUnixTime = Math.floor(endOfUnixTime.getTime() / 1000);
              startOfUnixTime = Math.floor(startOfUnixTime.getTime() / 1000);
              NativeModules.Location.setDateRange(
                startOfUnixTime,
                endOfUnixTime,
              );
              try {
                setLoadingEvents(true);

                var events = await NativeModules.Location.getCalendarEvents(
                  startOfUnixTime,
                  endOfUnixTime,
                );

                console.log(events);
                events = events.map(event => {
                  return {
                    ...event,
                    // data: '',
                    // creation: new Date(
                    //   parseInt(photo.creation) * 1000,
                    // ).toLocaleString(),
                  };
                });
                setEvents(events);
                setLoadingEvents(false);
              } catch (e) {
                setEvents([{error: 'Try/catch error'}]);
                setLoadingEvents(false);
              }
            }}>
            Get Events from past day
          </Text>
          <Text
            allowFontScaling={false}
            style={{color: 'red', fontWeight: 600}}>
            Events Data: {loadingEvents === true && 'Loading...'}
          </Text>
          <Text>
            Start: {new Date(startPhotosDate).toLocaleString()} End:
            {new Date(endPhotosDate).toLocaleString()}
          </Text>
          {loadingEvents === false &&
            (events.length > 0 ? (
              events.map((event, index) => {
                if (event.error !== undefined) {
                  return (
                    <View key={index}>
                      <Text allowFontScaling={false} style={{color: 'red'}}>
                        {event.error}
                      </Text>
                    </View>
                  );
                } else {
                  return (
                    <View key={index}>
                      <Text allowFontScaling={false}>{event.title}</Text>
                      <Text allowFontScaling={false}>
                        {new Date(
                          parseInt(event.start) * 1000,
                        ).toLocaleString()}
                      </Text>
                      <Text allowFontScaling={false}>
                        {new Date(parseInt(event.end) * 1000).toLocaleString()}
                      </Text>
                      <Text allowFontScaling={false}>{event.calendar}</Text>
                    </View>
                  );
                }
              })
            ) : (
              <Text>No Events Detected</Text>
            ))}

          <Divider title={'Locations'} />
          <Text
            allowFontScaling={false}
            style={{color: 'red', fontWeight: 600}}
            onPress={async () => {
              console.log('TEST GET PHOTOS');
              var endOfUnixTime = new Date(Date.now());
              var startOfUnixTime = new Date(Date.now());
              // endOfUnixTime.setTime(endOfUnixTime.getTime() - 2000);
              startOfUnixTime.setDate(startOfUnixTime.getDate() - 1);
              setStartPhotosDate(startOfUnixTime.getTime());
              setEndPhotosDate(endOfUnixTime.getTime());
              endOfUnixTime = Math.floor(endOfUnixTime.getTime());
              startOfUnixTime = Math.floor(startOfUnixTime.getTime());
              try {
                setLoadingLocations(true);
                var locations = [];
                retrieveSpecificData(startOfUnixTime, endOfUnixTime, res => {
                  (locations = res.map(obj => {
                    return {
                      description: obj.description.split(',')[0],
                      time: obj.date,
                      lat: obj.lat,
                      long: obj.lon,
                    };
                  })),
                    console.log(locations);
                  setLocations(locations);
                  setLoadingLocations(false);
                });
              } catch (e) {
                setLocations([{error: 'Try/catch error'}]);
                setLoadingLocations(false);
              }
            }}>
            Get Locations from past day
          </Text>
          <Text
            allowFontScaling={false}
            style={{color: 'red', fontWeight: 600}}>
            Locations Data: {loadingLocations === true && 'Loading...'}
          </Text>
          <Text>
            Start: {new Date(startPhotosDate).toLocaleString()} End:
            {new Date(endPhotosDate).toLocaleString()}
          </Text>
          {loadingLocations === false &&
            (locations.length > 0 ? (
              locations.map((location, index) => {
                if (location.error !== undefined) {
                  return (
                    <View key={index}>
                      <Text allowFontScaling={false} style={{color: 'red'}}>
                        {location.error}
                      </Text>
                    </View>
                  );
                } else {
                  return (
                    <View key={index}>
                      <Text allowFontScaling={false}>
                        {new Date(location.time).toLocaleString()}
                      </Text>
                      <Text allowFontScaling={false}>
                        {location.description}
                      </Text>
                      <Text allowFontScaling={false}>Lat: {location.lat}</Text>
                      <Text allowFontScaling={false}>
                        Long: {location.long}
                      </Text>
                    </View>
                  );
                }
              })
            ) : (
              <Text>No Locations Detected</Text>
            ))}
        </>
      )}
    </ScrollView>
  );
};
