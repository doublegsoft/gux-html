/*
** ──────────────────────────────────────────────────
** ─██████████████─██████──██████─████████──████████─
** ─██░░░░░░░░░░██─██░░██──██░░██─██░░░░██──██░░░░██─
** ─██░░██████████─██░░██──██░░██─████░░██──██░░████─
** ─██░░██─────────██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██─────────██░░██──██░░██───████░░░░░░████───
** ─██░░██──██████─██░░██──██░░██─────██░░░░░░██─────
** ─██░░██──██░░██─██░░██──██░░██───████░░░░░░████───
** ─██░░██──██░░██─██░░██──██░░██───██░░░░██░░░░██───
** ─██░░██████░░██─██░░██████░░██─████░░██──██░░████─
** ─██░░░░░░░░░░██─██░░░░░░░░░░██─██░░░░██──██░░░░██─
** ─██████████████─██████████████─████████──████████─
** ──────────────────────────────────────────────────
*/
xhr = {};

/**
 * @private
 */
xhr.url = function (url) {
  if (typeof HOST !== 'undefined' && url.indexOf('http') == -1) {
    url = HOST + url; 
  }
  return url;
};

xhr.params = function(url) {
  if (url.indexOf('?') == -1) return {};
  let ret = {};
  url = url.substring(url.indexOf('?') + 1);
  let strs = url.split('&');
  for (let i = 0; i < strs.length; i++) {
    let pair = strs[i].split('=');
    if (pair.length == 1) return {};
    ret[pair[0].trim()] = decodeURIComponent(pair[1].trim());
  }
  return ret;
};

/**
 * @private
 */
xhr.request = function (opts, method) {
  let url = xhr.url(opts.url);
  let params = xhr.params(url);
  let data = opts.data || opts.params || {};
  let type = opts.type || 'json';
  let success = opts.success;
  let error = opts.error;

  data = {...params, ...data};

  return new Promise((resolve,reject) => {
    let request  = new XMLHttpRequest();
    // request.timeout = 10 * 1000;
    request.onload = function () {
      let resp = request.responseText;
      if (type == 'json')
        try {
          resp = JSON.parse(resp);
        } catch (err) {
          console.log(err)
          reject(err)
          return;
        }
      if (request.readyState == 4 && request.status == "200") {
        resolve(resp)
      } else {
        reject(resp)
      }
    };
    request.onerror = function () {
      reject({error: {code: -500, message: '网络访问错误！'}})
    };
    request.ontimeout = function () {
      reject({error: {code: -501, message: '网络请求超时！'}})
    };
    request.open(method, url, true);
    request.setRequestHeader("Content-Type", "application/json");
    if (opts.headers) {
      for (let key in opts.headers) {
        request.setRequestHeader(key, opts.headers[key]);
      }
    }      
    if (data)
      request.send(JSON.stringify(data));
    else
      request.send(null);
  });
};

xhr.get = async function (opts) {
  let url = opts.url;
  let data = opts.data;
  let success = opts.success;
  let error = opts.error;
  return new Promise((resolve,reject) => {
    let req  = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
      resolve(req.responseText);
    };
    req.send(null);
  });
};

xhr.post = async function (opts) {
  return xhr.request(opts, 'POST');
};

xhr.put = async function (opts) {
  return xhr.request(opts, 'PUT');
};

xhr.patch = async function (opts) {
  return xhr.request(opts, 'PATCH');
};

xhr.delete = async function (opts) {
  return xhr.request(opts, 'DELETE');
};

xhr.connect = async function (opts) {
  return xhr.request(opts, 'CONNECT');
};

xhr.upload = function(opts) {
  let url = opts.url;
  let params = opts.data || opts.params;
  let type = opts.type || 'json';
  let success = opts.success;
  let error = opts.error;

  let formdata = new FormData();
  for (let k in params) {
    formdata.append(k, params[k]);
  }
  formdata.append('file', opts.file);

  let req  = new XMLHttpRequest();
  // req.timeout = 10 * 1000;
  req.onload = function () {
    let resp = req.responseText;
    if (type == 'json')
      try {
        resp = JSON.parse(resp);
      } catch (err) {
        if (error) error(resp);
        return;
      }
    if (req.readyState == 4 && req.status == "200") {
      if (success) success(resp);
    } else {
      if (error) error(resp);
    }
  };
  if (opts.progress) {
    req.onprogress = function(ev) {
      opts.progress(ev.loaded, ev.total);
    };
  }
  req.onerror = function () {
    if (error) error({error: {code: -500, message: '网络访问错误！'}});
  };
  req.ontimeout = function () {
    if (error) error({error: {code: -501, message: '网络请求超时！'}});
  };
  req.open('POST', url, true);
  if (typeof APPTOKEN !== 'undefined') {
    req.setRequestHeader("apptoken", APPTOKEN);
  }
  req.send(formdata);
};

if (typeof module !== 'undefined') {
  module.exports = { xhr };
}