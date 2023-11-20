import React from 'react';
import {Text, View, Modal, TouchableOpacity, StyleSheet} from 'react-native';

import {horizontalScale, verticalScale} from '../../utils/metrics';
import {useTheme} from '../../theme/ThemeContext';

const CustomModalWrapper = ({
  visible,
  onClose,
  onUpdate,
  leftButton,
  heading,
  subheading,
  rightButton,
  children,
}) => {
  const {theme} = useTheme();

  return (
    <Modal
      visible={visible}
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      animationType="slide">
      <View style={[styles.modalContainer, {borderColor: theme.colors.border}]}>
        <View
          style={[styles.paddedContainer, {borderColor: theme.colors.border}]}>
          <View style={styles.navigationContainer}>
            {leftButton && (
              <TouchableOpacity onPress={onClose}>
                <Text
                  allowFontScaling={false}
                  style={[styles.buttonText, {color: theme.colors.secondary}]}>
                  {leftButton}
                </Text>
              </TouchableOpacity>
            )}

            {heading && (
              <View style={styles.headingContainer}>
                <View
                  style={[
                    styles.headingIconContainer,
                    {borderColor: theme.colors.border},
                  ]}>
                  {heading.icon}
                </View>
                <Text
                  allowFontScaling={false}
                  style={[styles.headingText, {color: theme.colors.primary}]}>
                  {heading.text}
                </Text>
              </View>
            )}

            {rightButton && (
              <TouchableOpacity
                onPress={() => {
                  if (!rightButton.disabled) {
                    onUpdate();
                    onClose();
                  }
                }}
                disabled={rightButton.disabled}>
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.buttonText,
                    {
                      color: rightButton.disabled
                        ? theme.colors.secondary
                        : theme.colors.tertiary,
                    },
                  ]}>
                  {rightButton.text}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {subheading && (
            <View style={styles.subheadingContainer}>
              <Text
                allowFontScaling={false}
                style={[styles.subheadingText, {color: theme.colors.primary}]}>
                {subheading}
              </Text>
            </View>
          )}
        </View>
      </View>
      {children}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    paddingHorizontal: horizontalScale(24),
  },
  paddedContainer: {
    borderBottomWidth: 1,
    paddingBottom: verticalScale(8),
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: verticalScale(27),
    width: '100%',
  },

  buttonText: {
    fontWeight: '500',
    fontSize: 14.5,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  headingIconContainer: {
    padding: 4,
    borderWidth: 1,
    borderRadius: 6,
    marginRight: 6,
  },
  headingText: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: 700,
  },
  subheadingContainer: {
    alignSelf: 'center',
    paddingHorizontal: horizontalScale(48),
  },
  subheadingText: {
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 17,
    textAlign: 'center',
  },
});

export default CustomModalWrapper;
