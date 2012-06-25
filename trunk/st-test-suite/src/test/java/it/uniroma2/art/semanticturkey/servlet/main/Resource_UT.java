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
public class Resource_UT extends ServiceUTFixture {

	@BeforeClass
	public static void init() throws IOException, STInitializationException, TestInitializationFailed {
		ServiceTest tester = new Resource_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");
		startST();
		importSTExample();
		importTestOntologyFromLocalFile("http://ai-nlp.info.uniroma2.it/ontologies/heritage", "heritage.owl");
	}

	@Test
	public void testGetPropertyValues() {
		Response resp = serviceTester.resourceService.makeRequest(Resource.Req.getPropertyValuesRequest,
				par(Resource.Par.resource, "heritage:accomodation"),
				par(Resource.Par.property, "rdfs:label")
		);		
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.resourceService.makeRequest(Resource.Req.getPropertyValuesRequest,
				par(Resource.Par.resource, "heritage:VA_VillaImperialePeristilio"),
				par(Resource.Par.property, "geo:radius")
		);		
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		resp = serviceTester.resourceService.makeRequest(Resource.Req.getPropertyValuesRequest,
				par(Resource.Par.resource, "heritage:VA_VillaImperialePeristilio"),
				par(Resource.Par.property, "geo:geo_coord")
		);		
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
	}
	


}
