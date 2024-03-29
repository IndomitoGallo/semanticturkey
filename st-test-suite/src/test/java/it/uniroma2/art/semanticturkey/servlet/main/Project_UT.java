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
 * http//art.uniroma2.it/software/...
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.servlet.main;

import it.uniroma2.art.owlart.sesame2impl.models.conf.Sesame2NonPersistentInMemoryModelConfiguration;
import it.uniroma2.art.owlart.sesame2impl.models.conf.Sesame2PersistentInMemoryModelConfiguration;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.project.ProjectManager.ProjectType;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.fixture.ServiceUTFixture;
import it.uniroma2.art.semanticturkey.servlet.main.Projects;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;
import static it.uniroma2.art.semanticturkey.servlet.utils.AssertResponses.*;

import java.io.IOException;

import org.junit.BeforeClass;
import org.junit.Test;

/**
 * @author Armando Stellato
 * 
 */
public class Project_UT extends ServiceUTFixture {

	@BeforeClass
	public static void init() throws IOException, STInitializationException {
		ServiceTest tester = new Project_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");

	}

	
	// http://127.0.0.1:1979/semantic_turkey/resources/stserver/STServer?
	// service=projects&
	// request=newProject&
	// name=fooproject&
	// ontologyType=OWL&
	// baseuri=http://foo.it&
	// ontmanager=it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl&
	// ontMgrConfiguration=it.uniroma2.art.owlart.sesame2impl.models.conf.Sesame2PersistentInMemoryModelConfiguration&
	// cfgPars=syncDelay:::1000|_|directTypeInference:::true|_|rdfsInference:::true
	/**
	 * check if it is possible to create, close, open, then close again and finally delete a project
	 */
	@Test
	public void testCreateCloseProject() {
		Response resp = serviceTester.projectsService.makeRequest(
				Projects.Req.createNewProjectRequest,
				par(Projects.projectNamePar, "mario"),
				par(Projects.baseuriPar, "http://mario.it"),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.ontMgrConfigurationPar,
						Sesame2PersistentInMemoryModelConfiguration.class.getName()),
				par(Projects.ontologyTypePar, "OWL")

		);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.openProjectRequest,
				par(Projects.projectNamePar, "mario"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "mario"));
		assertAffirmativeREPLY(resp);
	}

	/**
	 * check if it is possible to create, save as (and move to) another project, close this new project and
	 * finally delete both projects
	 */
	@Test
	public void testCreateAndSaveAs() {

		Response

		resp = serviceTester.projectsService.makeRequest(
				Projects.Req.createNewProjectFromFileRequest,
				par(Projects.projectNamePar, "pippo"),
				par(Projects.baseuriPar, "http://mario.it"),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.ontFilePar, "testInput/azienda.owl"),
				par(Projects.ontMgrConfigurationPar,
						Sesame2PersistentInMemoryModelConfiguration.class.getName()),
				par(Projects.ontologyTypePar, "OWL"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.saveProjectAsRequest,
				par(Projects.projectNamePar, "pippo"), par(Projects.newProjectNamePar, "salvo"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "pippo"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "salvo"));
		assertAffirmativeREPLY(resp);

	}

	@Test
	public void testInvalidProjectName() {
		Response

		resp = serviceTester.projectsService.makeRequest(Projects.Req.createNewProjectRequest,
				par(Projects.projectNamePar, "pippo\\|//"), par(Projects.baseuriPar, "http://pippo.it"),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.projectTypePar, ProjectType.continuosEditing.toString()));
		assertResponseEXCEPTION(resp);
	}

	@Test
	public void testListProjects() {

		Response

		resp = serviceTester.projectsService.makeRequest(
				Projects.Req.createNewProjectFromFileRequest,
				par(Projects.projectNamePar, "pluto"),
				par(Projects.baseuriPar, "http://pluto.it"),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.ontFilePar, "testInput/azienda.owl"),
				par(Projects.ontMgrConfigurationPar,
						Sesame2PersistentInMemoryModelConfiguration.class.getName()),
				par(Projects.ontologyTypePar, "OWL"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(
				Projects.Req.createNewProjectRequest,
				par(Projects.projectNamePar, "pippo"),
				par(Projects.baseuriPar, "http://pippo.it"),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.ontMgrConfigurationPar,
						Sesame2PersistentInMemoryModelConfiguration.class.getName()),
				par(Projects.ontologyTypePar, "OWL"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(
				Projects.Req.createNewProjectFromFileRequest,
				par(Projects.projectNamePar, "topolino"),
				par(Projects.baseuriPar, "http://topolino.it"),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.ontMgrConfigurationPar,
						Sesame2PersistentInMemoryModelConfiguration.class.getName()),
				par(Projects.ontologyTypePar, "OWL"), par(Projects.ontFilePar, "testInput/azienda.owl"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.listProjectsRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "pluto"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "pippo"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "topolino"));
		assertAffirmativeREPLY(resp);
	}

	/**
	 * check if it is possible to export and reimport a project
	 */
	@Test
	public void testImportExportProject() {

		Response

		resp = serviceTester.projectsService.makeRequest(
				Projects.Req.createNewProjectRequest,
				par(Projects.projectNamePar, "mario"),
				par(Projects.baseuriPar, "http://mario.it"),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.ontMgrConfigurationPar,
						Sesame2PersistentInMemoryModelConfiguration.class.getName()),
				par(Projects.ontologyTypePar, "OWL"));
		assertAffirmativeREPLY(resp);

		importSTExample();

		resp = serviceTester.projectsService.makeRequest(Projects.Req.exportProjectRequest,
				par(Projects.projectFilePar, "marietto.zip"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.importProjectRequest,
				par(Projects.projectFilePar, "marietto.zip")
		// par(Projects.projectNamePar, "salvo")
				);
		assertFailREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.importProjectRequest,
				par(Projects.projectFilePar, "marietto.zip"), par(Projects.projectNamePar, "salvo"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "salvo"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "mario"));
		assertAffirmativeREPLY(resp);
	}

	/**
	 * checks get/set ProjectProperty service
	 */
	@Test
	public void testGetSetProjectProperty() {

		Response

		resp = serviceTester.projectsService.makeRequest(
				Projects.Req.createNewProjectRequest,
				par(Projects.projectNamePar, "mario"),
				par(Projects.baseuriPar, "http://mario.it"),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.ontMgrConfigurationPar,
						Sesame2PersistentInMemoryModelConfiguration.class.getName()),
				par(Projects.ontologyTypePar, "OWL"));
		assertAffirmativeREPLY(resp);

		importSTExample();

		resp = serviceTester.projectsService.makeRequest(Projects.Req.getProjectPropertyRequest,
				par(Projects.propNamesPar, "name;defaultNamespace"));
		assertAffirmativeREPLY(resp);
		
		// this is a system property
		resp = serviceTester.projectsService.makeRequest(Projects.Req.setProjectPropertyRequest,
				par(Projects.propNamePar, "defaultNamespace"), 
				par(Projects.propValuePar, "value")
		);
		assertFailREPLY(resp);
		
		resp = serviceTester.projectsService.makeRequest(Projects.Req.setProjectPropertyRequest,
				par(Projects.propNamePar, "myProp"), 
				par(Projects.propValuePar, "myPropValue")
		);
		assertAffirmativeREPLY(resp);		
		
		resp = serviceTester.projectsService.makeRequest(Projects.Req.getProjectPropertyRequest,
				par(Projects.propNamesPar, "myProp"));
		assertAffirmativeREPLY(resp);
		
		System.out.println(resp);
		
		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "mario"));
		assertAffirmativeREPLY(resp);

	}
	

	/**
	 * checks creation, save and reopen of <em>saveToStore</em> projects
	 */
	@Test
	public void testCreateSaveToStoreProject() {

		Response

		resp = serviceTester.projectsService.makeRequest(
				Projects.Req.createNewProjectRequest,
				par(Projects.projectNamePar, "mario"),
				par(Projects.baseuriPar, "http://mario.it"),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.ontMgrConfigurationPar,
						Sesame2NonPersistentInMemoryModelConfiguration.class.getName()),
				par(Projects.ontologyTypePar, "OWL"));
		assertAffirmativeREPLY(resp);
		// assertResponseEXCEPTION(resp);

		System.out.println(ProjectManager.getCurrentProject());

		importSTExample();

		resp = serviceTester.projectsService.makeRequest(Projects.Req.saveProjectRequest);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.openProjectRequest,
				par(Projects.projectNamePar, "mario"));
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.closeProjectRequest);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.projectsService.makeRequest(Projects.Req.deleteProjectRequest,
				par(Projects.projectNamePar, "mario"));
		assertAffirmativeREPLY(resp);
	}


}
