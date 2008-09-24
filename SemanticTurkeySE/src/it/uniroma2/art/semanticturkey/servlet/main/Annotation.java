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
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.art.ontapi.ARTLiteral;
import it.uniroma2.art.ontapi.ARTNode;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.RepositoryUtilities;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.art.ontapi.utilities.DeletePropagationPropertyTree;

import java.util.Collection;
import java.util.Iterator;


import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Service which managing annotation requests
 * 
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati (for moving to the extension framework)
 */
public class Annotation extends InterfaceServiceServlet {
    protected final String urlPageString = "urlPage";
	protected final String titleString = "title";
	protected final String annotQNameString = "annotQName";
	protected final String textString = "text";
	protected final Logger s_logger = Logger.getLogger(SemanticTurkey.class);
	protected final String clsQNameField = "clsQName";
	protected final String instanceQNameField = "instanceQName";
	protected final String objectClsNameField = "objectClsName";
	protected final String objectQNameField = "objectQName";
	protected final String urlPageField = "urlPage";
	protected final String titleField = "title";
	protected final String propertyQNameField = "propertyQName";
	protected final String langField = "lang";

	
	protected ServletUtilities servletUtilities;	
	protected DeletePropagationPropertyTree deletePropertyPropagationTreeForAnnotations;
	
	public Annotation(String id){
		this.id = id;
	    servletUtilities = new ServletUtilities();
	}
	
