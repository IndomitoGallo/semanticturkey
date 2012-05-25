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
import it.uniroma2.art.owlart.exceptions.UnavailableResourceException;
import it.uniroma2.art.owlart.filter.BaseRDFPropertyPredicate;
import it.uniroma2.art.owlart.filter.RootPropertiesResourcePredicate;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.navigation.ARTLiteralIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.owlart.vocabulary.RDFTypesEnum;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.filter.NoSystemResourcePredicate;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFUtilities;
import it.uniroma2.art.semanticturkey.ontology.utilities.RDFXMLHelp;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

import com.google.common.base.Predicate;
import com.google.common.base.Predicates;
import com.google.common.collect.Iterators;

/**
 * This services handles requests regarding property management and assignment of values to properties of
 * resources
 * 
 * @author Armando Stellato
 * @author Andrea Turbati
 */
public class Property extends Resource {

	public static class Req {

		// GET REQUESTS
		final static public String getPropertiesTreeRequest = "getPropertiesTree";
		final static public String getObjPropertiesTreeRequest = "getObjPropertiesTree";
		final static public String getDatatypePropertiesTreeRequest = "getDatatypePropertiesTree";
		final static public String getAnnotationPropertiesTreeRequest = "getAnnotationPropertiesTree";
		final static public String getOntologyPropertiesTreeRequest = "getOntologyPropertiesTree";
		final static public String getDomainClassesTreeRequest = "getDomainClassesTree";
		final static public String getRangeClassesTreeRequest = "getRangeClassesTree";
		final static public String getSuperPropertiesRequest = "getSuperProperties";
		final static public String parseDataRangeRequest = "parseDataRange";
		final static public String getDomainRequest = "getDomain";
		final static public String getRangeRequest = "getRange";

		// ADD REQUESTS
		final static public String addPropertyRequest = "addProperty";
		final static public String addPropertyDomainRequest = "addPropertyDomain";
		final static public String addPropertyRangeRequest = "addPropertyRange";
		final static public String addSuperPropertyRequest = "addSuperProperty";
		final static public String createAndAddPropValueRequest = "createAndAddPropValue";
		final static public String addExistingPropValueRequest = "addExistingPropValue";

		// REMOVE REQUESTS
		final static public String removePropertyDomainRequest = "removePropertyDomain";
		final static public String removePropertyRangeRequest = "removePropertyRange";
		final static public String removeSuperPropertyRequest = "removeSuperProperty";
		final static public String removePropValueRequest = "removePropValue";
	}

	public static class Par {
		final static public String nodeTypePar = "nodeType";
		final static public String dataRangePar = "dataRange";
		final static public String instanceQNamePar = "instanceQName";
		final static public String propertyQNamePar = "propertyQName";
		final static public String rangeQNamePar = "rangeQName";
		final static public String domainPropertyQNamePar = "domainPropertyQName";
		final static public String valueField = "value";
		final static public String langField = "lang";
		final public static String type = "type";
		final public static String visualize = "visualize";
	}

	final public static String template = "template";
	protected static Logger logger = LoggerFactory.getLogger(Property.class);

	public Property(String id) {
		super(id);
	}

	public Logger getLogger() {
		return logger;
	}

	/**
	 * 
	 * @return Document
	 */
	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		ServletUtilities servletUtilities = new ServletUtilities();

