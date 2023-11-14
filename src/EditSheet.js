import {
  Button,
  ButtonText,
  Input,
  Pressable,
  TextareaInput,
  KeyboardAvoidingView,
  ScrollView,
  VStack,
  Textarea,
} from '@gluestack-ui/themed';
import {InputField} from '@gluestack-ui/themed';
import {InputSlot} from '@gluestack-ui/themed';
import {HStack, Text, Divider} from '@gluestack-ui/themed';
import {Box} from '@gluestack-ui/themed';
import {useState} from 'react';
import Config from 'react-native-config';
import RewriteIcon from './assets/rewrite/Rewrite.svg';
import ShortenIcon from './assets/rewrite/Shorten.svg';
import LengthenIcon from './assets/rewrite/Lengthen.svg';
import ReverseIcon from './assets/rewrite/Reverse.svg';
import HistoryIcon from './assets/rewrite/History.svg';
import NewEntryIcon from './assets/NewEntry.svg';
import LabelStack from './LabelStack';
import LabelIcon from '../src/assets/Labelling.svg';
import PenIcon from '../src/assets/Pen.svg';
import getDifferenceUnit from './utils/getDifferenceTime';
import AngerIcon from './assets/emotions/Anger.svg';
import FrownIcon from './assets/emotions/Frown.svg';
import GrinIcon from './assets/emotions/Grin.svg';
import NeutralIcon from './assets/emotions/Neutral.svg';
import SmileIcon from './assets/emotions/Smile.svg';
import EmotionButton from './components/EmotionButton';

