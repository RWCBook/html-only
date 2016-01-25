/*******************************************************
 * TPS - Task Processing Service
 * service implementation (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// handles routing, conneg, response-representation

// base modules
var http = require('http');
var querystring = require('querystring');

/// internal modules
var representation = require('./representor.js');

// connector modules
var home = require('./connectors/home.js');
var task = require('./connectors/task.js');
var user = require('./connectors/user.js');
var wstl = require('./connectors/wstl.js');
var utils = require('./connectors/utils.js');

// shared vars
var root         = '';
var port         = (process.env.PORT || 8181);

var htmlType     = "text/html";
var wstlType     = "application/vnd.wstl+json";

var csType       = '';
var csAccept     = '';

// routing rules
var reRoot = new RegExp('^\/$','i');
var reFile = new RegExp('^\/files\/.*','i');
var reHome = new RegExp('^\/home\/.*','i');
var reTask = new RegExp('^\/task\/.*','i');
var reUser = new RegExp('^\/user\/.*','i');
var reWstl = new RegExp('^\/wstl\/.*','i');

// request handler
function handler(req, res) {
  var segments, i, x, parts, rtn, flg, doc, url;

  // set local vars
  root = '//'+req.headers.host;
  csType = htmlType;
  flg = false;
  file = false;
  doc = null;

  // rudimentary accept-header handling
  csAccept = req.headers["accept"];
  if(!csAccept || csAccept.indexOf(htmlType)!==-1) {
    csType = htmlType;
  }
  else {
    csType = csAccept.split(',')[0];
  }
  
  // parse incoming request URL
  parts = [];
  segments = req.url.split('/');
  for(i=0, x=segments.length; i<x; i++) {
    if(segments[i]!=='') {
      parts.push(segments[i]);
    }
  }
  
  // handle options call
  if(req.method==="OPTIONS") {
    sendResponse(req, res, "", 200);
    return;
  }

  // handle root call (route to /home/)
  try {
    if(flg===false && reRoot.test(req.url)) {
      handleResponse(req, res, 
        {code:302, doc:"", headers:{'location':'//'+req.headers.host+"/home/"}}
      );
    }
  }
  catch (ex) {}
  
  // file handler
  try {
    if(flg===false && reFile.test(req.url)) {
      flg = true;
      utils.file(req, res, parts, handleResponse);
    }
  }
  catch(ex) {}
  
  // home handler
  try {
    if(flg===false && reHome.test(req.url)) {
      flg = true;
      doc = home(req, res, parts, handleResponse);
    }
  }
  catch(ex) {}

  // task handler
  try {
    if(flg===false && reTask.test(req.url)) {
      flg = true;
      doc = task(req, res, parts, handleResponse);
    }
  }
  catch(ex) {}
 
  // user handler
  try {
    if(flg===false && reUser.test(req.url)) {
      flg = true;
      doc = user(req, res, parts, handleResponse);
    }
  }
  catch(ex) {}

  // wstl (design-time) handler
  try {
    if(flg===false && reWstl.test(req.url)) {
      flg = true;
      csType = wstlType;
      doc = wstl(req, res, parts, handleResponse);
    }
  }
  catch(ex) {}

  // final error
  if(flg===false) {
    handleResponse(req, res, utils.errorResponse(req, res, 'Not Found', 404));
  }
}

// handle response work
function handleResponse(req, res, doc) {
  var rtn;
  
  if(doc!==null) {
    if(doc.file===true) {
      rtn = doc.doc;
    }
    else {
      rtn = representation(doc.doc, csType, root);
    }
    sendResponse(req, res, rtn, doc.code, doc.headers);
  }
  else {
    sendResponse(req, res, 'Server Response Error', 500);
  }
}
function sendResponse(req, res, body, code, headers) {
  var hdrs;
  
  if(headers && headers!==null) {
    hdrs = headers;
  }
  else {
    hdrs = {}
  }
  if(!hdrs['content-type']) {
    hdrs['content-type'] = csType;
  }
  
  // always add CORS headers to support external clients
  hdrs["Access-Control-Allow-Origin"] = "*";
  hdrs["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
  hdrs["Access-Control-Allow-Credentials"] = true;
  hdrs["Access-Control-Max-Age"] = '86400'; // 24 hours
  hdrs["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";

  res.writeHead(code, hdrs),
  res.end(body);
}

// wait for request
http.createServer(handler).listen(port);
console.log('listening on port '+port);

// EOF

