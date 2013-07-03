if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ARTResources.jsm", art_semanticturkey);

window.onload = function(){
	//document.getElementById("explicitButton").addEventListener("command", art_semanticturkey.testFunc, true);
	var tempBox = document.getElementById("temp");
	
	
	/*var widgetBox1 = document.createElement("box");
	widgetBox1.setAttribute("flex", "1");
	tempBox.appendChild(widgetBox1);
	var artURIRes = new art_semanticturkey.ARTURIResource("pippo", "concept", "http://test#pippo");
	widgetBox1.rdfResource = artURIRes;
	widgetBox1.operations = "remove";
	widgetBox1.addEventListener("rdfnodeBaseEvent", function(e) {alert("evento rdfnodeBaseEvent")});
	widgetBox1.setAttribute("class","rdfnode-container-widget");
	
	var widgetBox2 = document.createElement("box");
	widgetBox2.setAttribute("flex", "1");
	tempBox.appendChild(widgetBox2);
	var artURIRes2 = new art_semanticturkey.ARTURIResource("topolino", "concept", "http://test#topolino");
	artURIRes2.explicit = false;
	widgetBox2.rdfResource = artURIRes2;
	widgetBox2.operations = "remove";
	widgetBox2.setAttribute("class","rdfnode-container-widget");

	var widgetBox3 = document.createElement("box");
	widgetBox3.setAttribute("flex", "1");
	tempBox.appendChild(widgetBox3);
	var artURIRes3 = new art_semanticturkey.ARTURIResource("paperino", "cls", "http://test#paperino");
	artURIRes3.explicit = true;
	widgetBox3.rdfResource = artURIRes3;
	widgetBox3.operations = "remove";
	widgetBox3.setAttribute("class","rdfnode-container-widget");*/
	
	var boxForLabel1 = document.createElement("hbox");
	var label1 = document.createElement("label");
	label1.setAttribute("value", "object-list-widget with less than 10 elements");
	label1.setAttribute("font-size", "large");
	var spacerForLabel1Before = document.createElement("spacer");
	spacerForLabel1Before.setAttribute("flex", "1");
	var spacerForLabel1After = document.createElement("spacer");
	spacerForLabel1After.setAttribute("flex", "1");
	boxForLabel1.appendChild(spacerForLabel1Before);
	boxForLabel1.appendChild(label1);
	boxForLabel1.appendChild(spacerForLabel1After);
	tempBox.appendChild(boxForLabel1);
	
	var widgetBoxOLW1 = document.createElement("box");
	var rdfResArray1 = new Array();
	rdfResArray1[0] = new art_semanticturkey.ARTURIResource("paperone", "concept", "http://test#paperone");
	rdfResArray1[1] = new art_semanticturkey.ARTURIResource("topolino", "concept", "http://test#topolino");
	rdfResArray1[2] = new art_semanticturkey.ARTURIResource("paperino", "cls", "http://test#paperino");
	rdfResArray1[3] = new art_semanticturkey.ARTLiteral("dog", "", "en", false);
	//widgetBoxOLW1.labelValue = "Few Resources";
	widgetBoxOLW1.rdfResourcesArray = rdfResArray1;
	widgetBoxOLW1.operations = "remove"
	widgetBoxOLW1.addEventListener("rdfnodeBaseEvent", art_semanticturkey.rdfnodeBaseEventHandler);
	//widgetBoxOLW1.addEventListener("rdfnodeContainerEvent", function(e) {alert("test")});
	widgetBoxOLW1.addEventListener("rdfnodeContainerEvent", art_semanticturkey.rdfnodeContainerEventHandler);
	widgetBoxOLW1.setAttribute("class","object-list-widget");
	tempBox.appendChild(widgetBoxOLW1);
	
	var spacer1 = document.createElement("spacer");
	spacer1.setAttribute("height", "40");
	tempBox.appendChild(spacer1);
	
	var boxForLabel2 = document.createElement("hbox");
	var label2 = document.createElement("label");
	label2.setAttribute("value", "object-list-widget with more than 10 elements");
	label2.setAttribute("font-size", "large");
	var spacerForLabel2Before = document.createElement("spacer");
	spacerForLabel2Before.setAttribute("flex", "1");
	var spacerForLabel2After = document.createElement("spacer");
	spacerForLabel2After.setAttribute("flex", "1");
	boxForLabel2.appendChild(spacerForLabel2Before);
	boxForLabel2.appendChild(label2);
	boxForLabel2.appendChild(spacerForLabel2After);
	tempBox.appendChild(boxForLabel2);
	
	
	var widgetBoxOLW2 = document.createElement("box");
	var rdfResArray2 = new Array();
	rdfResArray2[0] = new art_semanticturkey.ARTURIResource("pippo1", "concept", "http://test#pippo1");
	rdfResArray2[1] = new art_semanticturkey.ARTURIResource("pippo2", "concept", "http://test#pippo2");
	rdfResArray2[2] = new art_semanticturkey.ARTURIResource("pippo3", "concept", "http://test#pippo3");
	rdfResArray2[3] = new art_semanticturkey.ARTURIResource("pippo4", "concept", "http://test#pippo4");
	rdfResArray2[4] = new art_semanticturkey.ARTURIResource("pippo5", "concept", "http://test#pippo5");
	rdfResArray2[5] = new art_semanticturkey.ARTURIResource("pippo6", "concept", "http://test#pippo6");
	rdfResArray2[6] = new art_semanticturkey.ARTBNode("_:p1");
	rdfResArray2[7] = new art_semanticturkey.ARTLiteral("Casa", "", "it", false);
	rdfResArray2[8] = new art_semanticturkey.ARTLiteral("House", "", "en", false);
	rdfResArray2[9] = new art_semanticturkey.ARTLiteral("gatto", "", "sp", false);
	rdfResArray2[10] = new art_semanticturkey.ARTLiteral("123", "http://type#integer", "", true);
	rdfResArray2[11] = new art_semanticturkey.ARTLiteral("computer", "http://type@string", "", true);
	//widgetBoxOLW2.labelValue = "More Resources";
	widgetBoxOLW2.operations = "remove"
	widgetBoxOLW2.rdfResourcesArray = rdfResArray2;
	
	widgetBoxOLW2.addEventListener("rdfnodeBaseEvent", art_semanticturkey.rdfnodeBaseEventHandler);
	widgetBoxOLW2.addEventListener("rdfnodeContainerEvent", art_semanticturkey.rdfnodeContainerEventHandler);
	widgetBoxOLW2.addEventListener("objectListEvent", art_semanticturkey.objectListEventHandler);
	widgetBoxOLW2.setAttribute("class","object-list-widget");
	tempBox.appendChild(widgetBoxOLW2);
	
	
	var spacer2 = document.createElement("spacer");
	spacer2.setAttribute("height", "40");
	tempBox.appendChild(spacer2);
	
	
	var boxForLabel3 = document.createElement("hbox");
	var label3 = document.createElement("label");
	label3.setAttribute("value", "predicate-objects-widget with less than 10 elements");
	label3.setAttribute("font-size", "large");
	var spacerForLabel3Before = document.createElement("spacer");
	spacerForLabel3Before.setAttribute("flex", "1");
	var spacerForLabel3After = document.createElement("spacer");
	spacerForLabel3After.setAttribute("flex", "1");
	boxForLabel3.appendChild(spacerForLabel3Before);
	boxForLabel3.appendChild(label3);
	boxForLabel3.appendChild(spacerForLabel3After);
	tempBox.appendChild(boxForLabel3);
	
	var widgetBoxOLW3 = document.createElement("box");
	var rdfResArray3 = new Array();
	rdfResArray3[0] = new art_semanticturkey.ARTURIResource("pippo1", "concept", "http://test#pippo1");
	rdfResArray3[1] = new art_semanticturkey.ARTURIResource("pippo6", "concept", "http://test#pippo6");
	rdfResArray3[2] = new art_semanticturkey.ARTBNode("_:p1");
	rdfResArray3[3] = new art_semanticturkey.ARTLiteral("Acqua", "", "it", false);
	rdfResArray3[4] = new art_semanticturkey.ARTLiteral("Water", "", "en", false);
	rdfResArray3[5] = new art_semanticturkey.ARTLiteral("123456", "http://type#integer", "", true);
	//widgetBoxOLW3.labelValue = "More Resources (predicate-objects-widget)";
	widgetBoxOLW3.operations = "add;remove";
	widgetBoxOLW3.rdfResourcesArray = rdfResArray3;
	widgetBoxOLW3.rdfSubject = new art_semanticturkey.ARTURIResource("subjectTest1", "concept", 
			"http://test#subjectTest1");
	widgetBoxOLW3.rdfPredicate = new art_semanticturkey.ARTURIResource("predicateTest1", "concept", 
			"http://test#predicateTest1");
	
	
	widgetBoxOLW3.addEventListener("rdfnodeBaseEvent", art_semanticturkey.rdfnodeBaseEventHandler);
	//widgetBoxOLW3.addEventListener("rdfnodeContainerEvent", art_semanticturkey.rdfnodeContainerEventHandler, false);
	widgetBoxOLW3.addEventListener("predicateObjectsEvent", art_semanticturkey.predicateObjectsEventHandler);
	widgetBoxOLW3.setAttribute("class","predicate-objects-widget");
	tempBox.appendChild(widgetBoxOLW3);

	
	
	var spacer3 = document.createElement("spacer");
	spacer3.setAttribute("height", "40");
	tempBox.appendChild(spacer3);
	
	
	var boxForLabel4 = document.createElement("hbox");
	var label4 = document.createElement("label");
	label4.setAttribute("value", "predicate-objects-widget with more than 10 elements");
	label4.setAttribute("font-size", "large");
	var spacerForLabel4Before = document.createElement("spacer");
	spacerForLabel4Before.setAttribute("flex", "1");
	var spacerForLabel4After = document.createElement("spacer");
	spacerForLabel4After.setAttribute("flex", "1");
	boxForLabel4.appendChild(spacerForLabel4Before);
	boxForLabel4.appendChild(label4);
	boxForLabel4.appendChild(spacerForLabel4After);
	tempBox.appendChild(boxForLabel4);
	
	var widgetBoxOLW4 = document.createElement("box");
	var rdfResArray4 = new Array();
	rdfResArray4[0] = new art_semanticturkey.ARTURIResource("pippo1", "concept", "http://test#pippo1");
	rdfResArray4[1] = new art_semanticturkey.ARTURIResource("pippo2", "concept", "http://test#pippo2");
	rdfResArray4[2] = new art_semanticturkey.ARTURIResource("pippo3", "concept", "http://test#pippo3");
	rdfResArray4[3] = new art_semanticturkey.ARTURIResource("pippo4", "concept", "http://test#pippo4");
	rdfResArray4[4] = new art_semanticturkey.ARTURIResource("pippo5", "concept", "http://test#pippo5");
	rdfResArray4[5] = new art_semanticturkey.ARTURIResource("pippo6", "concept", "http://test#pippo6");
	rdfResArray4[6] = new art_semanticturkey.ARTBNode("_:p1");
	rdfResArray4[7] = new art_semanticturkey.ARTLiteral("Acqua", "", "it", false);
	rdfResArray4[8] = new art_semanticturkey.ARTLiteral("Water", "", "en", false);
	rdfResArray4[9] = new art_semanticturkey.ARTLiteral("cane", "", "sp", false);
	rdfResArray4[10] = new art_semanticturkey.ARTLiteral("123456", "http://type#integer", "", true);
	rdfResArray4[11] = new art_semanticturkey.ARTLiteral("food", "http://type@string", "", true);
	//widgetBoxOLW3.labelValue = "More Resources (predicate-objects-widget)";
	widgetBoxOLW4.operations = "add;remove";
	widgetBoxOLW4.rdfResourcesArray = rdfResArray4;
	widgetBoxOLW4.rdfSubject = new art_semanticturkey.ARTURIResource("subjectTest2", "concept", 
			"http://test#subjectTest2");
	widgetBoxOLW4.rdfPredicate = new art_semanticturkey.ARTURIResource("predicateTest2", "concept", 
			"http://test#predicateTest2");
	
	
	widgetBoxOLW4.addEventListener("rdfnodeBaseEvent", art_semanticturkey.rdfnodeBaseEventHandler);
	widgetBoxOLW4.addEventListener("rdfnodeContainerEvent", art_semanticturkey.rdfnodeContainerEventHandler, true);
	widgetBoxOLW4.addEventListener("predicateObjectsEvent", art_semanticturkey.predicateObjectsEventHandler);
	widgetBoxOLW4.setAttribute("class","predicate-objects-widget");
	tempBox.appendChild(widgetBoxOLW4);
	

	//widgetBoxOLW2.addEventListener("rdfnodeBaseEvent", function(e) {alert("evento rdfnodeBaseEvent")});
	//widgetBoxOLW2.addEventListener("dblclick", function(e) {alert("evento dblclick")});
	
}

