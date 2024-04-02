![image](https://github.com/netlify/block-content-with-sdk-ef-integration/assets/30577427/f0bd6f19-3054-44ac-9c56-9292f539739d)

# Block content based on the user's location using the Netlify SDK

This integration is created using the [Netlify SDK](https://sdk.netlify.com/get-started/introduction/). It injects an edge function into the user's site that checks the user's location and blocks the content if they are in a specific country.

## Adding an Integration UI

While it's possible for the user of this integration to set `BLOCKED_COUNTRY_CODE` as an environment variable manually, we want to provide them with a UI to easily set this value. To do this, we'll use the Integration UI. In this section we'll explain how we set it up in this example.

## Creating API Handlers

Inside of the `src/index.ts` file we've added two API handlers with `integration.addApiHandler`. One of these sets the `BLOCKED_COUNTRY_CODE` environment variable and the other gets the current value of `BLOCKED_COUNTRY_CODE`.

```ts
integration.addApiHandler(
  'save-blocked-country-code',
  async ({ body }, { client, siteId, teamId }) => {
    try {
      if (!body || !siteId || !teamId) {
        return {
          statusCode: 400,
          body: 'Bad request: Missing required parameters',
        };
      }

      const { BLOCKED_COUNTRY_CODE } = JSON.parse(body);
      if (!BLOCKED_COUNTRY_CODE) {
        return {
          statusCode: 400,
          body: 'Bad request: Missing BLOCKED_COUNTRY_CODE in body',
        };
      }

      // This uses the Netlify SDK to create or update the BLOCKED_COUNTRY_CODE environment variable
      await client.createOrUpdateVariable({
        accountId: teamId,
        siteId,
        key: 'BLOCKED_COUNTRY_CODE',
        value: BLOCKED_COUNTRY_CODE,
      });

      return {
        statusCode: 200,
        body: 'Variable successfully created or updated',
      };
    } catch (error) {
      let errorMessage = 'Something went wrong';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        statusCode: 500,
        body: errorMessage,
      };
    }
  }
);

integration.addApiHandler(
  'get-blocked-country-code',
  async ({ body }, { client, siteId, teamId }) => {
    try {
      if (!siteId || !teamId) {
        return {
          statusCode: 400,
          body: 'Bad request: Missing required parameters',
        };
      }

      // This uses the Netlify SDK to get the BLOCKED_COUNTRY_CODE environment variable
      const envVars = await client.getEnvironmentVariables({
        accountId: teamId,
        siteId,
      });

      const BLOCKED_COUNTRY_CODE = envVars.find(
        (envVar) => envVar.key === 'BLOCKED_COUNTRY_CODE'
      )?.values[0].value;

      if (!BLOCKED_COUNTRY_CODE) {
        return {
          statusCode: 404,
          body: 'BLOCKED_COUNTRY_CODE not found',
        };
      }

      return {
        body: JSON.stringify({
          BLOCKED_COUNTRY_CODE,
        }),
        statusCode: 200,
      };
    } catch (error) {
      let errorMessage = 'Something went wrong';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        statusCode: 500,
        body: errorMessage,
      };
    }
  }
);
```

## Creating the UI

We've created a simple UI that allows the user to set the `BLOCKED_COUNTRY_CODE` environment variable. You can find this UI inside of `src/ui/index.ts`. In this file we define the Integration UI.

```ts
import { NetlifyIntegrationUI } from '@netlify/sdk';

const integrationUI = new NetlifyIntegrationUI('ABC Integration');
const surface = integrationUI.addSurface('integrations-settings');
const route = surface.addRoute('/');

export { integrationUI };
```

We then use the `route.onLoad` method to get the current value of `BLOCKED_COUNTRY_CODE` by doing a fetch to our previously defined `get-blocked-country-code` API Handler and set it as the value of the input field that we'll create next.

```ts
route.onLoad(async (surfaceState) => {
  const { picker, fetch } = surfaceState;

  const response = await fetch('get-blocked-country-code', {
    method: 'GET',
  });

  const { BLOCKED_COUNTRY_CODE } = await response.json();

  picker.setFormInputValue(
    'configuration-form',
    'BLOCKED_COUNTRY_CODE',
    BLOCKED_COUNTRY_CODE
  );
});
```

Now we'll add a form to our route that allows the user to set the `BLOCKED_COUNTRY_CODE` environment variable. We'll use the `route.addForm` method to do this.

```ts
route.addForm(
  {
    title: 'Configuration',
    id: 'configuration-form',
    onSubmit: async (surfaceState) => {
      const { picker, fetch } = surfaceState;

      const BLOCKED_COUNTRY_CODE = picker.getFormInputValue(
        'configuration-form',
        'BLOCKED_COUNTRY_CODE'
      );

      await fetch('save-blocked-country-code', {
        method: 'POST',
        body: JSON.stringify({
          BLOCKED_COUNTRY_CODE,
        }),
      });
    },
  },
  (card) => {
    card.addInputSelect({
      id: 'BLOCKED_COUNTRY_CODE',
      label: 'Blocked Country Code',
      options: myCountryCodes,
    });
  }
);
```

As you can see we call the `save-blocked-country-code` API Handler and pass the `BLOCKED_COUNTRY_CODE` value as the body of the request when the user submits the form.

For ease of use, we've used a library to get a list of country codes. This is the logic that creates the list `myCountryCodes` that we pass to the `options` property of the `card.addInputSelect` method:

```ts
import countryCodes from 'country-codes-list';

const myCountryCodes = Object.entries(
  countryCodes.customList('countryCode', '{countryNameEn}')
).map(([value, label]) => ({
  value,
  label,
}));
```
