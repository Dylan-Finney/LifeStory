import {Text, TouchableOpacity} from 'react-native';
import {horizontalScale, moderateScale, verticalScale} from '../utils/metrics';

export default OnboardingButton = ({text, onPress, disabled}) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        marginHorizontal: horizontalScale(50),
        paddingHorizontal: horizontalScale(50),
        borderRadius: moderateScale(5),
        paddingVertical: verticalScale(15),
        marginBottom: verticalScale(20),
        width: '85%',
      }}
      disabled={disabled || false}
      onPress={onPress}>
      <Text
        allowFontScaling={false}
        style={{
          color: '#026AA2',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: moderateScale(18),
        }}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};
