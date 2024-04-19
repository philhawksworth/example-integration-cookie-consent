import container from '../utils/banner-container.js';

export default () => {
  const content = `<a href="?cookieBannerAction=revert">Cookies</a> `;
  return container(content);
}

