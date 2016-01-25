/*******************************************************
 * TPS - Task Processing Service
 * business component (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// matches storage calls w/ middleware domain-specific verbs

// access stored data
var storage = require('./storage.js');
var utils = require('./connectors/utils.js');

exports.task = function(action, args1, args2, args3) {
  var name, rtn, props;
    
  props = ["id","title","tags","completeFlag","assignedUser","dateCreated","dateUpdated"];
  elm = 'task';

  switch (action) {
    case 'exists':
      rtn = (storage(elm, 'item', args1)===null?false:true);
      break;
    case 'props' :
      rtn = setProps(args1,props);
      break;  
    case 'list':
      rtn = list(storage(elm, 'list'));
      break;
    case 'read':
      rtn = list(storage(elm, 'item', args1));
      break;
    case 'filter':
      rtn = list(storage(elm, 'filter', args1));
      break;
    case 'add':
      rtn = addTask(elm, args1, props);
      break;
    case 'update':
      rtn = updateTask(elm, args1, args2, props);
      break;
    case 'remove':
      rtn = removeTask(elm, args1);
      break;
    case 'mark-completed':
      rtn = markCompleted(elm, args1, props);
      break;  
    case 'assign-user':
      // assign user to this task
    default:
      rtn = null;
  }
  return rtn;
}

function addTask(elm, task, props) {
  var rtn, item;
  
  item = {}
  item.tags = (task.tags||"");
  item.title = (task.title||"");
  item.assignedUser = (task.assignedUser||"");
  item.completeFlag = (task.completeFlag||"false");
  if(item.completeFlag!=="false" && item.completeFlag!=="true") {
    item.completeFlag="false";
  }
  if(item.title === "") {
    rtn = utils.exception("Missing Title");
  } 
  else {
    storage(elm, 'add', setProps(item,props));
  }
  
  return rtn;
}

function updateTask(elm, id, task, props) {
  var rtn, check, item;
  
  check = storage(elm, 'item', id);
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    item = check;
    item.id = id;      
    item.tags = (task.tags===undefined?check.tags:task.tags);
    item.title = (task.title===undefined?check.title:task.title);
    item.assignedUser = (task.assignedUser===undefined?check.assignedUser:task.assignedUser);
    item.completeFlag = (task.completeFlag===undefined?check.completeFlag:task.completeFlag);
    if (item.title === "") {
      rtn = utils.exception("Missing Title");
    } 
    else {
      storage(elm, 'update', id, setProps(item, props));
    }
  }
  
  return rtn;
}

function removeTask(elm, id) {
  var rtn, check;
  
  check = storage(elm, 'item', id);
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    storage(elm, 'remove', id);
  }
  
  return rtn;
  
}

function markCompleted(elm, id, props) {
  var rtn, check;
  
  check = storage(elm, 'item', id);
  if(check===null) {
    doc = utils.exception("File Not Found", "no record on file", 404);    
  }
  else {
    item = check;
    item.id = id;
    item.completeFlag = "true";
    storage(elm, 'update', id, setProps(item, props));
  }

}

// only write 'known' properties
function setProps(item, props) {
  var rtn, i, x, p;
    
  rtn = {};  
  for(i=0,x=props.length;i<x;i++) {
    p = props[i];
    rtn[p] = (item[p]||"");
  }
  return rtn;
}

// produce clean array of items
function list(elm) {
  var coll;

  coll = [];
  if(Array.isArray(elm) === true) {
    coll = elm;
  }
  else {
    if(elm!==null) {
      coll.push(elm);
    }
  }

  return coll;
}


// EOF

