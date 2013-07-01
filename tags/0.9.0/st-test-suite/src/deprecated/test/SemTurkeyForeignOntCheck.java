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
public class SemTurkeyForeignOntCheck {

	final static String extensiondir = "../OntologyRepository/STTest/extensions/extDir";
	final static private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	
	public SemTurkeyForeignOntCheck() {
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
	
	public static void resetWorkingFiles() {
		File ontfile = new File(extensiondir + "/" + "rkb.nt");
		ontfile.delete();
		ontfile = new File(extensiondir + "/new-temp-triples.nt.~bak");
		ontfile.delete();
		File prefixMappingsFile = new File(extensiondir + "/PrefixMappings.xml");
		File importMemFile = new File(extensiondir + "/importMem.properties");
		System.out.println("ontfile: " + ontfile);
		System.out.println("prefixMappingsFile: " + prefixMappingsFile);
		System.out.println("importMemFile: " + importMemFile);
		prefixMappingsFile.delete();
		importMemFile.delete();
		try {
			prefixMappingsFile.createNewFile();
			importMemFile.createNewFile();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
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
		//	END OF INITIALIZATION 
		//************************
	        
        //IMPORTING rtv ONTOLOGY
        String importURI1 = "http://ai-nlp.info.uniroma2.it/ontologies/rtv";
        String importFile1 = "rtv.owl";
        
        System.out.println("adding Ontology Import: " + importURI1 + " From Web To Local File");
        //result = Metadata.addOntImport(Metadata.fromWebToMirror, importURI1, null, importFile1);
        result = metadata.addOntImport(metadata.fromWebToMirror, importURI1, null, importFile1);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));                
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        
        
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();pause();

        result = clsServlet.createInstanceOption("mario", "rtv:Project");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      

        
        result = clsServlet.getInstancesListXML("rtv:Project");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));  
        

        pause();
        
        ARTResource phoneNProp = repository.getSTProperty(repository.expandQName("rtv:phoneNumber"));
        ARTResource faxProp = repository.getSTProperty(repository.expandQName("rtv:fax"));
        
        System.out.println("domains for property phoneNProp:");
        Iterator<ARTResource> rit = repository.getPropertyDomains(phoneNProp);
        while (rit.hasNext())
            System.out.println(rit.next());
        
        System.out.println("domains for property faxProp: ");
        rit = repository.getPropertyDomains(faxProp);
        while (rit.hasNext())
            System.out.println(rit.next());
        
        
        LocalRepository sesrep = ((SesameARTRepositoryImpl)repository).getLocalRepository();
        
        System.out.println("\n\nWRITING EXPLICIT STATEMENTS\n\n");
        StatementIterator stit = ((RdfSchemaSource)sesrep.getSail()).getExplicitStatements(null, null, null);
        while (stit.hasNext()) {
            Statement st = stit.next();
            System.out.println(st.getSubject() + " " + st.getPredicate() + " " + st.getObject());
        }
            
		
        //result = Cls.dragDropSelectionOverClass("Armando Stellato", "rtv:Person", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
        result = clsServlet.dragDropSelectionOverClass("Armando Stellato", "rtv:Person", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      
		System.out.println("check esistenza dominio rispondente a uri: " + repository.expandQName("rtv:Person"));
		System.out.println("classe ottenuta: " + repository.getSTResource(repository.expandQName("rtv:Person")));
        
		Property property = new Property(""); // modifica plugin
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

		//result = Property.editPropertyValue("createAndAddPropValue", "Armando Stellato", "rdfs:label", "Odnamar Starred", null, "en");
		result = property.editPropertyValue("createAndAddPropValue", "Armando Stellato", "rdfs:label", "Odnamar Starred", null, "en");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      
		
        pause();
        pause();

        
        //result = Cls.getClassDescription("rtv:Person", Individual.templateandvalued);
        result = clsServlet.getClassDescription("rtv:Person", individualServlet.templateandvalued);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        pause();
        pause();
		
        //result = Individual.getIndividualDescription("rtv:Demokritos", Individual.templateandvalued);
        result = individualServlet.getIndividualDescription("rtv:Demokritos", individualServlet.templateandvalued);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        pause();
        pause();
        
        
        //result = Individual.getIndividualDescription("Armando Stellato", Individual.templateandvalued);
        result = individualServlet.getIndividualDescription("Armando Stellato", individualServlet.templateandvalued);
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));      
             
        
        //result = Property.getPropertyInfo("rtv:phoneNumber");
        result = property.getPropertyInfo("rtv:phoneNumber");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        //result = Property.getPropertyInfo("rtv:fax");
        result = property.getPropertyInfo("rtv:fax");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
                
        SearchOntology searchOntology = new SearchOntology("");
        //result = SearchOntology.searchOntology("mgr:Cacchio", "clsNInd");
        result = searchOntology.searchOntology("mgr:Cacchio", "clsNInd");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        //result = SearchOntology.searchOntology("rtv:Checchio", "clsNInd");
        result = searchOntology.searchOntology("rtv:Checchio", "clsNInd");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        //result = SearchOntology.searchOntology("rtv:Demokritos", "clsNInd");
        result = searchOntology.searchOntology("rtv:Demokritos", "clsNInd");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        //result = SearchOntology.searchOntology("perso", "clsNInd");
        result = searchOntology.searchOntology("perso", "clsNInd");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        //result = SearchOntology.searchOntology("http://mario/Checchio", "clsNInd");
        result = searchOntology.searchOntology("http://mario/Checchio", "clsNInd");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        //result = SearchOntology.searchOntology("http://mario#Checchio", "clsNInd");
        result = searchOntology.searchOntology("http://mario#Checchio", "clsNInd");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        //result = SearchOntology.searchOntology("phone", "property");
        result = searchOntology.searchOntology("phone", "property");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
     
        //result = Property.editProperty("rtv:worksIn", "addPropertyRange", Property.addPropertyRange, "rtv:Person");
        result = property.editProperty("rtv:worksIn", "addPropertyRange", property.addPropertyRange, "rtv:Person");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));        
        
        //result = Property.getRangeClassesTreeXML("rtv:worksIn");
        result = property.getRangeClassesTreeXML("rtv:worksIn");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        
        pause();
        pause();
        
        //result = Metadata.getNamespaceMappings();
        result = metadata.getNamespaceMappings();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
	}

}
