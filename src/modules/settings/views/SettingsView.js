import React, {useState, useEffect, useRef, createRef, useContext} from 'react';
import {
  Text,
  View,
  NativeModules,
  NativeEventEmitter,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import useDatabaseHooks from '../../../utils/hooks/useDatabaseHooks';
import AppContext from '../../../contexts/AppContext';
import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';

import SettingsListItem from '../components/SettingsListItem';

import LanguageIcon from '../../../assets/settings/language.svg';
import AIWritingSettingsIcon from '../../../assets/settings/ai-writing-settings.svg';
import CalendarIcon from '../../../assets/settings/calendar.svg';
import PhotoIcon from '../../../assets/settings/photo.svg';
import PersonalGlossaryIcon from '../../../assets/settings/personal-glossary.svg';
import OtherIcon from '../../../assets/settings/other.svg';

import {useModal} from '../../../contexts/ModalContext';
import {MODAL_TYPES} from '../modals/modalTypes';
import LanguageModal from '../modals/LanguageModal';
import AIWritingSettingsModal from '../modals/AIWritingSettingsModal';
import PhotoModal from '../modals/PhotoModal';
import PersonalGlossaryModal from '../modals/PersonalGlossaryModal';
import CalendarModal from '../modals/CalendarModal';
import OtherModal from '../modals/OtherModal';
import {useTheme} from '../../../theme/ThemeContext';
import {baseTheme, darkTheme} from '../../../theme/theme';

// var langmap = require('langmap');

export default SettingsView = ({route, navigation}) => {
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
            color: theme.colors.primary,
            marginTop: 10,
          }}>
          {title}
        </Text>
        <View
          style={{
            width: '50%',
            height: 1,
            backgroundColor: theme.colors.primary,
          }}
        />
      </>
    );
  };

  const {modalState, setModalState} = useModal();

  const openModal = type => {
    setModalState({isVisible: true, type});
  };

  const closeModal = () => {
    setModalState({isVisible: false, type: null});
  };

  const {theme, setTheme} = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === baseTheme ? darkTheme : baseTheme;
    setTheme(newTheme);
  };

  console.log('theme', theme);

  return (
    <ScrollView
      contentContainerStyle={{
        display: 'flex',
        paddingTop: 27,
        alignItems: 'center',
        flexGrow: 1,
        paddingHorizontal: 24,
      }}>
      <SettingsListItem
        icon={<LanguageIcon />}
        title="Set Language"
        onPress={() => {
          setTempLanguage(useSettingsHooks.getString('settings.language'));
          openModal(MODAL_TYPES.LANGUAGE);
        }}
      />
      <SettingsListItem
        icon={<AIWritingSettingsIcon />}
        title="AI Writing Settings"
        onPress={() => {
          setTempWritingSettings(
            JSON.parse(
              useSettingsHooks.getString('settings.globalWritingSettings'),
            ),
          );
          openModal(MODAL_TYPES.AI_WRITING_SETTINGS);
        }}
      />
      <SettingsListItem
        icon={<PhotoIcon />}
        title="Photo"
        onPress={() => {
          openModal(MODAL_TYPES.PHOTO);
        }}
      />
      <SettingsListItem
        icon={<PersonalGlossaryIcon />}
        title="Personal Glossary"
        onPress={() => {
          openModal(MODAL_TYPES.PERSONAL_GLOSSARY);
        }}
      />
      <SettingsListItem
        icon={<CalendarIcon />}
        title="Calendar"
        // onPress={() => {
        //   openModal(MODAL_TYPES.CALENDAR);
        // }}
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
        }}
      />
      <SettingsListItem
        icon={<OtherIcon />}
        title="Other"
        onPress={() => {
          openModal(MODAL_TYPES.OTHER);
        }}
      />

      {/* {devMode === true && (
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
          <Text allowFontScaling={false}>
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
              <Text allowFontScaling={false}>No Photos Detected</Text>
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
          <Text allowFontScaling={false}>
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
              <Text allowFontScaling={false}>No Events Detected</Text>
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
          <Text allowFontScaling={false}>
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
      )} */}
      {modalState.type === MODAL_TYPES.LANGUAGE && (
        <LanguageModal isVisible={modalState.isVisible} onClose={closeModal} />
      )}
      {modalState.type === MODAL_TYPES.AI_WRITING_SETTINGS && (
        <AIWritingSettingsModal
          isVisible={modalState.isVisible}
          onClose={closeModal}
        />
      )}
      {modalState.type === MODAL_TYPES.PHOTO && (
        <PhotoModal isVisible={modalState.isVisible} onClose={closeModal} />
      )}
      {modalState.type === MODAL_TYPES.PERSONAL_GLOSSARY && (
        <PersonalGlossaryModal
          isVisible={modalState.isVisible}
          onClose={closeModal}
        />
      )}
      {/* {modalState.type === MODAL_TYPES.CALENDAR && (
        <CalendarModal isVisible={modalState.isVisible} onClose={closeModal} />
      )} */}
      {modalState.type === MODAL_TYPES.OTHER && (
        <OtherModal isVisible={modalState.isVisible} onClose={closeModal} />
      )}
      {/* <TouchableOpacity onPress={toggleTheme} style={{alignSelf: 'flex-start'}}>
        <Text style={{color: 'blue', marginTop: 15}}>Toggle Theme</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
};
