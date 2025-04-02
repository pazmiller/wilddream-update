import React, { Component } from 'react';
import { StyleSheet, View, StatusBar, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import ImageViewing from 'react-native-image-viewing';
import PXHeader from '../../components/PXHeader';
import HeaderTextTitle from '../../components/HeaderTextTitle';
import HeaderSaveImageButton from '../../components/HeaderSaveImageButton';
import Loader from '../../components/Loader';
import { READING_DIRECTION_TYPES } from '../../common/constants';

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  slide: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageFooter: {
    height: 64,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
} );

class ImagesViewer extends Component {
  constructor( props ) {
    super( props );
    const { route, imageReadingDirection } = props;
    const { images, viewerIndex } = route.params;
    const imagesWithDirection =
      imageReadingDirection === READING_DIRECTION_TYPES.RIGHT_TO_LEFT
        ? images.reverse()
        : images;
    this.state = {
      index:
        imageReadingDirection === READING_DIRECTION_TYPES.RIGHT_TO_LEFT
          ? images.length - 1 - viewerIndex
          : viewerIndex,
      images: imagesWithDirection.map( ( url ) => ( {
        uri: url,
        headers: {
          referer: 'http://www.pixiv.net',
        },
      } ) ),
      hideHeader: false,
      visible: true,
      loadedImages: {},
    };
  }

  handleImageLoad = ( imageUrl ) => {
    this.setState( ( prevState ) => ( {
      loadedImages: {
        ...prevState.loadedImages,
        [ imageUrl ]: true,
      },
    } ) );
  };

  handleOnPressImage = () => {
    this.setState( ( prevState ) => ( {
      hideHeader: !prevState.hideHeader,
    } ) );
  };

  handleChangeIndex = ( index ) => {
    this.setState( { index } );
  };

  getCurrentPageNumber = () => {
    const { route, imageReadingDirection } = this.props;
    const { images } = route.params;
    const { index } = this.state;
    if ( imageReadingDirection === READING_DIRECTION_TYPES.RIGHT_TO_LEFT )
    {
      return images.length - index;
    }
    return index + 1;
  };

  handleClose = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  render() {
    const { route, imageReadingDirection } = this.props;
    const { item } = route.params;
    const { index, images, hideHeader, visible, loadedImages } = this.state;

    const selectedImage = images[ index ]?.uri;
    const selectedImages = selectedImage ? [ selectedImage ] : [];

    const saveButton = item.disable_save ? <></> : <HeaderSaveImageButton
      imageUrls={selectedImages}
      imageIndex={
        imageReadingDirection === READING_DIRECTION_TYPES.RIGHT_TO_LEFT
          ? images.length - index - 1
          : index
      }
      workId={item.id}
      workTitle={item.title}
      workType={item.type}
      userId={item.user.id}
      userName={item.user.name}
    />;

    const headerComponent = !hideHeader ? (
      <PXHeader
        darkTheme
        withShadow
        absolutePosition
        showBackButton
        onPressBackButton={this.handleClose}
        headerTitle={
          <HeaderTextTitle>
            {images.length > 1
              ? `${this.getCurrentPageNumber()}/${images.length}`
              : null}
          </HeaderTextTitle>
        }
        headerRight={saveButton}
      />
    ) : null;

    return (
      <View style={styles.container}>
        <StatusBar hidden={hideHeader} barStyle="light-content" animated />

        <ImageViewing
          images={images}
          imageIndex={index}
          visible={visible}
          onRequestClose={this.handleClose}
          onImageIndexChange={this.handleChangeIndex}
          presentationStyle="fullScreen"
          animationType="fade"
          backgroundColor="#000"
          HeaderComponent={headerComponent}
          onLongPress={this.handleOnPressImage}
          onTap={this.handleOnPressImage}
          swipeToCloseEnabled={false}
          doubleTapToZoomEnabled
        />
      </View>
    );
  }
}

export default connect( ( state ) => {
  const { imageReadingDirection } = state.readingSettings;
  return {
    imageReadingDirection,
  };
} )( ImagesViewer );