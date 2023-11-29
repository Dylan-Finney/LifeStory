import {View} from 'react-native';
import {ImageAsset} from '../../../../utils/native-modules/NativeImage';

export const CustomImage = ({identifier, index, length}) => {
  const baseValues = {
    width: 330,

    height: 200,
  };

  const width = () => {
    switch (length) {
      case 1:
        return baseValues.width;
      case 2:
      case 3:
        return baseValues.width / 2;
      case 4:
        switch (index) {
          case 0:
          case 3:
            return baseValues.width / 2;
          default:
            return baseValues.width / 4;
        }
      default:
        switch (index) {
          case 0:
            return baseValues.width / 2;
          default:
            return baseValues.width / 4;
        }
    }
  };

  const height = () => {
    switch (length) {
      case 1:
      case 2:
        return baseValues.height;
      default:
        switch (index) {
          case 0:
            return baseValues.height;
          default:
            return baseValues.height / 2;
        }
    }
  };

  const bordersTopLeft = () => {
    if (index === 0 || index === undefined) {
      return true;
    } else {
      return false;
    }
  };

  const bordersTopRight = () => {
    switch (length) {
      case 3:
        switch (index) {
          case 1:
            return true;
          default:
            return false;
        }
      default:
        switch (index) {
          case length - 1:
            return true;
          default:
            return false;
        }
    }
  };

  const bordersBottomLeft = () => {
    if (index === 0 || index === undefined) {
      return true;
    } else {
      return false;
    }
  };

  const bordersBottomRight = () => {
    switch (length) {
      case 1:
        return true;
      case 2:
        switch (index) {
          case 1:
            return true;
          default:
            return false;
        }
      case 4:
      case 3:
      case 5:
        switch (index) {
          case 2:
            return true;
          default:
            return false;
        }
      default:
        switch (index) {
          case 3:
            return true;
          default:
            return false;
        }
    }
  };
  return (
    <View
      style={{
        height: height(),
        // width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // borderRadius: 20,
      }}>
      <View
        style={{
          height: height(),
          width: width(),
          // backgroundColor: 'red',
          // borderRadius: 20,
          borderTopLeftRadius: bordersTopLeft() === true ? 20 : 0,
          borderTopRightRadius: bordersTopRight() === true ? 20 : 0,
          borderBottomLeftRadius: bordersBottomLeft() === true ? 20 : 0,
          borderBottomRightRadius: bordersBottomRight() === true ? 20 : 0,
          // marginRight: length > 1 && index === 0 ? 10 : 0,
          overflow: 'hidden',
        }}>
        <ImageAsset
          localIdentifier={identifier}
          setHeight={height()}
          setWidth={width()}
          // height={1}
          style={{
            // flex: 1,
            height: height(),
            width: width(),
            backgroundColor: 'red',

            // marginLeft: -150,
            // marginTop: -100,
          }}
        />
      </View>
    </View>
  );
};
