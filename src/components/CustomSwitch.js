import React, {useState, useEffect} from 'react';
import {Text, TouchableOpacity, View, StyleSheet, Animated} from 'react-native';

const CustomSwitch = ({label, value, onValueChange, disabled}) => {
  const [switchValue] = useState(new Animated.Value(value ? 1 : 0));
  const [backgroundColor] = useState(new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(switchValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();

    Animated.timing(backgroundColor, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const toggleSwitch = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const transformStyle = {
    transform: [
      {
        translateX: switchValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 7],
        }),
      },
    ],
  };

  const backgroundStyle = {
    backgroundColor: backgroundColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['#D1D1D6', '#12A833'],
    }),
  };

  return (
    <TouchableOpacity onPress={toggleSwitch} disabled={disabled}>
      <View style={styles.container}>
        <Animated.View style={[styles.switch, backgroundStyle]}>
          <Animated.View style={[styles.thumb, transformStyle]} />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  switch: {
    width: 24,
    height: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    width: 12,
    height: 12,
    backgroundColor: 'white',
    borderRadius: 9999,
  },
});

export default CustomSwitch;
