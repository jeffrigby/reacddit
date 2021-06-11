const render = (entry) => {
  const html = entry.selftext_html ? entry.selftext_html : '';

  const content = {
    type: 'self',
    html,
    inline: [],
  };

  return content;
};

export default render;
