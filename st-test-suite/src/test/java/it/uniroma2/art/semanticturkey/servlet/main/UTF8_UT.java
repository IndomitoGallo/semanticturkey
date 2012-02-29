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
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
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
public class UTF8_UT extends ServiceUTFixture {

	public static final String annotatedPageURL = "http://www.papyri.info/idp_static/current/data/ddb/html/bgu/bgu.4/bgu.4.1202.html";
	public static final String annotatedPageTitle = "Greek Leiden";

	@BeforeClass
	public static void init() throws IOException, STInitializationException, TestInitializationFailed {
		ServiceTest tester = new UTF8_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");
		startST();
		importSTExample();
	}

	/**
	 * test behavior of the server against an UTF8 annotation (containing greek characters)
	 */
	@Test
	public void tryAnnotationTest() {

		Response resp = serviceTester.annotationService.makeRequest(Annotation.createAndAnnotateRequest, par(
				Annotation.clsQNameField, "st_example:Person"), par(Annotation.instanceQNameField,
				"τοπογραμματεὺς"), par(Annotation.urlPageString, annotatedPageURL), par(
				Annotation.titleString, annotatedPageTitle));
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
	}

	/**
	 * test behavior of the server against an UTF8 annotation (containing greek characters)
	 */
	@Test
	public void tryAddAnnotationTest() {
		Response resp = serviceTester.annotationService.makeRequest(Annotation.addAnnotationRequest, par(
				Annotation.textString, "Αὐνῆς"), par(Annotation.instanceQNameField, "greekWord"), par(
				Annotation.urlPageString, annotatedPageURL), par(Annotation.titleString, annotatedPageTitle));
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
	}

	/**
	 * test behavior of the server against an UTF8 annotation (containing greek characters)
	 */
	@Test
	public void getBookmarksTest() {

		Response resp = serviceTester.pageService.makeRequest(Page.getBookmarksRequest, par(
				Page.instanceNameString, "greekWord"));
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
		// pause();
	}

	/**
	 * check System Properties
	 */
	@Test
	public void getSystemProperties() {

		Response resp = serviceTester.environmentService.makeRequest(Environment.systemPropertiesRequest);
		System.out.println(resp);
		assertAffirmativeREPLY(resp);
	}

}
