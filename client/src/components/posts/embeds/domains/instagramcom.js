import axios from 'axios';

const includeIGScripts = () => {
  if (!document.getElementById('insta-embed')) {
    const tag = document.createElement('script');
    tag.src = 'https://www.instagram.com/embed.js';
    tag.id = 'insta-embed';
    tag.async = true;
    tag.defer = true;
    document.getElementsByTagName('body')[0].appendChild(tag);
  }
};

const render = async (entry) => {
  includeIGScripts();
  const getEmbed = await axios.get(`https://api.instagram.com/oembed/`, {
    params: { url: entry.url, omitscript: true },
  });

  if (getEmbed.status !== 200 || !getEmbed.data.html) {
    return null;
  }

  const { html } = getEmbed.data;

  return {
    type: 'self',
    expand: true,
    html,
    inline: [],
  };
};

export default render;
