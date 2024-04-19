import container from '../utils/banner-container.js';

export default () => {
  const content = `
  <a href="?cookieBannerAction=revert">✔︎</a>
  `;
  return container(content);
}

