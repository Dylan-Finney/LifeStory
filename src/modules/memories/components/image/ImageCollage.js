import {View} from 'react-native';
import {CustomImage} from './CustomImage';

export const ImageCollage = ({photoGroupData}) => {
  const length = photoGroupData.length;
  switch (length) {
    case 2:
    case 3:
    case 4:
    case 5:
      return (
        <View style={{flexDirection: 'row'}}>
          <CustomImage
            identifier={photoGroupData[0].localIdentifier}
            index={0}
            length={length}
          />
          <View style={{flexDirection: 'column'}}>
            {length > 3 && (
              <View style={{flexDirection: 'row'}}>
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
              <View style={{flexDirection: length === 3 ? 'column' : 'row'}}>
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
        </View>
      );
    default:
      return (
        <View style={{flexDirection: 'row'}}>
          <CustomImage
            identifier={photoGroupData[0].localIdentifier}
            index={0}
            length={length}
          />
          <View style={{flexDirection: 'column'}}>
            {length > 7 && (
              <View style={{flexDirection: 'row'}}>
                {[...Array(length - 7 > 3 ? 3 : length - 7)].map((e, i) => (
                  <CustomImage
                    key={i}
                    identifier={photoGroupData[7 + i].localIdentifier}
                    index={7 + i}
                    length={length}
                  />
                ))}
              </View>
            )}

            {length > 4 && (
              <View style={{flexDirection: 'row'}}>
                {[...Array(length - 4 > 3 ? 3 : length - 4)].map((e, i) => (
                  <CustomImage
                    key={i}
                    identifier={photoGroupData[4 + i].localIdentifier}
                    index={4 + i}
                    length={length}
                  />
                ))}
              </View>
            )}
            {length > 1 && (
              <View style={{flexDirection: 'row'}}>
                {[...Array(length - 1 > 3 ? 3 : length - 1)].map((e, i) => (
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
        </View>
      );
  }
};
