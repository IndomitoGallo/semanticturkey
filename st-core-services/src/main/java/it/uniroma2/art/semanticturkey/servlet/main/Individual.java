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
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFSModel;
import it.uniroma2.art.owlart.navigation.ARTNodeIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.utilities.RDFIterators;
import it.uniroma2.art.owlart.vocabulary.OWL;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.exceptions.NonExistingRDFResourceException;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFXMLHelp;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFNodeFactory;
import it.uniroma2.art.semanticturkey.ontology.utilities.STRDFResource;
import it.uniroma2.art.semanticturkey.generation.annotation.STService;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.util.Collection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.w3c.dom.Element;

/**
 * @author Armando Stellato Contributor(s): Andrea Turbati
 */
@Component
public class Individual extends Resource {
	protected static Logger logger = LoggerFactory.getLogger(Individual.class);
	public String XSLpath = Resources.getXSLDirectoryPath() + "createClassForm.xsl";

	public Logger getLogger() {
		return logger;
	}

	// TODO raccogliere opportunamente le eccezioni!
	public int fromWebToMirror = 0;
	public int fromWeb = 1;
	public int fromLocalFile = 2;
	public int fromOntologyMirror = 3;
	public int toOntologyMirror = 4;

	// REQUESTS
	protected static String getDirectNamedTypesRequest = "getDirectNamedTypes";
	protected static String addTypeRequest = "addType";
	protected static String removeTypeRequest = "removeType";

	// PARS
	public static final String instanceQNameField = "instanceQName";
	public static final String indqnameField = "indqname";
	public static final String typeqnameField = "typeqname";

	@Autowired
	public Individual(@Value("Individual") String id) {
		super(id);
	}

	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		ServletUtilities servletUtilities = ServletUtilities.getService();

		this.fireServletEvent();
		if (request.equals(individualDescriptionRequest)) {
			String instanceQNameEncoded = setHttpPar(instanceQNameField);
			String method = setHttpPar("method");
			checkRequestParametersAllNotNull(instanceQNameField, "method");
			return getIndividualDescription(instanceQNameEncoded, method);
		}

		if (request.equals(getDirectNamedTypesRequest)) {
			String indQName = setHttpPar(indqnameField);
			return getDirectNamedTypes(indQName);
		}
		if (request.equals(addTypeRequest))
			return addType(setHttpPar(indqnameField), setHttpPar(typeqnameField));
		if (request.equals(removeTypeRequest))
			return removeType(setHttpPar(indqnameField), setHttpPar(typeqnameField));

