var util = require('util');
var path = require('path');

var request = require('superagent');

var SUPPORTED_OPS = ['tag','embed']

var IM_QUALITY = 95
var API_VERSION = 'v1'

function ClarifaiApi(options) {
  var baseUrl = options.baseUrl || 'https://api.clarifai.com';
  this._baseUrl = baseUrl;
  this._clientId = options.appId || process.env.CLARIFAI_APP_ID;
  this._clientSecret = options.appSecret || process.env.CLARIFAI_APP_SECRET;
  this._maxAttempts = options.maxAttempts || 3;
  this._model = options.model || 'default';

  // Urls
  var urls = {};
  var frags = ['tag', 'embed', 'multiop', 'token', 'info'];
  frags.each(frags, function(frag) {
    urls[frag] = path.join(baseUrl, util.format('%s/%s/', API_VERSION, frag);
  });
  this._urls = urls;

  // Client state
  this._accessToken = null;
  this._apiInfo = null;
}

ClarifaiApi.prototype.getAccessToken = function(renew, cb) {
  var self = this;

  if (!this._accessToken || renew) {
    // Request a new access token if requested or if one does not exist yet.
    request.post(this._urls.token).type('form').send({
      grant_type: 'client_credentials',
      client_id: this._clientId,
      client_secret: this._clientSecret
    }).end(function(err, res) {
      if (err) {return cb(err);}
      self._accessToken = res.body.access_token;
      cb(null, self._accessToken);
    });
  } else {
    // Call back with the current access token.
    cb(null, this._accessToken);
  }
};

ClarifaiApi.prototype.getInfo = function(cb) {
  var self = this;
  this._request(req.get(this._urls.info), function(err, res) {
    if (err) {return cb(err);}
    self._apiInfo = res.body.results;
    cb(null, self._apiInfo);
  });
};

// Image file methods

ClarifaiApi.prototype.tagImages = function(images, model, cb) {
  this._multiImageOp(files, ['tag'], model, cb);
};

ClarifaiApi.prototype.embedImages = function(images, model, cb) {
  this._multiImageOp(images, ['embed'], model, cb)
};

ClarifaiApi.prototype.tagAndEmbedImages = function(images, model, cb) {
  this._multiImageOp(files, ['tag', 'embed'], model, cb);
};

// Image url methods

ClarifaiApi.prototype.tagImageUrls = function(urls, model, cb) {
  this._multiImageUrlOp(urls, ['tag'], model, cb);
};

ClarifaiApi.prototype.embedImageUrls = function(urls, model, cb) {
  this._multiImageUrlOp(urls, ['embed'], model, cb)
};

ClarifaiApi.prototype.tagAndEmbedImageUrls = function(urls, model, cb) {
  this._multiImageUrlOp(urls, ['tag', 'embed'], model, cb);
};

// Image base64 methods

ClarifaiApi.prototype.tagImageBase64 = function(encodedImage, model, cb) {
  var data = {
    encoded_image: encodedImage,
    op: 'tag'
  };
  checkOp()
  this._multiImageUrlOp(urls, ['tag', 'embed'], model, cb);
};

// Image operations

ClarifaiApi.prototype._multiImageOp = function(images, ops, model, cb) {
  checkOps(ops);
  
};

// Utils

ClarifaiApi.prototype._request = function(req, cb) {
  var self = this;

  // Do not force the access token to be renewed.
  this.getAccessToken(false, function(err, accessToken) {
    if (err) {return cb(err);}

    req
      // Authorize the request.
      .set('Authorization', util.format('Bearer %s', accessToken));
      .end(function(err, res) {
        if (err) {cb(err);}

        // If the token expired, renew the token and retry.
        if (res.body.status_code === 'TOKEN_EXPIRED') {
          self.getAccessToken(true, function(err) {

          });
        } else {
          cb(null, res.body);
        }
      });
  });
}

ClarifaiApi.prototype._getImageData = function(images) {

};

ClarifaiApi.prototype._getOpUrl = function(ops) {
  return this._urls[ops];
};

ClarifaiApi.prototype._getUrls = function() {
  return {
    'tag': this._baseUrl + '/' + API_VERSION + '/tag/',
    'info': this._baseUrl + '/' + API_VERSION + '/info/',
    token: this._baseUrl + '/' + API_VERSION + '/token/'
  };
};

ClarifaiApi.prototype.tagImageBase64 = function(renew, cb) {

};

module.exports = ClarifaiApi;
