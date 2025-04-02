import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import BookmarkButton from './BookmarkButton';
import * as bookmarkIllustActionCreators from '../common/actions/bookmarkIllust';
import * as modalActionCreators from '../common/actions/modal';
import * as authActionCreators from '../common/actions/auth';
import {
  MODAL_TYPES,
  LIKE_BUTTON_ACTION_TYPES,
  BOOKMARK_TYPES,
} from '../common/constants';
import { Alert } from 'react-native';
import { connectLocalization } from '../components/Localization';

class BookmarkIllustButton extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    bookmarkIllust: PropTypes.func.isRequired,
    unbookmarkIllust: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
  };

  handleOnPress = () => {
    const {
      item,
      loading,
      bookmarkIllust,
      unbookmarkIllust,
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
        unbookmarkIllust(item.id);
      } else {
        bookmarkIllust(item.id, bookmarkType);
      }
    }
  };

  handleOnLongPress = this.handleOnPress;

  // handleOnLongPress = () => {
  //   const { item, loading, openModal } = this.props;
  //   if (!loading) {
  //     openModal(MODAL_TYPES.BOOKMARK_ILLUST, {
  //       illustId: item.id,
  //       isBookmark: item.is_bookmarked,
  //     });
  //   }
  // };

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

export default connectLocalization(
  connect(
    (state) => ({
      loading: state.bookmarkIllust.loading,
      actionType: state.likeButtonSettings.actionType,
      auth: state.auth
    }),
    { ...bookmarkIllustActionCreators, 
      ...modalActionCreators,
      ...authActionCreators },
  )(BookmarkIllustButton),
);
