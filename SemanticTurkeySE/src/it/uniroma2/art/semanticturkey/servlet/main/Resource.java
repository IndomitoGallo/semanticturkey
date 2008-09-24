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

  /*
   * Contributor(s): Armando Stellato stellato@info.uniroma2.it
  */
package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.filter.NoSystemResourcePredicate;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.utilities.PropertyShowOrderComparator;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.STVocabUtilities;
import it.uniroma2.art.ontapi.ARTNode;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.ARTStatement;
import it.uniroma2.art.ontapi.ARTStatementIterator;
import it.uniroma2.art.ontapi.filter.NoLanguageResourcePredicate;
import it.uniroma2.art.ontapi.filter.NoSubclassPredicate;
import it.uniroma2.art.ontapi.filter.NoSubpropertyPredicate;
import it.uniroma2.art.ontapi.filter.NoTypePredicate;
import it.uniroma2.art.ontapi.filter.URIResourcePredicate;
import it.uniroma2.art.ontapi.vocabulary.OWL;
import it.uniroma2.art.ontapi.vocabulary.RDF;
import it.uniroma2.art.ontapi.vocabulary.RDFS;
import it.uniroma2.art.ontapi.vocabulary.VocabularyTypesInts;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Predicate;
import org.apache.commons.collections.PredicateUtils;
import org.apache.commons.collections.functors.NOPTransformer;
import org.apache.commons.collections.iterators.FilterIterator;
import org.apache.commons.collections.map.MultiValueMap;
import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

public abstract class Resource extends InterfaceServiceServlet {
    
