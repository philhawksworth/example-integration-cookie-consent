import banner from '../utils/banner.js';
import bannerConfirmed from '../utils/banner-acknowledged.js';
import cookiePolicyCountries from '../utils/territories.js';

// Inject the appropriate UI
const updateBannerDisplay = async function(context, ui) {
    // Get the page content
    const response = await context.next();
    const page = await response.text();
     // INsert the Ui just before the end of the body tag
    const regex = /<\/body>/i;    
    const updatedPage = page.replace(regex, ui);
    return new Response(updatedPage, response);
}


export default async (
  request: Request,
  context: { next: Function, cookies: { set: Function, get: Function, delete: Function }, geo: { country: { code: string; name: string } } }
) => {
  
  const url = new URL(request.url);
  const params = url.searchParams;
  const option = params.get('cookieBannerAction');
  const countryCode = context.geo?.country?.code;

  console.log(url.origin, countryCode);
  

  if(option === "acknowledge" ) {
    // If the user acknowledges the use for cookies let's remember that 
    // in a cookie so we don't both them again
    context.cookies.set({
      name: "nf-cookie-banner-okd",
      value: "true",
    });
    return Response.redirect(url.origin + url.pathname);
  } else if(option === "revert") {
    // If the user wants to change their mind 
    // and review cookies options, let then
    context.cookies.delete("nf-cookie-banner-okd");
    return Response.redirect(url.origin + url.pathname);
  }

  // if we've been here before and the user acknowledged 
  // the cookie banner, let's leave them in peace
  const acknowledged = context.cookies.get("nf-cookie-banner-okd");
  if(acknowledged) {
    return updateBannerDisplay(context, bannerConfirmed);
  }

  // Show the cookie banner to visitors from the correct countries
  // or if they force it by passing a parameter of `cookieBannerAction=force`
  if(cookiePolicyCountries.includes(countryCode) || (option === "force")) {
    return updateBannerDisplay(context, banner(countryCode));
  }

  // Get out of the way of the standard http response
  return;
};
 

export const config = {
  path: '/*',
};
