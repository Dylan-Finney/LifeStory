import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import useDatabaseHooks from '../../../utils/hooks/useDatabaseHooks';

import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';

import PersonalGlossaryIcon from '../../../assets/settings/personal-glossary.svg';

import CustomModalWrapper from '../../../components/modals/CustomModalWrapper';
import {useTheme} from '../../../theme/ThemeContext';

//needs cleanup

const PersonalGlossaryModal = ({visible, onClose}) => {
  const {
    deleteTable,
    createEntryTable,
    createVisitsTable,
    resetTable,
    retrieveSpecificData,
  } = useDatabaseHooks();

  const {theme} = useTheme();

  //   const [locations, setLocations] = useState(
  //     '[{"address":"17 Hawthorne Lane", "alias": "Home"}]',
  //   );
  const [dataArr, setDataArr] = useState(
    JSON.parse(useSettingsHooks.getString('settings.locationAliases')),
  );
  const [deleteMode, setDeleteMode] = useState(true);
  const [add, setAdd] = useState(false);
  // const {locationAliases, setLocationAliases} = useSettingsHooks();
  const ScrollViewRef = useRef(null);
  // useEffect(() => {
  //   console.log(useSettingsHooks.getString('settings.locationAliases'));
  //   setDataArr(
  //     JSON.parse(useSettingsHooks.getString('settings.locationAliases')),
  //   );
  // }, [useSettingsHooks.getString('settings.locationAliases')]);
  useEffect(() => {
    if (add === true) {
      //   console.log(ScrollViewRef.current);
      //   ScrollViewRef.current?.scrollToEnd({animated: true});
      //   ScrollViewRef.current?.scrollToIndex({index: dataArr.length - 1});
      //   setAdd(false);
    }
  }, [dataArr.length]);

  return (
    <CustomModalWrapper
      visible={visible}
      onClose={onClose}
      onUpdate={() => {
        useSettingsHooks.set(
          'settings.locationAliases',
          JSON.stringify(dataArr),
        );
      }}
      leftButton="Cancel"
      heading={{
        text: 'Personal Glossary',
        icon: <PersonalGlossaryIcon />,
      }}
      subheading="Define and categorize personal terms, places, and more for enhanced journaling accuracy."
      rightButton={{
        text: 'Update',
        disabled: false,
      }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(16),
          paddingVertical: verticalScale(16),
        }}>
        {/* LOCATION ALIASES */}
        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            // gap: verticalScale(10),
            padding: 10,
            flexGrow: 1,
          }}>
          <TouchableOpacity
            onPress={() => {
              setDeleteMode(!deleteMode);
            }}>
            <Text>Delete Mode</Text>
          </TouchableOpacity>
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                width: `${deleteMode === true ? 47 : 50}%`,
                borderWidth: 1,
                borderColor: 'black',
                padding: 5,
              }}>
              <Text>Address</Text>
            </View>
            <View
              style={{
                width: `${deleteMode === true ? 47 : 50}%`,
                borderWidth: 1,
                borderColor: 'black',
                padding: 5,
              }}>
              <Text>Alias</Text>
            </View>
            {deleteMode === true && (
              <View
                style={{
                  width: `6%`,
                  borderWidth: 1,
                  borderColor: 'black',
                  padding: 5,
                }}>
                {/* <Text style={{textAlign: 'center'}}>-</Text> */}
              </View>
            )}
          </View>
          {/* <FlatList></FlatList> */}

          <ScrollView
            ref={ScrollViewRef}
            style={{width: '100%', maxHeight: '80%'}}
            onContentSizeChange={(contentWidth, contentHeight) => {
              if (add === true) {
                ScrollViewRef.current?.scrollToEnd({animated: true});

                setAdd(false);
              }
            }}>
            {dataArr.map((data, i) => {
              return (
                <View style={{flexDirection: 'row'}} key={i}>
                  <View
                    style={{
                      width: `${deleteMode === true ? 47 : 50}%`,
                      backgroundColor:
                        dataArr
                          .slice(0, i)
                          .some(
                            dataCheck => dataCheck.address === data.address,
                          ) && data.address !== ''
                          ? '#D9544D'
                          : 'white',
                      flexGrow: 1,
                      borderWidth: 1,
                      borderColor: 'black',
                      padding: 5,
                    }}>
                    <TextInput
                      value={data.address}
                      onChangeText={text => {
                        var dataCopy = data;
                        var dataArrCopy = dataArr;
                        data.address = text;
                        dataArrCopy[i] = dataCopy;

                        // useSettingsHooks.set(
                        //   'settings.locationAliases',
                        //   JSON.stringify(dataArrCopy),
                        // );
                        setDataArr([...dataArrCopy]);
                      }}
                      placeholder="662 Timothy Terrace"
                    />
                  </View>
                  <View
                    style={{
                      width: `${deleteMode === true ? 47 : 50}%`,
                      //   flexGrow: 1,
                      borderWidth: 1,
                      borderColor: 'black',
                      padding: 5,
                    }}>
                    <TextInput
                      value={data.alias}
                      onChangeText={text => {
                        var dataCopy = data;
                        var dataArrCopy = dataArr;
                        data.alias = text;
                        dataArrCopy[i] = dataCopy;

                        // useSettingsHooks.set(
                        //   'settings.locationAliases',
                        //   JSON.stringify(dataArrCopy),
                        // );
                        setDataArr([...dataArrCopy]);
                      }}
                      placeholder="Home"
                    />
                  </View>
                  {deleteMode === true && (
                    <View
                      style={{
                        width: `6%`,
                        borderWidth: 1,
                        borderColor: 'black',
                        padding: 5,
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          // var dataCopy = data;
                          var dataArrCopy = dataArr;
                          // data.alias = text;
                          dataArrCopy.splice(i, 1);

                          // useSettingsHooks.set(
                          //   'settings.locationAliases',
                          //   JSON.stringify(dataArrCopy),
                          // );
                          setDataArr([...dataArrCopy]);
                        }}>
                        <Text style={{textAlign: 'center', color: 'red'}}>
                          X
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            onPress={() => {
              setDataArr([...dataArr, {address: '', alias: ''}]);
              // useSettingsHooks.set(
              //   'settings.locationAliases',
              //   JSON.stringify([
              //     ...JSON.parse(locationAliases),
              //     {address: '', alias: ''},
              //   ]),
              // );

              setAdd(true);
              //   ScrollViewRef.current?.scrollToEnd({animated: true});
              //   ScrollViewRef.current?.scrollTo({y: 0});
            }}
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: 'black',
              padding: 5,
            }}>
            <Text style={{textAlign: 'center'}}>+</Text>
          </TouchableOpacity>
        </View>
        {/* LOCATION ALIASES */}
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
              fontWeight: 700,
              fontSize: 14,
            }}
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
        </View>
      </ScrollView>
    </CustomModalWrapper>
  );
};

export default PersonalGlossaryModal;
