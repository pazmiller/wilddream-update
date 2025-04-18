import React from 'react';
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { TabView, TabBar, ScrollPager } from 'react-native-tab-view';
import ViewPagerAdapter from 'react-native-tab-view-viewpager-adapter';
import { useTheme } from 'react-native-paper';
import { globalStyleVariables } from '../styles';

const initialLayout = { width: Dimensions.get( 'window' ).width };

const styles = StyleSheet.create( {
  container: {
    flex: 1,
  },
  tabStyle: {
    width: 'auto',
  },
} );

const PXTabView = ( {
  navigationState,
  renderScene,
  onIndexChange,
  lazy = true,
  includeStatusBarPadding,
  scrollEnabled,
  renderTabBar,
  lazyPreloadDistance,
  ...restProps
} ) => {
  const theme = useTheme();

  const handleRenderTabBar = ( props ) => {
    if ( renderTabBar )
    {
      return renderTabBar( props );
    }
    return (
      <TabBar
        style={{
          paddingTop: includeStatusBarPadding
            ? globalStyleVariables.STATUSBAR_HEIGHT
            : 0,
          backgroundColor: theme.colors.headerBackground,
        }}
        labelStyle={{
          marginVertical: 8,
          marginHorizontal: 0,
        }}
        tabStyle={[
          {
            width: scrollEnabled ? 'auto' : undefined,
          },
        ]}
        scrollEnabled={scrollEnabled}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    );
  };

  // const renderPager = (props) =>
  //   Platform.OS === 'ios' ? (
  //     <TabViewPagerScroll {...props} />
  //   ) : (
  //     <TabViewPagerPan {...props} />
  //   );

  return (
    <TabView
      style={[ styles.container, { backgroundColor: theme.colors.background } ]}
      navigationState={navigationState}
      renderScene={renderScene}
      onIndexChange={onIndexChange}
      initialLayout={initialLayout}
      renderTabBar={handleRenderTabBar}
      // eslint-disable-next-line react/jsx-props-no-spreading
      // {...(Platform.OS === 'android' && {
      //   renderPager: (props) => {
      //     // eslint-disable-next-line react/jsx-props-no-spreading
      //     return <ViewPagerAdapter {...props} transition="scroll" />;
      //   },
      // })}
      removeClippedSubviews={Platform.OS === 'android'}
      // renderPager={(props) => (
      //   // eslint-disable-next-line react/jsx-props-no-spreading
      //   <ViewPagerAdapter {...props} transition="scroll" />
      // )}
      lazy={lazy}
      lazyPreloadDistance={lazyPreloadDistance}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
    />
  );
};

export default PXTabView;
