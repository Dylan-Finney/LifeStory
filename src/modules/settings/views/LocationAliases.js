import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Button,
} from 'react-native';
import {verticalScale} from '../../../utils/metrics';
import {useEffect, useState, createRef, useRef} from 'react';
import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';
export default LocationAliasesView = ({route, navigation}) => {
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

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button
          onPress={() => {
            useSettingsHooks.set(
              'settings.locationAliases',
              JSON.stringify(dataArr),
            );
            navigation.navigate({
              name: 'Settings_Base',
              merge: true,
            });
          }}
          title="< Settings"
        />
      ),
      headerBackVisible: false,
    });
  }, [navigation, dataArr]);

  return (
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
        <Text allowFontScaling={false}>Delete Mode</Text>
      </TouchableOpacity>
      <View style={{flexDirection: 'row'}}>
        <View
          style={{
            width: `${deleteMode === true ? 47 : 50}%`,
            borderWidth: 1,
            borderColor: 'black',
            padding: 5,
          }}>
          <Text allowFontScaling={false}>Address</Text>
        </View>
        <View
          style={{
            width: `${deleteMode === true ? 47 : 50}%`,
            borderWidth: 1,
            borderColor: 'black',
            padding: 5,
          }}>
          <Text allowFontScaling={false}>Alias</Text>
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
                      .some(dataCheck => dataCheck.address === data.address) &&
                    data.address !== ''
                      ? '#D9544D'
                      : 'white',
                  flexGrow: 1,
                  borderWidth: 1,
                  borderColor: 'black',
                  padding: 5,
                }}>
                <TextInput
                  allowFontScaling={false}
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
                  allowFontScaling={false}
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
                    <Text
                      allowFontScaling={false}
                      style={{textAlign: 'center', color: 'red'}}>
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
        <Text allowFontScaling={false} style={{textAlign: 'center'}}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};
