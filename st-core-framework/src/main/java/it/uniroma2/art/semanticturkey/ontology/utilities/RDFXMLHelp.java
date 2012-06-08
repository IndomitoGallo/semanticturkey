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
 * The Original Code is Semantic Turkey.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2010.
 * All Rights Reserved.
 *
 * Semantic Turkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about Semantic Turkey can be obtained at 
 * http://semanticturkey.uniroma2.it
 *
 */

package it.uniroma2.art.semanticturkey.ontology.utilities;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.RDFIterator;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.utilities.RDFRenderer;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.owlart.vocabulary.RDFTypesEnum;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.util.Collection;
import java.util.Map;
import java.util.Map.Entry;

import org.w3c.dom.DOMException;
import org.w3c.dom.Element;

/**
 * This class has nothing to do with the RDFXML standard for serializing RDF graphs.<br/>
 * 
 * It contains instead facility methods for rendering the description of RDF nodes in XML, according to the
 * syntax used in Semantic Turkey's service's response<br/>
 * 
 * @author Armando Stellato <a href="mailto:stellato@info.uniroma2.it">stellato@info.uniroma2.it</a>
 * 
 */
public class RDFXMLHelp {

	/**
	 * This method renders the description of a RDF node under a single XML Element, and additional
	 * information that needs to be presented can be defined in the request. <br/>
	 * First, the nature ({@link RDFTypesEnum}) of the node is revealed, among:
	 * <ul>
	 * <li>uri</li>
	 * <li>bnode</li>
	 * <li>plainLiteral</li>
	 * <li>typedLiteral</li>
	 * </ul>
	 * then additional information, such as the node <em>role</em> ({@link RDFResourceRolesEnum}), can be
	 * optionally added<br/>
	 * an optional <code>rendering</code> argument enables for a rendered visualization of the node<br/>
	 * <br/>
	 * <em>Note: of the above options, only the <code>role</code> requires further retrieval operations. For this
	 * reason, it should be used with care, only when the nature of the resource is known to be variable and
	 * the user is interested in knowing it</em><br/>
	 * <br/>
	 * 
	 * 
	 * @param parent
	 *            the XML parent element the newly created description is attached to
	 * @param model
	 *            the model to be queried for describing the RDFNode
	 * @param node
	 *            the node which is being described
	 * @param role
	 *            when <code>true</code>, if the node is a resource, it tells the role of the resource (cls,
	 *            ontology, property...). see {@link RDFResourceRolesEnum}
	 * @param rendering
	 *            If true, it provides a human readable representation of the node
	 *            <ul>
	 *            <li>a <code>show</code> attribute representing the node</li>
	 *            <li>if the value is a typed literal, a <code>typeQName</code> attribute providing a qname
	 *            for the datatype</li>
	 *            </ul>
	 * @return
	 * @throws DOMException
	 * @throws ModelAccessException
	 */
	public static Element addRDFNode(Element parent, RDFModel model, ARTNode node, boolean role,
			boolean rendering) throws DOMException, ModelAccessException {
		Element nodeElement;
		if (node.isResource()) {
			if (node.isURIResource()) {
				nodeElement = XMLHelp.newElement(parent, RDFTypesEnum.uri.toString());
				String uri = node.asURIResource().getURI();
				nodeElement.setTextContent(uri);
			} else { // (node.isBlank())
				nodeElement = XMLHelp.newElement(parent, RDFTypesEnum.bnode.toString());
				nodeElement.setTextContent(node.asBNode().getID());
			}
			if (role)
				nodeElement.setAttribute("role", ModelUtilities.getResourceRole(node.asResource(), model)
						.toString());
		} else {
			// literal
			ARTLiteral lit = node.asLiteral();
			ARTURIResource dt = lit.getDatatype();
			if (dt != null) {
				// typed literal
				nodeElement = XMLHelp.newElement(parent, RDFTypesEnum.typedLiteral.toString());
				nodeElement.setAttribute("type", dt.getURI());
				if (rendering)
					nodeElement.setAttribute("typeQName", model.getQName(dt.getURI()));
			} else {
				// plain literal
				nodeElement = XMLHelp.newElement(parent, RDFTypesEnum.plainLiteral.toString());
				String lang = lit.getLanguage();
				if (lang != null)
					nodeElement.setAttribute("lang", lang);
			}
			nodeElement.setTextContent(lit.getLabel());
		}

		if (rendering) {
			nodeElement.setAttribute("show", RDFRenderer.renderRDFNode(model, node));
		}

		return nodeElement;
	}

	/**
	 * serializes an STRDFResource under <code>parent</code> XML element
	 * 
	 * @param parent
	 * @param node
	 * @return
	 * @throws DOMException
	 */
	public static Element addRDFResource(Element parent, STRDFResource node) throws DOMException {
		Element nodeElement;
		if (node.isURIResource()) {
			nodeElement = XMLHelp.newElement(parent, RDFTypesEnum.uri.toString());
		} else { // (node.isBlank())
			nodeElement = XMLHelp.newElement(parent, RDFTypesEnum.bnode.toString());
		}
		nodeElement.setTextContent(node.getARTNode().getNominalValue());
		RDFResourceRolesEnum role = node.getRole();
		if (role != null)
			nodeElement.setAttribute("role", role.toString());

		String rendering = node.getRendering();
		if (rendering != null)
			nodeElement.setAttribute("show", rendering);

		nodeElement.setAttribute("explicit", Boolean.toString(node.isExplicit()));

		serializeMap(nodeElement, node);

		return nodeElement;
	}

