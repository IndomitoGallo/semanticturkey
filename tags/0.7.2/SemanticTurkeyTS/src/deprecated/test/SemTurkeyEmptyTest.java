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

  /*
   * Contributor(s): Armando Stellato stellato@info.uniroma2.it
  */
package it.uniroma2.art.semanticturkey.test;

//import it.uniroma2.info.ai_nlp.metaengine.servlet.Administration;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Cls;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Delete;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Individual;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.InputOutput;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Metadata;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.SearchOntology;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Property;
import it.uniroma2.art.ontapi.sesameimpl.SesameARTRepositoryImpl;
import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.filter.DomainResourcePredicate;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.Administration;
import it.uniroma2.art.semanticturkey.servlet.Cls;
import it.uniroma2.art.semanticturkey.servlet.Individual;
import it.uniroma2.art.semanticturkey.servlet.Metadata;
import it.uniroma2.art.semanticturkey.servlet.Property;
import it.uniroma2.art.semanticturkey.servlet.SearchOntology;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.test.fixture.SemTurkeyFixture;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.info.art.ontapi.ARTRepository;
import it.uniroma2.info.art.ontapi.ARTResource;
import it.uniroma2.info.art.ontapi.ARTResourceIterator;
import it.uniroma2.info.art.ontapi.ARTStatement;
import it.uniroma2.info.art.ontapi.ARTStatementIterator;
import it.uniroma2.info.art.ontapi.exceptions.RepositoryCreationException;
import it.uniroma2.info.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.info.art.ontapi.exceptions.VocabularyInitializationException;
import it.uniroma2.info.art.ontapi.filter.NoLanguageResourcePredicate;
import it.uniroma2.info.art.ontapi.filter.RootClassesResourcePredicate;
import it.uniroma2.info.art.ontapi.sesameimpl.plugin.STRepositoryManagerSesameImpl;
import it.uniroma2.info.art.ontapi.vocabulary.OWL;
//import it.uniroma2.info.art.stontapi.sesameimpl.SesameARTRepositoryManagerImpl;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.Iterator;

import org.apache.commons.collections.Predicate;
import org.apache.commons.collections.PredicateUtils;
import org.apache.commons.collections.iterators.FilterIterator;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.openrdf.model.Statement;
import org.openrdf.sesame.repository.local.LocalRepository;
import org.openrdf.sesame.sail.RdfSchemaSource;
import org.openrdf.sesame.sail.StatementIterator;
import org.w3c.dom.Document;


/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 *
 */
public class SemTurkeyEmptyTest {

	final static String extensiondir = "../OntologyRepository/STTest/extensions/extDir";
	final static private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	
	public SemTurkeyEmptyTest() {
		URL log4jPropertiesFileURL = SemanticTurkey.class.getResource("log4j.properties");
	    PropertyConfigurator.configure(log4jPropertiesFileURL); 

/*	    try {
			fileAppender = new FileAppender(new SimpleLayout(), SemanticTurkey.class.getName() + ".log", false);
		} catch (IOException e1) {			
			e1.printStackTrace();
		}
		s_logger.addAppender(fileAppender); 		
*/	    
		s_logger.debug("initialize...");
	}
	
	public static void deleteWorkingFiles() {
		File ontfile = new File(extensiondir + "/" + "rkb.nt");
		ontfile.delete();
		ontfile = new File(extensiondir + "/new-temp-triples.nt.~bak");
		ontfile.delete();
	}
	
	public static void pause() {
		try {
			System.out.println("press a key");
			System.in.read();
		} catch (IOException e1) {
			e1.printStackTrace();
		}
	}
	
	
	
	
	
	public static void main(String[] args) throws RepositoryUpdateException {
        //INITIALIZATION
        Resources.setExtensionPath(extensiondir);
        Resources.initializeUserResources();
        
        //resetWorkingFiles(); //THIS ONE IS TO DELETE INFORMATION PREVIOUSLY ADDED TO THE ONTOLOGY, THUS RESETTING ONTOLOGY TO STATE 0
        pause();
        pause();
        
                
        @SuppressWarnings("unused")
        SemTurkeyFixture test = new SemTurkeyFixture();
        STOntologyManager repFactory = new STRepositoryManagerSesameImpl(); //TODO remove this, and delegate to external class which chooses which factory implementation adopt
        ARTRepository repository = null;
        
        
        try {
            repository = repFactory.loadRepository("http://ai-nlp.info.uniroma2.it/ontologies/prova", Resources.getOntologyDir());
        } catch (RepositoryCreationException e) {
            e.printStackTrace();
        }
        Resources.setRepositoryManager(repFactory);
        Resources.setRepository(repository);    
        try {
            SemanticTurkey.initializeVocabularies(repository);
        } catch (VocabularyInitializationException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }        
        
        //TEST VARIABLES Initialization
        Document result;
        ARTResource cls;
        ARTResource ind;
        String rtvOntologyNS="http://ai-nlp.info.uniroma2.it/ontologies/rtv#";
        //END OF TEST VARIABLES Initialization

        
        //SETTING OF SERVLETS
        Administration administration = new Administration("");// modifica plugin
        Metadata metadata = new Metadata("");// modifica plugin
        Individual individualServlet = new Individual(""); // modifica plugin
        Cls clsServlet = new Cls(""); // modifica plugin
        
        //SETTING OF ADMINISTRATION LEVEL
        //result = Administration.setAdminLevel("off");
        result = administration.setAdminLevel("off");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));   
        result = metadata.setNamespaceMapping("rtv", "http://ai-nlp.info.uniroma2.it/ontologies/rtv#");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        
        //************************
        //  END OF INITIALIZATION 
        //************************
	        
        //************************
        //  ONTOLOGY IMPORT 
        //************************
        
        String importURI1 = "http://ai-nlp.info.uniroma2.it/ontologies/rtv";
        String importFile1 = "rtv.owl";       
        
        
        System.out.println("adding Ontology Import: " + importURI1 + " From Web To Local File");
        //result = Metadata.addOntImport(Metadata.fromWebToMirror, importURI1, null, importFile1);
        result = metadata.addOntImport(metadata.fromWebToMirror, importURI1, null, importFile1);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));                
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        //************************
        //  END OF ONTOLOGY IMPORT 
        //************************   
        
	}

}
