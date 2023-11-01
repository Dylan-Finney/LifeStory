import {Pressable, Text} from '@gluestack-ui/themed';

export default CustomButton = ({index, text, onPress, active = false}) => {
  return (
    <Pressable
      py={5}
      px={10}
      rounded={'$sm'}
      onPress={onPress}
      backgroundColor={active ? '#E8F4FB' : '#E7E7E7'}
      key={index}>
      <Text
        color={active ? '#118ED1' : '#636363'}
        fontWeight={500}
        allowFontScaling={false}>
        {text}
      </Text>
    </Pressable>
  );
};
