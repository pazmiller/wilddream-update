import React from 'react';
import PXWebView from '../../components/PXWebView';

const signUpUrl = 'https://www.wilddream.net/Art/register';

const SignUp = () => (
  <PXWebView
    source={{
      uri: signUpUrl,
    }}
  />
);

export default SignUp;
