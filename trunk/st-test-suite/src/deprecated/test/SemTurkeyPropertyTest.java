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
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Property;
import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.filter.DomainResourcePredicate;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.test.fixture.SemTurkeyFixture;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.ARTStatement;
import it.uniroma2.art.ontapi.ARTStatementIterator;
import it.uniroma2.art.ontapi.exceptions.RepositoryCreationException;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.art.ontapi.exceptions.VocabularyInitializationException;
import it.uniroma2.art.ontapi.filter.NoLanguageResourcePredicate;
import it.uniroma2.art.ontapi.filter.RootClassesResourcePredicate;
import it.uniroma2.art.ontapi.vocabulary.OWL;
//import it.uniroma2.art.stontapi.sesameimpl.SesameARTRepositoryManagerImpl;

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
public class SemTurkeyPropertyTest {

	final static String extensiondir = "../OntologyRepository/STTest/extensions/extDir";
	final static private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	
	public SemTurkeyPropertyTest() {
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
		SemTurkeyFixture test = new SemTurkeyFixture();
		STOntologyManager repFactory = new STRepositoryManagerSesameImpl(); //TODO remove this, and delegate to external class which chooses which factory implementation adopt
    	ARTRepository repository = null;
        
        
    	try {
			repository = repFactory.loadRepository("prova", Resources.getOntologyDir() + "/" + Config.getRepositoryImplementation(), Resources.getOntologyDir() + "/new-temp-triples.nt");
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
        String filasOntologyNS="http://ai-nlp.info.uniroma2.it/ontologies/filas#";
        //END OF TEST VARIABLES Initialization

        
        //SETTING OF ADMINISTRATION LEVEL
        Administration administration = new Administration(""); // modifica plugin
        //result = Administration.setAdminLevel("off");
		result = administration.setAdminLevel("off");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));   

		
		
		//************************
		//	END OF INITIALIZATION 
		//************************
	        
        //IMPORTING FOAF ONTOLOGY
        String importURI1 = "http://xmlns.com/foaf/0.1/";
        String importFile1 = "foaf.rdf";
        
        Metadata metadata = new Metadata(""); // modifica plugin
        //Metadata.setNamespaceMapping("foaf", "http://xmlns.com/foaf/0.1/");
        metadata.setNamespaceMapping("foaf", "http://xmlns.com/foaf/0.1/");
        
        System.out.println("adding Ontology Import: " + importURI1 + " From Web To Local File");
        //result = Metadata.addOntImport(Metadata.fromWebToMirror, importURI1, null, importFile1);
        result = metadata.addOntImport(metadata.fromWebToMirror, importURI1, null, importFile1);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));                
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        Cls clsServlet = new Cls("");
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));


		
        //result = Cls.dragDropSelectionOverClass("Armando Stellato", "foaf:Person", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
        result = clsServlet.dragDropSelectionOverClass("Armando Stellato", "foaf:Person", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      
		System.out.println("check esistenza dominio rispondente a uri: " + repository.expandQName("foaf:Person"));
		System.out.println("classe ottenuta: " + repository.getSTResource(repository.expandQName("foaf:Person")));
        
		Property property = new Property(""); // modifica plugin
		//result = Property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "foaf:knows", "University of Rome, Tor Vergata", "foaf:Organization", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		result = property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "foaf:knows", "University of Rome, Tor Vergata", "foaf:Organization", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      
		
        pause();
        pause();
		
        Individual individual = new Individual("");
        //result = Individual.getIndividualDescription("Armando Stellato", Individual.templateandvalued);
        result = individual.getIndividualDescription("Armando Stellato", individual.templateandvalued);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      
        
        pause();
        pause();
        
        //result = Metadata.setNamespaceMapping("foaf", "http://xmlns.com/foaf/0.1/");
        //result = Metadata.getNamespaceMappings();
        result = metadata.getNamespaceMappings();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();

        
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        
        pause();
        pause();
        
        //result = Property.editProperty("dummyProperty", "addProperty", Property.addProperty, "ObjectProperty", null);
        result = property.editProperty("dummyProperty", "addProperty", property.addProperty, "ObjectProperty", null);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        //result = Property.createPropertiesXMLTree();
        result = property.createPropertiesXMLTree();
        System.out.println("\nxml content for PropertyXMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();

        
        System.out.println("check esistenza dominio rispondente a uri: " + repository.expandQName("foaf:Person") + ": "+ repository.getSTClass(repository.expandQName("foaf:Person")));
        
        
        pause();
        pause();

        
        //result = Property.editProperty("dummyProperty", "addPropertyDomain", Property.addPropertyDomain, "foaf:Person");
        result = property.editProperty("dummyProperty", "addPropertyDomain", property.addPropertyDomain, "foaf:Person");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        //result = Property.editProperty("dummyProperty", "addPropertyRange", Property.addPropertyRange, "foaf:Person");
        result = property.editProperty("dummyProperty", "addPropertyRange", property.addPropertyRange, "foaf:Person");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
       
        pause();
        pause();
        
        //result = Property.editProperty("dummyProperty", "addSuperProperty", Property.addSuperProperty, "foaf:fundedBy");
        result = property.editProperty("dummyProperty", "addSuperProperty", property.addSuperProperty, "foaf:fundedBy");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        //result = Property.editPropertyValue("addExistingPropValue", "Armando Stellato", "dummyProperty", "University of Rome, Tor Vergata", null, null);
        result = property.editPropertyValue("addExistingPropValue", "Armando Stellato", "dummyProperty", "University of Rome, Tor Vergata", null, null);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        //result = Property.editPropertyValue("createAndAddPropValue", "Armando Stellato", "dummyProperty", "minchiopode", "foaf:Person", null);
        result = property.editPropertyValue("createAndAddPropValue", "Armando Stellato", "dummyProperty", "minchiopode", "foaf:Person", null);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        

        //result = Property.getPropertyInfo("dummyProperty");
        result = property.getPropertyInfo("dummyProperty");
        System.out.println("\nxml content for getPropertyInfo(dummyProperty):\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();

        
        //result = Property.editPropertyValue("removePropValue", "Armando Stellato", "dummyProperty", "University of Rome, Tor Vergata", null, null);
        result = property.editPropertyValue("removePropValue", "Armando Stellato", "dummyProperty", "University of Rome, Tor Vergata", null, null);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();

        
        //result = InputOutput.saveRepository(new File("marietto.owl"));
        //System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));        
        
        
        //result = Property.editProperty("dummyProperty", "removeSuperProperty", Property.removeSuperProperty, "foaf:fundedBy");
        result = property.editProperty("dummyProperty", "removeSuperProperty", property.removeSuperProperty, "foaf:fundedBy");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        //result = Property.editProperty("dummyProperty", "removePropertyRange", Property.removePropertyRange, "foaf:Person");
        result = property.editProperty("dummyProperty", "removePropertyRange", property.removePropertyRange, "foaf:Person");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        
        //result = Property.getPropertyInfo("dummyProperty");
        result = property.getPropertyInfo("dummyProperty");
        System.out.println("\nxml content for getPropertyInfo(dummyProperty):\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();

        
        //result = Property.editProperty("dummyProperty", "removePropertyDomain", Property.removePropertyDomain, "foaf:Person");
        result = property.editProperty("dummyProperty", "removePropertyDomain", property.removePropertyDomain, "foaf:Person");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();

        Delete delete = new Delete(""); // modifca plugin
        //Delete.deleteProperty(repository.getSTProperty(repository.expandQName("dummyProperty")), repository);
        delete.deleteProperty(repository.getSTProperty(repository.expandQName("dummyProperty")), repository);
    	}

}