art_semanticturkey.rdfnodeBaseEventHandler = function(event){
	var rdfResource = event.detail.rdfResource;
	var text = "double click on the resource ";
	if(rdfResource instanceof art_semanticturkey.ARTURIResource) {
		text += "ARTURIResource with"+
			"\n\tshow = "+rdfResource.getShow()+
			"\n\turi = "+ rdfResource.getURI();
	}else if(rdfResource instanceof art_semanticturkey.ARTLiteral){
		text += "ARTLiteral with"+
			"\n\tlabel = "+rdfResource.getLabel();
		if(rdfResource.isTypedLiteral())
			text += "\n\t datatype = "+rdfResource.getDatatype();
		else
			text += "\n\tlang = "+rdfResource.getLang();
	} else if(rdfResource instanceof art_semanticturkey.ARTBNode){
		text += "ARTBNode with"+
			"\n\tid = "+rdfResource.getId();
	}
	alert(text);
}


art_semanticturkey.rdfnodeContainerEventHandler = function(event){
	var button = event.detail.button;
	var rdfResource = event.detail.rdfResource;
	var text = "click on button with label "+button.label+" for the the resource ";
	if(rdfResource instanceof art_semanticturkey.ARTURIResource) {
		text += "ARTURIResource with"+
			"\n\tshow = "+rdfResource.getShow()+
			"\n\turi = "+ rdfResource.getURI();
	}else if(rdfResource instanceof art_semanticturkey.ARTLiteral){
		text += "ARTLiteral with"+
			"\n\tlabel = "+rdfResource.getLabel();
		if(rdfResource.isTypedLiteral())
			text += "\n\tdatatype = "+rdfResource.getDatatype();
		else
			text += "\n\tlang = "+rdfResource.getLang();
	} else if(rdfResource instanceof art_semanticturkey.ARTBNode){
		text += "ARTBNode with"+
			"\n\tid = "+rdfResource.getId();
	}
	alert(text);
}

