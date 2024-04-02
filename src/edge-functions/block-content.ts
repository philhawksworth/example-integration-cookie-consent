// Documentation: https://sdk.netlify.com

export default async (
  _request: Request,
  context: { geo: { country: { code: string; name: string } } }
) => {
  const BLOCKED_COUNTRY_CODE = Netlify.env.get('BLOCKED_COUNTRY_CODE');
  const countryCode = context.geo?.country?.code;
  const countryName = context.geo?.country?.name;

  if (countryCode === BLOCKED_COUNTRY_CODE) {
    return new Response(
      `We're sorry, you can't access our content from ${countryName}!`,
      {
        headers: { 'content-type': 'text/html' },
        status: 451,
      }
    );
  }

  const response = await context.next();

  // Return the original response
  return new Response(response);
};

export const config = {
  path: '/*',
};
