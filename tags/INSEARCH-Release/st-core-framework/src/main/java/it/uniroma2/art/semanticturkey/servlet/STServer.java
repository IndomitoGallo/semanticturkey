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

package it.uniroma2.art.semanticturkey.servlet;

import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.plugin.extpts.PluginInterface;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.SerializationType;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.IOException;
import java.util.HashMap;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;

/**
 * Http implementation of Semantic Turkey Service Based Architecture
 * 
 * @author Donato Griesi,<br/>
 *         Armando Stellato &lt;stellato@info.uniroma2.it&gt;,<br/>
 *         Andrea Turbati &lt;turbati@info.uniroma2.it&gt;
 * 
 */
@SuppressWarnings("serial")
public class STServer extends HttpServlet {
	@SuppressWarnings("unused")
	private ServletConfig oConfig;
	protected static Logger logger = LoggerFactory.getLogger(STServer.class);
	// final static private HashMap<String, Class> map = new HashMap<String, Class>();

	// final static private String setHttpServletRequest = "setHttpServletRequest";
	// final static private String CXSLFactory = "CXSLFactory";
	// final static private String XMLData = "XMLData";

	public static final String pluginActivateRequest = "activate";
	public static final String pluginDeactivateRequest = "deactivate";

	// public static final boolean json_serialization = false;

	final private HashMap<String, PluginInterface> pluginsMap = new HashMap<String, PluginInterface>();
	final private HashMap<String, ServiceInterface> servicesMap = new HashMap<String, ServiceInterface>();

	/**
	 * retrieves the initialized services from the Map
	 * 
	 * @param serviceName
	 * @return
	 */
	public ServiceInterface getServices(String serviceName) {
		return servicesMap.get(serviceName);
	}

	/**
	 * retrieves the plugins from the Map
	 * 
	 * @param serviceName
	 * @return
	 */
	public PluginInterface getPlugins(String pluginName) {
		return pluginsMap.get(pluginName);
	}

	public void registerService(String serviceId, ServiceInterface service) {
		servicesMap.put(serviceId, service);
	}

	public void registerPlugin(String pluginId, PluginInterface plugin) {
		pluginsMap.put(pluginId, plugin);
	}

	/**
	 * Metodo che riempe una struttura HashMap con i servizi disponibili
	 * 
	 * @param ServletConfig
	 *            config
	 */
	public void init(ServletConfig config) throws ServletException {
		super.init(config);

		// Loads services into the services map
		PluginManager.loadExtensions(this);

		logger.debug("Init STServer ");
		oConfig = config;
	}

	/**
	 * Metodo che cattura la richiesta del servizio e i relativi parametri e invia la risposta in formato xml
	 * 
	 * @param HttpServletRequest
	 *            oReq
	 *@param HttpServletResponse
	 *            oRes
	 */
	public void service(HttpServletRequest oReq, HttpServletResponse oRes) throws ServletException,
			IOException {

		System.out.println("response encoding: " + oRes.getCharacterEncoding());
		oRes.setCharacterEncoding("UTF-8");
		oRes.setHeader("Access-Control-Allow-Origin", "*");
		ServletOutputStream out;

		System.out.println("encoding: " + oRes.getCharacterEncoding());
		String serviceName = oReq.getParameter("service");

		Response response = null;
		SerializationType ser_type = (new HttpServiceRequestWrapper(oReq)).getAcceptContent();
		if (serviceName == null) {
			if (ser_type == SerializationType.json)
				oRes.setContentType("application/json");
			else
				oRes.setContentType("application/xml");
			out = oRes.getOutputStream();
			logger.debug(ServletUtilities.getService().createExceptionResponse("",
					"you must specify a service to be invoked", ser_type).toString());
			out.print(ServletUtilities.getService().createExceptionResponse("",
					"you must specify a service to be invoked", ser_type).toString());
			return;
		} else if (serviceName.equals("plugin")) {
			response = handlePluginRequest(oReq);
		} else {
			response = handleServiceRequest(serviceName, oReq);
		}

		logger.debug("analyzing response type");

		if (response != null) {
			if (response instanceof JSONResponse) {
				oRes.setContentType("application/json");
				logger.debug(response.getResponseContent());
				out = oRes.getOutputStream();
				out.print(response.getResponseContent());
			} else {
				oRes.setContentType("application/xml");
				logger.debug(XMLHelp.XML2String((Document) response.getResponseObject(), true));
				out = oRes.getOutputStream();
				XMLHelp.XML2OutputStream((Document) response.getResponseObject(), true, out);
			}
		} else {
			if (ser_type == SerializationType.json)
				oRes.setContentType("application/json");
			else
				oRes.setContentType("application/xml");
			out = oRes.getOutputStream();
			out.print(ServletUtilities.getService().createErrorResponse(oReq.getParameter("request"),
					"content of response is null", ser_type).getResponseContent());
		}
	}

