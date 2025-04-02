import React, { Component } from 'react';
import RankingList from './RankingList';
import PastRanking from './PastRanking';
import PXTabView from '../../components/PXTabView';
import TabContentWrapper from '../../components/TabContentWrapper';
import { connectLocalization } from '../../components/Localization';
import { RANKING_TYPES, RANKING_FOR_UI } from '../../common/constants';
import mapRankingTypeString from '../../common/helpers/mapRankingTypeString';

class Ranking extends Component {
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
    const { i18n, route } = this.props;
    const { rankingType } = route.params;
    // always return new array so that localized title will be updated on switch language
    switch (rankingType) {
      case RANKING_TYPES.ILLUST:
        return [
          {
            key: '1',
            title: i18n.rankingDay,
            rankingMode: RANKING_FOR_UI.DAILY_ILLUST,
            // reload: false,
          },
          {
            key: '2',
            title: i18n.rankingWeek,
            rankingMode: RANKING_FOR_UI.WEEKLY_ILLUST,
          },
          {
            key: '3',
            title: i18n.rankingMonth,
            rankingMode: RANKING_FOR_UI.MONTHLY_ILLUST,
          },
          {
            key: '4',
            title: i18n.rankingYear,
            rankingMode: RANKING_FOR_UI.YEARLY_ILLUST,
          },
          {
            key: '5',
            title: i18n.rankingAll,
            rankingMode: RANKING_FOR_UI.ALL_ILLUST,
          },
          {
            key: '6',
            title: i18n.rankingPast,
            rankingMode: RANKING_FOR_UI.PAST_ILLUST,
          },
        ];
      case RANKING_TYPES.MANGA:
        return [
          {
            key: '1',
            title: i18n.rankingDay,
            rankingMode: RANKING_FOR_UI.DAILY_MANGA,
            reload: false,
          },
          {
            key: '2',
            title: i18n.rankingWeekRookie,
            rankingMode: RANKING_FOR_UI.WEEKLY_ROOKIE_MANGA,
          },
          {
            key: '3',
            title: i18n.rankingWeek,
            rankingMode: RANKING_FOR_UI.WEEKLY_MANGA,
          },
          {
            key: '4',
            title: i18n.rankingMonth,
            rankingMode: RANKING_FOR_UI.MONTHLY_MANGA,
          },
          {
            key: '5',
            title: i18n.rankingPast,
            rankingMode: RANKING_FOR_UI.PAST_MANGA,
          },
        ];
      default:
        return [];
    }
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
        {rankingMode === RANKING_FOR_UI.PAST_ILLUST ||
        rankingMode === RANKING_FOR_UI.PAST_MANGA ? (
          <PastRanking
            rankingType={rankingType}
            rankingMode={rankingMode}
            route={route}
          />
        ) : (
          <RankingList
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
      />
    );
  }
}

export default connectLocalization(Ranking);
