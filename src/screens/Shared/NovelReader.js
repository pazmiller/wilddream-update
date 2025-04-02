import React, { Component } from 'react';
import { View, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import { withTheme } from 'react-native-paper';
import NovelViewer from '../../components/NovelViewer';
import PXHeader from '../../components/PXHeader';
import HeaderTextTitle from '../../components/HeaderTextTitle';
import HeaderSettingsButton from '../../components/HeaderSettingsButton';
import Loader from '../../components/Loader';
import * as novelTextActionCreators from '../../common/actions/novelText';
import * as modalActionCreators from '../../common/actions/modal';
import { makeGetParsedNovelText } from '../../common/selectors';
import { MODAL_TYPES, READING_DIRECTION_TYPES } from '../../common/constants';
import { globalStyles } from '../../styles';

class NovelReader extends Component {
  constructor(props) {
    super(props);
    const { novelReadingDirection, parsedNovelText } = props;
    let state;
    if (parsedNovelText) {
      if (novelReadingDirection === READING_DIRECTION_TYPES.RIGHT_TO_LEFT) {
        state = {
          index: parsedNovelText.length - 1,
        };
      } else {
        state = {
          index: 0,
        };
      }
    } else {
      state = {
        index: 0,
      };
    }
    this.state = state;
  }

  componentDidMount() {
    const { fetchNovelText, clearNovelText, novelText, novelId } = this.props;
    if (!novelText || !novelText.text) {
      clearNovelText(novelId);
      InteractionManager.runAfterInteractions(() => {
        fetchNovelText(novelId);
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { novelReadingDirection, parsedNovelText } = this.props;
    const { parsedNovelText: prevParsedNovelText } = prevProps;
    if (parsedNovelText && !prevParsedNovelText) {
      this.setState({
        index:
          novelReadingDirection === READING_DIRECTION_TYPES.RIGHT_TO_LEFT
            ? parsedNovelText.length - 1
            : 0,
      });
    }
  }

  handleOnIndexChange = (index) => {
    this.setState({ index });
  };

  handleOnPressPageLink = (page) => {
    const { novelReadingDirection, parsedNovelText } = this.props;
    const parsedPage = parseInt(page, 10);
    this.setState({
      index:
        novelReadingDirection === READING_DIRECTION_TYPES.RIGHT_TO_LEFT
          ? parsedNovelText.length - parsedPage
          : parsedPage - 1,
    });
  };

  handleOnPressOpenSettings = () => {
    const { openModal } = this.props;
    openModal(MODAL_TYPES.NOVEL_SETTINGS);
  };

  renderHeaderTitle = () => {
    const { parsedNovelText, novelReadingDirection } = this.props;
    const { index } = this.state;
    return (
      <HeaderTextTitle>
        {`${
          novelReadingDirection === READING_DIRECTION_TYPES.RIGHT_TO_LEFT
            ? parsedNovelText.length - index
            : index + 1
        }/${parsedNovelText.length}`}
      </HeaderTextTitle>
    );
  };

  renderHeaderRight = () => (
    <HeaderSettingsButton onPress={this.handleOnPressOpenSettings} />
  );

  render() {
    const {
      novelId,
      novelText,
      parsedNovelText,
      novelSettings: { fontSize, lineHeight },
      theme,
    } = this.props;
    const { index } = this.state;
    return (
      <View
        style={[
          globalStyles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <PXHeader
          darkTheme
          withShadow
          showBackButton
          headerTitle={parsedNovelText && this.renderHeaderTitle()}
          headerRight={this.renderHeaderRight()}
        />
        {(!novelText ||
          !novelText.loaded ||
          novelText.loading ||
          index === null) && <Loader />}
        {parsedNovelText && index !== null && (
          <NovelViewer
            novelId={novelId}
            items={parsedNovelText}
            index={index}
            fontSize={fontSize}
            lineHeight={lineHeight}
            onIndexChange={this.handleOnIndexChange}
            onPressPageLink={this.handleOnPressPageLink}
          />
        )}
      </View>
    );
  }
}

export default withTheme(
  connect(
    () => {
      const getParsedNovelText = makeGetParsedNovelText();
      return (state, props) => {
        const { novelText, novelSettings, readingSettings } = state;
        const parsedNovelText = getParsedNovelText(state, props);
        const novelId = props.novelId || props.route.params.novelId;
        return {
          novelText: novelText[novelId],
          novelId,
          parsedNovelText,
          novelSettings,
          novelReadingDirection: readingSettings.novelReadingDirection,
        };
      };
    },
    { ...novelTextActionCreators, ...modalActionCreators },
  )(NovelReader),
);
