import {View} from 'react-native';
import {ImageAsset} from '../../../../utils/native-modules/NativeImage';

export const CustomImage = ({identifier, index, length}) => {
  const baseValues = {
    width: {
      base: 165,
    },
    height: {
      base: 200,
      small: 67,
    },
  };

  const width = () => {
    switch (index) {
      case 0:
        switch (length) {
          case 1:
            return 330;
          default:
            baseValues.width.base;
        }
      case 1:
      case 2:
        switch (length) {
          case 1:
          case 2:
          case 3:
            return baseValues.width.base;
          case 4:
          case 5:
            return baseValues.width.base / 2;
          default:
            return baseValues.width.base / 3;
        }
      case 3:
        switch (length) {
          case 1:
          case 2:
          case 3:
          case 4:
            return baseValues.width.base;
          case 5:
            return baseValues.width.base / 2;
          default:
            return baseValues.width.base / 3;
        }
      case 4:
        switch (length) {
          case 5:
            return baseValues.width.base / 2;
          case 6:
            return baseValues.width.base / 2;
          default:
            return baseValues.width.base / 3;
        }
      case 5:
      case 6:
        switch (length) {
          case 0:
            return baseValues.width.base / 3;
          case 1:
            return baseValues.width.base;
          case 6:
            return baseValues.width.base / 2;
          default:
            return baseValues.width.base / 3;
        }
      case 7:
      case 8:
      case 9:
        switch ((length - 1) % 3) {
          case 0:
            return baseValues.width.base / 3;
          case 1:
            return baseValues.width.base;
          case 2:
            return baseValues.width.base / 2;
        }
    }
  };

  const height = () => {
    switch (length) {
      case 1:
      case 2:
        return baseValues.height.base;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
        switch (index) {
          case 0:
            return baseValues.height.base;
          default:
            return baseValues.height.base / 2;
        }
      case 7:
        switch (index) {
          case 0:
            return baseValues.height.base;
          default:
            return baseValues.height.base / 2;
        }
      case 9:
        switch (index) {
          case 0:
            return baseValues.height.base;
          default:
            return baseValues.height.small;
        }
      default:
        switch (index) {
          case 0:
            return baseValues.height.base;
          default:
            return baseValues.height.small;
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
        // backgroundColor: 'green',
        overflow: 'hidden',
        // borderRadius: 20,
      }}>
      <View
        style={{
          height: height(),
          width: width(),
          // backgroundColor: 'red',
          borderRadius: 20,
          borderTopLeftRadius: bordersTopLeft() === true ? 20 : 0,
          borderTopRightRadius: bordersTopRight() === true ? 20 : 0,
          borderBottomLeftRadius: bordersBottomLeft() === true ? 20 : 0,
          borderBottomRightRadius: bordersBottomRight() === true ? 20 : 0,
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
