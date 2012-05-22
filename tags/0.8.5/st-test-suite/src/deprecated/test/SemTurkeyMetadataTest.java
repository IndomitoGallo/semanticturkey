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

import it.uniroma2.art.ontapi.sesameimpl.SesameARTRepositoryImpl;
import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.filter.DomainResourcePredicate;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.ontology.sesame.STRepositoryManagerSesameImpl;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.main.Administration;
import it.uniroma2.art.semanticturkey.servlet.main.Cls;
import it.uniroma2.art.semanticturkey.servlet.main.CreateClass;
import it.uniroma2.art.semanticturkey.servlet.main.Individual;
import it.uniroma2.art.semanticturkey.servlet.main.Metadata;
import it.uniroma2.art.semanticturkey.servlet.main.Property;
import it.uniroma2.art.semanticturkey.servlet.main.SearchOntology;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;
import it.uniroma2.art.semanticturkey.test.fixture.SemTurkeyFixture;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;
import it.uniroma2.art.ontapi.ARTRepository;
import it.uniroma2.art.ontapi.ARTResource;
import it.uniroma2.art.ontapi.ARTResourceIterator;
import it.uniroma2.art.ontapi.ARTStatement;
import it.uniroma2.art.ontapi.ARTStatementIterator;
import it.uniroma2.art.ontapi.exceptions.RepositoryCreationException;
import it.uniroma2.art.ontapi.exceptions.RepositoryUpdateException;
import it.uniroma2.art.ontapi.exceptions.VocabularyInitializationException;
import it.uniroma2.art.ontapi.filter.NoLanguageResourcePredicate;
import it.uniroma2.art.ontapi.filter.RootClassesResourcePredicate;
import it.uniroma2.art.ontapi.vocabulary.OWL;
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
import org.w3c.dom.Document;


/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 *
 */
public class SemTurkeyMetadataTest {

	final static String extensiondir = "../OntologyRepository/STTest/extensions/extDir";
	final static private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	
	public SemTurkeyMetadataTest() {
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
        //END OF TEST VARIABLES Initialization

        
        //SETTING OF ADMINISTRATION LEVEL
        Administration administration = new Administration(""); // modifica plugin
        //result = Administration.setAdminLevel("off");
		result = administration.setAdminLevel("off");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));   

		Metadata metadata = new Metadata(""); // modifica plugin
		//result = Metadata.setNamespaceMapping("rtv", "http://ai-nlp.info.uniroma2.it/ontologies/rtv#");
        result = metadata.setNamespaceMapping("metadata", "http://ai-nlp.info.uniroma2.it/ontologies/metadata#");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
		
		//************************
		//	END OF INITIALIZATION 
		//************************
	        
        //IMPORTING rtv ONTOLOGY
        String importURI1 = "http://ai-nlp.info.uniroma2.it/ontologies/metadata";
        String importFile1 = "metadata.owl";
        String importURI2 = "http://xmlns.com/foaf/0.1/";
        String importAltURL2 = "http://xmlns.com/foaf/spec/20071002.rdf";
        String importFile2 = "foaf.rdf";

        
        System.out.println("adding Ontology Import: " + importURI1 + " From Web To Local File");
        //result = Metadata.addOntImport(Metadata.fromWebToMirror, importURI1, null, importFile1);
        result = metadata.addOntImport(metadata.fromWebToMirror, importURI1, null, importFile1);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));         
        
        pause();
        pause();
        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        //result = Metadata.getNamespaceMappings();
        result = metadata.getNamespaceMappings();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        pause();
        pause();
        
        Cls clsServlet = new Cls(""); // modifica plugin
        CreateClass createClassServlet = new CreateClass(""); // modifica plugin
        Individual indServlet = new Individual(""); // modifica plugin
        SearchOntology searchOnt = new SearchOntology("");
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));

        pause();
        pause();

        result = clsServlet.getClassDescription("metadata:BW_Resource", Cls.templateandvalued);
        System.out.println("\nxml content for getClassDescription:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        result = createClassServlet.createClass("ProvaResource", "owl:Thing");
        System.out.println("\nxml content for createClass:\n\n" + XMLHelp.XML2String(result, true));
        
        result = clsServlet.createInstanceOption("provaResource", "metadata:BW_Resource");
        System.out.println("\nxml content for createInstanceOption:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        result = indServlet.getIndividualDescription("provaResource", Individual.templateandvalued);
        System.out.println("\nxml content for getIndividualDescription:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        System.out.println("available namespaces");
        Iterator<String> nss = repository.listNamespaces();
        while (nss.hasNext())
            System.out.println(nss.next());
        
        
        result = searchOnt.searchOntology("Resource", "clsNInd");
        System.out.println("\nxml content for searchOntology:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        
        Property property = new Property(""); // modifica plugin
        //result = Property.createPropertiesXMLTree();
        result = property.createPropertiesXMLTree();
        System.out.println("\nxml content for createPropertiesXMLTree:\n\n" + XMLHelp.XML2String(result, true));

        
        pause();
        pause();
        
        ARTResource phoneNProp = repository.getSTProperty(repository.expandQName("rtv:phoneNumber"));
        ARTResource faxProp = repository.getSTProperty(repository.expandQName("rtv:fax"));
        
		
        //result = Cls.dragDropSelectionOverClass("Armando Stellato", "rtv:Person", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
        result = clsServlet.dragDropSelectionOverClass("Armando Stellato", "rtv:Person", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      
		System.out.println("check esistenza dominio rispondente a uri: " + repository.expandQName("rtv:Person"));
		System.out.println("classe ottenuta: " + repository.getSTResource(repository.expandQName("rtv:Person")));
        
		//result = Property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "rtv:worksIn", "University of Rome, Tor Vergata", "rtv:Organization", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		result = property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "rtv:worksIn", "University of Rome, Tor Vergata", "rtv:Organization", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      
		
		//result = Property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "rtv:phoneNumber", "+390672597330", "xsd:string", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		result = property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "rtv:phoneNumber", "+390672597330", "xsd:string", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      

		//result = Property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "rtv:phoneNumber", "+390672597332", "xsd:string", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		result = property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "rtv:phoneNumber", "+390672597332", "xsd:string", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      

		//result = Property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "rtv:fax", "+390672597460", "xsd:string", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		result = property.bindAnnotatedObjectToNewInstanceAndRelateToDroppedInstance("Armando Stellato", "rtv:fax", "+390672597460", "xsd:string", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      

		//result = Cls.getClassDescription("rtv:University", Cls.templateandvalued);
		result = clsServlet.getClassDescription("rtv:University", clsServlet.templateandvalued);
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      
		
		
	}
	
}