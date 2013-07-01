Components.utils.import("resource://stmodules/stEvtMgr.jsm");

var EXPORTED_SYMBOLS = [ "ST_started" ];

ST_started = new function() {
	var istarted = "false";
	this.getStatus = function() {
		return istarted;
	};
	this.setStatus = function() {
		istarted = "true";
		evtMgr.fireEvent("st_started");
	};
};