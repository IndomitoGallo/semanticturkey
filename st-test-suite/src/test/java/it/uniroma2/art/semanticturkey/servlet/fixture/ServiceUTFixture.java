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
 * The Original Code is SemanticTurkeyTS.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2009.
 * All Rights Reserved.
 *
 * SemanticTurkeyTS was developed by the Artificial Intelligence Research Group
 * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about SemanticTurkeyTS can be obtained at 
 * http//ai-nlp.info.uniroma2.it/software/...
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.servlet.fixture;

import it.uniroma2.art.owlart.sesame2impl.models.conf.Sesame2PersistentInMemoryModelConfiguration;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl;
import it.uniroma2.art.semanticturkey.project.ProjectManager.ProjectType;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.main.Metadata;
import it.uniroma2.art.semanticturkey.servlet.main.Projects;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import java.io.IOException;

import org.w3c.dom.Element;

public class ServiceUTFixture extends ServiceTest {

	public static ServiceTest serviceTester;

	/**
	 * create a <code>@BeforeClass</code> in your unit-test class which invokes this method on an instance of
	 * its own (this could be done because the specific class could add some custom initialization)
	 * 
	 * @param testInst
	 * @param delete
	 *            if true, deletes previously left working files
	 * @throws IOException
	 * @throws STInitializationException
	 */
	public static void initWholeTestClass(ServiceTest testInst, String STDirectoryRelPath, boolean delete)
			throws IOException, STInitializationException {
		serviceTester = testInst;
		serviceTester.initialize(STDirectoryRelPath, delete);
	}

	/**
	 * as for {@link #initWholeTestClass(ServiceTest, boolean)} with second argument (delete) =
	 * <code>true</code>
	 * 
	 * @param testInst
	 * @throws IOException
	 * @throws STInitializationException
	 */
	public static void initWholeTestClass(ServiceTest testInst) throws IOException, STInitializationException {
		initWholeTestClass(testInst, "..", true);
	}

	public static void initWholeTestClass(ServiceTest testInst, String STDirectoryRelPath)
			throws IOException, STInitializationException {
		initWholeTestClass(testInst, STDirectoryRelPath, true);
	}

	/**
	 * starts ST with an empty OWL project, of baseuri: http://art.uniroma2.it/ontologies/myont
	 * 
	 * @throws TestInitializationFailed
	 */
	public static void startST() throws TestInitializationFailed {
		startST("OWL");
	}

	/**
	 * starts ST with an empty project of type <code>modelType</code>, called <em>testProject</em>, using
	 * <code>http://art.uniroma2.it/ontologies/myont</code> as its baseuri
	 * 
	 * @param modelType
	 * @throws TestInitializationFailed
	 */
	public static void startST(String modelType) throws TestInitializationFailed {
		startST(modelType, "http://art.uniroma2.it/ontologies/myont");
	}

	/**
	 * starts ST with a new empty project of type <code>modelType</code>, called <em>testProject</em>, using
	 * argument <code>baseuri</code> as its baseuri
	 * 
	 * @param modelType
	 * @param baseuri
	 * @throws TestInitializationFailed
	 */
	public static void startST(String modelType, String baseuri) throws TestInitializationFailed {

		Response resp = serviceTester.projectsService.makeRequest(
				Projects.Req.createNewProjectRequest,
				par(Projects.projectNamePar, "testProject"),
				par(Projects.baseuriPar, baseuri),
				par(Projects.ontmanagerPar, OntologyManagerFactorySesame2Impl.class.getName()),
				par(Projects.projectTypePar, ProjectType.continuosEditing.toString()),
				par(Projects.ontMgrConfigurationPar,
						Sesame2PersistentInMemoryModelConfiguration.class.getName()),
				par(Projects.ontologyTypePar, modelType));

		System.out.println(resp);

		if (!resp.isAffirmative())
			throw new TestInitializationFailed();

	}

	/**
	 * as for {@link #startST(String, String)}, but the default namespace can be set differently from just
	 * <code>baseuri + "#"</code>
	 * 
	 * @param modelType
	 * @param baseuri
	 * @param defaultNamespace
	 * @throws TestInitializationFailed
	 */
	public static void startST(String modelType, String baseuri, String defaultNamespace)
			throws TestInitializationFailed {
		startST(modelType, baseuri);

		Response resp = serviceTester.metadataService.makeRequest(Metadata.setDefaultNamespaceRequest,
				par(Metadata.namespacePar, defaultNamespace));
		System.out.println(resp);
	}

	/**
	 * imports a specified ontology file from the default input folder: "testInput" in this working directory
	 * 
	 * @param stxOntologyURI
	 *            the baseuri of the imported ontology
	 * @param ontFileName
	 *            the local file (inside the test input folder) where this ontology is defined
	 */
	public static void importTestOntologyFromLocalFile(String stxOntologyURI, String ontFileName) {

		Response resp = serviceTester.metadataService.makeRequest(Metadata.addFromLocalFileRequest,
				par(Metadata.baseuriPar, stxOntologyURI),
				par(Metadata.localFilePathPar, "testInput/" + ontFileName),
				par(Metadata.mirrorFilePar, ontFileName));
		System.out.println(resp);

		resp = serviceTester.metadataService.makeRequest(Metadata.getNSPrefixMappingsRequest);
		System.out.println(resp);
	}

	/**
	 * as for {@link #importTestOntologyFromLocalFile(String, String)} on the st_example.owl ontology
	 */
	public static void importSTExample() {
		importTestOntologyFromLocalFile("http://art.uniroma2.it/ontologies/st_example", "st_example.owl");
	}

	/**
	 * accesses the dataElement in a Response and retrieves the first element of name <code>elemName</code>
	 * 
	 * @param resp
	 * @param elemName
	 * @return
	 */
	public static Element getFirstElement(Response resp, String elemName) {
		return (Element) ((XMLResponseREPLY) resp).getDataElement().getElementsByTagName(elemName).item(0);
	}

}
