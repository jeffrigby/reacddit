import parse from 'url-parse';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const pathSplit = parsedUrl.pathname.substr(1).split('/');
  const id = pathSplit[0];
  const url = `https://spankbang.com/${id}/embed`;
  const content = {
    type: 'iframe16x9',
    src: url,
  };
  return content;
};

export default render;
