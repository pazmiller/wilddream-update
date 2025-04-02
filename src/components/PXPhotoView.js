import React, { PureComponent } from 'react';
import { StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import { globalStyleVariables } from '../styles';

const styles = StyleSheet.create( {
  photo: {
    width: globalStyleVariables.WINDOW_WIDTH,
    height: globalStyleVariables.WINDOW_HEIGHT,
    resizeMode: 'contain',
  },
} );

class PXPhotoView extends PureComponent {
  handleOnLoad = () => {
    const { onLoad, uri } = this.props;
    if ( onLoad )
    {
      onLoad( uri );
    }
  };

  handleOnPress = () => {
    const { onTap } = this.props;
    if ( onTap )
    {
      onTap();
    }
  };

  render() {
    const { uri, style, onLoad, onTap, onViewTap, ...restProps } = this.props;
    return (
      <TouchableWithoutFeedback onPress={this.handleOnPress}>
        <Image
          source={{
            uri,
            headers: {
              referer: 'http://www.pixiv.net',
            },
          }}
          style={[ styles.photo, style ]}
          onLoad={this.handleOnLoad}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...restProps}
        />
      </TouchableWithoutFeedback>
    );
  }
}

export default PXPhotoView;