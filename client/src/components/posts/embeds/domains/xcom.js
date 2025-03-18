const render = (entry) => {
  const { url } = entry;

  if (!url) {
    return null;
  }
  return {
    type: 'social',
    network: 'x',
    url,
  };
};

export default render;
