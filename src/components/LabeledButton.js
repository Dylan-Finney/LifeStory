import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import {useTheme} from '../theme/ThemeContext';
import {verticalScale} from '../utils/metrics';

const LabeledButton = ({onPress, label, color}) => {
  const {theme} = useTheme();
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: theme.colors.border,
          paddingVertical: verticalScale(16),
        }}>
        <Text
          allowFontScaling={false}
          style={{
            color: color,
            fontWeight: 700,
            fontSize: 14,
          }}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default LabeledButton;