const {Configuration, OpenAIApi} = require('openai');
const configuration = new Configuration({
  apiKey: Config.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const attribute = {
  TITLE: 0,
  BODY: 1,
};

const actions = {
  REWRITE: 0,
  LENGTHEN: 1,
  SHORTEN: 2,
  REVERSE: 3,
};

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

const rewriteRequest = async ({attr, action, tempVal, tone, emotion}) => {
  //   setLoading({
  //     attribute: attr === 'title' ? 'title' : 'entry',
  //     action,
  //     stage: 1,
  //   });
  var messages;
  switch (attr) {
    // case 'highlight':
    //   switch (action) {
    //     case 'new':
    //       messages = [
    //         {
    //           role: 'system',
    //           content: `You are an editor. Rewrite the provided text${
    //             writingSettings.tone > -1
    //               ? ` in a ${toneTags[writingSettings.tone]} tone`
    //               : ''
    //           }${
    //             writingSettings.emotion > -1 && writingSettings.tone > -1
    //               ? ` and`
    //               : ''
    //           }${
    //             writingSettings.emotion > -1
    //               ? ` to show a ${emotionTags[writingSettings.emotion]} emotion`
    //               : ''
    //           }.`,
    //         },
    //         {
    //           role: 'user',
    //           content: `Text: "${highlightedText.str}"`,
    //         },
    //       ];
    //       break;
    //     case 'shorten':
    //       messages = [
    //         {
    //           role: 'system',
    //           content: `You are an editor. Rewrite the provided text${
    //             writingSettings.tone > -1
    //               ? ` in a ${toneTags[writingSettings.tone]} tone`
    //               : ''
    //           }${
    //             writingSettings.emotion > -1 && writingSettings.tone > -1
    //               ? ` and`
    //               : ''
    //           }${
    //             writingSettings.emotion > -1
    //               ? ` to show a ${emotionTags[writingSettings.emotion]} emotion`
    //               : ''
    //           }. Shorten it too.`,
    //         },
    //         {
    //           role: 'user',
    //           content: `Text: "${highlightedText.str}"`,
    //         },
    //       ];
    //       break;
    //     case 'lengthen':
    //       messages = [
    //         {
    //           role: 'system',
    //           content: `You are an editor. Rewrite the provided text${
    //             writingSettings.tone > -1
    //               ? ` in a ${toneTags[writingSettings.tone]} tone`
    //               : ''
    //           }${
    //             writingSettings.emotion > -1 && writingSettings.tone > -1
    //               ? ` and`
    //               : ''
    //           }${
    //             writingSettings.emotion > -1
    //               ? ` to show a ${emotionTags[writingSettings.emotion]} emotion`
    //               : ''
    //           }. Lengthen it too.`,
    //         },
    //         {
    //           role: 'user',
    //           content: `Text: "${highlightedText.str}"`,
    //         },
    //       ];
    //       break;
    //   }
    //   break;
    case attribute.TITLE:
      switch (action) {
        case actions.REWRITE:
          messages = [
            {
              role: 'system',
              content:
                'You are a title rewriter. Given a diary entry, provide a suitable diary entry title that adheres to the provided tone and emotion. The title should be picked based on the contents of the diary entry. Respond with just the title, e.g. Today was a good day.',
            },
            {
              role: 'user',
              content: `${tone !== undefined ? `Tone: ${tone}` : ''} ${
                emotion !== undefined ? `Emotion: ${emotion}` : ''
              } Diary Entry: "${tempVal}"`,
            },
          ];
          break;
        case actions.SHORTEN:
          messages = [
            {
              role: 'system',
              content:
                'You are a title rewriter. Given a diary entry title, shorten the title such that it provides the same information but with less characters. Respond with just the title, e.g. Today was a good day.',
            },
            {
              role: 'user',
              content: `Diary Entry Title: "${tempVal}"`,
            },
          ];
          break;
        case actions.LENGTHEN:
          messages = [
            {
              role: 'system',
              content:
                'You are a title rewriter. Given a diary entry title, lengthen the title such that it provides the same information but with more characters. Respond with just the title, e.g. Today was a good day.',
            },
            {
              role: 'user',
              content: `Diary Entry Title: "${tempVal}"`,
            },
          ];
          break;
      }
      break;
    case attribute.BODY:
      switch (action) {
        case actions.REWRITE:
          messages = [
            {
              role: 'system',
              content:
                'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone. The diary entry should be based on the current contents of the diary entry. Keep it short. Respond with just the diary entry contents, e.g. Today was a good day.',
            },
            {
              role: 'user',
              content: `${tone !== undefined ? `Tone: ${tone}` : ''} ${
                emotion !== undefined ? `Emotion: ${emotion}` : ''
              } Diary Entry: "${tempVal}"`,
            },
          ];
          break;
        case actions.SHORTEN:
          messages = [
            {
              role: 'system',
              content:
                'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone, and shorten the entry such that it provides the same information in less characters. The diary entry should be based on the current contents of the diary entry. Respond with just the diary entry contents, e.g. Today was a good day.',
            },
            {
              role: 'user',
              content: `${tone !== undefined ? `Tone: ${tone}` : ''} ${
                emotion !== undefined ? `Emotion: ${emotion}` : ''
              } Diary Entry: "${tempVal}"`,
            },
          ];
          break;
        case actions.LENGTHEN:
          messages = [
            {
              role: 'system',
              content:
                'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone, and lengthen the entry such that it provides the same information in more characters. Be reasonable in the increase of characters. DO NOT write a novel. Only aim to add 50-200 more words. The diary entry should only be based on the current contents of the diary entry. Respond with just the diary entry contents, e.g. Today was a good day.',
            },
            {
              role: 'user',
              content: `${tone !== undefined ? `Tone: ${tone}` : ''} ${
                emotion !== undefined ? `Emotion: ${emotion}` : ''
              } Diary Entry: "${tempVal}"`,
            },
          ];
          break;
      }
      break;
  }
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
  });
  console.log({
    messages,
    completion: completion.data.choices[0].message.content,
  });
  return completion.data.choices[0].message.content;
  // switch (attr) {
  //   case 'entry':
  //     setTempEntry(completion.data.choices[0].message.content);
  //     setTempOrigins({
  //       ...tempOrigins,
  //       entry: Date.now(),
  //     });
  //     break;
  //   case 'highlight':
  //     setHighlightedText({
  //       ...highlightedText,
  //       str: completion.data.choices[0].message.content,
  //     });
  //     break;
  //   case 'title':
  //     setTempTitle(completion.data.choices[0].message.content);
  //     setTempOrigins({
  //       ...tempOrigins,
  //       title: Date.now(),
  //     });
  //     break;
  // }
  // setLoading({});
};

