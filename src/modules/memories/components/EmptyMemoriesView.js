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
import getNextMemoryTime from '../../../utils/getNextMemoryTime';

export default EmptyStoriesView = () => {
  return (
    <Box alignItems="center" justifyContent="center" height="100%">
      {/* <Image source={require('../../../assets/am_image.svg')} /> */}
      <Text style={{textAlign: 'center', fontWeight: 600, fontSize: 24}}>
        No Memories yet
      </Text>
      <Text style={{textAlign: 'center'}}>
        Make sure that all permissions are granted for desired integration.
      </Text>
      <Text style={{textAlign: 'center'}}>
        Tune in at {getNextMemoryTime()}:00 to create new memories...
      </Text>
    </Box>
  );
};
