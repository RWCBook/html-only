/*******************************************************
 * TPS - Task Processing Service
 * note middleware component (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

var component = {}
component.task = require('./task-component.js');
var storage = require('./../storage.js');
var utils = require('./../connectors/utils.js');

module.exports = main;

// app-level actions for tasks
function main(action, args1, args2, args3) {
  var name, rtn, props;
    
  props = ["id","title","text","assignedTask","dateCreated","dateUpdated"];
  elm = 'note';

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
      rtn = addNote(elm, args1, props);
      break;
    case 'update':
      rtn = updateNote(elm, args1, args2, props);
      break;
    case 'remove':
      rtn = removeNote(elm, args1, args2, props);
      break;
    case 'assign-task':
      rtn = assignTask(elm, args1, args2, props);
      break;
    default:
      rtn = null;
      break;
  }
  return rtn;
}

function addNote(elm, note, props) {
  var rtn, item, error;
  
  error = "";
  
  item = {}
  item.title = (note.title||"");
  item.text = (note.text||"");
  item.assignedTask = (note.assignedTask||"");
  
  if(item.title === "") {
    error += "Missing Title ";
  }
  if(item.assignedTask==="") {
    error += "Missing Assigned Task ";
  } 
  if(component.task('exists', item.assignedTask)===false) {
    error += "Task ID not found. ";
  }  
  
  if(error.length!==0) {
    rtn = utils.exception(error);
  }
  else {
    storage(elm, 'add', setProps(item,props));
  }
  
  return rtn;
}

function updateNote(elm, id, note, props) {
  var rtn, check, item, error;
  
  error = "";
  check = storage(elm, 'item', id);
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    item = check;
    item.id = id;      
    item.title = (note.title===undefined?check.title:note.title);
    item.text = (note.text===undefined?check.text:note.text);
    item.assignedTask = check.assignedTask

    if(item.title === "") {
      error += "Missing Title ";
    }
    
    if(error!=="") {
      rtn = utils.exception(error);
    } 
    else {
      storage(elm, 'update', id, setProps(item, props));
    }
  }
  
  return rtn;
}

function removeNote(elm, id) {
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

function assignTask(elm, id, note, props) {
  var rtn, check, item, error;
  
  error = "";
  check = storage(elm, 'item', id);
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    if(note.assignedTask===undefined||note.assignedTask.length===0) {
      error += "Missing Asssigned Task ";
    }
    if(component.task('exists',note.assignedTask)===false) {
      error += "Task ID not found ";
    }
    
    if(error==="") {
      item = check;
      item.id = id;      
      item.title = check.title;
      item.text = check.text;
      item.assignedTask = note.assignedTask;
    }

    if(error!=="") {
      rtn = utils.exception(error);
    } 
    else {
      storage(elm, 'update', id, setProps(item, props));
    }
  }
  
  return rtn;
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

