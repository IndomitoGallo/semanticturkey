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
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Metadata;
//import it.uniroma2.info.ai_nlp.metaengine.servlet.Property;
import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.resources.Config;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.Administration;
import it.uniroma2.art.semanticturkey.servlet.Cls;
import it.uniroma2.art.semanticturkey.servlet.Metadata;
import it.uniroma2.art.semanticturkey.servlet.Property;
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
public class SemTurkeyTestRepository {

	final static String extensiondir = "../OntologyRepository/STTest/extensions/extDir";
	final static private Logger s_logger = Logger.getLogger(SemanticTurkey.class);	
	
	public SemTurkeyTestRepository() {
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
		SemTurkeyTestRepository test = new SemTurkeyTestRepository();
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
		//	END OF INITIALIZATION        


        
		
        //TEST VARIABLES Initialization
		Document result;
		ARTResource cls;
		ARTResource ind;
        String filasOntologyNS="http://ai-nlp.info.uniroma2.it/ontologies/filas#";
        //END OF TEST VARIABLES Initialization
		
		
        Predicate rootUserClsPred = PredicateUtils.andPredicate(new RootClassesResourcePredicate(repository), NoLanguageResourcePredicate.nlrPredicate);
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
		
        //SETTING OF ADMINISTRATION LEVEL
        Administration administration = new Administration(""); // modifica plugin
		//result = Administration.setAdminLevel("off");
		result = administration.setAdminLevel("off");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));        		
/*        
        //CREATION OF CLASS RESEARCHER
		result = CreateClass.createClass("Researcher", "filas:Person");		
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));        
		cls = repository.getSTResource("http://ai-nlp.info.uniroma2.it/ontology.owl#Researcher");		
		System.out.println("created class: " + cls);

        //CREATION OF CLASS PROFESSOR
		result = CreateClass.createClass("Professor", "filas:Person");		
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));        
		cls = repository.getSTResource("http://ai-nlp.info.uniroma2.it/ontology.owl#Professor");		
		System.out.println("created class: " + cls);
		
        //CREATION OF INDIVIDUAL MINCHIONE
		result = Cls.createInstanceOption("minchione", "Researcher");
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
		ind = repository.getSTResource("http://ai-nlp.info.uniroma2.it/ontology.owl#minchione");		
		System.out.println("created Individual: " + ind);

		//GETTING INSTANCES OF WORDNET/DOCUMENT
        result = Cls.getInstancesListXML("http://xmlns.com/wordnet/1.6/Document");
        System.out.println("http://xmlns.com/wordnet/1.6/Document");
        System.out.println("\nxml content :\n\n" + XMLHelp.XML2String(result, true));        
        
        
        //CREATION OF CLASS UNIVERSITY
		result = CreateClass.createClass("University", "filas:Organization");	
		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));   
		
//		result = Delete.deleteResource("University", "Class");	
//		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));   
		
        result = Cls.dragDropSelectionOverClass("Fabio Massimo Zanzotto", "Professor", "http://ai-nlp.info.uniroma2.it/zanzotto/", "Fabio Massimo Zanzotto Home Page");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));               
        
        result = Cls.dragDropSelectionOverClass("Armando Stellato", "Researcher", "http://ai-nlp.info.uniroma2.it/stellato/", "Armando Stellato Home Page");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));               

        Annotation.annotateInstanceWithDragAndDrop("Armando Stellato", "Ingegner Armando Stellato", "http://www.ingegneria-online.it/?q=node/122", "Ingegner Armando Stellato | Ingegneria OnLine");        
        result = Page.getAnnotatedPagesForInstance("Armando Stellato"); //Property.getInstanceProperties("Researcher", "Armando Stellato", "properties");
                
        result = Page.getAnnotatedPagesForInstance("Armando Stellato");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));               
        
        result = Page.getAnnotatedPagesForInstance("Fabio Massimo Zanzotto");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));               
*/        
        
        
        
        pause();
        pause();
        

        

        
//		result = Delete.deleteResource("Armando Stellato", "Instance");	
//		System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));   
        
        
       
        
 //       result = Property.getInstanceProperties("Armando Stellato", "properties");
        //createClass("Person", "Researcher");       