		else
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);
	}

	/**
	 * 
	 * <Tree request="getIndDescription" type="templateandvalued"> <Types> <Type class="Researcher"
	 * explicit="true"/> </Types> <Properties> <Property name="rtv:worksIn" type="owl:ObjectProperty"> <Value
	 * explicit="true" type="rdfs:Resource" value="University of Rome, Tor Vergata"/> </Property> <Property
	 * name="rtv:fax" type="owl:DatatypeProperty"> <Value explicit="true" type="rdfs:Literal"
	 * value="+390672597460"/> </Property> <Property name="rtv:occupation" type="owl:DatatypeProperty"/>
	 * <Property name="rtv:phoneNumber" type="owl:DatatypeProperty"> <Value explicit="true"
	 * type="rdfs:Literal" value="+390672597330"/> <Value explicit="true" type="rdfs:Literal"
	 * value="+390672597332"/> <Value explicit="false" type="rdfs:Literal" value="+390672597460"/> </Property>
	 * </Properties> </Tree>
	 * 
	 * @param subjectInstanceQName
	 *            the instance to which the new instance is related to
	 * @param requestSource
	 *            a parameter for two different services //STARRED non sono sicuro serva, ma verificare con
	 *            Noemi serve eccome!!!!!
	 * @return
	 */
	public Response getIndividualDescription(String subjectInstanceQName, String method) {
		logger.debug("getIndDescription; qname: " + subjectInstanceQName);
		return getResourceDescription(subjectInstanceQName, RDFResourceRolesEnum.individual, method);
	}

	/**
	 * 
	 * <Tree type="get_types"> <Type qname="rtv:Employee"/> <Type qname="rtv:Hobbyst"/> </Tree>
	 * 
	 */
	public Response getDirectNamedTypes(String indQName) {
		logger.debug("replying to \"getTypes(" + indQName + ").");
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();

		XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		ARTURIResource individual;
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTResource wgraph = getWorkingGraph();
			individual = retrieveExistingURIResource(ontModel, indQName, graphs);

			ARTResourceIterator directTypesIterator = ((DirectReasoning) ontModel).listDirectTypes(
					individual, graphs);

			Element instanceElement = XMLHelp.newElement(dataElement, "Instance");
			STRDFResource stIndividual = STRDFNodeFactory.createSTRDFResource(ontModel, individual, 
					ModelUtilities.getResourceRole(individual, ontModel), 
					servletUtilities.checkWritable(ontModel, individual, wgraph), false);
			Cls.setRendering(ontModel, stIndividual, null, null, graphs);
			RDFXMLHelp.addRDFNode(instanceElement, stIndividual);
			
			Element typesElement = XMLHelp.newElement(dataElement, "Types");
			Collection<STRDFResource> types = STRDFNodeFactory.createEmptyResourceCollection();
			while (directTypesIterator.streamOpen()) {
				ARTResource type = directTypesIterator.getNext();
				if (type.isURIResource()) {
					STRDFResource stType = STRDFNodeFactory.createSTRDFResource(ontModel, type, 
							ModelUtilities.getResourceRole(type, ontModel), 
							servletUtilities.checkWritable(ontModel, type, wgraph), false);
					Cls.setRendering(ontModel, stType, null, null, graphs);
					types.add(stType);
				}
			}
			RDFXMLHelp.addRDFNodes(typesElement, types);

		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

		return response;
	}

	// STARRED ti serve pure il nome della istanza?
	/**
	 * 
	 * <Tree type="add_type"> <Type qname="rtv:Person"/> </Tree>
	 * 
	 */
	public Response addType(String indQName, String typeQName) {
		logger.debug("replying to \"addType(" + indQName + "," + typeQName + ")\".");
		OWLModel model = (OWLModel) ProjectManager.getCurrentProject().getOntModel();

		ARTURIResource individual;
		try {
			ARTResource[] graphs = getUserNamedGraphs();
			individual = retrieveExistingURIResource(model, indQName, graphs);
			ARTURIResource typeCls = retrieveExistingURIResource(model, typeQName, graphs);

			Collection<ARTResource> types = RDFIterators.getCollectionFromIterator(((DirectReasoning) model)
					.listDirectTypes(individual, graphs));

			if (types.contains(typeCls))
				return logAndSendException(typeQName + " is not a type for: " + indQName);

			model.addType(individual, typeCls, getWorkingGraph());

			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			
			Element typeElement = XMLHelp.newElement(dataElement, "Type");
			ARTResource wgraph = getWorkingGraph();
			STRDFResource stClass = STRDFNodeFactory.createSTRDFResource(model, typeCls,
					ModelUtilities.getResourceRole(typeCls, model), 
					servletUtilities.checkWritable(model, typeCls, wgraph), false);
			Cls.setRendering(model, stClass, null, null, graphs);
			RDFXMLHelp.addRDFNode(typeElement, stClass);
			
			Element instanceElement = XMLHelp.newElement(dataElement, "Instance");
			ARTURIResource instanceRes = model.createURIResource(model.expandQName(indQName));
			STRDFResource stInstance = STRDFNodeFactory.createSTRDFResource(model, instanceRes,
					ModelUtilities.getResourceRole(instanceRes, model), 
					servletUtilities.checkWritable(model, instanceRes, wgraph), false);
			Cls.setRendering(model, stInstance, null, null, graphs);
			RDFXMLHelp.addRDFNode(instanceElement, stInstance);
			
			return response;
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}
	}

	// STARRED ti serve pure il nome della istanza?
	/**
	 * gets the namespace mapping for the loaded ontology
	 * 
	 * <Tree type="remove_type"> <Type qname="rtv:Person"/> </Tree>
	 * 
	 */
	public Response removeType(String indQName, String typeQName) {
		logger.debug("replying to \"removeType(" + indQName + "," + typeQName + ")\".");
		OWLModel model = (OWLModel) ProjectManager.getCurrentProject().getOntModel();

		try {
			ARTResource[] graphs = getUserNamedGraphs();
			ARTResource individual = retrieveExistingURIResource(model, indQName, graphs);
			ARTURIResource typeCls = retrieveExistingURIResource(model, typeQName, graphs);

			Collection<ARTResource> types = RDFIterators.getCollectionFromIterator(((DirectReasoning) model)
					.listDirectTypes(individual, graphs));

			if (!types.contains(typeCls))
				return logAndSendException(typeQName + " is not a type for: " + indQName);

			if (!model.hasTriple(individual, RDF.Res.TYPE, typeCls, false, getWorkingGraph()))
				return logAndSendException("this type relationship comes from an imported ontology or has been inferred, so it cannot be deleted explicitly");

			model.removeType(individual, typeCls, getWorkingGraph());

			if (types.size() == 1)
				keepCareOfOrphaneResource(model, individual, graphs);

			XMLResponseREPLY response = createReplyResponse(RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			
			Element typeElement = XMLHelp.newElement(dataElement, "Type");
			ARTResource wgraph = getWorkingGraph();
			STRDFResource stClass = STRDFNodeFactory.createSTRDFResource(model, typeCls,
					ModelUtilities.getResourceRole(typeCls, model), 
					servletUtilities.checkWritable(model, typeCls, wgraph), false);
			Cls.setRendering(model, stClass, null, null, graphs);
			Cls.decorateWithNumberOfIstances(model, stClass, graphs);
			RDFXMLHelp.addRDFNode(typeElement, stClass);
			
			Element instanceElement = XMLHelp.newElement(dataElement, "Instance");
			ARTURIResource instanceRes = model.createURIResource(model.expandQName(indQName));
			STRDFResource stInstance = STRDFNodeFactory.createSTRDFResource(model, instanceRes,
					ModelUtilities.getResourceRole(instanceRes, model), 
					servletUtilities.checkWritable(model, instanceRes, wgraph), false);
			Cls.setRendering(model, stInstance, null, null, graphs);
			RDFXMLHelp.addRDFNode(instanceElement, stInstance);
			
			return response;
			
		} catch (ModelAccessException e) {
			return logAndSendException(e);
		} catch (ModelUpdateException e) {
			return logAndSendException(e);
		} catch (NonExistingRDFResourceException e) {
			return logAndSendException(e);
		}

		
	}

	private void keepCareOfOrphaneResource(OWLModel model, ARTResource individual, ARTResource[] graphs)
			throws ModelAccessException, ModelUpdateException, NonExistingRDFResourceException {
		ARTResourceIterator it = model.listTypes(individual, true, graphs);
		if (!it.streamOpen())
			model.addType(individual, OWL.Res.THING, getWorkingGraph());
	}
	
}
