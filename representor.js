/*******************************************************
 * TPS - Task Processing Service
 * representation router (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// handles internal representation routing (based on conneg)

// load representors
var html = require('./representors/html.js');
var wstljson = require('./representors/wstljson.js');

var defaultFormat = "text/html";

module.exports = main;

function main(object, mimeType, root) {
  var doc;

  // clueless? assume HTML
  if (!mimeType) {
    mimeType = defaultFormat;
  }

  // dispatch to requested representor
  switch (mimeType.toLowerCase()) {
    case "application/vnd.wstl+json":
      doc = wstljson(object, root);
      break;
    case "text/html":
      doc = html(object, root);
      break;
    default:
      doc = html(object, root);
      break;
  }

  return doc;
}

// EOF

