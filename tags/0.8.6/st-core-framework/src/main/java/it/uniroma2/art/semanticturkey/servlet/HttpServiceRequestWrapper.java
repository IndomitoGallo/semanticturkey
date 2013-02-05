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
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

  /**
   * @author: Armando Stellato stellato@info.uniroma2.it
   * @author: Andrea Turbati turbati@info.uniroma2.it
  */
package it.uniroma2.art.semanticturkey.servlet;

import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.SerializationType;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public class HttpServiceRequestWrapper implements ServiceRequest {

	HttpServletRequest _oReq;
	
	HttpServiceRequestWrapper(HttpServletRequest oReq) {
		_oReq = oReq;
	}
	
	public String getParameter(String parName) {
		return _oReq.getParameter(parName);
	}

	@SuppressWarnings("unchecked")
	public Map<String, String> getParameterMap() {
		return (Map<String, String>)_oReq.getParameterMap();
	}

	public HttpServletRequest getHttpRequest() {
		return _oReq;
	}
	
	/**
	 * This method analyze the Header Accept to find out which type of response
	 * the client wants. The XML one is the default one. 
	 */
	public SerializationType getAcceptContent() {
		String acceptContent = _oReq.getHeader("Accept");
		if(acceptContent == null)
			return SerializationType.xml;
		if(acceptContent.contains("application/xml"))
			return SerializationType.xml;
		else if(acceptContent.contains("application/json"))
			return SerializationType.json;
		else
			return SerializationType.xml;
	}
	
}
