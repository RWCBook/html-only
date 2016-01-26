/*******************************************************
 * TPS - Task Processing Service
 * wstl document (server)
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *******************************************************/

// library for managing the state transitions
// function set for finding transitions at runtime
// holds the list of *all* possible state transitions for this service

// ************************
// run on first load;
// ************************
var trans = loadTrans();

// low-level finder
exports.find = function(name) {
  var rtn, i, x;
 
  rtn = null;
  for(i=0,x=trans.length;i<x;i++) {
    if(trans[i].name===name) {
      rtn = trans[i];
      break;
    }
  }

  return rtn;
}

// make a base transition
// object = {name,href,rel[],root}
exports.make = function(object) {
  var rtn, name, rel, href, root;
  
  if(!object.name || object.name===null || object.name==="") {
    rtn = null;
  }
  else {
    name = object.name;
    root = object.root||"";
    href = object.href||"#";
    rel = object.rel||"";
    
    tran = this.find(name);
    if(tran!==null) {
      rtn = tran;
      rtn.href = root + href;
      rtn.rel = [];
      if(Array.isArray(rel)===true) {
        for(i=0,x=rel.length;i<x;i++) {
          rtn.rel.push((rel[i].indexOf('/')===0?root+rel[i]:rel[i]));
        }        
      }
      else {
        rtn.rel.push((rel.indexOf('/')===0?root+rel:rel));
      }
    }
    else {
      rtn = null;
    }
  }
  return rtn;
}

// append a base transition to a collection
exports.append = function(object, coll) {
  var trans;
  
  trans = this.make(object);
  if(trans!==null) {
    coll.splice(coll.length, 0, trans);
  }
  return coll;
}

// NOT USED
exports.findByTarget = function(val) {
  var coll, i, x;
 
  coll = [];
  for(i=0,x=trans.length;i<x;i++) {
    if(trans[i].target && trans[i].target.indexOf(val)!==-1) {
      coll.push(trans[i]);
    }
  }
 
  return coll;
}

exports.all = function all() {
  return trans;
}

