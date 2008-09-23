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
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about SemanticTurkey can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.filter.DomainResourcePredicate;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.art.ontapi.filter.NoLanguageResourcePredicate;
import it.uniroma2.art.ontapi.filter.RootClassesResourcePredicate;
import it.uniroma2.art.ontapi.filter.URIResourcePredicate;
import it.uniroma2.art.ontapi.vocabulary.RDFS;
import it.uniroma2.art.ontapi.vocabulary.VocabularyTypesInts;

import java.util.Collection;
import java.util.Iterator;

import org.apache.commons.collections.Predicate;
import org.apache.commons.collections.PredicateUtils;
import org.apache.commons.collections.iterators.FilterIterator;
import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**Classe che provvede alla creazione degli elementi xml relativi a: 1)L'albero delle classi e sottoclassi,
 * 2)la lista delle istanze 3) alla istanziazione delle classi*/
/**
 * @author Donato Griesi, Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class Cls extends Resource{
	static final private String clsQNameField = "clsName";
	static final private String instanceNameString = "instanceName";
	//final private String subTree = "subTree";
	
	static final public String templateandvalued = "templateandvalued";
	
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);
	
	public Cls(String id){
		this.id = id;
	}
	
	/**Metodo che provvede alla creazione degli elementi xml relativi a: 1)L'albero delle classi e sottoclassi
	 * 2)la lista delle istanze 3) alla istanziazione delle classi. I vari eventi sono distinti in base al 
	 * numero di parametri che vengono passati alla servlet*/
	public Document XMLData() {	
		Document xml = null;
		ServletUtilities servletUtilities = new ServletUtilities();
		Individual individual = new Individual("individual");
		
		String request = _oReq.getParameter("request");
		//all new fashoned requests are put inside these grace brackets
		if (request!=null) {	
			
			this.fireServletEvent();
			//EDIT_PROPERTY METHODS
			if (request.equals(classDescriptionRequest)) {
				String classQNameEncoded = _oReq.getParameter(clsQNameField);
				String method = _oReq.getParameter("method");		
	            return getClassDescription(classQNameEncoded, method);
			}			
	        if ( request.equals("add_type") )
	            return individual.addType(_oReq.getParameter("clsqname"), _oReq.getParameter("typeqname"));
	        if ( request.equals("remove_type") ) 
	            return individual.removeType(_oReq.getParameter("clsqname"), _oReq.getParameter("typeqname"));
	        if ( request.equals("add_supercls") )
	            return addSuperClass(_oReq.getParameter("clsqname"), _oReq.getParameter("superclsqname"));
	        if ( request.equals("remove_supercls") ) 
	            return removeSuperClass(_oReq.getParameter("clsqname"), _oReq.getParameter("superclsqname"));
			else return servletUtilities.documentError("no handler for such a request!");		
		}
		
		
		if (_oReq.getParameterMap().entrySet().size() == 1) {
			xml = createClassXMLTree();
		}
		
		//service=cls&clsName=...
		else if (_oReq.getParameterMap().entrySet().size() == 2) {
			String clsQName = servletUtilities.removeInstNumberParentheses(_oReq.getParameter(clsQNameField));
			xml = getInstancesListXML(clsQName);
		}
		
        //TODO ORRENDA!!! è un caso che distingue tra due diverse possibili invocazionei del client!
		else if (_oReq.getParameterMap().entrySet().size() == 3) {			
            String clsQName = servletUtilities.removeInstNumberParentheses(_oReq.getParameter(clsQNameField));        
            //to create and instance
            String instanceQName = _oReq.getParameter(instanceNameString);  
			xml = createInstanceOption(instanceQName, clsQName);
		}
		  
		else return ServletUtilities.getService().documentError("no handler for such a request!");
		
		this.fireServletEvent();
		return xml;
	}


    
    /**Crea l'elemento lista nel file xml che contiene l'elenco 
     * delle istanze della classe
     * @author NScarpato
     * @param String clsName: nome della classe
     * @return Document list*/ 
    public Document getInstancesListXML(String clsQName) {
    	ServletUtilities servletUtilities = new ServletUtilities();
    	s_logger.debug("replying to \"getInstancesListXML(" + clsQName + ")\"");
        ARTRepository repository = Resources.getRepository();      
        ARTResource cls = repository.getSTClass(repository.expandQName(clsQName));
        if (cls==null)
        	return servletUtilities.documentError("class: " + clsQName + " is not present in the repository");
        Document list = new DocumentImpl();                         
        Element listElement = list.createElement("Tree");
        listElement.setAttribute("type", "Instpanel");
        Element root = XMLHelp.newElement(listElement,"Class");                                 
        root.setAttribute("name", clsQName);  //the instance widget is a tree where the root is the class which has a flat list of children given by its instances. The name of the class is necessary to sync the number of instances reported in brackets near the classes in the classs tree (he has to find the class by its name!)  
        String numTotInst=""+repository.getDirectInstances(cls).size();
        root.setAttribute("numTotInst",numTotInst);  //again, to sync with the class tree (update the number of instances near the name of the classes)
        createInstancesXMLList(repository, cls, root);
        list.appendChild(listElement);
        return list;
    }
    
	    /**Crea la lista delle Istanze
		 * TODO storage independent
		 * @param SesameARTRepositoryImpl repository 
		 * @param String clsName
		 * @param Element element: elemento xml padre delle istanze*/
		private void createInstancesXMLList(ARTRepository repository, ARTResource cls, Element element) {		
		    Element instancesElement = XMLHelp.newElement(element, "Instances");
		    
		    //TODO filter on admin also here
	        Collection<ARTResource> directInstances = repository.getDirectInstances(cls, false);
	        Collection<ARTResource> directExplicitInstances = repository.getDirectInstances(cls, true);

	        for (ARTResource instance : directInstances) {
	            if (instance.isNamedResource())      //TODO STARRED: is this check useless for instances? (used to avoid restrictions for classes)  
	            {
	                Element instanceElement = XMLHelp.newElement(instancesElement,"Instance");  
	                instanceElement.setAttribute("name", repository.getQName(instance.getURI()));   
	                String explicit;
	                if   (directExplicitInstances.contains(instance)) explicit="true";
	                else explicit="false";
	                instanceElement.setAttribute("explicit", explicit);
	            }
	        }

		}	
    

    
    /**
     * creates an instance 
     * @return
     */
    public Document createInstanceOption(String instanceQName, String clsQName) {                  
    	ServletUtilities servletUtilities = new ServletUtilities();
        ARTRepository repository = Resources.getRepository();
        ARTResource instanceRes = repository.getSTResource(repository.expandQName(instanceQName));             
        if (instanceRes != null) {  
            return servletUtilities.documentError("there is another resource with the same name!");
        }
                                        
        try {
    		ARTResource clsRes = repository.getSTClass(repository.expandQName(clsQName));									
    		repository.addSTIndividual(repository.expandQName(instanceQName), clsRes);
		} catch (RepositoryUpdateException e) {						
			s_logger.error("instance creation error: ", e);
			return servletUtilities.documentError("instance creation error: " + e.getMessage());
		}

		return updateClassOnTree(clsQName, instanceQName);
    }
    
    /**
     * move an instance 
     * @return
     
    private static Document moveInstanceOption() {
    	
    	 	
    }*/
    
    
    public Document updateClassOnTree(String clsQName, String instanceName) {
        Document xml = new DocumentImpl();
        ServletUtilities servletUtilities = new ServletUtilities();
        ARTRepository repository = Resources.getRepository(); 
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type", "update_cls");     
        Element clsElement = XMLHelp.newElement(treeElement,"Class");                                   
        clsElement.setAttribute("clsName", clsQName);                
        ARTResource cls = repository.getSTClass(repository.expandQName(clsQName));
        String numTotInst=""+repository.getDirectInstances(cls).size();
        clsElement.setAttribute("numTotInst",numTotInst);
        Element instanceElement = XMLHelp.newElement(treeElement,"Instance");
        instanceElement.setAttribute("instanceName", servletUtilities.decodeLabel(instanceName));
        xml.appendChild(treeElement);   
        return xml;        
    }
    

    
    
    /**@author NScarpato 24/05/2007
     * gets a class tree taking a class as root
	 *@return Document tree*/
	public Document getClassSubTreeXML(String clsQName) {
		ARTRepository repository = Resources.getRepository();		
		ARTResource cls = repository.getSTClass(repository.expandQName(clsQName));
		Document tree = new DocumentImpl();							
		Element treeElement = tree.createElement("Tree");
		treeElement.setAttribute("type", "ClassesTree");
		this.recursiveCreateClassesXMLTree(repository, cls, treeElement);
		tree.appendChild(treeElement);	
		s_logger.debug("ritorno?"+tree);
		return tree;
	}
    
    
	//TODO, se possibile, togliamo anche quell'odioso: subclasses. Non serve a niente e complica la vita a tutti!
    /**Crea l'elemento tree nel file xml che contiene l'elenco delle classi e sottoclassi
     * 	<Tree type="AllClassesTree">
     *		<Class deleteForbidden="true" name="filas:Person" numInst="0">
     *   		<SubClasses>
     *   			<Class deleteForbidden="true" name="Researcher" numInst="1">
     *   				<SubClasses/>
     *   			</Class>
     *   		</SubClasses>
     *		</Class>
     *		<Class deleteForbidden="true" name="filas:Organization" numInst="1">
     *   		<SubClasses/>
     *		</Class>
     *  </Tree>
     * 
     *@return Document tree*/
    public Document createClassXMLTree() {
        
        ARTRepository repository = Resources.getRepository();      
        Document tree = new DocumentImpl();                         
        Element treeElement = tree.createElement("Tree");
        treeElement.setAttribute("type", "ClassesTree");
            	
        
        Predicate exclusionPredicate;
        if (Config.isAdminStatus()) exclusionPredicate = NoLanguageResourcePredicate.nlrPredicate;
        else exclusionPredicate = DomainResourcePredicate.domResPredicate;
        
        Predicate rootUserClsPred = PredicateUtils.andPredicate(new RootClassesResourcePredicate(repository), exclusionPredicate);         
        FilterIterator filtIt = new FilterIterator(repository.listSTNamedClasses(), rootUserClsPred);
 
        while (filtIt.hasNext()) {
            ARTResource cls = (ARTResource)filtIt.next();
            recursiveCreateClassesXMLTree(repository, cls, treeElement);            
        }
        
        tree.appendChild(treeElement); 
        return tree;
        
    }   
    
    
    
    
    
    /**Carica ricorsivamente le classi,le sottoclassi e le istanze dell'ontologia 
     *TODO storage independent 
     *@param SesameARTRepositoryImpl repository
     *@param Resource resource
     *@param Element element :elemento xml padre delle classi (le sottoclassi e le istanze vengono aggiunte ricorsivamente) 
     **/
    void recursiveCreateClassesXMLTree(ARTRepository repository, ARTResource cls, Element element) {      
    	ServletUtilities servletUtilities = new ServletUtilities();
    	Element classElement = XMLHelp.newElement(element,"Class");                                 
        boolean deleteForbidden = servletUtilities.checkWriteOnly(cls); 
        classElement.setAttribute("name", repository.getQName(cls.getURI()));    
        
        if(repository.getDirectInstances(cls).size()>0){
            String numInst="("+repository.getDirectInstances(cls).size()+")";
            classElement.setAttribute("numInst",numInst);
        }
        else classElement.setAttribute("numInst","0");
        
        classElement.setAttribute("deleteForbidden",Boolean.toString(deleteForbidden));

        
        Iterator<ARTResource> subClassesIterator = repository.getDirectSubclasses(cls).iterator();         
        FilterIterator namedSubClassesIterator = new FilterIterator(subClassesIterator, URIResourcePredicate.uriFilter);
        Element subClassesElem = XMLHelp.newElement(classElement, "SubClasses");
        while (namedSubClassesIterator.hasNext()) { 
        	ARTResource subClass = (ARTResource)namedSubClassesIterator.next();                                  
            recursiveCreateClassesXMLTree(repository, subClass, subClassesElem);   
        }
    }	
    
    
	//STARRED ti serve pure il nome della istanza?
	/**
	 * gets the namespace mapping for the loaded ontology
     * 
     * <Tree type="add_superclass">
     *      <Type qname="rtv:Person"/>
     * </Tree>
     * 
	 */
	public Document addSuperClass(String clsQName, String superclsQName) {
		s_logger.debug("replying to \"addSuperClass(" + clsQName + "," + superclsQName + ")\".");
		ARTRepository repository = Resources.getRepository();
		ServletUtilities servletUtilities = new ServletUtilities();
		
		ARTResource cls = repository.getSTResource(repository.expandQName(clsQName));
		ARTResource superCls = repository.getSTResource(repository.expandQName(superclsQName));
		
		if (cls==null)
			return servletUtilities.documentError(clsQName + " is not present in the ontology");
		
		if (superCls==null)
			return servletUtilities.documentError(superclsQName + " is not present in the ontology");		
		
		Collection<ARTResource> superClasses = repository.getDirectSuperClasses(cls);
		
		if (superClasses.contains(superCls))
			return servletUtilities.documentError(superclsQName + " is already a type for: " + clsQName);
		
		try {
			repository.addSuperClass(cls, superCls);
		} catch (RepositoryUpdateException e) {
    		s_logger.debug(Utilities.printStackTrace(e));
    		return servletUtilities.documentError("error in adding type: " + superclsQName + " to cls " + clsQName + ": " + e.getMessage());
		}
		
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","add_superclass");              
    	Element typeElement = XMLHelp.newElement(tree, "Type");
    	typeElement.setAttribute("qname",superclsQName);        
        xml.appendChild(tree);
        return xml;
    }
	
    
	//STARRED ti serve pure il nome della istanza?
	/**
	 * gets the namespace mapping for the loaded ontology
     * 
     * <Tree type="remove_superclass">
     *      <Type qname="rtv:Person"/>
     * </Tree>
     * 
	 */
	public Document removeSuperClass(String clsQName, String superClassQName) {
		s_logger.debug("replying to \"removeType(" + clsQName + "," + superClassQName + ")\".");
		ARTRepository repository = Resources.getRepository();
		ServletUtilities servletUtilities = new ServletUtilities();
		
		ARTResource cls = repository.getSTResource(repository.expandQName(clsQName));
		ARTResource superCls = repository.getSTResource(repository.expandQName(superClassQName));
		
		if (cls==null)
			return servletUtilities.documentError(clsQName + " is not present in the ontology");
		
		if (superCls==null)
			return servletUtilities.documentError(superClassQName + " is not present in the ontology");		
		
		Collection<ARTResource> superClasses = repository.getDirectSuperClasses(cls);
		
		if (!superClasses.contains(superCls))
			return servletUtilities.documentError(superClassQName + " is not a superclass for: " + clsQName);
		
		if (!repository.hasExplicitStatement(cls, RDFS.Res.SUBCLASSOF, superCls))
			return servletUtilities.documentError("this sublcass relationship comes from an imported ontology or has been inferred, so it cannot be deleted explicitly");
		
		try {
			repository.removeSuperClass(cls, superCls);
		} catch (RepositoryUpdateException e) {
    		s_logger.debug(Utilities.printStackTrace(e));
    		return servletUtilities.documentError("error in removing superclass: " + superClassQName + " from class " + clsQName + ": " + e.getMessage());
		}
		
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","remove_superclass");              
    	Element typeElement = XMLHelp.newElement(tree, "Type");
    	typeElement.setAttribute("qname",superClassQName);        
        xml.appendChild(tree);
        return xml;
    }

    
    
    
	/**
	 * 
	 *  very similar to getInstanceDescription, it contains additional features for classes (subclass property is reported apart).
	 *  property values are given by those properties defined upon metaclasses.
	 * 
     * <Tree request="getClsDescription" type="templateandvalued">
     *     <Types>
     *         <Type class="owl:Class" explicit="true"/>
     *     </Types>
     *     <SuperTypes>
     *         <SuperType explicit="true" resource="rtv:Person"/>
     *     </SuperTypes>
     *     <Properties/>
     * </Tree>
	 * 
	 * @param subjectClassQName the instance to which the new instance is related to
	 * @return
	 */
	public Document getClassDescription(String subjectClassQName, String method) {
		s_logger.debug("getClassDescription; qname: " + subjectClassQName);
		return getResourceDescription(subjectClassQName, VocabularyTypesInts.cls, method);
	}
 
	

	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}
    
    
    
}
