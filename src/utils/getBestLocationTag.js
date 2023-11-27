import useSettingsHooks from './hooks/useSettingsHooks';
const getAddressName = address => {
  var locationAliasesArray = JSON.parse(
    useSettingsHooks.getString('settings.locationAliases'),
  );
  var aliasObj = locationAliasesArray.find(
    locationAliasObj => locationAliasObj.address === address,
  );
  if (aliasObj !== undefined) {
    return aliasObj.alias;
  } else {
    return '';
  }
};

const getBestLocationTag = description => {
  if (description === undefined) {
    return '';
  }

  var addressArray = description?.split(',');
  var index = 0;
  var alias = getAddressName(addressArray[0].trim());
  if (alias === '') {
    for (var i = 0; i < addressArray.length; i++) {
      if (!/^\d$/.test(addressArray[i].trim().charAt(0))) {
        index = i;
        break;
      }
    }
    return addressArray[index].trim();
  } else {
    return alias;
  }
};

export default getBestLocationTag;
