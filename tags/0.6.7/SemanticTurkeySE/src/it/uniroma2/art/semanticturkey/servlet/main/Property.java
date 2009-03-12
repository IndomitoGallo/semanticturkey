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
import it.uniroma2.art.semanticturkey.SemanticTurkeyOperations;
import it.uniroma2.art.semanticturkey.filter.NoSystemResourcePredicate;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.art.ontapi.filter.BaseRDFPropertyPredicate;
import it.uniroma2.art.ontapi.filter.RootPropertiesResourcePredicate;
import it.uniroma2.art.ontapi.vocabulary.VocabularyTypesInts;

import java.util.Iterator;

import org.apache.commons.collections.Predicate;
import org.apache.commons.collections.PredicateUtils;
import org.apache.commons.collections.iterators.FilterIterator;
import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**Classe che gestisce le proprieta' in base ai parametri della 
 * richiesta si puo' aggiungere una proprieta'  oppure caricare tutte le proprieta'  
 * relative ad una classe o istanza*/
/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class Property extends Resource{
	final private String instanceQNameField = "instanceQName";
	final private String propertyQNameField = "propertyQName";
	final private String rangeClsQNameField = "rangeClsQName";
	final private String valueField = "value";
    final private String langField = "lang";
	
	final public String template = "template";
	
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	
	
	public Property(String id){
		this.id = id;
	}
	
	/**Metodo che gestisce le proprieta' in base ai parametri della 
	 * richiesta si puo' aggiungere una proprieta'  oppure caricare tutte 
	 * le proprieta'  relative ad una classe  o istanza
	 *@return Document */
	public Document XMLData() {	
		ServletUtilities servletUtilities = new ServletUtilities();
		//this is the old way (really bad indeed!) of recognizing the request, based on the number of parameters...
		int numParameters = _oReq.getParameterMap().entrySet().size();
		
		String request = _oReq.getParameter("request");
		this.fireServletEvent();
		//all new fashoned requests are put inside these grace brackets
		if (request!=null) {	
			
		    //PROPERTIES TREE METHODS
		    if (request.equals("getPropertiesTree") )  {
                return createPropertiesXMLTree(true, true, true, true);
            }		    
		    else if (request.equals("getObjPropertiesTree")) {
		        return createPropertiesXMLTree(true, true, false, false);
		    }		    
            else if (request.equals("getDatatypePropertiesTree")) {
                return createPropertiesXMLTree(false, false, true, false);
            }		    
            else if (request.equals("getAnnotationPropertiesTree")) {
                return createPropertiesXMLTree(false, false, false, true);
            }           
		    
		    //PROPERTY DESCRIPTION METHOD
            else if (request.equals(propertyDescriptionRequest) )  {
                String propertyQName = _oReq.getParameter(propertyQNameField);
                s_logger.debug("starting to get PropertyInfo for: " + propertyQName);
                return getPropertyInfo(propertyQName);
            }

			//EDIT_PROPERTY METHODS
		    else if (request.equals("addProperty")) {
				String propertyQName = _oReq.getParameter(propertyQNameField);
				String superPropertyQName = _oReq.getParameter("superPropertyQName");	//this one can be null (that is, not instanciated at all on the http paramters) if the user just want to create the property without specifying a superproperty
				String propertyType = _oReq.getParameter("propertyType");
				return editProperty(propertyQName, request, addProperty, propertyType, superPropertyQName);
			}
			else if (request.equals("addPropertyDomain")) {
				String propertyQName = _oReq.getParameter(propertyQNameField);
				String domainPropertyQName = _oReq.getParameter("domainPropertyQName");
				return editProperty(propertyQName, request, addPropertyDomain, domainPropertyQName);				
			}
			else if (request.equals("removePropertyDomain")) {
				String propertyQName = _oReq.getParameter(propertyQNameField);
				String domainPropertyQName = _oReq.getParameter("domainPropertyQName");
				return editProperty(propertyQName, request, removePropertyDomain, domainPropertyQName);								
			}
			else if (request.equals("addPropertyRange")) {
				String propertyQName = _oReq.getParameter(propertyQNameField);
				String rangePropertyQName = _oReq.getParameter("rangePropertyQName");
				return editProperty(propertyQName, request, addPropertyRange, rangePropertyQName);	
			}
			else if (request.equals("removePropertyRange")) {
				String propertyQName = _oReq.getParameter(propertyQNameField);
				String rangePropertyQName = _oReq.getParameter("rangePropertyQName");
				return editProperty(propertyQName, request, removePropertyRange, rangePropertyQName);		
			}
			else if (request.equals("addSuperProperty")) {
				String propertyQName = _oReq.getParameter(propertyQNameField);
				String superPropertyQName = _oReq.getParameter("superPropertyQName");
				return editProperty(propertyQName, request, addSuperProperty, superPropertyQName);
			}
			else if (request.equals("removeSuperProperty")) {
				String propertyQName = _oReq.getParameter(propertyQNameField);
				String superPropertyQName = _oReq.getParameter("superPropertyQName");
				return editProperty(propertyQName, request, removeSuperProperty, superPropertyQName);				
			}
			else if (request.equals("createAndAddPropValue") || request.equals("addExistingPropValue") || request.equals("removePropValue")) {
				//the parameter rangeClsQName is only passed in the createAndAddPropValue request, the editPropertyValue method accepts the null (i.e. no parameter passed via http) in the two other requests
				String instanceQName = _oReq.getParameter(instanceQNameField);
				String propertyQName = _oReq.getParameter(propertyQNameField);
				String value = _oReq.getParameter(valueField);
				String rangeClsQName = _oReq.getParameter(rangeClsQNameField);
                String lang = _oReq.getParameter(langField);
                
				return editPropertyValue(request, instanceQName, propertyQName, value, rangeClsQName, lang);
			}			
            else if (request.equals("getRangeClassesTree") )  {
                String propertyQName = _oReq.getParameter(propertyQNameField);
                return getRangeClassesTreeXML(propertyQName);
            }
            else if (request.equals("getRangeClassesTree") )  {
                String propertyQName = _oReq.getParameter(propertyQNameField);
                return getRangeClassesTreeXML(propertyQName);
            }		    
			else return servletUtilities.documentError("no handler for such a request!");
	
		}
		
		else if(numParameters == 1 ) {      //ALREADY SET THE REQUEST ON SERVER, REMOVE THIS IF CLIENT IS UPDATED WITH THE NEW REQUEST
			return createPropertiesXMLTree(true, true, true, true);
		}
		else if (numParameters == 2) {		//ALREADY SET THE REQUEST ON SERVER, REMOVE THIS IF CLIENT IS UPDATED WITH THE NEW REQUEST 						
			String propertyQName = _oReq.getParameter(propertyQNameField);
			s_logger.debug("starting to get PropertyInfo for: " + propertyQName);
			return getPropertyInfo(propertyQName);
		}				
		else return servletUtilities.documentError("no servlet found for the passed parameters!");
	}		
    


    
    
    
   
    //TODO, se possibile, togliamo anche quell'odioso: subproperties. Non serve a niente e complica la vita a tutti!
    //TODO we should handle separately simple rdf:Properties (there are a few ontologies which instantiate just rdf:Property
           //TODO types in subproperties should not be automatically assigned on the basis of the root property (case of rdf:properties subproperties of owl:ObjectProperties
	//TODO should make a more efficient method which takes all the properties, and then sorts them according to their types. Separate handling is costly expecially considering the standard rdf:Property
    /**
     * generates an xml tree representing properties of the knowledge base
     *     
     *  <Tree type="AllPropertiesTree">
     *    <Property deleteForbidden="true" name="foaf:title" type="owl:DatatypeProperty">
     *    <SubProperties/>
     *    </Property>
     *    <Property deleteForbidden="true" name="foaf:nick" type="owl:DatatypeProperty">
     *        <SubProperties>
     *            <Property deleteForbidden="true" name="foaf:aimChatID" type="owl:DatatypeProperty">
     *                <SubProperties/>
     *            </Property>
     *            <Property deleteForbidden="true" name="foaf:icqChatID" type="owl:DatatypeProperty">
     *                <SubProperties/>
     *            </Property>
     *            <Property deleteForbidden="true" name="foaf:yahooChatID" type="owl:DatatypeProperty">
     *                <SubProperties/>
     *            </Property>
     *            <Property deleteForbidden="true" name="foaf:msnChatID" type="owl:DatatypeProperty">
     *                <SubProperties/>
     *            </Property>
     *        </SubProperties>
     *    </Property>
     *  </Tree>    
     *    
     * @return Document tree
    */
    public Document createPropertiesXMLTree(boolean props, boolean objprops, boolean datatypeprops, boolean annotationprops) {
        ARTRepository repository = Resources.getRepository();      
        Document tree = new DocumentImpl();                         
        Element treeElement = tree.createElement("Tree");
        treeElement.setAttribute("type", "AllPropertiesTree");
                

        Predicate exclusionPredicate;
//        if (Config.isAdminStatus()) exclusionPredicate = NoLanguageResourcePredicate.nlrPredicate;
//        else exclusionPredicate = DomainResourcePredicate.domResPredicate;        
        if (Config.isAdminStatus()) exclusionPredicate = org.apache.commons.collections.PredicateUtils.truePredicate();
        else exclusionPredicate = NoSystemResourcePredicate.noSysResPred;        
        Predicate rootUserPropsPred = PredicateUtils.andPredicate(new RootPropertiesResourcePredicate(repository), exclusionPredicate);         
        
        FilterIterator filteredPropsIterator;
        
        //OBJECT PROPERTIES
        if (objprops==true) {
            filteredPropsIterator = new FilterIterator(repository.listObjectProperties(), rootUserPropsPred);
            s_logger.debug("\nontology root object properties: \n"); 
            while (filteredPropsIterator.hasNext())
                recursiveCreatePropertiesXMLTree(repository, (ARTResource)filteredPropsIterator.next(), treeElement, "owl:ObjectProperty");            
        }
         
        
        //DATATYPE PROPERTIES
        if (datatypeprops==true) {
            filteredPropsIterator = new FilterIterator(repository.listDatatypeProperties(), rootUserPropsPred);
            s_logger.debug("\nontology root datatype properties: \n"); 
            while (filteredPropsIterator.hasNext())
                recursiveCreatePropertiesXMLTree(repository, (ARTResource)filteredPropsIterator.next(), treeElement, "owl:DatatypeProperty");            
        }
                
        //ANNOTATION PROPERTIES
        if (annotationprops==true) {
            filteredPropsIterator = new FilterIterator(repository.listAnnotationProperties(), rootUserPropsPred);
            s_logger.debug("\nontology root annotation properties: \n"); 
            while (filteredPropsIterator.hasNext())
                recursiveCreatePropertiesXMLTree(repository, (ARTResource)filteredPropsIterator.next(), treeElement, "owl:AnnotationProperty");            
        }
 

        //BASE PROPERTIES
        Predicate rdfPropsPredicate = PredicateUtils.andPredicate(BaseRDFPropertyPredicate.getPredicate(repository), rootUserPropsPred);
        if (props==true) {
            filteredPropsIterator = new FilterIterator(repository.listProperties(), rdfPropsPredicate);
            s_logger.debug("\nontology root rdf:properties: \n"); 
            while (filteredPropsIterator.hasNext())
                recursiveCreatePropertiesXMLTree(repository, (ARTResource)filteredPropsIterator.next(), treeElement, "rdf:Property");            
        }
        
        tree.appendChild(treeElement);  
        
        return tree;
    }   
    
    /**Carica ricorsivamente le proprieta'e le sottoproprieta'  dell'ontologia 
     *TODO storage independent 
     *@param SesameARTRepositoryImpl repository
     *@param Resource resource
     *@param Element element :elemento xml padre delle classi (le sottoclassi e le istanze vengono aggiunte ricorsivamente) 
     **/
    void recursiveCreatePropertiesXMLTree(ARTRepository repository, ARTResource property, Element element, String type) {      
    	ServletUtilities servletUtilities = new ServletUtilities();
    	Element propElement = XMLHelp.newElement(element, "Property");                 
        boolean deleteForbidden = servletUtilities.checkWriteOnly(property);                                               
        propElement.setAttribute("name", repository.getQName(property.getURI()) );
        
        propElement.setAttribute("type", type);
        propElement.setAttribute("deleteForbidden",Boolean.toString(deleteForbidden));         

        Iterator<ARTResource> subPropertiesIterator = repository.getDirectSubProperties(property).iterator();
        Element subPropertiesElem = XMLHelp.newElement(propElement, "SubProperties");
        while (subPropertiesIterator.hasNext()) { 
            ARTResource subProp = subPropertiesIterator.next();
            recursiveCreatePropertiesXMLTree(repository, subProp, subPropertiesElem, type);            
        }
    }
    
    
    public Document getPropertyInfo(String propertyQName) {
        return getPropertyInfo(propertyQName, templateandvalued);
    }
    
    /**
     * returns all the information associated to property <code>property</code>
     * they contain: domain, range 
     * 
     * as for the following example:
     * 
     * <Tree request="getPropDescription" type="templateandvalued">
     *     <Types>
     *         <Type class="owl:FunctionalProperty" explicit="false"/>
     *         <Type class="owl:DatatypeProperty" explicit="false"/>
     *     </Types>
     *     <SuperTypes>
     *        <SuperType explicit="true" resource="rtv:phone"/>
     *     </SuperTypes>
     *     <domains>
     *         <domain explicit="false" name="rtv:Person"/>
     *     </domains>
     *     <ranges>
     *         <range explicit="false" name="xsd:string"/>
     *     </ranges>
     *     <facets>
     *         <symmetric value="false" explicit=""> (zero or one) if this tag is not present, it is false by default but can be edited to become true, if explicit=false, its status (given by value) is not editable, otherwise it is
     *         <inverseFunctional value="false" explicit=""> (zero or one) if this tag is not present, it is false by default but can be edited to become true, if explicit=false, its status (given by value) is not editable, otherwise it is 
     *         <functional value="false" explicit="">  (zero or one) if this tag is not present, it is false by default but can be edited to become true, if explicit=false, its status (given by value) is not editable, otherwise it is
     *         <transitive value="false" explicit="">  (zero or one) if this tag is not present, it is false by default but can be edited to become true, if explicit=false, its status (given by value) is not editable, otherwise it is
     *         <inverseOf value="has_employee" explicit="true">  (zero or one) if this tag is not present, it is false by default but can be edited to get an inverse         
     *     </facets>
     *     <Properties/>
     * </Tree>
     * 
     * 
     * @param repository
     * @param property
     * @return
     */
    public Document getPropertyInfo(String propertyQName, String method) {    	
		s_logger.debug("getting property description for: " + propertyQName);
		return getResourceDescription(propertyQName, VocabularyTypesInts.property, method);   
    }
    
    public final int addProperty = 0;
    public final int addSuperProperty = 1;
    public final int removeSuperProperty = 2;
    public final int addPropertyDomain = 3;
    public final int removePropertyDomain = 4;
    public final int addPropertyRange = 5;
    public final int removePropertyRange = 6;

    
    /**
     * answers with an ack on the result of the import. Th application, upon receving this ack, should request an update of the imports and namespace mappings panels
	 *
     *  <Tree type="Ack" request="addProperty">
     *      <result level="ok"/>            //oppure "failed"
     *      <msg content="bla bla bla"/>         
     *  </Tree>
	 *
     * 
     * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports because an imported ontology may contain other prefix mappings to be imported
     * 
     */
    public Document editProperty(String propertyQName, String request, int method, String ... parameters) {
    	ARTRepository repository = Resources.getRepository();
    	ServletUtilities servletUtilities = new ServletUtilities();
    	ARTResource property=null;
    	String propertyURI = repository.expandQName(propertyQName);
    	
    	if (method != addProperty)
    		property = repository.getSTProperty(propertyURI);
    	
    	try {
    	
	    	switch (method) {
	    	
	    		//editProperty(propertyQName, request, addProperty, propertyType, superPropertyQName);
	    		case addProperty: 
	    			{
	    				
		    			String propertyType = parameters[0];
		    			String superPropertyQName = parameters[1];
		    			s_logger.debug("ADD PROPERTY, propertyQName: " + propertyQName + ", propertyURI: " + propertyURI + ", propertyType " + propertyType + ", superPropertyQName: " + superPropertyQName);
		    			
		    			ARTResource superProperty = null;
		    			if (superPropertyQName!=null)
		    				superProperty = repository.getSTProperty(repository.expandQName(superPropertyQName));
		    			
		    			//erm....
		    			if (propertyType.equals("property"))
							repository.addProperty(propertyURI, superProperty);						
						else if (propertyType.equals("ObjectProperty"))
		    				repository.addObjectProperty(propertyURI, superProperty);
		    			else if (propertyType.equals("DatatypeProperty"))
		    				repository.addDatatypeProperty(propertyURI, superProperty);    	
		    			else if (propertyType.equals("AnnotationProperty"))
		    				repository.addAnnotationProperty(propertyURI, superProperty);    			    			
		    			else return servletUtilities.documentError(propertyType + " is not a recognized property type!");
	    			}
	    			break;
	    			    
	    		//editProperty(propertyQName, request, addSuperProperty, superPropertyQName);	
	    		case addSuperProperty:
	    			{
		    			ARTResource superProperty = repository.getSTProperty(repository.expandQName(parameters[0]));    			
		    			repository.addSuperProperty(property, superProperty);
	    			}
	    			break;
	 
	    		//editProperty(propertyQName, request, removeSuperProperty, superPropertyQName);	
	    		case removeSuperProperty:
		    		{
		    			ARTResource superProperty = repository.getSTProperty(repository.expandQName(parameters[0]));    			
		    			repository.removeSuperProperty(property, superProperty);    		
		    		}	
		    		break;
	    			
	    		//editProperty(propertyQName, request, addPropertyDomain, domainPropertyQName);	
	    		case addPropertyDomain:
		    		{
		    			ARTResource domainProperty = repository.getSTClass(repository.expandQName(parameters[0]));    			
		    			repository.addPropertyDomain(property, domainProperty);
		    		}
		    		break;
	    		
	    		//editProperty(propertyQName, request, removePropertyDomain, domainPropertyQName);		
	    		case removePropertyDomain: 
		    		{
		    			ARTResource domainProperty = repository.getSTClass(repository.expandQName(parameters[0]));    			
		    			repository.removePropertyDomain(property, domainProperty);
		    		}
		    		break;
	    		
	    		//editProperty(propertyQName, request, addPropertyRange, rangePropertyQName);		
	    		case addPropertyRange:
		    		{
		    			ARTResource rangeProperty = repository.getSTClass(repository.expandQName(parameters[0]));    			
		    			repository.addPropertyRange(property, rangeProperty);
		    		}
		    		break;
	    			
	    		//editProperty(propertyQName, request, removePropertyRange, rangePropertyQName);	
	    		case removePropertyRange:
		    		{
		    			ARTResource rangeProperty = repository.getSTClass(repository.expandQName(parameters[0]));    			
		    			repository.removePropertyRange(property, rangeProperty);
		    		}
		    		break;
	
	    	}
    	
    	} catch (RepositoryUpdateException e) {
    		s_logger.debug(it.uniroma2.art.semanticturkey.utilities.Utilities.printStackTrace(e));
    		return servletUtilities.documentError(e.getMessage());
		}
    	
		Document xml = new DocumentImpl();
		Element treeElement = xml.createElement("Tree");
			treeElement.setAttribute("type", "Ack");
			treeElement.setAttribute("request", request);
			Element msgElement = XMLHelp.newElement(treeElement, "msg");
				msgElement.setAttribute("content", "");	//at the moment every exception throwns a documentError, while foreseen exception should just give a failed, which would result in a alert windows, and not an error one
		xml.appendChild(treeElement);				
						
		return xml;
    }

    
    
    
    /**
     * @param request
     * @param individualQName
     * @param propertyQName
     * @param valueField the object of the newly created statement; ma be a literal as well as a qname for an uri object
     * @param rangeClsQName
     * @return
     */
    public Document editPropertyValue(String request, String individualQName, String propertyQName, String valueString, String rangeClsQName, String lang) {
    	ARTRepository repository = Resources.getRepository();
    	ServletUtilities servletUtilities = new ServletUtilities();
    	
    	String propertyURI = repository.expandQName(propertyQName);
    	String individualURI = repository.expandQName(individualQName);

    	ARTResource property = repository.getSTProperty(propertyURI);
    	ARTResource individual = repository.getSTResource(individualURI);
    	ARTResource rangeCls = null;
    	
    	if (property==null) {
    		s_logger.debug("there is no property named: " + propertyURI + " !");
    		return servletUtilities.documentError("there is no property named: " + propertyURI + " !");
    	}
    	if (individual==null) {
    		s_logger.debug("there is no individual named: " + individualURI + " !");
    		return servletUtilities.documentError("there is no individual named: " + individualURI + " !");
    	}
    	if (rangeClsQName!=null) {
    		String rangeClsURI = repository.expandQName(rangeClsQName);
    		rangeCls = repository.getSTClass(rangeClsURI); 
    		if (rangeCls==null) {
        		s_logger.debug("there is no class named: " + rangeClsURI + " !");
        		return servletUtilities.documentError("there is no class named: " + rangeClsURI + " !");
    		}    			
    	}
    		
    	
    	if (request.equals("createAndAddPropValue")) {
			try {	
	    		if (repository.isDatatypeProperty(property))
					repository.instanciateDatatypeProperty(individual, property, valueString);		
                else if (repository.isAnnotationProperty(property)) {
                    repository.instanciateAnnotationProperty(individual, property, valueString, lang);
                }
				else { //STARRED TODO what to do with normal Properties? 
	    			repository.addSTIndividual(repository.expandQName(valueString), rangeCls);
	    			ARTResource objIndividual = repository.getSTResource(repository.expandQName(valueString));
	    			repository.instanciateObjectProperty(individual, property, objIndividual);
	    		}
			} catch (RepositoryUpdateException e) {
	    		s_logger.debug(it.uniroma2.art.semanticturkey.utilities.Utilities.printStackTrace(e));
	    		return servletUtilities.documentError("error in adding a newly generated property value: " + e.getMessage());
			}
    	}
    	//	this one is only valid for ObjectProperties (and Normal Properties?)
    	else if (request.equals("addExistingPropValue")) {
    		String valueURI = repository.expandQName(valueString);
    		ARTResource valueObject = repository.getSTResource(valueURI); 
    		if (valueObject==null) {
        		s_logger.debug("there is no object named: " + valueURI + " !");
        		return servletUtilities.documentError("there is no object named: " + valueURI + " !");
    		}  
    		repository.instanciateObjectProperty(individual, property, valueObject);
    	}    	    	
    	else if (request.equals("removePropValue")) {
			try {
				if (repository.isDatatypeProperty(property) || repository.isAnnotationProperty(property))
					repository.deleteSTStatements(individual, property, repository.createLiteral(valueString, lang));
				else {
		    		String valueURI = repository.expandQName(valueString);
		    		ARTResource valueObject = repository.getSTResource(valueURI); 
		    		if (valueObject==null) {
		        		s_logger.debug("there is no object named: " + valueURI + " !");
		        		return servletUtilities.documentError("there is no object named: " + valueURI + " !");
		    		}  
					repository.deleteSTStatements(individual, property, valueObject);
				}
			} catch (RepositoryUpdateException e) {
	    		s_logger.debug(it.uniroma2.art.semanticturkey.utilities.Utilities.printStackTrace(e));
	    		return servletUtilities.documentError("error in removing a property value: " + e.getMessage());
			}

		}
		else {
    		s_logger.debug("there is no handler for such request: " + request + " !");
    		return servletUtilities.documentError("there is no handler for such request: " + request + " !");
		}
    		
		Document xml = new DocumentImpl();
		Element treeElement = xml.createElement("Tree");
			treeElement.setAttribute("type", "Ack");
			treeElement.setAttribute("request", request);
			Element msgElement = XMLHelp.newElement(treeElement, "msg");
				msgElement.setAttribute("content", "");	//at the moment every exception throwns a documentError, while foreseen exception should just give a failed, which would result in a alert windows, and not an error one
		xml.appendChild(treeElement);				
						
		return xml;
    		
    }
    
    
    /**
     * gets a class tree with roots set
     *@return Document tree*/
    public Document getRangeClassesTreeXML(String propertyQName) {
    	Cls cls = new Cls("cls");
        ARTRepository repository = Resources.getRepository();        
        ARTResource property = repository.getSTProperty(repository.expandQName(propertyQName));
        Iterator<ARTResource> rangeClasses = repository.getPropertyRanges(property);
        Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type", "ClassesTree");
        while (rangeClasses.hasNext()) {
            ARTResource rangeClass = rangeClasses.next(); 
            cls.recursiveCreateClassesXMLTree(repository, rangeClass, treeElement);
        }
        xml.appendChild(treeElement);  
        s_logger.debug("ritorno?"+xml);
        return xml;
    }


	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}
    
    
}
