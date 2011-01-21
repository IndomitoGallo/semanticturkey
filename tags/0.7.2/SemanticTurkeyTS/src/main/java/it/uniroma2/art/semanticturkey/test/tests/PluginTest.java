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
import it.uniroma2.art.semanticturkey.servlet.main.Plugins;
import it.uniroma2.art.semanticturkey.servlet.main.Projects;
import it.uniroma2.art.semanticturkey.test.servicewrappers.PluginHttpWrapper;
import it.uniroma2.art.semanticturkey.test.servicewrappers.PluginWrapper;
import it.uniroma2.art.semanticturkey.test.servicewrappers.ServiceHttpWrapper;
import it.uniroma2.art.semanticturkey.test.servicewrappers.ServiceWrapper;

import java.io.IOException;

/**
 * @author Armando Stellato
 * 
 */
public class PluginTest extends SystemStartTest {

	
	protected PluginWrapper fakePluginA; 
	protected ServiceWrapper fakeServiceOneA;
	protected PluginWrapper fakePluginB; 
	protected ServiceWrapper fakeServiceOneB;

	@Override
	protected void initializeServiceDirectWrappers() {
		super.initializeServiceDirectWrappers();
		
	}
	
	@Override
	protected void initializeServiceHttpWrappers() {
		super.initializeServiceHttpWrappers();
		fakePluginA = new PluginHttpWrapper("it.uniroma2.art.fakePluginA", httpclient);		
		fakeServiceOneA = new ServiceHttpWrapper("fakeServiceOneA", httpclient);
		
		fakePluginB = new PluginHttpWrapper("it.uniroma2.art.fakePluginB", httpclient);		
		fakeServiceOneB = new ServiceHttpWrapper("fakeServiceOneB", httpclient);
	}
	
	public void doTest() {

		super.doTest();
		
		Response resp = fakePluginA.init();
		System.out.println(resp);
		
		resp = fakeServiceOneA.makeRequest("getPluginStatus");
		System.out.println(resp);
				
		resp = fakePluginB.init();
		System.out.println(resp);
		
		resp = fakeServiceOneB.makeRequest("getPluginStatus");
		System.out.println(resp);
		
		resp = fakePluginA.dispose();
		System.out.println(resp);

		resp = fakeServiceOneA.makeRequest("getPluginStatus");
		System.out.println(resp);
		
		resp = pluginsService.makeRequest(Plugins.Req.getPluginListRequest);
		System.out.println(resp);
		
		resp = projectsService.makeRequest(Projects.Req.closeProjectRequest);
		System.out.println(resp);
		
		resp = projectsService.makeRequest(Projects.Req.openMainProjectRequest);
		System.out.println(resp);
		
		resp = pluginsService.makeRequest(Plugins.Req.getPluginsForProjectRequest);
	}

	public static void main(String[] args) throws ModelUpdateException, STInitializationException,
			IOException {
		String testType;

		if (args.length > 0)
			testType = args[0];
		else
//			testType = "direct";
			testType = "http";

		PluginTest test = new PluginTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();

	}

}
