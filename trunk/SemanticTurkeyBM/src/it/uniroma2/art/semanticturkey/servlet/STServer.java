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
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about SemanticTurkey can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

package it.uniroma2.art.semanticturkey.servlet;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.TransformerException;

import org.apache.log4j.Logger;


import org.osgi.framework.Bundle;
import org.osgi.framework.BundleEvent;
import org.w3c.dom.Document;

/**Classe che effettua la mappatura dei servizi forniti dal server associando il servizio alla classe 
 * servlet relativa e fornisce il metodo service per l'invocazione delle servlet*/
/**
 * @author Donato Griesi
 * Contributor(s): Andrea Turbati
 *
 */
@SuppressWarnings("serial")
public class STServer extends HttpServlet {
	@SuppressWarnings("unused")
    private ServletConfig oConfig;
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);
	//final static private HashMap<String, Class> map = new HashMap<String, Class>();
	final public String XSLpath = Resources.getXSLDirectoryPath() + "bank.xsl";
	//final static private String setHttpServletRequest = "setHttpServletRequest";
	//final static private String CXSLFactory = "CXSLFactory";
	//final static private String XMLData = "XMLData";	
	@SuppressWarnings("unused")
    private HttpServletRequest _oReq = null;
	
	final private HashMap<String, InterfaceServiceServlet> map = new HashMap<String, InterfaceServiceServlet>();
	
	
	/**Metodo che riempe una struttura HashMap con i servizi disponibili
	 *@param ServletConfig config*/
	public void init(ServletConfig config) throws ServletException {
	    super.init(config);
	    
	    // Carico la HashMap con le informazioni prese dai bundle tramite felix
	    PluginManager.loadServletExtensionsIntoMap(map);
	    	    
	    
	    s_logger.debug("Init STServer ");
	    oConfig = config;	  	  
	}
	
	/**Metodo che cattura la richiesta del servizio e i relativi parametri e invia la risposta in formato xml
	 *@param HttpServletRequest oReq
	 *@param HttpServletResponse oRes */
	public void service(HttpServletRequest oReq, HttpServletResponse oRes) throws ServletException, IOException {								
		CXSL XSL = null;
		Document xml = null;		
		
		ServletOutputStream out = oRes.getOutputStream();					
		String service = oReq.getParameter("service");
		InterfaceServiceServlet serviceClass = null; 
		//Class serviceClass; 
		if (service == null){
			//serviceClass = this.getClass();
			//TODO da vedere cosa va qui
		}
		else {
			serviceClass = (InterfaceServiceServlet)map.get(service);
		}
								
		//Method setHttpServletRequestMethod = null;
		//Method CXSLMethod = null;
		//Method XMLDataMethod = null;		
		try {			
			Class[] parameters = new Class[1];
			parameters[0] = HttpServletRequest.class;			
			//setHttpServletRequestMethod = serviceClass.getMethod(setHttpServletRequest, parameters);			
			parameters = new Class[0];			
			//XMLDataMethod = serviceClass.getMethod(XMLData, parameters);
		} catch (SecurityException e) {				
			s_logger.error(e + Utilities.printStackTrace(e));
			e.printStackTrace();
		} 
		/*catch (NoSuchMethodException e) {				
			s_logger.error(e + Utilities.printStackTrace(e));
			e.printStackTrace();
		}*/
		try {
			Object[] parameters = { oReq };
			serviceClass.setHttpServletRequest(oReq);
			//setHttpServletRequestMethod.invoke(null, parameters);
			xml = serviceClass.XMLData();
			//xml = (Document) XMLDataMethod.invoke(null, (Object[])null);									
		} catch (IllegalArgumentException e) {				
			s_logger.error(e + Utilities.printStackTrace(e));
			e.printStackTrace();
		} 
		/*catch (IllegalAccessException e) {				
			s_logger.error(e + Utilities.printStackTrace(e));
			e.printStackTrace();
		} catch (InvocationTargetException e) {				
			s_logger.error(e + Utilities.printStackTrace(e));
			e.printStackTrace();
		}*/
					
		if (oReq.getContentType() == null || oReq.getContentType().equals("application/xml")) {			
			if (xml != null) {				
				s_logger.debug("STServer1 "+XMLHelp.XML2String(xml, true));
				s_logger.debug(XMLHelp.XML2String(xml, true));
				out.print(XMLHelp.XML2String(xml, true));
			}
		}		
		//this one is disable at the moment 
		else {										
			try {								
				try {
					Class[] parameters = new Class[0];
					try {
						//CXSLMethod = serviceClass.getMethod(CXSLFactory, parameters);
					} catch (SecurityException e) {
                        s_logger.error(e + Utilities.printStackTrace(e));
						e.printStackTrace();
					} 
					/*catch (NoSuchMethodException e) {						
                        s_logger.error(e + Utilities.printStackTrace(e));
						e.printStackTrace();
					}*/
					XSL = serviceClass.CXSLFactory();
					//XSL = (CXSL) CXSLMethod.invoke(null, (Object[])null);
				} catch (IllegalArgumentException e) {					
					s_logger.error(e + Utilities.printStackTrace(e));
					e.printStackTrace();
				}
				/*catch (IllegalAccessException e) {
					s_logger.error(e + Utilities.printStackTrace(e));
					e.printStackTrace();
				} catch (InvocationTargetException e) {
					s_logger.error(e + Utilities.printStackTrace(e));
					e.printStackTrace();
				}*/				
				XSL.apply(xml, out);
			} catch (TransformerException e) {	
				s_logger.error(e + Utilities.printStackTrace(e));
				e.printStackTrace();
			}
		}				
	}
    
    
	public void setHttpServletRequest(HttpServletRequest oReq) {
		_oReq = oReq;
	}
	
	public  CXSL CXSLFactory() {
		CXSL XSL = null;
		try {
			XSL = new CXSL(XSLpath);
		} catch (TransformerConfigurationException e) {				
			s_logger.error(e);
			e.printStackTrace();
		}
		return XSL;
	}
    
}
