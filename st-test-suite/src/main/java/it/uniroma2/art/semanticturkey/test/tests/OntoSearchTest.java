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
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.main.Cls;
import it.uniroma2.art.semanticturkey.servlet.main.OntoSearch;

import java.io.IOException;

/**
 * @author Armando Stellato
 * 
 */
public class OntoSearchTest extends SystemStartTest {

	public void doTest() {

		super.doTest();

		importSTExample();

		Response
		
		resp = clsService.makeRequest(Cls.createInstanceRequest,
				par(Cls.instanceNamePar, "ArmandoStellato"),
				par(Cls.clsQNameField, "st_example:Person")
		);
		System.out.println(resp);

		resp = searchOntologyService.makeRequest(OntoSearch.searchOntologyRequest,
				par("inputString", "Person"),
				par("types", "clsNInd")
		);
		System.out.println(resp);
		
		resp = searchOntologyService.makeRequest(OntoSearch.searchOntologyRequest,
				par("inputString", "ArmandoStellato"),
				par("types", "clsNInd")
		);
		System.out.println(resp);
		
		
		resp = searchOntologyService.makeRequest(OntoSearch.searchOntologyRequest,
				par("inputString", "works"),
				par("types", "property")
		);
		System.out.println(resp);
	}

	public static void main(String[] args) throws ModelUpdateException, STInitializationException,
			IOException {

		String testType;

		if (args.length > 0)
			testType = args[0];
		else
			testType = "direct";
		// testType = "http";

		OntoSearchTest test = new OntoSearchTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();

	}

}
