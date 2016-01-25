/*******************************************************
 * TPS - Task Processing Service
 * utilities (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

var fs = require('fs');
var qs = require('querystring');
var folder = process.cwd() + '/files/';

// load up action map
var httpActions = {};
httpActions.append = "POST";
httpActions.partial = "PATCH";
httpActions.read = "GET";
httpActions.remove = "DELETE";
httpActions.replace = "PUT";

// handy translator for WeSTL-style actions
exports.actionMethod = function(action, protocol) {
  var p = protocol||"http";
  var rtn = "GET";

  switch(p) {
    case "http":
      rtn = httpActions[action];
      break;
    default:
      rtn = "GET";
  }
  return rtn;
}

// craft an external error response (anything, really)
exports.errorResponse = function(req, res, msg, code, description) {
  var doc;

  doc = {};
  doc.error = {};
  doc.error.code = code;
  doc.error.message = msg;
  doc.error.url = 'http://' + req.headers.host + req.url;
  if (description) {
    doc.error.description = description;
  }

  return {
    code: code,
    doc: doc
  };
}

// simple file responder (*not* streaming)
exports.file = function(req, res, parts, respond) {
  var body, doc, type;

  try {
    body = fs.readFileSync(folder + parts[1]);
    
    type = 'text/plain';
    if (parts[1].indexOf('.js') !== -1) {
      type = 'application/javascript';
    }
    if (parts[1].indexOf('.css') !== -1) {
      type = 'text/css';
    }
    if (parts[1].indexOf('.html') !== -1) {
      type = 'text/html';
    }
    respond(req, res, {
      code: 200,
      doc: body,
      headers: {
        'content-type': type
      },
      file: true
    });
  } catch (ex) {
    respond(req, res, errorResponse(req, res, "File Not Found", 404));
  }
}

// dispatch for parsing incoming HTTP bodies
exports.parseBody = function(body, ctype) {
  var msg;
  
  switch (ctype) {
    case "application/x-www-form-urlencoded":
      msg = qs.parse(body);
      break;
    case "application/vnd.collection+json":
      msg = cjBody(body);
      break;
    default:
      msg = JSON.parse(body);
      break;
  }
  return msg;
}

// process an incoming cj template body
// see: http://amundsen.com/media-types/collection/examples/#ex-write
exports.cjBody = cjBody;
function cjBody(body) {
  var rtn, data, i, x;
  
  rtn = {};
  data = null;
  body = JSON.parse(body);
  
  // if they include template...
  if(body.template && body.template.data) {
    data = body.template.data;
  }

  // if they only pass data array...
  if(data===null && body.data) {
    data = body.data;
  }

  // create nvp dictionary
  if(data!==null) {
    for(i=0,x=data.length;i<x;i++) {
      rtn[data[i].name]=data[i].value;
    }
  }
  
  return rtn;
}

// parse the querystring args
exports.getQArgs = getQArgs;
function getQArgs(req) {
  var q, qlist;
  
  qlist = null;
  q = req.url.split('?');
  if (q[1] !== undefined) {
    qlist = qs.parse(q[1]);
  }
  return qlist;
}

// craft an internal exception object
exports.exception = function(name, message, code) {
  var rtn = {};

  rtn.type = "error";
  rtn.name = (name||"Error");
  rtn.message = (message||rtn.name);
  rtn.code = (code||400);

  return rtn;
}

// EOF

