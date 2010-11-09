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
import it.uniroma2.art.owlart.filter.NoLanguageResourcePredicate;
import it.uniroma2.art.owlart.filter.RootClassesResourcePredicate;
import it.uniroma2.art.owlart.filter.URIResourcePredicate;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.models.DirectReasoning;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFSModel;
import it.uniroma2.art.owlart.navigation.ARTNodeIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.owlart.navigation.RDFIterator;
import it.uniroma2.art.owlart.utilities.RDFIterators;
import it.uniroma2.art.owlart.vocabulary.OWL;
import it.uniroma2.art.owlart.vocabulary.RDFS;
import it.uniroma2.art.owlart.vocabulary.VocabularyTypesEnum;
import it.uniroma2.art.owlart.vocabulary.VocabularyTypesInts;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.filter.DomainResourcePredicate;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.util.Collection;
import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

import com.google.common.base.Predicate;
import com.google.common.base.Predicates;
import com.google.common.collect.Iterators;

/**
 * This class provides services for
 * <ul>
 * <li>generating the class tree</li>
 * <li>generating the instance list for a given class (<em> move it to {@link Individual} ?</em>)</li>
 * <li>creating a new instance from a given class(<em> move it to {@link Individual} !</li>
 * </ul>
 * 
 * @author Donato Griesi, Armando Stellato, Andrea Turbati
 * 
 */
public class Cls extends Resource {

	// GET REQUESTS
	public static final String getClassTreeRequest = "getClassTree";
	public static final String getClassesInfoAsRootsForTreeRequest = "getClassesInfoAsRootsForTree";
	public static final String getClassAndInstancesInfoRequest = "getClassAndInstancesInfo";
	public static final String getSuperClassesRequest = "getSuperClasses";
	public static final String getSubClassesRequest = "getSubClasses";

	// CREATE REQUESTS
	public static final String createInstanceRequest = "createInstance";
	public static final String createClassRequest = "createClass";

	// ADD REQUESTS
	public static final String addTypeRequest = "addType";
	public static final String addSuperClsRequest = "addSuperCls";

	// REMOVE REQUESTS
	public static final String removeTypeRequest = "removeType";
	public static final String removeSuperClsRequest = "removeSuperCls";

	// PARS
	static final public String clsQNameField = "clsName";
	static final public String instanceNamePar = "instanceName";
	static final public String superClassNamePar = "superClassName";
	static final public String newClassNamePar = "newClassName";

	static final public String clsQNamePar = "clsqname";
	static final public String clsesQNamesPar = "clsesqnames";
	static final public String typeQNamePar = "typeqname";
	static final public String treePar = "tree";
	static final public String instNumPar = "instNum";
	static final public String directInstPar = "direct";
	static final public String hasSubClassesPar = "hasSubClasses";
	static final public String labelQueryPar = "labelQuery";

	// final private String subTree = "subTree";

	// VALUES
	static final public String templateandvalued = "templateandvalued";

	static final public String allInstances = "false";
	static final public String directInstances = "true";

	protected static Logger logger = LoggerFactory.getLogger(Cls.class);

	public Cls(String id) {
		super(id);
	}

