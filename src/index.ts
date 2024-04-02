// Documentation: https://sdk.netlify.com
import { NetlifyIntegration } from '@netlify/sdk';

const integration = new NetlifyIntegration();

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

integration.addEdgeFunctions('./src/edge-functions', {
  prefix: 'block_content',
});

export { integration };
