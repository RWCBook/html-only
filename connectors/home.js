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
  var doc, coll, root, data, related, content;

  root = '//'+req.headers.host;
  coll = [];
  data = [];
  related = {};
  content = "";
  
  // top-level links
  coll = wstl.append({name:"homeLink",href:"/home/",
    rel:["collection","/rels/home"],root:root}, coll);
  coll = wstl.append({name:"taskLink",href:"/task/",
    rel:["collection","/rels/task"],root:root},coll); 
  coll = wstl.append({name:"userLink",href:"/user/",
    rel:["collection","rels/user"],root:root},coll);
  
  content =  '<div class="ui segment">';
  content += '<h3>Welcome to TPS at BigCo!</h3>';
  content += '<p><b>Select one of the following actions:</b></p>';
  content += '<ul>';
  content += '<li><a href="/task/" rel="collection /rels/task">Manage Tasks<a/></li>';
  content += '<li><a href="/user/" rel="collection /rels/user">Manage Users<a/></li>';
  content += '</ul>';
  content += '</div>';
  
  // compose graph 
  doc = {};
  doc.title = "TPS - Task Processing System";
  doc.data =  data;
  doc.actions = coll;
  doc.content = content;
  doc.related = related;

  // send the graph
  respond(req, res, {
    code : 200,
    doc : {
      home : doc
    }
  });
  
}

// EOF

