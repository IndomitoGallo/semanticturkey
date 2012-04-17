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
package it.uniroma2.art.semanticturkey.servlet.main;

import static it.uniroma2.art.semanticturkey.servlet.utils.AssertResponses.*;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.fixture.ServiceUTFixture;
import it.uniroma2.art.semanticturkey.servlet.fixture.TestInitializationFailed;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import java.io.IOException;

import org.junit.BeforeClass;
import org.junit.Test;

/**
 * @author Armando Stellato
 * 
 */
public class SKOS_UT extends ServiceUTFixture {

	@BeforeClass
	public static void init() throws IOException, STInitializationException, TestInitializationFailed {
		ServiceTest tester = new SKOS_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");
		startST("SKOS");
	}

	public static Response addConcept(String concept, String broaderConcept, String scheme, String prefLabel,
			String lang) {
		return serviceTester.skosService
				.makeRequest(SKOS.Req.createConceptRequest, par(SKOS.Par.concept, concept),
						par(SKOS.Par.broaderConcept, broaderConcept), par(SKOS.Par.scheme, scheme),
						par(SKOS.Par.prefLabel, prefLabel), par(SKOS.Par.langTag, lang));
	}

	public static void createSampleSKOSData() {
		addConcept("telecommunicationsTools", null, "mainScheme", "strumenti per le telecomunicazioni", "it");
		addConcept("smartphones", "telecommunicationsTools", "mainScheme", "Smart Phones", "it");
		addConcept("informationStorageTools", null, "mainScheme",
				"sistemi per la memorizzazione di informazione", "it");
		addConcept("DatabaseSystems", "informationStorageTools", "mainScheme", "sistemi per basi di dati",
				"it");
		addConcept("TripleStores", null, "mainScheme", "sistemi per memorizzazione di triple", "it");
	}

	@Test
	public void testCreateScheme() {
		Response resp = serviceTester.skosService.makeRequest(SKOS.Req.createSchemeRequest,
				par(SKOS.Par.scheme, "mainScheme"));
		System.out.println(resp);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.skosService.makeRequest(SKOS.Req.createSchemeRequest,
				par(SKOS.Par.scheme, "anotherScheme"));
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
	}

	@Test
	public void createConceptTest() {

		createSampleSKOSData();

		Response resp = addConcept("DBBasedTripleStores", null, "mainScheme", "TripleStores basati su DB",
				"it");
		assertAffirmativeREPLY(resp);

		resp = serviceTester.skosService.makeRequest(SKOS.Req.createConceptRequest,
				par(SKOS.Par.concept, "DatabaseSystems"),
				par(SKOS.Par.broaderConcept, "informationStorageTools"), par(SKOS.Par.scheme, "mainScheme"),
				par(SKOS.Par.prefLabel, "sistemi per basi di dati"), par(SKOS.Par.langTag, "it"));

		assertResponseEXCEPTION(resp); // concept with same name has already been created

		System.out.println(resp);
		resp = serviceTester.skosService.makeRequest(SKOS.Req.showSKOSConceptsTreeRequest,
				par(SKOS.Par.scheme, "mainScheme"));
		System.out.println(resp);

		assertAffirmativeREPLY(resp);

	}

	@Test
	public void testAddBroader() {

		Response resp = serviceTester.skosService.makeRequest(SKOS.Req.addBroaderConceptRequest,
				par(SKOS.Par.concept, "TripleStores"),
				par(SKOS.Par.broaderConcept, "informationStorageTools"));

		assertAffirmativeREPLY(resp);

		resp = serviceTester.statementService.makeRequest(Statement.Req.getStatementsRequest,
				par(Statement.Par.subjectPar, "any"), par(Statement.Par.predicatePar, "any"),
				par(Statement.Par.objectPar, "any"), par(Statement.Par.inferencePar, "false"),
				par(Statement.Par.graphsPar, Statement.mainGraphValue));

		System.out.println(resp);

		// assertContains(resp+"\ndoes not contain pippo",
		// StatementParse.parseStatements((ResponseREPLY)resp),
		// "stat(st_example:worksIn,rdf:type,owl:ObjectProperty)" );

		resp = serviceTester.skosService.makeRequest(SKOS.Req.showSKOSConceptsTreeRequest,
				par(SKOS.Par.scheme, "mainScheme"));
		System.out.println(resp);

	}

	@Test
	public void testDeleteConcept() {
		Response resp = serviceTester.skosService.makeRequest(SKOS.Req.deleteConceptRequest,
				par(SKOS.Par.concept, "TripleStores"));

		assertAffirmativeREPLY(resp);

		System.out.println(resp);
		resp = serviceTester.skosService.makeRequest(SKOS.Req.showSKOSConceptsTreeRequest,
				par(SKOS.Par.scheme, "mainScheme"));
		System.out.println(resp);
	}

	@Test
	public void testGetTopConceptsInScheme() {
		Response resp = serviceTester.skosService.makeRequest(SKOS.Req.getTopConceptsRequest,
				par(SKOS.Par.scheme, "mainScheme"));

		assertAffirmativeREPLY(resp);
		System.out.println(resp);
	}

	@Test
	public void testGetTopConcepts() {
		Response resp = serviceTester.skosService.makeRequest(SKOS.Req.getTopConceptsRequest);

		assertAffirmativeREPLY(resp);
		System.out.println(resp);
	}

	@Test
	public void getSKOSSchemeDescriptionTest() {
		Response resp = serviceTester.skosService.makeRequest(SKOS.conceptSchemeDescriptionRequest,
				par(SKOS.Par.scheme, "mainScheme"), par("method", SKOS.templateandvalued));
		assertAffirmativeREPLY(resp);
		System.out.println(resp);
	}

	@Test
	public void getConceptDescriptionTest() {
		Response resp = serviceTester.skosService.makeRequest(SKOS.conceptDescriptionRequest,
				par(SKOS.Par.concept, "DatabaseSystems"), par("method", SKOS.templateandvalued));
		assertAffirmativeREPLY(resp);
		System.out.println(resp);
	}

	@Test
	public void getNarrowerConceptsTest() {
		Response resp = serviceTester.skosService.makeRequest(SKOS.Req.getNarrowerConceptsRequest,
				par(SKOS.Par.concept, "telecommunicationsTools"));
		System.out.println(resp);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.skosService.makeRequest(SKOS.Req.getNarrowerConceptsRequest,
				par(SKOS.Par.concept, "telecommunicationsTools"), par(SKOS.Par.scheme, "anotherScheme"));
		System.out.println(resp);
		assertAffirmativeREPLY(resp);

		resp = serviceTester.skosService.makeRequest(SKOS.Req.getNarrowerConceptsRequest,
				par(SKOS.Par.concept, "telecommunicationsTools"), par(SKOS.Par.scheme, "whichScheme?"));
		System.out.println(resp);
		assertResponseEXCEPTION(resp);
	}

	@Test
	public void getSchemesMatrixPerConceptTest() {
		Response resp = serviceTester.skosService.makeRequest(SKOS.Req.getSchemesMatrixPerConceptRequest,
				par(SKOS.Par.concept, "telecommunicationsTools"), par(SKOS.Par.langTag, "en"));
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
	}

}