    final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);
    public static final String templateandvalued = "templateandvalued";

    public static final String propertyDescriptionRequest = "getPropDescription";
    public static final String classDescriptionRequest = "getClsDescription";
    public static final String individualDescriptionRequest = "getIndDescription";
    
    protected Document getResourceDescription(String resourceQName, int restype, String method) {
        ARTRepository repository = Resources.getRepository();            
        ARTResource resource = repository.getSTResource(repository.expandQName(resourceQName));         
        
        HashSet<ARTResource> properties = new HashSet<ARTResource>();

        //TEMPLATE PROPERTIES (properties which can be shown since the selected instance has at least a type which falls in their domain)
        extractTemplateProperties(repository, resource, properties);
                
        //VALUED PROPERTIES (properties over which the selected instance has one or more values)
        MultiValueMap propertyValuesMap = new MultiValueMap(); //i i want the collection of values for each property to be a set, i could use MultiValueMap, and define an HashSet Factory      
        if (method.equals(templateandvalued)) {
            extractValuedProperties(repository, resource, properties, propertyValuesMap);           
        }
                    
        //XML COMPILATION SECTION       
        return getXMLResourceDescription(repository, resource, restype, method, properties, propertyValuesMap);
    }
    
    
    //TODO generate specific filters for classes, properties and individuals
    /**
     * this part runs across all the types of the explored resource, reporting all the properties which one of the types as domain
     * 
     * @param repository
     * @param resource
     * @param properties
     */
    protected void extractTemplateProperties(ARTRepository repository, ARTResource resource, HashSet<ARTResource> properties) {
        
        Collection<ARTResource> types = repository.getTypes(resource);
        
        //gets only domain types, no rdf/rdfs/owl language classes cited in the types nor, if in userStatus, any type class from any application ontology
        Predicate filter = NoLanguageResourcePredicate.nlrPredicate;
        if (!Config.isAdminStatus()) filter = PredicateUtils.andPredicate(filter, NoSystemResourcePredicate.noSysResPred);    

        //template props are pruned of type declarations
        Collection<Predicate> prunedPredicates = new ArrayList<Predicate>();
        prunedPredicates.add(NoTypePredicate.noTypePredicate);
        prunedPredicates.add(NoSubclassPredicate.noSubclassPredicate);
        prunedPredicates.add(NoSubpropertyPredicate.noSubpropertyPredicate);
        if (!Config.isAdminStatus()) prunedPredicates.add(NoSystemResourcePredicate.noSysResPred);          
        Predicate propsExclusionPredicate = PredicateUtils.allPredicate(prunedPredicates);  
        
        s_logger.debug("types for " + resource +": " + types);
        FilterIterator filteredTypesIterator = new FilterIterator(types.iterator(), filter); 
        while (filteredTypesIterator.hasNext()) {
            ARTResource typeCls = (ARTResource)filteredTypesIterator.next();
            if (typeCls.isNamedResource())
            {
                FilterIterator filteredPropsIterator = new FilterIterator(repository.getPropertiesForDomainClass( typeCls ), propsExclusionPredicate);
                while (filteredPropsIterator.hasNext()) {
                    properties.add((ARTResource)filteredPropsIterator.next());
                }
            }
        }
    }

    //TODO generate specific filters for classes, properties and individuals
    protected void extractValuedProperties(ARTRepository repository, ARTResource resource, HashSet<ARTResource> properties, MultiValueMap propertyValuesMap) {
        ARTStatementIterator stit = repository.getStatements(resource, null, null);
        while (stit.hasNext()) {
            ARTStatement st = stit.next();
            ARTResource valuedProperty = st.getPredicate();
            if (!valuedProperty.equals(RDFS.Res.DOMAIN) && !valuedProperty.equals(RDFS.Res.RANGE) && !valuedProperty.equals(RDF.Res.TYPE) && !valuedProperty.equals(OWL.Res.INVERSEOF) && !valuedProperty.equals(RDFS.Res.SUBCLASSOF) && !valuedProperty.equals(RDFS.Res.SUBPROPERTYOF) && ( Config.isAdminStatus() || !STVocabUtilities.isSystemResource(valuedProperty)) ) {    
                s_logger.debug("adding " + st.getObject() + " to " + valuedProperty + " bucket");
                properties.add(valuedProperty);
                propertyValuesMap.put(valuedProperty, st.getObject());     
            }
        }
    }
    
    protected Document getXMLResourceDescription(ARTRepository repository, ARTResource resource, int restype, String method, HashSet<ARTResource> properties, MultiValueMap propertyValuesMap) {
        ArrayList<ARTResource> sortedProperties = new ArrayList<ARTResource>(properties);       
        s_logger.debug("sortedProperties: " + sortedProperties);
        Collections.sort(sortedProperties, new PropertyShowOrderComparator(repository));
                    
        //XML TREE HEADER
        Document tree = new DocumentImpl();                         
        Element treeElement = tree.createElement("Tree");    
        treeElement.setAttribute("type", method);

        if (restype==VocabularyTypesInts.cls)
            treeElement.setAttribute("request", classDescriptionRequest);
        else if (restype==VocabularyTypesInts.individual)
            treeElement.setAttribute("request", individualDescriptionRequest);
        else if (restype==VocabularyTypesInts.property)
            treeElement.setAttribute("request", propertyDescriptionRequest);        
        
        //TYPES           
        System.out.println("method = " + method);
        if (method.equals(templateandvalued)) {           
            Element typesElement = XMLHelp.newElement(treeElement,"Types");
            
            //TODO filter on admin also here
            Collection<ARTResource> directTypes = repository.getDirectTypes(resource);
            Collection<ARTResource> directExplicitTypes = repository.getDirectTypes(resource, true);

            for (ARTResource type : directTypes) {
                Element typeElem = XMLHelp.newElement(typesElement,"Type");                  
                typeElem.setAttribute("class", repository.getQName( type.getURI() ));
                String explicit;
                if   (directExplicitTypes.contains(type)) explicit="true";
                else explicit="false";
                typeElem.setAttribute("explicit", explicit);
            }
        }
        
        //SUPERTYPES
        if (method.equals(templateandvalued) && restype!=VocabularyTypesInts.individual) {     
            //TODO filter on admin also here
            Collection<ARTResource> directSuperTypes; 
            Collection<ARTResource> directExplicitSuperTypes; 

            Element superTypesElem = XMLHelp.newElement(treeElement,"SuperTypes");
            
            if (restype==VocabularyTypesInts.cls) {
                directSuperTypes = repository.getDirectSuperClasses(resource);
                directExplicitSuperTypes = repository.getDirectSuperClasses(resource, true);
            }
            else  { //should be - by exclusion - properties
                directSuperTypes = repository.getDirectSuperProperties(resource);
                directExplicitSuperTypes = repository.getDirectSuperProperties(resource, true);                
            }
            
            for (ARTResource superType : directSuperTypes) {
                if (superType.isNamedResource())      //TODO STARRED: improve to add support for restrictions...  
                {
                    Element superTypeElem = XMLHelp.newElement(superTypesElem,"SuperType");                  
                    superTypeElem.setAttribute("resource", repository.getQName( superType.getURI() ));
                    String explicit;
                    if   (directExplicitSuperTypes.contains(superType)) explicit="true";
                    else explicit="false";
                    superTypeElem.setAttribute("explicit", explicit);
                }
            }
        }
        
        //PROPERTY DOMAIN/RANGE, FACETS
        if (restype==VocabularyTypesInts.property)
                enrichXMLForProperty(repository, resource, treeElement);
        
        //OTHER PROPERTIES
        
        Element propertiesElement = XMLHelp.newElement(treeElement, "Properties");
        
        for (ARTResource prop : sortedProperties) {
            Element propertyElem = XMLHelp.newElement(propertiesElement,"Property");                  
            propertyElem.setAttribute("name", repository.getQName(prop.getURI())); 
            
            if (repository.isDatatypeProperty(prop)) {
                propertyElem.setAttribute("type","owl:DatatypeProperty");
            } else if(repository.isObjectProperty(prop)){
                propertyElem.setAttribute("type", "owl:ObjectProperty");
            } else if(repository.isAnnotationProperty(prop)){
                propertyElem.setAttribute("type",  "owl:AnnotationProperty");
            } else if(repository.isProperty(prop)){
                propertyElem.setAttribute("type", "rdf:Property");
            } else {
                propertyElem.setAttribute("type", "unknown"); //this is just a safe exit for discovering bugs, all of them should fall into one of the above 4 property types
            }

            if (propertyValuesMap.containsKey(prop)) //if the property has a a value, which has been collected before
                for (ARTNode value: (Collection<ARTNode>)propertyValuesMap.getCollection(prop)) {
                    s_logger.debug("resource viewer: writing value: " + value + " for property: " + prop);
                    Element valueElem = XMLHelp.newElement(propertyElem,"Value");                    
                    if (value.isResource()) {
                        valueElem.setAttribute("value", repository.getQName(value.asResource().getURI()));
                        valueElem.setAttribute("type", "rdfs:Resource");
                    }
                    else if (value.isLiteral()) {
                        valueElem.setAttribute("value", value.toString());
                        valueElem.setAttribute("type", "rdfs:Literal");
                        String lang = value.asLiteral().getLanguage();
                        if ( lang  != null )
                            valueElem.setAttribute("lang", lang);    
                    }                       
                    valueElem.setAttribute("explicit", checkExplicit(repository, resource, prop, value));
                }                                     
        }     
            
        tree.appendChild(treeElement);                                  
        return tree;
        
    }
    
    private String checkExplicit(ARTRepository repository, ARTResource subj, ARTResource pred, ARTNode obj) {
        if (repository.hasExplicitStatement(subj, pred, obj) ) return "true";
        else return "false";
    }
    
    private void enrichXMLForProperty(ARTRepository repository, ARTResource property, Element treeElement) {
        
        //DOMAIN AND RANGES        
        Element domainsElement = XMLHelp.newElement(treeElement, "domains");
        Iterator<ARTResource> domains = repository.getPropertyDomains(property);
        domains = new FilterIterator(domains, URIResourcePredicate.uriFilter);
        Collection<ARTResource> explicitDomains = CollectionUtils.collect(repository.getPropertyDomains(property, true), NOPTransformer.INSTANCE) ;    
        System.out.println("explicitDomains: " + explicitDomains);
        while (domains.hasNext()) {
            ARTResource nextDomain = domains.next();
            System.out.println("checking domain: " + nextDomain);
            Element domainElement = XMLHelp.newElement(domainsElement, "domain");
            domainElement.setAttribute("name", repository.getQName(nextDomain.getURI()) );
            if (explicitDomains.contains(nextDomain)) domainElement.setAttribute("explicit", "true" );
            else domainElement.setAttribute("explicit", "false" );
        }

        Element rangesElement = XMLHelp.newElement(treeElement, "ranges");
        Iterator<ARTResource> ranges = repository.getPropertyRanges(property);
        ranges = new FilterIterator(ranges, URIResourcePredicate.uriFilter);
        Collection<ARTResource> explicitRanges = CollectionUtils.collect(repository.getPropertyRanges(property, true), NOPTransformer.INSTANCE) ;
        while (ranges.hasNext()) {
            ARTResource nextRange = ranges.next();
            Element rangeElement = XMLHelp.newElement(rangesElement, "range");
            rangeElement.setAttribute("name", repository.getQName(nextRange.getURI()) );
            if (explicitRanges.contains(nextRange)) rangeElement.setAttribute("explicit", "true" );
            else rangeElement.setAttribute("explicit", "false" ); 
        }
        
        //FACETS
        Element facetsElement = XMLHelp.newElement(treeElement, "facets");
        
        if (repository.isSymmetricProperty(property)) {
            Element symmetricPropElement = XMLHelp.newElement(facetsElement, "symmetric");
            symmetricPropElement.setAttribute("value", "true" ); 
            if (repository.hasExplicitStatement(property, RDF.Res.TYPE, OWL.Res.SYMMETRICPROPERTY))
                symmetricPropElement.setAttribute("explicit", "true" );
            else symmetricPropElement.setAttribute("explicit", "false" );
        }
        if (repository.isFunctionalProperty(property)) {
            Element functionalPropElement = XMLHelp.newElement(facetsElement, "functional");
            functionalPropElement.setAttribute("value", "true" ); 
            if (repository.hasExplicitStatement(property, RDF.Res.TYPE, OWL.Res.FUNCTIONALPROPERTY))
                functionalPropElement.setAttribute("explicit", "true" );
            else functionalPropElement.setAttribute("explicit", "false" );
        }
        if (repository.isInverseFunctionalProperty(property)) {
            Element inverseFunctionalPropElement = XMLHelp.newElement(facetsElement, "inverseFunctional");
            inverseFunctionalPropElement.setAttribute("value", "true" ); 
            if (repository.hasExplicitStatement(property, RDF.Res.TYPE, OWL.Res.INVERSEFUNCTIONALPROPERTY))
                inverseFunctionalPropElement.setAttribute("explicit", "true" );
            else inverseFunctionalPropElement.setAttribute("explicit", "false" );
        }
        if (repository.isTransitiveProperty(property)) {
            Element transitivePropElement = XMLHelp.newElement(facetsElement, "transitive");
            transitivePropElement.setAttribute("value", "true" ); 
            if (repository.hasExplicitStatement(property, RDF.Res.TYPE, OWL.Res.TRANSITIVEPROPERTY))
                transitivePropElement.setAttribute("explicit", "true" );
            else transitivePropElement.setAttribute("explicit", "false" );
        }
        ARTStatementIterator iterator = repository.getStatements(property, OWL.Res.INVERSEOF, null);
        if (iterator.hasNext()) {
            Element inverseHeaderElement = XMLHelp.newElement(facetsElement, "inverseOf");
            while (iterator.hasNext()) {
                ARTResource inverseProp = iterator.next().getObject().asResource();
                Element transitivePropElement = XMLHelp.newElement(inverseHeaderElement, "Value");
                transitivePropElement.setAttribute("value", repository.getQName(inverseProp.getURI()) ); 
                if (repository.hasExplicitStatement(property, OWL.Res.INVERSEOF, inverseProp))
                    transitivePropElement.setAttribute("explicit", "true" );
                else transitivePropElement.setAttribute("explicit", "false" );
            }
        }
        
    }
    
    
}
