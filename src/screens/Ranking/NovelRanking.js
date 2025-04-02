import React, { Component } from 'react';
import { Platform } from 'react-native';
import NovelRankingList from './NovelRankingList';
import PastRanking from './PastRanking';
import PXTabView from '../../components/PXTabView';
import TabContentWrapper from '../../components/TabContentWrapper';
import { connectLocalization } from '../../components/Localization';
import { RANKING_FOR_UI } from '../../common/constants';
import mapRankingTypeString from '../../common/helpers/mapRankingTypeString';

class NovelRanking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      routes: this.getRoutes(),
    };
  }

  componentDidMount() {
    const { navigation, route, i18n } = this.props;
    navigation.setOptions({
      title: `${mapRankingTypeString(route.params?.rankingType, i18n)} ${
        i18n.ranking
      }`,
    });
  }

  getRoutes = () => {
    const { i18n } = this.props;
    // always return new array so that localized title will be updated on switch language
    return [
      {
        key: '1',
        title: i18n.rankingYear,
        rankingMode: RANKING_FOR_UI.YEARLY_NOVEL,
      },
      {
        key: '2',
        title: i18n.rankingAll,
        rankingMode: RANKING_FOR_UI.ALL_NOVEL,
      },
      {
        key: '3',
        title: i18n.rankingPast,
        rankingMode: RANKING_FOR_UI.PAST_NOVEL,
      },
    ];
  };

  handleChangeTab = (index) => {
    this.setState({ index });
  };

  renderScene = ({ route }) => {
    const { route: navigationRoute } = this.props;
    const { routes, index } = this.state;
    const { rankingType } = navigationRoute.params;
    const { rankingMode, reload } = route;
    return (
      <TabContentWrapper active={routes.indexOf(route) === index}>
        {rankingMode === RANKING_FOR_UI.PAST_NOVEL ? (
          <PastRanking
            rankingType={rankingType}
            rankingMode={rankingMode}
            route={route}
          />
        ) : (
          <NovelRankingList
            rankingMode={rankingMode}
            route={route}
            reload={reload}
          />
        )}
      </TabContentWrapper>
    );
  };

  render() {
    return (
      <PXTabView
        navigationState={this.state}
        renderScene={this.renderScene}
        onIndexChange={this.handleChangeTab}
        scrollEnabled
        includeStatusBarPadding={Platform.OS === 'ios'}
      />
    );
  }
}

export default connectLocalization(NovelRanking);
