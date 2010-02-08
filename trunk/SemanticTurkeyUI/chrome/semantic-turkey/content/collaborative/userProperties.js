//Daniele Bagni, Marco Cappella (2009):script per la gestione degli utenti scelti per la visualizzazione delle risorse(colori inclusi)
 /*
  * The contents of this file are subject to the Mozilla Public License
  * Version 1.1 (the "License");  you may not use this file except in compliance
  * with the License.  You may obtain a copy of the License at
  * http://www.mozilla.org/MPL/
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
  * (art.uniroma2.it) at the University of Roma Tor Vergata (ART)
  * Current information about SemanticTurkey can be obtained at 
  * http://semanticturkey.uniroma2.it
  *
  */
var savefileUserProperites= "userProperties.txt";
var savefolderProperites ="SMProperties";
try {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
} catch (e) {
	alert("Permission to save file was denied.");
}
// get the path to the user's home (profile) directory
var DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
try { 
	pathUserProperites=(new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path; 
} catch (e) {
	alert("error");
}
// determine the file-separator

if (pathUserProperites.search(/\\/) != -1) {
	pathUserProperites = pathUserProperites + "\\";
	pathUserProperites = pathUserProperites + savefolderProperites;
	pathUserProperites = pathUserProperites + "\\";
} else {
	pathUserProperites = pathUserProperites + "/";
	pathUserProperites = pathUserProperites + savefolderProperites;
	pathUserProperites = pathUserProperites + "/";
}
savefileUserProperites = pathUserProperites+savefileUserProperites;

//Daniele Bagni, Marco Cappella (2009):legge il contenuto del file userproperties.txt
function readProperties() {
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to read file was denied.");
	}
	var file = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath( savefileUserProperites );
	if ( file.exists() == false ) {
		file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );

	}
	var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
		.createInstance( Components.interfaces.nsIFileInputStream );
	is.init( file,0x01, 00004, null);
	var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
		.createInstance( Components.interfaces.nsIScriptableInputStream );
	sis.init( is );
	var output = sis.read( sis.available() );
	return output;
}

//Daniele Bagni, Marco Cappella (2009):scrive su file il contenuto della stringa text
function saveProperties(text) {
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to save file was denied.");
	}
	var file = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath( savefileUserProperites );
	if ( file.exists() == false ) {
		alert( "Creating file... " );
		file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420 );
	}
	var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance( Components.interfaces.nsIFileOutputStream );
	/* Open flags 
	#define PR_RDONLY       0x01
	#define PR_WRONLY       0x02
	#define PR_RDWR         0x04
	#define PR_CREATE_FILE  0x08
	#define PR_APPEND      0x10
	#define PR_TRUNCATE     0x20
	#define PR_SYNC         0x40
	#define PR_EXCL         0x80
	*/
	/*
	** File modes ....
	**
	** CAVEAT: 'mode' is currently only applicable on UNIX platforms.
	** The 'mode' argument may be ignored by PR_Open on other platforms.
	**
	**   00400   Read by owner.
	**   00200   Write by owner.
	**   00100   Execute (search if a directory) by owner.
	**   00040   Read by group.
	**   00020   Write by group.
	**   00010   Execute by group.
	**   00004   Read by others.
	**   00002   Write by others
	**   00001   Execute by others.
	**
	*/
	outputStream.init( file, 0x04 | 0x08 | 0x20, 420, 0 );
	var result = outputStream.write( text, text.length );
	outputStream.close();

}

//Daniele Bagni, Marco Cappella (2009):scrive su file le tre liste riguardanti gli username e gli hash degli utenti registrati al tacchino e i colori associati ad ognuno('no' se le risorse dell'utente non devono essere visualizzate)
function writeProp(users,hash,colors){
	
	var text="";
	var count=0;
	for(count=0;count<users.length;count++){
		
		text=text+users[count]+","+hash[count]+":"+colors[count]+";\n";
	}
	saveProperties(text);
}

//Daniele Bagni, Marco Cappella (2009):legge da file le tre liste riguardanti gli username e gli hash degli utenti registrati al tacchino e i colori associati ad ognuno('no' se le risorse dell'utente non devono essere visualizzate)
function readProp(){
	var output = readProperties();
	var ii=0;
	var result = new Object();
	var users = new Array();
	var hash = new Array();
	var colors = new Array();
	var numrow=0;
	var chrow=0;
	for(ii=0;ii<output.length;ii++){
		var ch = output.substring(ii,ii+1);
		var numch;
		if(ch==","){
			numch=ii+1;
			users[numrow]=output.substring(chrow,ii);
		}
		if(ch==":"){
			
			hash[numrow]=output.substring(numch,ii);
			numch=ii+1;
		}
		if(ch==";"){
			colors[numrow]=output.substring(numch,ii);
			chrow=ii+2;
			numrow++;	
			
		}
	}
	result.users = users;
	result.hash = hash;
	result.colors= colors;
	return result;
}