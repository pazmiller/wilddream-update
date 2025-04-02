import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import BookmarkButton from './BookmarkButton';
import * as bookmarkNovelActionCreators from '../common/actions/bookmarkNovel';
import * as modalActionCreators from '../common/actions/modal';
import * as authActionCreators from '../common/actions/auth';
import {
  MODAL_TYPES,
  LIKE_BUTTON_ACTION_TYPES,
  BOOKMARK_TYPES,
} from '../common/constants';
import { Alert } from 'react-native';
import { connectLocalization } from '../components/Localization';

class BookmarkNovelButton extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    bookmarkNovel: PropTypes.func.isRequired,
    unbookmarkNovel: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
  };

  handleOnPress = () => {
    const {
      item,
      loading,
      bookmarkNovel,
      unbookmarkNovel,
      actionType,
      auth,
      logout,
      i18n
    } = this.props;
    if (!loading) {
      if (auth.user.account === 'guest') {
        Alert.alert(i18n.loginToView, null,[
          { text: i18n.cancel, style: 'cancel' },
          {
            text: i18n.login,
            style: 'destructive',
            onPress: logout,
          },
        ]);
        return;
      }
      let bookmarkType;
      if (actionType === LIKE_BUTTON_ACTION_TYPES.PUBLIC_LIKE) {
        bookmarkType = BOOKMARK_TYPES.PUBLIC;
      } else if (actionType === LIKE_BUTTON_ACTION_TYPES.PRIVATE_LIKE) {
        bookmarkType = BOOKMARK_TYPES.PRIVATE;
      }
      if (item.is_bookmarked) {
        unbookmarkNovel(item.id);
      } else {
        bookmarkNovel(item.id, bookmarkType);
      }
    }
  };

  handleOnLongPress = () => {
    const { item, loading, openModal } = this.props;
    if (!loading) {
      openModal(MODAL_TYPES.BOOKMARK_NOVEL, {
        novelId: item.id,
        isBookmark: item.is_bookmarked,
      });
    }
  };

  render() {
    const { item, size, actionType } = this.props;
    return (
      <BookmarkButton
        item={item}
        size={size}
        actionType={actionType}
        onPress={this.handleOnPress}
        onLongPress={this.handleOnLongPress}
      />
    );
  }
}

export default connectLocalization(connect(
  (state) => ({
    loading: state.bookmarkNovel.loading,
    actionType: state.likeButtonSettings.actionType,
    auth: state.auth
  }),
  { ...bookmarkNovelActionCreators, ...modalActionCreators, ...authActionCreators },
)(BookmarkNovelButton));
