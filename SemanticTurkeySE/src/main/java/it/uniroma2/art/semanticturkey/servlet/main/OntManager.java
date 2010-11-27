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
 * (art.uniroma2.it) at the University of Roma Tor Vergata (ART)
 * Current information about SemanticTurkey can be obtained at 
 * http://semanticturkey.uniroma2.it
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.servlet.main;

import java.util.Collection;

import it.uniroma2.art.owlart.exceptions.UnavailableResourceException;
import it.uniroma2.art.owlart.models.UnloadableModelConfigurationException;
import it.uniroma2.art.owlart.models.UnsupportedModelConfigurationException;
import it.uniroma2.art.owlart.models.conf.ConfParameterNotFoundException;
import it.uniroma2.art.owlart.models.conf.ModelConfiguration;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.ontology.OntologyManagerFactory;
import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Element;

/**
 * @author Armando Stellato
 */
public class OntManager extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(OntManager.class);

	// GET REQUESTS
	public static final String getOntManagerParametersRequest = "getOntManagerParameters";

	// PARS
	static final public String ontMgrIDField = "ontMgrID";

	public OntManager(String id) {
		super(id);
	}

	public Logger getLogger() {
		return logger;
	}
	
	public Response getResponse() {
		String request = setHttpPar("request");
		fireServletEvent();
		try {

			if (request.equals(getOntManagerParametersRequest)) {
				String ontMgrID = setHttpPar(ontMgrIDField);

				checkRequestParametersAllNotNull(ontMgrIDField);

				return getOntologyManagerParameters(ontMgrID);

			} else
				return ServletUtilities.getService().createExceptionResponse(request,
						"no handler for such a request!");

		} catch (HTTPParameterUnspecifiedException e) {
			return servletUtilities.createUndefinedHttpParameterExceptionResponse(request, e);
		}

	}

	public XMLResponse getOntologyManagerParameters(String ontMgrID) {
		String request = getOntManagerParametersRequest;
		OntologyManagerFactory<ModelConfiguration> ontMgrFact;
		try {
			ontMgrFact = PluginManager.getOntManagerImpl(ontMgrID);
		} catch (UnavailableResourceException e1) {
			return servletUtilities.createExceptionResponse(request, e1.getMessage());
		}
		Collection<Class<? extends ModelConfiguration>> mConfClasses = ontMgrFact.getModelConfigurations();

		XMLResponseREPLY response = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		try {

			for (Class<? extends ModelConfiguration> confClass : mConfClasses) {

				ModelConfiguration mConf = ontMgrFact.createModelConfigurationObject(confClass);

				Element newConfType = XMLHelp.newElement(dataElement, "configuration");

				newConfType.setAttribute("type", confClass.getName());

				newConfType.setAttribute("shortName", mConf.getShortName());

				newConfType.setAttribute("editRequired", Boolean.toString(mConf.hasRequiredParameters()));

				Collection<String> pars = mConf.getConfigurationParameters();

				for (String par : pars) {
					String parDescr = mConf.getParameterDescription(par);
					Element newPar = XMLHelp.newElement(newConfType, "par");
					newPar.setAttribute("name", par);
					newPar.setAttribute("description", parDescr);
					newPar.setAttribute("required", Boolean.toString(mConf.isRequiredParameter(par)));
					String contentType = mConf.getParameterContentType(par);
					if (contentType != null)
						newPar.setAttribute("type", contentType);
					Object parValue = mConf.getParameterValue(par);
					if (parValue != null)
						newPar.setTextContent(parValue.toString());
				}

			}

		} catch (ConfParameterNotFoundException e) {
			return servletUtilities
					.createExceptionResponse(
							request,
							"strangely, the configuration parameter (which should have provided by the same ontology manager) was not recognized: "
									+ e.getMessage());
		} catch (UnsupportedModelConfigurationException e) {
			return servletUtilities.createExceptionResponse(request,
					"strangely, the Model Configuration was not recognized: " + e.getMessage());
		} catch (UnloadableModelConfigurationException e) {
			return servletUtilities.createExceptionResponse(request, e.getMessage());
		}

		return response;
	}

}
