/**
 * @author NScarpato
 * @date 19-12-2008
 * @param url:
 *            string that represent the selected url
 * @description open selected url in a new tab
 */
function openUrl(url) {
	close();
	var win = Components.classes['@mozilla.org/appshell/window-mediator;1']
			.getService(Components.interfaces.nsIWindowMediator)
			.getMostRecentWindow('navigator:browser');
	win.openUILinkIn(url, "tab");
}