	private Response handlePluginRequest(HttpServletRequest oReq) {
		Response response = null;
		SerializationType ser_type = (new HttpServiceRequestWrapper(oReq)).getAcceptContent();
		if (ser_type != SerializationType.xml)
			return ServletUtilities.getService().createExceptionResponse("plugin",
					"sorry this request can only be served in XML", ser_type);

		String pluginName = oReq.getParameter("name");
		PluginInterface plugin = pluginsMap.get(pluginName);
		logger.debug("identifying proper plugin...");
		if (plugin == null) {
			response = ServletUtilities.getService().createExceptionResponse("plugin",
					"Unexpected Error:\n plugin: \"" + pluginName + "\" has not been loaded into the system",
					ser_type);
		} else {
			String request = oReq.getParameter("request");
			if (request == null)
				response = ServletUtilities.getService().createExceptionResponse("plugin",
						"field: \"request\" is missing from current plugin request", ser_type);
			else if (request.equals(pluginActivateRequest)) {
				response = plugin.activate();
				if (response.isAffirmative()) {
					try {
						ProjectManager.getCurrentProject().registerPlugin(pluginName);
					} catch (Exception e) {
						((ResponseREPLY) response)
								.setReplyStatusWARNING("the plugin has been successfully initialized, though there are some warnings reported while associating it to the current project:\n"
										+ e.toString());
					}
				}
			} else if (request.equals(pluginDeactivateRequest)) {
				response = plugin.deactivate();
				if (response.isAffirmative()) {
					try {
						ProjectManager.getCurrentProject().deregisterPlugin(pluginName);
					} catch (Exception e) {
						((ResponseREPLY) response)
								.setReplyStatusWARNING("the plugin has been successfully disposed, though there are some warnings reported while deregistering it from the current project:\n"
										+ e.toString());
					}
				}
			} else
				response = ServletUtilities.getService().createExceptionResponse("plugin",
						"unknown plugin request", ser_type);
		}
		return response;
	}

	private Response handleServiceRequest(String serviceName, HttpServletRequest oReq) throws IOException {
		ServiceInterface service = null;
		Response response = null;
		SerializationType ser_type = (new HttpServiceRequestWrapper(oReq)).getAcceptContent();
		service = servicesMap.get(serviceName);

		logger.debug("identifying proper service for handling the request..");
		if (service == null) {
			response = ServletUtilities.getService().createExceptionResponse("",
					"Unexpected Error:\n service: " + serviceName + " has not been loaded into the system",
					ser_type);
		} else {
			try {
				logger.debug("handling the request.. for service: " + serviceName);
				service.setServiceRequest(new HttpServiceRequestWrapper(oReq));
				response = service.getResponse();

			} catch (RuntimeException e) {
				logger.error(Utilities.printFullStackTrace(e));
				e.printStackTrace(System.err);
				String msg = "uncaught java exception: " + e.toString();
				response = ServletUtilities.getService().createErrorResponse(oReq.getParameter("request"),
						msg, ser_type);

			} catch (Error err) {
				String msg = "java error: " + err.toString();
				err.printStackTrace(System.err);
				logger.error(msg);
				response = ServletUtilities.getService().createErrorResponse(oReq.getParameter("request"),
						msg, ser_type);

			}
		}
		return response;
	}

}
