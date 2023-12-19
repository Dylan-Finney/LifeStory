import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  Alert,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActionSheetIOS,
  Modal,
  Dimensions,
} from 'react-native';
import useDatabaseHooks from '../../../utils/hooks/useDatabaseHooks';

import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';
import {
  horizontalScale,
  moderateScale,
  verticalScale,
} from '../../../utils/metrics';

// import PersonalGlossaryIcon from '../../../assets/settings/personal-glossary.svg';

import CustomModalWrapper from '../../../components/modals/CustomModalWrapper';
import {useTheme} from '../../../theme/ThemeContext';
import PenIcon from '../../../assets/Pen.svg';
import BinIcon from '../../../assets/Bin.svg';

import PersonalGlossaryIcon from '../../../assets/glossary/icon.svg';

import {
  Actionsheet,
  ChevronDownIcon,
  Icon,
  Select,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@gluestack-ui/themed';
import {SelectBackdrop} from '@gluestack-ui/themed';
import {SelectContent} from '@gluestack-ui/themed';
import {SelectIcon} from '@gluestack-ui/themed';
import {Pressable} from '@gluestack-ui/themed';
import {Swipeable} from 'react-native-gesture-handler';

import {
  types,
  getGlossaryTypeIcon,
  getPlaceHolder,
} from '../../../utils/glossaryUtils';

//needs cleanup

const PersonalGlossaryModal = ({visible, onClose}) => {
  const {
    createGlossaryTable,
    retrieveData,
    updateGlossaryItem,
    insertGlossaryItem,
    deleteGlossaryItem,
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
  const scrollViewRef = useRef(null);
  // useEffect(() => {
  //   console.log(useSettingsHooks.getString('settings.locationAliases'));
  //   setDataArr(
  //     JSON.parse(useSettingsHooks.getString('settings.locationAliases')),
  //   );
  // }, [useSettingsHooks.getString('settings.locationAliases')]);
  useEffect(() => {
    if (add === true) {
      //   console.log(scrollViewRef.current);
      //   scrollViewRef.current?.scrollToEnd({animated: true});
      //   scrollViewRef.current?.scrollToIndex({index: dataArr.length - 1});
      //   setAdd(false);
    }
  }, [dataArr.length]);

  const [isSelectVisible, setIsSelectVisible] = useState(false);

  const [data, setData] = useState([]);

  let openRecord;

  let rowRefs = new Map();

  createGlossaryTable();

  useEffect(() => {
    const test = async () => {
      try {
        setData(await retrieveData('Glossary'));
      } catch (e) {
        console.error(e);
      }
    };
    test();
  }, []);

  const closeSelectBox = () => {
    setIsSelectVisible(false);
  };

  const baseCurrentItemDataObj = {
    type: types[0],
    alias: '',
    data: '',
  };

  const [currentItemData, setCurrentItemData] = useState(
    baseCurrentItemDataObj,
  );

  const [currentSelectItem, setCurrentSelectItem] = useState(undefined);

  useEffect(() => {
    if (scrollViewRef.current && add == true) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd();
        setAdd(false);
      }, 100);
    }
  }, [data]);

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
      <Modal
        onRequestClose={closeSelectBox}
        // transparent
        presentationStyle="pageSheet"
        visible={isSelectVisible}
        animationType="slide"
        style={{maxHeight: 500}}>
        <View
          style={{
            flex: 1,
            // maxHeight: 500,
            // marginTop: 500,
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: 'rgba(0,0,0,0.5)',
            // backgroundColor: 'red',
          }}>
          <View
            style={{
              backgroundColor: 'white',
              marginVertical: 25,
              // justifyContent: 'flex-end',
            }}>
            <ScrollView contentContainerStyle={{justifyContent: ''}}>
              {types.map((txt, index) => {
                return (
                  <Pressable
                    key={index}
                    onPress={() => {
                      setCurrentItemData({
                        ...currentItemData,
                        type: txt,
                      });
                      setIsSelectVisible(false);
                    }}
                    style={{
                      width: Dimensions.get('window').width,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderColor: '#E7E7E7',
                      padding: 10,
                      borderTopWidth: index === 0 ? 1 : 0,
                      borderBottomWidth: 1,
                    }}>
                    <Text allowFontScaling={false}>{txt}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <View style={{padding: 10}}>
        <View
          style={{
            borderWidth: 1,
            padding: 10,
            borderColor: '#E7E7E7',
            borderRadius: 5,
            margin: 10,
            marginBottom: 0,
          }}>
          <View style={{gap: 8, marginBottom: 10}}>
            <Pressable
              style={{
                borderWidth: 1,
                borderColor: '#E7E7E7',
                padding: 5,
                borderRadius: 5,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
              onPress={() => {
                setIsSelectVisible(true);
              }}>
              <Text allowFontScaling={false}>{currentItemData.type}</Text>
              <Icon as={ChevronDownIcon} />
            </Pressable>
            <TextInput
              allowFontScaling={false}
              value={currentItemData.alias}
              placeholder={getPlaceHolder(currentItemData.type).alias}
              onChangeText={txt => {
                setCurrentItemData({
                  ...currentItemData,
                  alias: txt,
                });
              }}
              style={{
                borderWidth: 1,
                padding: 5,
                borderColor: '#E7E7E7',
                borderRadius: 5,
              }}
            />
            <TextInput
              allowFontScaling={false}
              value={currentItemData.data}
              placeholder={getPlaceHolder(currentItemData.type).data}
              onChangeText={txt => {
                setCurrentItemData({
                  ...currentItemData,
                  data: txt,
                });
              }}
              style={{
                borderWidth: 1,
                padding: 5,
                borderColor: '#E7E7E7',
                borderRadius: 5,
              }}
            />
          </View>
          <Pressable
            style={{
              backgroundColor: '#118ED1',
              borderRadius: 5,
              justifyContent: 'center',
              alignItems: 'center',
              marginHorizontal: 50,
              padding: 5,
              marginBottom: 5,
            }}
            onPress={async () => {
              console.log(currentSelectItem);
              if (currentItemData.alias !== '' && currentItemData.data !== '') {
                if (currentSelectItem === undefined) {
                  //create
                  setAdd(true);
                  const result = await insertGlossaryItem({
                    type: currentItemData.type,
                    alias: currentItemData.alias,
                    data: currentItemData.data,
                  });
                  setData([
                    ...data,
                    {
                      ...currentItemData,
                      id: result.insertId,
                    },
                  ]);
                  setCurrentItemData(baseCurrentItemDataObj);
                } else {
                  //update
                  updateGlossaryItem({
                    type: currentItemData.type,
                    alias: currentItemData.alias,
                    data: currentItemData.data,
                    id: currentSelectItem.id,
                  });

                  // [...rowRefs.entries()].forEach(([key, ref]) => {
                  //   if (key !== currentSelectItem.id && ref) ref.close();
                  // });
                  rowRefs.get(currentSelectItem.id).close();
                  const index = data.findIndex(
                    record => record.id === currentSelectItem.id,
                  );
                  var newData = data;
                  newData[index] = {
                    ...newData[index],
                    type: currentItemData.type,
                    alias: currentItemData.alias,
                    data: currentItemData.data,
                  };

                  setData([...newData]);
                }
              }
            }}>
            <Text allowFontScaling={false} style={{color: 'white'}}>
              {currentSelectItem === undefined ? 'Create' : 'Update'}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(16),
          paddingVertical: verticalScale(16),
        }}>
        {data.map((record, index) => {
          return (
            <Swipeable
              key={index}
              ref={ref => {
                if (ref && !rowRefs.get(record.id)) {
                  rowRefs.set(record.id, ref);
                }
              }}
              containerStyle={{
                borderBottomWidth: 1,
                borderColor: '#E7E7E7',
                backgroundColor:
                  currentSelectItem?.id === record.id ? '#F3F3F3' : 'white',
              }}
              onSwipeableWillClose={() => {
                if (currentSelectItem !== undefined) {
                  setCurrentSelectItem(undefined);
                  setCurrentItemData(baseCurrentItemDataObj);
                }
              }}
              onSwipeableWillOpen={() => {
                [...rowRefs.entries()].forEach(([key, ref]) => {
                  if (key !== record.id && ref) ref.close();
                });
              }}
              renderRightActions={() => {
                return (
                  <View style={{flexDirection: 'row', gap: 5}}>
                    <Pressable
                      onPress={() => {
                        if (currentSelectItem?.id === record.id) {
                          setCurrentSelectItem(undefined);
                          setCurrentItemData(baseCurrentItemDataObj);
                        } else {
                          setCurrentSelectItem(record);
                          setCurrentItemData({
                            type: record.type,
                            alias: record.alias,
                            data: record.data,
                          });
                        }
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E7E7E7',
                        borderRadius: 5,
                        justifyContent: 'center',
                        padding: 8,
                        marginVertical: 5,
                        backgroundColor: 'white',
                      }}>
                      <PenIcon height={16} width={16} />
                    </Pressable>
                    <Pressable
                      onPress={async () => {
                        await deleteGlossaryItem({id: record.id});
                        setData(data.filter(item => item.id !== record.id));
                        setCurrentSelectItem(undefined);
                        setCurrentItemData(baseCurrentItemDataObj);
                        [...rowRefs.entries()].forEach(([key, ref]) => {
                          if (ref) ref.close();
                        });
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E7E7E7',

                        borderRadius: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 8,
                        marginVertical: 5,
                        backgroundColor: 'white',
                      }}>
                      <BinIcon height={19} width={19} />
                    </Pressable>
                  </View>
                );
              }}>
              <Pressable
                style={{
                  flexDirection: 'row',
                  paddingVertical: 15,
                }}>
                {getGlossaryTypeIcon(record.type)}
                <Text
                  allowFontScaling={false}
                  style={{marginLeft: 5, width: 100, color: '#3C3C3C'}}>
                  {record.alias}
                </Text>
                <Text allowFontScaling={false} style={{color: '#3C3C3C'}}>
                  {record.data}
                </Text>
              </Pressable>
            </Swipeable>
          );
        })}
      </ScrollView>
    </CustomModalWrapper>
  );
};

export default PersonalGlossaryModal;
