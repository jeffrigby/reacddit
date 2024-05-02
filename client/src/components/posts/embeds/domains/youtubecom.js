import parse from 'url-parse';

const render = (entry) => {
  const parsedUrl = parse(entry.url, true);
  const youtubeid = parsedUrl.query.v;
  if (!youtubeid) {
    return null;
  }
  const { title } = entry;
  const src = `https://www.youtube.com/embed/${youtubeid}`;

  return {
    type: 'iframe',
    title,
    // 560x315 is the default size for youtube embeds
    width: 560,
    height: 315,
    src,
    allow:
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    referrerPolicy: 'strict-origin-when-cross-origin',
  };
};

export default render;

// <iframe width="560" height="315" src="https://www.youtube.com/embed/3HjIljJd-o0?si=ELx-1DMhY7CabmoY"
//         title="YouTube video player" frameBorder="0"
//         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//         referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
