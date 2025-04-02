import { BROWSING_HISTORY_NOVELS } from '../constants/actionTypes';

export default function browsingHistoryNovels(
  state = {
    loading: false,
    loaded: true,
    refreshing: false,
    items: [],
  },
  action = {},
) {
  switch (action.type) {
    case BROWSING_HISTORY_NOVELS.ADD: {
      let newItems;
      const { items } = state;
      const newItem = action.payload.item;
      if (items && items.length) {
        if (items.indexOf(newItem) === -1) {
          newItems = [newItem, ...items.slice(0, 101)];
        } else {
          newItems = [...items];
        }
      } else {
        newItems = [newItem];
      }
      return {
        ...state,
        items: newItems,
      };
    }
    case BROWSING_HISTORY_NOVELS.REMOVE:
      return {
        ...state,
        items: state.items.filter((item) => item !== action.payload.item),
      };
    case BROWSING_HISTORY_NOVELS.CLEAR:
      return {
        ...state,
        items: [],
      };
    default:
      return state;
  }
}
