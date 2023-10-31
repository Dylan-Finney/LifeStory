import {Pressable, Text} from '@gluestack-ui/themed';

export default CustomButton = ({index, text, onPress, active = false}) => {
  return (
    <Pressable
      py={5}
      px={10}
      rounded={'$sm'}
      onPress={onPress}
      backgroundColor={active ? '$primary300' : '$backgroundLight300'}
      key={index}>
      <Text allowFontScaling={false}>{text}</Text>
    </Pressable>
  );
};
