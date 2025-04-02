import React, { Component, useRef } from 'react';
import { StyleSheet, View, ScrollView, Alert, Linking } from 'react-native';
import { connect } from 'react-redux';
import { useScrollToTop } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { withTheme } from 'react-native-paper';
// import CookieManager from 'react-native-cookies';
import { connectLocalization } from '../../components/Localization';
import UserCover from '../../components/UserCover';
import PXListItem from '../../components/PXListItem';
import * as authActionCreators from '../../common/actions/auth';
import * as browsingHistoryIllustsActionCreators from '../../common/actions/browsingHistoryIllusts';
import * as browsingHistoryNovelsActionCreators from '../../common/actions/browsingHistoryNovels';
import * as searchHistoryActionCreators from '../../common/actions/searchHistory';
import * as themeActionCreators from '../../common/actions/theme';
import { SCREENS, THEME_TYPES } from '../../common/constants';
import openUrl from '../../common/helpers/openUrl';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    marginHorizontal: 10,
  },
});

const menuList = [
  {
    id: 'login',
    title: 'login',
    icon: 'sign-in',
    type: 'font-awesome',
  },
  {
    id: 'works',
    title: 'myWorks',
    icon: 'picture-o',
    type: 'font-awesome',
  },
  {
    id: 'connection',
    title: 'connection',
    icon: 'users',
    type: 'font-awesome',
  },
  {
    id: 'collection',
    title: 'collection',
    icon: 'heart',
    type: 'font-awesome',
  },
  {
    id: 'browsingHistory',
    title: 'browsingHistory',
    icon: 'clock-o',
    type: 'font-awesome',
  },
  // {
  //   id: 'publishIllust',
  //   title: 'publishIllust',
  //   icon: 'upload',
  //   type: 'font-awesome',
  // },
  // {
  //   id: 'publishNovel',
  //   title: 'publishNovel',
  //   icon: 'pencil',
  //   type: 'font-awesome',
  // },
  {
    id: 'visitWebsite',
    title: 'visitWebsite',
    icon: 'external-link',
    type: 'font-awesome',
  },
];

const menuList2 = [
  {
    id: 'settings',
    title: 'settings',
    icon: 'cog',
    type: 'font-awesome',
  },
  {
    id: 'report',
    title: 'report',
    icon: 'warning',
    type: 'font-awesome',
  }, 
  {
    id: 'logout',
    title: 'logout',
    icon: 'sign-out',
    type: 'font-awesome',
  },
];

class MyPage extends Component {
  handleOnPressListItem = (item) => {
    const {
      user,
      navigation: { navigate },
      logout,
      i18n
    } = this.props;
    console.log(user);
    switch (item.id) {
      case 'works':
        if (user && user.account !== 'guest') {
          navigate(SCREENS.MyWorks, { userId: user.id });
        } else {
          this.handleGuest();
        }        
        break;
      case 'collection':
        if (user && user.account !== 'guest') {
          navigate(SCREENS.MyCollection, { userId: user.id });
        } else {
          this.handleGuest();
        }  
        break;
      case 'connection':
        if (user && user.account !== 'guest') {
          navigate(SCREENS.MyConnection, { userId: user.id });
        } else {
          this.handleGuest();
        }  
        break;
      case 'visitWebsite':
        openUrl('https://www.wilddream.net');
        break;
      case 'report':
        openUrl('https://www.wilddream.net/Art/index/copyright');
        break;
      case 'browsingHistory':
        navigate(SCREENS.BrowsingHistory);
        break;
      case 'settings': {
        navigate(SCREENS.Settings);
        break;
      }
      case 'feedback': {
        navigate(SCREENS.Feedback);
        break;
      }
      case 'logout': {
        this.handleOnPressLogout();
        break;
      }
      case 'login': {
        logout();
        break;
      }
      default:
        break;
    }
  };

  handleGuest = () => {
    const { logout, i18n } = this.props;
    Alert.alert(i18n.loginToView, null,[
      { text: i18n.cancel, style: 'cancel' },
      {
        text: i18n.login,
        style: 'destructive',
        onPress: logout,
      },
    ]);
  }

