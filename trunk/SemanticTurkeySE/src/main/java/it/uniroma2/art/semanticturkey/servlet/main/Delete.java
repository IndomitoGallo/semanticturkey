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
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.utilities.DeletePropagationPropertyTree;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.w3c.dom.Element;

/**Classe che si occupa della cancellazione di classi o istanze dell'ontologia
 * si possono cancellare solo classi e istanze che non appartengono alla Domain ontology*/
/**
 * @author Donato Griesi, Armando Stellato Contributor(s): Andrea Turbati
 */
public class Delete extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(Delete.class);
	private static DeletePropagationPropertyTree deletePropertyPropagationTree;

	public final static String removePropertyRequest = "removeProperty";
	public final static String removeInstanceRequest = "removeInstance";
	public final static String removeClassRequest = "removeClass";

	public Delete(String id) {
		super(id);
	}

	public Logger getLogger() {
		return logger;
	}
	
	private void initializeDeletePropertyPropagationTree() {
		deletePropertyPropagationTree = new DeletePropagationPropertyTree();
		deletePropertyPropagationTree.addChild(SemAnnotVocab.Res.annotation).addChild(
				SemAnnotVocab.Res.location);
	}

	/**
	 * Metodo che si occupa della creazione dell'elemento xml relativo alla cancellazione di classi o istanze
	 * dell'ontologia si possono cancellare solo classi e istanze che non appartengono alla Domain ontology
	 * 
	 * @return Response xml
	 */
	public Response getResponse() {
		String name = setHttpPar("name");
		String request = setHttpPar("request");
		this.fireServletEvent();
		return deleteResource(name, request);
	}

	public Response deleteResource(String qname, String request) {
		logger.debug("request to delet resource: " + qname);
		ServletUtilities servletUtilities = new ServletUtilities();
		String encodedQName = servletUtilities.encodeLabel(qname);
		OWLModel model = (OWLModel) ProjectManager.getCurrentProject().getOntModel();
		ARTURIResource resource;
		try {
			resource = model.createURIResource(model.expandQName(encodedQName));
			if (!ModelUtilities.checkExistingResource(model, resource))
				return servletUtilities.createExceptionResponse("deleteResource",
						"client/server inconsistency error: there is no resource corresponding to: " + qname
								+ " in the ontModel!");

			if (request.equals(removeClassRequest)) // for class the previous instruction implies that the
													// class has no
				// subclasses nor direct instances (otherwise, a rewire of lost ISA
				// connections is necessary)
				deleteClass(resource, model);
			if (request.equals(removeInstanceRequest))
				deleteInstance(resource, model);
			if (request.equals(removePropertyRequest)) { // for property the removal of incoming edges
															// instruction implies
				// that it has no subproperties (otherwise, a rewire of lost ISA
				// connections is necessary)
				if (checkPropertyDeleatability(resource, model))
					deleteProperty(resource, model);
				else
					return servletUtilities.createExceptionResponse("deleteResource",
							"cannot delete property, there are triples in the ontology using this property!");
			} else
				servletUtilities.createExceptionResponse("deleteResource",
						"client declared an unknown type: " + request + "for the resource to be deleted!");

		} catch (ModelAccessException e) {
			servletUtilities.createExceptionResponse("deleteResource", e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse("deleteResource",
					"problems in deleting resource " + qname + " from the ontModel.\n"
							+ Utilities.printStackTrace(e));
		}
		logger.debug("deleting request is: " + request + ", for resource: " + qname);

		// XML RESPONSE PREPARATION
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		Element element = XMLHelp.newElement(dataElement, "Resource");
		element.setAttribute("name", qname);
		element.setAttribute("type", request);
		return response;

	}

	public void deleteClass(ARTResource cls, OWLModel ontModel) throws ModelUpdateException {
		logger.debug("deleting class: " + cls );
		ontModel.deleteTriple(NodeFilters.ANY, NodeFilters.ANY, cls); // 1) removes all the incoming edges
		// //beware! only applicable if the
		// application has already checked
		// that the class has no subclasses
		// nor instances!, otherwise some
		// rewiring of lost semantic
		// connections (ISA and instanceof) is
		// necessary!
		// TODO there should be no need of traversal propagation, otherwise report cases where it is needed
		// in the meanwhile, i just delete outcoming edges from class
		ontModel.deleteTriple(cls, NodeFilters.ANY, NodeFilters.ANY);
	}

	/**
	 * 
	 * @param resource
	 * @param ontModel
	 * @throws RepositoryUpdateException
	 */
	public void deleteInstance(ARTResource resource, OWLModel ontModel) throws ModelUpdateException {
		if (deletePropertyPropagationTree == null)
			initializeDeletePropertyPropagationTree();
		ModelUtilities.deepDeleteIndividual(resource, ontModel, deletePropertyPropagationTree);
	}

	/**
	 * a property is deletable only if there are no direct statements which bind resources through it
	 * 
	 * @param property
	 * @param ontModel
	 * @return
	 * @throws ModelAccessException
	 */
	public boolean checkPropertyDeleatability(ARTURIResource property, OWLModel ontModel)
			throws ModelAccessException {
		ARTStatementIterator stit = ontModel.listStatements(NodeFilters.ANY, property, NodeFilters.ANY,
				false, NodeFilters.MAINGRAPH);
		return !stit.hasNext();
	}

	public void deleteProperty(ARTURIResource property, OWLModel ontModel) throws ModelUpdateException {
		ontModel.deleteTriple(NodeFilters.ANY, NodeFilters.ANY, property); // 1) removes all the incoming
		// edges //beware! only
		// applicable if the application
		// has already checked that the
		// class has no subclasses nor
		// instances!, otherwise some
		// rewiring of lost semantic
		// connections (ISA and
		// instanceof) is necessary!
		ontModel.deleteTriple(NodeFilters.ANY, property, NodeFilters.ANY);
		// TODO there should be no need of traversal propagation, otherwise report cases where it is needed
		// in the meanwhile, i just delete outcoming edges from class
		ontModel.deleteTriple(property, NodeFilters.ANY, NodeFilters.ANY);
	}

	/**
	 * @return the deletePropertyPropagationTree
	 */
	static DeletePropagationPropertyTree getDeletePropertyPropagationTree() {
		return deletePropertyPropagationTree;
	}

	/**
	 * @param deletePropertyPropagationTree
	 *            the deletePropertyPropagationTree to set
	 */
	static void setDeletePropertyPropagationTree(DeletePropagationPropertyTree deletePropertyPropagationTree) {
		Delete.deletePropertyPropagationTree = deletePropertyPropagationTree;
	}

}
