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
 * The Original Code is st-core-framework.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2012.
 * All Rights Reserved.
 *
 * st-core-framework was developed by the Artificial Intelligence Research Group
 * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about st-core-framework can be obtained at 
 * http//ai-nlp.info.uniroma2.it/software/...
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.ontology.utilities;

import java.util.ArrayList;
import java.util.Collection;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.ARTBNode;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.utilities.RDFRenderer;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.owlart.vocabulary.RDFTypesEnum;

import org.w3c.dom.DOMException;

/**
 * <p>
 * factory for creating ST RDF Nodes, that is, serializable compact objects containing the strictly necessary
 * information for showing RDF nodes in a user interface.<br/>
 * This compact information may contain:
 * <ul>
 * <li>First, the nature ({@link RDFTypesEnum}) of the node is revealed, among:
 * <ul>
 * <li>uri</li>
 * <li>bnode</li>
 * <li>plainLiteral</li>
 * <li>typedLiteral</li>
 * </ul>
 * </li>
 * <li>a mere NT serialization of the node</li>
 * <li>a human-readable representation of the node (e.g. a qname for URIs, or more complex representations for
 * some bnodes, such as the list of values for a datarange bnode)</li>
 * <li>in case of resources (bnodes and URIs), their "role", that is, the most important class and specific
 * they belong to, which will be mostly used to give a specific graphical representation of the node in a User
 * Interface</li>
 * <li><em>explicit</em>: a boolean value, which is important in some cases to tell if the node is present in
 * a given collection thanks to reasoning, imported ontologies etc... or has been explicitly written in the
 * default working graph</li>
 * </ul>
 * </p>
 * 
 * @author Armando Stellato &lt;stellato@info.uniroma2.it&gt;
 * 
 */
public class STRDFNodeFactory {

	/**
	 * basic factory method for Literals. the "show" field is generated automatically by getting the nominal
	 * value of the literal, without considering language tags or datatypes.
	 * 
	 * @param node
	 * @param explicit
	 * @return
	 */
	public static STRDFLiteral createSTRDFLiteral(ARTLiteral node, boolean explicit) {
		return new STRDFLiteralImpl(node, explicit);
	}

	/**
	 * as for {@link #createSTRDFLiteral(ARTLiteral, boolean)}, but can force the show field to show something
	 * different; pls use it consistently}
	 * 
	 * @param node
	 * @param explicit
	 * @param show
	 * @return
	 */
	public static STRDFLiteral createSTRDFLiteral(ARTLiteral node, boolean explicit, String show) {
		return new STRDFLiteralImpl(node, explicit, show);
	}

	/**
	 * as for {@link #createSTRDFLiteral(ARTLiteral, boolean, String)}, but can specify directly the qname of
	 * the datatype}
	 * 
	 * @param node
	 * @param explicit
	 * @param show
	 * @param dtQName
	 * @return
	 */
	public static STRDFLiteral createSTRDFLiteral(ARTLiteral node, boolean explicit, String show,
			String dtQName) {
		return new STRDFLiteralImpl(node, explicit, show, dtQName);
	}

	/**
	 * plain method for creating a ST RDF URI Resource; all method arguments will be straightly used to
	 * construct the resource
	 * 
	 * @param node
	 * @param role
	 * @param explicit
	 * @param show
	 * @return
	 */
	public static STRDFURI createSTRDFURI(ARTURIResource node, RDFResourceRolesEnum role, boolean explicit,
			String show) {
		return new STRDFURIImpl(node, role, explicit, show);
	}

	/**
	 * TODO : IMPORTANT!! not sure this creation method is appropriate, should investigate on these null
	 * values for the 4-arg constructor. Probably it is used to create partially instantiated resources, and
	 * then fill them on a later stage. However, think this should be made private to this class, and
	 * externally, resources should be created when all of their arguments have been calculated,
	 * 
	 * 
	 * @param node
	 * @param explicit
	 * @return
	 */
	public static STRDFURI createSTRDFURI(ARTURIResource node, boolean explicit) {
		return new STRDFURIImpl(node, null, explicit, null);
	}

	/**
	 * everything explicitly passed through the arguments, except the <code>show</code> field which is
	 * calculated through the prefixMapping of the <code>model</code> if <code>rendering</code> is set to true
	 * 
	 * @param model
	 * @param resource
	 * @param role
	 * @param explicit
	 * @param rendering
	 * @return
	 * @throws ModelAccessException
	 */
	public static STRDFURI createSTRDFURI(RDFModel model, ARTURIResource resource, RDFResourceRolesEnum role,
			boolean explicit, boolean rendering) throws ModelAccessException {
		STRDFURI stURI = createSTRDFURI(resource.asURIResource(), role, explicit, null);
		if (rendering)
			stURI.setRendering(model.getQName(resource.getURI()));
		return stURI;
	}

