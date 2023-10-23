import React from 'react';
import MapView, {Marker} from 'react-native-maps';

const SingleMap = ({lat, long}) => {
  console.log({lat, long});
  return (
    <MapView
      cacheEnabled={true}
      loadingEnabled={true}
      // moveOnMarkerPress={false}
      // scrollEnabled={false}
      // liteMode
      provider={undefined}
      scrollEnabled={false}
      initialRegion={{
        latitude: lat,
        longitude: long,
        latitudeDelta: 0.0025,
        longitudeDelta: 0.025,
      }}
      style={{
        width: '100%',
        height: 200,
        borderRadius: 20,
      }}>
      <Marker
        tracksViewChanges={false}
        coordinate={{
          latitude: lat,
          longitude: long,
        }}
      />
    </MapView>
  );
};

export default SingleMapMemo = React.memo(SingleMap);
