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

import static it.uniroma2.art.semanticturkey.servlet.utils.AssertResponses.assertResponseREPLY;
import static org.junit.Assert.*;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.vocabulary.OWL;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.ontology.STOntologyManager;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.fixture.ServiceUTFixture;
import it.uniroma2.art.semanticturkey.servlet.fixture.TestInitializationFailed;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.IOException;

import org.junit.BeforeClass;
import org.junit.Test;
import org.w3c.dom.Element;

/**
 * @author Armando Stellato
 * 
 */
public class Metadata_UT extends ServiceUTFixture {

	@BeforeClass
	public static void init() throws IOException, STInitializationException, TestInitializationFailed {
		ServiceTest tester = new Metadata_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");
		startST();
		importSTExample();
	}

	/**
	 * just checks the the response is a REPLY
	 */
	@Test
	public void getNamedGraphTest() {
		Response resp = serviceTester.metadataService.makeRequest(Metadata.getNamedGraphsRequest);
		assertResponseREPLY(resp);
	}

	/**
	 * just checks the the response is a REPLY
	 */
	@Test
	public void getOntologyDescription() {
		Response resp = serviceTester.metadataService.makeRequest(Metadata.ontologyDescriptionRequest);
		System.out.println(resp);
		assertResponseREPLY(resp);
	}

	@Test
	public void importFromWebWithSlightlyWrongURITest() {
		// real declared URI of the ontology is http://usefulinc.com/ns/doap#, so including the Hash
		String uriMissingTrailingHash = "http://usefulinc.com/ns/doap";
		String correctURI = uriMissingTrailingHash + "#";

		Response resp = serviceTester.metadataService.makeRequest(Metadata.addFromWebRequest,
				par(Metadata.baseuriPar, uriMissingTrailingHash));
		assertResponseREPLY(resp);

		// httpRequest: service=metadata&request=getImports| async:false parameters: undefined port: 1979

		resp = serviceTester.metadataService.makeRequest(Metadata.getImportsRequest);

		assertResponseREPLY(resp);

		STOntologyManager<? extends RDFModel> repMgr = ProjectManager.getCurrentProject()
				.getOntologyManager();
		RDFModel ontModel = repMgr.getOntModel();
		try {
			ARTStatementIterator it = ontModel.listStatements(NodeFilters.ANY, RDF.Res.TYPE, OWL.Res.ONTOLOGY, false, NodeFilters.ANY);
			while (it.streamOpen()) {
				System.out.println(it.getNext());
			}
			
		} catch (ModelAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		Element dataElement = ((XMLResponseREPLY) resp).getDataElement();

		assertFalse(uriMissingTrailingHash
				+ " should be missing from the import list and replaced with the correct " + correctURI,
				XMLHelp.hasChildWithAttributeValue(dataElement, "uri", uriMissingTrailingHash));

		assertTrue(correctURI + " should appear in the import list, replacing the wrong uri without the hash",
				XMLHelp.hasChildWithAttributeValue(dataElement, "uri", correctURI));

	}
	
	
	@Test
	public void importFromWebWithCompletelyWrongURITest() {
		// real declared URI of the ontology is http://usefulinc.com/ns/doap#, so including the Hash
		
		//String wrongURI = "http://art.uniroma2.it/ontologies/heritage";
		//String correctURI = "http://ai-nlp.info.uniroma2.it/ontologies/heritage";
		
		 String wrongURI = "http://purl.org/vocommons/voaf#";  // used only in a test, need to reenable heritage
		 String correctURI = "http://purl.org/vocommons/voaf";
		
		Response resp = serviceTester.metadataService.makeRequest(Metadata.addFromWebRequest,
				par(Metadata.baseuriPar, wrongURI));
		assertResponseREPLY(resp);

		// httpRequest: service=metadata&request=getImports| async:false parameters: undefined port: 1979

		resp = serviceTester.metadataService.makeRequest(Metadata.getImportsRequest);

		assertResponseREPLY(resp);

		Element dataElement = ((XMLResponseREPLY) resp).getDataElement();

		assertFalse(wrongURI
				+ " should be missing from the import list and replaced with the correct: " + correctURI,
				XMLHelp.hasChildWithAttributeValue(dataElement, "uri", wrongURI));

		assertTrue(correctURI + " should appear in the import list, replacing the wrong uri: " + wrongURI,
				XMLHelp.hasChildWithAttributeValue(dataElement, "uri", correctURI));

	}
}
