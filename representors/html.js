/*******************************************************
 * HTML representor
 * January 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : The Definitive Sonny Rollins 
                On Prestige, Riverside, And Contemporary
 *******************************************************/

/*
  NOTE:
  HTML representor for SPA-style rendering
  - Has FATAL dependency on WSTL.JS
  - Relies on semantic UI CSS library
  - A fixed 2-column layout as follows:
    - top-level menu bar
    - title display
    - column1 has item list
    - column2 has forms
    - error display overwrites page
*/

module.exports = html;

// need to include forms and links here
function html(object, root) {
  var template, errpage, doc, s;
  
  // this is the standard HTML layout for this representor
  template =  '';
  template += '<!DOCTYPE html>';
  template += '<html>';
  template += '<head>';
  template += '  <title>{title}</title>'
  template += '  <link rel="stylesheet" href="'+root+'/files/semantic.min.css" />'
  template += '  <style>.idx, .dateCreated, .dateUpdated {display:none;}</style>'
  template += '</head>';
  template += '<body>';
  template += '<div id="links">{links}</div>';
  template += '<div style="margin:1em;">';
  template += '<p>&nbsp;</p>';
  template += '<h1 id="title" class="ui page header" style="margin-bottom:40px" >{title}';
  template += '<img src="http://mamund.site44.com/rwabook/big-co.png" height="48" alt="big-co logo" align="right"/></p>';
  template += '</h1>';
  template += '<div id="content" class="ui">{content}</div>';
  template += '<div id="data" class="ui two column grid" style="margin-top: 2em">';
  template += '  <div id="col1" class="column">';
  template += '    <div id="items">{items}</div>';
  template += '  </div>';
  template += '  <div id="col2" class="column">';
  template += '    {edit}';
  template += '    {template}';
  template += '    <div id="queries">{queries}</div>';
  template += '  </div>';
  template += '</div>';
  template += '</div>';
  template += '</body>';
  template += '</html>';
  
  // this is the error HTML layout
  errpage =  '';
  errpage += '<!DOCTYPE html>';
  errpage += '<html>';
  errpage += '<head>';
  errpage += '  <title>ERROR</title>'
  errpage += '  <link rel="stylesheet" href="'+root+'/files/semantic.min.css" />'
  errpage += '</head>';
  errpage += '<body>';
  errpage += '<div id="error" style="margin:1em; padding: 1em; border:5px solid red">{error}</div>';
  errpage += '</body>';
  errpage += '</html>';
  
 
  // load up the doc
  doc = template;
  
  // handle loaded transitions graph
  s="";
  for(s in object) {
    if(s==="error") {
      doc = errpage;
      doc = doc.replace("{error}",processError(object[s]));
    }
    else {
      doc = doc.replace(/{title}/g, object[s].title||"");
      doc = processPage(object[s], root, s, doc);
    }
  }
  return doc;
}

function processPage(data, root, s, doc) {
  var rtn;

  // menu
  rtn = getMenuActions(data, root, "menu");
  doc = doc.replace("{links}",rtn);
  
  // content
  rtn = getContent(data);
  doc = doc.replace('{content}',rtn);
  
  // items
  rtn = processItems(data);
  doc = doc.replace('{items}',rtn);
  
  // edit
  rtn = getEditTemplate(data);
  doc = doc.replace("{edit}",rtn);
  
  // add template
  rtn = getAddTemplate(data);
  doc = doc.replace("{template}",rtn);
  
  // queries
  rtn = getListQueries(data.actions);
  doc = doc.replace("{queries}",rtn);
  
  return doc;
}

function getContent(data) {
  var rtn;
  
  if(data.content && data.content!==null) {
    rtn = data.content;
  }
  else {
    rtn = "";
  }
  return rtn;
}

function processItems(data) {
  var rtn, i, x, z, items, item;
  
  z=0;
  rtn = "<div>";  
  
  // iterate through items
  if(data.data && data.data!==null && data.data.length!==0) {
    items = data.data;
    rtn += '<div class="ui segments">';
    for(i=0,x=items.length;i<x;i++) {
      item = items[i];
      
      rtn += '<div class="ui segment">';
      
      // handle any item-level buttons
      rtn += '<div class="ui mini buttons">'
      rtn += getItemActions(data.actions, item, "item");
      rtn += '</div>';
       
      // iterate through all the properties of an item
      rtn += '<table class="ui very basic collapsing celled table">';
      for(var prop in item) {
        rtn += '<tr class="item '+prop+'" >';
        rtn += '<th class="right aligned" style="text-transform:capitalize;">'+prop+'</th>';
        rtn += '<td class="value">'+item[prop]+'</td>';      
        rtn += '</tr>';
      } 
      
      // close up this item rendering
      rtn += '</table>';   
      rtn += '</div>';
    }
    rtn += "</div>";
  }
  
  rtn += "</div>";
  
  return rtn;
}

