import React from 'react';
import MapView, {Marker, Polyline} from 'react-native-maps';

const RouteMap = ({coordinates, start, end}) => {
  console.log({coordinates, start, end});
  const allCoords = [
    ...coordinates.map(coord => {
      return {
        ...coord,
        latitude: coord.lat,
        longitude: coord.lon,
      };
    }),
    {...start, latitude: start.lat, longitude: start.lon, date: start.end},
    {...end, date: end.start},
  ].sort((a, b) => a.date - b.date);

  const latitudes = allCoords.map(coord => coord.latitude);
  const longitudes = allCoords.map(coord => coord.longitude);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  const rangeLat = maxLat - minLat;
  const rangeLon = maxLon - minLon;

  const centerLat = (maxLat + minLat) / 2;
  const centerLon = (maxLon + minLon) / 2;

  const bufferPercentage = 0.2;
  const bufferLat = rangeLat * bufferPercentage;
  const bufferLon = rangeLon * bufferPercentage;

  const deltaLat = rangeLat + 2 * bufferLat;
  const deltaLon = rangeLon + 2 * bufferLon;
  return (
    <MapView
      cacheEnabled={true}
      loadingEnabled={true}
      // moveOnMarkerPress={false}
      // scrollEnabled={false}
      // liteMode
      provider={undefined}
      scrollEnabled={true}
      initialRegion={{
        latitude: centerLat,
        longitude: centerLon,
        latitudeDelta: deltaLat,
        longitudeDelta: deltaLon,
      }}
      style={{
        width: '100%',
        height: 200,
        borderRadius: 20,
      }}>
      <Marker
        tracksViewChanges={false}
        pinColor="#0000FF"
        coordinate={{
          latitude: end.latitude,
          longitude: end.longitude,
        }}
      />
      <Marker
        tracksViewChanges={false}
        coordinate={{
          latitude: start.lat,
          longitude: start.lon,
        }}
      />
      <Polyline
        coordinates={allCoords}
        strokeColor="#000"
        strokeColors={['#7F0000']}
        strokeWidth={2}
      />
    </MapView>
  );
};

export default RouteMapMemo = React.memo(RouteMap);
