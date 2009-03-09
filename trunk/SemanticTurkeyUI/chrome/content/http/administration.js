/*
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 * 
 * The Original Code is SemanticTurkey.
 * 
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2007.
 * All Rights Reserved.
 * 
 * SemanticTurkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata (ART) Current
 * information about SemanticTurkey can be obtained at
 * http://semanticturkey.uniroma2.it
 * 
 */
function populateMirrorTable(parameters, treeList) {
	var mirrorTree = parameters.mirrorTree;
	node = mirrorTree.getElementsByTagName('treechildren')[0];
	for (var i = 0; i < treeList.length; i++) {
		if (treeList[i].nodeType == 1) {
			nsList = treeList[i].childNodes;
		}
	}
	for (i = 0; i < nsList.length; i++) {
		if (nsList[i].nodeType == 1) {
			parseMirror(nsList[i], node);
		}
	}
}

function parseMirror(mirrorNode, node) {
	var uri = mirrorNode.getAttribute("ns");
	var tcURI = document.createElement("treecell");
	tcURI.setAttribute("label", uri);

	var file = mirrorNode.getAttribute("file");
	var tcFile = document.createElement("treecell");
	tcFile.setAttribute("label", file);

	var tr = document.createElement("treerow");

	tr.appendChild(tcURI);
	tr.appendChild(tcFile);

	var ti = document.createElement("treeitem");
	ti.appendChild(tr);

	node.appendChild(ti);
}