    protected void initializeDeletePropertyPropagationTreeForAnnotations() {
        deletePropertyPropagationTreeForAnnotations = new DeletePropagationPropertyTree();
        deletePropertyPropagationTreeForAnnotations.addChild(SemAnnotVocab.Res.location);
    }
	
	
	/**
     * Metodo che realizza la lessicalizzazione di un'istanza 
     * se i parametri sono 5 la chiamata al servizio è stata fatta tramite il drag and drop su un'istanza
     * se sono due? boh TODO
	 *@return Document xml */
	public Document XMLData() {		
		Document xml=null;
		String request = _oReq.getParameter("request");
		if (request==null)
		    request="";   //TODO remove this! put just for capturing old "without request parameter" calls
		
		if (request.equals("getPageAnnotations") ) {
			String urlPage = _oReq.getParameter(urlPageString);
            xml = getPageAnnotations(urlPage);
		}
        else if (request.equals("chkAnnotations")) {
            String urlPage = _oReq.getParameter(urlPageString);
            xml = chkPageForAnnotations(urlPage);
        }       
        else if (request.equals("removeAnnotation")) {
            String annotQName = _oReq.getParameter(annotQNameString);
            xml = removeAnnotation(annotQName);
        }       	
        else if (request.equals("createAndAnnotate")) {
            
            String clsQName = servletUtilities.removeInstNumberParentheses(_oReq.getParameter(clsQNameField));          
            String instanceNameEncoded = servletUtilities.encodeLabel(_oReq.getParameter(instanceQNameField));
            
            String urlPage = _oReq.getParameter(urlPageString);         
            String title = _oReq.getParameter(titleString);

            xml = dragDropSelectionOverClass(instanceNameEncoded, clsQName, urlPage, title); 

        }  
        else if (request.equals("addAnnotation")) {			
			String urlPage = _oReq.getParameter(urlPageString);           
			String instanceQName = _oReq.getParameter(instanceQNameField);
			String text = _oReq.getParameter(textString);
			String textEncoded = servletUtilities.encodeLabel(text);
			String title = _oReq.getParameter(titleString);
			
            annotateInstanceWithDragAndDrop(instanceQName, textEncoded, urlPage, title);
    	}		
        else if (request.equals("relateAndAnnotate")) {
            String subjectInstanceQName = _oReq.getParameter(instanceQNameField);   
            String predicatePropertyName = _oReq.getParameter(propertyQNameField);      
            String objectInstanceName = _oReq.getParameter(objectQNameField);
            String objectInstanceNameEncoded = servletUtilities.encodeLabel(objectInstanceName);
            String urlPage = _oReq.getParameter(urlPageField);          
            String title = _oReq.getParameter(titleField);
            String op = _oReq.getParameter("op");        

            //httpGet2( http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&instanceQName=Armando Stellato&propertyQName=filas:worksInCompany&objectQName=University of Rome&objectClsName=filas:Company&urlPage=http://ai-nlp.info.uniroma2.it/zanzotto/short_bio.html&title=Enrichment Property&op=bind
            //httpGet2("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&instanceQName=" + subjectInstanceName + "&propertyQName=" +predicatePropertyName+ "&objectClsName=" + objectClsName2 + "&objectQName=" + objectInstanceName +"&urlPage=" + window.arguments[0].urlPage + "&title=" + title+"&op=bind", false);
            if (op.equals("bindCreate")) {
                String rangeClsName = _oReq.getParameter(objectClsNameField);
                String lang = _oReq.getParameter(langField);
                return bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance(subjectInstanceQName, predicatePropertyName, objectInstanceNameEncoded, rangeClsName, urlPage, title, lang);
            }
            
            //httpGet2("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&instanceQName=University%20of%20Rome%20%22Tor%20Vergata%22&propertyQName=filas:worksInCompany&objectQName=[object%20XULElement]&lexicalization=%22Tor%20Vergata%22&urlPage=http://ai-nlp.info.uniroma2.it/zanzotto/short_bio.html&title=Enrichment%20Property&op=annot
            //httpGet2("http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?service=property&instanceQName=" + subjectInstanceName + "&propertyQName=" +predicatePropertyName+"&objectQName=" + objectInstanceName + "&lexicalization=" + objectInstanceName +"&urlPage=" + window.arguments[0].urlPage + "&title=" + title+"&op=annot", false);
            if (op.equals("bindAnnot")) {
                String annotation = _oReq.getParameter("lexicalization");
                return addNewAnnotationForSelectedInstanceAndRelateToDroppedInstance(subjectInstanceQName, predicatePropertyName, objectInstanceNameEncoded, annotation, urlPage, title);
            }
            
            //  
            
        }
        else return ServletUtilities.getService().documentError("no handler for such a request!");
		
		this.fireServletEvent();
		return xml;
	}

    
	/**
	 * this service returns all previous annotations taken into the page associated to the given url
	 * 
	 * <Tree type="Annotations">
     *      <Annotation id="04282b25-2f32-421e-8418-9317e3ef8553" resource="Armando Stellato" value="Armando Stellato"/>
     *      <Annotation id="57a6c560-e1e4-4f3a-a1ba-00fc874e1c71" resource="Marco Pennacchiotti" value="Marco Pennacchiotti"/>
     *      <Annotation id="86398074-bb67-4986-86df-bcb8b414a91a" resource="University of Rome, Tor Vergata" value="University of Rome, Tor Vergata"/>
     * </Tree>
	 * 
	 * @param urlPage the url of the page which is searched for existing annotations
	 * @return
	 */
	public Document getPageAnnotations(String urlPage) {
        Document xml;
        ARTRepository repository = Resources.getRepository();
        
        xml = new DocumentImpl();       
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type", "Annotations");
            
        ARTLiteral urlPageLiteral = repository.createLiteral(urlPage);
        Collection<ARTResource> collection = repository.getSTSubjectFromDatatypeProperty(SemAnnotVocab.Res.url, urlPageLiteral);
        
        Iterator<ARTResource> collectionIterator = collection.iterator();
        ARTResource webPage  = null;
        while (collectionIterator.hasNext()) {
            webPage = (ARTResource) collectionIterator.next();             
        }
        
        if (webPage == null) {
            xml.appendChild(treeElement);   
            return xml;
        }

        Iterator<ARTResource> semanticAnnotationsIterator = repository.listSTSubjectInstances(SemAnnotVocab.Res.location, webPage);
        while (semanticAnnotationsIterator.hasNext()) {
            ARTResource semanticAnnotation = (ARTResource)semanticAnnotationsIterator.next();
            Iterator<ARTLiteral> lexicalizationIterator = repository.listSTDatatypePropertyValues(semanticAnnotation, SemAnnotVocab.Res.text);
            ARTLiteral lexicalization = null;
            lexicalization = lexicalizationIterator.next(); //there is at least one and no more than one lexicalization for each semantic annotation
            Element annotationElement = XMLHelp.newElement(treeElement,"Annotation");
            annotationElement.setAttribute("id", repository.getQName(semanticAnnotation.getURI()));
            annotationElement.setAttribute("value", lexicalization.getLabel());            
            ARTResource annotatedResource = repository.listSTSubjectInstances(SemAnnotVocab.Res.annotation, semanticAnnotation).next(); //there is at least one and no more than one referenced resource for each semantic annotation
            annotationElement.setAttribute("resource", repository.getQName(annotatedResource.getURI()));
        }   
        xml.appendChild(treeElement);   
        
        return xml;
    }
    
	
	/**
	 * informs the client if the requested page contains annotations
	 * 
	 *  <Tree type="Ack" request="chkAnnotations">
     *      <result status="yes"/>            //or "no"    
     *  </Tree>
	 * 
	 * @param urlPage
	 * @return
	 */
	public Document chkPageForAnnotations(String urlPage) {
        Document xml;
        ARTRepository repository = Resources.getRepository();
        
        xml = new DocumentImpl();       
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type", "Ack");
        treeElement.setAttribute("request", "chkAnnotations");
        
        ARTLiteral urlPageLiteral = repository.createLiteral(urlPage);
        Collection<ARTResource> collection = repository.getSTSubjectFromDatatypeProperty(SemAnnotVocab.Res.url, urlPageLiteral);
        
        Iterator<ARTResource> collectionIterator = collection.iterator();
        ARTResource webPage  = null;
        while (collectionIterator.hasNext()) {
            webPage = (ARTResource) collectionIterator.next();             
        }
        
        Element responseElement = XMLHelp.newElement(treeElement,"result");
        
        if (webPage != null)
            responseElement.setAttribute("status", "yes");
        else
            responseElement.setAttribute("status", "no");
        
        xml.appendChild(treeElement);   
        return xml;

	}
    
	
	/**
     * tells the server to remove an annotation; the answer informs the client of the success of this removal
     * 
     *  <Tree type="Ack" request="removeAnnotation">
     *      <result status="yes"/>            //or "no"
     *  </Tree>
     * 
     * @param annotQName
     * @return
     */
    public Document removeAnnotation(String annotQName) {
        s_logger.debug("replying to \"removeAnnotation(" + annotQName + ")\".");
        ARTRepository repository = Resources.getRepository();
        
        ARTResource annot = repository.getSTResource(repository.expandQName(annotQName));
        
        if (annot==null)
            return servletUtilities.documentError("selected annotation is not present in the ontology");
        
        Document xml;
        
        xml = new DocumentImpl();       
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type", "Ack");
        treeElement.setAttribute("request", "removeAnnotation");
        
        if (deletePropertyPropagationTreeForAnnotations==null)
            initializeDeletePropertyPropagationTreeForAnnotations();
        
        Element responseElement = XMLHelp.newElement(treeElement,"result");
        
        s_logger.debug("removing annotation: " + annot);
        
        try {
            RepositoryUtilities.deepDeleteIndividual(annot, repository, deletePropertyPropagationTreeForAnnotations);
            responseElement.setAttribute("status", "yes");
        } catch (RepositoryUpdateException e) {
            e.printStackTrace();
            responseElement.setAttribute("status", "no");
        }
        
        xml.appendChild(treeElement);   
        return xml;

    }
	
    
    /**
     * creates an instance with associated annotation from the current web page
     * note tht the parameter instanceQName is handled like a Qname, but it is the selection dragged from the web browser
     * 
     * <Tree type="update_cls">
     *   <Class clsName="rtv:Person" numTotInst="1"/>
     *   <Instance instanceName="Armando Stellato"/>
     * </Tree>
     * 
     * @return
     */
    public Document dragDropSelectionOverClass(String instanceQName, String clsQName, String urlPage, String title) {
        ServletUtilities servletUtilities = new ServletUtilities();
        s_logger.debug("dragged: " + instanceQName + " over class: " + clsQName + " on url: " + urlPage + " with title: " + title);
        String handledUrlPage = urlPage.replace(":", "%3A");
        handledUrlPage = handledUrlPage.replace("/", "%2F");
        ARTRepository repository = Resources.getRepository();    
        ARTResource instanceRes = repository.getSTResource(repository.expandQName(instanceQName));                                         
        if (instanceRes != null) {  
            return servletUtilities.documentError("there is another resource with the same name!");
        }
        try {
            //SemanticTurkeyOperations.createObjectInstance(repository, repository.expandQName(clsQName), instanceQName, handledUrlPage, title);
            ARTResource cls = repository.getSTClass(repository.expandQName(clsQName));
            repository.addSTIndividual(repository.expandQName(instanceQName), cls);
            SemanticTurkeyOperations.createLexicalization(repository, instanceQName, instanceQName, urlPage, title);
        } catch (RepositoryUpdateException e) {         
            s_logger.error("instance creation error", e);
            return servletUtilities.documentError("instance creation error: " + e.getMessage());
        }
        
/*        try {
            SemanticTurkeyOperations.createObjectInstance(repository, repository.expandQName(clsQName), instanceQName, handledUrlPage, title);
        } catch (RepositoryUpdateException e) {         
            s_logger.error("instance creation error", e);
            return ServletUtilities.documentError("instance creation error: " + e.getMessage());
        }
*/
        return updateClassOnTree(clsQName, instanceQName);
    }
    
    
    
