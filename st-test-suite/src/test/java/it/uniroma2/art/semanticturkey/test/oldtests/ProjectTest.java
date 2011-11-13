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
package it.uniroma2.art.semanticturkey.test.oldtests;

import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl;
import it.uniroma2.art.semanticturkey.project.ProjectManager.ProjectType;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.main.Projects;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import java.io.IOException;

/**
 * @author Armando Stellato
 * 
 */
public class ProjectTest extends ServiceTest {

	public void doTest() {

		Response resp = projectsService.makeRequest(Projects.Req.createNewProjectRequest, par(
				Projects.projectNamePar, "mario"), par(Projects.baseuriPar, "http://mario.it"), par(
				Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()), par(
				Projects.projectTypePar, ProjectType.continuosEditing.toString()));
		System.out.println(resp);

		resp = projectsService.makeRequest(Projects.Req.closeProjectRequest);
		System.out.println(resp);

		resp = projectsService.makeRequest(Projects.Req.openProjectRequest, par(Projects.projectNamePar,
				"mario"));
		System.out.println(resp);

		resp = projectsService.makeRequest(Projects.Req.closeProjectRequest);
		System.out.println(resp);

		resp = projectsService.makeRequest(Projects.Req.deleteProjectRequest, par(Projects.projectNamePar,
				"mario"));
		System.out.println(resp);

		resp = projectsService.makeRequest(Projects.Req.createNewProjectFromFileRequest, par(
				Projects.projectNamePar, "pippo"), par(Projects.baseuriPar, "http://mario.it"), par(
				Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()), par(
				Projects.projectTypePar, ProjectType.continuosEditing.toString()), par(Projects.ontFilePar,
				"azienda.owl"));
		System.out.println(resp);

		resp = projectsService.makeRequest(Projects.Req.saveProjectAsRequest, par(Projects.projectNamePar,
				"pippo"), par(Projects.newProjectNamePar, "salvo"));
		System.out.println(resp);
		// resp = projectsService.makeRequest(Projects.exportProjectRequest, par(Projects.projectFilePar,
		// "azienda.stp"));

		/*
		 * Response resp = projectsService.newEmptyProject("mario", "http://mario.it",
		 * "it.uniroma2.art.semanticturkey.ontology.sesame2.STOntologyManagerSesame2Impl",
		 * ProjectType.continuosEditing.toString()); System.out.println(resp);
		 * 
		 * resp = projectsService.newProjectFromFile("pippo", "http://pippo.it",
		 * "it.uniroma2.art.semanticturkey.ontology.sesame2.STOntologyManagerSesame2Impl",
		 * ProjectType.continuosEditing.toString(), "azienda.owl"); System.out.println(resp);
		 */
	}

	public static void main(String[] args) throws ModelUpdateException, STInitializationException,
			IOException {

		String testType;

		if (args.length > 0)
			testType = args[0];
		else
			// testType = "direct";
			testType = "http";

		ProjectTest test = new ProjectTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();
	}

}
