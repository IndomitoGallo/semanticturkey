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
import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.models.RDFSModel;
import it.uniroma2.art.owlart.navigation.ARTNodeIterator;
import it.uniroma2.art.owlart.utilities.RDFIterators;
import it.uniroma2.art.owlart.vocabulary.RDFS;
import it.uniroma2.art.owlart.vocabulary.XmlSchema;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.HttpServiceRequestWrapper;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Collection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

/**
 * @author Donato Griesi Contributor(s): Andrea Turbati
 */
public class Synonyms extends ServiceAdapter {

	protected static Logger logger = LoggerFactory.getLogger(Synonyms.class);

	public static final String getSynonymsRequest = "getSynonyms";
	public static final String addSynonymRequest = "addSynonym";

	public Synonyms(String id) {
		super(id);
	}

	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {

		fireServletEvent();
		if (request.equals(getSynonymsRequest))
			return getSynonyms();
		else if (request.equals(addSynonymRequest))
			return addSynonym();
		else
			return ServletUtilities.getService().createNoSuchHandlerExceptionResponse(request);
	}

	public Logger getLogger() {
		return logger;
	}
	
	public Response getSynonyms() {

		String request = getSynonymsRequest;
		String xml = new String("");
		ServletUtilities servletUtilities = new ServletUtilities();

		BufferedReader reader = null;
		try {
			reader = ((HttpServiceRequestWrapper) _oReq).getHttpRequest().getReader();
		} catch (IOException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

		String line = null;
		try {
			while ((line = reader.readLine()) != null) {
				xml = xml.concat(line);
			}
		} catch (IOException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}

		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		String language = null;

		NodeList nodeList = dataElement.getElementsByTagName("OPTIONS");
		if (nodeList.getLength() > 0) {
			Node node = nodeList.item(0);
			NamedNodeMap namedNodeMap = node.getAttributes();
			language = namedNodeMap.getNamedItem("language").getNodeValue();
		}

		Element root = XMLHelp.newElement(dataElement, "Root");
		nodeList = dataElement.getElementsByTagName("TERM");

		try {
			for (int i = 0; i < nodeList.getLength(); i++) {
				Node node = nodeList.item(i);
				NamedNodeMap namedNodeMap = node.getAttributes();
				String value = namedNodeMap.getNamedItem("value").getNodeValue();
				ARTURIResource cls;
				cls = ontModel.createURIResource(ontModel.expandQName(servletUtilities.encodeLabel(value)));

				if (cls != null) {
					Element concept = XMLHelp.newElement(root, "Concept");
					concept.setAttribute("name", value);
					ARTNodeIterator it = ontModel.listValuesOfSubjPredPair(cls, ontModel
							.createURIResource(RDFS.LABEL + " " + XmlSchema.LANGUAGE + "=\"" + language
									+ "\""), true);
					while (it.streamOpen()) {
						Element synonym = XMLHelp.newElement(concept, "Synonym");
						synonym.setAttribute("name", it.next().toString());
					}
					// Collection<ARTResource> explicitInstances =
					// RDFIterators.getCollectionFromIterator(ontModel.listInstances(cls, false,
					// NodeFilters.MAINGRAPH));
					Collection<ARTResource> list = RDFIterators
							.getCollectionFromIterator(((DirectReasoning) ontModel).listDirectSubClasses(cls));
					for (ARTResource subCls : list) {
						if (subCls.isURIResource()) { // TODO waiting for unnamed resources support
							Element subconcept = XMLHelp.newElement(concept, "SubConcept");
							subconcept.setAttribute("name", servletUtilities.decodeLabel(subCls
									.asURIResource().getLocalName()));
							it = ontModel.listValuesOfSubjPredPair(subCls, ontModel
									.createURIResource(RDFS.LABEL + " " + XmlSchema.LANGUAGE + "=\""
											+ language + "\""), true);
							while (it.hasNext()) {
								Element synonym = XMLHelp.newElement(subconcept, "Synonym");
								synonym.setAttribute("name", it.next().toString());
							}
						}
					}
				}
			}
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}
		this.fireServletEvent();
		return response;
	}

	public Response addSynonym() {
		ServletUtilities servletUtilities = ServletUtilities.getService();
		String encodedName = servletUtilities.encodeLabel(setHttpPar("name"));
		String synonym = servletUtilities.encodeLabel(setHttpPar("synonym"));
		String language = setHttpPar("language");
		try {
			addSynonym(encodedName, synonym, language);
		} catch (ModelAccessException e) {
			logger.error("unable to expand qname for class: " + encodedName + "\n" + e.getMessage(), e);
			return servletUtilities.createExceptionResponse(addSynonymRequest, "problems in adding label: "
					+ e.getMessage());
		} catch (ModelUpdateException e) {
			logger.error("problems in adding label: " + e.getMessage(), e);
			return servletUtilities.createExceptionResponse(addSynonymRequest, "problems in adding label: "
					+ e.getMessage());
		}

		ResponseREPLY response = ServletUtilities.getService().createReplyResponse(addSynonymRequest,
				RepliesStatus.ok, "synonym added correctly");
		fireServletEvent();
		return response;
	}

	public void addSynonym(String classQName, String synonym, String language) throws ModelAccessException,
			ModelUpdateException {
		RDFSModel ontModel = (RDFSModel)ProjectManager.getCurrentProject().getOntModel();
		ARTResource cls = ontModel.createURIResource(ontModel.expandQName(classQName));
		ontModel.addLabel(cls, synonym, language);
	}

}
