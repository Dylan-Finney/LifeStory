import {theme} from './Styling';
import FaceFrownIcon from './src/assets/face-frown.svg';
import FaceHappyIcon from './src/assets/face-happy.svg';
import FaceNeutralIcon from './src/assets/face-neutral.svg';
import FaceSadIcon from './src/assets/face-sad.svg';
import EmotionTaggingIcon from './src/assets/emotion-tagging-icon.svg';

export const baseContentTags = [
  'Travel',
  'Personal',
  'Work',
  'Relationships',
  'Gratitude',
  'Health',
  'Achievements',
  'Growth',
  'Creativity',
  'Happiness',
  'Reflections',
  'Challenges',
  'Family',
  'Outdoors',
  'Lessons Learned',
  'Parenting',
  'Events & celebrations',
  'Nostalgia',
  'Books',
  'Movies',
  'Food',
  'Dining',
  'Fitness',
  'Dreams',
  'Goals',
  'Memories',
  'Inspiration',
];
export const toneTags = [
  'Informative',
  'Direct',
  'Professional',
  'Funny',
  'Reflective',
  'Creative',
  'Poetic',
];
export const emotionTags = [
  'Neutral',
  'Positive',
  'Excited',
  'Disheartened',
  'Sad',
  'Angry',
];
export const emotions = [
  {
    icon: picked => (
      <FaceSadIcon
        stroke={
          picked
            ? theme.entry.buttons.toggle.icon.active
            : theme.entry.buttons.toggle.icon.inactive
        }
        height={20}
        width={25}
        strokeWidth={3.2}
      />
    ),
    txt: 'Annoyed',
  },
  {
    icon: picked => (
      <FaceFrownIcon
        stroke={
          picked
            ? theme.entry.buttons.toggle.icon.active
            : theme.entry.buttons.toggle.icon.inactive
        }
        height={20}
        width={25}
        strokeWidth={3.2}
      />
    ),
    txt: 'Sad',
  },
  {
    icon: picked => (
      <FaceNeutralIcon
        stroke={
          picked
            ? theme.entry.buttons.toggle.icon.active
            : theme.entry.buttons.toggle.icon.inactive
        }
        height={20}
        width={25}
        strokeWidth={3.2}
      />
    ),
    txt: 'Indifferent',
  },
  {
    icon: picked => (
      <EmotionTaggingIcon
        stroke={
          picked
            ? theme.entry.buttons.toggle.icon.active
            : theme.entry.buttons.toggle.icon.inactive
        }
        height={20}
        strokeWidth={3.2}
      />
    ),
    txt: 'Good',
  },
  {
    icon: picked => (
      <FaceHappyIcon
        stroke={
          picked
            ? theme.entry.buttons.toggle.icon.active
            : theme.entry.buttons.toggle.icon.inactive
        }
        height={20}
        width={25}
        strokeWidth={3.2}
      />
    ),
    txt: 'Great',
  },
];

export const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const replaceAtStart = (array, diffCalc) => {
  return array.map(obj => {
    var startIndex =
      obj.startIndex === 0
        ? 0
        : obj.startIndex + (diffCalc[1].count - diffCalc[0].count);
    var endIndex = obj.endIndex + (diffCalc[1].count - diffCalc[0].count);
    return {
      ...obj,
      startIndex,
      endIndex,
    };
  });
};

const replaceAtEnd = (array, diffCalc) => {
  return array.map(obj => {
    var startIndex = obj.startIndex;
    var endIndex =
      obj.endIndex > diffCalc[0].count
        ? obj.endIndex + (diffCalc[2].count - diffCalc[1].count)
        : obj.endIndex;
    return {
      ...obj,
      startIndex,
      endIndex,
    };
  });
};

const replaceAtMiddle = (array, diffCalc) => {
  return array.map(obj => {
    var startIndex =
      obj.startIndex > diffCalc[0].count + 1
        ? obj.startIndex + (diffCalc[2].count - diffCalc[1].count)
        : obj.startIndex;
    var endIndex =
      obj.endIndex > diffCalc[0].count
        ? obj.endIndex + (diffCalc[2].count - diffCalc[1].count)
        : obj.endIndex;
    return {
      ...obj,
      startIndex,
      endIndex,
    };
  });
};

const addAtStart = (array, diffCalc) => {
  return array.map(obj => {
    var startIndex = obj.startIndex + diffCalc.count;
    var endIndex = obj.endIndex + diffCalc.count;
    return {
      ...obj,
      startIndex,
      endIndex,
    };
  });
};
const addAtEnd = (array, diffCalc) => {};
const addAtMiddle = (array, diffCalc, indice) => {
  return array.map(obj => {
    var startIndex =
      indice > obj.startIndex
        ? obj.startIndex
        : obj.startIndex + diffCalc.count;
    var endIndex =
      indice > obj.endIndex ? obj.endIndex : obj.endIndex + diffCalc.count;
    return {
      ...obj,
      startIndex,
      endIndex,
    };
  });
};

const deleteAtStart = (array, diffCalc) => {
  return array.map(obj => {
    var startIndex = obj.startIndex === 0 ? 0 : obj.startIndex - 1;
    var endIndex = obj.endIndex - 1;
    return {
      ...obj,
      startIndex,
      endIndex,
    };
  });
};

const deleteAtEnd = (array, diffCalc, indice) => {
  return array.map(obj => {
    var startIndex = obj.startIndex;
    var endIndex = obj.endIndex >= indice ? indice : obj.endIndex;
    return {
      ...obj,
      startIndex,
      endIndex,
    };
  });
};

const deleteAtMiddle = (array, diffCalc, indice) => {
  return array.map(obj => {
    var startIndex =
      indice > obj.startIndex
        ? obj.startIndex
        : obj.startIndex - diffCalc.count;
    var endIndex =
      indice > obj.endIndex ? obj.endIndex : obj.endIndex - diffCalc.count;
    return {
      ...obj,
      startIndex,
      endIndex,
    };
  });
};

const removeEmpty = array => {
  return array.filter(obj => {
    if (obj.startIndex < obj.endIndex) {
      return true;
    } else {
      return false;
    }
  });
};

export const textChangeHelperFuncs = {
  replaceAtStart,
  replaceAtMiddle,
  replaceAtEnd,
  addAtStart,
  addAtMiddle,
  addAtEnd,
  deleteAtStart,
  deleteAtMiddle,
  deleteAtEnd,
  removeEmpty,
};
