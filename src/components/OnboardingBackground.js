import {Defs, LinearGradient, Rect, Stop, Svg} from 'react-native-svg';
import {theme} from '../theme/styling';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
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
  // Modal,
} from 'react-native';

export default OnboardingBackground = () => {
  return (
    <Svg
      height={`${Dimensions.get('window').height}`}
      width={`${Dimensions.get('window').width}`}
      style={StyleSheet.absoluteFillObject}>
      <Defs>
        <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={theme.onboarding.background.from} />
          <Stop offset="100%" stopColor={theme.onboarding.background.to} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grad)" />
    </Svg>
  );
};
