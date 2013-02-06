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
 * The Original Code is SemanticTurkeySE.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2010.
 * All Rights Reserved.
 *
 * SemanticTurkeySE was developed by the Artificial Intelligence Research Group
 * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about SemanticTurkeySE can be obtained at 
 * http//ai-nlp.info.uniroma2.it/software/...
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.servlet.main;

import java.util.Set;
import java.util.Map.Entry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.w3c.dom.Element;

import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.generation.annotation.GenerateController;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

@Component
public class Environment extends ServiceAdapter {

	public static String systemPropertiesRequest = "systemprops";

	protected static Logger logger = LoggerFactory.getLogger(Environment.class);

	@Autowired
	public Environment(@Value("Environment") String id) {
		super(id);
	}

	@Override
	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		Response response = null;

		if (request.equals(systemPropertiesRequest))
			response = getSystemProperties();
		else
			response = ServletUtilities.getService().createNoSuchHandlerExceptionResponse(request);
		
		return response;
	}
	
	public Logger getLogger() {
		return logger;
	}

	public Response getSystemProperties() {
		XMLResponseREPLY response = servletUtilities.createReplyResponse(systemPropertiesRequest,
				RepliesStatus.ok);

		Element dataElement = response.getDataElement();
		Set<Entry<Object, Object>> entries = System.getProperties().entrySet();
		for (Entry<Object, Object> entry : entries) {
			Element xmlPropEntry = XMLHelp.newElement(dataElement, "prop");
			xmlPropEntry.setAttribute(entry.getKey().toString(), entry.getValue().toString());
		}

		return response;

	}

}
