package it.uniroma2.art.semanticturkey.servlet.main.controllers;

import it.uniroma2.art.semanticturkey.plugin.extpts.PluginInterface;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.HttpServiceRequestWrapper;
import it.uniroma2.art.semanticturkey.servlet.JSONResponse;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.SerializationType;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.w3c.dom.Document;

@org.springframework.stereotype.Controller
public class Controller implements ApplicationContextAware {
	ApplicationContext context;
	protected static Logger logger = LoggerFactory.getLogger(Controller.class);
	// final static private HashMap<String, Class> map = new HashMap<String,
	// Class>();

	// final static private String setHttpServletRequest =
	// "setHttpServletRequest";
	// final static private String CXSLFactory = "CXSLFactory";
	// final static private String XMLData = "XMLData";

	public static final String pluginActivateRequest = "activate";
	public static final String pluginDeactivateRequest = "deactivate";

	// public static final boolean json_serialization = false;

	final private HashMap<String, PluginInterface> pluginsMap = new HashMap<String, PluginInterface>();

	/**
	 * retrieves the plugins from the Map
	 * 
	 * @param serviceName
	 * @return
	 */
	public PluginInterface getPlugins(String pluginName) {
		return pluginsMap.get(pluginName);
	}

	public void registerPlugin(String pluginId, PluginInterface plugin) {
		pluginsMap.put(pluginId, plugin);
	}
	@RequestMapping(value="/resources/{test}.jar")
	public String controlJars(HttpServletRequest oReq, HttpServletResponse oRes,@PathVariable("test") String test)
	{
		return test;
	}
	@RequestMapping(value="/resources/{test}.html")
	public String controlHtml(HttpServletRequest oReq, HttpServletResponse oRes,@PathVariable("test") String test)
	{
		return test;
	}

