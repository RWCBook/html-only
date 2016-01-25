/*******************************************************
 * TPS - Task Processing Service
 * task middleware component (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

var component = {};
component.user = require('./user-component.js');

var storage = require('./../storage.js');
var utils = require('./../connectors/utils.js');

module.exports = main;

// app-level actions for tasks
function main(action, args1, args2, args3) {
  var name, rtn, props;
    
  // valid fields for this record   
  props = ["id","title","completeFlag","assignedUser","dateCreated","dateUpdated"];
  elm = 'task';

  switch (action) {
    case 'exists':
      rtn = (storage(elm, 'item', args1)===null?false:true);
      break;
    case 'props' :
      rtn = utils.setProps(args1,props);
      break;  
    case 'list':
      rtn = utils.cleanList(storage(elm, 'list'));
      break;
    case 'read':
      rtn = utils.cleanList(storage(elm, 'item', args1));
      break;
    case 'filter':
      rtn = utils.cleanList(storage(elm, 'filter', args1));
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
      rtn = assignUser(elm, args1, args2, props);
      break;
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
    storage(elm, 'add', utils.setProps(item, props));
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
      storage(elm, 'update', id, utils.setProps(item, props));
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
    storage(elm, 'update', id, utils.setProps(item, props));
  }

}

function assignUser(elm, id, task, props) {
  var rtn, check, item, error;
  
  error = "";
  check = storage(elm, 'item', id);
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {

    if(!task.assignedUser || task.assignedUser.length===0) {
      error += "Missing Assigned user, ";
    }
    if(component.user('exists', task.assignedUser)===false) {
      error += "Assigned user not found. ";      
    }
    
    if(error!=="") {
      rtn = utils.exception(error);
    }
    else {    
      item = check;
      item.id = id;      
      item.assignedUser = task.assignedUser;
      storage(elm, 'update', id, utils.setProps(item, props));
    }
  }
  
  return rtn;
}

// EOF

