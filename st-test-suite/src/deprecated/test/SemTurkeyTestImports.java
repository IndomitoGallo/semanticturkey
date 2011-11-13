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
//import it.uniroma2.info.ai_nlp.metaengine.servlet.InputOutput;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Metadata;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Property;
import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.filter.DomainResourcePredicate;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.Administration;
import it.uniroma2.art.semanticturkey.servlet.Cls;
import it.uniroma2.art.semanticturkey.servlet.Metadata;
import it.uniroma2.art.semanticturkey.servlet.Property;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.info.art.ontapi.ARTRepository;
import it.uniroma2.info.art.ontapi.ARTResource;
import it.uniroma2.info.art.ontapi.exceptions.RepositoryCreationException;
import it.uniroma2.info.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.info.art.ontapi.exceptions.VocabularyInitializationException;
import it.uniroma2.info.art.ontapi.filter.NoLanguageResourcePredicate;
import it.uniroma2.info.art.ontapi.filter.RootClassesResourcePredicate;
import it.uniroma2.info.art.ontapi.sesameimpl.plugin.STRepositoryManagerSesameImpl;
//import it.uniroma2.info.art.stontapi.sesameimpl.SesameARTRepositoryManagerImpl;

import java.io.File;
import java.io.IOException;
import java.net.URL;

import org.apache.commons.collections.Predicate;
import org.apache.commons.collections.PredicateUtils;
import org.apache.commons.collections.iterators.FilterIterator;
import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;
import org.w3c.dom.Document;


/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 *
 */
public class SemTurkeyTestImports {

	final static String extensiondir = "../OntologyRepository/STTest/extensions/extDir";
	final static private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	
	public SemTurkeyTestImports() {
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
		File ontfile = new File(extensiondir + "/" + Config.getRepositoryImplementation());
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
		
				
		@SuppressWarnings("unused")
		SemTurkeyTestImports test = new SemTurkeyTestImports();
		STOntologyManager repFactory = new STRepositoryManagerSesameImpl(); //TODO remove this, and delegate to external class which chooses which factory implementation adopt
    	ARTRepository repository = null;
        
        
    	try {
			repository = repFactory.loadRepository("prova", Resources.getOntologyDir() + "/" + Config.getRepositoryImplementation(), Resources.getOntologyDir() + "/new-temp-triples.nt");
		} catch (RepositoryCreationException e) {
			System.out.println(Utilities.printStackTrace(e));
		}
        Resources.setRepositoryManager(repFactory);
		Resources.setRepository(repository);	
        try {
			SemanticTurkey.initializeVocabularies(repository);
		} catch (VocabularyInitializationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}        
		//	END OF INITIALIZATION        


        
		
        //TEST VARIABLES Initialization
		Document result;
		ARTResource cls;
		ARTResource ind;
        String filasOntologyNS="http://ai-nlp.info.uniroma2.it/ontologies/filas#";
        //END OF TEST VARIABLES Initialization
		
		
        
        //SETTING OF ADMINISTRATION LEVEL
        Administration administration = new Administration(""); // modifica plugin
        //result = Administration.setAdminLevel("off");
        result = administration.setAdminLevel("off");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));   
		
		
        //STAMPA ROOT CLASSES
        Predicate exclusionPredicate;
        if (Config.isAdminStatus()) exclusionPredicate = NoLanguageResourcePredicate.nlrPredicate;
        else exclusionPredicate = DomainResourcePredicate.domResPredicate;        
        Predicate rootUserClsPred = PredicateUtils.andPredicate(new RootClassesResourcePredicate(repository), exclusionPredicate);         
        FilterIterator filtIt = new FilterIterator(repository.listSTNamedClasses(), rootUserClsPred);
        s_logger.debug("\n\n\n\n\nontology root classes with Predicate instead of Filter: \n"); 
        while (filtIt.hasNext()) {
            cls = (ARTResource)filtIt.next();
            System.out.println("root cls: " + cls);
        }
        pause();
        pause();
        
		
		//OntologiesMirror.addCachedOntologyEntry("http://ai-nlp.info.uniroma2.it/ontologies/semturkappl", Resources.getOntologyWorkingDir() + "/semturkappl.owl");		

        
        System.out.println("SemanticAnnotationProperty: " + SemAnnotVocab.Res.SemanticAnnotation);
		System.out.println("qname for university: " + repository.getQName("http://ai-nlp.info.uniroma2.it/ontology.owl#University"));		

		ARTResource mario = repository.getSTClass(SemAnnotVocab.SemanticAnnotation);
        ARTResource mario2 = repository.getSTClass(SemAnnotVocab.SemanticAnnotation);        
        //System.out.println("equality test: " + mario.equals(mario2));
		     		
        

        pause();
        pause();
        
        Property property = new Property(""); // modifica plugin
        //result = Property.createPropertiesXMLTree();
        result = property.createPropertiesXMLTree();
        System.out.println("\nxml content of properties XMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        Cls clsServlet = new Cls(""); // modifca plugin
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        
        //result = STServer.XMLData();
        //System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        /*
        result = Property.getPropertyInfo(repository, repository.getSTProperty(filasOntologyNS+"phoneNumber") );
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        */
        
        Metadata metadata = new Metadata(""); // modifca plugin
        //result = Metadata.getNamespaceMappings();
        result = metadata.getNamespaceMappings();
        System.out.println("\nxml content for NamespaceMappings:\n\n" + XMLHelp.XML2String(result, true));
        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        String importURI1 = "http://ai-nlp.info.uniroma2.it/ontologies/filas";
        String importFile1 = "filas.owl";
        
        System.out.println("adding Ontology Import From Web To Local File");
        //result = Metadata.addOntImport(Metadata.fromWebToMirror, importURI1, null, importFile1);
        result = metadata.addOntImport(metadata.fromWebToMirror, importURI1, null, importFile1);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));                
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();  
        
        
        String importURI3 = "http://esempiononfunzionante.owl";
        //String importURI3 = "http://sweet.jpl.nasa.gov/ontology/units.owl";
        //String importURI3 = "http://www.loa-cnr.it/Files/DLPOnts/DOLCE-Lite.owl";
        
        System.out.println("adding Ontology Import Solely From Web " + importURI3);
        //result = Metadata.addOntImport(Metadata.fromWeb, importURI3, null, null);        
        result = metadata.addOntImport(metadata.fromWeb, importURI3, null, null);        
        System.out.println("\nxml reply to addOntImport:\n\n" + XMLHelp.XML2String(result, true));        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        
        pause();
        pause();  

        
        
