import {emotionAttributes, emotions} from './Enums';
import AngerIcon from '../assets/emotions/Anger.svg';
import FrownIcon from '../assets/emotions/Frown.svg';
import GrinIcon from '../assets/emotions/Grin.svg';
import NeutralIcon from '../assets/emotions/Neutral.svg';
import SmileIcon from '../assets/emotions/Smile.svg';

export const emotionToColor = ({emotion, need}) => {
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

export const emotionToIcon = ({emotion, active, color}) => {
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

export const emotionToString = emotion => {
  switch (emotion) {
    case emotions.HORRIBLE:
      return 'Bad';
    case emotions.BAD:
      return 'Sad';
    case emotions.NEUTRAL:
      return 'Neutral';
    case emotions.GOOD:
      return 'Glad';
    case emotions.GREAT:
      return 'Happy';

    default:
      return 'N/A';
  }
};
