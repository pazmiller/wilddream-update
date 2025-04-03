import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, Modal } from 'react-native';
import { connect } from 'react-redux';
import { withTheme, Text, Button } from 'react-native-paper';
import moment from 'moment';
import camelCase from 'lodash.camelcase';
// import DatePicker from 'react-native-datepicker';
import DatePicker from 'react-native-date-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import RankingList from './RankingList';
import NovelRankingList from './NovelRankingList';
import PXTouchable from '../../components/PXTouchable';
import PXBottomSheet from '../../components/PXBottomSheet';
import PXBottomSheetButton from '../../components/PXBottomSheetButton';
import PXBottomSheetCancelButton from '../../components/PXBottomSheetCancelButton';
import { connectLocalization } from '../../components/Localization';
import {
  RANKING_ILLUST,
  R18_RANKING_ILLUST,
  R18G_RANKING_ILLUST,
  RANKING_MANGA,
  R18_RANKING_MANGA,
  R18G_RANKING_MANGA,
  RANKING_NOVEL,
  R18_RANKING_NOVEL,
  R18G_RANKING_NOVEL,
  RANKING_TYPES,
} from '../../common/constants';
import { globalStyles, globalStyleVariables } from '../../styles';

const styles = StyleSheet.create( {
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  rankingPickerContainer: {
    marginRight: 10,
  },
  rankingPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 42,
  },
  rankingPickerText: {
    padding: 10,
  },
  rankingPickerIcon: {
    paddingLeft: 5,
  },
  bottomSheetListItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 48,
  },
  bottomSheetText: {
    marginLeft: 32,
  },
  bottomSheetCancelIcon: {
    marginLeft: 3,
  },
  bottomSheetCancelText: {
    marginLeft: 36,
  },
  datePickerContainer: {
    flex: 1,
    borderColor: 'gray',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  dateText: {
    paddingHorizontal: 10,
  },
  datePickerModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  datePickerButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
} );

class PastRanking extends Component {
  constructor( props ) {
    super( props );
    const { rankingType } = props;
    let mode;
    if ( rankingType === RANKING_TYPES.ILLUST )
    {
      this.ranking = RANKING_ILLUST;
      this.r18Ranking = R18_RANKING_ILLUST;
      this.r18GRanking = R18G_RANKING_ILLUST;
      mode = 'day';
    } else if ( rankingType === RANKING_TYPES.MANGA )
    {
      this.ranking = RANKING_MANGA;
      this.r18Ranking = R18_RANKING_MANGA;
      this.r18GRanking = R18G_RANKING_MANGA;
      mode = 'day_manga';
    } else if ( rankingType === RANKING_TYPES.NOVEL )
    {
      this.ranking = RANKING_NOVEL;
      this.r18Ranking = R18_RANKING_NOVEL;
      this.r18GRanking = R18G_RANKING_NOVEL;
      mode = 'day';
    }

    const twoDaysAgo = moment().subtract( 2, 'days' ).toDate();

    this.state = {
      isOpenRankingModeBottomSheet: false,
      date: twoDaysAgo,
      dateString: moment( twoDaysAgo ).format( 'YYYY-MM-DD' ),
      mode,
      isDatePickerVisible: false,
    };
  }

  openRankingModeBottomSheet = () => {
    this.setState( { isOpenRankingModeBottomSheet: true } );
  };

  handleOnCancelRankingModeBottomSheet = () => {
    this.setState( { isOpenRankingModeBottomSheet: false } );
  };

  handleOnPressRankingMode = ( mode ) => {
    this.setState( { mode } );
    this.handleOnCancelRankingModeBottomSheet();
  };

  openDatePicker = () => {
    this.setState( { isDatePickerVisible: true } );
  };

  closeDatePicker = () => {
    this.setState( { isDatePickerVisible: false } );
  };

  handleOnDateChange = ( newDate ) => {
    this.setState( {
      date: newDate,
    } );
  };

  confirmDate = () => {
    this.setState( {
      dateString: moment( this.state.date ).format( 'YYYY-MM-DD' ),
      isDatePickerVisible: false,
    } );
  };

  cancelDate = () => {
    this.setState( {
      isDatePickerVisible: false,
    } );
  };

