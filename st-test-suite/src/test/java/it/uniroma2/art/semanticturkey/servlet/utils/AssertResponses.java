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
 * The Original Code is ART OWL API.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2009.
 * All Rights Reserved.
 *
 * The ART OWL API were developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about the ART OWL API can be obtained at 
 * http://art.uniroma2.it/owlart
 *
 */

package it.uniroma2.art.semanticturkey.servlet.utils;

import static org.junit.Assert.fail;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.ResponseProblem;
import it.uniroma2.art.semanticturkey.servlet.ResponseREPLY;
import it.uniroma2.art.semanticturkey.servlet.XMLResponse;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collection;

import org.w3c.dom.Document;
import org.xml.sax.SAXException;

public class AssertResponses {

	/**
	 * checks that the Response is Affirmative
	 */
	static public void assertAffirmativeREPLY(Response response) {
		if (!response.isAffirmative()) {
			if (response instanceof ResponseREPLY)
				throw new AssertionError("response=reply:fail; reason="
						+ ((ResponseREPLY) response).getReplyMessage());
			else
				throw new AssertionError("response=error/exception; reason="
						+ ((ResponseProblem) response).getMessage());
		}
	}

	/**
	 * checks that the Response is a REPLY and is a FAIL
	 */
	static public void assertFailREPLY(Response response) {
		if (!(response instanceof ResponseREPLY))
			throw new AssertionError("response=error/exception; reason="
					+ ((ResponseProblem) response).getMessage());
		else if (response.isAffirmative()) {
			throw new AssertionError("response=reply:affirmative; msg="
					+ ((ResponseREPLY) response).getReplyMessage());
		}
	}

	/**
	 * checks that the Response is a EXCEPTION
	 */
	static public void assertResponseEXCEPTION(Response response) {
		if (!(response instanceof ResponseProblem)) {
			if (response instanceof ResponseREPLY) {
				if (response.isAffirmative())
					throw new AssertionError("response=reply:affirmative; msg="
							+ ((ResponseREPLY) response).getReplyMessage());
				else
					throw new AssertionError("response=reply:negative; msg="
							+ ((ResponseREPLY) response).getReplyMessage());
			} else
				throw new AssertionError("response=error; reason="
						+ ((ResponseProblem) response).getMessage());
		}
	}

	/**
	 * checks that the Response is a Reply (not an exception nor a response). Note that the outcome may still
	 * be a fail
	 */
	static public void assertResponseREPLY(Response response) {
		if (!response.isAffirmative()) {
			if (!(response instanceof ResponseREPLY))
				throw new AssertionError("response=error/exception; reason="
						+ ((ResponseProblem) response).getMessage());
		}

	}

	/**
	 * as for {@link #assertResponseEquals(Response, String, String)} with third parameter (the directory to
	 * look for the xml sample response) equal to "it/uniroma2/art/semanticturkey/servlet/main/responses/"
	 * 
	 * @param response
	 * @param xmlOracleFileName
	 */
	static public void assertResponseEquals(XMLResponse response, String xmlOracleFileName) {
		assertResponseEquals(response, xmlOracleFileName,
				"it/uniroma2/art/semanticturkey/servlet/main/responses/");
	}

	/**
	 * affirmative if two xml responses are equally defined.<br/>
	 * Note that this amounts to xml-equality, so order of elements presentation counts. For this reason, this
	 * test is not suggested for responses containing multiple objects the order of which is not consistent
	 * across different triple store implementations
	 * 
	 * @param response
	 * @param xmlOracleFileName
	 * @param xmlDocDirectory
	 */
	static public void assertResponseEquals(XMLResponse response, String xmlOracleFileName,
			String xmlDocDirectory) {
		InputStream streamedXml = ClassLoader.getSystemClassLoader().getResourceAsStream(
				xmlDocDirectory + xmlOracleFileName);
		try {
			Document xmlOracle = XMLHelp.inputStream2XML(streamedXml);
			System.err.println("\nexpected:\n\n" + XMLHelp.XML2String(xmlOracle));
			System.err.println("\nresponse received:\n\n" + XMLHelp.XML2String(response.getResponseObject(), true));
			if (!XMLHelp.XML2String(xmlOracle, true).equals(XMLHelp.XML2String(response.getResponseObject(), true)))
				throw new AssertionError("response:\n" + response + "\nis not the expected response:\n\n"
						+ XMLHelp.XML2String(xmlOracle, true));
		} catch (IOException e) {
			throw new AssertionError("exception in accessing file: " + xmlOracleFileName + " rationale: " + e);
		} catch (SAXException e) {
			throw new AssertionError("exception in parsing file: " + xmlOracleFileName + " rationale: " + e);
		}
	}

	/**
	 * at the moment, this always succeeds. This is just a placeholder waiting for proper implementation
	 * 
	 * @param msg
	 * @param it
	 * @param elem
	 */
	static public void assertContains(String msg, Collection<?> it, Object elem) {
		assertContains(msg, true, it, elem);
	}

	static public void assertContains(String msg, boolean condition, Collection<?> it, Object elem) {
		if (!condition == it.contains(elem))
			fail(msg);
	}
}