function getListQueries(coll) {
  var i, x, z;
  
  rtn = "<div>";
  z=0;
  
  // find all the actions w/ "list" AND "query" in the target
  if(coll && coll!==null && coll.length!==0) {
    for(i=0,x=coll.length;i<x;i++) {
      if(coll[i].target.indexOf("list")!==-1 && coll[i].target.indexOf("query")!==-1) {
        if(z===0) {
          rtn += '<h1 class="ui dividing header">Queries</h1>';
          z++;
        }
        rtn += getForm(coll[i]);
      }
    }
  }
  
  rtn += "</div>";
    
  return rtn;
}

function getAddTemplate(data) {
  var rtn, i, x, coll, z;
  
  rtn = "";
  z = 0;
  
  // find any actions w/ "list" and "add" in the target
  if(data.actions && data.actions!==null && data.actions.length!==0) {
    coll = data.actions;
    for(i=0,x=coll.length;i<x;i++) {
      if(coll[i].target.indexOf("list")!==-1 && coll[i].target.indexOf("add")!==-1) {
      if(z===0) {
        rtn += '<div id="template" class="ui green segment">';
        z++;
      }
      rtn += getForm(coll[i], null, data.related);
      }
    }
    if(z!==0) {
      rtn += '</div>';
    }
  }
  
  return rtn;
}

function getEditTemplate(data) {
  var item, coll, i, x, rtn, z;
  
  rtn = "";
  z=0;

  if(data.data && data.data.length===1) {
    item = data.data[0];
  }
  else {
    item = null;
  }

  // find any actions w/ "item" and "edit" and "post" in the target
  if(data.actions && data.actions!==null && data.actions.length!==0) {
    coll = data.actions;
    for(i=0,x=coll.length;i<x;i++) {
      if(coll[i].target.indexOf("item")!==-1 && coll[i].target.indexOf("edit")!==-1 && coll[i].target.indexOf("post")!==-1) {
      if(z===0) {
        rtn += '<div id="edit" class="ui green segment">'; 
        z++;
      }
      rtn += getForm(coll[i], item, data.related);
      }
    }
    if(z!==0) {
      rtn += '</div>';
    }
  }
  
  return rtn;
  
}

function getForm(data, item, related) {
  var rtn, i, x, temp, type;
  
  // declare the form space
  rtn = '<div class="ui segement">';
  rtn += '<form method="{method}" action="{action}" class="{className}">'
  rtn = rtn.replace(/{method}/g,(data.type==="safe"?"get":"post"));
  rtn = rtn.replace(/{action}/g,(data.href||"#"));
  rtn = rtn.replace(/{rel}/g,(data.rel||""));
  rtn = rtn.replace(/{className}/g,"form");
  if(item && item!==null) {
    rtn = rtn.replace(/{key}/g, (item.id||""));
  }
  rtn += '<div class="ui form">';
  rtn += '<div class="ui dividing header">'+(data.prompt||data.name)+'</div>';
  
  // if we have inputs, add them
  if(data.inputs) {
    for(i=0,x=data.inputs.length;i<x;i++) {
      type=false;
      temp = data.inputs[i];
      rtn += '<p class="inline field">';
      rtn += '<label class="data right aligned">'+(temp.prompt||temp.name)+'</label>';
      
      // handle html input type
      if(temp.type && temp.type==="textarea") {
        rtn += '<textarea rows="3" type="text" name="{name}" class="{className}" {required} {readOnly} {pattern}>{value}</textarea>';      
        type=true;
      }
      if(type===false && temp.suggest) { 
        rtn += '<select name="{name}" class="ui dropdown {className}" {required} {readOnly} {pattern}>{suggest}</select>'
        type=true;
      }
      if(type===false) {
        rtn += '<input type="text" name="{name}" class="{className}" value="{value}" {required}" {readOnly} {pattern}"/>';
      }
      
      // update properties for the html input
      rtn = rtn.replace(/{name}/g, (temp.name||""));
      rtn = rtn.replace(/{className}/g, "value");
      rtn = rtn.replace(/{value}/g, ((item && item[temp.name]?item[temp.name]:(temp.value?temp.value.toString():""))));
      rtn = rtn.replace(/{required}/g,(temp.required===true?'required="true"':""));
      rtn = rtn.replace(/{pattern}/g,(temp.pattern?'pattern="'+temp.pattern+'"':""));
      rtn = rtn.replace(/{suggest}/g,(temp.suggest?getSuggest(temp.suggest, (item && item[temp.name]?item[temp.name]:""), related):""));
      if(temp.suggest) {
        rtn = rtn.replace(/{readOnly}/g,(temp.readOnly===true?"disabled":""));
      }
      else {
        rtn = rtn.replace(/{readOnly}/g,(temp.readOnly===true?"readOnly":""));
      }      
      rtn += "</p>";
    }
  }
  
  // add submit button and close up this form
  rtn += '<input type="submit" class="ui mini submit button" />';
  rtn += '</div>';
  rtn += '</form>';
  rtn += "</div>"
  
  return rtn;
}