  mapRankingString = ( ranking ) => {
    const { i18n } = this.props;
    return i18n[ `ranking${ranking.charAt( 0 ).toUpperCase() + ranking.slice( 1 )}` ];
  };

  renderRankingOptions = ( ranking, rankingMode ) => (
    <PXBottomSheetButton
      key={ranking}
      onPress={() => this.handleOnPressRankingMode( rankingMode )}
      iconName="md-funnel"
      iconType="ionicon"
      text={this.mapRankingString( ranking )}
    />
  );

  render() {
    const { user, i18n, route, rankingMode, rankingType, theme } = this.props;
    const { date, dateString, mode, isOpenRankingModeBottomSheet, isDatePickerVisible } = this.state;
    const selectedRankingMode =
      rankingType === RANKING_TYPES.MANGA ? mode.replace( '_manga', '' ) : mode;

    // Calculate min date (pixiv launch date) and max date (today)
    const minDate = new Date( '2007-09-13' );
    const maxDate = new Date();

    return (
      <View style={globalStyles.container}>
        <View style={styles.filterContainer}>
          <PXTouchable
            style={styles.rankingPickerContainer}
            onPress={this.openRankingModeBottomSheet}
          >
            <View style={styles.rankingPicker}>
              <Text style={styles.rankingPickerText}>
                {this.mapRankingString( camelCase( selectedRankingMode ) )}
              </Text>
              <Icon
                name="caret-down"
                size={24}
                style={styles.rankingPickerIcon}
                color={theme.colors.text}
              />
            </View>
          </PXTouchable>

          <PXTouchable
            style={styles.datePickerContainer}
            onPress={this.openDatePicker}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[ styles.dateText, { color: theme.colors.text } ]}>
                {dateString}
              </Text>
              <Icon
                name="calendar"
                size={16}
                color={theme.colors.text}
                style={{ marginLeft: 10 }}
              />
            </View>
          </PXTouchable>

          <Modal
            transparent
            visible={isDatePickerVisible}
            animationType="fade"
          >
            <View style={styles.datePickerModalContainer}>
              <View style={styles.datePickerModalContent}>
                <DatePicker
                  date={date}
                  mode="date"
                  minimumDate={minDate}
                  maximumDate={maxDate}
                  onDateChange={this.handleOnDateChange}
                  androidVariant="nativeAndroid"
                  textColor="#000000"
                />
                <View style={styles.datePickerButtonContainer}>
                  <Button
                    onPress={this.cancelDate}
                    mode="text"
                  >
                    {i18n.cancel}
                  </Button>
                  <Button
                    onPress={this.confirmDate}
                    mode="contained"
                    color={globalStyleVariables.PRIMARY_COLOR}
                  >
                    {i18n.ok}
                  </Button>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        {rankingType === RANKING_TYPES.NOVEL ? (
          <NovelRankingList
            rankingMode={rankingMode}
            options={{ date: dateString, mode }}
            route={route}
          />
        ) : (
          <RankingList
            rankingMode={rankingMode}
            options={{ date: dateString, mode }}
            route={route}
          />
        )}

        <PXBottomSheet
          visible={isOpenRankingModeBottomSheet}
          onCancel={this.handleOnCancelRankingModeBottomSheet}
        >
          <ScrollView>
            {Object.keys( this.ranking ).map( ( ranking ) =>
              this.renderRankingOptions( ranking, this.ranking[ ranking ] ),
            )}
            {user &&
              user.x_restrict > 0 &&
              Object.keys( this.r18Ranking ).map( ( ranking ) =>
                this.renderRankingOptions( ranking, this.r18Ranking[ ranking ] ),
              )}
            {user &&
              user.x_restrict > 1 &&
              Object.keys( this.r18GRanking ).map( ( ranking ) =>
                this.renderRankingOptions( ranking, this.r18GRanking[ ranking ] ),
              )}
            <PXBottomSheetCancelButton
              onPress={this.handleOnCancelRankingModeBottomSheet}
              text={i18n.cancel}
            />
          </ScrollView>
        </PXBottomSheet>
      </View>
    );
  }
}

export default withTheme(
  connectLocalization(
    connect( ( state ) => ( {
      user: state.auth.user,
    } ) )( PastRanking ),
  ),
);