const EditTextArea = ({
  attr,
  loadingAction,
  setLoadingAction,
  body,
  title,
  update,
  reset,
  different,
  time,
}) => {
  return (
    <Textarea height={150} mb={20} rounded={'$lg'}>
      <Box
        justifyContent="space-between"
        flexDirection="row"
        ml={15}
        mr={15}
        mt={10}
        mb={10}>
        <Box flexDirection="row" gap={10}>
          <Pressable
            backgroundColor={
              loadingAction.action === actions.REWRITE &&
              loadingAction.attr === attr
                ? '#E7F4FA'
                : 'white'
            }
            rounded={'$md'}
            borderWidth={1}
            borderColor="#E7E7E7"
            padding={5}
            alignItems={'center'}
            jusitfyCenter={'center'}
            disabled={loadingAction.action !== null}
            onPress={async () => {
              setLoadingAction({
                attr,
                action: actions.REWRITE,
              });
              const response = await rewriteRequest({
                action: actions.REWRITE,
                attr,
                tempVal: body,
              });
              // attr === attribute.TITLE ? setTitle(response) : setBody(response);
              update(response, 'auto', Date.now());
              setLoadingAction({
                attr: null,
                action: null,
              });
            }}>
            <RewriteIcon width={16} />
          </Pressable>
          <Pressable
            backgroundColor={
              loadingAction.action === actions.LENGTHEN &&
              loadingAction.attr === attr
                ? '#E7F4FA'
                : 'white'
            }
            rounded={'$md'}
            borderWidth={1}
            borderColor="#E7E7E7"
            padding={5}
            alignItems={'center'}
            jusitfyCenter={'center'}
            disabled={loadingAction.action !== null}
            onPress={async () => {
              setLoadingAction({
                attr,
                action: actions.LENGTHEN,
              });
              const response = await rewriteRequest({
                action: actions.LENGTHEN,
                attr,
                tempVal: attr === attribute.TITLE ? title : body,
              });
              update(response, 'auto', Date.now());
              setLoadingAction({
                attr: null,
                action: null,
              });
            }}>
            <LengthenIcon />
          </Pressable>
          <Pressable
            backgroundColor={
              loadingAction.action === actions.SHORTEN &&
              loadingAction.attr === attr
                ? '#E7F4FA'
                : 'white'
            }
            rounded={'$md'}
            borderWidth={1}
            padding={5}
            borderColor="#E7E7E7"
            alignItems={'center'}
            jusitfyCenter={'center'}
            disabled={loadingAction.action !== null}
            onPress={async () => {
              setLoadingAction({
                attr,
                action: actions.SHORTEN,
              });
              const response = await rewriteRequest({
                action: actions.SHORTEN,
                attr,
                tempVal: attr === attribute.TITLE ? title : body,
              });
              update(response, 'auto', Date.now());
              setLoadingAction({
                attr: null,
                action: null,
              });
            }}>
            <ShortenIcon />
          </Pressable>
          {different === true && (
            <Pressable
              backgroundColor={
                loadingAction.action === actions.REVERSE &&
                loadingAction.attr === attr
                  ? '#E7F4FA'
                  : 'white'
              }
              rounded={'$md'}
              borderWidth={1}
              padding={5}
              borderColor="#E7E7E7"
              alignItems={'center'}
              jusitfyCenter={'center'}
              disabled={loadingAction.action !== null}
              onPress={() => {
                setLoadingAction({
                  attr,
                  action: actions.REVERSE,
                });
                reset();
                setLoadingAction({
                  attr: null,
                  action: null,
                });
              }}>
              {/* <Box
            width={20}
            height={20}
            backgroundColor={
              loadingAction === actions.REVERSE && loadingAction.attr === attr
                ? 'green'
                : 'red'
            }
          > */}
              <ReverseIcon />

              {/* // </Box> */}
            </Pressable>
          )}
        </Box>
        {time !== undefined && (
          <Box
            rounded={'$full'}
            px={10}
            backgroundColor="#E7F4FA"
            alignItems="center"
            flexDirection="row"
            gap={5}
            // alignContent="flex-end"
          >
            <HistoryIcon />
            <Text fontWeight="500" color="#118ED1">
              {different
                ? 'Now'
                : `${getDifferenceUnit(Math.abs(Date.now() - time))} ago`}
            </Text>
          </Box>
        )}
      </Box>
      <TextareaInput
        //   maxHeight={'%'}
        placeholder="Enter text here..."
        role="document"
        onChangeText={text => {
          update(text, 'manual', Date.now());
        }}
        value={attr === attribute.TITLE ? title : body}
      />
    </Textarea>
  );
};

