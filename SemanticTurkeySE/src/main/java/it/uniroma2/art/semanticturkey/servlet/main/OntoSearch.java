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
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.models.RDFSModel;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.owlart.vocabulary.VocabularyTypesStrings;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.CompareNames;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

/**Classe che effettua la ricerca di una parola all'interno dell'ontologia*/
/**
 * @author Donato Griesi, Armando Stellato Contributor(s): Andrea Turbati
 */
public class OntoSearch extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(OntoSearch.class);
	// public String XSLpath = Profile.getUserDataPath() + "/components/lib/xsl/search.xsl";
	public final double THRESHOLD = 0.70;

	public static String searchOntologyRequest = "searchOntology";

	public OntoSearch(String id) {
		super(id);
	}

	/**
	 * Metodo che effettua la ricerca di una parola all'interno dell'ontologia e restituisce l'elemento xml
	 * contenente la lista dei risultati
	 * 
	 * @return Document xml
	 */
	public Response getResponse() {
		ServletUtilities servletUtilities = new ServletUtilities();
		String request = setHttpPar("request");
		this.fireServletEvent();
		try {
			if (request.equals(searchOntologyRequest)) {
				String inputString = setHttpPar("inputString");
				String types = setHttpPar("types");
				checkRequestParametersAllNotNull("inputString", "types");
				return searchOntology(inputString, types); // types
			} else
				return servletUtilities.createNoSuchHandlerExceptionResponse(request);
		} catch (HTTPParameterUnspecifiedException e) {
			return servletUtilities.createUndefinedHttpParameterExceptionResponse(request, e);
		}

	}

	/**
	 * if an exact match is obtained, return only this result, otherwise search for ontology objects with
	 * similar localnames. if namespace (prefix) is given, search only for objects with similar localnames
	 * with that namespace (prefix)
	 * 
	 * <Tree type="ontSearch"> <found name="rtv:phoneNumber" type="owl:DatatypeProperty"/> <found
	 * name="rtv:produces" type="owl:ObjectProperty"/> <found name="rtv:role" type="owl:ObjectProperty"/>
	 * </Tree>
	 * 
	 * admitted types are given by strings in {@link}VocabularyTypesStrings class
	 * 
	 * @param inputString
	 * @return
	 */
	public Response searchOntology(String inputString, String types) {
		ServletUtilities servletUtilities = ServletUtilities.getService();
		String request = searchOntologyRequest;
		logger.debug("searchString: " + inputString);

		// concistency check on proposed types
		if (!types.equals("property") && !types.equals("clsNInd"))
			return servletUtilities.createExceptionResponse(request,
					"\"types\" parameter not correctly specified in GET request");

		RDFModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		ArrayList<Struct> results = new ArrayList<Struct>();

		String inputStringExpandedQName;
		try {
			inputStringExpandedQName = ontModel.expandQName(inputString);
			URI i;
			boolean wellFormedAndAbsolute = true;
			try {
				i = new URI(inputStringExpandedQName);
				wellFormedAndAbsolute = i.isAbsolute();
			} catch (URISyntaxException e) {
				wellFormedAndAbsolute = false;
			}

			logger.debug("inputStringExpandedQName: " + inputStringExpandedQName + " well-formed&Absolute: "
					+ wellFormedAndAbsolute);

			// STARRED TODO optimize it!
			ARTURIResource perfectMatchingResource = null;
			if (wellFormedAndAbsolute)
				perfectMatchingResource = ontModel.createURIResource(inputStringExpandedQName);
			if (ModelUtilities.checkExistingResource(ontModel, perfectMatchingResource)) {
				if ((ontModel instanceof RDFSModel)
						&& ((RDFSModel) ontModel).isClass(perfectMatchingResource))
					results.add(new Struct(VocabularyTypesStrings.cls, perfectMatchingResource, null, 1));
				else if (ontModel.isProperty(perfectMatchingResource))
					results
							.add(new Struct(VocabularyTypesStrings.property, perfectMatchingResource, null, 1));
				else
					results.add(new Struct(VocabularyTypesStrings.individual, perfectMatchingResource, null,
							1));
			} else {

				String searchStringNamespace = null;
				String searchStringLocalName = null;
				String searchStringPrefix = null;
				boolean namespaceGiven = false;
				boolean prefixGiven = false;

				if (inputString.contains("#")) {
					searchStringNamespace = inputString.substring(0, inputString.lastIndexOf("#") + 1);
					searchStringLocalName = inputString.substring(inputString.lastIndexOf("#") + 1);
					namespaceGiven = true;
				} else if (inputString.contains("/")) {
					searchStringNamespace = inputString.substring(0, inputString.lastIndexOf("/") + 1);
					searchStringLocalName = inputString.substring(inputString.lastIndexOf("/") + 1);
					namespaceGiven = true;
				} else if (inputString.contains(":")) {
					searchStringLocalName = inputString.substring(inputString.lastIndexOf(":") + 1);
					searchStringPrefix = inputString.substring(0, inputString.lastIndexOf(":"));
					searchStringNamespace = ontModel.getNSForPrefix(searchStringPrefix);
					namespaceGiven = true;
					prefixGiven = true;
				} else
					searchStringLocalName = inputString;

				System.out.println(searchStringNamespace + " " + searchStringLocalName);
				System.out.println("searchStringNamespace availability: "
						+ ModelUtilities.isAvailableNamespace(ontModel, searchStringNamespace));

				if (namespaceGiven && !ModelUtilities.isAvailableNamespace(ontModel, searchStringNamespace)) {
					logger
							.debug("namespace: "
									+ searchStringNamespace
									+ " associated to prefix: "
									+ searchStringPrefix
									+ " is not recognized in this ontology, please use an existing prefix to restrict your search or do not use a prefix at all to search the whole ontology");
					if (prefixGiven)
						return servletUtilities
								.createExceptionResponse(
										request,
										"namespace: "
												+ searchStringNamespace
												+ " associated to prefix: "
												+ searchStringPrefix
												+ " is not recognized in this ontology, please use an existing prefix to restrict your search or do not use a prefix at all to search the whole ontology");
					else
						return servletUtilities
								.createExceptionResponse(
										request,
										"namespace: "
												+ searchStringNamespace
												+ " is not recognized in this ontology, please use an existing namespace to restrict your search or do not use a namespace at all to search the whole ontology");
				}

				if (types.equals("clsNInd")) {
					ARTURIResourceIterator searchedResources;
					if (ontModel instanceof RDFSModel) {
						searchedResources = ((RDFSModel) ontModel).listNamedClasses(true,
								NodeFilters.MAINGRAPH);
						logger.debug("collectResults for classes: ");
						collectResults(searchedResources, results, searchStringNamespace,
								searchStringLocalName, namespaceGiven, VocabularyTypesStrings.cls);
					}
					logger.debug("collectResults for instances: ");
					searchedResources = ontModel.listNamedInstances();
					collectResults(searchedResources, results, searchStringNamespace, searchStringLocalName,
							namespaceGiven, VocabularyTypesStrings.individual);
				} else { // property
					ARTURIResourceIterator searchedProperties;

					if (ontModel instanceof OWLModel) {

						searchedProperties = ((OWLModel) ontModel).listObjectProperties(true,
								NodeFilters.MAINGRAPH);
						collectResults(searchedProperties, results, searchStringNamespace,
								searchStringLocalName, namespaceGiven, VocabularyTypesStrings.objectProperty);

						searchedProperties = ((OWLModel) ontModel).listDatatypeProperties(true,
								NodeFilters.MAINGRAPH);
						collectResults(searchedProperties, results, searchStringNamespace,
								searchStringLocalName, namespaceGiven,
								VocabularyTypesStrings.datatypeProperty);

						searchedProperties = ((OWLModel) ontModel).listAnnotationProperties(true,
								NodeFilters.MAINGRAPH);
						collectResults(searchedProperties, results, searchStringNamespace,
								searchStringLocalName, namespaceGiven,
								VocabularyTypesStrings.annotationProperty);

					}

					searchedProperties = ontModel.listProperties(NodeFilters.MAINGRAPH);
					collectResults(searchedProperties, results, searchStringNamespace, searchStringLocalName,
							namespaceGiven, VocabularyTypesStrings.property);
				}

			}

			StructComparator sc = new StructComparator();
			Collections.sort(results, sc);

			System.out.println("results: " + results);

		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}

		return xmlizeResults(ontModel, results);
	}

	private Response xmlizeResults(RDFModel rep, ArrayList<Struct> results) {
		String request = searchOntologyRequest;
		XMLResponseREPLY response = ServletUtilities.getService().createReplyResponse(request, RepliesStatus.ok);
		Element dataElement = response.getDataElement();
		try {
			for (Struct result : results) {
				Element newElement = XMLHelp.newElement(dataElement, "found");
				newElement.setAttribute("name", rep.getQName(result._resource.getURI()));
				newElement.setAttribute("type", result._type);
			}
		} catch (DOMException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e.getMessage());
		} catch (ModelAccessException e) {
			return ServletUtilities.getService().createExceptionResponse(request, e);
		}

		return response;
	}

	private void collectResults(Iterator<ARTURIResource> searchedResources, ArrayList<Struct> results,
			String searchStringNamespace, String searchStringLocalName, boolean namespaceGiven, String type) {
		double match;
		while (searchedResources.hasNext()) {
			ARTURIResource nextClass = searchedResources.next();
			System.out.println("comparing resource: " + nextClass);
			if (checkNS(namespaceGiven, nextClass.getNamespace(), searchStringNamespace))
				if ((match = CompareNames
						.compareSimilarNames(nextClass.getLocalName(), searchStringLocalName)) >= THRESHOLD)
					results.add(new Struct(type, nextClass, null, match));
		}
	}

	/**
	 * the test is passed if the search String did not contain a namespace or if its namespace equals the
	 * namespace of the considered resource
	 * 
	 * @param namespaceGiven
	 * @param iteratedNamespace
	 * @param searchStringNamespace
	 * @return
	 */
	private boolean checkNS(boolean namespaceGiven, String iteratedNamespace, String searchStringNamespace) {
		if (namespaceGiven)
			return (searchStringNamespace.equals(iteratedNamespace));
		else
			return true;
	}

	private class Struct {
		public String _type;
		public ARTURIResource _resource;
		// public String _lexicalization;
		public double _value;

		public Struct(String type, ARTURIResource resource, String lexicalization, double value) {
			_type = type;
			_resource = resource;
			// _lexicalization = lexicalization;
			_value = value;
		}

		public String toString() {
			return (_resource + ";type:" + _type + "match:" + _value);
		}

	}

	private class StructComparator implements Comparator<Struct> {

		public int compare(Struct struct0, Struct struct1) {

			if (struct0._value > struct1._value)
				return -1;
			else if (struct0._value == struct1._value)
				return 0;
			return 1;
		}
	}

}
