import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, StatusBar, Platform, Linking } from 'react-native';
import { useSelector } from 'react-redux';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
  useLinking,
} from '@react-navigation/native';
import { getStateFromPath } from '@react-navigation/core';
import analytics from '@react-native-firebase/analytics';
import remoteConfig from '@react-native-firebase/remote-config';
import {
  DefaultTheme as PaperDefaultTheme,
  DarkTheme as PaperDarkTheme,
  Provider as PaperProvider,
} from 'react-native-paper';
import SplashScreen from 'react-native-splash-screen';
import FlashMessage from 'react-native-flash-message';
import AppNavigator from '../../navigations/AppNavigator';
import AuthNavigator from '../../navigations/AuthNavigator';
import Loader from '../../components/Loader';
import ModalRoot from '../../containers/ModalRoot';
import PXSnackbar from '../../components/PXSnackbar';
import { THEME_TYPES, SCREENS } from '../../common/constants';
import { globalStyleVariables } from '../../styles';
import usePrevious from '../../common/hooks/usePrevious';
// import messaging from '@react-native-firebase/messaging';
import XgPush from 'tpns_rn_plugin';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const getActiveRouteName = (state) => {
  const route = state.routes[state.index];

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route.name;
};

// messaging().setBackgroundMessageHandler(async (remoteMessage) => {
//   //  await notifee.displayNotification(...);
//    // Increment the count by 1
//    await notifee.incrementBadgeCount();
// })

