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
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.CompareNames;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.RepositoryUtilities;
import it.uniroma2.art.ontapi.vocabulary.VocabularyTypesStrings;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
/**Classe che effettua la ricerca di una parola all'interno dell'ontologia*/
/**
 * @author Donato Griesi, Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class SearchOntology extends InterfaceServiceServlet{
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	//public String XSLpath = Profile.getUserDataPath() + "/components/lib/xsl/search.xsl";
	public final double THRESHOLD = 0.70;
	
	public SearchOntology(String id){
		this.id = id;
	}
	
	/**Metodo che effettua la ricerca di una parola all'interno dell'ontologia e restituisce l'elemento xml contenente la 
	 * lista dei risultati
	 *@return Document xml */
	public Document XMLData() {
		ServletUtilities servletUtilities = new ServletUtilities();
        String request = _oReq.getParameter("request");
        this.fireServletEvent();
        if ( request.equals("searchOntology") ) 
            return searchOntology(_oReq.getParameter("inputString"), _oReq.getParameter("types")); //types can be either property or clsNInd
        else
            return servletUtilities.documentError("no handler for such a request!");  
    }
        
        
    /**
     * if an exact match is obtained, return only this result, otherwise search for ontology objects with similar localnames.
     * if namespace (prefix) is given, search only for objects with similar localnames with that namespace (prefix)
     * 
     * <Tree type="ontSearch">
     *		<found name="rtv:phoneNumber" type="owl:DatatypeProperty"/>
     *		<found name="rtv:produces" type="owl:ObjectProperty"/>
     *		<found name="rtv:role" type="owl:ObjectProperty"/>
     * </Tree>
     * 
     * admitted types are given by strings in {@link}VocabularyTypesStrings class
     * 
     * @param inputString
     * @return
     */
    public Document searchOntology(String inputString, String types) {    
    	ServletUtilities servletUtilities = new ServletUtilities();
    	s_logger.debug("searchString: " + inputString);
    
    	if (!types.equals("property") && !types.equals("clsNInd") )
    		return servletUtilities.documentError("\"types\" parameter not correctly specified in GET request");
    	
        ARTRepository repository = Resources.getRepository();
        ArrayList<Struct> results = new ArrayList<Struct>();
        
        String inputStringExpandedQName = repository.expandQName(inputString);
              
        URI i;
        boolean wellFormedAndAbsolute = true;
        try {
            i = new URI(inputStringExpandedQName);
            wellFormedAndAbsolute = i.isAbsolute();
        } catch (URISyntaxException e) {
            wellFormedAndAbsolute = false;
        }
        
        System.out.println("inputStringExpandedQName: " + inputStringExpandedQName + " well-formed&Absolute: " + wellFormedAndAbsolute );
        
        //STARRED TODO optimize it!
        ARTResource perfectMatchCls = null;
        ARTResource perfectMatchInd = null;
        if (wellFormedAndAbsolute) perfectMatchCls = repository.getSTClass(inputStringExpandedQName);
        if (wellFormedAndAbsolute) perfectMatchInd = repository.getSTResource(inputStringExpandedQName);
        if (perfectMatchCls!=null) {
            results.add(new Struct(VocabularyTypesStrings.cls, perfectMatchCls, null, 1));
        }
        else if ( perfectMatchInd!=null  ) {
            results.add(new Struct(VocabularyTypesStrings.individual, perfectMatchInd, null, 1));
        }
        else {
            
            String searchStringNamespace=null;
            String searchStringLocalName=null;
            String searchStringPrefix=null;
            boolean namespaceGiven=false;
            boolean prefixGiven=false;
            
            if (inputString.contains("#")) {
                searchStringNamespace = inputString.substring(0, inputString.lastIndexOf("#")+1);
                searchStringLocalName = inputString.substring(inputString.lastIndexOf("#")+1);
                namespaceGiven=true;
            }
            else if (inputString.contains("/")) {
                searchStringNamespace = inputString.substring(0, inputString.lastIndexOf("/")+1);
                searchStringLocalName = inputString.substring(inputString.lastIndexOf("/")+1);
                namespaceGiven=true;
            } else if (inputString.contains(":")) {
                searchStringLocalName = inputString.substring(inputString.lastIndexOf(":")+1); 
                searchStringPrefix = inputString.substring(0, inputString.lastIndexOf(":"));
                searchStringNamespace = repository.getNSForPrefix(searchStringPrefix);
                namespaceGiven=true;
                prefixGiven=true;
            } else searchStringLocalName=inputString;
            
            Iterator<ARTResource> classes = repository.listSTNamedClasses();
            //while (classes.hasNext())
                
            System.out.println(searchStringNamespace + " " + searchStringLocalName);
            System.out.println("searchStringNamespace availability: " + RepositoryUtilities.isAvailableNamespace(repository, searchStringNamespace));
            
            if (namespaceGiven && !RepositoryUtilities.isAvailableNamespace(repository, searchStringNamespace)) {
                s_logger.debug("namespace: " + searchStringNamespace + " associated to prefix: " + searchStringPrefix + " is not recognized in this ontology, please use an existing prefix to restrict your search or do not use a prefix at all to search the whole ontology");
            	if (prefixGiven) return servletUtilities.documentError("namespace: " + searchStringNamespace + " associated to prefix: " + searchStringPrefix + " is not recognized in this ontology, please use an existing prefix to restrict your search or do not use a prefix at all to search the whole ontology");  
            	else return servletUtilities.documentError("namespace: " + searchStringNamespace + " is not recognized in this ontology, please use an existing namespace to restrict your search or do not use a namespace at all to search the whole ontology");
            }
            	
            if (types.equals("clsNInd") ) {            
	            Iterator<ARTResource> searchedResources = repository.listSTNamedClasses();
	            collectResults(searchedResources, results, searchStringNamespace, searchStringLocalName, namespaceGiven, VocabularyTypesStrings.cls);
	            
	            searchedResources = repository.listSTNamedIndividuals();	            
	            collectResults(searchedResources, results, searchStringNamespace, searchStringLocalName, namespaceGiven, VocabularyTypesStrings.individual);            
            }
            else {
	            Iterator<ARTResource> searchedProperties = repository.listObjectProperties();
	            collectResults(searchedProperties, results, searchStringNamespace, searchStringLocalName, namespaceGiven, VocabularyTypesStrings.objectProperty);            	
	            searchedProperties = repository.listDatatypeProperties();
	            collectResults(searchedProperties, results, searchStringNamespace, searchStringLocalName, namespaceGiven, VocabularyTypesStrings.datatypeProperty);            	
	            searchedProperties = repository.listAnnotationProperties();
	            collectResults(searchedProperties, results, searchStringNamespace, searchStringLocalName, namespaceGiven, VocabularyTypesStrings.annotationProperty);            	
            }
            
            
        }        
        
        StructComparator sc = new StructComparator(); 
		Collections.sort(results, sc);
        
        System.out.println("results: " + results);
        
        return xmlizeResults(repository, results);
    }
    
    
    private Document xmlizeResults(ARTRepository rep, ArrayList<Struct> results) {
		Document xml = new DocumentImpl();
		Element treeElement = xml.createElement("Tree");
		treeElement.setAttribute("type", "ontSearch");		
		for (Struct result : results) {
			Element newElement = XMLHelp.newElement(treeElement,"found");
			newElement.setAttribute("name", rep.getQName(result._resource.getURI()));
			newElement.setAttribute("type", result._type);
		}
		xml.appendChild(treeElement);
		return xml;
    }
    
    
    private void collectResults(Iterator<ARTResource> searchedResources, ArrayList<Struct> results, String searchStringNamespace, String searchStringLocalName, boolean namespaceGiven, String type) {
    	System.out.println("collectResults: ");
    	double match;
        while (searchedResources.hasNext()) {
        	ARTResource nextClass=searchedResources.next();
        	System.out.println("comparing resource: " + nextClass);
        	if (checkNS(namespaceGiven, nextClass.getNamespace(), searchStringNamespace))
        		if ( ( match=CompareNames.compareSimilarNames(nextClass.getLocalName(), searchStringLocalName)) >= THRESHOLD)
        			results.add( new Struct(type, nextClass, null, match) );
        }
    }
    

    
    /**
     * the test is passed if the search String did not contain a namespace or if its namespace equals the namespace of the considered resource   
     * 
     * @param namespaceGiven
     * @param iteratedNamespace
     * @param searchStringNamespace
     * @return
     */
    private boolean checkNS(boolean namespaceGiven, String iteratedNamespace, String searchStringNamespace) {
    	if (namespaceGiven) return (searchStringNamespace.equals(iteratedNamespace));
    	else return true;
    }
    
    
    
    private class Struct {
        public String _type;
        public ARTResource _resource;
        public String _lexicalization;
        public double _value;               
        
        public Struct(String type, ARTResource resource, String lexicalization, double value) {
            _type = type;
            _resource = resource;
            _lexicalization = lexicalization;
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

	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}   
    
    
    
    
    
}
        
        
        
