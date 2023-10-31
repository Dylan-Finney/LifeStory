import {
  Button,
  ButtonText,
  Input,
  Pressable,
  TextareaInput,
  KeyboardAvoidingView,
  ScrollView,
  VStack,
} from '@gluestack-ui/themed';
import {InputField} from '@gluestack-ui/themed';
import {InputSlot} from '@gluestack-ui/themed';
import {HStack, Text, Divider} from '@gluestack-ui/themed';
import {Box} from '@gluestack-ui/themed';
import {useState} from 'react';
import useSettingsHooks from './utils/hooks/useSettingsHooks';
import LabelStack from './LabelStack';

export default LabellingSheet = ({
  update,
  activeLabels = {
    roles: [],
    modes: [],
    other: [],
  },
}) => {
  const categories = {
    MODES: 0,
    ROLES: 1,
    OTHER: 2,
  };

  const [newCustomLabel, setNewCustomLabel] = useState('');

  const defaultLabels = {
    roles: [
      'Free Time',
      'Travel',
      'Vacation',
      'Work',
      'Party',
      'Fitness',
      'Weekend',
      'Study',
      'Family',
      'Quiet Time',
      'Hobby',
      'Outdoor',
      'Event',
    ],
    modes: [
      'Professional',
      'Parent',
      'Sibling',
      'Student',
      'Partner',
      'Spouse',
      'Caregiver',
      'Volunteer',
      'Creator',
      'Hobbyist',
      'Coach',
      'Exerciser',
    ],
    other: [
      'Health',
      'Gratitude',
      'Dreams',
      'Growth',
      'Achievements',
      'Happiness',
      'Challenges',
      'Lessons Learned',
      'Nostalgia',
      'Inspiration',
    ],
  };

  const [customLabels, setCustomLabels] = useState(
    JSON.parse(useSettingsHooks.getString('settings.customLabels')),
  );
  const [selectedCategory, setSelectedCategory] = useState(categories.MODES);

  console.log({activeLabels});
  const [selectedLabels, setSelectedLabels] = useState(activeLabels);

  const handleLabelClick = ({item, type}) => {
    var indexInSelectedLabels = selectedLabels[type].findIndex(
      element => element === item,
    );
    var selectedLabelsCopy = {...selectedLabels};
    if (indexInSelectedLabels >= 0) {
      var newArray = [...selectedLabels[type]];
      newArray.splice(indexInSelectedLabels, 1);
      selectedLabelsCopy[type] = newArray;
    } else {
      selectedLabelsCopy[type] = [...selectedLabels[type], item];
    }
    setSelectedLabels(selectedLabelsCopy);
    update({labels: selectedLabelsCopy});
  };
  console.log({customLabels});
  console.log({newCustomLabel});

  return (
    <Box px={25}>
      <Text allowFontScaling={false} fontWeight={'$bold'} textAlign={'center'}>
        Add Labels
      </Text>
      <Text allowFontScaling={false} textAlign={'center'}>
        Labels help add meaning and find content more easily
      </Text>
      <Text allowFontScaling={false} fontWeight={'$bold'}>
        New
      </Text>
      <Text allowFontScaling={false} textAlign={'left'}>
        Create new label and choose the category
      </Text>
      <Input textAlign="center" alignItems="center">
        <InputField
          value={newCustomLabel}
          onChangeText={text => {
            setNewCustomLabel(text);
          }}
          type="text"
          placeholder="Create new..."
        />
        <InputSlot p={0}>
          <Pressable
            size="xs"
            rounded={'$sm'}
            backgroundColor="red"
            px={10}
            py={2}
            mr={10}
            onPress={() => {
              const addLabel = ({category}) => {
                if (!customLabels[category].includes(newCustomLabel)) {
                  var customLabelsCopy = {...customLabels};
                  customLabelsCopy[category] = [
                    ...customLabels[category],
                    newCustomLabel,
                  ];
                  setCustomLabels(customLabelsCopy);
                  useSettingsHooks.set(
                    'settings.customLabels',
                    JSON.stringify(customLabelsCopy),
                  );
                }
              };
              switch (selectedCategory) {
                case categories.MODES:
                  addLabel({category: 'modes'});

                  break;
                case categories.ROLES:
                  addLabel({category: 'roles'});

                  break;
                case categories.OTHER:
                  addLabel({category: 'other'});

                  break;
              }
            }}>
            <Text>Create</Text>
          </Pressable>
        </InputSlot>
      </Input>
      <HStack
        rounded={'$sm'}
        borderWidth={'$1'}
        width={'100%'}
        // px={'$2.5'}
        borderColor="$backgroundLight300">
        <Pressable
          flex={1}
          onPress={() => {
            setSelectedCategory(categories.MODES);
          }}
          backgroundColor={
            selectedCategory === categories.MODES ? '$red100' : 'white'
          }>
          <Text textAlign="center">Modes</Text>
        </Pressable>
        <Divider orientation="vertical" />
        <Pressable
          flex={1}
          onPress={() => {
            setSelectedCategory(categories.ROLES);
          }}
          backgroundColor={
            selectedCategory === categories.ROLES ? '$red100' : 'white'
          }>
          <Text textAlign="center">Roles</Text>
        </Pressable>
        <Divider orientation="vertical" />

        <Pressable
          flex={1}
          onPress={() => {
            setSelectedCategory(categories.OTHER);
          }}
          backgroundColor={
            selectedCategory === categories.OTHER ? '$red100' : 'white'
          }>
          <Text textAlign="center">Other</Text>
        </Pressable>
      </HStack>
      <Divider height={1} width={'$100'} mt={20} mb={20} />
      <Text allowFontScaling={false} fontWeight={'$bold'}>
        Modes
      </Text>

      <Text allowFontScaling={false}>
        Select the mode(s) that best describe this entry.
      </Text>

      <LabelStack
        includes={item => selectedLabels.modes?.includes(item)}
        handle={item => handleLabelClick({item, type: 'modes'})}
        labels={[...defaultLabels.modes, ...customLabels.modes]}
        type={categories.MODES}
      />
      <Divider height={1} width={'$100'} mt={20} mb={20} />
      <Text allowFontScaling={false} fontWeight={'$bold'}>
        Roles
      </Text>
      <Text allowFontScaling={false}>
        Select your life role(s) that best define this entry.
      </Text>

      <LabelStack
        includes={item => selectedLabels.roles?.includes(item)}
        handle={item => handleLabelClick({item, type: 'roles'})}
        labels={[...defaultLabels.roles, ...customLabels.roles]}
        type={categories.ROLES}
      />
      <Divider height={1} width={'$100'} mt={20} mb={20} />
      <Text allowFontScaling={false} fontWeight={'$bold'}>
        Other
      </Text>
      <LabelStack
        includes={item => selectedLabels.other?.includes(item)}
        handle={item => handleLabelClick({item, type: 'other'})}
        labels={[...defaultLabels.other, ...customLabels.other]}
        type={categories.OTHER}
      />
    </Box>
  );
};
