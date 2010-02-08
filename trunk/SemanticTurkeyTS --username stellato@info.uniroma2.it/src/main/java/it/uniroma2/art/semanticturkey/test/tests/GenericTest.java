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
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.main.Cls;
import it.uniroma2.art.semanticturkey.servlet.main.SystemStart;
import it.uniroma2.art.semanticturkey.servlet.main.Property.Req;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import java.io.IOException;

/**
 * @author Armando Stellato
 * 
 */
public class GenericTest extends ServiceTest {

	public void doTest() {

		Response resp = systemStartService.makeRequest(SystemStart.startRequest);
		System.out.println(resp);
		
		resp = systemStartService.makeRequest(SystemStart.listTripleStoresRequest);
		System.out.println(resp);
				
		resp = systemStartService.makeRequest(SystemStart.startRequest,
				par(SystemStart.baseuriPar, "http://art.uniroma2.it/ontologies/myont")
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp);
		
		resp = propertyService.makeRequest(Req.getPropertiesTreeRequest);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.createClassRequest,
				par(Cls.newClassNamePar, "Person"),
				par(Cls.superClassNamePar, "owl:Thing")
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp);
		
		OWLModel ontModel = ProjectManager.getCurrentProject().getOntModel();
		ARTURIResource ont = ontModel.createURIResource("http://starred.it/mario");
		String ns = ont.getNamespace();
		System.err.println(ns);
		
		/*
		 * askServer("cls", Cls.createClassRequest, "superClassName=owl:Thing", "newClassName=Person");
		 * 
		 * askServer("cls", Cls.getClassTreeRequest);
		 * 
		 * // non contiene request (pippo) perchè non la si richiede, quindi il parametro viene scartato //
		 * askServer("service=cls&clsName=Person&instanceName=Armando"); askServer("cls",
		 * Cls.createInstanceRequest, "clsName=Person", "instanceName=Armando");
		 * 
		 * askServer("property", Property.getPropertiesTreeRequest);
		 * 
		 * askServer("metadata", Metadata.getNSPrefixMappingsRequest);
		 */

		// askServer("service=individual&request="+Individual.individualDescriptionRequest+"&request=listRepositories");
		/*
		 * askServer("service=property&request=getPropertiesTree");
		 * 
		 * askServer("service=cls");
		 * 
		 * askServer("service=metadata&request=get_nsprefixmappings");
		 * askServer("metadata","set_nsprefixmapping","prefix=pippo","ns=http://pippo.it");
		 * askServer("metadata","get_nsprefixmappings");
		 * 
		 * askServer("service=metadata&request=get_imports");
		 */
	}

	public static void main(String[] args) throws ModelUpdateException, STInitializationException,
			IOException {

		String testType;

		if (args.length > 0)
			testType = args[0];
		else
//			testType = "direct";
			testType = "http";

		GenericTest test = new GenericTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();

	}

}
