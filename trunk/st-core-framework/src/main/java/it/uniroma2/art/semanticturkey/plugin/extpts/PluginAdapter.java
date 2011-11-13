/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License");  you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * http//www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 *
 * The Original Code is Semantic Turkey.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2009.
 * All Rights Reserved.
 *
 * Semantic Turkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about Semantic Turkey can be obtained at 
 * http://semanticturkey.uniroma2.it
 *
 */

package it.uniroma2.art.semanticturkey.plugin.extpts;

import it.uniroma2.art.semanticturkey.exceptions.PluginDisposedException;
import it.uniroma2.art.semanticturkey.exceptions.PluginInitializationException;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.STServer;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;

/**
 * @author Armando Stellato
 *
 */
public abstract class PluginAdapter implements PluginInterface {

	protected String id = null;
	protected boolean active = false;
	protected String activationMessage = null;

	public PluginAdapter(String id) {
		this.id = id;
	}

	public boolean isActive() {
		return active;
	}

	public Response deactivate() {
		activationMessage = null;
		try {
			if (dispose()) {
				active=false;
				if (activationMessage == null)
					return ServletUtilities.getService().createReplyResponse(STServer.pluginDeactivateRequest,
							RepliesStatus.ok);
				else
					return ServletUtilities.getService().createReplyResponse(STServer.pluginDeactivateRequest,
							RepliesStatus.warning, activationMessage);
			} else
				return ServletUtilities.getService().createReplyResponse(STServer.pluginDeactivateRequest,
						RepliesStatus.fail, activationMessage);

		} catch (PluginDisposedException e) {
			return ServletUtilities.getService().createExceptionResponse(STServer.pluginDeactivateRequest,
					e.toString());
		}
	}

	public Response activate() {
		activationMessage = null;
		try {
			if (initialize()) {
				active=true;
				if (activationMessage == null)
					return ServletUtilities.getService().createReplyResponse(STServer.pluginActivateRequest,
							RepliesStatus.ok);
				else
					return ServletUtilities.getService().createReplyResponse(STServer.pluginActivateRequest,
							RepliesStatus.warning, activationMessage);
			} else
				return ServletUtilities.getService().createReplyResponse(STServer.pluginActivateRequest,
						RepliesStatus.fail, activationMessage);

		} catch (PluginInitializationException e) {
			return ServletUtilities.getService().createExceptionResponse(STServer.pluginActivateRequest,
					e.toString());
		}
	}

	public String getId() {
		return id;
	}

	protected void setInitializationMessage(String msg) {
		activationMessage = msg;
	}

	public abstract boolean initialize() throws PluginInitializationException;

	public abstract boolean dispose() throws PluginDisposedException;
}
