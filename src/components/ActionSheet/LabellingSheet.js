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
import useSettingsHooks from '../../utils/hooks/useSettingsHooks';
import LabelStack from './LabelStack';
import ModesIcon from '../../assets/categories/Modes.svg';
import RolesIcon from '../../assets/categories/Roles.svg';
import OtherIcon from '../../assets/categories/Other.svg';
import LabelIcon from '../../assets/Labelling.svg';

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
    modes: [
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
    roles: [
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
  const [canCreateLabel, setCanCreateLabel] = useState(false);

  console.log({activeLabels});
  const [selectedLabels, setSelectedLabels] = useState({
    roles: activeLabels.roles || [],
    modes: activeLabels.modes || [],
    other: activeLabels.other || [],
  });
  console.log({selectedLabels});
  const handleLabelClick = ({item, type}) => {
    console.log({item, type, selectedLabels});
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

  const handleCanCreate = ({text}) => {
    const check = ({category}) => {
      if (!customLabels[category].includes(text) && text.length > 0) {
        setCanCreateLabel(true);
      } else {
        setCanCreateLabel(false);
      }
    };

    switch (selectedCategory) {
      case categories.MODES:
        check({category: 'modes'});
        break;
      case categories.ROLES:
        check({category: 'roles'});
        break;
      case categories.OTHER:
        check({category: 'other'});
        break;
    }
  };
  console.log({customLabels});
  console.log({newCustomLabel});

  return (
    <Box>
      <Box width="100vw" justifyContent="center" alignItems="center">
        <Box
          alignItems="center"
          justifyContent="center"
          flexDirection="row"
          gap={5}>
          <Box
            paddingHorizontal={4}
            paddingVertical={4}
            alignItems="center"
            justifyContent="center"
            backgroundColor="white"
            borderColor="#E7E7E7"
            borderRadius={5}
            borderWidth={2}>
            <LabelIcon height={15} width={15} primaryColor={'#6D6D6D'} />
          </Box>
          <Text
            fontSize={20}
            allowFontScaling={false}
            fontWeight={'$bold'}
            textAlign={'center'}>
            Add Labels
          </Text>
        </Box>

        <Text
          allowFontScaling={false}
          textAlign={'center'}
          fontSize={13}
          width={'75%'}>
          Labels help add meaning and find content more easily
        </Text>
      </Box>
      <Divider height={1} width={'$100'} mt={20} mb={20} />
      <ScrollView contentContainerStyle={{paddingHorizontal: 25}}>
        <Box alignItems="center" flexDirection="row" gap={5}>
          <ModesIcon primaryColor={'#B6B6B6'} />
          <Text allowFontScaling={false} fontWeight={'$bold'}>
            Modes
          </Text>
        </Box>

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
        <Box alignItems="center" flexDirection="row" gap={5}>
          <RolesIcon primaryColor={'#B6B6B6'} />
          <Text allowFontScaling={false} fontWeight={'$bold'}>
            Roles
          </Text>
        </Box>
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
        <Box alignItems="center" flexDirection="row" gap={5}>
          <OtherIcon primaryColor={'#B6B6B6'} />
          <Text allowFontScaling={false} fontWeight={'$bold'}>
            Other
          </Text>
        </Box>
        <LabelStack
          includes={item => selectedLabels.other?.includes(item)}
          handle={item => handleLabelClick({item, type: 'other'})}
          labels={[...defaultLabels.other, ...customLabels.other]}
          type={categories.OTHER}
        />
        <Divider height={1} width={'$100'} mt={20} mb={20} />

        {/* <Text allowFontScaling={false} fontWeight={'$bold'}>
          New
        </Text> */}

        <Input textAlign="center" alignItems="center">
          <InputField
            value={newCustomLabel}
            onChangeText={text => {
              handleCanCreate({text});
              setNewCustomLabel(text);
            }}
            type="text"
            placeholder="Create new..."
          />
          <InputSlot p={0}>
            <Pressable
              size="xs"
              rounded={'$md'}
              backgroundColor={canCreateLabel === true ? '#E7F4FA' : '#DADADA'}
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
              <Text
                allowFontScaling={false}
                fontWeight={500}
                color={canCreateLabel === true ? '#118ED1' : 'white'}>
                Create
              </Text>
            </Pressable>
          </InputSlot>
        </Input>
        <HStack
          rounded={'$sm'}
          borderWidth={'$1'}
          width={'100%'}
          // px={'$2.5'}
          p={10}
          py={5}
          gap={5}
          mt={15}
          borderColor="$backgroundLight300">
          <Pressable
            flex={1}
            onPress={() => {
              setSelectedCategory(categories.MODES);
            }}
            rounded={'$sm'}
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            gap={5}
            backgroundColor={
              selectedCategory === categories.MODES ? '#E7F4FA' : 'white'
            }>
            <ModesIcon
              primaryColor={
                selectedCategory === categories.MODES ? '#118ED1' : '#B6B6B6'
              }
            />
            <Text
              allowFontScaling={false}
              color={
                selectedCategory === categories.MODES ? '#118ED1' : '#6D6D6D'
              }
              textAlign="center">
              Modes
            </Text>
          </Pressable>
          {/* <Divider orientation="vertical" /> */}
          <Pressable
            flex={1}
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            rounded={'$sm'}
            gap={5}
            onPress={() => {
              setSelectedCategory(categories.ROLES);
            }}
            backgroundColor={
              selectedCategory === categories.ROLES ? '#E7F4FA' : 'white'
            }>
            <RolesIcon
              primaryColor={
                selectedCategory === categories.ROLES ? '#118ED1' : '#B6B6B6'
              }
            />

            <Text
              allowFontScaling={false}
              color={
                selectedCategory === categories.ROLES ? '#118ED1' : '#6D6D6D'
              }
              textAlign="center">
              Roles
            </Text>
          </Pressable>
          {/* <Divider orientation="vertical" /> */}

          <Pressable
            flex={1}
            justifyContent="center"
            alignItems="center"
            flexDirection="row"
            rounded={'$sm'}
            gap={5}
            onPress={() => {
              setSelectedCategory(categories.OTHER);
            }}
            backgroundColor={
              selectedCategory === categories.OTHER ? '#E7F4FA' : 'white'
            }>
            <OtherIcon
              primaryColor={
                selectedCategory === categories.OTHER ? '#118ED1' : '#B6B6B6'
              }
            />

            <Text
              allowFontScaling={false}
              color={
                selectedCategory === categories.OTHER ? '#118ED1' : '#6D6D6D'
              }
              textAlign="center">
              Other
            </Text>
          </Pressable>
        </HStack>
        <Text
          allowFontScaling={false}
          textAlign={'center'}
          fontSize={13}
          marginVertical={10}>
          Create new label and choose the category
        </Text>
      </ScrollView>
    </Box>
  );
};
