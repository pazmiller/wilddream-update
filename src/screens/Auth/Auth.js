import React, { Component } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  Modal,
  Pressable,
  Linking,
  Platform
} from 'react-native';
import { connect } from 'react-redux';
import { withFormik, Field } from 'formik';
import { withTheme, Button, Text } from 'react-native-paper';
import OverlaySpinner from 'react-native-loading-spinner-overlay';
import PXFormInput from '../../components/PXFormInput';
import { connectLocalization } from '../../components/Localization';
import WalkthroughIllustList from '../../containers/WalkthroughIllustList';
import * as authActionCreators from '../../common/actions/auth';
import * as modalActionCreators from '../../common/actions/modal';
import { MODAL_TYPES, SCREENS } from '../../common/constants';
import PKCE from '../../common/helpers/pkce';
import { globalStyleVariables } from '../../styles';
import openUrl from '../../common/helpers/openUrl';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    paddingHorizontal: 5,
    paddingTop: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
  },
  formContainer: {
    justifyContent: 'center',
    margin: 15,
    padding: 20,
  },
  buttonContainer: {
    marginTop: 15,
  },
  outlineButtonContainer: {
    borderColor: globalStyleVariables.PRIMARY_COLOR,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  privacyPolicy: {
    textAlign: 'center',
    marginTop: 15,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    // borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
  },
  modalTitle: {
    marginBottom: 15,
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

const validate = (values, props) => {
  const { email, password } = values;
  const { i18n } = props;
  const errors = {};
  if (!email) {
    errors.email = i18n.loginValidateEmailOrPixivId;
  }
  if (!password) {
    errors.password = i18n.loginValidatePassword;
  }
  return errors;
};

const handleOnSubmit = (values, { props }) => {
  const { login } = props;
  const { email, password } = values;
  if (email && password) {
    Keyboard.dismiss();
    login(email, password);
  }
};

class Auth extends Component {
  handleOnPressSignUp = () => {
    // const {
    //   navigation: { navigate },
    // } = this.props;
    // navigate(SCREENS.SignUp);
    openUrl("https://www.wilddream.net/Art/register");
  };

  handleOnPressPrivacyPolicy = () => {
    const {
      i18n
    } = this.props;
    // navigate(SCREENS.PrivacyPolicy);
    if (i18n.lang_code == 'zh') {
      Linking.openURL('https://github.com/FurCoder/pxview/blob/master/privacy-policy/zh.md')
    } else {
      Linking.openURL('https://github.com/FurCoder/pxview/blob/master/privacy-policy/en.md')
    }  
  };    

  handleOnPressEULA = () => {
    const {
      i18n
    } = this.props;
    Linking.openURL('https://www.wilddream.net/Art/index/term_of_service')
  };   

  handleOnPressGuestMode = () => {  
    this.props.login("guest", "guest");
  }

  state = {
    modalVisible: true,
  };
  
  render() {
    const {
      auth: { loading },
      modal,
      i18n,
      handleSubmit,
      setFieldValue,
      setFieldTouched,
      theme,
    } = this.props; 
    const {modalVisible} = this.state;      
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          <WalkthroughIllustList />
        </View>        
        {modal.modalType !== MODAL_TYPES.SIGNUP && (
          <View
            style={[
              styles.innerContainer,
              modal.modalType === MODAL_TYPES.SIGNUP && {},
            ]}
          >
            <KeyboardAvoidingView behavior="padding">
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../images/logo.png')} // eslint-disable-line global-require
                  style={styles.logo}
                />
              </View>
              <View
                style={[
                  styles.formContainer,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <Field
                  name="email"
                  component={PXFormInput}
                  label={i18n.loginEmailOrPixivId}
                  mode="outlined"
                  autoCapitalize="none"
                  onChangeText={setFieldValue}
                  onBlur={setFieldTouched}
                />
                <Field
                  name="password"
                  component={PXFormInput}
                  label={i18n.password}
                  mode="outlined"
                  secureTextEntry
                  onChangeText={setFieldValue}
                  onBlur={setFieldTouched}
                />
                <Button
                  style={styles.buttonContainer}
                  mode="contained"
                  onPress={handleSubmit}
                >
                  {i18n.login}
                </Button>
                <Button
                  style={[
                    styles.buttonContainer,
                    styles.outlineButtonContainer,
                  ]}
                  mode="outlined"
                  onPress={this.handleOnPressSignUp}
                >
                  {i18n.loginNoAccount}
                </Button>
                <Button
                  style={[
                    styles.buttonContainer,
                    styles.outlineButtonContainer,
                  ]}
                  mode="outlined"
                  onPress={this.handleOnPressGuestMode}
                >
                  {i18n.guestMode}
                </Button>
                <TouchableOpacity onPress={this.handleOnPressPrivacyPolicy}>
                  <Text style={styles.privacyPolicy}>{i18n.privacyPolicy}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.handleOnPressEULA}>
                  <Text style={styles.privacyPolicy}>{i18n.EULA}</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
            <OverlaySpinner visible={loading} />
          </View>
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            this.setState({modalVisible: !modalVisible});
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                <Text style={styles.modalTitle}>{i18n.privacyPolicySummary}</Text>
                {'\n\n'}
                {i18n.privacyPolicySummaryContent}
                <Text style={{color: 'blue'}} onPress={() => {
                  if (i18n.lang_code == 'zh') {
                    Linking.openURL('https://github.com/FurCoder/pxview/blob/master/privacy-policy/zh.md')
                  } else {
                    Linking.openURL('https://github.com/FurCoder/pxview/blob/master/privacy-policy/en.md')
                  }                  
                }
                  }>{i18n.privacyPolicy}</Text>
                {'\n\n'}
                {i18n.EULASummaryContent}
                <Text style={{color: 'blue'}} onPress={() => {
                  Linking.openURL('https://www.wilddream.net/Art/index/term_of_service')          
                }
                  }>{i18n.EULA}</Text>
              </Text>              
              <Button
                style={styles.buttonContainer}
                mode="contained"
                onPress={() => this.setState({modalVisible: !modalVisible})}>
                {i18n.accept}
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const LoginForm = withFormik({
  mapPropsToValues: () => ({
    email: '',
    password: '',
  }),
  validate,
  handleSubmit: handleOnSubmit
})(Auth);

export default withTheme(
  connectLocalization(
    connect(
      (state, props) => ({
        auth: state.auth,
        modal: state.modal,
        onLoginSuccess:
          props.onLoginSuccess ||
          (props.route &&
            props.route.params &&
            props.route.params.onLoginSuccess),
      }),
      {
        ...authActionCreators,
        ...modalActionCreators,
      },
    )(LoginForm),
  ),
);
