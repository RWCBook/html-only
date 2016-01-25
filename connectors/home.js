/*******************************************************
 * TPS - Task Processing Service
 * home connector (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// handles HTTP resource operations 
var wstl = require('./../wstl.js');

module.exports = main;

function main(req, res, parts, respond) {

  switch (req.method) {
  case 'GET':
    sendPage(req, res, respond);
    break;
  default:
    respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
    break;
  }
}

function sendPage(req, res, respond) {
  var doc, coll, root;

  root = '//'+req.headers.host;
  coll = [];
  data = [];
  content = {};
  
  // top-level links
  coll = wstl.append({name:"homeLink",href:"/home/",rel:["collection","/rels/home"],root:root}, coll);
  coll = wstl.append({name:"taskLink",href:"/task/",rel:["collection","/rels/task"],root:root},coll); 
  coll = wstl.append({name:"userLink",href:"/user/",rel:["collection","rels/user"],root:root},coll);
  coll = wstl.append({name:"noteLink",href:"/note/",rel:["collection","/rels/note"],root:root},coll);
  
  content = '<h4>Welcome to TPS!</h4>';
  content += '<p>This is a wonderful system built by wonderful people for wonderful customers';
  content += ' and I hope you find it wonderful to use.</p>';
  
  // compose graph 
  doc = {};
  doc.title = "TPS - Task Processing System";
  doc.actions = coll;
  doc.content = content;
  doc.data =  data;

  // send the graph
  respond(req, res, {
    code : 200,
    doc : {
      home : doc
    }
  });
  
}

// EOF

