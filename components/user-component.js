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
    error += "Missing Nickname, ";
  }
  if(item.password==="") {
    error += "Missing Password, ";
  } 
  if(storage('user','item', item.nick)!==null) {
    error += "Nick already exists.";
  }  
  
  if(error.length!==0) {
    rtn = utils.exception(error);
  }
  else {
    storage(elm, 'add', utils.setProps(item,props), item.nick);
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
      error += "Missing Nickname, ";
    }
    if(item.password === "") {
      error += "Missing Password.";
    }
    
    if(error!=="") {
      rtn = utils.exception(error);
    } 
    else {
      storage(elm, 'update', id, utils.setProps(item, props));
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
      error += "Missing current password, " ;
    }
    if(user.newpass===undefined || user.newpass.length==0) {
      error += "Missing new password, ";
    }
    if(user.newpass===undefined || user.newpass.length==0) {
      error += "Missing new password, ";
    }
    if(user.checkpass===undefined || user.checkpass.length==0) {
      error += "Missing confirm password, ";
    }
    if(item.password!==user.oldpass) {
      error += "Incorrect current password, ";
    }
    if(user.newpass!==user.checkpass) {
      error += "New password and Confirm Password MUST be identical.";
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
      storage(elm, 'update', id, utils.setProps(item, props));
    }
  }
  
  return rtn;
}

// EOF

