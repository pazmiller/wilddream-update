/* eslint strict:0 */

'use strict';

import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
import { Alert, Linking } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
import XgPush from 'tpns_rn_plugin';
import i18n from './i18n';

const axios = require('axios');
const qs = require('qs');
const md5 = require('blueimp-md5');
const moment = require('moment');

const BASE_URL = 'https://app-api.pixiv.net';
const CLIENT_ID = 'KzEZED7aC0vird8jWyHM38mXjNTY';
const CLIENT_SECRET = 'W9JZoJe00qPvJsiyCGT3CCtC6ZUtdpKpzMbNlUGP';
const HASH_SECRET =
  '28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c';
const filter = 'for_ios';
const WD_BASE_URL = 'https://www.wilddream.net/art/api';
// const WD_POST_URL = 'https://static.zjuapa.com/art/api'

function callApi(url, options) {
  const finalUrl = /^https?:\/\//i.test(url) ? url : WD_BASE_URL + url;
  console.log(finalUrl);
  console.log(options);
  return axios(finalUrl, options)
    .then(res => {
        console.log(JSON.stringify(res.data).substring(0, 100));
        return res.data;
    })
    .catch(err => {
      console.log(err);
      if (err.response) {
        console.log(err.response.data);
        throw err.response.data;
      } else {
        console.log(err.message);
        throw err.message;
      }
    });
}

class WildDreamApi {
  constructor(options) {
    this.headers = {
      'App-OS': DeviceInfo.getSystemName(),
      'Accept-Language': RNLocalize.getLocales()[0].languageTag,
      'App-OS-Version': DeviceInfo.getSystemVersion(),
      'App-Version': DeviceInfo.getVersion(),
      'User-Agent': 'WildDream App for ' + DeviceInfo.getSystemName() + ' ' + DeviceInfo.getVersion()
        + ' (Build ' + DeviceInfo.getBuildNumber() + ')'
    };    
    // this.firebaseToken = '';
    // this.refreshFirebaseToken();
    if (options && options.headers) {
      this.headers = Object.assign({}, this.headers, options.headers);
    }    
    this.token = null;
    this.onRegisteredDone = result => {
      console.log("[TPNS RN] onRegisteredDone:" + JSON.stringify(result));
      var token;
      if (typeof result === 'object' && result !== null && 'xgToken' in result) {
        token = result['xgToken'];
      } else {
        token = result;
      }
      if (this.token != token) {
        this.token = token;
        this.requestUrl(`${WD_BASE_URL}/updateTencentToken/token/` + token);
      }    
    };
    XgPush.addOnRegisteredDoneListener(this.onRegisteredDone);

    if (DeviceInfo.getSystemName() == 'Android') {
      this.requestUrl(`${WD_BASE_URL}/latestVersion/platform/` + DeviceInfo.getSystemName(), null).then(
        latest_version => {
          console.log("latest version: " + JSON.stringify(latest_version));
          if (latest_version.name != DeviceInfo.getVersion()) {
            Alert.alert(i18n.new_version_release, i18n.version + ' ' + latest_version.name + '\n' + latest_version.description, 
            [
              {text: i18n.download_apk, onPress: () => Linking.openURL(latest_version.apk_url)},
              {text: i18n.view_release_page, onPress: () => Linking.openURL(latest_version.release_page)},
              {text: i18n.cancel, onPress: () => {}, style: 'cancel'},
            ])
          }
        },
        () => {console.log('update check failed')}
      )
    }    
  }

  // refreshFirebaseToken() {
  //   messaging().requestPermission()
  //     .then(() => {
  //       console.log("User Now Has Permission");
  //       messaging().getToken().then(token => {
  //         console.log("Firebase token: ", token);
  //         this.firebaseToken = token;
  //         const data = qs.stringify({
  //           refresh_token: "",
  //           firebase_token: this.firebaseToken
  //         });
  //         const options = {
  //           method: 'POST',
  //           headers: Object.assign(this.getDefaultHeaders(), {
  //             'Content-Type': 'application/x-www-form-urlencoded',
  //           }),
  //           data,
  //         };
  //         axios(`${WD_BASE_URL}/refreshAccessToken`, options);
  //       });       
  //     })
  //     .catch(error => {
  //       console.log("Error", error)
  //       // User has rejected permissions  
  //     });
  // }