		this.fireServletEvent();
		// all new fashoned requests are put inside these grace brackets
		if (request != null) {

			// PROPERTIES TREE METHODS
			if (request.equals(Req.getPropertiesTreeRequest)) {
				return getPropertyTree(true, true, true, true, true);
			} else if (request.equals(Req.getObjPropertiesTreeRequest)) {
				return getPropertyTree(true, true, false, false, false);
			} else if (request.equals(Req.getDatatypePropertiesTreeRequest)) {
				return getPropertyTree(false, false, true, false, false);
			} else if (request.equals(Req.getAnnotationPropertiesTreeRequest)) {
				return getPropertyTree(false, false, false, true, false);
			} else if (request.equals(Req.getOntologyPropertiesTreeRequest)) {
				return getPropertyTree(false, false, false, false, true);
			}

			// PROPERTY DESCRIPTION METHOD
			else if (request.equals(propertyDescriptionRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				checkRequestParametersAllNotNull(Par.propertyQNamePar);
				return getPropertyInfo(propertyQName);
			} else if (request.equals(Req.getSuperPropertiesRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				checkRequestParametersAllNotNull(Par.propertyQNamePar);
				return getSuperProperties(propertyQName);
			} else if (request.equals(Req.getDomainRequest)) {
				String propQName = setHttpPar(Par.propertyQNamePar);
				checkRequestParametersAllNotNull(Par.propertyQNamePar);
				return getDomain(propQName);
			} else if (request.equals(Req.getRangeRequest)) {
				String propQName = setHttpPar(Par.propertyQNamePar);
				String visualize = setHttpPar(Par.visualize);
				checkRequestParametersAllNotNull(Par.propertyQNamePar);
				return getRange(propQName, visualize);
			}

			else if (request.equals(Req.parseDataRangeRequest)) {
				String dataRange = setHttpPar(Par.dataRangePar);
				String nodeType = setHttpPar(Par.nodeTypePar);
				checkRequestParametersAllNotNull(Par.dataRangePar, Par.nodeTypePar);
				return parseDataRange(dataRange, nodeType);
			}

			// EDIT_PROPERTY METHODS
			else if (request.equals(Req.addPropertyRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				String superPropertyQName = setHttpPar("superPropertyQName"); // this one can be null
				// (that is, not instanciated at all on the http paramters) if the user just want to
				// create
				// the property without specifying a superproperty
				String propertyType = setHttpPar("propertyType");
				return editProperty(propertyQName, request, addProperty, propertyType, superPropertyQName);
			} else if (request.equals(Req.addPropertyDomainRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				String domainPropertyQName = setHttpPar(Par.domainPropertyQNamePar);
				checkRequestParametersAllNotNull(Par.propertyQNamePar, Par.domainPropertyQNamePar);
				return editProperty(propertyQName, request, addPropertyDomain, domainPropertyQName);
			} else if (request.equals(Req.removePropertyDomainRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				String domainPropertyQName = setHttpPar("domainPropertyQName");
				return editProperty(propertyQName, request, removePropertyDomain, domainPropertyQName);
			} else if (request.equals(Req.addPropertyRangeRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				String rangePropertyQName = setHttpPar("rangePropertyQName");
				return editProperty(propertyQName, request, addPropertyRange, rangePropertyQName);
			} else if (request.equals(Req.removePropertyRangeRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				String rangePropertyQName = setHttpPar("rangePropertyQName");
				return editProperty(propertyQName, request, removePropertyRange, rangePropertyQName);
			} else if (request.equals(Req.addSuperPropertyRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				String superPropertyQName = setHttpPar("superPropertyQName");
				return editProperty(propertyQName, request, addSuperProperty, superPropertyQName);
			} else if (request.equals(Req.removeSuperPropertyRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				String superPropertyQName = setHttpPar("superPropertyQName");
				return editProperty(propertyQName, request, removeSuperProperty, superPropertyQName);
			} else if (request.equals(Req.createAndAddPropValueRequest)
					|| request.equals(Req.addExistingPropValueRequest)
					|| request.equals(Req.removePropValueRequest)) {
				// the parameter rangeClsQName is only passed in the createAndAddPropValue request, the
				// editPropertyValue method accepts the null (i.e. no parameter passed via http) in the
				// two
				// other requests
				String instanceQName = setHttpPar(Par.instanceQNamePar);
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				String value = setHttpPar(Par.valueField);
				String rangeQName = setHttpPar(Par.rangeQNamePar);
				String lang = setHttpPar(Par.langField);
				String typeArg = setHttpPar(Par.type);
				checkRequestParametersAllNotNull(Par.instanceQNamePar, Par.propertyQNamePar, Par.valueField,
						Par.type);
				RDFTypesEnum valueType = null;
				if (typeArg != null)
					valueType = RDFTypesEnum.valueOf(typeArg);

				return editPropertyValue(request, instanceQName, propertyQName, value, valueType, rangeQName,
						lang);
			} else if (request.equals(Req.getRangeClassesTreeRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				return getRangeClassesTreeXML(propertyQName);
			} else if (request.equals(Req.getDomainClassesTreeRequest)) {
				String propertyQName = setHttpPar(Par.propertyQNamePar);
				return getDomainClassesTreeXML(propertyQName);
			} else
				return servletUtilities.createNoSuchHandlerExceptionResponse(request);

		}

		else
			return servletUtilities.createNoSuchHandlerExceptionResponse(request);

	}

	public Response getSuperProperties(String propQName) {
		return getSuperTypes(propQName, RDFResourceRolesEnum.property);
	}

	public Response getDomain(String propQName) {
		String request = Req.getDomainRequest;
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ARTURIResource property;
		try {
			property = ontModel.retrieveURIResource(ontModel.expandQName(propQName));
			if (property == null)
				return servletUtilities.createExceptionResponse(request, "there is no resource with name: "
						+ propQName);
			injectPropertyDomainXML(ontModel, property, dataElement);
			return response;

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}
	}

	public Response getRange(String propQName, String visualize) {
		boolean boolVis;
		if (visualize == null)
			boolVis = false;
		else
			boolVis = Boolean.valueOf(visualize);
		String request = Req.getRangeRequest;
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ARTURIResource property;
		try {
			property = ontModel.retrieveURIResource(ontModel.expandQName(propQName));
			if (property == null)
				return servletUtilities.createExceptionResponse(request, "there is no resource with name: "
						+ propQName);
			injectPropertyRangeXML(ontModel, property, dataElement, boolVis);
			return response;

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}
	}

	// TODO, se possibile, togliamo anche quell'odioso: subproperties. Non serve a niente e complica la vita a
	// tutti!
	// TODO we should handle separately simple rdf:Properties (there are a few ontologies which instantiate
	// just rdf:Property
	// TODO types in subproperties should not be automatically assigned on the basis of the root property
	// (case of rdf:properties subproperties of owl:ObjectProperties
	// TODO should make a more efficient method which takes all the properties, and then sorts them according
	// to their types. Separate handling is costly expecially considering the standard rdf:Property
	/**
	 * generates an xml tree representing properties of the knowledge base
	 * 
	 * @return Response tree
	 */
	public Response getPropertyTree(boolean props, boolean objprops, boolean datatypeprops,
			boolean annotationprops, boolean ontologyprops) {
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.getPropertiesTreeRequest, RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		Predicate<ARTResource> exclusionPredicate;
		// if (Config.isAdminStatus()) exclusionPredicate = NoLanguageResourcePredicate.nlrPredicate;
		// else exclusionPredicate = DomainResourcePredicate.domResPredicate;
		if (Config.isAdminStatus())
			exclusionPredicate = Predicates.alwaysTrue();
		else
			exclusionPredicate = NoSystemResourcePredicate.noSysResPred;
		Predicate<ARTURIResource> rootUserPropsPred = Predicates.and(new RootPropertiesResourcePredicate(
				ontModel), exclusionPredicate);

		Iterator<ARTURIResource> filteredPropsIterator;

		try {

			// OBJECT PROPERTIES
			if (objprops == true) {

				filteredPropsIterator = Iterators.filter(ontModel.listObjectProperties(true,
						NodeFilters.MAINGRAPH), rootUserPropsPred);
				logger.debug("\n\nontology root object properties: \n");
				while (filteredPropsIterator.hasNext())
					recursiveCreatePropertiesXMLTree(ontModel, filteredPropsIterator.next(), dataElement,
							"owl:ObjectProperty");
			}

			// DATATYPE PROPERTIES
			if (datatypeprops == true) {
				filteredPropsIterator = Iterators.filter(ontModel.listDatatypeProperties(true,
						NodeFilters.MAINGRAPH), rootUserPropsPred);
				logger.debug("\n\nontology root datatype properties: \n");
				while (filteredPropsIterator.hasNext())
					recursiveCreatePropertiesXMLTree(ontModel, filteredPropsIterator.next(), dataElement,
							"owl:DatatypeProperty");
			}

			// ANNOTATION PROPERTIES
			if (annotationprops == true) {
				filteredPropsIterator = Iterators.filter(ontModel.listAnnotationProperties(true,
						NodeFilters.MAINGRAPH), rootUserPropsPred);
				logger.debug("\n\nontology root annotation properties: \n");
				while (filteredPropsIterator.hasNext())
					recursiveCreatePropertiesXMLTree(ontModel, filteredPropsIterator.next(), dataElement,
							"owl:AnnotationProperty");
			}

			// ONTOLOGY PROPERTIES
			if (annotationprops == true) {
				filteredPropsIterator = Iterators.filter(ontModel.listOntologyProperties(true,
						NodeFilters.MAINGRAPH), rootUserPropsPred);
				logger.debug("\n\nontology root annotation properties: \n");
				while (filteredPropsIterator.hasNext())
					recursiveCreatePropertiesXMLTree(ontModel, filteredPropsIterator.next(), dataElement,
							"owl:OntologyProperty");
			}

			// BASE PROPERTIES
			Predicate<ARTURIResource> rdfPropsPredicate = Predicates.and(BaseRDFPropertyPredicate
					.getPredicate(ontModel), rootUserPropsPred);
			if (props == true) {
				filteredPropsIterator = Iterators.filter(ontModel.listProperties(NodeFilters.MAINGRAPH),
						rdfPropsPredicate);
				logger.debug("\n\nontology root rdf:properties: \n");
				while (filteredPropsIterator.hasNext())
					recursiveCreatePropertiesXMLTree(ontModel, filteredPropsIterator.next(), dataElement,
							"rdf:Property");
			}
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(Req.getPropertiesTreeRequest, e);
		}

		return response;
	}

	/**
	 * Carica ricorsivamente le proprieta'e le sottoproprieta' dell'ontologia TODO storage independent
	 * 
	 * @param SesameOWLModelImpl
	 *            ontModel
	 *@param Resource
	 *            resource
	 *@param Element
	 *            element :elemento xml padre delle classi (le sottoclassi e le istanze vengono aggiunte
	 *            ricorsivamente)
	 * @throws ModelAccessException
	 * @throws DOMException
	 **/
	void recursiveCreatePropertiesXMLTree(OWLModel ontModel, ARTURIResource property, Element element,
			String type) throws DOMException, ModelAccessException {
		logger.trace("\t" + property);
		ServletUtilities servletUtilities = new ServletUtilities();
		Element propElement = XMLHelp.newElement(element, "Property");
		boolean deleteForbidden = servletUtilities.checkWriteOnly(property);
		propElement.setAttribute("name", ontModel.getQName(property.getURI()));

		propElement.setAttribute("type", type);
		propElement.setAttribute("deleteForbidden", Boolean.toString(deleteForbidden));

		ARTURIResourceIterator subPropertiesIterator = ((DirectReasoning) ontModel)
				.listDirectSubProperties(property);
		Element subPropertiesElem = XMLHelp.newElement(propElement, "SubProperties");
		while (subPropertiesIterator.hasNext()) {
			ARTURIResource subProp = subPropertiesIterator.next();
			recursiveCreatePropertiesXMLTree(ontModel, subProp, subPropertiesElem, type);
		}
	}

	public Response getPropertyInfo(String propertyQName) {
		return getPropertyInfo(propertyQName, templateandvalued);
	}

	/**
	 * returns all the information associated to property <code>property</code> they contain: domain, range
	 * 
	 * as for the following example:
	 * 
	 * <Tree request="getPropDescription" type="templateandvalued"> <Types> <Type
	 * class="owl:FunctionalProperty" explicit="false"/> <Type class="owl:DatatypeProperty" explicit="false"/>
	 * </Types> <SuperTypes> <SuperType explicit="true" resource="rtv:phone"/> </SuperTypes> <domains> <domain
	 * explicit="false" name="rtv:Person"/> </domains> <ranges> <range explicit="false" name="xsd:string"/>
	 * </ranges> <facets> <symmetric value="false" explicit=""> (zero or one) if this tag is not present, it
	 * is false by default but can be edited to become true, if explicit=false, its status (given by value) is
	 * not editable, otherwise it is <inverseFunctional value="false" explicit=""> (zero or one) if this tag
	 * is not present, it is false by default but can be edited to become true, if explicit=false, its status
	 * (given by value) is not editable, otherwise it is <functional value="false" explicit=""> (zero or one)
	 * if this tag is not present, it is false by default but can be edited to become true, if explicit=false,
	 * its status (given by value) is not editable, otherwise it is <transitive value="false" explicit="">
	 * (zero or one) if this tag is not present, it is false by default but can be edited to become true, if
	 * explicit=false, its status (given by value) is not editable, otherwise it is <inverseOf
	 * value="has_employee" explicit="true"> (zero or one) if this tag is not present, it is false by default
	 * but can be edited to get an inverse </facets> <Properties/> </Tree>
	 * 
	 * 
	 * @param ontModel
	 * @param property
	 * @return
	 */
	public Response getPropertyInfo(String propertyQName, String method) {
		logger.debug("getting property description for: " + propertyQName);
		return getResourceDescription(propertyQName, RDFResourceRolesEnum.property, method);
	}

	public final int addProperty = 0;
	public final int addSuperProperty = 1;
	public final int removeSuperProperty = 2;
	public final int addPropertyDomain = 3;
	public final int removePropertyDomain = 4;
	public final int addPropertyRange = 5;
	public final int removePropertyRange = 6;

	/**
	 * answers with an ack on the result of the import. Th application, upon receving this ack, should request
	 * an update of the imports and namespace mappings panels
	 * 
	 * <Tree type="Ack" request="addProperty"> <result level="ok"/> //oppure "failed" <msg
	 * content="bla bla bla"/> </Tree>
	 * 
	 * 
	 * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports
	 * because an imported ontology may contain other prefix mappings to be imported
	 * 
	 */
	public Response editProperty(String propertyQName, String request, int method, String... parameters) {
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ServletUtilities servletUtilities = new ServletUtilities();
		ARTURIResource property = null;
		String propertyURI;
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
				RepliesStatus.ok);

		try {
			propertyURI = ontModel.expandQName(propertyQName);
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}

		property = ontModel.createURIResource(propertyURI);

		try {
			switch (method) {

			// editProperty(propertyQName, request, addProperty, propertyType, superPropertyQName);
			case addProperty: {

				boolean exists = ontModel.existsResource(property);
				if (exists) {
					logger.error("there is a resource with the same name!");
					return servletUtilities.createExceptionResponse(request,
							"there is a resource with the same name!");
				}

				String propertyType = parameters[0];
				String superPropertyQName = parameters[1];
				logger.debug("ADD PROPERTY, propertyQName: " + propertyQName + ", propertyURI: "
						+ propertyURI + ", propertyType " + propertyType + ", superPropertyQName: "
						+ superPropertyQName);

				ARTURIResource superProperty = null;
				if (superPropertyQName != null)
					superProperty = ontModel.createURIResource(ontModel.expandQName(superPropertyQName));

				// erm....
				if (propertyType.equals("rdf:Property"))
					ontModel.addProperty(propertyURI, superProperty);
				else if (propertyType.equals("owl:ObjectProperty"))
					ontModel.addObjectProperty(propertyURI, superProperty);
				else if (propertyType.equals("owl:DatatypeProperty"))
					ontModel.addDatatypeProperty(propertyURI, superProperty);
				else if (propertyType.equals("owl:AnnotationProperty"))
					ontModel.addAnnotationProperty(propertyURI, superProperty);
				else if (propertyType.equals("owl:OntologyProperty"))
					ontModel.addOntologyProperty(propertyURI, superProperty);
				else
					return servletUtilities.createExceptionResponse(request, propertyType
							+ " is not a recognized property type!");
			}
				Element dataElement = response.getDataElement();
				Element propertyElement = XMLHelp.newElement(dataElement, "property");
				propertyElement.setAttribute("name", propertyQName);
				propertyElement.setAttribute("type", parameters[0]); // parameters[0] = propertyType
				Element superPropertyElement = XMLHelp.newElement(dataElement, "superProperty");
				superPropertyElement.setAttribute("name", parameters[1]); // parameters[1] =
				// superPropertyQName
				break;

			// editProperty(propertyQName, request, addSuperProperty, superPropertyQName);
			case addSuperProperty: {
				ARTURIResource superProperty = ontModel
						.createURIResource(ontModel.expandQName(parameters[0]));
				ontModel.addSuperProperty(property, superProperty);
			}
				break;

			// editProperty(propertyQName, request, removeSuperProperty, superPropertyQName);
			case removeSuperProperty: {
				ARTURIResource superProperty = ontModel
						.createURIResource(ontModel.expandQName(parameters[0]));
				ontModel.removeSuperProperty(property, superProperty);
			}
				break;

			// editProperty(propertyQName, request, addPropertyDomain, domainPropertyQName);
			case addPropertyDomain: {
				ARTURIResource domainProperty = ontModel.createURIResource(ontModel
						.expandQName(parameters[0]));
				ontModel.addPropertyDomain(property, domainProperty);
			}
				break;

			// editProperty(propertyQName, request, removePropertyDomain, domainPropertyQName);
			case removePropertyDomain: {
				ARTURIResource domainProperty = ontModel.createURIResource(ontModel
						.expandQName(parameters[0]));
				ontModel.removePropertyDomain(property, domainProperty);
			}
				break;

			// editProperty(propertyQName, request, addPropertyRange, rangePropertyQName);
			case addPropertyRange: {
				ARTURIResource rangeProperty = ontModel
						.createURIResource(ontModel.expandQName(parameters[0]));
				ontModel.addPropertyRange(property, rangeProperty);
			}
				break;

			// editProperty(propertyQName, request, removePropertyRange, rangePropertyQName);
			case removePropertyRange: {
				ARTURIResource rangeProperty = ontModel
						.createURIResource(ontModel.expandQName(parameters[0]));
				ontModel.removePropertyRange(property, rangeProperty);
			}
				break;

			}

		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(request, e);
		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(request, e);
		}

		// ResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
		// RepliesStatus.ok);
		return response;
	}

	/**
	 * @param request
	 * @param individualQName
	 * @param propertyQName
	 * @param valueField
	 *            the object of the newly created statement; may be a literal (typed or plain) as well as a
	 *            qname for an uri object
	 * @param rangeQName
	 * @return
	 */
	public Response editPropertyValue(String request, String individualQName, String propertyQName,
			String valueString, RDFTypesEnum valueType, String rangeQName, String lang) {
		OWLModel model = ProjectManager.getCurrentProject().getOWLModel();
		ServletUtilities servletUtilities = new ServletUtilities();

		String propertyURI;
		ARTURIResource property = null;
		ARTURIResource individual = null;
		ARTResource range = null;
		try {
			propertyURI = model.expandQName(propertyQName);
			String individualURI = model.expandQName(individualQName);

			property = model.createURIResource(propertyURI);
			individual = model.createURIResource(individualURI);

			if (!model.existsResource(property)) {
				logger.debug("there is no property named: " + propertyURI + " !");
				return servletUtilities.createExceptionResponse(request, "there is no property named: "
						+ propertyURI + " !");
			}
			if (individual == null) {
				logger.debug("there is no individual named: " + individualURI + " !");
				return servletUtilities.createExceptionResponse(request, "there is no individual named: "
						+ individualURI + " !");
			}
			if (rangeQName != null) {
				String rangeURI = model.expandQName(rangeQName);
				range = model.createURIResource(rangeURI);
				if (range == null) {
					logger.debug("there is no class named: " + rangeURI + " !");
					return servletUtilities.createExceptionResponse(request, "there is no class named: "
							+ rangeURI + " !");
				}
			}
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}

		if (request.equals("createAndAddPropValue")) {
			try {
				if (valueType == RDFTypesEnum.plainLiteral) {
					logger.debug("instantiating property: " + property + " with value: " + valueString
							+ " and lang: " + lang);
					model.instantiatePropertyWithPlainLiteral(individual, property, valueString, lang);
				} else if (valueType == RDFTypesEnum.typedLiteral) {
					logger.debug("instantiating property: " + property + " with value: " + valueString
							+ "typed after: " + rangeQName);
					model.instantiatePropertyWithTypedLiteral(individual, property, valueString, range
							.asURIResource());
				} else if (valueType == RDFTypesEnum.resource) {
					model.addInstance(model.expandQName(valueString), range);
					ARTURIResource objIndividual = model.createURIResource(model.expandQName(valueString));
					model.instantiatePropertyWithResource(individual, property, objIndividual);
				} else
					return servletUtilities.createExceptionResponse(request, valueType
							+ " is not an admitted type for this value; only " + RDFTypesEnum.plainLiteral
							+ ", " + RDFTypesEnum.typedLiteral + ", and " + RDFTypesEnum.resource
							+ " are admitted ");
			} catch (ModelUpdateException e) {
				// logger.debug(it.uniroma2.art.semanticturkey.utilities.Utilities.printStackTrace(e));
				return servletUtilities.createExceptionResponse(request,
						"error in adding a newly generated property value: " + e.getMessage());
			} catch (ModelAccessException e) {
				return servletUtilities.createExceptionResponse(request, e);
			}
		}
		// this one is only valid for ObjectProperties (and Normal Properties?)
		else if (request.equals("addExistingPropValue")) {
			String valueURI;
			try {
				valueURI = model.expandQName(valueString);
				ARTURIResource valueObject = model.createURIResource(valueURI);
				if (!model.existsResource(valueObject)) {
					logger.debug("there is no object named: " + valueURI + " !");
					return servletUtilities.createExceptionResponse(request, "there is no object named: "
							+ valueURI + " !");
				}
				model.instantiatePropertyWithResource(individual, property, valueObject);
			} catch (ModelAccessException e) {
				return servletUtilities.createExceptionResponse(request, e);
			} catch (ModelUpdateException e) {
				return servletUtilities.createExceptionResponse(request,
						"error in adding a newly generated property value: " + e.getMessage());
			}
		} else if (request.equals("removePropValue")) {
			try {
				if (valueType == RDFTypesEnum.plainLiteral)
					model.deleteTriple(individual, property, model.createLiteral(valueString, lang));
				else if (valueType == RDFTypesEnum.typedLiteral) {
					model.deleteTriple(individual, property, model.createLiteral(valueString, range
							.asURIResource()));
				} else if (RDFTypesEnum.isResource(valueType)) {
					ARTResource valueResourceObject;
					if (valueType == RDFTypesEnum.uri) {
						String valueURI = model.expandQName(valueString);
						valueResourceObject = model.createURIResource(valueURI);
					} else { // bnode
						valueResourceObject = model.createBNode(valueString);
					}
					if (!model.existsResource(valueResourceObject)) {
						logger.debug("there is no object: " + valueResourceObject + " !");
						return servletUtilities.createExceptionResponse(request, "there is no object: "
								+ valueResourceObject + " !");
					}
					model.deleteTriple(individual, property, valueResourceObject);
				} else {
					return servletUtilities.createErrorResponse(request, "unable to delete value; type: "
							+ valueType + " is not recognized");
				}
			} catch (ModelUpdateException e) {
				logger.debug(it.uniroma2.art.semanticturkey.utilities.Utilities.printStackTrace(e));
				return servletUtilities.createExceptionResponse(request,
						"error in removing a property value: " + e.getMessage());
			} catch (ModelAccessException e) {
				return servletUtilities.createExceptionResponse(request, e);
			}

		} else {
			logger.debug("there is no handler for such request: " + request + " !");
			return servletUtilities.createExceptionResponse(request, "there is no handler for such request: "
					+ request + " !");
		}

		ResponseREPLY response = ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);

		return response;

	}

	public Response parseDataRange(String dataRangeID, String nodeType) {
		String request = Req.parseDataRangeRequest;
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		try {
			ARTResource dataRange = RDFUtilities.retrieveResource(ontModel, dataRangeID, RDFTypesEnum
					.valueOf(nodeType));
			XMLResponseREPLY response = servletUtilities.createReplyResponse(request,
					RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			ARTLiteralIterator it = ontModel.parseDataRange(dataRange, NodeFilters.MAINGRAPH);
			while (it.streamOpen()) {
				RDFXMLHelp.addRDFNodeXMLElement(dataElement, ontModel, it.getNext(), false, true);
			}
			it.close();
			return response;

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		} catch (UnavailableResourceException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		}
	}

	/**
	 * gets a class tree with roots set
	 * 
	 * @return Response tree
	 */
	public Response getDomainClassesTreeXML(String propertyQName) {
		Cls cls = new Cls("cls");
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ARTURIResource property;
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.getDomainClassesTreeRequest, RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		try {
			property = ontModel.createURIResource(ontModel.expandQName(propertyQName));
			ARTResourceIterator domainClasses = ontModel.listPropertyDomains(property, true,
					NodeFilters.MAINGRAPH);
			while (domainClasses.streamOpen()) {
				ARTResource domainClass = domainClasses.getNext();
				if (domainClass.isURIResource())
					cls.recursiveCreateClassesXMLTree(ontModel, domainClass.asURIResource(), dataElement);
			}
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(Req.getDomainClassesTreeRequest, e);
		}

		return response;
	}

	/**
	 * gets a class tree with roots set
	 * 
	 * @return Response tree
	 */
	public Response getRangeClassesTreeXML(String propertyQName) {
		Cls cls = new Cls("cls");
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ARTURIResource property;
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(
				Req.getRangeClassesTreeRequest, RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		try {
			property = ontModel.createURIResource(ontModel.expandQName(propertyQName));
			ARTResourceIterator rangeClasses = ontModel.listPropertyRanges(property, true,
					NodeFilters.MAINGRAPH);
			while (rangeClasses.streamOpen()) {
				ARTResource rangeClass = rangeClasses.getNext();
				if (rangeClass.isURIResource())
					cls.recursiveCreateClassesXMLTree(ontModel, rangeClass.asURIResource(), dataElement);
			}
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(Req.getRangeClassesTreeRequest, e);
		}

		return response;
	}

}
