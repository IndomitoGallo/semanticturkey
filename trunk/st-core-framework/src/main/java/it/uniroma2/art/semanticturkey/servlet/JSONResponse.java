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

import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;

/**
 * Defines a JSON realization for Response interface
 * 
 * @autor Ramon Orrù
 * 
 */
public abstract class JSONResponse implements Response{

	JSONObject content;

	JSONResponse(String request) throws JSONException {
		content=new JSONObject();
		JSONObject response_element=new JSONObject();
		response_element.put(ServiceVocabulary.request,request);
		content.put(ServiceVocabulary.responseRoot,response_element);
	}
	
	JSONResponse(JSONObject content_par,String request) throws JSONException {
		content=content_par;
		JSONObject response_element=new JSONObject();
		response_element.put(ServiceVocabulary.request,request);
		content.put(ServiceVocabulary.responseRoot,response_element);
	}
	
	private JSONObject getJSONObject(){
		return content;
	}
	
	public JSONObject getResponseObject(){	
		return getJSONObject();
	}
	
	public String getResponseContent(){
		return this.toString();
	}
	
	public String toString() {
		try {
			return content.toString(3);
		} catch (JSONException e) {
			return e.getMessage();
		}
		
	}
	
	public String getXMLObject() throws JSONException{
		return XML.toString(content);
	} 
	
	public abstract boolean isAffirmative();
}
