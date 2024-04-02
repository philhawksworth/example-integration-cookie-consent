import { NetlifyIntegrationUI } from '@netlify/sdk';
import countryCodes from 'country-codes-list';

const integrationUI = new NetlifyIntegrationUI('ABC Integration');
const surface = integrationUI.addSurface('integrations-settings');
const route = surface.addRoute('/');

const myCountryCodes = Object.entries(
  countryCodes.customList('countryCode', '{countryNameEn}')
).map(([value, label]) => ({
  value,
  label,
}));

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

export { integrationUI };
