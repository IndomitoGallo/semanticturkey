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
		ServletOutputStream out = oRes.getOutputStream();

		System.out.println("encoding: " + oRes.getCharacterEncoding());
		String serviceName = oReq.getParameter("service");

		Response xml = null;

		if (serviceName == null) {
			logger.debug(ServletUtilities.getService().createExceptionResponse("",
					"you must specify a service to be invoked").toString());
			out.print(ServletUtilities.getService().createExceptionResponse("",
					"you must specify a service to be invoked").toString());
			return;
		} else if (serviceName.equals("plugin")) {
			xml = handlePluginRequest(oReq, out);
		} else {
			xml = handleServiceRequest(serviceName, oReq, out);
		}

		logger.debug("analyzing response type");

		if (oReq.getContentType() == null || oReq.getContentType().equals("application/xml")
				|| oReq.getContentType().startsWith("application/x-www-form-urlencoded")) {
			if (xml != null) {
				if (xml.getXML() != null) {

					// System.out.println("test printing on console: " +
					// "Αὐνῆς τοπογραμματεὺς τῶν περὶ Βουσῖριν τοῖς ἀπ᾽ Ὀννέους ");

					// do not use the following line since it is not robust wrt encoding settings of the JVM
					// out.print(XMLHelp.XML2String(xml.getXML(), true));
					// use XML2OutputStream instead

					XMLHelp.XML2OutputStream(xml.getXML(), true, out);
				}

				else
					out.print(ServletUtilities.getService().createErrorResponse(oReq.getParameter("request"),
							"xml content of response is null").toString());
			} else
				out.print(ServletUtilities.getService().createErrorResponse(oReq.getParameter("request"),
						"response is null").toString());
		}

		// this one is disabled at the moment
		else {
			try {
				// Class<?>[] parameters = new Class[0];
				try {
					// CXSLMethod = serviceClass.getMethod(CXSLFactory, parameters);
				} catch (SecurityException e) {
					logger.error(e + Utilities.printStackTrace(e));
					e.printStackTrace();
					out.print(XMLHelp.XML2String(ServletUtilities.getService()
							.createExceptionResponse(
									"",
									"Content-type: " + oReq.getContentType()
											+ " is not accepted by this application").getXML(), true));
				}
				/*
				 * catch (NoSuchMethodException e) { s_logger.error(e + Utilities.printStackTrace(e));
				 * e.printStackTrace(); }
				 */
				// XSL = (CXSL) CXSLMethod.invoke(null, (Object[])null);
			} catch (IllegalArgumentException e) {
				logger.error(e + Utilities.printStackTrace(e));
				e.printStackTrace();
			}
			// XSL.apply(xml.getXML(), out);
		}

	}

	private Response handlePluginRequest(HttpServletRequest oReq, ServletOutputStream out) {
		Response xml = null;
		String pluginName = oReq.getParameter("name");
		PluginInterface plugin = pluginsMap.get(pluginName);
		logger.debug("identifying proper plugin...");
		if (plugin == null) {
			xml = ServletUtilities.getService().createExceptionResponse("plugin",
					"Unexpected Error:\n plugin: \"" + pluginName + "\" has not been loaded into the system");
		} else {
			String request = oReq.getParameter("request");
			if (request == null)
				xml = ServletUtilities.getService().createExceptionResponse("plugin",
						"field: \"request\" is missing from current plugin request");
			else if (request.equals(pluginActivateRequest)) {
				xml = plugin.activate();
				if (xml.isAffirmative()) {
					try {
						ProjectManager.getCurrentProject().registerPlugin(pluginName);
					} catch (Exception e) {
						((ResponseREPLY) xml)
								.setReplyStatusWARNING("the plugin has been successfully initialized, though there are some warnings reported while associating it to the current project:\n"
										+ e.toString());
					}
				}
			} else if (request.equals(pluginDeactivateRequest)) {
				xml = plugin.deactivate();
				if (xml.isAffirmative()) {
					try {
						ProjectManager.getCurrentProject().deregisterPlugin(pluginName);
					} catch (Exception e) {
						((ResponseREPLY) xml)
								.setReplyStatusWARNING("the plugin has been successfully disposed, though there are some warnings reported while deregistering it from the current project:\n"
										+ e.toString());
					}
				}
			} else
				xml = ServletUtilities.getService().createExceptionResponse("plugin",
						"unknown plugin request");
		}
		return xml;
	}

	private Response handleServiceRequest(String serviceName, HttpServletRequest oReq, ServletOutputStream out)
			throws IOException {
		ServiceInterface service = null;
		Response xml = null;
		service = servicesMap.get(serviceName);

		logger.debug("identifying proper service for handling the request..");
		if (service == null) {
			xml = ServletUtilities.getService().createExceptionResponse("",
					"Unexpected Error:\n service: " + serviceName + " has not been loaded into the system");
		} else {
			try {
				logger.debug("handling the request..");
				service.setServiceRequest(new HttpServiceRequestWrapper(oReq));
				xml = service.getResponse();
			} catch (RuntimeException e) {
				logger.error(Utilities.printFullStackTrace(e));
				e.printStackTrace(System.err);
				String msg = "uncaught java exception: " + e.toString();
				xml = ServletUtilities.getService().createErrorResponse(oReq.getParameter("request"), msg);
			} catch (Error err) {
				String msg = "java error: " + err.toString();
				err.printStackTrace(System.err);
				logger.error(msg);
				xml = ServletUtilities.getService().createErrorResponse(oReq.getParameter("request"), msg);
			}
		}
		return xml;
	}

}
