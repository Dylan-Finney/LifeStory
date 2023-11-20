import React, {useState} from 'react';
import {Text, View, TouchableOpacity, FlatList} from 'react-native';

import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';

import {languages} from '../../../utils/languages';
import CustomModalWrapper from '../../../components/modals/CustomModalWrapper';

import LanguageIcon from '../../../assets/settings/language.svg';
import {useTheme} from '../../../theme/ThemeContext';
import {verticalScale, horizontalScale} from '../../../utils/metrics';

const LanguageModal = ({visible, onClose}) => {
  const {theme} = useTheme();
  const [tempLanguage, setTempLanguage] = useState(
    useSettingsHooks.getString('settings.language'),
  );

  languages.sort((a, b) => a.englishName.localeCompare(b.englishName));

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => {
        setTempLanguage(item.englishName);
      }}
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        paddingVertical: verticalScale(16),
      }}>
      <View style={{display: 'flex', flexDirection: 'column'}}>
        <Text
          allowFontScaling={false}
          style={{
            color: theme.colors.secondary,
            fontWeight: 400,
            fontSize: 14,
            lineHeight: 21,
          }}>
          {item.englishName}
        </Text>
        {/* <Text
          allowFontScaling={false}
          style={{color: theme.colors.secondary, fontSize: 16}}>
          {item.nativeName}
        </Text> */}
      </View>
      <View
        style={{
          width: 17.5,
          height: 17.5,
          backgroundColor:
            item.englishName !== tempLanguage ? 'white' : theme.colors.tertiary,
          borderRadius: 20,
          borderColor: theme.colors.tertiary,
          borderWidth: 2,
          alignSelf: 'center',
        }}
      />
    </TouchableOpacity>
  );

  return (
    <CustomModalWrapper
      visible={visible}
      onClose={onClose}
      onUpdate={() => {
        useSettingsHooks.set('settings.language', tempLanguage);
      }}
      leftButton="Cancel"
      heading={{
        text: 'Language',
        icon: <LanguageIcon />,
      }}
      rightButton={{
        text: 'Update',
        disabled:
          useSettingsHooks.getString('settings.language') === tempLanguage,
      }}>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(24),
          paddingTop: verticalScale(16),
          paddingBottom: verticalScale(24),
        }}
        data={languages}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </CustomModalWrapper>
  );
};

export default LanguageModal;