	/**
	 * both <code>show</code> field and <code>role</code> field are calculated if their related boolean
	 * arguments are set to true<br/>
	 * 
	 * @param model
	 * @param resource
	 * @param role
	 *            if <code>true</code>, the <code>role</code> field of the resource is retrieved through the
	 *            <code>model<code>
	 * @param explicit
	 * @param rendering
	 *            if <code>true</code>, the <code>show</code> field of the resource is calculated through the prefixMapping
	 *            of the <code>model</code>
	 * @return
	 * @throws ModelAccessException
	 */
	public static STRDFURI createSTRDFURI(RDFModel model, ARTURIResource resource, boolean role,
			boolean explicit, boolean rendering) throws ModelAccessException {
		STRDFURI stURI = createSTRDFURI(resource.asURIResource(), null, explicit, null);
		if (role)
			stURI.setRole(ModelUtilities.getResourceRole(resource, model));
		if (rendering)
			stURI.setRendering(model.getQName(resource.getURI()));
		return stURI;
	}

	public static STRDFBNodeImpl createSTRDFBNode(ARTBNode node, RDFResourceRolesEnum role, boolean explicit,
			String show) {
		return new STRDFBNodeImpl(node, role, explicit, show);
	}

	private static STRDFBNodeImpl createSTRDFBNode(ARTBNode node, boolean explicit) {
		return new STRDFBNodeImpl(node, null, explicit, null);
	}

	/**
	 * This method renders the description of a RDF node under a an appropriate POJO, and additional
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
	 * @param explicit
	 *            is automatically assigned to the explicit attribute of the STRDFNode resource to be created
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
	public static STRDFNode createSTRDFNode(RDFModel model, ARTNode node, boolean role, boolean explicit,
			boolean rendering) throws DOMException, ModelAccessException {
		if (node.isResource()) {
			return createSTRDFResource(model, node.asResource(), role, explicit, rendering);
		} else {
			// literal
			ARTLiteral lit = node.asLiteral();
			STRDFLiteral stLit = createSTRDFLiteral(lit, explicit);
			if (rendering) {
				ARTURIResource dt = lit.getDatatype();
				if (dt != null)
					stLit.setDatatypeQName(model.getQName(dt.getURI()));
			}

			return stLit;
		}
	}

	/**
	 * @param model
	 * @param node
	 * @param role
	 *            if true the role is being extracted and specified
	 * @param explicit
	 * @param rendering
	 * @return
	 * @throws DOMException
	 * @throws ModelAccessException
	 */
	public static STRDFResource createSTRDFResource(RDFModel model, ARTResource node, boolean role,
			boolean explicit, boolean rendering) throws DOMException, ModelAccessException {

		if (role)
			return createSTRDFResource(model, node, ModelUtilities.getResourceRole(node.asResource(), model),
					explicit, rendering);

		return createSTRDFResource(model, node, null, explicit, rendering);
	}

	public static STRDFResource createSTRDFResource(ARTResource node, RDFResourceRolesEnum role,
			boolean explicit, String show) throws DOMException, ModelAccessException {
		STRDFResource stRes;
		if (node.isURIResource()) {
			// uri
			stRes = createSTRDFURI(node.asURIResource(), role, explicit, show);
		} else {
			// bnode
			stRes = createSTRDFBNode(node.asBNode(), role, explicit, show);
		}

		return stRes;
	}

	public static STRDFResource createSTRDFResource(RDFModel model, ARTResource node,
			RDFResourceRolesEnum role, boolean explicit, boolean rendering) throws DOMException,
			ModelAccessException {
		STRDFResource stRes;
		if (node.isURIResource()) {
			// uri
			stRes = createSTRDFURI(node.asURIResource(), explicit);
			if (rendering)
				stRes.setRendering(RDFRenderer.renderRDFNode(model, node.asURIResource()));
		} else {
			// bnode
			stRes = createSTRDFBNode(node.asBNode(), explicit);
			if (rendering)
				stRes.setRendering(RDFRenderer.renderRDFNode(model, node.asBNode()));
		}

		if (role != null)
			stRes.setRole(role);

		return stRes;
	}

	public static Collection<STRDFResource> createEmptyResourceCollection() {
		return new ArrayList<STRDFResource>();
	}

	public static Collection<STRDFNode> createEmptyNodeCollection() {
		return new ArrayList<STRDFNode>();
	}

	/*
	 * public static Collection<STRDFURIImpl> createSTRDFURICollection(RDFModel model, ARTURIResourceIterator
	 * it, RDFResourceRolesEnum role, boolean explicit) { Collection<STRDFURIImpl> uris = new
	 * ArrayList<STRDFURIImpl>(); while (it.streamOpen()) { uris.add(createSTRDFURI(it.getNext(), role,
	 * explicit)); } it.close(); return uris; }
	 * 
	 * public static STRDFURIImpl createSTRDFURICollection(RDFModel model, ARTURIResourceIterator it, boolean
	 * explicit) { return new STRDFURIImpl(node, null, explicit, null); }
	 * 
	 * public static void createSTRDFNodeCollection(RDFModel model, RDFIterator<? extends ARTNode> node,
	 * boolean role, boolean explicit, boolean rendering) {
	 * 
	 * }
	 */

}
