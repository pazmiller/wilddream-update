/* eslint-disable import/prefer-default-export */

import { THEME } from '../constants/actionTypes';

export function setTheme(name) {
  return {
    type: THEME.SET,
    payload: {
      name,
    },
  };
}

export function restoreSettings(state) {
  return {
    type: THEME.RESTORE,
    payload: {
      state,
    },
  };
}
