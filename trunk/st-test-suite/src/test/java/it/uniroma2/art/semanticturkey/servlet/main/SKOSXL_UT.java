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
import it.uniroma2.art.semanticturkey.servlet.fixture.SKOSDataTestCases;
import it.uniroma2.art.semanticturkey.servlet.fixture.SKOSDataTestCases.SkosMode;
import it.uniroma2.art.semanticturkey.servlet.fixture.ServiceUTFixture;
import it.uniroma2.art.semanticturkey.servlet.fixture.TestInitializationFailed;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import java.io.IOException;

import org.junit.BeforeClass;
import org.junit.Test;

/**
 * @author Armando Stellato
 * 
 * test it after all SKOS Unit tests report to be working
 * 
 */
public class SKOSXL_UT extends ServiceUTFixture {

	@BeforeClass
	public static void init() throws IOException, STInitializationException, TestInitializationFailed {
		ServiceTest tester = new SKOSXL_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");
		startST("SKOS-XL", SKOSDataTestCases.AGROVOC.uri, SKOSDataTestCases.AGROVOC.defNS);
		SKOSDataTestCases.createSampleSKOSAGROVOCData(SkosMode.skosxl);
	}

	@Test
	public void testShowTree() {
		Response resp = serviceTester.skosXLService.makeRequest(SKOS.Req.showSKOSConceptsTreeRequest,
				par(SKOS.Par.scheme, SKOSDataTestCases.AGROVOC.scheme)
		);
		System.out.println(resp);
	}
	
	@Test
	public void testGetSetPrefLabel() {
		Response resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.getPrefLabelRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.langTag, "en")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.setPrefLabelRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.label, "mais"),				
				par(SKOS.Par.langTag, "it"),
				par(SKOSXL.Par.mode, "uri")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.getPrefLabelRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.langTag, "*")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
	}
	
	
	@Test
	public void testGetAltHiddenAllLabels() {

		Response resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.addAltLabelRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.label, "miele"),				
				par(SKOS.Par.langTag, "en"),
				par(SKOSXL.Par.mode, "uri")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.addAltLabelRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.label, "mealie"),				
				par(SKOS.Par.langTag, "en"),
				par(SKOSXL.Par.mode, "uri")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.addHiddenLabelRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.label, "maize"),				
				par(SKOS.Par.langTag, "en"),
				par(SKOSXL.Par.mode, "uri")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.setPrefLabelRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.label, "maize"),				
				par(SKOS.Par.langTag, "es"),
				par(SKOSXL.Par.mode, "uri")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.getAltLabelsRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.langTag, "*")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.getHiddenLabelsRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.langTag, "en")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.getLabelsRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.langTag, "en")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.skosXLService.makeRequest(SKOSXL.Req.getLabelsRequest,
				par(SKOS.Par.concept, "c_mais"),
				par(SKOS.Par.langTag, "*")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
	}

}
