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
import it.uniroma2.art.semanticturkey.servlet.main.InputOutput;
import it.uniroma2.art.semanticturkey.servlet.main.Metadata;

import java.io.IOException;

/**
 * @author Armando Stellato
 * 
 */
public class InputOutputTest extends SystemStartTest {

	String stxOntologyURI = "http://art.uniroma2.it/ontologies/st_example";
	
	
	public void doTest() {		
		
		super.doTest();
				
		Response resp = clsService.makeRequest(Cls.createClassRequest,
				par(Cls.newClassNamePar, "Persona"),
				par(Cls.superClassNamePar, "owl:Thing")
		);
		System.out.println(resp);				
		
		/*
		resp = metadataService.makeRequest(Metadata.addFromWebRequest,
				par(Metadata.baseuriPar, stxOntologyURI)
		);
		System.out.println(resp);
		*/
		
		resp = metadataService.makeRequest(Metadata.addFromWebToMirrorRequest,
				par(Metadata.baseuriPar, stxOntologyURI),
				par(Metadata.mirrorFilePar, "stx.owl")
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp);
		
		resp = inputOutputService.makeRequest(InputOutput.saveRDFRequest,
				par(InputOutput.filePar, "./testOutput/export.owl")
		);
		System.out.println(resp);
		
		
		resp = inputOutputService.makeRequest(InputOutput.clearDataRequest);
		System.out.println(resp);
		
		pause();
		
		super.doTest();
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp);
		
		/*
		resp = modifyNameService.makeRequest(ModifyName.renameRequest, par(ModifyName.Pars.oldName, "Person"),
				par(ModifyName.Pars.newName, "Personaggio")
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp);
		*/
		
		/*
		resp = deleteService.makeRequest(Delete.removeClassRequest,
				par("name", "Persona")
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp);
		*/
		
		/*
		 * askServer("cls", Cls.createClassRequest, "superClassName=owl:Thing", "newClassName=Person");
		 * 
		 * askServer("cls", Cls.getClassTreeRequest);
		 * 
		 * // non contiene request (pippo) perch� non la si richiede, quindi il parametro viene scartato //
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
			testType = "direct";
//			testType = "http";

		InputOutputTest test = new InputOutputTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();

	}

}
