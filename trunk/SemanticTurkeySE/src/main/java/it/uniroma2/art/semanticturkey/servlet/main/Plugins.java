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

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.plugin.extpts.PluginInterface;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.Project;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Element;

public class Plugins extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(Plugins.class);
	ServletUtilities servletUtilities = ServletUtilities.getService();

	// requests
	public static class Req {
		public final static String getPluginListRequest = "getPluginList";
		public final static String getPluginsForProjectRequest = "getPluginsForProject";
	}

	// parameters
	public final static String projectNamePar = "name";

	// response tags
	public final static String pluginTag = "plugin";
	public final static String activeStatusTag = "active";

	public Plugins(String id) {
		super(id);
	}

	public Response getResponse() {
		String request = setHttpPar("request");
		try {
			if (request.equals(Req.getPluginListRequest)) {

				// remove this once it is being used by at least one request
				// it is here only for not removing the HTTPPar... exception
				checkRequestParametersAllNotNull();

				return getPluginsList();
			} else if (request.equals(Req.getPluginsForProjectRequest)) {
				String projectName = setHttpPar(projectNamePar);
				if (projectName == null)
					return getPluginsForCurrentProject();
				else
					return getPluginsForProject(projectName);
			}

			else
				return servletUtilities.createNoSuchHandlerExceptionResponse(request);
		} catch (HTTPParameterUnspecifiedException e) {
			return servletUtilities.createUndefinedHttpParameterExceptionResponse(request, e);
		}
	}

	/**
	 * gets the list of plugins installed in Semantic Turkey and, for each of them, tells whether they are
	 * active or not
	 * 
	 * @return
	 */
	public Response getPluginsList() {
		String request = Req.getPluginListRequest;
		logger.info("requested list of available plugins");

		ArrayList<PluginInterface> plugins = PluginManager.getPlugins();
		ResponseREPLY resp = ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
		Element dataElement = resp.getDataElement();
		for (PluginInterface plugin : plugins) {
			Element pluginElement = XMLHelp.newElement(dataElement, pluginTag, plugin.getId());
			pluginElement.setAttribute(activeStatusTag, Boolean.toString(plugin.isActive()));
		}

		return resp;
	}

	/**
	 * gets the list of plugins associated to the current project of Semantic Turkey
	 * 
	 * @return
	 */
	public Response getPluginsForCurrentProject() {
		return getPluginsForProject(ProjectManager.getCurrentProject());	
	}
	
	/**
	 * gets the list of plugins associated to the current project of Semantic Turkey
	 * 
	 * @return
	 */
	public Response getPluginsForProject(String projectName) {
		if (projectName.equals(ProjectManager.getCurrentProject().getName()))
			return getPluginsForCurrentProject();
		
		try {
			Project proj = ProjectManager.getProjectDescription(projectName);
			return getPluginsForProject(proj);
		} catch (Exception e) {
			logger.error("", e);
			return servletUtilities.createExceptionResponse(Req.getPluginsForProjectRequest, e.toString());
		}
	}	
	
	private Response getPluginsForProject(Project proj) {
		List<String> pluginIDs = proj.getRegisteredPlugins();
		ResponseREPLY resp = ServletUtilities.getService().createReplyResponse(Req.getPluginsForProjectRequest, RepliesStatus.ok);
		Element dataElement = resp.getDataElement();
		for (String pluginID : pluginIDs) {
			XMLHelp.newElement(dataElement, pluginTag, pluginID);
		}
		return resp;	
	}
	
}
