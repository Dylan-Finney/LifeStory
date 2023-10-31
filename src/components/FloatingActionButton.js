import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';

const FloatingActionButton = ({onPress, children}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(11, 11, 11, 0.1)',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
    shadowColor: '#000',
  },
});

export default FloatingActionButton;
