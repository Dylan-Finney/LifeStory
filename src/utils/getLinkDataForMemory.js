import {CUSTOM_HYPERLINK_REGEX, LINK_DOMAIN_REGEX, URL_REGEX} from './regex';

export const getLinkDataForMemory = memory => {
  var newBody = [];
  var newBody2 = [];
  var matches2 = [];
  var splitBody2 = [];
  var formattedText2 = [];
  var links2 = [];
  var linksFinal = [];
  // var match;
  // while ((match = /\[([^\]]+)\]\([^)]+\)/g.exec(item.body)) !== null) {
  //   console.log({match});
  //   if (match !== null) {
  //     newBody.push(match);
  //   }
  // }

  //Example Body: "This is a text based from the www.google.com website. This [image](www.imageurl.com) is from the internet."

  //Splits the memory body everytime there is a custom hyperlink
  //E.g. ["This is a text based from the www.google.com website. This ", "image", " is from the internet."]
  newBody = memory.body.split(CUSTOM_HYPERLINK_REGEX);

  //Get all custom hyperlinks ([text](link)) from the memory
  //E.g. ["[image](www.imageurl.com)"]
  newBody2 = memory.body.match(CUSTOM_HYPERLINK_REGEX);

  //Get all the either the first URL from the hyperlink or return null
  //E.g. ["www.imageurl.com"]
  newBody2?.map((test, testIndex) => {
    var newLinkStr = test.substring(
      `[${newBody[1 + 2 * testIndex]}](`.length,
      test.length - 1,
    );
    var matches = newLinkStr.match(URL_REGEX);
    links2.push(matches?.length > 0 ? matches[0] : null);
    // links2.push(test.match(URL_REGEX));
  });

  //For all parts of the body that is not a hyperlink, get all of the urls and split the part based on the url
  // E.g. ["This is a text based from the www.google.com website. This ", " is from the internet."] ->
  // [["www.google.com"], null]
  // [["This is a text based from the " , " website. This "], [" is from the internet."]]
  for (var i = 0; i < newBody.length; i = i + 2) {
    matches2.push(newBody[i].match(URL_REGEX));
    splitBody2.push(newBody[i].split(URL_REGEX));
  }

  //Creates an array of the formatted Text, every even index should be normal text. Every odd index should be either hyperlink or URL.
  //["This is a text based from the", "www.google.com", " website. This ","image", " is from the internet."]
  splitBody2.map((splitBody, index) => {
    splitBody.map((part, index2) => {
      formattedText2.push(part);
      if (matches2[index]?.length > 0 && index2 !== splitBody.length - 1) {
        formattedText2.push(matches2[index][index2]);
      }
    });
    // if (index % 2 === 1) {
    formattedText2.push(newBody[1 + 2 * index]);
    // }
    // formattedText2.push(matches2[index][index2]);
  });

  //Ordered array of links ordered as they appear in memory
  // ["www.google.com","www.imageurl.com"]
  for (var i = 0; i < Math.floor(newBody.length / 2); i++) {
    matches2[i]?.map(link => {
      linksFinal.push(link !== null && link);
    });
    // if (links2[i] !== null) linksFinal.push(links2[i]);
    linksFinal.push(links2[i]);
  }

  matches2[Math.floor(newBody.length / 2)]?.map(link => {
    linksFinal.push(link.toLowerCase().split(LINK_DOMAIN_REGEX)[1]);
  });
  return {linksFinal, formattedText2};
};
