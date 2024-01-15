import useSettingsHooks from './hooks/useSettingsHooks';
import useDatabaseHooks from './hooks/useDatabaseHooks';
// console.log({useDatabaseHooks});

const getAddressName = async address => {
  const {getGlossaryItemsOfType} = useDatabaseHooks();
  var locationAliasesArray = await getGlossaryItemsOfType({type: 'Location'});
  var aliasObj = locationAliasesArray.find(
    locationAliasObj => locationAliasObj.data === address,
  );
  console.log({locationAliasesArray, aliasObj, address});
  if (aliasObj !== undefined) {
    return aliasObj.alias;
  } else {
    return '';
  }
};

const getBestLocationTag = async ({
  description = undefined,
  bestFallback = 'nameless',
  city = undefined,
}) => {
  if (description === undefined) {
    return '';
  }

  var addressArray = description?.split(',');
  var index = 0;
  var firstLine = addressArray[0].trim();
  var alias = await getAddressName(addressArray[0].trim());
  console.log({alias, firstLine});
  const isNotResidental = () => isNaN(firstLine.charAt(0));

  /*
  if no glossay, return city,
  if no city, return address,
  if no address, return ''
  */

  if (alias === '') {
    // for (var i = 0; i < addressArray.length; i++) {
    //   if (!/^\d$/.test(addressArray[i].trim().charAt(0))) {
    //     index = i;
    //     break;
    //   }
    // }
    if (isNotResidental()) return firstLine;
    if (city !== undefined && city !== null) return city.trim();
    if (description !== undefined && description !== null) return firstLine;
    return bestFallback;
    // return bestFallback;
  } else {
    return alias;
  }
};

export default getBestLocationTag;
