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

public abstract class Response {

	Document xml;
	Element responseElement;

	Response(Document xml, String request) {
		this.xml = xml;
		responseElement = xml.createElement(ServiceVocabulary.responseRoot);
		responseElement.setAttribute(ServiceVocabulary.request, request);
		xml.appendChild(responseElement);
	}

	public Document getXML() {
		return xml;
	}

	public String toString() {
		return XMLHelp.XML2String(xml, true);
	}
	
	public Element getResponseElement() {
		return responseElement;
	}

	public abstract boolean isAffirmative();
}
