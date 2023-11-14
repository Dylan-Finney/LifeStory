import {View, Text} from 'react-native';
export default MemoryDivider = ({time = undefined}) => {
  return (
    <>
      {time !== undefined ? (
        <View
          style={{
            // height: 1,
            // width: '100%',
            // marginTop: 20,
            // backgroundColor: 'rgba(11, 11, 11, 0.1)',
            flexDirection: 'row',
            alignContent: 'center',
            justifyContent: 'center',
          }}>
          <View
            style={{
              height: 2,
              // width: '30%',
              // alignSelf: 'center',
              flex: 1,
              marginTop: 10,
              marginRight: 10,
              backgroundColor: 'rgba(11, 11, 11, 0.1)',
            }}
          />
          <Text
            allowFontScaling={false}
            style={{fontWeight: 600, color: '#696969'}}>
            {time}
          </Text>
          <View
            style={{
              height: 2,
              flex: 1,
              // alignSelf: 'center',
              marginTop: 10,
              marginLeft: 10,
              backgroundColor: 'rgba(11, 11, 11, 0.1)',
            }}
          />
        </View>
      ) : (
        <View
          style={{
            height: 1,
            flex: 1,
            // alignSelf: 'center',
            marginTop: 10,
            marginLeft: 10,
            backgroundColor: 'rgba(11, 11, 11, 0.1)',
          }}
        />
      )}
    </>
  );
};