const App = () => {
  const [initialState, setInitialState] = useState();
  const [navigationIsReady, setNavigationIsReady] = useState(true);
  const rehydrated = useSelector((state) => state.auth.rehydrated);
  const user = useSelector((state) => state.auth.user);
  const initialRouteName = useSelector(
    (state) => state.initialScreenSettings.routeName,
  );
  const themeName = useSelector((state) => state.theme.name);
  const navigationRef = useRef();
  const routeNameRef = useRef();
  const prevRehydrated = usePrevious(rehydrated);

  const { getInitialState } = useLinking(navigationRef, {
    prefixes: [
      'https://www.wilddream.net',
      'http://www.wilddream.net',
      'wilddream://',
    ],
    config: {
      [SCREENS.Detail]: 'art/view/:illustId',
      [SCREENS.NovelDetail]: 'journal/view/:novelId',
      [SCREENS.UserDetail]: 'user/:uid'
    },
    getStateFromPath: (path, options) => {
      console.log(path, options);
      const state = getStateFromPath(path, options);
      const newRoutes = [...state.routes];
      // eslint-disable-next-line prefer-destructuring
      newRoutes[0].name = newRoutes[0].name.split('-')[0];
      let routes;
      if (user) {
        routes = [
          {
            name: SCREENS.Main, // Load tab navigation first
          },
          ...newRoutes,
        ];
      } else {
        routes = newRoutes;
      }
      return {
        ...state,
        routes,
      };
    },
  });

  useEffect(() => {
    XgPush.setEnableDebug(true);
    if (Platform.OS === 'ios') {
        /// 集群域名配置（非广州集群需要在startXg之前调用此函数）
        /// 香港：tpns.hk.tencent.com, 新加坡：tpns.sgp.tencent.com, 上海：tpns.sh.tencent.com
      XgPush.configureClusterDomainName("tpns.sh.tencent.com")
    }     
    this.xgPushClickAction = result => {
      console.log("[TPNS RN] xgPushClickAction:" + JSON.stringify(result));
      if ('custom' in result) { // iOS
        var data = JSON.parse(result.custom);
        if ('link' in data) {
          Linking.openURL(data.link);
        }
      }   
      if ('customMessage' in result) {  // Android
        var data = JSON.parse(result.customMessage);
        if ('link' in data) {
          Linking.openURL(data.link);
        }
      }    
    };
    XgPush.addXgPushClickActionListener(this.xgPushClickAction);
  });

  useEffect(() => {
    remoteConfig()
      .setDefaults({
        enableServerFiltering: false,
        tagBlackList: '',
      })
      .then(() =>
        remoteConfig().setConfigSettings({
          minimumFetchIntervalMillis: 3600000, // 1 hour
        }),
      )
      .then(() => remoteConfig().fetchAndActivate())
      .then(() => {
        Promise.race([
          getInitialState(),
          new Promise((resolve) =>
            // Timeout in 150ms if `getInitialState` doesn't resolve
            // Workaround for https://github.com/facebook/react-native/issues/25675
            setTimeout(resolve, 150),
          ),
        ])
          .catch((e) => {
            console.error('Error getting initial state ', e);
          })
          .then((state) => {
            if (state !== undefined) {
              setInitialState(state);
            }

            setNavigationIsReady(true);
          });
      });
  }, [getInitialState]);

  useEffect(() => {
    if (rehydrated && navigationIsReady) {
      const state = navigationRef.current.getRootState();
      // Save the initial route name
      routeNameRef.current = getActiveRouteName(state);
    }
  }, [rehydrated, navigationIsReady]);

  useEffect(() => {
    if (!prevRehydrated && rehydrated) {
      SplashScreen.hide();
    }
  }, [prevRehydrated, rehydrated]);  

  const handleOnNavigationStateChange = (state) => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = getActiveRouteName(state);
    if (previousRouteName !== currentRouteName) {
      analytics().logScreenView({
        screen_name: currentRouteName,
        screen_class: currentRouteName,
      });
    }
    routeNameRef.current = currentRouteName;
  };

  let renderComponent;
  let theme;
  const extraColorsConfig = {
    primary: globalStyleVariables.PRIMARY_COLOR,
    activeTint:
      themeName === THEME_TYPES.DARK
        ? '#000000'
        : globalStyleVariables.PRIMARY_COLOR,
    headerBackground:
      themeName === THEME_TYPES.DARK
        ? '#1a1a1a'
        : globalStyleVariables.PRIMARY_COLOR,
    modalTitleBackground:
      themeName === THEME_TYPES.DARK ? '#1a1a1a' : '#E9EBEE',
    bottomTabBarBackground:
      themeName === THEME_TYPES.DARK
        ? PaperDarkTheme.colors.surface
        : globalStyleVariables.PRIMARY_COLOR,
  };
  if (themeName === THEME_TYPES.DARK) {
    theme = {
      ...PaperDarkTheme,
      ...NavigationDarkTheme,
      colors: {
        ...PaperDarkTheme.colors,
        ...NavigationDarkTheme.colors,
        ...extraColorsConfig,
      },
    };
  } else {
    theme = {
      ...PaperDefaultTheme,
      ...NavigationDefaultTheme,
      colors: {
        ...PaperDefaultTheme.colors,
        ...NavigationDefaultTheme.colors,
        ...extraColorsConfig,
      },
    };
  }
  
  if (!rehydrated || !navigationIsReady) {
    renderComponent = <Loader />;
  } else if (user) {
    renderComponent = <AppNavigator initialRouteName={initialRouteName} />;
  } else {
    renderComponent = <AuthNavigator />;
  }
  return (
    <PaperProvider theme={theme}>
      {(!rehydrated || !navigationIsReady) && <Loader />}
      {rehydrated && navigationIsReady && (
        <NavigationContainer
          ref={navigationRef}
          initialState={initialState}
          theme={theme}
          onStateChange={handleOnNavigationStateChange}
        >
          <View style={styles.container}>
            <StatusBar
              barStyle={
                Platform.OS === 'ios' && themeName === THEME_TYPES.LIGHT
                  ? 'dark-content'
                  : 'light-content'
              }
              backgroundColor={
                themeName === THEME_TYPES.DARK
                  ? PaperDarkTheme.colors.surface
                  : 'rgb(33,123,178)'
              }
              // translucent
              animated
            />
            {renderComponent}
            <FlashMessage />
            <ModalRoot />
            <PXSnackbar />
          </View>
        </NavigationContainer>
      )}
    </PaperProvider>
  );
};

export default App;
