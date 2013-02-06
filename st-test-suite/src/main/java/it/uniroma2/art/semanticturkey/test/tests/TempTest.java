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
package it.uniroma2.art.semanticturkey.test.tests;

import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl;
import it.uniroma2.art.semanticturkey.project.ProjectManager.ProjectType;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.main.Cls;
import it.uniroma2.art.semanticturkey.servlet.main.Metadata;
import it.uniroma2.art.semanticturkey.servlet.main.Projects;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import java.io.IOException;

/**
 * @author Armando Stellato
 * 
 */
public class TempTest extends ServiceTest {

	public void doTest() {

		Response resp = projectsService.makeRequest(Projects.Req.createNewProjectRequest, par(
				Projects.projectNamePar, "mario"), par(Projects.baseuriPar, "http://mario.it"), par(
				Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()), par(
				Projects.projectTypePar, ProjectType.saveToStore.toString()));
		System.out.println(resp);
		
		String stxOntologyURI = "http://www.estrellaproject.org/lkif-core/lkif-core.owl";
		
		resp = clsService.makeRequest(Cls.createClassRequest,
				par(Cls.newClassNamePar, "Persona"),
				par(Cls.superClassNamePar, "owl:Thing")
		);
		
		resp = metadataService.makeRequest(Metadata.addFromWebRequest,
				par(Metadata.baseuriPar, stxOntologyURI)
		);
		System.out.println(resp);				
	
				

		resp = projectsService.makeRequest(Projects.Req.saveProjectRequest);

		resp = clsService.makeRequest(Cls.getSubClassesRequest,
				par(Cls.clsQNameField, "owl:Thing"),
				par(Cls.treePar, "true"),
				par(Cls.instNumPar, "true")
		);
		System.out.println(resp);
		
		/*
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp);
		  
		resp = projectsService.makeRequest(Projects.Req.saveProjectRequest);
		System.out.println(resp);		
		
		resp = projectsService.makeRequest(Projects.Req.closeProjectRequest);
		System.out.println(resp);

		resp = projectsService.makeRequest(Projects.Req.openProjectRequest, par(Projects.projectNamePar,
				"mario"));
		System.out.println(resp);

		resp = clsService.makeRequest(Cls.getSubClassesRequest,
				par(Cls.clsQNameField, "owl:Thing"),
				par(Cls.treePar, "true")
		);
		System.out.println(resp);
		
		
		
		OWLModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		RDFIterator<? extends ARTResource> namedClassesIt;
		try {
			namedClassesIt = ontModel.listNamedClasses(true);
			Predicate<ARTResource> exclusionPredicate;
			if (Config.isAdminStatus())
				exclusionPredicate = NoLanguageResourcePredicate.nlrPredicate;
			else
				exclusionPredicate = DomainResourcePredicate.domResPredicate;

			Predicate<ARTResource> rootUserClsPred = Predicates.and(new RootClassesResourcePredicate(ontModel),
					exclusionPredicate);
			Iterator<? extends ARTResource> filtIt;
			filtIt = Iterators.filter(namedClassesIt, rootUserClsPred);
			while (filtIt.hasNext()) {
				System.out.println("class: " + filtIt.next());
			}
			namedClassesIt.close();
			
			Iterator<? extends ARTResource> uriIT = Iterators.filter(((DirectReasoning)ontModel).listDirectSuperClasses(ontModel.createURIResource(ontModel.expandQName("Persona"))), Predicates.alwaysTrue());
			while (uriIT.hasNext()) {
				System.out.println("super class di persona: " + uriIT.next());
			}
			
			
		} catch (ModelAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
				try {
			OWLModel ontModel = ProjectManager.getCurrentProject().getOntModel();
			ontModel.addTriple(ontModel.createURIResource(ontModel.expandQName("MyClass")),
					RDF.Res.TYPE,
					OWL.Res.CLASS,
					NodeFilters.MAINGRAPH
			);
		} catch (ModelUpdateException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ModelAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}	
		
		
		*/
		
		//resp = propertyService.makeRequest(Property.getPropertiesTreeRequest);
		//System.out.println(resp);
		
	}

	public static void main(String[] args) throws ModelUpdateException, STInitializationException,
			IOException {

		String testType;

		if (args.length > 0)
			testType = args[0];
		else
			testType = "direct";
			// testType = "http";

		TempTest test = new TempTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();
	}

}
