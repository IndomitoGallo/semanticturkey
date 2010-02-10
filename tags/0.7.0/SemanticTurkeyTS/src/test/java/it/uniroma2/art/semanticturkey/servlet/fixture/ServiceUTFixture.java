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
  * The Original Code is SemanticTurkeyTS.
  *
  * The Initial Developer of the Original Code is University of Roma Tor Vergata.
  * Portions created by University of Roma Tor Vergata are Copyright (C) 2009.
  * All Rights Reserved.
  *
  * SemanticTurkeyTS was developed by the Artificial Intelligence Research Group
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about SemanticTurkeyTS can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

  /*
   * Contributor(s): Armando Stellato stellato@info.uniroma2.it
  */
package it.uniroma2.art.semanticturkey.servlet.fixture;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.main.Metadata;
import it.uniroma2.art.semanticturkey.servlet.main.SystemStart;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

public class ServiceUTFixture extends ServiceTest {

	public static ServiceTest serviceTester;

	/**
	 * create a <code>@BeforeClass</code> in your unit-test class which invokes this method on an instance of
	 * the its same class (this could be done because the specific class could add some custom initialization)
	 * 
	 * @param testInst
	 * @param delete if true, deletes previously left working files
	 * @throws IOException
	 * @throws STInitializationException
	 */
	public static void initWholeTestClass(ServiceTest testInst, boolean delete) throws IOException, STInitializationException {
		serviceTester = testInst;
		String sConfigFile = "testMod.properties";
		InputStream in = ClassLoader.getSystemClassLoader().getResourceAsStream(sConfigFile);
		Properties props = new java.util.Properties();
		props.load(in);		
		if (delete)
			serviceTester.deleteWorkingFiles();
		serviceTester.initialize(props.getProperty("access"));
	}
	
	/**
	 * as for {@link #initWholeTestClass(ServiceTest, boolean)} with second argument (delete) = <code>true</code>
	 * 
	 * @param testInst
	 * @throws IOException
	 * @throws STInitializationException
	 */
	public static void initWholeTestClass(ServiceTest testInst) throws IOException, STInitializationException {
		initWholeTestClass(testInst, true);
	}
	
	public static void startST() {

		Response resp = serviceTester.systemStartService.makeRequest(SystemStart.startRequest, par(SystemStart.baseuriPar,
				"http://art.uniroma2.it/ontologies/myont"));
		System.out.println(resp);
	}

	public static void importSTExample() {
		String stxOntologyURI = "http://art.uniroma2.it/ontologies/st_example";

		Response resp = serviceTester.metadataService.makeRequest(Metadata.addFromLocalFileRequest,
				par(Metadata.baseuriPar, stxOntologyURI),
				par(Metadata.localFilePathPar, "testInput/st_example.owl"),
				par(Metadata.mirrorFilePar, "st_example.owl")
		);
		System.out.println(resp);

		resp = serviceTester.metadataService.makeRequest(Metadata.getNSPrefixMappingsRequest);
		System.out.println(resp);
	}
	

}