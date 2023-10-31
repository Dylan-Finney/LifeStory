import {HStack} from '@gluestack-ui/themed';
import CustomButton from './CustomButton';

export default LabelStack = ({includes, handle, labels}) => {
  return (
    <HStack flexWrap={'wrap'} gap={10}>
      {labels.map((item, index) => {
        return (
          <CustomButton
            text={item}
            index={index}
            key={index}
            active={includes(item)}
            onPress={() => {
              handle(item);
            }}
          />
        );
      })}
    </HStack>
  );
};
