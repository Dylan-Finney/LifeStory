import React, {useState} from 'react';
import {Text, Alert, ScrollView} from 'react-native';

import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';

import CustomModalWrapper from '../../../components/modals/CustomModalWrapper';

import PhotoIcon from '../../../assets/settings/photo.svg';
import LabeledSwitch from '../../../components/LabeledSwitch';

import {horizontalScale, verticalScale} from '../../../utils/metrics';

const PhotoModal = ({visible, onClose}) => {
  const [includeDownloadedPhotos, setIncludeDownloadedPhotos] = useState(
    useSettingsHooks.getBoolean('settings.includeDownloadedPhotos'),
  );
  const [analyzePhotos, setAnalyzePhotos] = useState(
    useSettingsHooks.getBoolean('settings.photoAnalysis'),
  );

  const handleAnalyzePhotosSwitch = value => {
    if (value) {
      Alert.alert(
        'Warning!',
        'Photos taken from the camera will be sent to Amazon to be analyzed. We WILL NOT store these photos.\nDo you wish to proceed?',
        [
          {
            text: 'Confirm',
            onPress: () => {
              setAnalyzePhotos(true);
              useSettingsHooks.set('settings.photoAnalysis', true);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setAnalyzePhotos(false),
          },
        ],
      );
    } else {
      Alert.alert(
        'Warning!',
        'Photos taken from the camera will not be analyzed and, as such, no descriptions can be generated about them.\nDo you wish to proceed?',
        [
          {
            text: 'Confirm',
            onPress: () => {
              setAnalyzePhotos(false);
              useSettingsHooks.set('settings.photoAnalysis', false);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setAnalyzePhotos(true),
          },
        ],
      );
    }
  };

  const handleDownloadedPhotosSwitch = value => {
    if (value) {
      Alert.alert(
        'Warning!',
        'Photos downloaded or from Third Party apps will be included in your entries.\nDo you wish to proceed?',
        [
          {
            text: 'Confirm',
            onPress: () => {
              setIncludeDownloadedPhotos(true);
              useSettingsHooks.set('settings.includeDownloadedPhotos', true);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIncludeDownloadedPhotos(false),
          },
        ],
      );
    } else {
      Alert.alert(
        'Warning!',
        'Photos downloaded or from Third Party apps will NOT be included in your entries.\nDo you wish to proceed?',
        [
          {
            text: 'Confirm',
            onPress: () => {
              setIncludeDownloadedPhotos(false);
              useSettingsHooks.set('settings.includeDownloadedPhotos', false);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIncludeDownloadedPhotos(true),
          },
        ],
      );
    }
  };

  console.log('analyzephotos', analyzePhotos);
  console.log('includeDownloadedPhotos', includeDownloadedPhotos);

  return (
    <CustomModalWrapper
      visible={visible}
      onClose={onClose}
      onUpdate={() => {}}
      leftButton="Cancel"
      heading={{
        text: 'Photo',
        icon: <PhotoIcon />,
      }}
      rightButton={{
        text: 'Update',
        disabled: false,
      }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalScale(24),
          paddingVertical: verticalScale(16),
        }}>
        <LabeledSwitch
          label="Analyze photos"
          onValueChange={value => handleAnalyzePhotosSwitch(value)}
          value={analyzePhotos}
        />
        <LabeledSwitch
          label="Downloaded photos"
          onValueChange={value => handleDownloadedPhotosSwitch(value)}
          value={includeDownloadedPhotos}
        />
      </ScrollView>
    </CustomModalWrapper>
  );
};

export default PhotoModal;
