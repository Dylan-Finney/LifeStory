import React, {useState, useContext} from 'react';
import {Text, View, Alert, NativeModules, ScrollView} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import useDatabaseHooks from '../../../utils/hooks/useDatabaseHooks';
import AppContext from '../../../contexts/AppContext';
import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';

import notifee from '@notifee/react-native';

import OtherIcon from '../../../assets/settings/other.svg';

import CustomModalWrapper from '../../../components/modals/CustomModalWrapper';
import LabeledSwitch from '../../../components/LabeledSwitch';
import {useTheme} from '../../../theme/ThemeContext';

const OtherModal = ({visible, onClose}) => {
  const {theme} = useTheme();
  const navigation = useNavigation();

  const [photos, setPhotos] = useState([]);
  const [startPhotosDate, setStartPhotosDate] = useState(0);
  const [endPhotosDate, setEndPhotosDate] = useState(0);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  const {setOnBoarding, devMode, setDevMode} = useContext(AppContext);

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

  const {
    deleteTable,
    createEntryTable,
    createVisitsTable,
    resetTable,
    retrieveSpecificData,
  } = useDatabaseHooks();

  const {setEntries} = useContext(AppContext);

  return (
    <CustomModalWrapper
      visible={visible}
      onClose={onClose}
      onUpdate={() => {}}
      leftButton="Cancel"
      heading={{
        text: 'Other',
        icon: <OtherIcon />,
      }}
      rightButton={{
        text: 'Update',
        disabled: true,
      }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(24),
          paddingVertical: verticalScale(16),
        }}>
        <LabeledSwitch
          label="Dev Mode"
          onValueChange={() => {
            setDevMode(!devMode);
          }}
          value={devMode}
        />
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: theme.colors.border,
            paddingVertical: verticalScale(16),
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: theme.colors.error,
              fontWeight: 500,
              fontSize: 14,
            }}
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
        </View>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: theme.colors.border,
            paddingVertical: verticalScale(16),
          }}>
          <Text
            allowFontScaling={false}
            style={{
              color: theme.colors.error,
              fontWeight: 500,
              fontSize: 14,
            }}
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
                        name: 'MainApp',
                      });
                    },
                  },
                  {text: 'Cancel', style: 'cancel'},
                ],
              );
            }}>
            Reset All Data
          </Text>
        </View>

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
                        <Text allowFontScaling={false}>
                          {photo.description}
                        </Text>
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
                          {new Date(
                            parseInt(event.end) * 1000,
                          ).toLocaleString()}
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
                        <Text allowFontScaling={false}>
                          Lat: {location.lat}
                        </Text>
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
    </CustomModalWrapper>
  );
};

export default OtherModal;
