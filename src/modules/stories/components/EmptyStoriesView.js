import useSettingsHooks from '../../../utils/hooks/useSettingsHooks';
import AMImage from '../../../assets/AMImage.png';
import PMImage from '../../../assets/PMImage.png';
import {Box} from '@gluestack-ui/themed';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
  StyleSheet,
  Image,
  Button,
  NativeEventEmitter,
  Animated,
  RefreshControl,
  FlatList,
} from 'react-native';

export default EmptyStoriesView = () => {
  return (
    <Box alignItems="center" justifyContent="center" height="100%">
      <Image
        source={
          useSettingsHooks.getNumber('settings.createEntryTime') === 8
            ? AMImage
            : PMImage
        }
      />
      <Text
        allowFontScaling={false}
        style={{
          textAlign: 'center',
          fontWeight: 600,
          fontSize: 24,
        }}>
        No Stories yet
      </Text>
      <Text allowFontScaling={false} style={{textAlign: 'center'}}>
        Make sure that all permissions are granted for desired integration.
      </Text>
      <Text allowFontScaling={false} style={{textAlign: 'center'}}>
        Tune in at {useSettingsHooks.getNumber('settings.createEntryTime')}:00
        to create new stories...
      </Text>
    </Box>
  );
};
