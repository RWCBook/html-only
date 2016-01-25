/*******************************************************
 * TPS - Task Processing Service
 * user middleware component (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

var storage = require('./../storage.js');
var utils = require('./../connectors/utils.js');

module.exports = main
// app-level actions for tasks
function main(action, args1, args2, args3) {
  var name, rtn, props;
    
  props = ["id","nick","password","name","dateCreated","dateUpdated"];
  elm = 'user';

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
      rtn = addUser(elm, args1, props);
      break;
    case 'update':
      rtn = updateUser(elm, args1, args2, props);
      break;
    case 'change-password':
      rtn = changePassword(elm, args1, args2, props);
      break;
    default:
      rtn = null;
      break;
  }
  return rtn;
}

function addUser(elm, task, props) {
  var rtn, item, error;
  
  error = "";
  
  item = {}
  item.nick = (task.nick||"");
  item.name = (task.name||"");
  item.password = (task.password||"");
  
  if(item.nick === "") {
    error += "Missing Nickname ";
  }
  if(item.password==="") {
    error += "Missing Password";
  } 
  if(storage('user','item', item.nick)!==null) {
    error += "Nick already exists";
  }  
  
  if(error.length!==0) {
    rtn = utils.exception(error);
  }
  else {
    storage(elm, 'add', setProps(item,props), item.nick);
  }
  
  return rtn;
}

function updateUser(elm, id, user, props) {
  var rtn, check, item, error;
  
  error = "";
  check = storage(elm, 'item', id);
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    item = check;
    item.id = id;      
    item.nick = check.nick;
    item.password = check.password;
    item.name = (user.name===undefined?check.name:user.name);

    if(item.nick === "") {
      error += "Missing Nickname ";
    }
    if(item.password === "") {
      error += "Missing Password";
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

function changePassword(elm, id, user, props) {
  var rtn, check, item, error;
  
  error = "";
  check = storage(elm, 'item', id);
  if(check===null) {
    rtn = utils.exception("File Not Found", "No record on file", 404);
  }
  else {
    item = check;
    
    if(user.oldpass===undefined || user.oldpass.length==0) {
      error += "Missing current password " ;
    }
    if(user.newpass===undefined || user.newpass.length==0) {
      error += "Missing new password ";
    }
    if(user.newpass===undefined || user.newpass.length==0) {
      error += "Missing new password ";
    }
    if(user.checkpass===undefined || user.checkpass.length==0) {
      error += "Missing confirm password ";
    }
    if(item.password!==user.oldpass) {
      error += "Incorrect current password ";
    }
    if(user.newpass!==user.checkpass) {
      error += "New password and Confirm Password MUST be identical ";
    }
    
    if(error==="") {
      item.id = id;      
      item.nick = check.nick;
      item.name = check.name;
      item.password = user.newpass;
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

