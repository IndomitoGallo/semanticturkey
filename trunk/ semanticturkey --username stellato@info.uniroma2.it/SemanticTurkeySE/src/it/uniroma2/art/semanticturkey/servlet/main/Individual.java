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

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.art.ontapi.vocabulary.RDF;
import it.uniroma2.art.ontapi.vocabulary.VocabularyTypesInts;

import java.util.Collection;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**Classe che permette di dare dei sinonimi ai nomi delle classi legati alla lingua (inglese italiano)
 * !!!!ma non sembra che questi siano poi coniderati nella ricerca su classi i sinonimi dovrebbero essere considerati nell'ontologySearch!!!!*/
/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class Individual extends Resource {
	@SuppressWarnings("unused")
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	public String XSLpath = Resources.getXSLDirectoryPath() + "createClassForm.xsl";

	//TODO raccogliere opportunamente le eccezioni!
	public int fromWebToMirror = 0;
	public int fromWeb = 1;
	public int fromLocalFile = 2;
	public int fromOntologyMirror = 3;
	public int toOntologyMirror = 4;
	
	final private String instanceQNameField = "instanceQName";
	
    
    public Individual(String id){
    	this.id = id;
    }
    
	public Document XMLData() {
		ServletUtilities servletUtilities = new ServletUtilities();
        String request = _oReq.getParameter("request");
        
        this.fireServletEvent();
		if (request.equals(individualDescriptionRequest)) {
			String instanceQNameEncoded = _oReq.getParameter(instanceQNameField);
			String method = _oReq.getParameter("method");		
            return getIndividualDescription(instanceQNameEncoded, method);
		}
        
		if ( request.equals("get_directNamedTypes") ) {
		    String indQName = _oReq.getParameter("indqname");
		    return getDirectNamedTypes(indQName);
		}
        if ( request.equals("add_type") )
            return addType(_oReq.getParameter("indqname"), _oReq.getParameter("typeqname"));
        if ( request.equals("remove_type") ) 
            return removeType(_oReq.getParameter("indqname"), _oReq.getParameter("typeqname"));
        
        else return servletUtilities.documentError("no handler for such a request!");    
	}
	
    
	
	/**
	 * 
     * <Tree request="getIndDescription" type="templateandvalued">
     *     <Types>
     *         <Type class="Researcher" explicit="true"/>
     *     </Types>
     *     <Properties>
     *         <Property name="rtv:worksIn" type="owl:ObjectProperty">
     *             <Value explicit="true" type="rdfs:Resource" value="University of Rome, Tor Vergata"/>
     *         </Property>
     *         <Property name="rtv:fax" type="owl:DatatypeProperty">
     *             <Value explicit="true" type="rdfs:Literal" value="+390672597460"/>
     *         </Property>
     *         <Property name="rtv:occupation" type="owl:DatatypeProperty"/>
     *         <Property name="rtv:phoneNumber" type="owl:DatatypeProperty">
     *             <Value explicit="true" type="rdfs:Literal" value="+390672597330"/>
     *             <Value explicit="true" type="rdfs:Literal" value="+390672597332"/>
     *             <Value explicit="false" type="rdfs:Literal" value="+390672597460"/>
     *         </Property>
     *     </Properties>
     * </Tree>
	 * 
	 * @param subjectInstanceQName the instance to which the new instance is related to
	 * @param requestSource a parameter for two different services //STARRED non sono sicuro serva, ma verificare con Noemi serve eccome!!!!!
	 * @return
	 */
	public Document getIndividualDescription(String subjectInstanceQName, String method) {
        s_logger.debug("getIndDescription; qname: " + subjectInstanceQName);
        return getResourceDescription(subjectInstanceQName, VocabularyTypesInts.individual, method);
	}
 
	
	/**
     * 
     * <Tree type="get_types">
     *      <Type qname="rtv:Employee"/>
     *      <Type qname="rtv:Hobbyst"/>
     * </Tree>
     * 
     */
	public Document getDirectNamedTypes(String indQName) {
        ServletUtilities servletUtilities = new ServletUtilities();
        s_logger.debug("replying to \"getTypes(" + indQName + ").");
        ARTRepository repository = Resources.getRepository();
        
        ARTResource individual = repository.getSTResource(repository.expandQName(indQName));
        
        if (individual==null)
            return servletUtilities.documentError(indQName + " is not present in the ontology");
                
        Collection<ARTResource> types = repository.getDirectTypes(individual);
        
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","get_types");              
        for (ARTResource type : types) 
        {
            if (type.isNamedResource()) {
                Element typeElement = XMLHelp.newElement(tree, "Type");
                typeElement.setAttribute("qname",repository.getQName(type.getURI()));
            }
	    }
        xml.appendChild(tree);
        return xml;
	}
	
	
	
	//STARRED ti serve pure il nome della istanza?
	/**
     * 
     * <Tree type="add_type">
     *      <Type qname="rtv:Person"/>
     * </Tree>
     * 
	 */
	public Document addType(String indQName, String typeQName) {
		ServletUtilities servletUtilities = new ServletUtilities();
		s_logger.debug("replying to \"addType(" + indQName + "," + typeQName + ")\".");
		ARTRepository repository = Resources.getRepository();
		
		ARTResource individual = repository.getSTResource(repository.expandQName(indQName));
		ARTResource typeCls = repository.getSTResource(repository.expandQName(typeQName));
		
		if (individual==null)
			return servletUtilities.documentError(indQName + " is not present in the ontology");
		
		if (typeCls==null)
			return servletUtilities.documentError(typeQName + " is not present in the ontology");		
		
		Collection<ARTResource> types = repository.getDirectTypes(individual);
		
		if (types.contains(typeCls))
			return servletUtilities.documentError(typeQName + " is already a type for: " + indQName);
		
		try {
			repository.addType(individual, typeCls);
		} catch (RepositoryUpdateException e) {
    		s_logger.debug(Utilities.printStackTrace(e));
    		return servletUtilities.documentError("error in adding type: " + typeQName + " to individual " + indQName + ": " + e.getMessage());
		}
		
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","add_type");              
    	Element typeElement = XMLHelp.newElement(tree, "Type");
    	typeElement.setAttribute("qname",typeQName);        
        xml.appendChild(tree);
        return xml;
    }
	
    
	//STARRED ti serve pure il nome della istanza?
	/**
	 * gets the namespace mapping for the loaded ontology
     * 
     * <Tree type="remove_type">
     *      <Type qname="rtv:Person"/>
     * </Tree>
     * 
	 */
	public Document removeType(String indQName, String typeQName) {
		ServletUtilities servletUtilities = new ServletUtilities();
		s_logger.debug("replying to \"removeType(" + indQName + "," + typeQName + ")\".");
		ARTRepository repository = Resources.getRepository();
		
		ARTResource individual = repository.getSTResource(repository.expandQName(indQName));
		ARTResource typeCls = repository.getSTResource(repository.expandQName(typeQName));
		
		if (individual==null)
			return servletUtilities.documentError(indQName + " is not present in the ontology");
		
		if (typeCls==null)
			return servletUtilities.documentError(typeQName + " is not present in the ontology");		
		
		Collection<ARTResource> types = repository.getDirectTypes(individual);
		
		if (!types.contains(typeCls))
			return servletUtilities.documentError(typeQName + " is not a type for: " + indQName);
		
		if (types.size() == 1)
			return servletUtilities.documentError("cannot remove a type if this is the only definition class for a given individual, since Semantic Turkey has no view for untyped individuals");
				
		if (!repository.hasExplicitStatement(individual, RDF.Res.TYPE, typeCls))
			return servletUtilities.documentError("this type relationship comes from an imported ontology or has been inferred, so it cannot be deleted explicitly");
		
		
		try {
			repository.removeType(individual, typeCls);
		} catch (RepositoryUpdateException e) {
    		s_logger.debug(Utilities.printStackTrace(e));
    		return servletUtilities.documentError("error in removing type: " + typeQName + " from individual " + indQName + ": " + e.getMessage());
		}
		
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","remove_type");              
    	Element typeElement = XMLHelp.newElement(tree, "Type");
    	typeElement.setAttribute("qname",typeQName);        
        xml.appendChild(tree);
        return xml;
    }

	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}
    
    
}
