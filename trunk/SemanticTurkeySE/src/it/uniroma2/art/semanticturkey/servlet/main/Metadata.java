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

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.exceptions.ImportManagementException;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.repository.ImportStatus;
import it.uniroma2.art.semanticturkey.repository.STRepositoryManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.ImportMem;
import it.uniroma2.art.semanticturkey.resources.OntologiesMirror;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.PrefixMapping;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.RepositoryUtilities;
import it.uniroma2.art.ontapi.exceptions.RepositoryCreationException;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
//import it.uniroma2.art.stontapi.sesameimpl.ImportStatus;

import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;


/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class Metadata extends InterfaceServiceServlet{
	@SuppressWarnings("unused")
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	public String XSLpath = Resources.getXSLDirectoryPath() + "createClassForm.xsl";

	//TODO raccogliere opportunamente le eccezioni!
	public int fromWebToMirror = 0;
	public int fromWeb = 1;
	public int fromLocalFile = 2;
	public int fromOntologyMirror = 3;
	public int toOntologyMirror = 4;
	
	public Metadata(String id){
		this.id = id;
	}
	
	public Document XMLData() {	
		ServletUtilities servletUtilities = new ServletUtilities();
        String request = _oReq.getParameter("request");
        
        this.fireServletEvent();
        if ( request.equals("set_defaultnamespace") )
            return setDefaultNamespace(_oReq.getParameter("namespace"));
        if ( request.equals("get_defaultnamespace") )
            return getDefaultNamespace();
        if ( request.equals("set_baseuri") )
            return setBaseURI(_oReq.getParameter("uri"));
        if ( request.equals("get_baseuri") )
            return getBaseURI();
        if ( request.equals("set_baseuridnspace") ) { 
            String baseURI = _oReq.getParameter("baseuri");
            String defaultNamespace = _oReq.getParameter("namespace");
            return setBaseURIAndDefaultNamespace(baseURI, defaultNamespace);
        }

        if ( request.equals("get_nsprefixmappings") )
            return getNamespaceMappings();
        if ( request.equals("set_nsprefixmapping") ) 
            return setNamespaceMapping(_oReq.getParameter("prefix"), _oReq.getParameter("ns"));
        if ( request.equals("change_nsprefixmapping") ) 
            return changeNamespaceMapping(_oReq.getParameter("prefix"), _oReq.getParameter("ns"));        
        if ( request.equals("remove_nsprefixmapping") ) 
            return removeNamespaceMapping(_oReq.getParameter("namespace"));
        if ( request.equals("get_imports") )
            return getOntologyImports();
        
        //	imports an ontology which is already present in the ontology mirror location
        if ( request.equals("removeImport") ) {   
            String uri = _oReq.getParameter("uri");
            return removeOntImport(uri);
        }    
        
        
        //the next four invocations deal with ontologies directly imported into the main model
        
        //	downloads and imports an ontology from the web, caching it into a local file in the ontology mirror location
        if ( request.equals("addFromWebToMirror") ) {   
        	String toImport = _oReq.getParameter("baseuri");
        	String destLocalFile = _oReq.getParameter("mirrorFile");
            String altURL = _oReq.getParameter("alturl");
            return addOntImport(fromWebToMirror, toImport, altURL, destLocalFile);
        }
        //	downloads and imports an ontology from the web; next time the turkey is started, the ontology will be imported again
        if ( request.equals("addFromWeb") ) {   
            String baseuri = _oReq.getParameter("baseuri");
            String altURL = _oReq.getParameter("alturl");
            return addOntImport(fromWeb, baseuri, altURL, null);
        }
        //	downloads and imports an ontology from a local file; caching it into a local file in the ontology mirror location
        if ( request.equals("addFromLocalFile") ) {   
            String baseuri = _oReq.getParameter("baseuri");
            String localFilePath = _oReq.getParameter("localFilePath");
            String mirrorFile = _oReq.getParameter("mirrorFile");
            return addOntImport(fromLocalFile, baseuri, localFilePath, mirrorFile);
        }    
        //	imports an ontology which is already present in the ontology mirror location
        if ( request.equals("addFromOntologyMirror") ) {   
            String baseuri = _oReq.getParameter("baseuri");
            String mirrorFile = _oReq.getParameter("mirrorFile");
            return addOntImport(fromOntologyMirror, baseuri, null, mirrorFile);
        }    
        
        
        //the next four invocations deal with inherited imported ontologies (they are declared imports of imported ontologies) downloaded and loaded into the main model
        
        //	downloads an imported ontology from the web, caching it into a local file in the ontology mirror location
        if ( request.equals("downloadFromWebToMirror") ) {   
        	String baseURI = _oReq.getParameter("baseuri");
        	String altURL = _oReq.getParameter("alturl");
        	String toLocalFile = _oReq.getParameter("mirrorFile");
            return getImportedOntology(fromWebToMirror, baseURI, altURL, null, toLocalFile);
        } 
        if ( request.equals("downloadFromWeb") ) {   
        	String baseURI = _oReq.getParameter("baseuri");
        	String altURL = _oReq.getParameter("alturl");            
            return getImportedOntology(fromWeb, baseURI, altURL, null, null);
        }  
        //	downloads an imported ontology from a local file; caching it into a local file in the ontology mirror location
        if ( request.equals("getFromLocalFile") ) {   
        	String baseURI = _oReq.getParameter("baseuri");
        	String altURL = _oReq.getParameter("alturl");
        	String localFilePath = _oReq.getParameter("localFilePath");
        	String mirrorFile = _oReq.getParameter("mirrorFile");
            return getImportedOntology(fromLocalFile, baseURI, altURL, localFilePath, mirrorFile);
        }       
        //	mirrors an ontology
        if ( request.equals("mirrorOntology") ) {   
            String baseURI = _oReq.getParameter("baseuri");
            String mirrorFile = _oReq.getParameter("mirrorFile");
            return getImportedOntology(toOntologyMirror, baseURI, null, null, mirrorFile);
        }       
        
        
        else return servletUtilities.documentError("no handler for such a request!");    
	}
    
	
    /**
     * sets the Default Namespace for the loaded ontology.
     * The client just inspects the Ack tag; the ns attribute of the DefaultNamespace tag should always be inspected by the client (expecially if the ack is a failed updated)
     * 
     * <Tree type="setDefaultNamespace">
     *      <Ack msg="ok"/>     (OR <Ack msg="failed" reason="put in a alert the text in this attribute"/> 
     *      <DefaultNamespace  ns="http://art.info.uniroma2.it/ontologies/st#"/>
     * </Tree>
     * 
     */
    public Document setDefaultNamespace(String namespace) {
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","setDefaultNamespace");
        
        ARTRepository repository = Resources.getRepository();
        
      
        Element ackElement = XMLHelp.newElement(tree, "Ack");        

        try {
            repository.setDefaultNamespace(namespace);
            Config.setDefaultNamespace(namespace);
            ackElement.setAttribute("msg","ok");
        } catch (RepositoryUpdateException e) {
            e.printStackTrace();
            ackElement.setAttribute("msg","failed");
            ackElement.setAttribute("reason",e.getMessage());
        }
        
                
        Element defaultNamespaceElement = XMLHelp.newElement(tree, "DefaultNamespace");        
        defaultNamespaceElement.setAttribute("ns",repository.getDefaultNamespace());
        
        xml.appendChild(tree);
        
        return xml; 
    }
	
	
    /**
     * gets the Default Namespace for the loaded ontology
     * 
     * <Tree type="getDefaultNamespace">
     *      <DefaultNamespace  ns="http://art.info.uniroma2.it/ontologies/st#"/>
     * </Tree>
     * 
     */
    public Document getDefaultNamespace() {
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","getDefaultNamespace");
        
        ARTRepository repository = Resources.getRepository();
        
        Element defaultNamespaceElement = XMLHelp.newElement(tree, "DefaultNamespace");        
        defaultNamespaceElement.setAttribute("ns",repository.getDefaultNamespace());
        
        xml.appendChild(tree);
        
        return xml; 
    }
    
   
    /**
     * sets the baseuri for the loaded ontology.
     * The client just inspects the Ack tag; content of the uri attribute of the baseuri tag should always be inspected by the client (expecially if the ack is a failed updated)
     * 
     * <Tree type="setBaseURI">
     *      <Ack msg="ok"/> (OR <Ack msg="failed" reason="put in a alert the text in this attribute"/>
     *      <BaseURI  uri="http://art.info.uniroma2.it/ontologies/st"/>
     * </Tree>
     * 
     */
    public Document setBaseURI(String uri) {
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","setBaseURI");
        
        ARTRepository repository = Resources.getRepository();
        
        Element ackElement = XMLHelp.newElement(tree, "Ack");
        
        try {
        	//TODO not really robust...
            repository.setBaseURI(uri);
            Config.setBaseUri(uri);
            ackElement.setAttribute("msg","ok");
        } catch (RepositoryUpdateException e) {
            e.printStackTrace();
            ackElement.setAttribute("msg","failed");
            ackElement.setAttribute("reason",e.getMessage());
        }        
        
        Element baseURI = XMLHelp.newElement(tree, "BaseURI");        
        baseURI.setAttribute("uri",repository.getBaseURI());
        
        xml.appendChild(tree);
        
        return xml; 
    }
    
    
    /**
     * gets the baseuri for the loaded ontology
     * 
     * <Tree type="getBaseURI">
     *      <BaseURI  uri="http://art.info.uniroma2.it/ontologies/st"/>
     * </Tree>
     * 
     */
    public Document getBaseURI() {
      
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","getBaseURI");
        
        ARTRepository repository = Resources.getRepository();
        
        Element baseuri = XMLHelp.newElement(tree, "BaseURI");        
        baseuri.setAttribute("uri",repository.getBaseURI());
        
        xml.appendChild(tree);
        
        return xml; 
    }
    
    
    
    /**
     * sets the baseuri for the loaded ontology.
     * The client just inspects the Ack tag; content of the uri attribute of the baseuri tag should always be inspected by the client (expecially if the ack is a failed updated)
     * 
     * <Tree type="setBaseURIAndDefaultNamespace">
     *      <Ack msg="ok"/> (OR <Ack msg="failed" reason="put in a alert the text in this attribute"/>
     *      <BaseURI  uri="http://art.info.uniroma2.it/ontologies/st"/>
     *      <DefaultNamespace  ns="http://art.info.uniroma2.it/ontologies/st#"/>
     * </Tree>
     * 
     */    
    public Document setBaseURIAndDefaultNamespace(String uri, String namespace) {

        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","setBaseURIAndDefaultNamespace");
        
        ARTRepository repository = Resources.getRepository();
        
      
        Element ackElement = XMLHelp.newElement(tree, "Ack");        

        String oldDefNS = repository.getDefaultNamespace();
        //TODO with transactions this method would be cleaner and more simple
        try {
            repository.setDefaultNamespace(namespace);
            Config.setDefaultNamespace(namespace);
            ackElement.setAttribute("msg","ok");
        } catch (RepositoryUpdateException e) {
            e.printStackTrace();
            ackElement.setAttribute("msg","failed");
            ackElement.setAttribute("reason","defaultNamespace update failed:\n" + e.getMessage());
        }
        try {
            repository.setBaseURI(uri);
            Config.setBaseUri(uri);
            ackElement.setAttribute("msg","ok");
        } catch (RepositoryUpdateException e) {
            try {
                repository.setDefaultNamespace(oldDefNS);
            } catch (RepositoryUpdateException e1) {
                String errMsg = "when trying to update both baseuri and defaultnamespace, the defautnamespace has been changed, the baseuri update failed, then tried to roll back to the old defaultNameSpace and it failed too";                
                s_logger.debug(errMsg, e1);
                e1.printStackTrace();
                ackElement.setAttribute("msg","failed");
                ackElement.setAttribute("reason",errMsg + "\n" + e.getMessage());
            } //TODO with transactions this method would be cleaner and more simple
            e.printStackTrace();
            ackElement.setAttribute("msg","failed");
            ackElement.setAttribute("reason","baseURI update failed:\n" + e.getMessage());
        }  
                
        Element baseURIElement = XMLHelp.newElement(tree, "BaseURI");        
        baseURIElement.setAttribute("uri",repository.getBaseURI());
        Element defaultNamespaceElement = XMLHelp.newElement(tree, "DefaultNamespace");        
        defaultNamespaceElement.setAttribute("ns",repository.getDefaultNamespace());
        
        xml.appendChild(tree);
        
        return xml; 
    }
    
    
	/**
	 * gets the namespace mapping for the loaded ontology
     * 
     * <Tree type="getNSPrefixMapping">
     *      <Mapping  ns="http://www.w3.org.2002/07/owl#" prefix="owl" explicit="false"/>
     *      <Mapping  ns="http://sweet.jpl.nasa.gov/ontology/earthrealm.owl#" prefix="earthrealm" explicit="true"/>
     * </Tree>
     * 
	 */
	public Document getNamespaceMappings() {
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","getNSPrefixMappings");
        
        PrefixMapping repository = Resources.getRepository();
        
        Map<String, String> nsPrefixMap = repository.getNamespacePrefixMapping();
        Set<Map.Entry<String, String>> mapEntries = nsPrefixMap.entrySet();
        for (Map.Entry<String, String> entry : mapEntries) {
        	Element nsPrefMapElement = XMLHelp.newElement(tree, "Mapping");
        	String namespace = entry.getValue();
        	nsPrefMapElement.setAttribute("prefix",entry.getKey());
        	nsPrefMapElement.setAttribute("ns",namespace);
            if (repository.hasExplicitPrefixMapping(namespace))
                nsPrefMapElement.setAttribute("explicit","true");
            else
                nsPrefMapElement.setAttribute("explicit","false");
        }
        
        xml.appendChild(tree);
        
        return xml;
    }
    
    /**
     * sets the namespace mapping for the loaded ontology
     * 
     *  <Tree type="NSPrefixMappingChanged"/>
     */
    public Document setNamespaceMapping(String prefix, String namespace) {
    	ServletUtilities servletUtilities = new ServletUtilities();
    	Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","NSPrefixMappingChanged");
        
        PrefixMapping repository = Resources.getRepository();
        
        try {
            repository.setNsPrefix(namespace, prefix);
        } catch (RepositoryUpdateException e) {
            e.printStackTrace();
            return servletUtilities.documentError("prefix-namespace mapping update failed!\n\nreason: " + e.getMessage());
        }
        
        
        xml.appendChild(tree);
        
        return xml;
    }
    
    /**
     *  changes the namespace mapping for the loaded ontology. Since there is no evidence that any ontology API will ever use this (there is typically only a setNamespaceMapping method)
     *  we have not included a changeNamespaceMapping in the API and consequently we delegate here setNamespaceMapping.
     *  Should this situation change, this method will require a proper implementation.
     * 
     *  <Tree type="NSPrefixMappingChanged"/>
     */
    public Document changeNamespaceMapping(String prefix, String namespace) {
        return setNamespaceMapping(prefix, namespace);
    }
    
    /**
     * remove the namespace mapping for the loaded ontology
     * 
     *  <Tree type="NSPrefixMappingChanged">
     *      <Mapping ns="http://www.w3.org.2002/07/owl#" prefix="owl" /> 
     *  </Tree>
     */
    public Document removeNamespaceMapping(String namespace) {
    	ServletUtilities servletUtilities = new ServletUtilities();
    	Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","NSPrefixMappingChanged");
        
        PrefixMapping repository = Resources.getRepository();
        
        try {
            repository.removeNsPrefixMapping(namespace);
        } catch (RepositoryUpdateException e) {
            e.printStackTrace();
            return servletUtilities.documentError("prefix-namespace mapping update failed!\n\nreason: " + e.getMessage());
        }
        
        Element nsPrefMapElement = XMLHelp.newElement(tree, "Mapping");
        nsPrefMapElement.setAttribute("prefix",namespace);
        
        xml.appendChild(tree);
        
        return xml;
    }
    
    
	// vedere cmq se è possibile definire in qualche modo in javascript degli alberi infiniti
    /**
     * get the namespace mapping for the loaded ontology
     * 
     *  <Tree type="imports">
     *      <ontology uri="http://ai-nlp.info.uniroma2.it/ontologies/semturk" status="local" localfile="d:/semturk"> (zero or more)
     *          <ontology uri="..." status="web"/>		//if this ontology is imported from the web and is not cached
     *          <ontology uri="..." status="failed"/>	//if this ontology has not being imported
     *          <ontology uri="..." status="null"/>		//
     *          <ontology uri="..." status="local"/>	//if this ontology is imported from a local file from the ontology mirror
     *          <ontology uri="..." status="loop"/>		//reports loop if this ontology is involved in a import loop; mark the entry in red in the GUI!
     *      <ontology/>
     *      <ontology uri="..." status="local" localfile="..."/>         
     *  </Tree>
     * 
     */
    public Document getOntologyImports() {
        Document xml = new DocumentImpl();
        Element tree = xml.createElement("Tree");
        tree.setAttribute("type","imports");
        
        HashSet importsBranch = new HashSet();
        
        ARTRepository repository = Resources.getRepository();
        STRepositoryManager repMgr = Resources.getRepositoryManager();
        buildImportXMLTree(repository, repMgr, tree, Resources.getWorkingOntologyURI(), importsBranch);
        
        xml.appendChild(tree);
        return xml;
    }
	    
	    private void buildImportXMLTree(ARTRepository repository, STRepositoryManager repMgr, Element xmlElem, String uri, HashSet importsBranch) {
	        Iterator<ARTResource> imports = repository.listOntologyImports(uri);        
	        while(imports.hasNext()) {
	        	String importedOntURI = imports.next().getURI();
	        	System.out.println("imports: " + importedOntURI);
	        	Element importedOntologyElem = XMLHelp.newElement(xmlElem, "ontology");
	        	importedOntologyElem.setAttribute("uri", importedOntURI);
	        	if (importsBranch.contains(importedOntURI)) 
	        		importedOntologyElem.setAttribute("status", "loop");
	        	else {         		
	        		ImportStatus importStatus = repMgr.getImportStatus(importedOntURI);
	        		if (importStatus!=null) {
		        		int status = importStatus.getStatus();
		        		if (status == ImportStatus.LOCAL) {
		        			importedOntologyElem.setAttribute("status", "local");
		        			importedOntologyElem.setAttribute("localfile", importStatus.getCacheFile().getLocalName());
		        		}
		        		else if (status == ImportStatus.WEB)
		        			importedOntologyElem.setAttribute("status", "web");
		        		else if (status == ImportStatus.FAILED)
		        			importedOntologyElem.setAttribute("status", "failed");
		        		else if (status == ImportStatus.NULL)
		        			importedOntologyElem.setAttribute("status", "null");
	        		}
	        		else importedOntologyElem.setAttribute("status", "null");
	        			
		        	HashSet newImportsBranch = new HashSet(importsBranch);
		        	newImportsBranch.add(importedOntURI);
		        	
		        	buildImportXMLTree(repository, repMgr, importedOntologyElem, importedOntURI, newImportsBranch);
	        	}
	
	        }    	
	    }
	    
    
	//TODO se continuo ad usare il sistema di gestire una cache degli import, allora questo deve rimuovere in cascata tutte le ontologie importate da quella che ho rimosso!
	/**
     * answers with an ack on the result of the import deletion. The application, upon receving this ack, should request an update of the imports and namespace mappings panels
	 *
     *  <Tree type="removeImport">  (or addFromWeb, addFromLocalFile, addFromOntologyMirror)
     *      <result level="ok"/>            //oppure "failed"
     *      <msg content="bla bla bla"/>         
     *  </Tree>
	 * 
	 * @param uri
	 * @return
	 */
	public Document removeOntImport(String uri) {
		ServletUtilities servletUtilities = new ServletUtilities();
		STRepositoryManager repMgr = Resources.getRepositoryManager();
		try {
			repMgr.removeOntologyImport(uri);
		} catch (IOException e) {
			e.printStackTrace();
			return servletUtilities.documentError("problems in accessing the Import Registry");
		} catch (RepositoryUpdateException e) {
			e.printStackTrace();
			return servletUtilities.documentError("problems in updating the repository");
		} catch (RepositoryCreationException e) {
			e.printStackTrace();
			return servletUtilities.documentError("problems in restarting the repository");
		}
		
		
		String msg=null;
		Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");        
        treeElement.setAttribute("type","removeImport");
        Element element = XMLHelp.newElement(treeElement,"Msg");
        if (msg==null)
            msg = uri + " correctly removed from import list";
        element.setAttribute("content",msg);
        xml.appendChild(treeElement);
        return xml;
	}


    
    

    /**
     * answers with an ack on the result of the import. Th application, upon receving this ack, should request an update of the imports and namespace mappings panels
	 *
     *  <Tree type="addFromWebToMirror">  (or addFromWeb, addFromLocalFile, addFromOntologyMirror)
     *      <result level="ok"/>            //oppure "failed"
     *      <msg content="bla bla bla"/>         
     *  </Tree>
	 *
     * 
     * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports because an imported ontology may contain other prefix mappings to be imported
     * 
     */
	public Document addOntImport(int method, String baseUriToBeImported, String sourceForImport, String destLocalFile) {
        String imports;
        ServletUtilities servletUtilities = new ServletUtilities();
        try {
            imports = ImportMem.getImportMem();
            if (imports.contains(baseUriToBeImported)) {
                return servletUtilities.documentError("this ontology is already imported");
            }
        } catch (IOException e2) {
            e2.printStackTrace();
            return servletUtilities.documentError("problems in accessing the import registry");
        }
        
        STRepositoryManager repMgr = Resources.getRepositoryManager();
        
        String msg=null;
        String oldCache;
        // if the ontology is in the ontologiesMirror then load the ontology from the local file in the mirror
    	if ( (method!=fromOntologyMirror) && (  oldCache = OntologiesMirror.getCachedOntologyEntry(baseUriToBeImported)) != null )  {   	
            msg="this ontology has already been cached in the mirror to file: " + oldCache + ". Used mirror instead of new file.";
            destLocalFile=oldCache;
            method = fromOntologyMirror;
        }

    	
    	String methodName;
		try {
    		if (method==fromWebToMirror) {
    			methodName="addFromWebToMirror";
    			String url;
    			if (sourceForImport!=null) url=sourceForImport; else url=baseUriToBeImported; 
    			repMgr.addOntologyImportFromWebToLocalFile(baseUriToBeImported, url, destLocalFile);
    		}    			
			else if (method==fromWeb) {
				methodName="addFromWeb";
				String url;
				if (sourceForImport!=null) url=sourceForImport; else url=baseUriToBeImported;
    			repMgr.addOntologyImportFromWeb(baseUriToBeImported, url);
			}
    		else if (method==fromLocalFile) {
    			methodName="addFromLocalFile";
    			repMgr.addOntologyImportFromLocalFile(baseUriToBeImported, sourceForImport, destLocalFile);
    		}
    		else if (method==fromOntologyMirror) {
    			methodName="addFromOntologyMirror";
    			repMgr.addOntologyImportFromMirror(baseUriToBeImported, destLocalFile);
    		}
    		else methodName="noMethodGiven!!!";
		} catch (MalformedURLException e) {
            s_logger.debug(Utilities.printStackTrace(e));
            return servletUtilities.documentError(e.getMessage() + " is not a valid URI!");
		} catch (RepositoryUpdateException e) {
			s_logger.debug(Utilities.printStackTrace(e));
            return servletUtilities.documentError(e.getMessage());
		}     
        
		//automatic creation of custom prefix:		
        PrefixMapping repository = Resources.getRepository();        
        Map<String, String> nsPrefixMap = repository.getNamespacePrefixMapping();
        Set<Map.Entry<String, String>> mapEntries = nsPrefixMap.entrySet();              
        for (Map.Entry<String, String> entry : mapEntries) {
        	String prefix = entry.getValue();
        	if (isAutomaticallyGeneratedPrefix(prefix)) {
        		String namespace = entry.getKey();
        		String newPrefix = RepositoryUtilities.guessPrefix(namespace);
        		try {
					repository.setNsPrefix(newPrefix, namespace);
				} catch (RepositoryUpdateException e) {
					s_logger.debug(Utilities.printStackTrace(e));
				}        		
        	}
        }
				
		//xml response formatting
        Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");        
        treeElement.setAttribute("type",methodName);
        Element element = XMLHelp.newElement(treeElement,"msg");
        if (msg==null)
            msg = baseUriToBeImported + " correctly imported";
        element.setAttribute("content",msg);
        xml.appendChild(treeElement);
        return xml;
        
        
	}
    
	private boolean isAutomaticallyGeneratedPrefix(String prefix) {
		if (prefix.startsWith("ns") )
			return true;	
		else return false;
	}
	

    /**
     * answers with an ack on the result of the import. Th application, upon receving this ack, should request an update of the imports and namespace mappings panels
	 *
     *  <Tree type="getFromWebToMirror">  (or ....)
     *      <result level="ok"/>            //oppure "failed"
     *      <msg content="bla bla bla"/>         
     *  </Tree>
	 *
     * 
     * HINT for CLIENT: always launch a getNamespaceMappings, getOntologyImports after a setOntologyImports because an imported ontology may contain other prefix mappings to be imported
     * 
     */
	public Document getImportedOntology(int method, String baseURI, String altURL, String fromLocalFilePath, String toLocalFile) {
		ServletUtilities servletUtilities = new ServletUtilities();
		STRepositoryManager repMgr = Resources.getRepositoryManager();
		String methodName;
		try {
    		if (method==fromWebToMirror) {
    			methodName="getFromWebToMirror";
    			repMgr.downloadImportedOntologyFromWebToMirror(baseURI, altURL, toLocalFile);
    		}    			
			else if (method==fromWeb) {
				methodName="getFromWeb";
    			repMgr.downloadImportedOntologyFromWeb(baseURI, altURL);
			}
    		else if (method==fromLocalFile) {
    			methodName="getFromLocalFile";
    			repMgr.getImportedOntologyFromLocalFile(baseURI, fromLocalFilePath, toLocalFile);
    		}
    		else if (method==toOntologyMirror) {
    			methodName="getToOntologyMirror";
    			repMgr.mirrorOntology(baseURI, toLocalFile);
    		}
    		else methodName="noMethodGiven!!!";
		} catch (MalformedURLException e) {
			s_logger.debug(Utilities.printStackTrace(e));
            return servletUtilities.documentError(altURL + " is not a valid URL!");
		} catch (RepositoryUpdateException e) {
			s_logger.debug(Utilities.printStackTrace(e));
            return servletUtilities.documentError("problems in updating the repository");
		} catch (ImportManagementException e) {
			s_logger.debug(Utilities.printStackTrace(e));
			return servletUtilities.documentError(e.getMessage());
		}   
		
        Document xml = new DocumentImpl();
        Element treeElement = xml.createElement("Tree");        
        	treeElement.setAttribute("type",methodName);
        	Element element = XMLHelp.newElement(treeElement,"msg");
            	String msg = baseURI + " correctly imported";
            	element.setAttribute("content",msg);
        xml.appendChild(treeElement);
        return xml;
		
		
	}

	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}

   
    
    
}
