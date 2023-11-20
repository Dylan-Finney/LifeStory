import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {verticalScale} from '../utils/metrics';
import {useTheme} from '../theme/ThemeContext';
import CustomSwitch from './CustomSwitch';

const LabeledSwitch = ({label, onValueChange, value, disabled}) => {
  const {theme} = useTheme();

  return (
    <View style={[styles.container, {borderColor: theme.colors.border}]}>
      <Text style={[styles.label, {color: theme.colors.secondary}]}>
        {label}
      </Text>

      <CustomSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(17.5),
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: 400,
  },
});

export default LabeledSwitch;
