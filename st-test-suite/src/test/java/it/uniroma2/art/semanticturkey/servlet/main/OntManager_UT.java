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

import static it.uniroma2.art.semanticturkey.servlet.utils.AssertResponses.assertAffirmativeREPLY;
import it.uniroma2.art.owlart.models.conf.ModelConfiguration;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.ontology.OntologyManagerFactory;
import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.fixture.ServiceUTFixture;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import java.io.IOException;

import org.junit.BeforeClass;
import org.junit.Test;

/**
 * @author Armando Stellato
 * 
 */
public class OntManager_UT extends ServiceUTFixture {

	@BeforeClass
	public static void init() throws IOException, STInitializationException {
		ServiceTest tester = new Project_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");

	}

	@SuppressWarnings("unchecked")
	@Test
	public void testGetOntologyManagerParameters() throws ClassNotFoundException {
		
		Class<? extends OntologyManagerFactory<ModelConfiguration>> cls = getOntologyManagerClass();
		
		//PluginManager.setTestOntManagerFactoryImpl((Class<? extends OntologyManagerFactory<ModelConfiguration>>)OntologyManagerFactoryAllegroGraphImpl.class);
		PluginManager.setTestOntManagerFactoryImpl((Class<? extends OntologyManagerFactory<ModelConfiguration>>)Class.forName("OntologyManagerFactoryAllegroGraphImpl.class"));
		
		Response resp = serviceTester.ontManagerService.makeRequest(
				OntManager.getOntManagerParametersRequest,
				par(OntManager.ontMgrIDField, PluginManager.getOntManagerImplIDs().get(0))
		);
		assertAffirmativeREPLY(resp);
		System.out.println(resp);
		
		PluginManager.setTestOntManagerFactoryImpl(cls);
		
		resp = serviceTester.ontManagerService.makeRequest(
				OntManager.getOntManagerParametersRequest,
				par(OntManager.ontMgrIDField, PluginManager.getOntManagerImplIDs().get(0))
		);
		assertAffirmativeREPLY(resp);
		System.out.println(resp);
	}

}
