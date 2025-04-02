import React, { Component } from 'react';
import UserIllusts from '../Shared/UserIllusts';
import UserMangas from '../Shared/UserMangas';
import UserNovels from '../Shared/UserNovels';
import { connectLocalization } from '../../components/Localization';
import PXTabView from '../../components/PXTabView';

class MyWorks extends Component {
  constructor(props) {
    super(props);
    const { i18n } = props;
    this.state = {
      index: 0,
      routes: [
        { key: '1', title: i18n.illustration },
        // { key: '2', title: i18n.manga },
        { key: '3', title: i18n.novel },
      ],
    };
  }

  handleChangeTab = (index) => {
    this.setState({ index });
  };

  renderScene = ({ route }) => {
    const { navigation, route: navigationRoute } = this.props;
    const { userId } = navigationRoute.params;
    switch (route.key) {
      case '1':
        return (
          <UserIllusts
            userId={userId}
            navigation={navigation}
            route={navigationRoute}
          />
        );
      case '2':
        return (
          <UserMangas
            userId={userId}
            navigation={navigation}
            route={navigationRoute}
          />
        );
      case '3':
        return (
          <UserNovels
            userId={userId}
            navigation={navigation}
            route={navigationRoute}
          />
        );
      default:
        return null;
    }
  };

  render() {
    return (
      <PXTabView
        navigationState={this.state}
        renderScene={this.renderScene}
        onIndexChange={this.handleChangeTab}
      />
    );
  }
}

export default connectLocalization(MyWorks);
