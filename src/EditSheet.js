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
                'Your job is to rewrite the contents of a diary entry to adhere to the provided emotion and tone, and lengthen the entry such that it provides the same information in more characters. The diary entry should be based on the current contents of the diary entry. Respond with just the diary entry contents, e.g. Today was a good day.',
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

const CategoryButton = ({index, text, onPress, active = false}) => {
  return (
    <Pressable
      py={5}
      px={10}
      rounded={'$sm'}
      onPress={onPress}
      backgroundColor={active ? '$primary300' : '$backgroundLight300'}
      key={index}>
      <Text>{text}</Text>
    </Pressable>
  );
};

const LabelStack = ({includes, handle, labels}) => {
  return (
    <HStack flexWrap={'wrap'} gap={10}>
      {labels.map((item, index) => {
        return (
          <CategoryButton
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

const EditTextArea = ({
  attr,
  loadingAction,
  setLoadingAction,
  body,
  title,
  update,
  reset,
  different,
}) => {
  return (
    <Textarea height={150} mb={20}>
      <Box flexDirection="row" gap={10} ml={15} mt={10} mb={10}>
        <Pressable
          backgroundColor={
            loadingAction.action === actions.REWRITE &&
            loadingAction.attr === attr
              ? 'green'
              : 'white'
          }
          rounded={'$md'}
          borderWidth={1}
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
          <RewriteIcon />
        </Pressable>
        <Pressable
          backgroundColor={
            loadingAction.action === actions.REWRITE &&
            loadingAction.attr === attr
              ? 'green'
              : 'white'
          }
          rounded={'$md'}
          borderWidth={1}
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
            loadingAction.action === actions.REWRITE &&
            loadingAction.attr === attr
              ? 'green'
              : 'white'
          }
          rounded={'$md'}
          borderWidth={1}
          padding={5}
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
                ? 'green'
                : 'white'
            }
            rounded={'$md'}
            borderWidth={1}
            padding={5}
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
    <Box px={25}>
      <Box flexDirection="row" justifyContent="space-between">
        <Pressable
          alignSelf="flex-start"
          onPress={() => {
            cancel();
          }}>
          <Text>Cancel</Text>
        </Pressable>
        <Text
          allowFontScaling={false}
          fontWeight={'$bold'}
          pl={create ? 7 : type === 'memory' ? 15 : 9}>
          {create
            ? 'Create New'
            : type === 'memory'
            ? 'Edit Memory'
            : 'Edit Story'}
        </Text>

        <Pressable
          alignSelf="flex-end"
          onPress={() => {
            if (tempBody.trim().length !== 0) {
              success({
                title: tempTitle,
                body: tempBody,
                tempLastBodyEdit,
                tempLastTitleEdit,
              });
            }
          }}>
          <Text>{create ? 'Create' : 'Update'}</Text>
        </Pressable>
      </Box>
      <Divider height={1} width={'$100'} mt={20} mb={20} />
      <Text allowFontScaling={false} textAlign={'center'}>
        Labels help add meaning and find content more easily
      </Text>
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
      />
      <Text allowFontScaling={false}>Styles for automated texts</Text>
      <Text allowFontScaling={false}>
        Customize automated outputs by using the options below
      </Text>
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
      <Divider height={1} width={'$100'} mt={20} mb={20} />
      <Text allowFontScaling={false}>Emotion</Text>
      <LabelStack
        includes={item => writingStyleSettings.emotion === item}
        handle={item =>
          writingStyleSettings.emotion === item
            ? setWritingStyleSettings({
                ...writingStyleSettings,
                emotion: undefined,
              })
            : setWritingStyleSettings({...writingStyleSettings, emotion: item})
        }
        labels={[
          'Neutral',
          'Positive',
          'Excited',
          'Disheartened',
          'Sad',
          'Angry',
        ]}
      />
    </Box>
  );
};
