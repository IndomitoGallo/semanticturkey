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

import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;
import it.uniroma2.art.semanticturkey.servlet.XMLResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.fixture.ServiceUTFixture;
import it.uniroma2.art.semanticturkey.servlet.fixture.TestInitializationFailed;
import it.uniroma2.art.semanticturkey.servlet.main.Statement;
import it.uniroma2.art.semanticturkey.servlet.parse.StatementParse;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;
import static it.uniroma2.art.semanticturkey.servlet.utils.AssertResponses.*;
import static org.junit.Assert.*;

import java.io.IOException;

import org.junit.BeforeClass;
import org.junit.Test;
import org.w3c.dom.Element;

/**
 * @author Armando Stellato
 * 
 */
public class Statement_UT extends ServiceUTFixture {

	@BeforeClass
	public static void init() throws IOException, STInitializationException, TestInitializationFailed {
		ServiceTest tester = new Statement_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");
		startST();
		importSTExample();		
	}
	
	/**
	 * retrieves range/domain of a property defined inside an imported ontology, through the graph of that
	 * imported ontology
	 */
	@Test
	public void getStatementsNoInferenceFromProperGraph() {

		Response resp = serviceTester.statementService.makeRequest(Statement.Req.getStatementsRequest,
				par(Statement.Par.subjectPar, "uri$st_example:worksIn"),
				par(Statement.Par.predicatePar, "any"),
				par(Statement.Par.objectPar, "any"),
				par(Statement.Par.inferencePar, "false"),
				par(Statement.Par.graphsPar, Statement.mainGraphValue + ";"	+ "http://art.uniroma2.it/ontologies/st_example"));

		assertResponseEquals((XMLResponse)resp, "getStatements1.xml");
	}
	
	/**
	 * this is normal if not working, I've to complete the test here
	 */
	//@Test
	public void getStatementsInference() {

		Response resp = serviceTester.statementService.makeRequest(Statement.Req.getStatementsRequest,
				par(Statement.Par.subjectPar, 	"uri$st_example:worksIn"),
				par(Statement.Par.predicatePar, "any"),
				par(Statement.Par.objectPar, 	"any"),
				par(Statement.Par.inferencePar, "true"),
				par(Statement.Par.graphsPar, 	Statement.mainGraphValue));

		System.out.println(StatementParse.parseStatements((ResponseREPLY)resp));
		
		if (resp instanceof ResponseREPLY)
			assertContains(resp+"\ndoes not contain pippo", StatementParse.parseStatements((ResponseREPLY)resp), "stat(st_example:worksIn,rdf:type,owl:ObjectProperty)" );
		else
			fail("response is not a reply:\n" + resp);
	}

	/**
	 * this is normal if not working, I've to complete the test here
	 */
	@Test
	public void hasStatementsInference() {

		Response resp = serviceTester.statementService.makeRequest(Statement.Req.hasStatementRequest,
				par(Statement.Par.subjectPar, 	"uri$st_example:worksIn"),
				par(Statement.Par.predicatePar, "any"),
				par(Statement.Par.objectPar, 	"any"),
				par(Statement.Par.inferencePar, "true"),
				par(Statement.Par.graphsPar, 	Statement.mainGraphValue));

		System.out.println(StatementParse.parseStatements((ResponseREPLY)resp));
				
		assertResponseREPLY(resp);
		
		Element dataElement = ((XMLResponseREPLY)resp).getDataElement();
		Element resultElement = (Element) dataElement.getElementsByTagName(Statement.resultTag).item(0);
		String value = resultElement.getTextContent();
		assertEquals("true", value);
	}

}
