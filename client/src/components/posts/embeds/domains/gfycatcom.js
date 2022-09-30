import parse from 'url-parse';

// This seemed like a good idea but it actually seemed slower.
// const enableCache = false;
//
// const setCache = gfyItem => {
//   if (!enableCache) return;
//   const key = `gfycat_${gfyItem.gfyId}`;
//   sessionStorage.setItem(key, JSON.stringify(gfyItem));
// };
//
// const getCache = gfyId => {
//   if (!enableCache) return;
//   const id = gfyId.toLowerCase();
//   const cachedItem = sessionStorage.getItem(`gfycat_${id}`);
//   return cachedItem ? JSON.parse(cachedItem) : null;
// };

// const getInfo = async (id) => {
//   // const cache = getCache(id);
//   // if (cache) {
//   //   return cache;
//   // }
//   const url = `https://api.gfycat.com/v1/gfycats/${id}`;
//   const response = await fetch(url);
//   const json = await response.json();
//
//   if (response.status !== 200) {
//     return false;
//   }
//   return json.gfyItem;
// };

const render = (entry) => {
  const parsedUrl = parse(entry.url, true);
  const cleanID = parsedUrl.pathname
    .replace(/^\/|\/$/g, '')
    .split('.')[0]
    .split('/')
    .pop()
    .split('-')[0];
  const url = `https://gfycat.com/ifr/${cleanID}`;

  return {
    type: 'iframe16x9',
    src: url,
  };
};

// const render = async (entry) => {
//   const parsedUrl = parse(entry.url, true);
//   const cleanID = parsedUrl.pathname
//     .replace(/^\/|\/$/g, '')
//     .split('.')[0]
//     .split('/')
//     .pop()
//     .split('-')[0];
//
//   // Get info directly from gfycat
//   const apiInfo = await getInfo(cleanID);
//   if (!apiInfo) {
//     return {
//       type: 'self',
//       html: '<p>Error: GFYCat link not found.</p>',
//       inline: [],
//     };
//   }
//
//   const sources = [
//     { type: 'video/mp4', src: apiInfo.mp4Url },
//     { type: 'video/webm', src: apiInfo.webmUrl },
//     { type: 'video/mp4', src: apiInfo.mobileUrl },
//   ];
//
//   const videoContent = {
//     width: apiInfo.width,
//     height: apiInfo.height,
//     sources,
//     id: cleanID,
//     type: 'video',
//     thumb: apiInfo.thumb100PosterUrl,
//     hasAudio: apiInfo.hasAudio,
//   };
//
//   const iframe = `https://gfycat.com/ifr${parsedUrl.pathname}`;
//
//   const content = {
//     ...videoContent,
//     iframe,
//     apiInfo,
//   };
//
//   return content;
// };

export default render;

/**
 * {
    "gfyItem": {
        "avgColor": "#8F8E93",
        "content_urls": {
            "100pxGif": {
                "height": 157,
                "size": 822215,
                "url": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-max-1mb.gif",
                "width": 280
            },
            "largeGif": {
                "height": 250,
                "size": 4558239,
                "url": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-size_restricted.gif",
                "width": 445
            },
            "max1mbGif": {
                "height": 157,
                "size": 822215,
                "url": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-max-1mb.gif",
                "width": 280
            },
            "max2mbGif": {
                "height": 157,
                "size": 1784183,
                "url": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-small.gif",
                "width": 280
            },
            "max5mbGif": {
                "height": 250,
                "size": 4558239,
                "url": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-size_restricted.gif",
                "width": 445
            },
            "mobile": {
                "height": 360,
                "size": 696733,
                "url": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-mobile.mp4",
                "width": 640
            },
            "mobilePoster": {
                "height": 360,
                "size": 20771,
                "url": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-mobile.jpg",
                "width": 640
            },
            "mp4": {
                "height": 606,
                "size": 966717,
                "url": "https://giant.gfycat.com/FamiliarFloweryArrowcrab.mp4",
                "width": 1080
            },
            "webm": {
                "height": 606,
                "size": 828137,
                "url": "https://giant.gfycat.com/FamiliarFloweryArrowcrab.webm",
                "width": 1080
            },
            "webp": {
                "height": 0,
                "size": 671062,
                "url": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab.webp",
                "width": 0
            }
        },
        "createDate": 1541862357,
        "description": "",
        "dislikes": "0",
        "domainWhitelist": [],
        "extraLemmas": "",
        "frameRate": 30.016863,
        "gatekeeper": 1,
        "geoWhitelist": [],
        "gfyId": "familiarfloweryarrowcrab",
        "gfyName": "FamiliarFloweryArrowcrab",
        "gfyNumber": "64737175",
        "gif100px": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-max-1mb.gif",
        "gifUrl": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-size_restricted.gif",
        "hasTransparency": false,
        "height": 606,
        "languageCategories": [],
        "languageText": "",
        "likes": "0",
        "max1mbGif": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-max-1mb.gif",
        "max2mbGif": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-small.gif",
        "max5mbGif": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-size_restricted.gif",
        "miniPosterUrl": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-mobile.jpg",
        "miniUrl": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-mobile.mp4",
        "mobilePosterUrl": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-mobile.jpg",
        "mobileUrl": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-mobile.mp4",
        "mp4Size": 966717,
        "mp4Url": "https://giant.gfycat.com/FamiliarFloweryArrowcrab.mp4",
        "nsfw": "1",
        "numFrames": 178.0,
        "posterUrl": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-poster.jpg",
        "published": 1,
        "source": 1,
        "tags": [],
        "thumb100PosterUrl": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab-mobile.jpg",
        "title": "SS-LSJ0jxJDS",
        "userName": "anonymous",
        "views": 5897,
        "webmSize": 828137,
        "webmUrl": "https://giant.gfycat.com/FamiliarFloweryArrowcrab.webm",
        "webpUrl": "https://thumbs.gfycat.com/FamiliarFloweryArrowcrab.webp",
        "width": 1080
    }
}
 */
