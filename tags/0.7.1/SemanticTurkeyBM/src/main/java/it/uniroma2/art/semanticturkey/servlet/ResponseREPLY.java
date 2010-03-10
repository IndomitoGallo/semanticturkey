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

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class ResponseREPLY extends Response {

	Element replyElement;
	Element dataElement;
	RepliesStatus replyStatus;

	ResponseREPLY(Document xml, String request) {
		super(xml, request);
		responseElement.setAttribute(ServiceVocabulary.responseType, ServiceVocabulary.type_reply);
		replyElement = xml.createElement(ServiceVocabulary.reply);
		responseElement.appendChild(replyElement);		
		dataElement = xml.createElement(ServiceVocabulary.data);
		responseElement.appendChild(dataElement);
	}

	ResponseREPLY(Document xml, String request, RepliesStatus status) {
		this(xml, request);
		setReplyStatus(status);
	}

	ResponseREPLY(Document xml, String request, RepliesStatus status, String msg) {
		this(xml, request, status);		
		setReplyMessage(msg);
	}

	public void setReplyStatus(RepliesStatus reply) {
		replyStatus = reply;
		replyElement.setAttribute(ServiceVocabulary.status, replyStatus.toString());
	}

	public void setReplyStatusOK() {
		setReplyStatus(RepliesStatus.ok);
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
		replyElement.setTextContent(msg);
	}

	public String getReplyMessage() {
		return replyElement.getTextContent();
	}

	public Element getDataElement() {
		return dataElement;
	}

	public boolean isAffirmative() {
		if (replyStatus.equals(RepliesStatus.ok) || replyStatus.equals(RepliesStatus.warning) )
			return true;
		return false;
	}

}