	public Response getResponse() {
		logger.debug("request to cls");

		Response response = null;
		ServletUtilities servletUtilities = new ServletUtilities();
		Individual individual = new Individual("individual");

		String request = setHttpPar("request");
		// all new fashoned requests are put inside these grace brackets

		try {
			if (request == null)
				return ServletUtilities.getService().createNoSuchHandlerExceptionResponse(request);

			// GET CLASS METHODS
			if (request.equals(getClassTreeRequest)) {
				response = createClassXMLTree();
			} else if (request.equals(getClassAndInstancesInfoRequest)) {
				String clsQName = servletUtilities.removeInstNumberParentheses(setHttpPar(clsQNameField));
				String listMod = setHttpPar(directInstPar);
				String hasSubClassesMod = setHttpPar(hasSubClassesPar);
				checkRequestParametersAllNotNull(clsQNameField);
				response = getClassAndInstancesInfo(clsQName, listMod, hasSubClassesMod);
			} else if (request.equals(getSuperClassesRequest)) {
				String clsQName = servletUtilities.removeInstNumberParentheses(setHttpPar(clsQNameField));
				checkRequestParametersAllNotNull(clsQNameField);
				response = getSuperClasses(clsQName);
			} else if (request.equals(getSubClassesRequest)) {
				String clsQName = servletUtilities.removeInstNumberParentheses(setHttpPar(clsQNameField));
				String tree = setHttpPar(treePar);
				String instNum = setHttpPar(instNumPar);
				checkRequestParametersAllNotNull(clsQNameField);
				boolean treeBool = (tree == null) ? false : (Boolean.parseBoolean(tree));
				boolean instNumBool = (instNum == null) ? false : (Boolean.parseBoolean(instNum));
				String labelQuery = setHttpPar(labelQueryPar);
				response = getSubClasses(clsQName, treeBool, instNumBool, labelQuery);
			} else if (request.equals(getClassesInfoAsRootsForTreeRequest)) {
				String clsesQNames = servletUtilities.removeInstNumberParentheses(setHttpPar(clsesQNamesPar));
				String instNum = setHttpPar(instNumPar);
				boolean instNumBool = (instNum == null) ? false : (Boolean.parseBoolean(instNum));
				checkRequestParametersAllNotNull(clsesQNamesPar);
				response = getClassesInfoAsRootsForTree(clsesQNames, instNumBool);
			}

			// EDIT CLASS METHODS
			else if (request.equals(classDescriptionRequest)) {
				String classQNameEncoded = setHttpPar(clsQNameField);
				String method = setHttpPar("method");
				checkRequestParametersAllNotNull(clsQNameField, "method");
				response = getClassDescription(classQNameEncoded, method);
			} else if (request.equals(createInstanceRequest)) {
				String clsQName = servletUtilities.removeInstNumberParentheses(setHttpPar(clsQNameField));
				String instanceQName = setHttpPar(instanceNamePar);
				checkRequestParametersAllNotNull(instanceNamePar, clsQNameField);
				response = createInstanceOption(instanceQName, clsQName);
			} else if (request.equals(addTypeRequest)) {
				String clsQName = setHttpPar(clsQNamePar);
				String typeQName = setHttpPar(typeQNamePar);
				checkRequestParametersAllNotNull(clsQNamePar, typeQNamePar);
				response = individual.addType(clsQName, typeQName);
			} else if (request.equals(removeTypeRequest))
				response = individual.removeType(setHttpPar("clsqname"), _oReq.getParameter("typeqname"));
			else if (request.equals(addSuperClsRequest))
				response = addSuperClass(setHttpPar("clsqname"), setHttpPar("superclsqname"));
			else if (request.equals(removeSuperClsRequest))
				response = removeSuperClass(setHttpPar("clsqname"), _oReq.getParameter("superclsqname"));
			else if (request.equals(createClassRequest)) {
				String superClassName = setHttpPar(superClassNamePar);
				String newClassName = setHttpPar(newClassNamePar);
				checkRequestParametersAllNotNull(superClassNamePar, newClassNamePar);
				response = createClass(newClassName, superClassName);
			} else
				return ServletUtilities.getService().createNoSuchHandlerExceptionResponse(request);

		} catch (HTTPParameterUnspecifiedException e) {
			return servletUtilities.createUndefinedHttpParameterExceptionResponse(request, e);
		}

		this.fireServletEvent();
		return response;
	}

