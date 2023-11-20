import React from 'react';
import {TouchableOpacity, Text, View, StyleSheet} from 'react-native';
import ChevronRightIcon from '../../../assets/chevron-right.svg';
import {useTheme} from '../../../theme/ThemeContext';

const SettingsListItem = ({icon, title, onPress}) => {
  const {theme} = useTheme(); 
  console.log('theme', theme);
  return (
    <TouchableOpacity
      style={[styles.container, {borderBottomColor: theme.colors.border}]}
      onPress={onPress}>
      <View style={styles.innerContainer}>
        <View>{icon}</View>
        <Text style={[styles.itemText, {color: theme.text}]}>{title}</Text>
      </View>
      <ChevronRightIcon fill={theme.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    marginLeft: 8,
  },
});

export default SettingsListItem;