	/**
	 * Metodo che cattura la richiesta del servizio e i relativi parametri e
	 * invia la risposta in formato xml
	 * 
	 * @param HttpServletRequest
	 *            oReq
	 * @param HttpServletResponse
	 *            oRes
	 */
	@RequestMapping(value = "/resources/stserver/STServer")
	public void service(HttpServletRequest oReq, HttpServletResponse oRes)
			throws ServletException, IOException {

		System.out.println("response encoding: " + oRes.getCharacterEncoding());
		oRes.setCharacterEncoding("UTF-8");
		oRes.setHeader("Access-Control-Allow-Origin", "*");
		ServletOutputStream out;

		System.out.println("encoding: " + oRes.getCharacterEncoding());
		String serviceName = oReq.getParameter("service");

		Response response = null;
		SerializationType ser_type = (new HttpServiceRequestWrapper(oReq))
				.getAcceptContent();
		if (serviceName == null) {
			if (ser_type == SerializationType.json)
				oRes.setContentType("application/json");
			else
				oRes.setContentType("application/xml");
			out = oRes.getOutputStream();
			logger.debug(ServletUtilities
					.getService()
					.createExceptionResponse("",
							"you must specify a service to be invoked",
							ser_type).toString());
			out.print(ServletUtilities
					.getService()
					.createExceptionResponse("",
							"you must specify a service to be invoked",
							ser_type).toString());
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
				logger.debug(XMLHelp.XML2String(
						(Document) response.getResponseObject(), true));
				out = oRes.getOutputStream();
				XMLHelp.XML2OutputStream(
						(Document) response.getResponseObject(), true, out);
			}
		} else {
			if (ser_type == SerializationType.json)
				oRes.setContentType("application/json");
			else
				oRes.setContentType("application/xml");
			out = oRes.getOutputStream();
			out.print(ServletUtilities
					.getService()
					.createErrorResponse(oReq.getParameter("request"),
							"content of response is null", ser_type)
					.getResponseContent());
		}
	}

	private Response handlePluginRequest(HttpServletRequest oReq) {
		Response response = null;
		SerializationType ser_type = (new HttpServiceRequestWrapper(oReq))
				.getAcceptContent();
		if (ser_type != SerializationType.xml)
			return ServletUtilities.getService().createExceptionResponse(
					"plugin", "sorry this request can only be served in XML",
					ser_type);

		String pluginName = oReq.getParameter("name");
		PluginInterface plugin = pluginsMap.get(pluginName);
		logger.debug("identifying proper plugin...");
		if (plugin == null) {
			response = ServletUtilities.getService().createExceptionResponse(
					"plugin",
					"Unexpected Error:\n plugin: \"" + pluginName
							+ "\" has not been loaded into the system",
					ser_type);
		} else {
			String request = oReq.getParameter("request");
			if (request == null)
				response = ServletUtilities
						.getService()
						.createExceptionResponse(
								"plugin",
								"field: \"request\" is missing from current plugin request",
								ser_type);
			else if (request.equals(pluginActivateRequest)) {
				response = plugin.activate();
				if (response.isAffirmative()) {
					try {
						ProjectManager.getCurrentProject().registerPlugin(
								pluginName);
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
						ProjectManager.getCurrentProject().deregisterPlugin(
								pluginName);
					} catch (Exception e) {
						((ResponseREPLY) response)
								.setReplyStatusWARNING("the plugin has been successfully disposed, though there are some warnings reported while deregistering it from the current project:\n"
										+ e.toString());
					}
				}
			} else
				response = ServletUtilities.getService()
						.createExceptionResponse("plugin",
								"unknown plugin request", ser_type);
		}
		return response;
	}

	private Response handleServiceRequest(String serviceName,
			HttpServletRequest oReq) throws IOException {
		ServiceInterface service = null;
		Response response = null;
		SerializationType ser_type = (new HttpServiceRequestWrapper(oReq))
				.getAcceptContent();
		try {
//			serviceName = serviceName.substring(0, 1).toUpperCase()
//					+ serviceName.substring(1);
//			service = (ServiceInterface) context.getBean(Class
//					.forName("it.uniroma2.art.semanticturkey.servlet.main."
//							+ serviceName));
			Map<String, ServiceInterface> services = context.getBeansOfType(ServiceInterface.class);
			for (ServiceInterface s : services.values()) {
				if (s.getId().equalsIgnoreCase(serviceName)) {
					service = s;
					break;
				}
			}
			
			
			if (service==null) {
				Object binolo = context.getBean("thirdPartyServices");
				
				System.out.println("@@@@@" + binolo);
				if (binolo!=null) {
					System.out.println("@@@@@" + binolo.getClass().getCanonicalName());
					ServiceInterface si = ((List<ServiceInterface>)binolo).get(0);
					service = si;
				}
				
				
				
			}
			
			
			
			
			// service = (ServiceInterface) context.getBean(Class.forName(service.getClass().getCanonicalName()));
			System.out.println(" :" + service.getClass().getCanonicalName());
			
		} catch (BeansException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
//		catch (ClassNotFoundException e1) {
//			service = null;
//		}
		;

		logger.debug("identifying proper service for handling the request..");
		if (service == null) {
			response = ServletUtilities.getService().createExceptionResponse(
					"",
					"Unexpected Error:\n service: " + serviceName
							+ " has not been loaded into the system", ser_type);
		} else {
			try {
				logger.debug("handling the request.. for service: "
						+ serviceName + service.getClass().getCanonicalName());
				service.setServiceRequest(new HttpServiceRequestWrapper(oReq));
				response = service.getResponse();

			} catch (RuntimeException e) {
				logger.error(Utilities.printFullStackTrace(e));
				e.printStackTrace(System.err);
				String msg = "uncaught java exception: " + e.toString();
				response = ServletUtilities.getService().createErrorResponse(
						oReq.getParameter("request"), msg, ser_type);

			} catch (Error err) {
				String msg = "java error: " + err.toString();
				err.printStackTrace(System.err);
				logger.error(msg);
				response = ServletUtilities.getService().createErrorResponse(
						oReq.getParameter("request"), msg, ser_type);

			}
		}
		return response;
	}

	@Override
	public void setApplicationContext(ApplicationContext arg0)
			throws BeansException {
		context = arg0;

	}

}
