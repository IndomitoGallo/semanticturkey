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
  * Portions created by University of Roma Tor Vergata are Copyright (C) 2008.
  * All Rights Reserved.
  *
  * Semantic Turkey was developed by the Artificial Intelligence Research Group
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about Semantic Turkey can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

  /*
   * Contributor(s): Armando Stellato stellato@info.uniroma2.it
  */
package it.uniroma2.art.semanticturkey.servlet.main;

import java.util.ArrayList;
import java.util.Iterator;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.repository.STRepositoryManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.RepositoryUtilities;
import it.uniroma2.art.ontapi.exceptions.RepositoryCreationException;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.art.ontapi.exceptions.VocabularyInitializationException;
import it.uniroma2.art.ontapi.vocabulary.OWL;
import it.uniroma2.art.ontapi.vocabulary.RDF;
import it.uniroma2.art.ontapi.vocabulary.RDFS;

public class SystemStart extends InterfaceServiceServlet{
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);
	ServletUtilities servletUtilities = new ServletUtilities();
	public SystemStart(String id){
		this.id = id;
	}
	
	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}

	//TODO COSTRUIRE LA RISPOSTA XML NEI CASI DI START E FIRST START, non dare errore se nn tutto è segnato, ma dire cosa manca di modo che il client può fare ulteriri richieste all'utente
	public Document XMLData() {
	    String request = _oReq.getParameter("request");
		
	    if (request.equals("start")) {
		    String baseuri = _oReq.getParameter("baseuri");		    
		    String repositoryImpl = _oReq.getParameter("repositoryImpl");	        
	        return startSystem(baseuri, repositoryImpl);
		}
		                 
        if (request.equals("listRepositories"))
            return listAvailableRepositoryImplementations();
        
        else
            return servletUtilities.documentError("no handler for such a request!");
	}
	
	
	private String getRepositoryImplementation() {	    
	    String repImplId = Config.getRepositoryImplementation();
	    if (repImplId == null) {
	        ArrayList<String> repositoryImplIdList = PluginManager.getRepImplId();
	        if (repositoryImplIdList.size()==1) {
	            repImplId = repositoryImplIdList.get(0); 
	            Config.setRepositoryImplementation(repImplId);
	        }
	    }
	    return repImplId;    
	}
	
	
	/**
	 * Metodo per ottenere la liste delle implemetazioni per il repository 
	 * presenti nelle estensioni installate
	 * @return xml xon la lista delle possibli implementazioni del repository
	 */
	private Document listAvailableRepositoryImplementations(){
		ArrayList<String> repositoryList = PluginManager.getRepImplId();
		Document xml = new DocumentImpl();
		Element treeElement = xml.createElement("Tree");
		treeElement.setAttribute("type", "repository_list");
		//treeElement.setAttribute("typeR", "list");
		Element repElement = null;
		Iterator<String> iter = repositoryList.iterator();
		while(iter.hasNext()){
			repElement = XMLHelp.newElement(treeElement,"Repository");
			repElement.setAttribute("repName", iter.next());
		}
		xml.appendChild(treeElement);
		return xml;
		
	}
	

	
    /**
     * @param baseuri
     * @param repositoryImplID
     * @return
     * 
     * this is an XML example of the response. for the negative case, see the javadoc of the sendStartUnavailable method.
     * 
     * <Tree type="startResponse">
     *     <response state="affirmative">
     *         <baseuri uri="http://ai-nlp.info.uniroma2.it/ontologies/rtv">
     *         <repositoryImplementation id="sesame">
     *     <response/>
     * </Tree>
     */
	public Document startSystem(String baseuri, String repositoryImplID){
	    
		s_logger.info("trying to start system with following parameters:\nbaseuri="+baseuri+"\nrepositoryImplID="+repositoryImplID);
		
	    boolean setUri=false;
	    boolean setRepImpl=false;
	    
	    if (baseuri == null)
	        baseuri = Config.getBaseUri();
	    else setUri=true;
	    
        if (repositoryImplID == null)
            repositoryImplID = getRepositoryImplementation();
        else setRepImpl=true;
	    
	    if (baseuri==null || repositoryImplID==null)
	        return sendStartUnavailable(baseuri, repositoryImplID);

		STRepositoryManager repFactory;
		ARTRepository repository = null;
		
		repFactory = PluginManager.getRepImpl(repositoryImplID);
		
		try {			
	        if (setUri) {
	        	s_logger.info("baseuri is being set to: " + baseuri);
	        	Config.setBaseUri(baseuri);
	        } else s_logger.info("baseuri: " + baseuri + " already available");
	        if (setRepImpl) {
	        	s_logger.info("RepositoryImplementation is being set to: " + repositoryImplID);
	        	Config.setRepositoryImplementation(repositoryImplID);
	        } else s_logger.info("RepositoryImplementation: " + repositoryImplID + " already available");
			repository = repFactory.loadRepository(baseuri, Resources.getOntologyDir());
			String defaultNamespace = Config.getDefaultNamespace();
			if (defaultNamespace==null) {				
				defaultNamespace=RepositoryUtilities.createDefaultNamespaceFromBaseURI(baseuri);
				s_logger.info("generating defaultNamespace from baseuri: " + defaultNamespace);
				Config.setDefaultNamespace(defaultNamespace);
			}
			repository.setDefaultNamespace(defaultNamespace);
			s_logger.info("defaultnamespace set to: " + defaultNamespace);
		} catch (RepositoryCreationException e) {
			s_logger.debug(e.getMessage(), e);
			return servletUtilities.documentError(e.getMessage());
		} catch (RepositoryUpdateException e) {
			s_logger.debug(e.getMessage(), e);
			e.printStackTrace();
			return servletUtilities.documentError(e.getMessage());
		}
		Resources.setRepositoryManager(repFactory);
		Resources.setRepository(repository);
        try { initializeVocabularies(repository); } catch (VocabularyInitializationException e) { e.getMessage(); e.printStackTrace(); }
        
        
        return sendStartOk(baseuri, repositoryImplID);
	}
	
	
	/**
	 * @param baseuri
	 * @param repositoryImplID
	 * @return
	 * 
	 * this is an XML example of the response. Notice that one of baseuri or repositoryImplementation must be in state="unavailable" otherwise the response would have been in "affirmative" state
	 * 
	 * <Tree type="startResponse">
	 *     <response state="negative">
	 *         <baseuri state="unavailable"/>   (or, if available: <baseuri uri="http://ai-nlp.info.uniroma2.it/ontologies/rtv"> )
	 *         <repositoryImplementation state="unavailable"/>    (or, if available: <repositoryImplementation id="sesame"> )
	 *     <response/>
     * </Tree>
	 */
	private Document sendStartUnavailable(String baseuri, String repositoryImplID) {
	    Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");
        treeElement.setAttribute("type", "startResponse");
        //treeElement.setAttribute("typeR", "list");
        Element responseElement = XMLHelp.newElement(treeElement,"response");        
        responseElement.setAttribute("state", "negative");
        
        Element baseuriElement = XMLHelp.newElement(treeElement,"baseuri");
        if (baseuri!=null)
            baseuriElement.setAttribute("uri", baseuri);
        else
            baseuriElement.setAttribute("state", "unavailable");
        
        Element repositoryImplementationElement = XMLHelp.newElement(treeElement,"repositoryImplementation");
        if (repositoryImplID!=null)
            repositoryImplementationElement.setAttribute("id", repositoryImplID);
        else
            repositoryImplementationElement.setAttribute("state", "unavailable");
        
        xml.appendChild(treeElement);
        return xml;
	}
	
	
	   private Document sendStartOk(String baseuri, String repositoryImplID) {
	        Document xml = new DocumentImpl();
	        Element treeElement = xml.createElement("Tree");
	        treeElement.setAttribute("type", "startResponse");
	        //treeElement.setAttribute("typeR", "list");
	        Element responseElement = XMLHelp.newElement(treeElement,"response");        
	        responseElement.setAttribute("state", "affirmative");
	        
	        Element baseuriElement = XMLHelp.newElement(treeElement,"baseuri");
            baseuriElement.setAttribute("uri", baseuri);
            baseuriElement.setAttribute("state", "available");
	        
	        Element repositoryImplementationElement = XMLHelp.newElement(treeElement,"repositoryImplementation");
            repositoryImplementationElement.setAttribute("id", repositoryImplID);
            repositoryImplementationElement.setAttribute("state", "available");
	        
	        xml.appendChild(treeElement);
	        return xml;
	    }
	
	private static void initializeVocabularies(ARTRepository repo) throws VocabularyInitializationException { 	
        RDF.Res.initialize(repo);
        RDFS.Res.initialize(repo);
        OWL.Res.initialize(repo);
        SemAnnotVocab.Res.initialize(repo);   
    }
}