	/**
	 * serializes an STRDFLiteral under <code>parent</code> XML element
	 * 
	 * @param parent
	 * @param node
	 * @return
	 * @throws DOMException
	 */
	public static Element addRDFLiteral(Element parent, STRDFLiteral node) throws DOMException {
		Element nodeElement;

		if (node.isTypedLiteral()) {
			// typed literal
			nodeElement = XMLHelp.newElement(parent, RDFTypesEnum.typedLiteral.toString());
			nodeElement.setAttribute("type", node.getDatatypeURI());
			String dtQName = node.getDatatypeQName();
			if (dtQName != null)
				nodeElement.setAttribute("typeQName", dtQName);
		} else {
			// plain literal
			nodeElement = XMLHelp.newElement(parent, RDFTypesEnum.plainLiteral.toString());
			String lang = node.getLanguage();
			if (lang != null)
				nodeElement.setAttribute("lang", lang);
		}
		nodeElement.setTextContent(node.getLabel());

		serializeMap(nodeElement, node);

		return nodeElement;
	}

	/**
	 * serializes an ARTNode under an XML Element
	 * 
	 * @param parent
	 * @param node
	 * @return
	 * @throws DOMException
	 * @throws ModelAccessException
	 */
	public static Element addRDFNode(Element parent, ARTNode node) throws DOMException, ModelAccessException {
		return addRDFNode(parent, null, node, false, false);
	}

	/**
	 * serializes a STRDFNode under an XML Element
	 * 
	 * @param parent
	 * @param node
	 * @return
	 * @throws DOMException
	 */
	public static Element addRDFNode(Element parent, STRDFNode node) throws DOMException {
		if (node.isResource())
			return addRDFResource(parent, (STRDFResource) node);
		else
			return addRDFLiteral(parent, (STRDFLiteral) node);

	}

	/**
	 * serializes an STRDFNode into a response
	 * 
	 * @param resp
	 * @param node
	 * @return
	 * @throws DOMException
	 */
	public static <RDFType extends STRDFNode> Element addRDFNode(XMLResponseREPLY resp, RDFType node)
			throws DOMException {
		Element dataElement = resp.getDataElement();
		return addRDFNode(dataElement, node);
	}

	/**
	 * serializes the iterator under a specific XML Element<br/>
	 * this method closes the iterator
	 * 
	 * @param parent
	 * @param model
	 * @param nodes
	 * @param role
	 * @param rendering
	 * @return
	 * @throws DOMException
	 * @throws ModelAccessException
	 */
	public static <RDFType extends ARTNode> Element addRDFNodes(Element parent, RDFModel model,
			RDFIterator<RDFType> nodes, boolean role, boolean rendering) throws DOMException,
			ModelAccessException {
		Element collectionElement = XMLHelp.newElement(parent, "collection");
		while (nodes.streamOpen()) {
			addRDFNode(collectionElement, model, nodes.getNext(), role, rendering);
		}
		nodes.close();
		return collectionElement;
	}

	/**
	 * serializes the collection under a specific XML Element
	 * 
	 * @param parent
	 * @param nodes
	 * @return
	 */
	public static <RDFType extends STRDFNode> Element addRDFNodes(Element parent, Collection<RDFType> nodes) {
		Element collectionElement = XMLHelp.newElement(parent, "collection");
		for (RDFType node : nodes) {
			addRDFNode(collectionElement, node);
		}
		return collectionElement;
	}

	/**
	 * serializes the collection in a response
	 * 
	 * @param resp
	 * @param nodes
	 * @return
	 */
	public static <RDFType extends STRDFNode> Element addRDFNodes(XMLResponseREPLY resp,
			Collection<RDFType> nodes) {
		Element dataElement = resp.getDataElement();
		Element collectionElement = XMLHelp.newElement(dataElement, "collection");
		for (RDFType node : nodes) {
			addRDFNode(collectionElement, node);
		}
		return collectionElement;
	}

	/**
	 * serializes the collection in a response under a given identifier named after argument
	 * <code>collectionName</code>
	 * 
	 * @param resp
	 * @param collectionName
	 * @param nodes
	 * @return the XML element created after <code>collectionName</code> and wrapping the serialized
	 *         collection
	 */
	public static <RDFType extends STRDFNode> Element addRDFNodes(XMLResponseREPLY resp,
			String collectionName, Collection<RDFType> nodes) {
		Element dataElement = resp.getDataElement();
		Element collectionNameElem = XMLHelp.newElement(dataElement, collectionName);
		addRDFNodes(collectionNameElem, nodes);
		return collectionNameElem;
	}
	
	
	
	
	

	private static void serializeMap(Element rdfNodeXMLElement, STRDFNode node) {
		Map<String, String> info = node.getInfo();
		if (info != null)
			for (Entry<String, String> entry : info.entrySet()) {
				rdfNodeXMLElement.setAttribute(entry.getKey(), entry.getValue());
			}
	}

}
