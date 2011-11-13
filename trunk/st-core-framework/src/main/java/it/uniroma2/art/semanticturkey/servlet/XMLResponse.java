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

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.servlet;

import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

//Ramon Orrù (2010): import necessari per metodo getJSONObject
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;

//Ramon Orrù (2010) : modifica per introduzione nuova gerarchia Response
public abstract class XMLResponse implements Response {

	Document content;
	
	XMLResponse(Document xml, String request) {
		this.content = xml;
		Element responseElement;
		responseElement = xml.createElement(ServiceVocabulary.responseRoot);
		responseElement.setAttribute(ServiceVocabulary.request, request);
		xml.appendChild(responseElement);
	}
	
	XMLResponse(String request) {
		Element responseElement;
		responseElement = content.createElement(ServiceVocabulary.responseRoot);
		responseElement.setAttribute(ServiceVocabulary.request, request);
		content.appendChild(responseElement);
	}

	private Document getXML() {
		return content;
	}
	
	public Document getResponseObject(){
		return getXML();
	} 
	
	/**
	 * this method create a  JSONObject {@link JSONObject} representation
	 * 
	 * @author Ramon Orrù
	 * 
	 * @return JSONObject {@link JSONObject } containing JSON representation of content field
	 * @throws JSONException 
	 */ 
	public JSONObject getJSONObject() throws JSONException {	
		return XML.toJSONObject(this.toString());
	}
	
	public String toString() {
		return XMLHelp.XML2String(content, true);
	}
	
	 public String getResponseContent(){
		 return toString();
	 }
	
	public Element getResponseElement() {
		return (Element) content.getElementsByTagName(ServiceVocabulary.responseRoot).item(0);
	}
	
	public abstract  boolean isAffirmative();
	
}