/*
		//se localNameEncodedClass == null non trova match esatto e cerca i valori simili
		if (localNameEncodedClass == null) {
			STResource localNameEncodedProperty = repository.getSTProperty(repository.expandQName(qName));
			STResource localNameEncodedInstance = repository.getSTResource(repository.expandQName(qName));
			if (localNameEncodedProperty != null){
				String typeName=repository.getTypeToString(qName);
				Element treeElement = xml.createElement("Tree");
				treeElement.setAttribute("type", "Element");
				treeElement.setAttribute("findType", "Find");
				Element find = XMLHelp.newElement(treeElement,"Find");
				find.setAttribute("resType", "Instance");
				find.setAttribute("name",qName );
				find.setAttribute("instance_name","");
				//NScarpato Add typeName for property
				find.setAttribute("typeName",typeName);
				xml.appendChild(treeElement);	
			}
			else if (localNameEncodedInstance != null) {
				//IT IS AN INSTANCE
				String typeName=repository.getTypeToString(qName);
				Element treeElement = xml.createElement("Tree");
				treeElement.setAttribute("type", "Element");
				treeElement.setAttribute("findType", "Find");
				Element find = XMLHelp.newElement(treeElement,"Find");
				find.setAttribute("resType", "Instance");
				find.setAttribute("name",qName );
				find.setAttribute("typeName",typeName);
				find.setAttribute("instance_name","");
				//ServletUtilities.getInstanceProperties(repository, localNameEncodedInstance, treeElement);											
				//Non cerco più le proprietà
				//ServletUtilities.getInstanceProperties(repository, localNameEncodedClass, localNameEncodedInstance, treeElement);
				xml.appendChild(treeElement);				
			}//localNameEncodedInstance != null E' UNA ISTANZA
			//Prendo gli elementi simili
			else {								
				results = new ArrayList<Struct>();
				//Classi con nome simile
				Collection<STResource> classes = repository.getSTNamedClasses();	
				Iterator<STResource> it = classes.iterator();
				while (it.hasNext()) {
					STResource cls = (STResource)it.next();					
					double value = CompareNames.compareSimilarNames(qNameEncoded, perfectMatch.getLocalName());
					if (value > THRESHOLD)  {
						results.add(new Struct("class", perfectMatch, null, value));
						
					}
				}
				//Istanze con nome simile								
				Collection<STResource> instances = repository.getSTInstances();
				it = instances.iterator();
				while (it.hasNext()) {
					STResource instance = (STResource)it.next();					
					double value = CompareNames.compareSimilarNames(qNameEncoded, instance.getLocalName());
					if (value > THRESHOLD)  {						
						results.add(new Struct("instance", instance, null, value));						
					}
					
					Iterator<STNode> semanticAnnotationsIterator = repository.listSTObjectPropertyValues(instance, SemAnnotVocab.Res.annotation);			
					while (semanticAnnotationsIterator.hasNext()) {
						STResource semanticAnnotationRes = semanticAnnotationsIterator.next().asResource();
						Collection<STNode> lexicalizationCollection = repository.getSTObjectDatatype(semanticAnnotationRes, SemAnnotVocab.Res.lexicalization);
						Iterator<STNode> lexicalizationIterator = lexicalizationCollection.iterator();
                        STNode lexicalizationValue = null;
						while (lexicalizationIterator.hasNext()) {
							lexicalizationValue = lexicalizationIterator.next();
						}
						String lexicalization = lexicalizationValue.toString();												
						if (!lexicalization.equals(instance.getLocalName())) {
							value = CompareNames.compareSimilarNames(qNameEncoded, lexicalization); 
							if (value > THRESHOLD) {									
								results.add(new Struct("lexicalization", instance, lexicalization, value));
							}
						}						
					}
				}
								
				StructComparator sc = new StructComparator(); 
				Collections.sort(results, sc);
				//NScarpato modificato per creare pannello ricerca
				Element treeElement = xml.createElement("Tree");
				treeElement.setAttribute("type", "Element");
				treeElement.setAttribute("findType", "similarList");
				Iterator<Struct> structIterator = results.iterator();
				while (structIterator.hasNext()) {
					Struct st = structIterator.next();						
					Element similarElement = XMLHelp.newElement(treeElement,"SimilarElement");
					if (st._type.equals("lexicalization")) {						
						similarElement.setAttribute("resType", "lexicalization");
						similarElement.setAttribute("instance_name", st._resource.getLocalName());
						similarElement.setAttribute("name", st._lexicalization);
						String typeName=repository.getTypeToString(st._resource.getLocalName());
						similarElement.setAttribute("typeName", typeName);
					}
					//Maybe instance or property if is a property attribute typeName = Property
					else if (st._type.equals("instance")) {																		
						similarElement.setAttribute("resType", "Instance");
						similarElement.setAttribute("name", st._resource.getLocalName());
						String typeName=repository.getTypeToString(st._resource.getLocalName());
						similarElement.setAttribute("typeName", typeName);
						similarElement.setAttribute("instance_name","");
						
					}
					else if (st._type.equals("class")) {						
						similarElement.setAttribute("resType", "Class");
						similarElement.setAttribute("name", st._resource.getLocalName());
						similarElement.setAttribute("instance_name","");
						//similarElement.setAttribute("typeName","");
						//NScarpato 24/05/2007 add superClassName attribute
						String superClassName=repository.getDirectSuperClass(st._resource).getLocalName();
						s_logger.debug("superClsName"+superClassName);
						similarElement.setAttribute("typeName",superClassName);
					}					
				}
				xml.appendChild(treeElement);
			}//localNameEncodedInstance == null(NON é UN'Istanza)
		}//localNameEncodedClass !=null (E' UNA CLASSE)
		else {						
			ArrayList<STResource> list = new ArrayList<STResource>();			
			list.add(localNameEncodedClass);
            list.addAll(repository.getSTSuperClasses(localNameEncodedClass));							
			Element treeElement = xml.createElement("Tree");
			treeElement.setAttribute("type", "Element");
			treeElement.setAttribute("findType", "Find");
			Element find = XMLHelp.newElement(treeElement,"Find");
			find.setAttribute("resType", "Class");
			find.setAttribute("name",qName );
			find.setAttribute("typeName","");
			find.setAttribute("instance_name","");
			xml.appendChild(treeElement);			
		}
		return xml;
	}

	*/

