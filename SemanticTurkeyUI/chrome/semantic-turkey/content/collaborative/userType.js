//Daniele Bagni, Marco Cappella (2009):script per leggere e memorizzare username,password e tipo dell'utente attualmente loggato al tacchino
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
var savefileUser= "userType.txt";
var savefolderUserr ="SMProperties";

try {
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
} catch (e) {
	alert("Permission to save file was denied.");
}
// get the path to the user's home (profile) directory
var DIR_SERVICE = new Components.Constructor("@mozilla.org/file/directory_service;1","nsIProperties");
try { 
	pathUserr=(new DIR_SERVICE()).get("ProfD", Components.interfaces.nsIFile).path; 
} catch (e) {
	alert("error");
}
// determine the file-separator

if (pathUserr.search(/\\/) != -1) {
	pathUserr = pathUserr + "\\";
	pathUserr = pathUserr + savefolderUserr;
	pathUserr = pathUserr + "\\";
} else {
	pathUserr = pathUserr + "/";
	pathUserr = pathUserr + savefolderUserr;
	pathUserr = pathUserr + "/";
}
savefileUser = pathUserr+savefileUser;

//Daniele Bagni, Marco Cappella (2009):legge il contenuto del file
function readUser() {
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to read file was denied.");
	}
	var file = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath( savefileUser );
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

//Daniele Bagni, Marco Cappella (2009):scrive su file la stringa text
function saveUser(text) {
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	} catch (e) {
		alert("Permission to save file was denied.");
	}
	var file = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath( savefileUser );
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
//Daniele Bagni, Marco Cappella (2009):legge da file l'username dell'utente attualmente loggato
function readUserName(){
	var output = readUser();
	var username=output.substring(0,output.indexOf("-"));
	return username;
}
//Daniele Bagni, Marco Cappella (2009):legge da file il tipo dell'utente attualmente loggato
function readUserType(){
	var output = readUser();
	var usertype=output.substring(output.indexOf("-")+1,output.indexOf(":"));
	return usertype;
}
//Daniele Bagni, Marco Cappella (2009):legge da file l'hash dell'utente attualmente loggato
function readUserHash(){
	var output = readUser();
	var userhash=output.substring(output.indexOf(":")+1);
	return userhash;
}

//Daniele Bagni, Marco Cappella (2009):scrive su file l'username dell'utente attualmente loggato
function saveUserName(username){
	
	var userType= readUserType();
	var userHash= readUserHash();
	var text = username+"-"+userType+":"+userHash;
	saveUser(text);
}
//Daniele Bagni, Marco Cappella (2009):scrive su file il tipo dell'utente attualmente loggato
function saveUserType(userType){
	var username= readUserName();
	var userHash= readUserHash();
	var text = username+"-"+userType+":"+userHash;
	saveUser(text);
}
//Daniele Bagni, Marco Cappella (2009):scrive su file l'hash dell'utente attualmente loggato
function saveUserHash(userHash){
	var username= readUserName();
	var userType= readUserType();
	var text = username+"-"+userType+":"+userHash;
	saveUser(text);
}
//Daniele Bagni, Marco Cappella (2009):formatta il file per una successiva scrittura
function format(){
	
	saveUser("-:");	
}