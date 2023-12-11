import {View, Text, ScrollView} from 'react-native';
import AppContext from '../../../contexts/AppContext';
import {useContext} from 'react';
export default InsightsView = ({}) => {
  const {
    loadingEntries,
    entries,
    setEntries,
    onBoarding,
    setOnBoarding,
    memories,
    setMemories,
    devMode,
    checkIfReadyToGenerate,
    readyToGenerateMemory,
    memoryLoadingMessage,
    setMemoryLoadingMessage,
    checkIfMemoryReadyToGenerate,
  } = useContext(AppContext);
  const groupBy = (list, keyGetter) => {
    const map = new Map();
    list.forEach(item => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  };
  function indexOfMax(arr) {
    if (arr.length === 0) {
      return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        maxIndex = i;
        max = arr[i];
      }
    }

    return maxIndex;
  }

  const testData = Array.from(
    groupBy(memories, memory => new Date(memory.time).toLocaleDateString()),
  );
  const memoriesPerDay = testData.map(arr => arr[1].length);
  console.log(JSON.stringify(testData));
  return (
    <ScrollView>
      <Text>Total Number of Memories: {memories.length}</Text>
      <Text>
        Average Number of Memories a Day:{' '}
        {memoriesPerDay.reduce((total, num) => {
          return total + num;
        }, 0) / memoriesPerDay.length}
      </Text>
      <Text>
        Day with Most Memories: {testData[indexOfMax(memoriesPerDay)][0]} with{' '}
        {memoriesPerDay[indexOfMax(memoriesPerDay)]}
      </Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
    </ScrollView>
  );
};
