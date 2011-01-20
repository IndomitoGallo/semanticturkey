/**
 * parses the property tree
 * 
 * @param propertyNode
 * @param node
 * @param isRootNode
 * @return
 */
art_semanticturkey.parsingProperties = function(propertyNode, node, isRootNode) {
	var name = propertyNode.getAttribute("name");
	var deleteForbidden = propertyNode.getAttribute("deleteForbidden");
	var type = propertyNode.getAttribute("type");
	var tr = document.createElement("treerow");
	var tc = document.createElement("treecell");
	tc.setAttribute("label", name);
	tc.setAttribute("deleteForbidden", deleteForbidden);
	tc.setAttribute("propType", type);
	// NScarpato 25/06/2007 remove owl: because : doesn't work for css
	type = type.substring(4);
	if (deleteForbidden == "true")
		type = type + "_noexpl";
	tr.setAttribute("properties", type);
	tc.setAttribute("properties", type);
	tc.setAttribute("isRootNode", isRootNode);
	tr.appendChild(tc);
	var ti = document.createElement("treeitem");
	ti.setAttribute("propertyName", name); 
	ti.appendChild(tr);
	var tch = document.createElement("treechildren");
	ti.appendChild(tch);
	node.appendChild(ti);
	var propertiesNodes;
	var propertiesList = propertyNode.childNodes;
	for ( var i = 0; i < propertiesList.length; i++) {
		if (propertiesList[i].nodeName == "SubProperties") {
			propertiesNodes = propertiesList[i].childNodes;
			for ( var j = 0; j < propertiesNodes.length; j++) {
				if (propertiesNodes[j].nodeType == 1) {
					art_semanticturkey.parsingProperties(propertiesNodes[j],
							tch, false);
				}
			}
		}
		if (propertiesNodes != null && propertiesNodes.length > 0) {
			ti.setAttribute("open", true);
			ti.setAttribute("container", true);
		} else {
			ti.setAttribute("open", false);
			ti.setAttribute("container", false);
		}
	}
};