function processError(data) {
  var item, rtn;

  rtn = "";
  rtn += '<h1 class="ui header">Error</h1>'
  rtn += "<dl>";
  
  for(p in data) {
    rtn += "<dt>"+p+"</dt>";
    rtn += "<dd>"+data[p]+"</dd>";
  }  
  rtn += "</dl>";
  
  return rtn;
}

function getItemActions(coll, item, target) {
  var rtn, i, x, t;
  
  t = (target||"item");
  rtn = "";
  
  // iterate through actions w/ target containing selected word-part
  for(i=0, x=coll.length;i<x;i++) {
    if(coll[i].target && coll[i].target.indexOf(t)!==-1 && coll[i].type==="safe") {
      rtn += '<a href="{href}" rel="{rel}" class="{className}" title="{description}">{prompt}</a>';
      rtn = rtn.replace(/{href}/g, coll[i].href);
      rtn = rtn.replace(/{rel}/g, (coll[i].rel.join(" ")||"item"));
      rtn = rtn.replace(/{prompt}/g, (coll[i].prompt||coll[i].name));
      rtn = rtn.replace(/{description}/g, (coll[i].description||(coll[i].prompt||coll[i].name)));
      rtn = rtn.replace(/{className}/g, (coll[i].html && coll[i].html.className?coll[i].html.className:"item"));
      rtn = rtn.replace(/{key}/g, (item.id||""));
    }
  }
  
  return rtn;
}

function getMenuActions(data, root, target) {
  var rtn, i, x, t, coll;
  
  t = (target||"menu");
  
  rtn = "";
  rtn += '<div class="ui blue fixed top menu">';
  
  if(data.actions && data.actions!==null && data.actions.length!==0) {
    coll = data.actions;
    for(i=0,x=coll.length;i<x;i++) {
      switch(coll[i].type) {
        case "safe": { 
          if(!coll[i].inputs && coll[i].target.indexOf(t)!==-1) {
            rtn += '<li class="item">';
            rtn += '<a href="{href}" rel="{rel}">{prompt}</a>';
            rtn += '</li>';
            
            rtn = rtn.replace(/{href}/g, coll[i].href);
            rtn = rtn.replace(/{prompt}/g, coll[i].prompt);
            rtn = rtn.replace(/{rel}/g, coll[i].rel.join(" "));          
          }
        }
      }
    }
  }
  
  rtn += "</div>";
  
  return rtn;
}

function getSuggest(suggest, value, related) {
  var rtn, i, x, val, txt, vprop, tprop, list;
  
  rtn = "";
  rtn += '<option value="">SELECT</option>';

  if(Array.isArray(suggest)===true) {
    // use supplied values
    for(i=0,x=suggest.length;i<x;i++) {
      val = (suggest[i].value||"");
      txt = (suggest[i].text||"");
      rtn += '<option value="{value}" {selected}>{text}</option>';
      rtn = rtn.replace(/{value}/g, (val?val:(txt?txt:"")));
      rtn = rtn.replace(/{text}/g, (txt?txt:(val?val:"")));
      rtn = rtn.replace(/{selected}/g, (value===val?"selected":""));      
    }
  }
  else {
    // use related data
    vprop = suggest.value;
    tprop = suggest.text;
    list = related[suggest.related]
    if(Array.isArray(list)===true) {
      for(i=0,x=list.length;i<x;i++) {
        val = (list[i][vprop]||"");
        txt = (list[i][tprop]||"");
        rtn += '<option value="{value}" {selected}>{text}</option>';
        rtn = rtn.replace(/{value}/g, (val?val:(txt?txt:"")));
        rtn = rtn.replace(/{text}/g, (txt?txt:(val?val:"")));
        rtn = rtn.replace(/{selected}/g, (value===val?"selected":""));      
      }
    }
  }
  return rtn;
}