  enableTencentToken() {
    console.log("Platform OS: " + Platform.OS);
    if (Platform.OS === 'ios') {
      XgPush.startXg("1680013712", "I7F3CRIMTADF");
    } else {
      XgPush.startXg("1580013712", "ADGDEW7MKR69");
    }    
  }

  disableTencentToken() {
    XgPush.stopXg();
  }

  getDefaultHeaders() {
    const datetime = moment().format();
    return Object.assign({}, this.headers, {
      'X-Client-Time': datetime,
      'X-Client-Hash': md5(`${datetime}${HASH_SECRET}`),
    });
  }

  login(username, password, rememberPassword) {  
    console.log(this.firebaseToken);
    if (!username) {
      return Promise.reject(new Error('username required'));
    }
    if (!password) {
      return Promise.reject(new Error('password required'));
    }
    const data = qs.stringify({
      username: username,
      password: password,
      // firebase_token: this.firebaseToken
    });
    console.log(data);
    const options = {
      method: 'POST',
      headers: Object.assign(this.getDefaultHeaders(), {
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      data,      
    };     
    return axios(`${WD_BASE_URL}/login`, options) 
      .then(res => {
        this.auth = res.data;
        // eslint-disable-next-line no-unneeded-ternary
        this.rememberPassword = rememberPassword === false ? false : true;
        if (rememberPassword) {
          this.username = username;
          this.password = password;
        }
        console.log(res.data);
        if (this.token) {
          this.requestUrl(`${WD_BASE_URL}/updateTencentToken/token/` + this.token);
        }
        this.enableTencentToken();
        // this.refreshFirebaseToken();
        return res.data;
      })
      .catch(err => {
        console.log(err);
        if (err.response) {
          console.log(err.response.data);
          throw err.response.data;
        } else {
          console.log(err.message);
          throw err.message;
        }
      });  
  }

  logout() {
    this.auth = null;
    this.username = null;
    this.password = null;
    delete this.headers.Authorization;
    const data = qs.stringify({
      firebase_token: this.firebaseToken
    });
    const options = {
      method: 'POST',
      headers: Object.assign(this.getDefaultHeaders(), {
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      data,
    };
    if (this.token) {
      this.requestUrl(`${WD_BASE_URL}/removeTencentToken/token/` + this.token);
      this.token = null;
    }
    this.requestUrl(`${WD_BASE_URL}/logout`, options);
    this.disableTencentToken();
    return Promise.resolve();
  }

  authInfo() {
    return this.auth;
  }

  refreshAccessToken(refreshToken) {
    if ((!this.auth || !this.auth.refresh_token) && !refreshToken) {
      return Promise.reject(new Error('refresh_token required'));
    }
    const data = qs.stringify({
      refresh_token: refreshToken || this.auth.refresh_token,
      // firebase_token: this.firebaseToken
    });
    const options = {
      method: 'POST',
      headers: Object.assign(this.getDefaultHeaders(), {
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
      data,
    };
    console.log(data);
    console.log(`${WD_BASE_URL}/refreshAccessToken`);
    return axios(`${WD_BASE_URL}/refreshAccessToken`, options)
      .then(res => {
        console.log(res.data);
        this.auth = res.data; 
        this.enableTencentToken();       
        return res.data;
      })
      .catch(err => {
        console.log(err);
        if (err.response) {
          console.log(res.response.data);
          throw err.response.data;
        } else {
          console.log(err.message);
          throw err.message;
        }
      });
  }

  // eslint-disable-next-line class-methods-use-this
  createProvisionalAccount(nickname) {
    if (!nickname) {
      return Promise.reject(new Error('nickname required'));
    }
    const data = qs.stringify({
      ref: 'pixiv_ios_app_provisional_account',
      user_name: nickname,
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer WHDWCGnwWA2C8PRfQSdXJxjXp0G6ULRaRkkd6t5B6h8',
      },
      data,
    };
    console.log(data);
    return axios(
      'https://accounts.pixiv.net/api/provisional-accounts/create',
      options
    )
      .then(res => res.data.body)
      .catch(err => {
        if (err.response) {
          throw err.response.data;
        } else {
          throw err.message;
        }
      });
  }

  // require auth
  userState() {
    return this.requestUrl(`/v1/user/me/state`);
  }

  editUserAccount(fields) {
    if (!fields) {
      return Promise.reject(new Error('fields required'));
    }

    const data = qs.stringify(
      {
        current_password: fields.currentPassword,
        new_user_account: fields.pixivId, // changeable once per account
        new_password: fields.newPassword, // required if current account is provisional
        new_mail_address: fields.email,
      },
      { skipNulls: true }
    );
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };

    return this.requestUrl(
      'https://accounts.pixiv.net/api/account/edit',
      options
    );
  }

  sendAccountVerificationEmail() {
    const options = {
      method: 'POST',
    };
    return this.requestUrl('/v1/mail-authentication/send', options);
  }

  searchIllust(word, options) {
    if (!word) {
      return Promise.reject(new Error('word required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          word,
          search_target: 'partial_match_for_tags',
          sort: 'date_desc',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/searchillust?${queryString}`);
  }

  searchIllustPopularPreview(word, options) {
    if (!word) {
      return Promise.reject(new Error('word required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          word,
          search_target: 'partial_match_for_tags',
          sort: 'popular',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/searchillust?${queryString}`);
  }

  searchNovel(word, options) {
    if (!word) {
      return Promise.reject(new Error('word required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          word,
          search_target: 'partial_match_for_tags',
          sort: 'date_desc',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/searchnovel?${queryString}`);
  }

  searchNovelPopularPreview(word, options) {
    if (!word) {
      return Promise.reject(new Error('word required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          word,
          search_target: 'partial_match_for_tags',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`/v1/search/popular-preview/novel?${queryString}`);
  }

  searchIllustBookmarkRanges(word, options) {
    if (!word) {
      return Promise.reject('word required');
    }
    const queryString = qs.stringify(
      Object.assign(
        {
          word,
          search_target: 'partial_match_for_tags',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`/v1/search/bookmark-ranges/illust?${queryString}`);
  }

  searchNovelBookmarkRanges(word, options) {
    if (!word) {
      return Promise.reject('word required');
    }
    const queryString = qs.stringify(
      Object.assign(
        {
          word,
          search_target: 'partial_match_for_tags',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`/v1/search/bookmark-ranges/novel?${queryString}`);
  }

  searchUser(word) {
    if (!word) {
      return Promise.reject(new Error('word required'));
    }
    const queryString = qs.stringify(
      Object.assign({
        word,
        filter,
      })
    );
    return this.requestUrl(`${WD_BASE_URL}/searchuser?${queryString}`);
  }

  searchAutoComplete(word) {
    if (!word) {
      return Promise.reject('word required');
    }
    const queryString = qs.stringify(
      Object.assign({
        word,
      })
    );
    return this.requestUrl(`/v1/search/autocomplete?${queryString}`);
  }

  searchAutoCompleteV2(word) {
    if (!word) {
      return Promise.reject('word required');
    }
    const queryString = qs.stringify(
      Object.assign({
        word,
      })
    );
    return this.requestUrl(`/v2/search/autocomplete?${queryString}`);
  }

  userDetail(id, options) {
    if (!id) {
      return Promise.reject(new Error('user_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          user_id: id,
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/userdetail?${queryString}`);
  }

  userIllusts(id, options) {
    if (!id) {
      return Promise.reject(new Error('user_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          user_id: id,
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/userillusts?${queryString}`);
  }

  userNovels(id, options) {
    if (!id) {
      return Promise.reject(new Error('user_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          user_id: id,
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/usernovels?${queryString}`);
  }

  userBookmarksIllust(id, options) {
    if (!id) {
      return Promise.reject(new Error('user_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          user_id: id,
          restrict: 'public',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/userbookmarksillust?${queryString}`);
  }

  userBookmarkIllustTags(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          restrict: 'public',
        },
        options
      )
    );
    return this.requestUrl(`/v1/user/bookmark-tags/illust?${queryString}`);
  }

  illustBookmarkDetail(id, options) {
    if (!id) {
      return Promise.reject(new Error('illust_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          illust_id: id,
        },
        options
      )
    );
    return this.requestUrl(`/v2/illust/bookmark/detail?${queryString}`);
  }

  userBookmarksNovel(id, options) {
    if (!id) {
      return Promise.reject(new Error('user_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          user_id: id,
          restrict: 'public',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/userbookmarksnovel?${queryString}`);
  }

  userBookmarkNovelTags(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          restrict: 'public',
        },
        options
      )
    );
    return this.requestUrl(`/v1/user/bookmark-tags/novel?${queryString}`);
  }

  illustWalkthrough() {      
    // return this.requestUrl(`${WD_BASE_URL}/illustranking/mode/year/ratingfilter/1`);
    let url = `${WD_BASE_URL}/illustranking/mode/year/ratingfilter/1`;
    const f = () => {return axios(url)
      .then(res => {
        console.log(JSON.stringify(res.data).substring(0, 100));
        return res.data;
      })
      .catch(err => {
        console.error(err);
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(f());
          }, 1000);
        });
      });
    };
    return f();
    // return axios(url)
    //   .then(res => {
    //     console.log(JSON.stringify(res.data));
    //     return res.data;
    //   })
    //   .catch(err => {
    //     console.error(err);
    //     return new Promise((resolve, reject) => {
    //       setTimeout(() => {
    //         resolve(axios(url)
    //           .then(res => {
    //             console.log(JSON.stringify(res.data));
    //             return res.data;
    //           })
    //           .catch(err => {
    //             console.error(err);
    //             return {'illusts': [], 'next_url': ''};
    //           })
    //         );
    //       }, 5000);
    //     });
    //   });
  }

  illustComments(id, options) {
    if (!id) {
      return Promise.reject(new Error('illust_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          illust_id: id,
          include_total_comments: true,
        },
        options
      )
    );
    return this.requestUrl(`/v1/illust/comments?${queryString}`);
  }

  illustCommentsV2(id, options) {
    if (!id) {
      return Promise.reject(new Error('illust_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          illust_id: id,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/illustcomments?${queryString}`);
  }

  illustCommentReplies(id) {
    if (!id) {
      return Promise.reject(new Error('comment_id required'));
    }
    const queryString = qs.stringify({ comment_id: id });
    return this.requestUrl(`/v1/illust/comment/replies?${queryString}`);
  }

  illustRelated(id, options) {
    if (!id) {
      return Promise.reject(new Error('illust_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          illust_id: id,
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/illustrelated?${queryString}`);
  }

  illustDetail(id, options) {
    if (!id) {
      return Promise.reject(new Error('illust_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          illust_id: id,
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/illustdetail?${queryString}`);
  }

  illustNew(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          content_type: 'illust',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/illustnew?${queryString}`);
  }

  illustFollow(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          restrict: 'all',
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/illustfollow?${queryString}`);
  }

  illustRecommended(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          include_ranking_illusts: true,
          filter,
        },
        options
      )
    );
    return this.requestUrl(`/v1/illust/recommended?${queryString}`);
  }

  illustRanking(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          mode: 'day',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/illustranking?${queryString}`);
  }

  illustMyPixiv() {
    return this.requestUrl('/v2/illust/mypixiv');
  }

  illustAddComment(id, comment, parentCommentId) {
    if (!id) {
      return Promise.reject(new Error('illust_id required'));
    }
    if (!comment) {
      return Promise.reject(new Error('comment required'));
    }
    const data = qs.stringify({
      illust_id: id,
      comment,
      parent_comment_id: parentCommentId,
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };
    return this.requestUrl(`${WD_BASE_URL}/addcomment/typeid/1`, options);
  }

  novelAddComment(id, comment, parentCommentId) {
    if (!id) {
      return Promise.reject(new Error('novel_id required'));
    }
    if (!comment) {
      return Promise.reject(new Error('comment required'));
    }
    const data = qs.stringify({
      novel_id: id,
      comment,
      parent_comment_id: parentCommentId,
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };
    return this.requestUrl(`${WD_BASE_URL}/addcomment/typeid/2`, options);
  }

  trendingTagsIllust(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/trendingtagsillust?${queryString}`); 
  }

  trendingTagsNovel(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          filter,
        },
        options
      )
    );
    return this.requestUrl(`/v1/trending-tags/novel?${queryString}`);
  }

  bookmarkIllust(id, restrict, tags) {
    if (!id) {
      return Promise.reject(new Error('illust_id required'));
    }
    if (restrict && ['public', 'private'].indexOf(restrict) === -1) {
      return Promise.reject(new Error('invalid restrict value'));
    }
    if (tags && !Array.isArray(tags)) {
      return Promise.reject(new Error('invalid tags value'));
    }
    const data = qs.stringify({
      illust_id: id,
      restrict: restrict || 'public',
      tags: tags && tags.length ? tags : undefined,
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };
    return this.requestUrl(`${WD_BASE_URL}/bookmark/typeid/1`, options);
  }

  unbookmarkIllust(id) {
    if (!id) {
      return Promise.reject(new Error('illust_id required'));
    }
    const data = qs.stringify({
      illust_id: id,
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };
    return this.requestUrl(`${WD_BASE_URL}/unbookmark/typeid/1`, options);
  }

  bookmarkNovel(id, restrict, tags) {
    if (!id) {
      return Promise.reject(new Error('novel_id required'));
    }
    if (restrict && ['public', 'private'].indexOf(restrict) === -1) {
      return Promise.reject(new Error('invalid restrict value'));
    }
    if (tags && !Array.isArray(tags)) {
      return Promise.reject(new Error('invalid tags value'));
    }
    const data = qs.stringify({
      novel_id: id,
      restrict: restrict || 'public',
      tags: tags && tags.length ? tags : undefined,
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };
    return this.requestUrl(`${WD_BASE_URL}/bookmark/typeid/2`, options);
  }

  unbookmarkNovel(id) {
    if (!id) {
      return Promise.reject(new Error('novel_id required'));
    }
    const data = qs.stringify({
      novel_id: id,
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };
    return this.requestUrl(`${WD_BASE_URL}/bookmark/typeid/2`, options);
  }

  followUser(id, restrict) {
    if (!id) {
      return Promise.reject(new Error('user_id required'));
    }
    if (restrict && ['public', 'private'].indexOf(restrict) === -1) {
      return Promise.reject(new Error('invalid restrict value'));
    }
    const data = qs.stringify({
      user_id: id,
      restrict: restrict || 'public',
    });
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };
    return this.requestUrl(`${WD_BASE_URL}/followuser`, options);
  }

  unfollowUser(id) {
    if (!id) {
      return Promise.reject(new Error('user_id required'));
    }
    const data = qs.stringify({
      user_id: id,
      restrict: 'public',
    });
    //
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    };
    return this.requestUrl(`${WD_BASE_URL}/unfollowuser`, options);
  }

  mangaRecommended(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          include_ranking_label: true,
          filter,
        },
        options
      )
    );
    return this.requestUrl(`/v1/manga/recommended?${queryString}`);
  }

  mangaNew(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          content_type: 'manga',
          filter,
        },
        options
      )
    );
    return this.requestUrl(`/v1/illust/new?${queryString}`);
  }

  novelRecommended(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          include_ranking_novels: true,
          filter,
        },
        options
      )
    );
    return this.requestUrl(`/v1/novel/recommended?${queryString}`);
  }

  novelNew(options) {
    const queryString = qs.stringify(options);
    return this.requestUrl(`${WD_BASE_URL}/novelnew?${queryString}`);
  }

  novelComments(id, options) {
    if (!id) {
      return Promise.reject(new Error('novel_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          novel_id: id,
          include_total_comments: true,
        },
        options
      )
    );
    return this.requestUrl(`/v1/novel/comments?${queryString}`);
  }

  novelCommentsV2(id, options) {
    if (!id) {
      return Promise.reject(new Error('novel_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          novel_id: id,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/novelcomments?${queryString}`);
  }

  novelCommentReplies(id) {
    if (!id) {
      return Promise.reject(new Error('comment_id required'));
    }
    const queryString = qs.stringify({ comment_id: id });
    return this.requestUrl(`/v1/novel/comment/replies?${queryString}`);
  }

  novelSeries(id) {
    if (!id) {
      return Promise.reject(new Error('series_id required'));
    }

    const queryString = qs.stringify({ series_id: id });
    return this.requestUrl(`/v1/novel/series?${queryString}`);
  }

  novelDetail(id) {
    if (!id) {
      return Promise.reject(new Error('novel_id required'));
    }

    const queryString = qs.stringify({ novel_id: id });
    return this.requestUrl(`${WD_BASE_URL}/noveldetail?${queryString}`);
  }

  novelText(id) {
    if (!id) {
      return Promise.reject(new Error('novel_id required'));
    }

    const queryString = qs.stringify({ novel_id: id });
    return this.requestUrl(`${WD_BASE_URL}/noveltext?${queryString}`); 
  }

  novelFollow(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          restrict: 'all',
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/novelfollow?${queryString}`);
  }

  novelMyPixiv() {
    return this.requestUrl('/v1/novel/mypixiv');
  }

  novelRanking(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          mode: 'day',
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/novelranking?${queryString}`);
  }

  novelBookmarkDetail(id, options) {
    if (!id) {
      return Promise.reject(new Error('novel_id required'));
    }

    const queryString = qs.stringify(
      Object.assign(
        {
          novel_id: id,
        },
        options
      )
    );
    return this.requestUrl(`/v2/novel/bookmark/detail?${queryString}`);
  }

  userRecommended(options) {
    const queryString = qs.stringify(
      Object.assign(
        {
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/userrecommended?${queryString}`); 
  }

  userFollowing(id, options) {
    if (!id) {
      return Promise.reject('user_id required');
    }
    const queryString = qs.stringify(
      Object.assign(
        {
          user_id: id,
          restrict: 'public',
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/userfollowing?${queryString}`);
  }

  userFollowDetail(id) {
    if (!id) {
      return Promise.reject('user_id required');
    }
    const queryString = qs.stringify({ user_id: id });
    return this.requestUrl(`/v1/user/follow/detail?${queryString}`);
  }

  userFollower(id, options) {
    if (!id) {
      return Promise.reject('user_id required');
    }
    const queryString = qs.stringify(
      Object.assign(
        {
          user_id: id,
          filter,
        },
        options
      )
    );
    return this.requestUrl(`${WD_BASE_URL}/usermypixiv?${queryString}`);
  }

  userMyPixiv(id) {
    if (!id) {
      return Promise.reject('user_id required');
    }
    const queryString = qs.stringify({ user_id: id });
    return this.requestUrl(`${WD_BASE_URL}/usermypixiv?${queryString}`);
  }

  ugoiraMetaData(id) {
    if (!id) {
      return Promise.reject('illust_id required');
    }
    const queryString = qs.stringify({ illust_id: id });
    return this.requestUrl(`/v1/ugoira/metadata?${queryString}`);
  }

  setLanguage(lang) {
    this.headers['Accept-Language'] = lang;
  }

  requestUrl(url, options) {
    if (!url) {
      return Promise.reject('Url cannot be empty');
    }
    options = options || {};
    options.headers = Object.assign(
      this.getDefaultHeaders(),
      options.headers || {}
    );
    // if (this.auth && this.auth.access_token) {
    //   options.headers.Cookie = `PHPSESSID=${this.auth.access_token};`;
    // }
    return callApi(url, options)
      .then(json => json)
      .catch(err => {
        options.headers.Cookie = `PHPSESSID=${this.auth.access_token};`;
        return callApi(url, options).then(json => json).catch(err => {
          throw err;
        });
        throw err;
      });
  }
}

module.exports = WildDreamApi;