/*******************************************************
 * TPS - Task Processing Service
 * task connector (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// handles HTTP resource operations 
var qs = require('querystring');
var wstl = require('./../wstl.js');
var utils = require('./utils.js');

var components = {}
components.task = require('./../components/task-component.js');
components.user = require('./../components/user-component.js');

module.exports = main;

// http-level actions for tasks
function main(req, res, parts, respond) {
  var flag;

  flag = false;
  switch (req.method) {
    case 'GET':
      if(flag===false && parts[1]==="assign" && parts[2]) {
        flag=true;
        sendAssignPage(req, res, respond, parts[2]);
      }
      if(flag===false && parts[1]==="completed" && parts[2]) {
        flag=true;
        sendCompletedPage(req, res, respond, parts[2]);
      }
      if(flag===false && parts[1] && parts[1].indexOf('?')===-1) {
        flag = true;
        sendItemPage(req, res, respond, parts[1]);
      }
      if(flag===false) {
        sendListPage(req, res, respond);
      }
    break;
    case 'POST':
      if(parts[1] && parts[1].indexOf('?')===-1) {
        switch(parts[1].toLowerCase()) {
          case "update":
            updateTask(req, res, respond, parts[2]); 
            break;
          case "remove":
            removeTask(req, res, respond, parts[2]);
            break;
          case "completed":
            markCompleted(req, res, respond, parts[2]);
            break;  
          case "assign":
            assignUser(req, res, respond, parts[2]);
            break;
          default:
            respond(req, res, 
              utils.errorResponse(req, res, 'Method Not Allowed', 405)
            );          
        }
      }
      else {
        addTask(req, res, respond);
      }
    break;
    case 'PUT':
      if(parts[1] && parts[1].indexOf('?')===-1) {
        updateTakskItem(req, res, respond, parts[1]);
      }
      break;
    case 'DELETE':
      if(parts[1] && parts[1].indexOf('?')===-1) {
        removeTask(req, res, respond, parts[1]);
      }
      break;
  default:
    respond(req, res, utils.errorResponse(req, res, 'Method Not Allowed', 405));
    break;
  }
}

function sendItemPage(req, res, respond, id) {
  var item, doc, coll, root;
  
  root = '//'+req.headers.host;
  coll = [];
  data = [];
  
  // load data item
  item = components.task('read',id);
  if(item.length===0) {
    respond(req, res, utils.errorResponse(req, res, "File Not Found", 404));
  }
  else {
    data = item;

    // top-level links
    tran = wstl.append({name:"homeLink",href:"/home/",
      rel:["collection","/rels/home"],root:root}, coll);
    tran = wstl.append({name:"taskLink",href:"/task/",
      rel:["collection","/rels/task"],root:root},coll); 
    tran = wstl.append({name:"userLink",href:"/user/",
      rel:["collection","rels/user"],root:root},coll);
    tran = wstl.append({name:"noteLink",href:"/note/",
      rel:["collection","/rels/note"],root:root},coll);
    
    // item links
    wstl.append({name:"taskLinkItem",href:"/task/{key}",
      rel:["item","/rels/item"],root:root},coll);
    wstl.append({name:"taskAssignLink",href:"/task/assign/{key}",
      rel:["edit-form","/rels/taskAssignUser"],root:root},coll);
    wstl.append({name:"taskCompletedLink",href:"/task/completed/{key}",
      rel:["edit-form","/rels/taskMarkCompleted"],root:root},coll);
    wstl.append({name:"taskNotesLink",href:"/note/?assignedTask={key}",
      rel:["collection","/rels/notesByTask"],root:root},coll);
    
    // item forms
    tran = wstl.append({name:"taskFormEdit",href:"/task/{key}",
      rel:["edit-form","/rels/edit"],root:root},coll);
    tran = wstl.append({name:"taskFormEditPost",href:"/task/update/{key}",
      rel:["edit-form","/rels/edit"],root:root},coll);
    tran = wstl.append({name:"taskFormRemovePost",href:"/task/remove/{key}",
      rel:["edit-form","/rels/remove"],root:root},coll);

    // compose and send graph 
    doc = {};
    doc.title = "TPS - Tasks";
    doc.actions = coll;
    doc.data =  data;
    respond(req, res, {code:200, doc:{task:doc}});        
  }
}

function sendAssignPage(req, res, respond, id) {
  var item, doc, coll, root, related;
  
  root = '//'+req.headers.host;
  coll = [];
  data = [];
  related = {};
  
  // load any related data
  related.userlist = components.user('list');
  
  // load data item
  item = components.task('read',id);
  if(item.length===0) {
    respond(req, res, utils.errorResponse(req, res, "File Not Found", 404));
  }
  else {
    data = item;

    // top-level links
    tran = wstl.append({name:"homeLink",href:"/home/",
      rel:["collection","/rels/home"],root:root}, coll);
    tran = wstl.append({name:"taskLink",href:"/task/",
      rel:["collection","/rels/task"],root:root},coll); 
    tran = wstl.append({name:"userLink",href:"/user/",
      rel:["collection","rels/user"],root:root},coll);
    tran = wstl.append({name:"noteLink",href:"/note/",
      rel:["collection","/rels/note"],root:root},coll);
    
    // item links
    wstl.append({name:"taskLinkItem",href:"/task/{key}",
      rel:["item","/rels/item"],root:root},coll);
    wstl.append({name:"taskAssignLink",href:"/task/assign/{key}",
      rel:["edit-form","/rels/taskAssignUser"],root:root},coll);
    wstl.append({name:"taskCompletedLink",href:"/task/completed/{key}",
      rel:["edit-form","/rels/taskMarkCompleted"],root:root},coll);
    wstl.append({name:"taskNotesLink",href:"/note/?assignedTask={key}",
      rel:["collection","/rels/notesByTask"],root:root},coll);
    
    // item forms
    tran = wstl.append({name:"taskAssignForm",href:"/task/assign/{key}",
      rel:["edit-form","/rels/taskAssignUser"],root:root},coll);

    // compose & send graph 
    doc = {};
    doc.title = "TPS - Tasks";
    doc.actions = coll;
    doc.data =  data;
    doc.related = related;
    respond(req, res, {code:200, doc:{task:doc}});
  }
}

function sendCompletedPage(req, res, respond, id) {
  var item, doc, coll, root;
  
  root = '//'+req.headers.host;
  coll = [];
  data = [];
  
  // load data item
  item = components.task('read',id);
  if(item.length===0) {
    respond(req, res, utils.errorResponse(req, res, "File Not Found", 404));
  }
  else {
    data = item;

    // top-level links
    tran = wstl.append({name:"homeLink",href:"/home/",
      rel:["collection","/rels/home"],root:root}, coll);
    tran = wstl.append({name:"taskLink",href:"/task/",
      rel:["collection","/rels/task"],root:root},coll); 
    tran = wstl.append({name:"userLink",href:"/user/",
      rel:["collection","rels/user"],root:root},coll);
    tran = wstl.append({name:"noteLink",href:"/note/",
      rel:["collection","/rels/note"],root:root},coll);
    
    // item links
    wstl.append({name:"taskLinkItem",href:"/task/{key}",
      rel:["item","/rels/item"],root:root},coll);
    wstl.append({name:"taskAssignLink",href:"/task/assign/{key}",
      rel:["edit-form","/rels/taskAssignUser"],root:root},coll);
    wstl.append({name:"taskCompletedLink",href:"/task/completed/{key}",
      rel:["edit-form","/rels/taskMarkCompleted"],root:root},coll);
    wstl.append({name:"taskNotesLink",href:"/note/?assignedTask={key}",
      rel:["collection","/rels/notesByTask"],root:root},coll);
    
    // item forms
    tran = wstl.append({name:"taskCompletedForm",href:"/task/completed/{key}",
      rel:["edit-form","/rels/taskMarkCompleted"],root:root},coll);
        
    // compose & send graph 
    doc = {};
    doc.title = "TPS - Tasks";
    doc.actions = coll;
    doc.data =  data;
    respond(req, res, {code:200, doc:{task:doc}});
  }
}

function sendListPage(req, res, respond) {
  var doc, coll, root, q, qlist, code;

  root = '//'+req.headers.host;
  coll = [];
  data = [];
  
  // parse any filter on the URL line
  // or just pull the full set
  q = req.url.split('?');
  if(q[1]!==undefined) {
    qlist = qs.parse(q[1]);
    data = components.task('filter', qlist);
  }
  else {
    data = components.task('list');
  }
      
  // top-level links
  wstl.append({name:"homeLink",href:"/home/",
    rel:["collection","/rels/home"],root:root}, coll);
  wstl.append({name:"taskLink",href:"/task/",
    rel:["collection","/rels/task"],root:root},coll); 
  wstl.append({name:"userLink",href:"/user/",
    rel:["collection","rels/user"],root:root},coll);
  wstl.append({name:"noteLink",href:"/note/",
    rel:["collection","/rels/note"],root:root},coll);

  // item actions
  wstl.append({name:"taskLinkItem",href:"/task/{key}",
    rel:["item","/rels/item"],root:root},coll);
  wstl.append({name:"taskAssignLink",href:"/task/assign/{key}",
    rel:["edit-form","/rels/taskAssignUser"],root:root},coll);
  wstl.append({name:"taskCompletedLink",href:"/task/completed/{key}",
    rel:["edit-form","/rels/taskMarkCompleted"],root:root},coll);
  wstl.append({name:"taskNotesLink",href:"/note/?assignedTask={key}",
    rel:["collection","/rels/notesByTask"],root:root},coll);
  
  // add template
  wstl.append({name:"taskFormAdd",href:"/task/",
    rel:["create-form","/rels/taskAdd"],root:root},coll);

  // list queries
  wstl.append({name:"taskFormListCompleted",href:"/task/",
    rel:["search","/rels/taskCompleted"],root:root},coll);
  wstl.append({name:"taskFormListActive",href:"/task/",
    rel:["search","/rels/taskActive"],root:root},coll);
  wstl.append({name:"taskFormListByTitle",href:"/task/",
    rel:["search","/rels/taskByTitle"],root:root},coll);
  wstl.append({name:"taskFormListByUser",href:"/task/",
    rel:["search","/rels/taskByUser"],root:root},coll);

  // compose and send graph 
  doc = {};
  doc.title = "TPS - Tasks";
  doc.actions = coll;
  doc.data =  data;
  respond(req, res, {code:200, doc:{task:doc}});
  
}

function addTask(req, res, respond) {
  var body, doc, msg;

  body = '';
  
  // collect body
  req.on('data', function(chunk) {
    body += chunk;
  });

  // process body
  req.on('end', function() {
    try {
      msg = utils.parseBody(body, req.headers["content-type"]);
      doc = components.task('add', msg);
      if(doc && doc.type==='error') {
        doc = utils.errorResponse(req, res, doc.message, doc.code);
      }
    } 
    catch (ex) {
      doc = utils.errorResponse(req, res, 'Server Error', 500);
    }

    if (!doc) {
      respond(req, res, {code:302, doc:"", 
        headers:{'location':'//'+req.headers.host+"/task/"}
      });
    } 
    else {
      respond(req, res, doc);
    }
  });
}

function updateTask(req, res, respond, id) {
  var body, doc, msg, ctype, item, check;

  ctype = '';
  body = '';
  
  // collect body
  req.on('data', function(chunk) {
    body += chunk;
  });

  // process body
  req.on('end', function() {
    try {
      msg = utils.parseBody(body, req.headers["content-type"]);
      doc = components.task('update', id, msg);
      if(doc && doc.type==='error') {
        doc = utils.errorResponse(req, res, doc.message, doc.code);
      }
    } 
    catch (ex) {
      doc = utils.errorResponse(req, res, 'Server Error', 500);
    }

    if (!doc) {
      respond(req, res, 
        {code:302, doc:"", headers:{'location':'//'+req.headers.host+"/task/"}}
      );
    } 
    else {
      respond(req, res, doc);
    }
  })
}

function removeTask(req, res, respond, id) {
  var doc;
  
  // execute
  try {
    doc = components.task('remove', id);
    if(doc && doc.type==='error') {
      doc = utils.errorResponse(req, res, doc.message, doc.code);    
    }
  } 
  catch (ex) {
    doc = utils.errorResponse(req, res, 'Server Error', 500);
  }
  
  if (!doc) {
    respond(req, res, 
      {code:302, doc:"", headers:{'location':'//'+req.headers.host+"/task/"}}
    );
  } 
  else {
    respond(req, res, doc);
  }
}

function markCompleted(req, res, respond, id) {
  var doc, check;

  // execute
  try {
    doc = components.task('mark-completed', id);
    if(doc && doc.type==='error') {
      doc = utils.errorResponse(req, res, doc.message, doc.code);    
    }
  }
  catch (ex) {
    doc = utils.errorResponse(req, res, 'Server Error', 500);
  }

  if (!doc) {
    respond(req, res, 
      {code:302, doc:"", headers:{'location':'//'+req.headers.host+"/task/"}}
    );
  } 
  else {
    respond(req, res, doc);
  }
}

function assignUser(req, res, respond, id) {
  var body, doc, msg, ctype, item, check;

  ctype = '';
  body = '';
  
  // collect body
  req.on('data', function(chunk) {
    body += chunk;
  });

  // process body
  req.on('end', function() {
    try {
      msg = utils.parseBody(body, req.headers["content-type"]);
      doc = components.task('assign-user', id, msg);
      if(doc && doc.type==='error') {
        doc = utils.errorResponse(req, res, doc.message, doc.code);
      }
    } 
    catch (ex) {
      doc = utils.errorResponse(req, res, 'Server Error', 500);
    }

    if (!doc) {
      respond(req, res, 
        {code:302, doc:"", headers:{'location':'//'+req.headers.host+"/task/"}}
      );
    } 
    else {
      respond(req, res, doc);
    }
  })
}

// EOF

