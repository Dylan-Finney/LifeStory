import React, {useState} from 'react';
import {ScrollView} from 'react-native';

import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';
import {horizontalScale, verticalScale} from '../../../utils/metrics';
import CustomModalWrapper from '../../../components/modals/CustomModalWrapper';

import AIWritingSettingsIcon from '../../../assets/settings/ai-writing-settings.svg';
import {useTheme} from '../../../theme/ThemeContext';
import CustomTextInput from '../components/CustomTextInput';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const AIWritingSettingsModal = ({visible, onClose}) => {
  const {theme} = useTheme();

  const [tempWritingSettings, setTempWritingSettings] = useState(
    JSON.parse(useSettingsHooks.getString('settings.globalWritingSettings')),
  );

  return (
    <CustomModalWrapper
      visible={visible}
      onClose={onClose}
      onUpdate={() => {
        useSettingsHooks.set(
          'settings.globalWritingSettings',
          JSON.stringify(tempWritingSettings),
        );
      }}
      leftButton="Cancel"
      heading={{
        text: 'AI Writing Settings',
        icon: <AIWritingSettingsIcon />,
      }}
      subheading="Customize automated writing to reflect your tone and style."
      rightButton={{
        text: 'Update',
        disabled:
          JSON.parse(
            useSettingsHooks.getString('settings.globalWritingSettings'),
          ) === tempWritingSettings ||
          tempWritingSettings.title.length > 200 ||
          tempWritingSettings.body.length > 200 ||
          tempWritingSettings.generate.length > 200,
      }}>
      <KeyboardAwareScrollView extraScrollHeight={verticalScale(100)}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: horizontalScale(24),
            paddingTop: verticalScale(16),
            paddingBottom: verticalScale(100),
          }}>
          <CustomTextInput
            title="Generating Initial Texts"
            subtitle="Guide the AI for your individual style."
            value={tempWritingSettings.generate}
            onChangeText={text => {
              if (text.length <= 200) {
                setTempWritingSettings({
                  ...tempWritingSettings,
                  generate: text,
                });
              }
            }}
            characterLimit={tempWritingSettings.generate.length}
            placeholder="Emphasize relationships, keep a relaxed tone, focus on meaningful interactions."
          />
          <CustomTextInput
            title="Writing a Daily Story Title"
            subtitle="Shape how your daily story titles are crafted."
            value={tempWritingSettings.title}
            onChangeText={text => {
              if (text.length <= 200) {
                setTempWritingSettings({
                  ...tempWritingSettings,
                  title: text,
                });
              }
            }}
            characterLimit={tempWritingSettings.title.length}
            placeholder="Include key themes, keep it engaging and concise."
          />
          <CustomTextInput
            title="Rewriting Existing Content"
            subtitle="How should AI refine and edit your existing entries."
            value={tempWritingSettings.body}
            onChangeText={text => {
              if (text.length <= 200) {
                setTempWritingSettings({
                  ...tempWritingSettings,
                  body: text,
                });
              }
            }}
            characterLimit={tempWritingSettings.body.length}
            placeholder="Fix spelling and grammar, but keep my personal style and tone intact."
          />
        </ScrollView>
      </KeyboardAwareScrollView>
    </CustomModalWrapper>
  );
};

export default AIWritingSettingsModal;
