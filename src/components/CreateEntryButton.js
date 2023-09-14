import {TouchableOpacity, Text} from 'react-native';
import {theme} from '../../Styling';
import {horizontalScale, verticalScale} from '../utils/Metrics';

const CreateEntryButton = ({onPress, text}) => {
  return (
    <TouchableOpacity
      style={{
        borderWidth: 1,
        borderColor: theme.home.createEntryBorder,
        // padding: 5,
        paddingVertical: verticalScale(5),
        paddingHorizontal: horizontalScale(5),
        borderRadius: 5,
      }}
      onPress={onPress}>
      <Text>{text}</Text>
    </TouchableOpacity>
  );
};
export default CreateEntryButton;
