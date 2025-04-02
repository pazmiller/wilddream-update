import React, { Component } from 'react';
import { View, StyleSheet, Image, Platform, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { withTheme, Text } from 'react-native-paper';
import { Icon } from 'react-native-elements';
import { connectLocalization } from '../../components/Localization';
import PXListItem from '../../components/PXListItem';
import { globalStyles } from '../../styles';
import openUrl from '../../common/helpers/openUrl';

const appStoreUrl = '';
const googlePlayUrl =
  'https://play.google.com/store/apps/details?id=com.furcoder.wilddream';
const sourceUrl = 'https://github.com/FurCoder/pxview';

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
  },
  nameContainer: {
    flexDirection: 'row',
  },
  name: {
    fontSize: 20,
  },
  listContainer: {
    marginHorizontal: 10,
  },
});

const list = [
  {
    id: 'forkPxView',
    title: 'forkPxView',
    icon: 'heart',
    type: 'font-awesome',
    size: 21,
  },
  {
    id: 'contactUs',
    title: 'contactUs',
    icon: 'envelope',
    type: 'font-awesome',
    size: 21,
  },
  {
    id: 'rateApp',
    title: 'rateApp',
    icon: 'star',
    type: 'font-awesome',
    size: 22,
  },
  {
    id: 'sourceCode',
    title: 'sourceCode',
    subtitle: sourceUrl,
    icon: 'github',
    type: 'font-awesome',
  },
];

class About extends Component {
  handleOnPressListItem = (item) => {
    switch (item.id) {
      case 'forkPxView': {
        openUrl('https://github.com/alphasp/pxview');
        break;
      }
      case 'contactUs': {
        openUrl('https://www.wilddream.net/Art/index/contact');
        break;
      }
      case 'rateApp': {
        const url = Platform.OS === 'ios' ? appStoreUrl : googlePlayUrl;
        if (Platform.OS === 'android') {
          openUrl(url);
        }
        break;
      }
      case 'sourceCode': {
        openUrl(sourceUrl);
        break;
      }
      default:
        break;
    }
  };

  render() {
    const { i18n, theme } = this.props;
    return (
      <View
        style={[
          globalStyles.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../images/logo.png')} // eslint-disable-line global-require
            style={styles.logo}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>WildDream v{DeviceInfo.getVersion()}</Text>
          </View>
        </View>
        <View style={styles.listContainer}>
          {list.map((item) => (
            <PXListItem
              key={item.id}
              title={i18n.formatString(
                i18n[item.title],
                Platform.OS === 'ios' ? 'App Store' : 'Google Play',
              )}
              left={({ color }) => (
                <Icon
                  name={item.icon}
                  type={item.type}
                  color={color}
                  size={item.size}
                />
              )}
              onPress={() => this.handleOnPressListItem(item)}
              description={item.subtitle}
            />
          ))}
        </View>
      </View>
    );
  }
}

export default withTheme(connectLocalization(About));
