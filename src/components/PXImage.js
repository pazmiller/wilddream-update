import React, { PureComponent } from 'react';
import { Image } from 'react-native';

class PXImage extends PureComponent {
  render() {
    const { style, uri, ...otherProps } = this.props;
    return (
      <Image
        source={{
          uri,
          headers: {
            referer: 'http://www.pixiv.net',
          },
        }}
        style={style}
        {...otherProps}
      />
    );
  }
}

export default PXImage;
