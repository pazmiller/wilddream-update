/* eslint-disable import/prefer-default-export */

import { INITIAL_SCREEN_SETTINGS } from '../constants/actionTypes';

export function setInitialRoute(routeName) {
  return {
    type: INITIAL_SCREEN_SETTINGS.SET,
    payload: {
      routeName,
    },
  };
}

export function restoreSettings(state) {
  return {
    type: INITIAL_SCREEN_SETTINGS.RESTORE,
    payload: {
      state,
    },
  };
}