export default EditSheet = ({
  type = 'story',
  create = false,
  title = '',
  body = '',
  bodyModifiedAt,
  bodyModifiedSource,
  titleModifiedAt,
  titleModifiedSource,
  success,
  cancel,
}) => {
  const categories = {
    TONE: 0,
    EMOTION: 1,
  };

  const [loadingAction, setLoadingAction] = useState({
    attr: null,
    action: null,
  });

  // const rightNow = new Date(Date.now(()))

  const [tempTitle, setTempTitle] = useState(title);
  const [tempLastTitleEdit, setTempLastTitleEdit] = useState({
    source: titleModifiedSource,
    time: titleModifiedAt,
  });
  const [tempBody, setTempBody] = useState(body);
  const [tempLastBodyEdit, setTempLastBodyEdit] = useState({
    source: bodyModifiedSource,
    time: bodyModifiedAt,
  });

  const [writingStyleSettings, setWritingStyleSettings] = useState({
    tone: undefined,
    emotion: undefined,
  });

  const [selectedCategory, setSelectedCategory] = useState(categories.MODES);

  const [selectedLabels, setSelectedLabels] = useState([]);

  const handleLabelClick = ({item}) => {
    var indexInSelectedLabels = selectedLabels.findIndex(
      element => element === item,
    );
    if (indexInSelectedLabels >= 0) {
      var newArray = [...selectedLabels];
      newArray.splice(indexInSelectedLabels, 1);
      setSelectedLabels(newArray);
    } else {
      setSelectedLabels([...selectedLabels, item]);
    }
  };

  return (
    <Box>
      <Box
        px={25}
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center">
        <Pressable
          alignItems="center"
          onPress={() => {
            cancel();
          }}>
          <Text color={'#E93535'} fontWeight="500" textAlign={'center'}>
            Cancel
          </Text>
        </Pressable>
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
            borderWidth={3}>
            {/* <PenIcon height={15} width={15} primaryColor={'#6D6D6D'} /> */}
            <NewEntryIcon />
          </Box>
          <Text
            fontSize={20}
            allowFontScaling={false}
            fontWeight={'$bold'}
            textAlign={'center'}>
            {create
              ? 'Create New'
              : type === 'memory'
              ? 'Edit Memory'
              : 'Edit Story'}
          </Text>
        </Box>

        <Pressable
          alignItems="center"
          onPress={() => {
            if (
              (tempBody.trim().length !== 0 && type === 'memory') ||
              (type === 'story' &&
                tempBody.trim().length !== 0 &&
                tempTitle.trim().length !== 0)
            ) {
              success({
                title: tempTitle,
                body: tempBody,
                tempLastBodyEdit,
                tempLastTitleEdit,
              });
            }
          }}>
          <Text
            color={
              tempTitle !== title || tempBody !== body ? '#118ED1' : '#E7E7E7'
            }
            fontWeight="500"
            textAlign={'center'}>
            {create ? 'Create' : 'Update'}
          </Text>
        </Pressable>
      </Box>
      <Divider height={1} width={'$100'} mt={20} mb={20} />
      <ScrollView contentContainerStyle={{paddingHorizontal: 25}}>
        {type === 'story' && (
          <EditTextArea
            attr={attribute.TITLE}
            body={tempBody}
            setBody={val => setTempBody(val)}
            setTitle={val => setTempTitle(val)}
            loadingAction={loadingAction}
            setLoadingAction={val => setLoadingAction(val)}
            title={tempTitle}
            reset={() => {
              setTempTitle(title);
              setTempLastTitleEdit({
                source: titleModifiedSource,
                time: titleModifiedAt,
              });
            }}
            update={(val, source, time) => {
              setTempTitle(val);
              setTempLastTitleEdit({
                source: source,
                time: time,
              });
            }}
            different={tempTitle !== title}
            time={titleModifiedAt}
          />
        )}

        <EditTextArea
          attr={attribute.BODY}
          body={tempBody}
          setBody={val => setTempBody(val)}
          setTitle={val => setTempTitle(val)}
          loadingAction={loadingAction}
          setLoadingAction={val => setLoadingAction(val)}
          title={tempTitle}
          reset={() => {
            setTempBody(body);
            setTempLastBodyEdit({
              source: bodyModifiedSource,
              time: bodyModifiedAt,
            });
          }}
          update={(val, source, time) => {
            setTempBody(val);
            setTempLastBodyEdit({
              source: source,
              time: time,
            });
          }}
          different={tempBody !== body}
          time={bodyModifiedAt}
        />
        {/* <Text allowFontScaling={false}>Styles for automated texts</Text>
        <Text allowFontScaling={false}>
          Customize automated outputs by using the options below
        </Text> */}
        <Box flexDirection="row" justifyContent="center" gap={10} mb={5}>
          {['Angry', 'Sad', 'Neutral', 'Positive', 'Excited'].map(
            (val, index) => {
              return (
                <EmotionButton
                  key={index}
                  index={index}
                  active={writingStyleSettings.emotion === val}
                  emotionNum={index + 1}
                  onPress={() => {
                    writingStyleSettings.emotion === val
                      ? setWritingStyleSettings({
                          ...writingStyleSettings,
                          emotion: undefined,
                        })
                      : setWritingStyleSettings({
                          ...writingStyleSettings,
                          emotion: val,
                        });
                  }}
                />
              );
            },
          )}
        </Box>
        <Divider height={1} width={'$100'} mt={20} mb={20} />

        <Text allowFontScaling={false}>Tone</Text>
        <LabelStack
          includes={item => writingStyleSettings.tone === item}
          handle={item =>
            writingStyleSettings.tone === item
              ? setWritingStyleSettings({
                  ...writingStyleSettings,
                  tone: undefined,
                })
              : setWritingStyleSettings({...writingStyleSettings, tone: item})
          }
          labels={[
            'Informative',
            'Direct',
            'Professional',
            'Funny',
            'Reflective',
            'Creative',
            'Poetic',
          ]}
        />
        {/* <LabelStack
          includes={item => writingStyleSettings.emotion === item}
          handle={item =>
            writingStyleSettings.emotion === item
              ? setWritingStyleSettings({
                  ...writingStyleSettings,
                  emotion: undefined,
                })
              : setWritingStyleSettings({
                  ...writingStyleSettings,
                  emotion: item,
                })
          }
          labels={[
            'Neutral',
            'Positive',
            'Excited',
            'Disheartened',
            'Sad',
            'Angry',
          ]}
        /> */}
      </ScrollView>
    </Box>
  );
};
