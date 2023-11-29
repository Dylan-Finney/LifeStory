import {ScrollView, View} from 'react-native';
import {CustomImage} from './CustomImage';

export const ImageCollage = ({photoGroupData}) => {
  const length = photoGroupData.length;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <CustomImage
        identifier={photoGroupData[0].localIdentifier}
        index={0}
        length={length}
      />
      {length === 2 && (
        <CustomImage
          identifier={photoGroupData[1].localIdentifier}
          index={1}
          length={length}
        />
      )}
      {length > 2 && (
        <View
          style={{flexDirection: 'column', justifyContent: 'space-between'}}>
          {length > 3 && (
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              {[...Array(length - 3 > 2 ? 2 : length - 3)].map((e, i) => (
                <CustomImage
                  key={i}
                  identifier={photoGroupData[3 + i].localIdentifier}
                  index={3 + i}
                  length={length}
                />
              ))}
            </View>
          )}
          {length > 1 && (
            <View
              style={{
                flexDirection: length === 3 ? 'column' : 'row',
                justifyContent: 'space-between',
                // gap: 10,
              }}>
              {[...Array(length - 1 > 2 ? 2 : length - 1)].map((e, i) => (
                <CustomImage
                  key={i}
                  identifier={photoGroupData[1 + i].localIdentifier}
                  index={1 + i}
                  length={length}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};
