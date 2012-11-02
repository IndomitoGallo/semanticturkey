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

package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.ARTNodeIterator;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.generation.annotation.GenerateController;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;

import java.util.HashSet;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.w3c.dom.Element;

/**
 * This class retrieves all web pages associated to an instance
 * 
 * @author Donato Griesi, Armando Stellato Contributor(s): Andrea Turbati
 */
@Component

public class Page extends ServiceAdapter {

	protected static Logger logger = LoggerFactory.getLogger(Page.class);

	public static String instanceNameString = "instanceName";
	public static String getBookmarksRequest = "getBookmarks";

	@Autowired public Page(@Value("Page")String id) {
		super(id);
	}

	public Logger getLogger() {
		return logger;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter#getResponse()
	 */
	 public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		String instanceQName = setHttpPar(instanceNameString);
		checkRequestParametersAllNotNull(instanceNameString);
		this.fireServletEvent();
		return getAnnotatedPagesForInstance(instanceQName);
	}

	public Response getAnnotatedPagesForInstance(String instanceQName) {

		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(getBookmarksRequest,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		ARTResource instanceRes;
		try {
			instanceRes = ontModel.createURIResource(ontModel.expandQName(instanceQName));
			logger.debug("instanceRes: " + instanceRes);
			ARTNodeIterator semanticAnnotationInstancesIterator = ontModel.listValuesOfSubjPredPair(
					instanceRes, SemAnnotVocab.Res.annotation, true);
			Set<String> set = new HashSet<String>();
			while (semanticAnnotationInstancesIterator.hasNext()) {
				ARTResource semanticAnnotationRes = semanticAnnotationInstancesIterator.next().asResource();
				ARTNodeIterator webPageInstancesIterator = ontModel.listValuesOfSubjPredPair(
						semanticAnnotationRes, SemAnnotVocab.Res.location, true);
				while (webPageInstancesIterator.hasNext()) {
					ARTResource webPageInstance = webPageInstancesIterator.next().asResource();

					ARTNodeIterator urlPageIterator = ontModel.listValuesOfSubjPredPair(webPageInstance,
							SemAnnotVocab.Res.url, true);

					ARTNode urlPageValue = null;
					while (urlPageIterator.streamOpen()) {
						urlPageValue = urlPageIterator.getNext();
					}
					String urlPage = urlPageValue.toString();

					if (!set.add(urlPage))
						continue;

					ARTNodeIterator titleIterator = ontModel.listValuesOfSubjPredPair(webPageInstance,
							SemAnnotVocab.Res.title, true);
					ARTNode titleValue = null;
					while (titleIterator.hasNext()) {
						titleValue = titleIterator.next();
					}
					String title = titleValue.toString();

					Element url = XMLHelp.newElement(dataElement, "URL");
					urlPage = urlPage.replace("%3A", ":");
					urlPage = urlPage.replace("%2F", "/");
					url.setAttribute("value", urlPage);
					logger.debug("value " + urlPage);
					url.setAttribute("title", title);
					logger.debug("title " + title);
				}
			}
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(getBookmarksRequest, e);
		}

		return response;
	}

}