// internal filling routine
function loadTrans() {
  var trans;
  trans = [];

  /************************************
  HOME
  *************************************/
  trans.push({
    name : "homeLink",
    type : "safe",
    action : "read",
    kind : "home",
    target : "list menu",
    prompt : "Home"
  });
  trans.push({
    name : "taskLink",
    type : "safe",
    action : "read",
    kind : "task",
    target : "list menu",
    prompt : "Tasks"
  });  
  trans.push({
    name : "userLink",
    type : "safe",
    action : "read",
    kind : "user",
    target : "list menu",
    prompt : "Users"
  });

  /************************************
  TASKS
  *************************************/
  trans.push({
    name : "taskFormListActive",
    type : "safe",
    action : "read",
    kind : "task",
    target : "list query",
    prompt : "Active Tasks",
    inputs : [
      {name : "completeFlag", prompt : "Complete", value : "false", readOnly:true}
    ]
  });
  trans.push({
    name : "taskFormListCompleted",
    type : "safe",
    action : "read",
    kind : "task",
    target : "list query",
    prompt : "Completed Tasks",
    inputs : [
      {name : "completeFlag", prompt : "Complete", value : "true", readOnly:true}
    ]
  });

  trans.push({
    name : "taskFormListByTitle",
    type : "safe",
    action : "read",
    kind : "task",
    target : "list query",
    prompt : "Search By Title",
    inputs : [
      {name : "title", prompt : "Title", value : ""}
    ]
  });

  trans.push({
    name : "taskFormListByUser",
    type : "safe",
    action : "read",
    kind : "task",
    target : "list query",
    prompt : "Search By Assigned User",
    inputs : [
      {name : "assignedUser", prompt : "User", value : ""}
    ]
  });
  
  trans.push({
    name : "taskLinkItem",
    type : "safe",
    action : "read",
    kind : "task",
    target : "item",
    prompt : "Detail",
    html : {
      className : "item link ui basic blue button"
    }
  });
  
  // add task
  trans.push({
    name : "taskFormAdd",
    type : "unsafe",
    action : "append",
    kind : "task",
    target : "list add",
    prompt : "Add Task",
    inputs : [
      {name : "title", prompt : "Title", required : true},
      {name : "completeFlag", prompt : "Complete", value : "false", 
        pattern :"true|false",
        type:"select",
        suggest:[{value:"false"},{value:"true"}] 
      }
    ]
  });

  // edit task
  trans.push({
    name : "taskFormEditPost",
    type : "unsafe",
    action : "append",
    kind : "task",
    prompt : "Edit Task",
    target : "item edit form post",
    inputs : [
      {name : "id", prompt : "ID", value : "", readOnly : true},
      {name : "title", prompt : "Title", value : ""},
      {name : "completeFlag", prompt : "Complete", value : "false", 
        pattern :"true|false",
        type:"select",
        suggest:[{value:"false"},{value:"true"}] 
      }
    ]
  });

  // remove task
  trans.push({
    name : "taskFormRemovePost",
    type : "unsafe",
    action : "append",
    kind : "task",
    prompt : "Remove Task",
    target : "item edit form post",
    inputs : [
      {name : "id", prompt : "ID", readOnly : true}
    ]
  });

  // mark task completed
  trans.push({
    name : "taskCompletedLink",
    type : "safe",
    action : "read",
    kind : "task",
    target : "item",
    prompt : "Mark Completed",
    html : {
      className : "item action ui basic blue button"
    }
  });
  trans.push({
    name : "taskCompletedForm",
    type : "unsafe",
    action : "append",
    kind : "task",
    target : "item completed edit post form",
    prompt : "Mark Completed",
    inputs : [
      {name: "id", prompt:"ID", readOnly:true},
    ]
  });

  trans.push({
    name : "taskAssignLink",
    type : "safe",
    action : "read",
    kind : "task",
    target : "item",
    prompt : "Assign User",
    html : {
      className : "item action ui basic blue button"
    }
  });
  trans.push({
    name : "taskAssignForm",
    type : "unsafe",
    action : "append",
    kind : "task",
    target : "item assign edit post form",
    prompt : "Assign User",
    inputs : [
      {name: "id", prompt:"ID", readOnly:true},
      {name: "assignedUser", prompt:"User Nickname", value:"", requried:true, suggest:{related:"userlist", value:"nick",text:"nick"}, type:"select"}
    ]
  });

  /************************************
  USERS
  *************************************/
  trans.push({
    name : "userLinkItem",
    type : "safe",
    action : "read",
    kind : "user",
    target : "item",
    prompt : "Detail",
    html : {
      className : "item link ui basic blue button"
    }
  });

  trans.push({
    name : "userTasksLink",
    type : "safe",
    action : "read",
    kind : "user",
    target : "item",
    prompt : "Assigned Tasks",
    html : {
      className : "item link ui basic blue button"
    }
  });

  trans.push({
    name : "userFormListByNick",
    type : "safe",
    action : "read",
    kind : "task",
    target : "list query",
    prompt : "Search By Nick",
    inputs : [
      {name : "nick", prompt : "Nickname", value : ""}
    ]
  });
  
  trans.push({
    name : "userFormListByName",
    type : "safe",
    action : "read",
    kind : "task",
    target : "list query",
    prompt : "Search By Name",
    inputs : [
      {name : "name", prompt : "Name", value : ""}
    ]
  });

  trans.push({
    name : "userFormAdd",
    type : "unsafe",
    action : "append",
    kind : "task",
    target : "list add",
    prompt : "Add User",
    inputs : [
      {name : "nick", prompt : "Nickname", required: true, pattern: "[a-zA-Z0-9]+"},
      {name : "name", prompt : "Full Name", value: "", required: true}, 
      {name : "password", prompt : "Password", value: "", required: true, pattern: "[a-zA-Z0-9!@#$%^&*-]+"}
    ]
  });

  trans.push({
    name : "userFormEditPost",
    type : "unsafe",
    action : "append",
    kind : "task",
    prompt : "Edit User",
    target : "item edit form post",
    inputs : [
      {name : "nick", prompt : "Nickname", value : "", readOnly: true},
      {name : "name", prompt : "Full Name", value : ""}
    ]
  });

  trans.push({
    name : "userLinkChangePW",
    type : "safe",
    action : "read",
    kind : "user",
    target : "item",
    prompt : "Change Password",
    html : {
      className : "item link ui basic blue button"
    }
  });
  trans.push({
    name : "userFormChangePWPost",
    type : "unsafe",
    action : "append",
    kind : "task",
    prompt : "Change Password",
    target : "item edit form post",
    inputs : [
      {name : "nick", prompt : "Nickname", value : "", readOnly: true},
      {name : "oldpass", prompt : "Current Password", value : "", required: true, pattern: "[a-zA-Z0-9!@#$%^&*-]+"},
      {name : "newpass", prompt : "New Password", value : "", required: true, pattern: "[a-zA-Z0-9!@#$%^&*-]+"},
      {name : "checkpass", prompt : "Confirm New Password", value : "", required: true, pattern: "[a-zA-Z0-9!@#$%^&*-]+"}
    ]
  });

  // return complete 
  // design-time WSTL
  return trans;
  
}

// EOF