    //TODO this is the copy of the same method present in the Cls servlet. Factorize it somehow
    /**
     * @param clsQName
     * @param instanceName
     * @return
     */
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
    
	
    /**
     * invoked when the user drags text over an instance of the ontology. A new annotation for that individual is created and a semantic bookmark is registered for that individual
     * in the browsed page 
     * 
     * @param subjectInstanceQName
     * @param lexicalizationEncoded
     * @param urlPage
     * @param title
     * @return
     */
    public Document annotateInstanceWithDragAndDrop(String subjectInstanceQName, String lexicalizationEncoded, String urlPage, String title) {
    	s_logger.debug("taking annotation for: url" + urlPage + " instanceQName: " + subjectInstanceQName + " lexicalization: " + lexicalizationEncoded + " title: " + title);
    	ServletUtilities servletUtilities = new ServletUtilities();
    	ARTRepository repository = Resources.getRepository();
        try {
			SemanticTurkeyOperations.createLexicalization(repository, subjectInstanceQName, lexicalizationEncoded, urlPage, title);
		} catch (RepositoryUpdateException e) {
			s_logger.error("lexicalization creation error: ", e);
			return servletUtilities.documentError("lexicalization creation error: " + e.getMessage());
		}     
		
		Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","Ack");
        xml.appendChild(tree);
        
        return xml; 
    }
	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}
    

    /**
     * invoked when the user annotates new text which is dragged upon an individual to create a new individual which is bound to the first one through a given property
     * 
     * <Tree type="bindAnnotToNewInstance">
     *      <Class clsName="rtv:Organization" numTotInst="1"/>
     *      <Instance instanceName="University of Rome, Tor Vergata"/>
     * </Tree>
     * 
     * @param subjectInstanceQName
     * @param predicatePropertyQName
     * @param objectInstanceQName
     * @param rangeClsQName
     * @param urlPage
     * @param title
     * @return
     */
    public Document bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance(String subjectInstanceQName, String predicatePropertyQName, String objectInstanceQName, String rangeClsQName, String urlPage, String title, String lang) {
        ServletUtilities servletUtilities = new ServletUtilities();
        ARTRepository repository = Resources.getRepository();                       
        ARTResource property = repository.getSTProperty(repository.expandQName(predicatePropertyQName));                                                                        
        ARTResource rangeClsRes=null;
        
        Document xml = null;
        
        if (repository.isDatatypeProperty(property) || repository.isAnnotationProperty(property)) {  
            s_logger.debug("adding value to a literal valued property ");
            ARTResource subjectInstanceEncodedRes = repository.getSTResource(repository.expandQName(subjectInstanceQName));
            try {
                if (repository.isDatatypeProperty(property)) {
                    s_logger.debug("adding value" + objectInstanceQName + "to datatype property");
                    repository.instanciateDatatypeProperty(subjectInstanceEncodedRes, property, objectInstanceQName);
                }
                else { //Annotation 
                    s_logger.debug("adding value" + objectInstanceQName  + "to annotation property with lang: " );
                    repository.instanciateAnnotationProperty(subjectInstanceEncodedRes, property, objectInstanceQName, lang);                    
                }
            } catch (RepositoryUpdateException e) {             
                s_logger.error("literal creation error: " + e.getMessage(), e);
                return servletUtilities.documentError("literal creation error: " + e.getMessage());
            }
        }
        else {                  
            String rangeClsURI = repository.expandQName(rangeClsQName);
            s_logger.debug("rangeClsQName: " + rangeClsQName + " uri: " + rangeClsURI);
            rangeClsRes = repository.getSTClass(rangeClsURI); 
            if (rangeClsRes==null) {
                s_logger.debug("there is no class named: " + rangeClsURI + " !");
                return servletUtilities.documentError("there is no class named: " + rangeClsURI + " !");
            }               
            
            try {
                repository.addSTIndividual(repository.expandQName(objectInstanceQName), rangeClsRes);
                SemanticTurkeyOperations.createLexicalization(repository, objectInstanceQName, objectInstanceQName, urlPage, title);
            } catch (RepositoryUpdateException e) {
                s_logger.error("Instance creation error: ", e);
                return servletUtilities.documentError("Instance creation error: " + e.getMessage());
            }                               
            ARTResource subjectInstanceRes = repository.getSTResource(repository.expandQName(subjectInstanceQName));
            ARTResource objectInstanceRes = repository.getSTResource(repository.expandQName(objectInstanceQName));
            repository.instanciateObjectProperty(subjectInstanceRes, property, objectInstanceRes);
                        
        }
            
        //TODO: STARRED: in realtà, basterebbe fare come il metodo in properties (per l'editor senza annot.) che da un semplice ack, poi il client richiede quel che serve
        
        xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type", "bindAnnotToNewInstance");
        //NScarpato 27/05/2007 add numTotInst attribute (TODO rimuoverlo dopo aver controllato che non serva da nessuna parte)
        if (rangeClsRes!=null) {
            Element clsElement = XMLHelp.newElement(treeElement,"Class");                                   
            clsElement.setAttribute("clsName", rangeClsQName);              
            int numTotInst=repository.getDirectInstances(rangeClsRes).size();
            clsElement.setAttribute("numTotInst",""+numTotInst);
        }
        Element instanceElement = XMLHelp.newElement(treeElement,"Instance");
        instanceElement.setAttribute("instanceName", servletUtilities.decodeLabel(objectInstanceQName));
        xml.appendChild(treeElement);   
                    
        return xml;
        
    }
    
    
    public Document addNewAnnotationForSelectedInstanceAndRelateToDroppedInstance(String subjectInstanceQName, String predicatePropertyQName, String objectInstanceQName, String lexicalization, String urlPage, String title) {
        ServletUtilities servletUtilities = new ServletUtilities();
        ARTRepository repository = Resources.getRepository();                       
        ARTResource property = repository.getSTProperty(repository.expandQName(predicatePropertyQName));                                                                
                
        Document xml = null;    
        
        try {
            SemanticTurkeyOperations.createLexicalization(repository, objectInstanceQName, lexicalization, urlPage, title);
        } catch (RepositoryUpdateException e) {
            s_logger.error("Instance creation error: ", e);
            return servletUtilities.documentError("Instance creation error: " + e.getMessage());
        }                               
        ARTResource subjectInstanceRes = repository.getSTResource(repository.expandQName(subjectInstanceQName));
        ARTResource objectInstanceRes = repository.getSTResource(repository.expandQName(objectInstanceQName));
        repository.instanciateObjectProperty(subjectInstanceRes, property, objectInstanceRes);
        
        xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type", "Ack");
        xml.appendChild(treeElement);               
                        
        return xml;
        
    }	
	
    
}
