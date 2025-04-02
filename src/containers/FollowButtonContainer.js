import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import FollowButton from '../components/FollowButton';
import * as followUserActionCreators from '../common/actions/followUser';
import * as modalActionCreators from '../common/actions/modal';
import * as authActionCreators from '../common/actions/auth';
import { FOLLOWING_TYPES, MODAL_TYPES } from '../common/constants';
import { makeGetUserItem } from '../common/selectors';
import { Alert } from 'react-native';
import { connectLocalization } from '../components/Localization';

class FollowButtonContainer extends Component {
  static propTypes = {
    userId: PropTypes.number.isRequired,
    followUser: PropTypes.func.isRequired,
    unfollowUser: PropTypes.func.isRequired,
    openModal: PropTypes.func.isRequired,
  };

  handleOnPress = () => {
    const { user, auth, i18n, logout } = this.props;
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
    if (user.is_followed) {
      this.unfollowUser(user.id);
    } else {
      this.followUser(user.id, FOLLOWING_TYPES.PUBLIC);
    }
  };

  handleOnLongPress = this.handleOnPress;

  // handleOnLongPress = () => {
  //   const { user, openModal } = this.props;
  //   openModal(MODAL_TYPES.FOLLOW, {
  //     userId: user.id,
  //     isFollow: user.is_followed,
  //   });
  // };

  followUser = (userId, followType) => {
    const { followUser } = this.props;
    followUser(userId, followType);
  };

  unfollowUser = (userId) => {
    const { unfollowUser } = this.props;
    unfollowUser(userId);
  };

  render() {
    const { user, ...restProps } = this.props;
    return (
      <FollowButton
        isFollow={user.is_followed}
        onLongPress={this.handleOnLongPress}
        onPress={this.handleOnPress}
        {...restProps}
      />
    );
  }
}

export default connectLocalization(connect(
  (globalState) => {
    const getUserItem = makeGetUserItem();
    return (state, props) => {
      const user = getUserItem(state, props);
      return {
        user: user,
        auth: globalState.auth
      };
    };
  },
  { ...followUserActionCreators, ...modalActionCreators, ...authActionCreators },
)(FollowButtonContainer));
