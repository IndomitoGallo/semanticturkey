if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);
Components.utils.import("resource://stmodules/ARTResources.jsm", art_semanticturkey);

window.onload = function(){
	document.getElementById("explicitButton").addEventListener("command", art_semanticturkey.testFunc, true);
	var tempBox = document.getElementById("temp");
	
	//test to create a xul element, add the class to trigger the binding, add a complex javascript object
	// and then inside the widget try to obtain the object
	/*var widgetBox = document.createElement("box");
	tempBox.appendChild(widgetBox);
	var artURIRes = new art_semanticturkey.ARTURIResource("pippo", "concept", "http://test#pippo");
	widgetBox.rdfRes = artURIRes;
	widgetBox.rdfResInternal = artURIRes;
	widgetBox.setAttribute("class","testbutton");*/
	
	
	//test to add the new widget rdfnode-base-widget
	var widgetBox1 = document.createElement("box");
	widgetBox1.setAttribute("flex", "1");
	tempBox.appendChild(widgetBox1);
	var artURIRes = new art_semanticturkey.ARTURIResource("pippo", "concept", "http://test#pippo");
	widgetBox1.rdfResource = artURIRes;
	widgetBox1.operations = "remove";
	//widgetBox1.setAttribute("class","rdfnode-base-widget");
	widgetBox1.setAttribute("class","rdfnode-container-widget");
	
	var widgetBox2 = document.createElement("box");
	widgetBox2.setAttribute("flex", "1");
	tempBox.appendChild(widgetBox2);
	var artURIRes2 = new art_semanticturkey.ARTURIResource("topolino", "concept", "http://test#topolino");
	artURIRes2.explicit = false;
	widgetBox2.rdfResource = artURIRes2;
	widgetBox2.operations = "remove";
	//widgetBox2.setAttribute("class","rdfnode-base-widget");
	widgetBox2.setAttribute("class","rdfnode-container-widget");

	var widgetBox3 = document.createElement("box");
	widgetBox3.setAttribute("flex", "1");
	tempBox.appendChild(widgetBox3);
	var artURIRes3 = new art_semanticturkey.ARTURIResource("paperino", "cls", "http://test#paperino");
	artURIRes3.explicit = true;
	widgetBox3.rdfResource = artURIRes3;
	widgetBox3.operations = "remove";
	//widgetBox2.setAttribute("class","rdfnode-base-widget");
	widgetBox3.setAttribute("class","rdfnode-container-widget");
}


art_semanticturkey.testFunc = function(){
	var mainBox = document.getElementById("mainBox");
	var child = mainBox.childNodes;
	var length = child.length;
	alert("maiBox = "+mainBox+"\nchild = "+child+"\nlenght = "+length);
	mainBox.getValues();
	anonButton = document.getAnonymousElementByAttribute(mainBox, "anonid", "buttonForRequest")
	alert(anonButton.getAttribute("label"));
}