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
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.main.Cls;
import it.uniroma2.art.semanticturkey.servlet.main.Property;
import it.uniroma2.art.semanticturkey.servlet.main.Resource;
import it.uniroma2.art.semanticturkey.servlet.main.Property.Par;
import it.uniroma2.art.semanticturkey.servlet.main.Property.Req;

import java.io.IOException;

/**
 * @author Armando Stellato
 * 
 */
public class PropertyTest extends SystemStartTest {

	public void doTest() {
		
		super.doTest();
		
		importSTExample();
		
		Response 
		
		resp = clsService.makeRequest(Cls.createClassRequest,
				par(Cls.newClassNamePar, "Man"),
				par(Cls.superClassNamePar, "st_example:Person")
		);
		System.out.println(resp);	
		
		resp = propertyService.makeRequest(Req.addPropertyDomainRequest,
				par(Par.propertyQNamePar, "st_example:husband"),
				par(Par.domainPropertyQNamePar, "Man")
		);
		System.out.println(resp);
		
		resp = propertyService.makeRequest(Resource.propertyDescriptionRequest,
				par(Par.propertyQNamePar, "st_example:husband")
		);
		System.out.println(resp);	

		resp = propertyService.makeRequest(Resource.propertyDescriptionRequest,
				par(Par.propertyQNamePar, "st_example:worksIn")
		);
		System.out.println(resp);	

		resp = propertyService.makeRequest(Property.Req.createAndAddPropValueRequest, 
				par(Property.Par.instanceQNamePar, "Man"),
				par(Property.Par.propertyQNamePar, "rdfs:comment"),
				par(Property.Par.valueField, "pluto"),
				par(Property.Par.type, "literal"),
				par(Property.Par.langField, "en")
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Resource.classDescriptionRequest,
				par(Cls.clsQNameField, "Man"),
				par("method", Cls.templateandvalued)
		);
		System.out.println(resp);
		
	/*	
		resp = propertyService.makeRequest(Property.getPropertiesTreeRequest);
		System.out.println(resp);
		*/

	}

	public static void main(String[] args) throws ModelUpdateException, STInitializationException,
			IOException {

		String testType;

		if (args.length > 0)
			testType = args[0];
		else
			testType = "direct";
//			testType = "http";

		PropertyTest test = new PropertyTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();

	}

}
