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

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.filter.NoLanguageResourcePredicate;
import it.uniroma2.art.owlart.filter.RootClassesResourcePredicate;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.semanticturkey.exceptions.HTTPParameterUnspecifiedException;
import it.uniroma2.art.semanticturkey.filter.DomainResourcePredicate;
import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceAdapter;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.RepliesStatus;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.w3c.dom.Element;

import com.google.common.base.Predicate;
import com.google.common.base.Predicates;
import com.google.common.collect.Iterators;


/**Classe che si occupa della creazione del grafico rappresentante l'ontologia*/
/**
 * @author Donato Griesi, Armando Stellato, Francesca Fallucchi 
 * Contributor(s): Andrea Turbati
 */
public class Graph extends ServiceAdapter {
	protected static Logger logger = LoggerFactory.getLogger(Graph.class);
	
	public Graph(String id){
		super(id);
	}
	
	public Logger getLogger() {
		return logger;
	}
	
	
	/**Metodo che si occupa della creazione dell'elemento xml relativo al grafico rappresentante l'ontologia
	 *@return Document  graphDocument*/
	public Response getPreCheckedResponse(String request) throws HTTPParameterUnspecifiedException {
		OWLModel ontModel = ProjectManager.getCurrentProject().getOWLModel();
		ServletUtilities servletUtilities = new ServletUtilities();	
		XMLResponseREPLY response = servletUtilities.createReplyResponse("graph", RepliesStatus.ok);
		Element dataElement = response.getDataElement();					
		dataElement.setAttribute("version", "1.20");
		Element nodeset  = XMLHelp.newElement(dataElement, "NODESET");		
		Element edgeset  = XMLHelp.newElement(dataElement, "EDGESET");				
		UUID uuid = UUID.randomUUID();
		Set<String> set = new HashSet<String>();	
		HashMap<String, String> map = new HashMap<String, String>();
	    servletUtilities.createXMLRootElementGraph(uuid.toString(), nodeset);

		try {
			
		    if (_oReq.getParameterMap().entrySet().size() == 1) {
		    	Predicate<ARTResource> exclusionPredicate;
		 	    if (Config.isAdminStatus()) exclusionPredicate = NoLanguageResourcePredicate.nlrPredicate;
		 	    else exclusionPredicate = DomainResourcePredicate.domResPredicate;
		 	        
		 	    Predicate<ARTResource> rootUserClsPred = Predicates.and(new RootClassesResourcePredicate(ontModel), exclusionPredicate);         
		 	    Iterator<ARTURIResource> filtIt;
	
				filtIt = Iterators.filter(ontModel.listNamedClasses(true), rootUserClsPred);
		
		    	while (filtIt.hasNext()) {
		    		ARTURIResource cls = filtIt.next();
		    		logger.debug("ontModel.getQName(cls.getURI()) "+ ontModel.getQName(cls.getURI()));
		    		String classID =  servletUtilities.createXMLElementClassGraph(ontModel.getQName(cls.getURI()),uuid.toString(),set,nodeset,edgeset);    
		    		servletUtilities.createXMLGraph(ontModel, cls, map, classID,set,nodeset,edgeset);
		    
		    	}
		    	
		    }
		    else if (_oReq.getParameterMap().entrySet().size() == 2) {
					String clsQName = setHttpPar("clsQName");
					logger.debug("NOEMI clsQName "+clsQName);
					String classID =  servletUtilities.createXMLElementClassGraph(clsQName,uuid.toString(),set,nodeset,edgeset);    
		    		servletUtilities.createXMLGraph(ontModel, ontModel.createURIResource(ontModel.expandQName(clsQName)), map, classID,set,nodeset,edgeset);	    		
		    }
		    
		    servletUtilities.createXMLElementPropertyGraph(ontModel, map,set, nodeset, edgeset);
		
		} catch (ModelAccessException e) {
			return servletUtilities.createExceptionResponse("deleteResource", e);
		}
	    
 		servletUtilities.setXMLParametersGraph(dataElement);
				
		File file = new File(Resources.getExtensionPath() + "/components/lib/applet/InitialXML.xml");
		
		try {
		       BufferedWriter out = new BufferedWriter(new FileWriter(file, false));
		       out.write(XMLHelp.XML2String(response.getResponseObject(), true));
		       out.close();
		} catch (IOException e) {		
			logger.error(""+e);
		}
		this.fireServletEvent();
		return response;

	}
	
}
