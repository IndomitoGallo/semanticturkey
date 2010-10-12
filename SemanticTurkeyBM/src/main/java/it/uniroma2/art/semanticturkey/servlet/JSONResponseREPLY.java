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

import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Defines a JSON serialization based REPLY response  
 * 
 * @autor Ramon Orrù
 * 
 */
public class JSONResponseREPLY extends JSONResponse implements ResponseREPLY {

	JSONResponseREPLY(JSONObject json_content, String request) throws JSONException {
		super(json_content, request);
		content.getJSONObject(ServiceVocabulary.responseRoot).put(ServiceVocabulary.responseType, ServiceVocabulary.type_reply);
		JSONObject reply_element=new JSONObject();
		JSONObject data_element=new JSONObject();
		content.getJSONObject(ServiceVocabulary.responseRoot).put(ServiceVocabulary.reply,reply_element);
		content.getJSONObject(ServiceVocabulary.responseRoot).put(ServiceVocabulary.data,data_element);
	}

	JSONResponseREPLY(JSONObject json_content, String request, RepliesStatus status) throws JSONException {
		this(json_content, request);
		setReplyStatus(status);
	}

	JSONResponseREPLY(JSONObject json_content, String request, RepliesStatus status, String msg) throws JSONException {
		this(json_content, request, status);		
		setReplyMessage(msg);
	}

	public void setReplyStatus(RepliesStatus reply) {		
		try {
			content.getJSONObject(ServiceVocabulary.responseRoot).getJSONObject(ServiceVocabulary.reply).put(ServiceVocabulary.status, reply.toString());
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public void setReplyStatusOK() {
		setReplyStatus(RepliesStatus.ok);
	}
	
//	Non sono sicuro che serva 
	public RepliesStatus getReplyStatus(){
		String status="";
		try {
			status = content.getJSONObject(ServiceVocabulary.responseRoot).getJSONObject(ServiceVocabulary.reply).getString (ServiceVocabulary.status);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		if(status.equals("fail"))
			return RepliesStatus.fail;
		if(status.equals("warning"))
			return RepliesStatus.warning;
		return RepliesStatus.ok;
	}

	public void setReplyStatusWARNING() {
		setReplyStatus(RepliesStatus.warning);
	}

	public void setReplyStatusWARNING(String msg) {
		setReplyStatusWARNING();
		setReplyMessage(msg);
	}

	public void setReplyStatusFAIL() {
		setReplyStatus(RepliesStatus.fail);
	}

	public void setReplyStatusFAIL(String msg) {
		setReplyStatusFAIL();
		setReplyMessage(msg);
	}

	public void setReplyMessage(String msg) {
		try {
			content.getJSONObject(ServiceVocabulary.responseRoot).getJSONObject(ServiceVocabulary.reply).put(ServiceVocabulary.msg,msg);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	public String getReplyMessage() {
		try {
			content.getJSONObject(ServiceVocabulary.responseRoot).getJSONObject(ServiceVocabulary.reply).getString(ServiceVocabulary.msg);
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return "";
	}

	public JSONObject getDataElement() throws JSONException {
		return content.getJSONObject(ServiceVocabulary.responseRoot).getJSONObject(ServiceVocabulary.data);
	}

	public boolean isAffirmative() {
		if (getReplyStatus().equals(RepliesStatus.ok) || getReplyStatus().equals(RepliesStatus.warning) )
			return true;
		return false;
	}

}
