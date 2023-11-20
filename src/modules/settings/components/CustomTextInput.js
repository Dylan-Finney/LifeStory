import React, {useState} from 'react';
import {Text, View, ScrollView, Modal, TextInput} from 'react-native';

import {useTheme} from '../../../theme/ThemeContext';

const CustomTextInput = ({
  title,
  subtitle,
  onChangeText,
  value,
  characterLimit,
  placeholder,
}) => {
  const {theme} = useTheme();

  return (
    <View style={{marginBottom: 16}}>
      <Text
        allowFontScaling={false}
        style={{
          fontSize: 16,
          fontWeight: 700,
          lineHeight: 24,
          color: theme.colors.secondary,
        }}>
        {title}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          fontSize: 11,
          fontWeight: 400,
          lineHeight: 16.5,
          color: theme.colors.secondary,
        }}>
        {subtitle}
      </Text>
      <View
        style={{
          position: 'relative',
          marginTop: 8,
        }}>
        <TextInput
          allowFontScaling={false}
          multiline
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          style={{
            height: 209,
            borderWidth: 1,
            borderRadius: 6,
            borderColor: theme.colors.border,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}
        />
        <Text
          allowFontScaling={false}
          style={{
            color: theme.colors.secondary,
            position: 'absolute',
            bottom: 8, // Adjust as needed
            right: 12,
          }}>
          {characterLimit}/200
        </Text>
      </View>
    </View>
  );
};

export default CustomTextInput;
