import {Box, Pressable} from '@gluestack-ui/themed';
import AngerIcon from '../assets/emotions/Anger.svg';
import FrownIcon from '../assets/emotions/Frown.svg';
import GrinIcon from '../assets/emotions/Grin.svg';
import NeutralIcon from '../assets/emotions/Neutral.svg';
import SmileIcon from '../assets/emotions/Smile.svg';

export default EmotionButton = ({index, onPress, active, emotionNum}) => {
  const emotions = {
    NA: 0,
    HORRIBLE: 1,
    BAD: 2,
    NEUTRAL: 3,
    GOOD: 4,
    GREAT: 5,
  };

  const emotionAttributes = {
    BORDER: 0,
    BACKGROUND: 1,
    STROKE: 2,
  };

  const emotionToColor = ({emotion, need}) => {
    switch (emotion) {
      case emotions.HORRIBLE:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#E93535';
          case emotionAttributes.BACKGROUND:
            return '#FDEBEB';
          default:
            return 'black';
        }
      case emotions.BAD:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#C839D4';
          case emotionAttributes.BACKGROUND:
            return '#F9EBFB';
          default:
            return 'black';
        }
      case emotions.NEUTRAL:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#6D6D6D';
          case emotionAttributes.BACKGROUND:
            return '#E7E7E7';
          default:
            return 'black';
        }
      case emotions.GOOD:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#118ED1';
          case emotionAttributes.BACKGROUND:
            return '#E7F4FA';
          default:
            return 'black';
        }
      case emotions.GREAT:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return '#11A833';
          case emotionAttributes.BACKGROUND:
            return '#E7F6EB';
          default:
            return 'black';
        }
      default:
        switch (need) {
          case emotionAttributes.BORDER:
            return '#E7E7E7';
          case emotionAttributes.STROKE:
            return 'black';
          case emotionAttributes.BACKGROUND:
            return 'black';
          default:
            return 'black';
        }
    }
  };

  const emotionToIcon = ({emotion, active, color}) => {
    const primaryColor =
      color === undefined
        ? active
          ? emotionToColor({
              emotion,
              need: emotionAttributes.STROKE,
            })
          : '#0b0b0b99'
        : color;
    switch (emotion) {
      case emotions.HORRIBLE:
        return <AngerIcon primaryColor={primaryColor} />;
      case emotions.BAD:
        return <FrownIcon primaryColor={primaryColor} />;
      case emotions.NEUTRAL:
        return <NeutralIcon primaryColor={primaryColor} />;
      case emotions.GOOD:
        return <SmileIcon primaryColor={primaryColor} />;
      case emotions.GREAT:
        return <GrinIcon primaryColor={primaryColor} />;
      default:
        return <></>;
    }
  };

  return (
    <Pressable onPress={onPress}>
      <Box
        width={50}
        height={50}
        backgroundColor={
          active === true
            ? emotionToColor({
                emotion: emotionNum,
                need: emotionAttributes.BACKGROUND,
              })
            : 'white'
        }
        borderWidth={1}
        justifyContent="center"
        alignItems="center"
        borderColor={
          active === true
            ? emotionToColor({
                emotion: emotionNum,
                need: emotionAttributes.BACKGROUND,
              })
            : emotionToColor({
                need: emotionAttributes.BORDER,
              })
        }
        rounded={'$md'}>
        <Box aspectRatio={1} height={'65%'} width={'65%'}>
          {emotionToIcon({
            emotion: emotionNum,
            active: active === true,
          })}
        </Box>
        {/* default stroke: 6D6D6D */}
      </Box>
    </Pressable>
  );
};
