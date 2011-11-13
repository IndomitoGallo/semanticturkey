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

//Ramon Orrù (2010) : modifica per introduzione nuova gerarchia Response
public class XMLResponseREPLY extends XMLResponse implements ResponseREPLY {

	XMLResponseREPLY(Document xml, String request) {
		super(xml, request);
		Element replyElement;
		Element dataElement;
		getResponseElement().setAttribute(ServiceVocabulary.responseType, ServiceVocabulary.type_reply);
		replyElement = xml.createElement(ServiceVocabulary.reply);
		getResponseElement().appendChild(replyElement);		
		dataElement = xml.createElement(ServiceVocabulary.data);
		getResponseElement().appendChild(dataElement);
	}

	XMLResponseREPLY(Document xml, String request, RepliesStatus status) {
		this(xml, request);
		setReplyStatus(status);
	}

	XMLResponseREPLY(Document xml, String request, RepliesStatus status, String msg) {
		this(xml, request, status);		
		setReplyMessage(msg);
	}

	public void setReplyStatus(RepliesStatus reply) {
		Element replyElement=((Element) getResponseElement().getElementsByTagName(ServiceVocabulary.reply).item(0));
		replyElement.setAttribute(ServiceVocabulary.status, reply.toString());
	}

	public void setReplyStatusOK() {
		setReplyStatus(RepliesStatus.ok);
	}
	
	// non sono convinto che serva.... 
	public RepliesStatus getReplyStatus(){
		Element replyElement=((Element) getResponseElement().getElementsByTagName(ServiceVocabulary.reply).item(0));
		String status=replyElement.getAttribute(ServiceVocabulary.status).toString();
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
		Element replyElement=((Element) getResponseElement().getElementsByTagName(ServiceVocabulary.reply).item(0));
		replyElement.setTextContent(msg);
	}

	public String getReplyMessage() {
		Element replyElement=((Element) getResponseElement().getElementsByTagName(ServiceVocabulary.reply).item(0));
		return replyElement.getTextContent();
	}

	public Element getDataElement() {
		return  ((Element) getResponseElement().getElementsByTagName(ServiceVocabulary.data).item(0));
	}

	public boolean isAffirmative() {
		if (getReplyStatus().equals(RepliesStatus.ok) || getReplyStatus().equals(RepliesStatus.warning) )
			return true;
		return false;
	}

}
