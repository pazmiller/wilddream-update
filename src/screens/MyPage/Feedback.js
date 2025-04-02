import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  DeviceEventEmitter,
  InteractionManager,
  Keyboard,
} from 'react-native';
import database from '@react-native-firebase/database';
import { connect } from 'react-redux';
import { withTheme, TextInput } from 'react-native-paper';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
import Icon from 'react-native-vector-icons/FontAwesome';
import OverlaySpinner from 'react-native-loading-spinner-overlay';
import { connectLocalization } from '../../components/Localization';
import PXTouchable from '../../components/PXTouchable';
import * as errorActionCreators from '../../common/actions/error';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emailLabel: {
    marginLeft: 10,
    marginRight: 10,
  },
  emailInput: {
    marginLeft: 10,
    marginRight: 10,
  },
  feedbackInput: {
    flex: 1,
    margin: 10,
    textAlignVertical: 'top',
  },
});

class Feedback extends Component {
  constructor(props) {
    super(props);
    const { user } = props;
    this.state = {
      feedback: '',
      email: user.mail_address || '',
      loading: false,
    };
  }

  componentDidMount() {
    this.setHeaderRight();
    this.ref = database().ref('feedback');
  }

  componentWillUnmount() {
    this.ref.off();
  }

  setHeaderRight = () => {
    const {
      navigation: { setOptions },
    } = this.props;
    const { feedback } = this.state;
    setOptions({
      headerRight: () => (
        <PXTouchable onPress={this.handleOnSubmitFeedback} disabled={!feedback}>
          <Icon
            name="pencil"
            style={{ padding: 10 }}
            size={20}
            color={feedback ? '#fff' : 'gray'}
          />
        </PXTouchable>
      ),
    });
  };

  handleOnChangeFeedback = (text) => {
    this.setState(
      {
        feedback: text,
      },
      () => {
        this.setHeaderRight();
      },
    );
  };

  handleOnChangeEmail = (text) => {
    this.setState({
      email: text,
    });
  };

  handleOnSubmitFeedback = async () => {
    const {
      i18n,
      addError,
      navigation: { goBack },
    } = this.props;
    const { feedback, email } = this.state;
    Keyboard.dismiss();
    this.setState({ loading: true });
    const manufacturer = await DeviceInfo.getManufacturer();
    this.ref
      .push()
      .set({
        platform: DeviceInfo.getSystemName(),
        manufacturer,
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        appBuildNumber: DeviceInfo.getBuildNumber(),
        locale: RNLocalize.getLocales()[0].languageTag,
        country: RNLocalize.getCountry(),
        createdAt: database.ServerValue.TIMESTAMP,
        feedback,
        email,
      })
      .then(() => {
        this.setState({ loading: false });
        goBack();
        InteractionManager.runAfterInteractions(() => {
          DeviceEventEmitter.emit('showToast', i18n.feedbackSuccess);
        });
      })
      .catch(() => {
        this.setState({ loading: false });
        addError(i18n.feedbackError);
      });
  };

  render() {
    const { i18n, theme } = this.props;
    const { feedback, email, loading } = this.state;
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
      >
        <TextInput
          label={i18n.feedbackEmailOptional}
          placeholder={i18n.accountSettingsEmail}
          value={email}
          keyboardType="email-address"
          style={styles.emailInput}
          onChangeText={this.handleOnChangeEmail}
        />
        <TextInput
          label={i18n.feedback}
          placeholder={i18n.feedbackPlaceholder}
          multiline
          autoFocus
          style={[styles.feedbackInput, { color: theme.colors.text }]}
          onChangeText={this.handleOnChangeFeedback}
          value={feedback}
        />
        <OverlaySpinner visible={loading} />
      </View>
    );
  }
}

export default withTheme(
  connectLocalization(
    connect(
      (state) => ({
        user: state.auth.user,
      }),
      errorActionCreators,
    )(Feedback),
  ),
);
