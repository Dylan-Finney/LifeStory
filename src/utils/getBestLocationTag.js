import useSettingsHooks from './hooks/useSettingsHooks';
import useDatabaseHooks from './hooks/useDatabaseHooks';

const {getGlossaryItemsOfType} = useDatabaseHooks();
const getAddressName = async address => {
  var locationAliasesArray = await getGlossaryItemsOfType({type: 'Location'});
  var aliasObj = locationAliasesArray.find(
    locationAliasObj => locationAliasObj.data === address,
  );
  console.log({locationAliasesArray, aliasObj});
  if (aliasObj !== undefined) {
    return aliasObj.alias;
  } else {
    return '';
  }
};

const getBestLocationTag = async (description, bestFallback) => {
  if (description === undefined) {
    return '';
  }

  var addressArray = description?.split(',');
  var index = 0;
  var alias = await getAddressName(addressArray[0].trim());
  console.log({alias});
  if (alias === '' || addressArray[0].trim() === '') {
    // for (var i = 0; i < addressArray.length; i++) {
    //   if (!/^\d$/.test(addressArray[i].trim().charAt(0))) {
    //     index = i;
    //     break;
    //   }
    // }
    return bestFallback;
  } else {
    return alias;
  }
};

export default getBestLocationTag;
