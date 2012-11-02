package it.uniroma2.art.semanticturkey.servlet.main;

import static it.uniroma2.art.semanticturkey.servlet.utils.AssertResponses.*;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.fixture.ServiceUTFixture;
import it.uniroma2.art.semanticturkey.servlet.fixture.TestInitializationFailed;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import java.io.IOException;

import org.junit.BeforeClass;
import org.junit.Test;

public class OntoSearch_UT extends ServiceUTFixture  {
	
	@BeforeClass
	public static void init() throws IOException, STInitializationException, TestInitializationFailed {
		ServiceTest tester = new OntoSearch_UT();
		ServiceUTFixture.initWholeTestClass(tester);
		System.err.println("\n\n\nINITIALIZED!!!\n\n\n\n");
		startST();
		importSTExample();		
	}
	
	/**
	 * just checks the the response is a REPLY
	 */
	@Test
	public void getNamedGraphTest() {
		//"inputString", "types" 
		//types = property or clsNInd
		Response resp = serviceTester.searchOntologyService.makeRequest(OntoSearch.searchOntologyRequest, 
				par("inputString", "Personal Trainer"),
				par("types", "clsNInd")
		);
		System.out.println(resp);
		assertResponseREPLY(resp);
	}
}