/*        
        String importURI2 = "http://sweet.jpl.nasa.gov/ontology/space.owl";
        				 // "http://www.aktors.org/ontology/support"
        				 // "http://www.csl.sri.com/users/denker/owl-sec/security.owl"	
      

        System.out.println("adding Ontology Import Solely From Web " + importURI2);
        result = Metadata.addOntImport(Metadata.fromWeb, importURI2, null, null);        
        System.out.println("\nxml reply to addOntImport:\n\n" + XMLHelp.XML2String(result, true));        
        result = Metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        result = Cls.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));

        pause();
        pause();  


        String testCls = "http://sweet.jpl.nasa.gov/ontology/time.owl#TemporalRelation";
        //STResource clsTest = repository.getSTClass(testCls);	System.out.println(clsTest);
        System.out.println(ServletUtilities.getQNameFromXULLabel(testCls));
        result = Cls.getInstancesListXML(ServletUtilities.getQNameFromXULLabel(testCls));
        System.out.println("\nxml reply to getInstancesListXML:\n\n" + XMLHelp.XML2String(result, true));

        
        pause();
        pause();  


//      System.out.println("check di expandQName: " + repository.expandQName("http://sweet.jpl.nasa.gov/ontology/time.owl#TemporalRelation") );
//        System.out.println("check di expandQName: " + repository.getSTClass("http://sweet.jpl.nasa.gov/ontology/time.owl#TemporalRelation" ) );
//        System.out.println("check di expandQName: " + repository.getSTClass(repository.expandQName("http://sweet.jpl.nasa.gov/ontology/time.owl#TemporalRelation")) );

        
        System.out.println("clearing repository ");
        result = InputOutput.clearRepository();
        System.out.println("\nxml reply to clearRepository:\n\n" + XMLHelp.XML2String(result, true));   
        result = Metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        result = Cls.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));

        
        pause();pause();
        
        result = InputOutput.loadRepository(new File(Resources.getOntologiesMirrorDir()+"/filas.owl"), "http://ai-nlp.info.uniroma2.it/ontologies/filas");
        System.out.println("\nxml reply to loadRepository:\n\n" + XMLHelp.XML2String(result, true));   
        result = Metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        result = Cls.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        
        pause();
        pause();  
        
        
        result = InputOutput.saveRepository(new File("mario.owl"));
        System.out.println("\nxml reply to saveRepository:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        

        
        System.out.println("removing Ontology Import: " + importURI2);
        result = Metadata.removeOntImport(importURI2);
        System.out.println("\nxml reply to removeOntImport:\n\n" + XMLHelp.XML2String(result, true));        
        result = Metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        result = Cls.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();  
        
        System.out.println("removing Ontology Import: http://ai-nlp.info.uniroma2.it/ontologies/filas");
        result = Metadata.removeOntImport("http://ai-nlp.info.uniroma2.it/ontologies/filas");
        System.out.println("\nxml reply to removeOntImport:\n\n" + XMLHelp.XML2String(result, true));        
        result = Metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        result = Cls.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));

*/	
        
       
        System.out.println("mirroring already Imported Ontology : " + importURI3);
        //result = Metadata.getImportedOntology(Metadata.toOntologyMirror, importURI3, null, null, "units.owl");
        result = metadata.getImportedOntology(metadata.toOntologyMirror, importURI3, null, null, "units.owl");
        System.out.println("\nxml reply to removeOntImport:\n\n" + XMLHelp.XML2String(result, true));        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true)); 

        pause();
        pause();  

        
        System.out.println("mirroring already Imported Ontology : " + "http://www.loa-cnr.it/Files/DLPOnts/DOLCE-Lite.owl");
        //result = Metadata.getImportedOntology(Metadata.toOntologyMirror, "http://www.loa-cnr.it/Files/DLPOnts/DOLCE-Lite.owl", null, null, "dolce.owl");
        result = metadata.getImportedOntology(metadata.toOntologyMirror, "http://www.loa-cnr.it/Files/DLPOnts/DOLCE-Lite.owl", null, null, "dolce.owl");
        System.out.println("\nxml reply to removeOntImport:\n\n" + XMLHelp.XML2String(result, true));        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true)); 
                
        
        pause();
        pause();  
        
        
        System.out.println("redownloading from alternate site : " + "http://www.loa-cnr.it/Files/DLPOnts/DOLCE-Lite.owl");
        //result = Metadata.getImportedOntology(Metadata.fromWebToMirror, "http://www.loa-cnr.it/Files/DLPOnts/DOLCE-Lite.owl", "http://www.loa-cnr.it/Files/DLPOnts/DOLCE-Lite_397.owl", null, "dolce_lite.owl");
        result = metadata.getImportedOntology(metadata.fromWebToMirror, "http://www.loa-cnr.it/Files/DLPOnts/DOLCE-Lite.owl", "http://www.loa-cnr.it/Files/DLPOnts/DOLCE-Lite_397.owl", null, "dolce_lite.owl");
        System.out.println("\nxml reply to getImportedOntology:\n\n" + XMLHelp.XML2String(result, true));        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true)); 
                
        
        pause();
        pause();  
        
        
        System.out.println("removing Ontology Import: " + importURI3);
        //result = Metadata.removeOntImport(importURI3);
        result = metadata.removeOntImport(importURI3);
        System.out.println("\nxml reply to removeOntImport:\n\n" + XMLHelp.XML2String(result, true));        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true)); 
        
        
        System.out.println("removing Ontology Import: " + importURI1);
        //result = Metadata.removeOntImport(importURI1);
        result = metadata.removeOntImport(importURI1);
        System.out.println("\nxml reply to removeOntImport:\n\n" + XMLHelp.XML2String(result, true));        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml reply to getOntologyImports:\n\n" + XMLHelp.XML2String(result, true));                     
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true)); 
	}
	
}
