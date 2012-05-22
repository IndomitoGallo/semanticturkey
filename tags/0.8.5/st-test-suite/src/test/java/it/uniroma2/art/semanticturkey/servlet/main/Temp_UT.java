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
import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.OWLReasoner;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
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
public class Temp_UT extends ServiceUTFixture {

	@BeforeClass
	public static void init() throws IOException, STInitializationException, TestInitializationFailed {
		ServiceTest tester = new Temp_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");
		startST();
		importSTExample();
	}


	@Test
	public void addInstanceRemoveTypeWhenOnlyOne() {
		Response resp = serviceTester.clsService.makeRequest(Cls.createInstanceRequest,
				par(Cls.clsQNameField, "st_example:Person"),
				par(Cls.instanceNamePar, "Armando")
		);
		assertAffirmativeREPLY(resp);
		System.out.println(resp);
		
		
		resp = serviceTester.individualService.makeRequest(Individual.removeTypeRequest,
				par(Individual.typeqnameField, "st_example:Person"),
				par(Individual.indqnameField, "Armando")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		
		
		resp = serviceTester.clsService.makeRequest(Cls.getClassesInfoAsRootsForTreeRequest,
				par(Cls.clsesQNamesPar, "owl:Thing"),
				par(Cls.instNumPar, "true")
		);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
				
		RDFModel model = ProjectManager.getCurrentProject().getOntModel();
		if (!(model instanceof OWLModel)) {
			System.out.println("no owl");
		} else {
			if (!(model instanceof OWLReasoner)) 
				System.out.println("owlmodel but no owlreasoner!");
		}

		
		ARTResourceIterator it = null;
		try {
			ARTURIResource armando = model.createURIResource(model.expandQName("Armando"));
			
			it = ((OWLModel)model).listTypes(armando, true, NodeFilters.MAINGRAPH);
			while (it.streamOpen()) {
				System.out.println(it.getNext());
			}
			it.close();
			
			ARTStatementIterator it2 = ((OWLModel)model).listStatements(armando, NodeFilters.ANY, NodeFilters.ANY, true);
			while (it2.streamOpen()) {
				System.out.println(it2.getNext());
			}
		} catch (ModelAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		try {
			while (it.streamOpen()) {
				System.out.println(it.getNext());
			}
		} catch (ModelAccessException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}	

	
	
}
