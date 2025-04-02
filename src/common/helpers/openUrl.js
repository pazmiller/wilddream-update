import { Linking } from 'react-native'

openUrl = (url) => {
  Linking.canOpenURL(url)
    .then((supported) => {
    if (!supported) {
      return null;          
    }
    return Linking.openURL(url);
  })
  .catch((err) => err);
};

export default openUrl;