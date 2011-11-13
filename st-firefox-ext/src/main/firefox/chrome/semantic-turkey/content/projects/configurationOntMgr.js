if (typeof art_semanticturkey == 'undefined') var art_semanticturkey = {};

Components.utils.import("resource://stmodules/Logger.jsm", art_semanticturkey);

window.onload = function(){
	//var shortName = window.arguments[0].shortName;
	//var editRequired = window.arguments[0].editRequired;
	//var typeOntMgr = window.arguments[0].tyoeOntMgr;
	//var parArray = window.arguments[0].parArray;
	
	art_semanticturkey.setNameValueParam();
	
	document.getElementById("saveConf").addEventListener("command", art_semanticturkey.saveConf, true);
	document.getElementById("cancel").addEventListener("command", art_semanticturkey.cancel, true);
	
};

art_semanticturkey.setNameValueParam = function(){
	var shortName = window.arguments[0].shortName;
	var parArray = window.arguments[0].parArray;
	
	var confLabel = document.getElementById("confLabel");
	var textLabel = "Configuration parameters for: "+shortName;
	confLabel.setAttribute("value", textLabel);
	var confRows = document.getElementById("confRows");
	for(var i=0; i<parArray.length; ++i){
		var row = document.createElement("row");
		row.setAttribute("tooltiptext", parArray[i].description);
		var rowLabel = document.createElement("label");
		var name = parArray[i].name;
		rowLabel.name = name;
		if(parArray[i].required == "true")
			name += "*:";
		else
			name += ":";
		rowLabel.setAttribute("value", name);
		row.appendChild(rowLabel);
		var textbox = document.createElement("textbox");
		textbox.setAttribute("value", parArray[i].value);
		row.appendChild(textbox);
		confRows.appendChild(row);
	}
};

art_semanticturkey.saveConf = function() {
	var confRows = document.getElementById("confRows");
	var rowList = confRows.getElementsByTagName("row");
	var parArray = window.arguments[0].parArray;
	for(var i=0; i<rowList.length; ++i){
		var row = rowList[i];
		if(parArray[i].required == "true"  && row.getElementsByTagName("textbox")[0].value==""){
			alert("Please add a value to all the required parameters");
			return;
		}
	}
	
	for(var i=0; i<rowList.length; ++i){
		var row = rowList[i];
		var value = row.getElementsByTagName("textbox")[0].value;
		parArray[i].value = value;
	}
	window.arguments[0].saved = true;
	close();
};


art_semanticturkey.cancel = function() {
	close();
};
