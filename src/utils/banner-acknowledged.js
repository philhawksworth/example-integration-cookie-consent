import container from '../utils/banner-container.js';

export default () => {
  const content = `<a href="?cookieBannerAction=revert">&#10003;</a> `;
  return container(content);
}

