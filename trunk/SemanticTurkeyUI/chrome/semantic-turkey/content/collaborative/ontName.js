//Daniele Bagni, Marco Cappella (2009): script per la memorizzazione e lettura del nome dell'ontologia su file
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
var savefileOnt= "ontName.txt";
var savefolderOnt ="SMProperties";

try {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
} catch (e) {
	alert("Permission to save file was denied.");
}
// get the path to the user's home (profile) directory
var DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
try { 
	pathOnt=(new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path; 
} catch (e) {
	alert("error");
}
// determine the file-separator

if (pathOnt.search(/\\/) != -1) {
	pathOnt = pathOnt + "\\";
	pathOnt = pathOnt + savefolderOnt;
	pathOnt = pathOnt + "\\";
} else {
	pathOnt = pathOnt + "/";
	pathOnt = pathOnt + savefolderOnt;
	pathOnt = pathOnt + "/";
}
savefileOnt = pathOnt+savefileOnt;

//Daniele Bagni, Marco Cappella (2009): lettura da file del nome dell'ontologia correntemente usata
function readOnt() {
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to read file was denied.");
	}
	var file = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath( savefileOnt );
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

//Daniele Bagni, Marco Cappella (2009): scrittura su file del nome dell'ontologia correntemente usata
function saveOnt(text) {
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to save file was denied.");
	}
	var file = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath( savefileOnt );
	if ( file.exists() == false ) {
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
