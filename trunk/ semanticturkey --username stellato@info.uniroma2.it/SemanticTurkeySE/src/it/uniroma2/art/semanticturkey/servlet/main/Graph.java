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
import it.uniroma2.art.semanticturkey.filter.DomainResourcePredicate;
import it.uniroma2.art.semanticturkey.plugin.extpts.CXSL;
import it.uniroma2.art.semanticturkey.plugin.extpts.InterfaceServiceServlet;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.filter.NoLanguageResourcePredicate;
import it.uniroma2.art.ontapi.filter.RootClassesResourcePredicate;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.collections.Predicate;
import org.apache.commons.collections.PredicateUtils;
import org.apache.commons.collections.iterators.FilterIterator;
import org.apache.log4j.Logger;
import org.apache.xerces.dom.DocumentImpl;
import org.w3c.dom.Document;
import org.w3c.dom.Element;


/**Classe che si occupa della creazione del grafico rappresentante l'ontologia*/
/**
 * @author Donato Griesi, Armando Stellato, Francesca Fallucchi 
 * Contributor(s): Andrea Turbati
 */
public class Graph extends InterfaceServiceServlet{
	final private Logger s_logger = Logger.getLogger(SemanticTurkey.class);
	public Graph(String id){
		this.id = id;
	}
	
	
	/**Metodo che si occupa della creazione dell'elemento xml relativo al grafico rappresentante l'ontologia
	 *@return Document  graphDocument*/
	public Document XMLData() {
		ARTRepository repository = Resources.getRepository();		
		Document graphDocument = new DocumentImpl();
		ServletUtilities servletUtilities = new ServletUtilities();
		Element touchgraph = graphDocument.createElement("TOUCHGRAPH_LB");				
		touchgraph.setAttribute("version", "1.20");
		Element nodeset  = XMLHelp.newElement(touchgraph, "NODESET");		
		Element edgeset  = XMLHelp.newElement(touchgraph, "EDGESET");				
		UUID uuid = UUID.randomUUID();
		Set<String> set = new HashSet<String>();	
		HashMap<String, String> map = new HashMap<String, String>();
	    servletUtilities.createXMLRootElementGraph(uuid.toString(), nodeset);
	    if (_oReq.getParameterMap().entrySet().size() == 1) {
	    	Predicate exclusionPredicate;
	 	    if (Config.isAdminStatus()) exclusionPredicate = NoLanguageResourcePredicate.nlrPredicate;
	 	    else exclusionPredicate = DomainResourcePredicate.domResPredicate;
	 	        
	 	    Predicate rootUserClsPred = PredicateUtils.andPredicate(new RootClassesResourcePredicate(repository), exclusionPredicate);         
	 	    FilterIterator filtIt = new FilterIterator(repository.listSTNamedClasses(), rootUserClsPred);
	
	    	while (filtIt.hasNext()) {
	    		ARTResource cls = (ARTResource)filtIt.next();
	    		s_logger.debug("repository.getQName(cls.getURI()) "+ repository.getQName(cls.getURI()));
	    		String classID =  servletUtilities.createXMLElementClassGraph(repository.getQName(cls.getURI()),uuid.toString(),set,nodeset,edgeset);    
	    		servletUtilities.createXMLGraph(repository, cls, map, classID,set,nodeset,edgeset);
	    
	    	}
	    	
	    }
	    else if (_oReq.getParameterMap().entrySet().size() == 2) {
				String clsQName = _oReq.getParameter("clsQName");
				s_logger.debug("NOEMI clsQName "+clsQName);
				String classID =  servletUtilities.createXMLElementClassGraph(clsQName,uuid.toString(),set,nodeset,edgeset);    
	    		servletUtilities.createXMLGraph(repository, repository.getSTClass(repository.expandQName(clsQName)), map, classID,set,nodeset,edgeset);	    		
	    }
		
		servletUtilities.createXMLElementPropertyGraph(repository, map,set, nodeset, edgeset);

 		servletUtilities.setXMLParametersGraph(touchgraph);
		
		graphDocument.appendChild(touchgraph);
				
		File file = new File(Resources.getExtensionPath() + "/components/lib/applet/InitialXML.xml");
		
		try {
		       BufferedWriter out = new BufferedWriter(new FileWriter(file, false));
		       out.write(XMLHelp.XML2String(graphDocument, true));
		       out.close();
		} catch (IOException e) {		
			s_logger.error(e);
		}
		this.fireServletEvent();
		return graphDocument;

	}
	@Override
	public CXSL CXSLFactory() {
		// TODO Auto-generated method stub
		return null;
	}		
}
