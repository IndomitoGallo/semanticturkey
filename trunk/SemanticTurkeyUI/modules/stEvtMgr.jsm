//package modules;
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

Components.utils.import("resource://stmodules/Logger.jsm");

var EXPORTED_SYMBOLS = [ "evtMgr" ];

evtMgr = new function() {
	// multidimensional array (The first level is an associative array, while the second level ha classic integer indexes)
	// It holds the handlers for the events. The indexes of the associative
	// array are the id of the events
	var arrayEvent = new Array();

	// This attributes it's used to remember the index of the object which
	// caused the exception in the tryFireEvent method
	var lastPos = 0;

	// This attributes it's used to know if the tryFireEvent ended without an
	// exception
	//var varBool;

	// This method sends the event to every object that is waiting
	this.fireEvent = function(eventId, objectCont) {
		Logger.debug("[stEvtMgr.jsm] firing event : "+eventId);
		var firingEventComplete = false;
		while (firingEventComplete == false) {
			firingEventComplete = tryFireEvent(eventId, objectCont);
		}
	};

	//This function tries to lunch an event, if an object in the array is not reachable, it is deleted, and the function
	// return false. Otherwise it returns true
	var tryFireEvent = function(eventId, objectCont) {

		var arrayListener = arrayEvent[eventId];
		try {
			if (arrayListener != null) {
				for (var cont = lastPos; cont < arrayListener.length; ++cont) {
					arrayListener[cont].eventHappened(eventId, objectCont);
				}
			}
			lastPos = 0;
		} catch (err) {
			//remove the istance that caused the exception from the array
			arrayEvent[eventId] = arrayListener.slice(0, cont).concat(
					arrayListener.slice(cont + 1));
			lastPos = cont; // now lastPos point to the element after the one that coused the exception
			return false;
		}
		return true;
	};

	// This method it's used to register an handler for a particular events identified by eventId
	this.registerForEvent = function(eventId, handler) {
		if (typeof arrayEvent[eventId] == 'undefined') {
			arrayEvent[eventId] = new Array;
		}
		arrayEvent[eventId].push(handler);
	};

	// This method it's used to deregister an handler for a particular events identified by eventId
	this.deregisterForEvent = function(eventId, handler) {
		var arrayListener = arrayEvent[eventId];
		if (arrayListener != null) {
			for ( var cont = 0; cont < arrayListener.length; ++cont) {
				var listener = arrayListener[cont];
				if (listener == handler) {
					arrayEvent[eventId] = arrayListener.slice(0, cont).concat(
							arrayListener.slice(cont + 1));
				}
			}
		}
	};

	// This method return all the event id and the numbers of handlers associaterd with each eventId (eventId -> number_of_Handler)
	this.getAllEventId = function() {
		var listIDs = "";
		for ( var id in arrayEvent) {
			listIDs += "\n" + id + " -> " + arrayEvent[id].length;
		}
		return listIDs;
	};

};