art_semanticturkey.objectListEventHandler = function(event){
	var button = event.detail.button;
	var rdfResource = event.detail.rdfResource;
	var text = "click on button with label "+button.label+" for the the resource ";
	if(rdfResource instanceof art_semanticturkey.ARTURIResource) {
		text += "ARTURIResource with"+
			"\n\tshow = "+rdfResource.getShow()+
			"\n\turi = "+ rdfResource.getURI();
	}else if(rdfResource instanceof art_semanticturkey.ARTLiteral){
		text += "ARTLiteral with"+
			"\n\tlabel = "+rdfResource.getLabel();
		if(rdfResource.isTypedLiteral())
			text += "\n\tdatatype = "+rdfResource.getDatatype();
		else
			text += "\n\tlang = "+rdfResource.getLang();
	} else if(rdfResource instanceof art_semanticturkey.ARTBNode){
		text += "ARTBNode with"+
			"\n\tid = "+rdfResource.getId();
	}
	alert(text);
}

art_semanticturkey.predicateObjectsEventHandler = function(event){
	var button = event.detail.button;
	var rdfObject = event.detail.rdfObject;
	var text = "click on button with label "+button.label+" for the the resource ";
	
	if(typeof rdfObject != "undefined"){
		if(rdfObject instanceof art_semanticturkey.ARTURIResource) {
			text += "ARTURIResource with"+
				"\n\tshow = "+rdfObject.getShow()+
				"\n\turi = "+ rdfObject.getURI();
		}else if(rdfObject instanceof art_semanticturkey.ARTLiteral){
			text += "ARTLiteral with"+
				"\n\tlabel = "+rdfObject.getLabel();
			if(rdfObject.isTypedLiteral())
				text += "\n\tdatatype = "+rdfObject.getDatatype();
			else
				text += "\n\tlang = "+rdfObject.getLang();
		} else if(rdfObject instanceof art_semanticturkey.ARTBNode){
			text += "ARTBNode with"+
				"\n\tid = "+rdfObject.getId();
		}
		text += "\n";
	}
	
	var rdfSubject = event.detail.rdfSubject;
	if(typeof this.rdfSubject != "undefined" && 
			typeof this.rdfSubject.getShow() != "undefined" ){
		text += "\n\tSubject = "+rdfSubject.getShow()+
			"\n\t\tSubject URI = "+rdfSubject.getURI();
	}
	
	var rdfPredicate = event.detail.rdfPredicate;
	if(typeof this.rdfSubject != "undefined" && 
			typeof this.rdfSubject.getShow() != "undefined" ){
		text += "\n\tPredicate = "+rdfPredicate.getShow()+
			"\n\t\tPredicate URI = "+rdfPredicate.getURI();
	}
	
	alert(text);
}

art_semanticturkey.testFunc = function(){
	var mainBox = document.getElementById("mainBox");
	var child = mainBox.childNodes;
	var length = child.length;
	alert("maiBox = "+mainBox+"\nchild = "+child+"\nlenght = "+length);
	
	//anonButton = document.getAnonymousElementByAttribute(mainBox, "anonid", "buttonForRequest")
	//alert(anonButton.getAttribute("label"));
}