//        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));


                
//        result = Cls.getClassSubTreeXML("filas:Organization");
//        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        pause();
        pause();
        
        Property property = new Property(""); // modifica plugin
        //result = Property.createPropertiesXMLTree();
        result = property.createPropertiesXMLTree();
        System.out.println("\nxml content of properties XMLTree:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        Cls clsServlet = new Cls(""); // modifica plugin
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
        
        Metadata metadata = new Metadata("");  // modica plugin
        //result = Metadata.getNamespaceMappings();
        result = metadata.getNamespaceMappings();
        System.out.println("\nxml content for NamespaceMappings:\n\n" + XMLHelp.XML2String(result, true));
        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));
        
        pause();
        pause();
        
        //result = Metadata.addOntImport(Metadata.fromWebToMirror, "http://www.aktors.org/ontology/support", null, "supported.owl");
        result = metadata.addOntImport(metadata.fromWebToMirror, "http://www.aktors.org/ontology/support", null, "supported.owl");
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));        
        
        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml content:\n\n" + XMLHelp.XML2String(result, true));

        System.out.println("ciao");
        
//        result = Metadata.addOntImport(Metadata.fromWeb, "http://www.csl.sri.com/users/denker/owl-sec/security.owl", null, null);
//        System.out.println("\nxml content2:\n\n" + XMLHelp.XML2String(result, true));        

        //result = Metadata.getOntologyImports();
        result = metadata.getOntologyImports();
        System.out.println("\nxml content2:\n\n" + XMLHelp.XML2String(result, true));
        
        
        
        //result = Cls.createClassXMLTree();
        result = clsServlet.createClassXMLTree();
        System.out.println("\nxml content for ClassXMLTree:\n\n" + XMLHelp.XML2String(result, true));

        
        
        // API TESTING OVER PROPERTIES
        /*
        STResource superProp = repository.getSTProperty(filasOntologyNS+"phoneNumber");
        Collection<STResource> subProps = repository.getDirectSubProperties(superProp);
        System.out.print("subproperties of phonenumber");  System.out.println(subProps);
                
        STResource subProp = repository.getSTProperty(filasOntologyNS+"fax");
        Collection<STResource> superProps = repository.getDirectSuperProperties(subProp);
        System.out.print("superproperties of fax");  System.out.println(superProps);                      
        
        Iterator<STResource> props = repository.listProperties();
        System.out.println("\nontology properties: \n"); while (props.hasNext()) System.out.println(props.next());
        
        RootPropertiesResourcePredicate rootFilt = new RootPropertiesResourcePredicate(repository);
        Iterator filteredPropsIterator;
        
        props = repository.listDatatypeProperties();
        System.out.println("\nontology datatype properties: \n"); while (props.hasNext()) System.out.println(props.next());
                
        props = repository.listDatatypeProperties();
        filteredPropsIterator = new FilterIterator(props, rootFilt);
        System.out.println("\nontology root datatype properties: \n"); while (filteredPropsIterator.hasNext()) System.out.println(filteredPropsIterator.next());
                
        
        props = repository.listObjectProperties();
        System.out.println("\nontology object properties: \n"); while (props.hasNext()) System.out.println(props.next());

        props = repository.listObjectProperties();
        filteredPropsIterator = new FilterIterator(props, rootFilt);
        System.out.println("\nontology root object properties: \n"); while (filteredPropsIterator.hasNext()) System.out.println(filteredPropsIterator.next());
        
        
        props = repository.listAnnotationProperties();
        System.out.println("\nontology annotation properties: \n"); while (props.hasNext()) System.out.println(props.next());

        props = repository.listAnnotationProperties();
        filteredPropsIterator = new FilterIterator(props, rootFilt);;
        System.out.println("\nontology root annotation properties: \n"); while (filteredPropsIterator.hasNext()) System.out.println(filteredPropsIterator.next());

        
        try {
            repository.writeRDF(Resources.getOntologyDir()+"/mario.owl");
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        */
        //repository.getPropertyRanges(property);
	}
	
}