	/**
	 * 
	 * @author Armando Stellato
	 * 
	 * @param clsQName
	 *            the qname of the class whose instances are being retrieved
	 * @return an xml Response listing the instances of clsQName
	 */
	public Response getClassAndInstancesInfo(String clsQName, String listMod, String hasSubClassesParameter) {
		boolean direct = true;
		boolean hasSubClassesRequest = false;
		if (listMod != null && listMod.equals(allInstances))
			direct = false;
		if (hasSubClassesParameter != null && hasSubClassesParameter.equals("true"))
			hasSubClassesRequest = true;
		logger.debug("replying to \"getInstancesListXML(" + clsQName + ")\"");
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ARTURIResource cls;
		try {
			String clsURI = ontModel.expandQName(clsQName);
			cls = ontModel.createURIResource(clsURI);
			if (cls == null)
				return servletUtilities.createExceptionResponse(getClassAndInstancesInfoRequest, "class: "
						+ clsQName + " is not present in the ontModel");

			XMLResponseREPLY response = servletUtilities.createReplyResponse(getClassAndInstancesInfoRequest,
					RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			dataElement.setAttribute("type", "Instpanel");
			Element root = XMLHelp.newElement(dataElement, "Class");
			root.setAttribute("name", ontModel.getQName(clsURI));

			if (hasSubClassesRequest) {
				RDFIterator<ARTURIResource> subSubClassesIterator = new subClassesIterator(ontModel, cls);
				if (subSubClassesIterator.hasNext())
					root.setAttribute("more", "1"); // the subclass has further subclasses
				else
					root.setAttribute("more", "0"); // the subclass has no subclasses itself
				subSubClassesIterator.close();
			}

			// the instance widget is a tree where the root is the class which has a flat list of children
			// given by its instances. The name of the class is necessary to sync the number of instances
			// reported in brackets near the classes in the classs tree (he has to find the class by
			// its name!)
			String numTotInst = ""
					+ ModelUtilities.getNumberOfClassInstances((DirectReasoning) ontModel, cls, direct);
			root.setAttribute("numTotInst", numTotInst);
			// again, to sync with the class tree (update the number of instances near the name of the
			// classes)
			createInstancesXMLList(ontModel, cls, direct, root);
			return response;
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(getClassAndInstancesInfoRequest, e);
		}
	}

	private void createInstancesXMLList(RDFSModel ontModel, ARTResource cls, boolean direct, Element element)
			throws ModelAccessException {
		Element instancesElement = XMLHelp.newElement(element, "Instances");

		// TODO filter on admin also here
		ARTResourceIterator instancesIterator;
		if (direct)
			instancesIterator = ((DirectReasoning) ontModel).listDirectInstances(cls);
		else
			instancesIterator = ontModel.listInstances(cls, true);

		Collection<ARTResource> explicitInstances = RDFIterators.getCollectionFromIterator(ontModel
				.listInstances(cls, false, NodeFilters.MAINGRAPH));

		while (instancesIterator.streamOpen()) {
			ARTResource instance = instancesIterator.getNext();
			Element instanceElement = XMLHelp.newElement(instancesElement, "Instance");
			// TYPE SETTING
			VocabularyTypesEnum valueType = ModelUtilities.getOntType(instance, ontModel);
			instanceElement.setAttribute("type", valueType.toString());
			// VALUE SETTING
			if (instance.isURIResource()) {
				instanceElement.setAttribute("name", ontModel.getQName(instance.asURIResource().getURI()));
			} else {
				instanceElement.setAttribute("name", ontModel.getQName(instance.toString()));
			}
			// EXPLICIT-STATUS SETTING
			if (explicitInstances.contains(instance))
				instanceElement.setAttribute("explicit", "true");
			else
				instanceElement.setAttribute("explicit", "false");

		}
		instancesIterator.close();

	}

	/**
	 * creates an instance of the class identified by <code>clsQName</code>
	 * 
	 * @param instanceQName
	 * @param clsQName
	 * @return
	 */
	public Response createInstanceOption(String instanceQName, String clsQName) {
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();
		ARTURIResource instanceRes;
		String request = createInstanceRequest;
		try {
			instanceRes = ontModel.createURIResource(ontModel.expandQName(instanceQName));
			if (ModelUtilities.checkExistingResource(ontModel, instanceRes)) {
				return servletUtilities.createExceptionResponse(request,
						"there is another resource with the same name!");
			}
			ARTURIResource clsRes = ontModel.createURIResource(ontModel.expandQName(clsQName));
			ontModel.addInstance(ontModel.expandQName(instanceQName), clsRes);
			logger.debug("dopo add instance");
			return updateClassOnTree(clsQName, instanceQName);
		} catch (ModelAccessException e) {
			logger.error("instance creation error: ", e);
			return servletUtilities.createExceptionResponse(request, e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(request, "instance creation error: "
					+ e.getMessage());
		}
	}

	public Response updateClassOnTree(String clsQName, String instanceName) {
		String request = createInstanceRequest;
		ServletUtilities servletUtilities = new ServletUtilities();
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();
		try {
			XMLResponseREPLY response = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			Element clsElement = XMLHelp.newElement(dataElement, "Class");
			ARTResource cls;

			String clsURI = ontModel.expandQName(clsQName);
			cls = ontModel.createURIResource(clsURI);
			clsElement.setAttribute("clsName", ontModel.getQName(clsURI));
			String numTotInst = ""
					+ ModelUtilities.getNumberOfClassInstances((DirectReasoning) ontModel, cls, true);
			clsElement.setAttribute("numTotInst", numTotInst);
			Element instanceElement = XMLHelp.newElement(dataElement, "Instance");
			instanceElement.setAttribute("instanceName", servletUtilities.decodeLabel(instanceName));
			return response;
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}

	}

	/**
	 * retrieves the class tree rooted on the class identified by <code>clsQName</code>
	 * 
	 * @param clsQName
	 *            the qname of the class which is root for the tree
	 * @return
	 */
	public Response getClassSubTreeXML(String clsQName) {
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();
		ARTURIResource cls;
		String request = getClassTreeRequest;
		try {
			cls = ontModel.createURIResource(ontModel.expandQName(clsQName));
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		try {
			this.recursiveCreateClassesXMLTree(ontModel, cls, dataElement);
		} catch (DOMException e) {
			return ServletUtilities.getService().createExceptionResponse(request,
					"exception raised in building the classes tree: " + e.getMessage());
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}
		return response;
	}

	// TODO, se possibile, togliamo anche quell'odioso: subclasses. Non serve a niente e complica la vita a
	// tutti!
	/**
	 * Crea l'elemento tree nel file xml che contiene l'elenco delle classi e sottoclassi <tt>
	 * <data type="AllClassesTree">
	 * 	<Class deleteForbidden="true" name="filas:Person" numInst="0">
	 * 		<SubClasses>
	 * 			<Class deleteForbidden="true" name="Researcher" numInst="1"/>
	 * 		<SubClasses/>
	 * 	</Class>
	 * 	<Class deleteForbidden="true" name="filas:Organization" numInst="1">
	 * 		<SubClasses/>
	 * 	</Class>
	 * </data>
	 * </tt>
	 * 
	 *@return Response tree
	 */
	public Response createClassXMLTree() {

		String request = getClassTreeRequest;
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();

		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
				RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		Predicate<ARTResource> exclusionPredicate;
		if (Config.isAdminStatus())
			exclusionPredicate = NoLanguageResourcePredicate.nlrPredicate;
		else
			exclusionPredicate = DomainResourcePredicate.domResPredicate;

		Predicate<ARTResource> rootUserClsPred = Predicates.and(new RootClassesResourcePredicate(ontModel),
				exclusionPredicate);
		try {
			ARTURIResourceIterator namedClassesIt = ontModel.listNamedClasses(true);
			Iterator<ARTURIResource> filtIt;
			filtIt = Iterators.filter(namedClassesIt, rootUserClsPred);
			while (filtIt.hasNext()) {
				ARTURIResource cls = filtIt.next().asURIResource();
				recursiveCreateClassesXMLTree(ontModel, cls, dataElement);
			}
			namedClassesIt.close();
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}

		return response;
	}

	/**
	 * recursively creates an xml representation of a class tree starting from a given <code>cls</code> and
	 * from the element <code>element</code> to which the new information need to be attached
	 * <p>
	 * OWL distinguishes six types of class descriptions:
	 * <ul>
	 * <li>a class identifier (a URI reference)</li>
	 * <li>an exhaustive enumeration of individuals that together form the instances of a class</li>
	 * <li>a property restriction</li>
	 * <li>the intersection of two or more class descriptions</li>
	 * <li>the union of two or more class descriptions</li>
	 * <li>the complement of a class description</li>
	 * </ul>
	 * for each of these, a dedicated
	 * </p>
	 * 
	 * @param ontModel
	 * @param cls
	 * @param element
	 * @throws DOMException
	 * @throws ModelAccessException
	 */
	void recursiveCreateClassesXMLTree(RDFSModel ontModel, ARTURIResource cls, Element element)
			throws DOMException, ModelAccessException {
		Element classElement = XMLHelp.newElement(element, "Class");
		boolean deleteForbidden = servletUtilities.checkWriteOnly(cls);
		classElement.setAttribute("name", ontModel.getQName(cls.getURI()));

		int numInst = ModelUtilities.getNumberOfClassInstances((DirectReasoning) ontModel, cls, true);
		if (numInst > 0)
			classElement.setAttribute("numInst", "(" + numInst + ")");
		else
			classElement.setAttribute("numInst", "0");

		classElement.setAttribute("deleteForbidden", Boolean.toString(deleteForbidden));

		ARTResourceIterator subClassesIterator = ((DirectReasoning) ontModel).listDirectSubClasses(cls);
		Iterator<ARTResource> namedSubClassesIterator = Iterators.filter(subClassesIterator,
				URIResourcePredicate.uriFilter);
		Element subClassesElem = XMLHelp.newElement(classElement, "SubClasses");
		while (namedSubClassesIterator.hasNext()) {
			ARTURIResource subClass = namedSubClassesIterator.next().asURIResource();
			recursiveCreateClassesXMLTree(ontModel, subClass, subClassesElem);
		}
		subClassesIterator.close();
	}

	/**
	 * retrieves subclasses of class identified by qname clsQname. The response provides additional info
	 * depending on other arguments' values
	 * 
	 * @param clsQName
	 * @param forTree
	 *            <code>true</code> if this request has been performed to fill an ontology class tree. In this
	 *            case, an attribute called "more" is being provided for each subclass. If its value is 1 then
	 *            the subclass has subclasses itself
	 * @param instNum
	 *            <code>true</code> if the user is interested in knowing the number of instances per concept
	 * @param labelQuery
	 *            if != <code>null</code>, then this String is used to drive custom label providers to return
	 *            appropriate labels to be shown in place of the class qname. Built-in label provider allows
	 *            for retrieving values of a property attached to the class, by using this syntax:<br/>
	 *            <code>prop:&lt;propertyqname&gt;[#&lt;iso code for language&gt;]</code><br/>
	 *            example: "prop:rdfs:label###en" will show the value on property <em>rdfs:label</em> for the
	 *            english language, instead of the class qname<br/>
	 *            the reponse to this method may be a WARNING reply in case the labelQuery does not identify a
	 *            valid property to be used for retrieving labels
	 * @return
	 */
	public Response getSubClasses(String clsQName, boolean forTree, boolean instNum, String labelQuery) {
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();

		String request = getSubClassesRequest;
		try {
			XMLResponseREPLY response = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
			Element dataElement = response.getDataElement();

			String clsURI;

			clsURI = ontModel.expandQName(clsQName);
			ARTURIResource cls = ontModel.createURIResource(clsURI);
			boolean exists = ModelUtilities.checkExistingResource(ontModel, cls);
			if (!exists) {
				logger.error("there is no resource with name: " + clsQName);
				return servletUtilities.createExceptionResponse(request, "there is no resource with name: "
						+ clsQName);
			}

			ARTURIResource labelProp = null;
			String requestedISOLang = null;
			if (labelQuery != null) {
				if (labelQuery.startsWith("prop:")) {
					String queryString = labelQuery.substring(5); // remove the "prop:"
					String[] propStringElements = queryString.split("###");
					String propertyQName = propStringElements[0];
					if (propStringElements.length > 1)
						requestedISOLang = propStringElements[1];

					String propURI = ontModel.expandQName(propertyQName);
					labelProp = ontModel.retrieveURIResource(propURI);
					if (labelProp == null)
						response.setReplyStatusWARNING("label query msg: " + queryString
								+ " returned no valid property in the ontology");
				}
			}

			logger.debug("labelProp: " + labelProp);

			// creating named subclasses iterator
			RDFIterator<ARTURIResource> subClassesIterator = new subClassesIterator(ontModel, cls);

			while (subClassesIterator.streamOpen()) {
				ARTURIResource subClass = subClassesIterator.getNext();
				Element classElement = XMLHelp.newElement(dataElement, "class");

				boolean deleteForbidden = servletUtilities.checkWriteOnly(subClass);
				classElement.setAttribute("deleteForbidden", Boolean.toString(deleteForbidden));

				classElement.setAttribute("name", ontModel.getQName(subClass.getURI()));

				if (instNum) {
					int numInst = ModelUtilities.getNumberOfClassInstances((DirectReasoning) ontModel,
							subClass, true, NodeFilters.MAINGRAPH);
					if (numInst > 0)
						classElement.setAttribute("numInst", "(" + numInst + ")");
					else
						classElement.setAttribute("numInst", "0");
				}

				if (forTree) {
					RDFIterator<ARTURIResource> subSubClassesIterator = new subClassesIterator(ontModel,
							subClass);
					if (subSubClassesIterator.hasNext())
						classElement.setAttribute("more", "1"); // the subclass has further subclasses
					else
						classElement.setAttribute("more", "0"); // the subclass has no subclasses itself
					subSubClassesIterator.close();
				}

				if (labelProp != null) {
					ARTNodeIterator it = ontModel.listValuesOfSubjPredPair(subClass, labelProp, false);

					if (it.streamOpen()) {
						String label = null;
						ARTNode nodeLabel = it.getNext();
						logger.debug("nodeLabel: " + nodeLabel);
						// if node is not a Literal, then get its String representation as the label for the
						// class, else if there is no specified iso-language code, get the label from the
						// literal else get the first value whose language matches the specified iso-language
						if (nodeLabel.isLiteral()) {
							if (requestedISOLang == null) {
								label = nodeLabel.asLiteral().getLabel();
								logger.debug("no preferred ISO language, getting first available label: "
										+ label);
							} else {
								// the rationale behind this odd nested loop is to avoid all other checks
								// (such as the availability of the requestedISOLang or checking the nature of
								// the nodeLabel) to be repeated for each value of the label property
								while (label == null) {
									ARTLiteral literalLabel = nodeLabel.asLiteral();
									String gotISOLang = literalLabel.getLanguage();
									logger.debug("iso lang for " + nodeLabel + ": " + gotISOLang);
									if (gotISOLang.equals(requestedISOLang)) {
										label = literalLabel.getLabel();
									}
									if (it.streamOpen())
										nodeLabel = it.getNext();
									else
										break;
								}
							}
						} else
							label = nodeLabel.toString();

						if (label != null)
							classElement.setAttribute("label", label);
					}
				}

			}
			subClassesIterator.close();
			return response;

		} catch (ModelAccessException e) {
			logger.error(request + ":" + e);
			return servletUtilities.createExceptionResponse(request, e);
		}

	}

	private class subClassesIterator implements RDFIterator<ARTURIResource> {

		RDFIterator<? extends ARTResource> subClassesIterator;
		Iterator<? extends ARTResource> finalIterator;

		subClassesIterator(RDFSModel ontModel, ARTURIResource superCls) throws ModelAccessException {
			// to check that even with a non-owl reasoning triple-store, root classes are computed as children
			// of owl:Thing
			if (superCls.equals(OWL.Res.THING)) {
				logger.debug("looking for subclasses of owl:Thing, using method for retrieving root classes");
				Predicate<ARTResource> exclusionPredicate;
				if (Config.isAdminStatus())
					exclusionPredicate = NoLanguageResourcePredicate.nlrPredicate;
				else
					exclusionPredicate = DomainResourcePredicate.domResPredicate;

				Predicate<ARTResource> rootUserClsPred = Predicates.and(new RootClassesResourcePredicate(
						ontModel), exclusionPredicate);

				subClassesIterator = ontModel.listNamedClasses(true, NodeFilters.MAINGRAPH);
				finalIterator = Iterators.filter(subClassesIterator, rootUserClsPred);

			} else {
				subClassesIterator = ((DirectReasoning) ontModel).listDirectSubClasses(superCls);
				finalIterator = Iterators.filter(subClassesIterator, URIResourcePredicate.uriFilter);
			}
		}

		public void close() throws ModelAccessException {
			subClassesIterator.close();
		}

		public ARTURIResource getNext() throws ModelAccessException {
			return finalIterator.next().asURIResource();
		}

		public boolean streamOpen() throws ModelAccessException {
			return finalIterator.hasNext();
		}

		public boolean hasNext() {
			return finalIterator.hasNext();
		}

		public ARTURIResource next() {
			return finalIterator.next().asURIResource();
		}

		public void remove() {
			subClassesIterator.remove();
		}

	}

	/**
	 * retrieves info about classes identified by qnames concatenated through symbol |_| into
	 * <code>clsesQNamesString</code> <br/>
	 * The response provides additional info depending on other arguments' values.<br/>
	 * 
	 * @param clsesQNamesString
	 * @param instNumBool
	 *            <code>true</code> if the requester is interested also in the number of instances of these
	 *            classes
	 * @return
	 */
	public Response getClassesInfoAsRootsForTree(String clsesQNamesString, boolean instNumBool) {
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();

		String request = getClassesInfoAsRootsForTreeRequest;
		XMLResponseREPLY response = servletUtilities.createReplyResponse(request, RepliesStatus.ok);
		Element dataElement = response.getDataElement();

		String[] clsesQNames = clsesQNamesString.split("\\|_\\|");

		for (String clsQName : clsesQNames) {

			String clsURI;
			try {
				clsURI = ontModel.expandQName(clsQName);
				ARTURIResource cls = ontModel.createURIResource(clsURI);
				boolean exists = ModelUtilities.checkExistingResource(ontModel, cls);
				if (!exists) {
					logger.error("there is no resource with name: " + clsQName);
					return servletUtilities.createExceptionResponse(request,
							"there is no resource with name: " + clsQName);
				}

				Element classElement = XMLHelp.newElement(dataElement, "class");
				// class name
				classElement.setAttribute("name", ontModel.getQName(cls.getURI()));
				// class deletable?
				classElement.setAttribute("deleteForbidden", Boolean.toString(servletUtilities
						.checkWriteOnly(cls)));
				// class has children?
				RDFIterator<ARTURIResource> subClassesIterator = new subClassesIterator(ontModel, cls);
				if (subClassesIterator.hasNext())
					classElement.setAttribute("more", "1"); // the subclass has further subclasses
				else
					classElement.setAttribute("more", "0"); // the subclass has no subclasses itself
				subClassesIterator.close();

				if (instNumBool) {
					int numInst = ModelUtilities.getNumberOfClassInstances((DirectReasoning) ontModel, cls,
							true);
					if (numInst > 0)
						classElement.setAttribute("numInst", "(" + numInst + ")");
					else
						classElement.setAttribute("numInst", "0");
				}

			} catch (ModelAccessException e) {
				logger.error(request + ":" + e);
				return servletUtilities.createExceptionResponse(request, e);
			}

		}
		return response;

	}

	/*
	 * public representRestriction(Element el, OWLModel ontModel) { OWL i; ontModel.listStatements(subj,
	 * OWL.Res., obj, inferred, graphs); }
	 */

	/**
	 * gets the namespace mapping for the loaded ontology
	 * 
	 * <Tree type="add_superclass"> <Type qname="rtv:Person"/> </Tree>
	 * 
	 */
	public Response addSuperClass(String clsQName, String superclsQName) {
		logger.debug("replying to \"addSuperClass(" + clsQName + "," + superclsQName + ")\".");
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();
		String request = addSuperClsRequest;

		ARTURIResource cls;
		String superClsURI;
		try {
			superClsURI = ontModel.expandQName(superclsQName);
			cls = ontModel.createURIResource(ontModel.expandQName(clsQName));
			ARTURIResource superCls = ontModel.createURIResource(superClsURI);
			if (cls == null)
				return ServletUtilities.getService().createExceptionResponse(request,
						clsQName + " is not present in the ontology");

			if (superCls == null)
				return ServletUtilities.getService().createExceptionResponse(request,
						superclsQName + " is not present in the ontology");

			Collection<ARTResource> superClasses = RDFIterators
					.getCollectionFromIterator(((DirectReasoning) ontModel).listDirectSuperClasses(cls));

			if (superClasses.contains(superCls))
				return ServletUtilities.getService().createExceptionResponse(request,
						superclsQName + " is already a type for: " + clsQName);

			ontModel.addSuperClass(cls, superCls);

			XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
					RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			Element typeElement = XMLHelp.newElement(dataElement, "Type");
			typeElement.setAttribute("qname", ontModel.getQName(superClsURI));
			return response;

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		} catch (ModelUpdateException e) {
			return ServletUtilities.getService().createExceptionResponse(request,
					"error in adding type: " + superclsQName + " to cls " + clsQName + ": " + e.getMessage());
		}

	}

	// STARRED ti serve pure il nome della istanza?
	/**
	 * gets the namespace mapping for the loaded ontology
	 * 
	 * <Tree type="remove_superclass"> <Type qname="rtv:Person"/> </Tree>
	 * 
	 */
	public Response removeSuperClass(String clsQName, String superClassQName) {
		logger.debug("replying to \"removeType(" + clsQName + "," + superClassQName + ")\".");
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();
		ServletUtilities servletUtilities = ServletUtilities.getService();
		String request = removeSuperClsRequest;
		ARTResource cls;
		String superClassURI;
		try {
			superClassURI = ontModel.expandQName(superClassQName);
			cls = ontModel.createURIResource(ontModel.expandQName(clsQName));
			ARTResource superCls = ontModel.createURIResource(superClassURI);

			if (cls == null)
				return servletUtilities.createExceptionResponse(request, clsQName
						+ " is not present in the ontology");

			if (superCls == null)
				return servletUtilities.createExceptionResponse(request, superClassQName
						+ " is not present in the ontology");

			Collection<ARTResource> superClasses = RDFIterators
					.getCollectionFromIterator(((DirectReasoning) ontModel).listDirectSuperClasses(cls));

			if (!superClasses.contains(superCls))
				return servletUtilities.createExceptionResponse(request, superClassQName
						+ " is not a superclass for: " + clsQName);

			if (!ontModel.hasTriple(cls, RDFS.Res.SUBCLASSOF, superCls, false, NodeFilters.MAINGRAPH))
				return servletUtilities
						.createExceptionResponse(
								request,
								"this sublcass relationship comes from an imported ontology or has been inferred, so it cannot be deleted explicitly");

			ontModel.removeSuperClass(cls, superCls);

			XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
					RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			Element typeElement = XMLHelp.newElement(dataElement, "Type");
			typeElement.setAttribute("qname", ontModel.getQName(superClassURI));
			return response;

		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(request, e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(request, "error in removing superclass: "
					+ superClassQName + " from class " + clsQName + ": " + e.getMessage());
		}

	}

	/**
	 * very similar to {@link Individual#getIndividualDescription(String, String)} , it contains additional
	 * features for classes (rdfs:subClassOf property is reported apart).
	 * 
	 * @param subjectClassQName
	 *            the instance to which the new instance is related to
	 * @return
	 * 
	 *         This is a sample of the
	 * 
	 *         <pre>
	 * prova
	 * <Tree request="getClsDescription" type="templateandvalued">
	 * 	<Types>
	 * 		<Type class="owl:Class" explicit="true"/>
	 * </Types>
	 * <SuperTypes>
	 * 	<SuperType explicit="true" resource="rtv:Person"/>
	 * </SuperTypes>
	 * <Properties/>
	 * </Tree>
	 * </pre>
	 * 
	 */
	public Response getClassDescription(String subjectClassQName, String method) {
		logger.debug("getClassDescription; qname: " + subjectClassQName);
		return getResourceDescription(subjectClassQName, VocabularyTypesInts.cls, method);
	}

	public Response createClass(String newClassQName, String superClassQName) {
		String request = createClassRequest;
		logger.debug("willing to create class: " + newClassQName + " as subClassOf: " + superClassQName);
		RDFSModel ontModel = (RDFSModel) ProjectManager.getCurrentProject().getOntModel();
		logger.debug("ontModel: " + ontModel);
		String newClassURI;
		String superClassURI;
		try {
			superClassURI = ontModel.expandQName(superClassQName);
			logger.debug("superClassQName: " + superClassQName + " expanded in: " + superClassURI);
			newClassURI = ontModel.expandQName(newClassQName);
			ARTURIResource res = ontModel.createURIResource(newClassURI);
			boolean exists = ModelUtilities.checkExistingResource(ontModel, res);
			if (exists) {
				logger.error("there is a resource with the same name!");
				return servletUtilities.createExceptionResponse(request,
						"there is a resource with the same name!");
			}
			ARTResource superClassResource = ontModel.createURIResource(superClassURI);
			logger.debug("trying to create class: " + newClassURI + " as subClassOf: " + superClassResource);

			ontModel.addClass(newClassURI);
			ontModel.addSuperClass(res, superClassResource);

			XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request,
					RepliesStatus.ok);
			Element dataElement = response.getDataElement();
			Element clsElement = XMLHelp.newElement(dataElement, "class");
			clsElement.setAttribute("name", ontModel.getQName(newClassURI));
			Element superClsElement = XMLHelp.newElement(dataElement, "superclass");
			superClsElement.setAttribute("name", ontModel.getQName(superClassURI));
			return response;

		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse(request, e);
		} catch (ModelUpdateException e) {
			return servletUtilities.createExceptionResponse(request, e);
		}

	}

	public Response getSuperClasses(String clsQName) {
		return getSuperTypes(Cls.getSuperClassesRequest, clsQName, VocabularyTypesInts.cls);
	}

}