  handleOnPressLogout = () => {
    const { user, i18n } = this.props;
    if (user.isProvisionalAccount) {
      Alert.alert(
        i18n.logoutConfirmNoRegisterTitle,
        i18n.logoutConfirmNoRegisterDescription,
        [
          { text: i18n.cancel, style: 'cancel' },
          {
            text: i18n.commentRequireAccountRegistrationAction,
            onPress: this.handleOnPressRegisterAccount,
          },
          {
            text: i18n.logout,
            style: 'destructive',
            onPress: this.handleOnPressConfirmLogout,
          },
        ],
        { cancelable: false },
      );
    } else {
      Alert.alert(
        i18n.logoutConfirm,
        null,
        [
          { text: i18n.cancel, style: 'cancel' },
          {
            text: i18n.logout,
            style: 'destructive',
            onPress: this.handleOnPressConfirmLogout,
          },
        ],
        { cancelable: false },
      );
    }
  };

  handleOnPressConfirmLogout = () => {
    const {
      clearBrowsingHistoryIllusts,
      clearBrowsingHistoryNovels,
      clearSearchHistory,
      logout,
    } = this.props;
    logout();
    clearBrowsingHistoryIllusts();
    clearBrowsingHistoryNovels();
    clearSearchHistory();
    // clear cookies set from webview for advance account settings
    // CookieManager.clearAll();
  };

  handleOnPressRegisterAccount = () => {
    const {
      navigation: { navigate },
    } = this.props;
    navigate(SCREENS.AccountSettingsModal, {
      hideAdvanceSettings: true,
    });
  };

  handleOnPressAvatar = () => {
    const {
      user,
      navigation: { navigate },
      logout
    } = this.props;
    if (user && user.account !== 'guest') {
      navigate(SCREENS.UserDetail, {
        userId: user.id,
      });
    } else {
      logout()
    }
  };

  handleOnPressChangeTheme = () => {
    const { themeName, setTheme } = this.props;
    if (themeName === THEME_TYPES.DARK) {
      setTheme(THEME_TYPES.LIGHT);
    } else {
      setTheme(THEME_TYPES.DARK);
    }
  };

  renderCover = () => {
    const { user, i18n, themeName } = this.props;
    return (
      <UserCover
        user={user}
        i18n={i18n}
        themeName={themeName}
        onPressAvatar={this.handleOnPressAvatar}
        onPressChangeTheme={this.handleOnPressChangeTheme}
      />
    );
  };

  renderList = (list) => {
    const { user, i18n } = this.props;
    if ((!user || user.account === 'guest')) {
      if (list.some((l) => l.id === 'logout')) list = list.filter((l) => l.id !== 'logout');
    } else {
      if (list.some((l) => l.id === 'login')) list = list.filter((l) => l.id !== 'login');
    }
    return (
      <View style={styles.listContainer}>
        {list.map((item) => (
          <PXListItem
            key={item.id}
            title={i18n[item.title]}
            left={({ color }) => (
              <Icon
                name={item.icon}
                type={item.type}
                color={color}
                size={item.size}
              />
            )}
            onPress={() => this.handleOnPressListItem(item)}
          />
        ))}
      </View>
    );
  };

  render() {
    const { theme, scrollRef } = this.props;
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <ScrollView ref={scrollRef} style={styles.container}>
          {this.renderCover()}
          {this.renderList(menuList)}
          {this.renderList(menuList2)}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const MyPageWithHOC = withTheme(
  connectLocalization(
    connect(
      (state) => ({
        user: state.auth.user,
        themeName: state.theme.name,
      }),
      {
        ...authActionCreators,
        ...browsingHistoryIllustsActionCreators,
        ...browsingHistoryNovelsActionCreators,
        ...searchHistoryActionCreators,
        ...themeActionCreators,
      },
    )(MyPage),
  ),
);

export default function (props) {
  const ref = useRef(null);
  useScrollToTop(ref);
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MyPageWithHOC {...props} scrollRef={ref} />;
}
