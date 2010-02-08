

function classAddedClass(className, superClassName,parameters){
	var className = className;
	var superClassName = superClassName;
	var parameters = parameters;
	this.getResource = function(){
		return className;
	}
	this.getSuperClass = function(){
		return superClassName;
	}
	this.getParameters = function(){
		return parameters;
	}
	
	this.createCls = function()	{
	var iconicName = parameters.iconicName;
	var tree = parameters.tree;
	var isRootNode = parameters.isRootNode;
	var type = parameters.type;
	// NScarpato 11/07/2007
	if (type == "siblingClass" && isRootNode == "true") {
		var node = getthetree().getElementsByTagName('treechildren')[0];
		var tr = document.createElement("treerow");
		tr.setAttribute("id", "treerow" + 30);
		var tc = document.createElement("treecell");
		tc.setAttribute("label", className);
		tc.setAttribute("numInst", 0);
		tc.setAttribute("deleteForbidden", "false");
		tc.setAttribute("id", "cell-of-treeitem" + 10);
		tc.setAttribute("isRootNode", isRootNode);
		var server= readServer();
				if(server!="127.0.0.1"){
					var hashUser = readUserHash();
					if(hashUser!=null){	//Siamo in modalità collaborativa
						var ress = readProp();
						var founded=false;
						for(var it= 0;it<ress.hash.length;it++){
							if(hashUser==ress.hash[it]){
								founded=true;
								break;
							}
						}
						if(founded)
							tc.setAttribute("properties","c"+ress.colors[it]);
						else
							tc.setAttribute("properties","c9");
					}
				}
		tr.appendChild(tc);
		var ti = document.createElement("treeitem");
		ti.setAttribute("id", "treeitem" + this.itemid);
		ti.setAttribute('container', 'false');
		ti.setAttribute('open', 'false');
		ti.appendChild(tr);
		var tch = document.createElement("treechildren");
		ti.appendChild(tch);
		node.appendChild(ti);
	} else {
		
		//var clsNode = treeList[0].getElementsByTagName('Class')[0];
		//var subClassNode = treeList[0].getElementsByTagName('SubClass')[0];
		var treecellNodes = tree.getElementsByTagName("treecell");
		var targetNode = new Array();
		for (var i = 0; i < treecellNodes.length; i++) {
			if (treecellNodes[i].getAttribute("label") == iconicName) {
				targetNode.push(treecellNodes[i].parentNode.parentNode);
				
			}
		}

		for (var k = 0; k < targetNode.length; k++) {
			var tr = document.createElement("treerow");
			var tc = document.createElement("treecell");
			var ti = document.createElement("treeitem");
			tc.setAttribute("label", className);
			tc.setAttribute("deleteForbidden", "false");
			tc.setAttribute("numInst", "0");
			tc.setAttribute("isRootNode", isRootNode);
		var server= readServer();
				
				if(server!="127.0.0.1"){
					var hashUser = readUserHash();
					if(hashUser!=null){	//Siamo in modalità collaborativa
						var ress = readProp();
						var founded=false;
						for(var it= 0;it<ress.hash.length;it++){
							if(hashUser==ress.hash[it]){
								founded=true;
								break;
							}
						}
						if(founded)
							tc.setAttribute("properties","c"+ress.colors[it]);
						else
							tc.setAttribute("properties","c9");
					}
				}
			tr.appendChild(tc);
			var ti = document.createElement("treeitem");
			ti.setAttribute('container', 'false');
			ti.setAttribute('open', 'false');
			ti.appendChild(tr);
			var treechildren = targetNode[k]
					.getElementsByTagName('treechildren')[0];
			if (treechildren == null) {
				treechildren = document.createElement("treechildren");
				targetNode[k].appendChild(treechildren);
			}

			if (targetNode[k].getAttribute('container') == "false") {
				targetNode[k].setAttribute('container', 'true');
				targetNode[k].setAttribute('open', 'true');
			} else if (targetNode[k].getAttribute('open') == "false") {
				targetNode[k].setAttribute('open', 'true');
			}

			var firstChild = treechildren.firstChild;
			if (firstChild == null) {
				treechildren.appendChild(ti);
			} else {
				treechildren.insertBefore(ti, firstChild);
			}
		}
	}
}
}
function instanceAddedClass(instanceName, className){
	var instanceName = instanceName;
	var className = className;
	
	this.getResource = function(){
		return instanceName;
	}
	this.getType = function(){
		return className;
	}
}


function propertyAddedClass(propertyName, superPropertyName){
	var propertyName;
	var superPropertyName;
	
	this.getResource = function(){
		return propertyName;
	}
	this.getSuperProperty = function(){
		return superPropertyName;
	}
}



function subClsOfRemovedClass(className, superClassName){
	var className = className;
	var superClassName = superClassName;
	
	this.getResource = function(){
		return className;
	}
	this.getSuperClass = function(){
		return superClassName;
	}
}


function subPropOfRemovedClass(propertyName, superPropertyName){
	var propertyName = propertyName;
	var superPropertyName = superPropertyName;
	
	this.getResource = function(){
		return propertyName;
	}
	this.getSuperProp = function(){
		return superPropertyName;
	}
}


function typeRemovedClass(instanceName, className){
	var instanceName = instanceName;
	var className = className;
	
	this.getResource = function(){
		return instanceName;
	}
	this.getType = function(){
		return className;
	}
}


function tripleAddedClass(subj, predicate, obj){
	var subj = subj;
	var predicate = predicate;
	var obj = obj;
	
	this.getSubject = function(){
		return subj;
	}
	this.getPredicate = function(){
		return predicate;
	}
	this.getObject = function(){
		return obj;
	}
	
}


function tripleDeletedClass(subj, predicate, obj){
	var subj = subj;
	var predicate = predicate;
	var obj = obj;
	
	this.getSubject = function(){
		return subj;
	}
	this.getPredicate = function(){
		return predicate;
	}
	this.getObject = function(){
		return obj;
	}
}



















