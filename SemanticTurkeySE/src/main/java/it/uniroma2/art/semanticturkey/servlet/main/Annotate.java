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
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Element;

/**
 * @author Donato Griesi
 * @author Andrea Turbati
 * @author Armando Stellato
 */
public class Annotate extends ServiceAdapter {

	public Annotate(String id) {
		super(id);
	}

	protected static Logger logger = LoggerFactory.getLogger(Annotate.class);

	public Logger getLogger() {
		return logger;
	}
	
	public String XSLpath = Resources.getXSLDirectoryPath() + "annotation.xsl";

	public Response getResponse() {
		OWLModel ontModel = (OWLModel)ProjectManager.getCurrentProject().getOntModel();
		ARTURIResourceIterator it;
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse("", RepliesStatus.ok);
		Element dataElem = response.getDataElement();
		try {
			it = ontModel.listNamedClasses(true);
			while (it.hasNext()) {
				Element classElement = XMLHelp.newElement(dataElem, "Class");
				ARTURIResource res = it.next();
				Element URIElement = XMLHelp.newElement(classElement, "URI");
				XMLHelp.newElement(URIElement, "Value", res.getURI());
				XMLHelp.newElement(URIElement, "LocalName", res.getLocalName());
			}
		} catch (ModelAccessException e) {
			logger.error("problems in adding label: " + e.getMessage(), e);
			return ServletUtilities.getService().createExceptionResponse("",
					"problems in adding label: " + e.getMessage());
		}

		this.fireServletEvent();
		return response;
	}

	/*
	 * public Collection<ARTResource> getSortedClasses() { OWLModel ontModel = ProjectManager.getCurrentProject().getOntModel();
	 * ARTURIResourceIterator resources = ontModel.listNamedClasses(true); ArrayList<ARTResource> list = new
	 * ArrayList<ARTResource>(resources);
	 * 
	 * Collections.sort(list, new STResourceComparator()); return list; }
	 */
}
