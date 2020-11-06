const render = (entry) => {
  const html = entry.body_html ? entry.body_html : '';

  const content = {
    type: 'self',
    html,
    inline: [],
  };

  return content;
};

export default render;
