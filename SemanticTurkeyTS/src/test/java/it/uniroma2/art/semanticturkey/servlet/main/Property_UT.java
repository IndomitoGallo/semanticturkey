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
import static org.junit.Assert.*;
import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.owlart.vocabulary.RDFTypesEnum;
import it.uniroma2.art.owlart.vocabulary.RDFResourceRolesEnum;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.fixture.ServiceUTFixture;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import java.io.IOException;

import org.junit.BeforeClass;
import org.junit.Test;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;



/**
 * @author Armando Stellato
 * 
 */
public class Property_UT extends ServiceUTFixture {

	/**
	 * accesses the dataElement in a Response and retrieves the first element of name <code>elemName</code>
	 * 
	 * @param resp
	 * @param elemName
	 * @return
	 */
	public static Element getFirstElement(Response resp, String elemName) {
		return (Element) ((XMLResponseREPLY) resp).getDataElement().getElementsByTagName(elemName)
		.item(0);
	}
	
	public static Element getRangesElement(Response resp) {
		return getFirstElement(resp, "ranges");
	}

	
	
	@BeforeClass
	public static void init() throws IOException, STInitializationException {
		ServiceTest tester = new Property_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");
		startST();
		importSTExample();
		importTestOntologyFromLocalFile("http://art.info.uniroma2.it/ontologies/propertyRanges",
				"propertyRanges.owl");
	}

	@Test
	public void getDataRangedPropertyDescriptionTest() {
		Response resp = serviceTester.propertyService.makeRequest(Property.propertyDescriptionRequest, par(
				Property.Par.propertyQNamePar, "propertyRanges:dataRangedProperty"));
		assertAffirmativeREPLY(resp);

		System.out.println("resp for: getDataRangedPropertyDescriptionTest\n" + resp);

		Element ranges = getRangesElement(resp);
		String rngType = ranges.getAttribute("rngType");
		assertEquals(RDFTypesEnum.literal.toString(), rngType);

		Element bnode = getFirstElement(resp, "bnode");
		String role = bnode.getAttribute("role");
		assertEquals(RDFResourceRolesEnum.dataRange.toString(), role);
	}

	@Test
	public void getEmptyRangePropertyDescriptionTest() {

		Response resp = serviceTester.propertyService.makeRequest(Property.propertyDescriptionRequest, par(
				Property.Par.propertyQNamePar, "propertyRanges:emptyRangeDatatypeProperty"));
		assertAffirmativeREPLY(resp);

		System.out.println("resp for: getEmptyRangePropertyDescriptionTest\n" + resp);

		Element ranges = getRangesElement(resp);
		String rngType = ranges.getAttribute("rngType");
		assertEquals(RDFTypesEnum.literal.toString(), rngType);
	}

	@Test
	public void getIntegerRangedPropertyDescriptionTest() {
		Response resp = serviceTester.propertyService.makeRequest(Property.propertyDescriptionRequest, par(
				Property.Par.propertyQNamePar, "propertyRanges:integerRangedProperty"));
		assertAffirmativeREPLY(resp);

		System.out.println("resp for: getIntegerRangedPropertyDescriptionTest\n" + resp);
		
		Element ranges = getRangesElement(resp);
		String rngType = ranges.getAttribute("rngType");
		assertEquals(RDFTypesEnum.typedLiteral.toString(), rngType);
	}

	@Test
	public void getResourceRangedPropertyDescriptionTest() {
		Response resp = serviceTester.propertyService.makeRequest(Property.propertyDescriptionRequest, par(
				Property.Par.propertyQNamePar, "propertyRanges:BRangedProperty"));
		assertAffirmativeREPLY(resp);
		
		System.out.println("resp for: getResourceRangedPropertyDescriptionTest\n" + resp);
		
		Element ranges = getRangesElement(resp);
		String rngType = ranges.getAttribute("rngType");
		assertEquals(RDFTypesEnum.resource.toString(), rngType);		
	}

	@Test
	public void getResourceRangedObjectPropertyDescriptionTest() {
		Response resp = serviceTester.propertyService.makeRequest(Property.propertyDescriptionRequest, par(
				Property.Par.propertyQNamePar, "propertyRanges:BRangedObjectProperty"));
		assertAffirmativeREPLY(resp);
		
		System.out.println("resp for: getResourceRangedObjectPropertyDescriptionTest\n" + resp);
		
		Element ranges = getRangesElement(resp);
		String rngType = ranges.getAttribute("rngType");
		assertEquals(RDFTypesEnum.resource.toString(), rngType);
	}

	@Test
	public void getRangeOfIntegerRangedPropertyTest() {
		Response resp = serviceTester.propertyService.makeRequest(Property.Req.getRangeRequest, par(
				Property.Par.propertyQNamePar, "propertyRanges:integerRangedProperty"), par(
				Property.Par.visualize, "true"));
		assertAffirmativeREPLY(resp);

		System.out.println("resp for: getRangeOfIntegerRangedPropertyTest\n" + resp);
		
		Element ranges = getRangesElement(resp);
		String rngType = ranges.getAttribute("rngType");
		assertEquals(RDFTypesEnum.typedLiteral.toString(), rngType);
	}

	@Test
	public void getRangeOfDataRangedPropertyTest() {
		Response resp = serviceTester.propertyService.makeRequest(Property.Req.getRangeRequest, par(
				Property.Par.propertyQNamePar, "propertyRanges:dataRangedProperty"), par(
				Property.Par.visualize, "true"));
		assertAffirmativeREPLY(resp);
		System.out.println(resp);

		Element bnode = getFirstElement(resp, "bnode");
		// accesses the sole node that should be present, assuming the text is written correctly
		String dataRangeBNodeID = bnode.getTextContent();

		System.out.println("dataRangeBNodeID: " + dataRangeBNodeID);

		resp = serviceTester.propertyService.makeRequest(Property.Req.parseDataRangeRequest, par(
				Property.Par.dataRangePar, dataRangeBNodeID), par(Property.Par.nodeTypePar,
				RDFTypesEnum.bnode.toString()));
		assertAffirmativeREPLY(resp);
		System.out.println(resp);

	}

}
