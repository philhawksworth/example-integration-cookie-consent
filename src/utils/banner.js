import container from '../utils/banner-container.js';

export default (geo) => {
  const content = `
  <p>This site would like to use cookies (${geo})</p>
  <p>
    <a href="">Review</a> or
    <a href="?cookieBannerAction=acknowledge">Accept</a>
  </p>
  `;
  return container(content);
}
