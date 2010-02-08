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
package it.uniroma2.art.semanticturkey.test;

import java.io.IOException;

import org.openrdf.model.URI;
import org.openrdf.model.impl.URIImpl;

import it.uniroma2.art.semanticturkey.resources.ImportMem;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.ServletUtilities;

/**
 * @author Armando Stellato
 * Contributor(s): Andrea Turbati
 */
public class SimpleTests {

    public static void main(String[] args) {
        System.out.println(ServletUtilities.removeInstNumberParentheses("rtv:Person(1)"));
        System.out.println(
        		ServletUtilities.removeInstNumberParentheses("rtv:WeavingFactory")
        );
        URI realURI = new URIImpl("http://xmlns.com/foaf/0.1/mario");
		System.out.println(realURI.getNamespace());
		
		
		String testString;
		Resources.setExtensionPath(SemTurkeyTestRepository.extensiondir);
		Resources.initializeUserResources();
		try {
			testString = ImportMem.getImportMem();
			System.out.println("testString: " + testString);
			String[] splits = testString.split(";");
			for (int i=0;i<splits.length;i++)
				System.out.println(splits[i]);
			
			System.out.println(testString.replaceAll("http://www.aktors.org/ontology/support;", ""));
			System.out.println(testString.replaceAll(";http://www.aktors.org/ontology/support", ""));
			
			System.out.println(testString.matches("http://ai-nlp.info.uniroma2.it/ontologies/rtv"));
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

    }
    
}
