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
import it.uniroma2.art.owlart.vocabulary.OWL;
import it.uniroma2.art.owlart.vocabulary.RDFS;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.project.ProjectManager;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.main.Cls;
import it.uniroma2.art.semanticturkey.servlet.main.SPARQL;

import java.io.IOException;


/**
 * @author Armando Stellato
 * 
 */
public class SPARQLTest extends SystemStartTest {
	
	String tupleQueryString = 			
		"PREFIX rdf: <" + RDFS.NAMESPACE + ">" +
		"PREFIX owl: <" + OWL.NAMESPACE + ">" + 
		"PREFIX stx: <http://art.uniroma2.it/ontologies/st_example#>" + 
		"SELECT ?person\n" + 
		"WHERE" + 
		"{" + 
		"?person rdf:type stx:Persona" +
		//"    ?person rdfs:subClassOf ?x" +
					//st_example:Organization ." 
		//"           mo:releaseType mo:album;" + 
		//"           dc:creator <http://zitgist.com/music/artist/65f4f0c5-ef9e-490c-aee3-909e7ae6b2ab>." + 
		"}"                 
		//+ "ORDER BY ?person"
		;			

	
	
	public void doTest() {		
		
		super.doTest();
		
		importSTExample();
		
		Response resp = clsService.makeRequest(Cls.createClassRequest,
				par(Cls.newClassNamePar, "Persona"),
				par(Cls.superClassNamePar, "owl:Thing")
		);
		System.out.println(resp);
		resp = clsService.makeRequest(Cls.createInstanceRequest,
				par(Cls.clsQNameField , "Persona"),
				par(Cls.instanceNamePar, "Persona1")
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp);
		
				
		resp = sparqlService.makeRequest(SPARQL.resolveQueryRequest, 				
				par(SPARQL.queryPar, tupleQueryString)
		);
		System.out.println(resp);
		
		
		String graphQueryString = 	
			"PREFIX rdfs: <" + RDFS.NAMESPACE + ">" +
			"PREFIX owl: <" + OWL.NAMESPACE + ">" + 
			"DESCRIBE ?x ?y <" + ProjectManager.getCurrentProject().getOntModel().getDefaultNamespace() + ">\n" +
			"WHERE    {?x a owl:Class}"
		;
		
		resp = sparqlService.makeRequest(SPARQL.resolveQueryRequest, 				
				par(SPARQL.queryPar, graphQueryString)
		);
		System.out.println(resp);
		
	}

	public static void main(String[] args) throws ModelUpdateException, STInitializationException,
			IOException {

		String testType;

		if (args.length > 0)
			testType = args[0];
		else
			testType = "direct";
//			testType = "http";

		SPARQLTest test = new SPARQLTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();

	}

}
