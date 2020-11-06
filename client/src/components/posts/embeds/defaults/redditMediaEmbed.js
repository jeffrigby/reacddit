const redditMediaEmbed = (entry) => {
  // Get it out of media embed:
  if (entry.media_embed && entry.media_embed.content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = entry.media_embed.content;
    const embed = tempDiv.firstChild;
    const src = embed.getAttribute('src');
    const allow = embed.getAttribute('allow');
    return {
      type: 'iframe16x9',
      src,
      allow,
    };
  }
  return null;
};

export default redditMediaEmbed;
