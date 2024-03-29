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
import it.uniroma2.art.semanticturkey.servlet.main.Annotation;
import it.uniroma2.art.semanticturkey.servlet.main.Cls;
import it.uniroma2.art.semanticturkey.servlet.main.Individual;
import it.uniroma2.art.semanticturkey.servlet.main.InputOutput;
import it.uniroma2.art.semanticturkey.servlet.main.Resource;

import java.io.IOException;

/**
 * @author Armando Stellato
 * 
 */
public class ResourceTest extends SystemStartTest {

	public void doTest() {
		
		super.doTest();
		
		importSTExample();
		
		Response resp = clsService.makeRequest(Cls.createClassRequest,
				par(Cls.newClassNamePar, "Person"),
				par(Cls.superClassNamePar, "owl:Thing")
		);
		System.out.println(resp);	
		
		resp = clsService.makeRequest(Cls.createClassRequest,
				par(Cls.newClassNamePar, "Metaclass"),
				par(Cls.superClassNamePar, "owl:Thing")
		);
		System.out.println(resp);	
		
		resp = clsService.makeRequest(Cls.addTypeRequest, 
				par(Cls.clsQNamePar, "Person"),
				par(Cls.typeQNamePar, "Metaclass")
		);
		System.out.println(resp);	
		
		resp = inputOutputService.makeRequest(InputOutput.saveRDFRequest,
				par(InputOutput.filePar, "./testOutput/export.nt")
		);
		System.out.println(resp);
		
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getSuperClassesRequest,
				par(Cls.clsQNameField, "Person")				
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getSubClassesRequest,
				par(Cls.clsQNameField, "owl:Thing")				
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getSubClassesRequest,
				par(Cls.clsQNameField, "owl:Thing"),
				par(Cls.treePar, "true"),
				par(Cls.instNumPar, "true")
		);
		System.out.println(resp);
		
		
		resp = annotationService.makeRequest(Annotation.createAndAnnotateRequest,
				par(Annotation.clsQNameField, "Person"),
				par(Annotation.instanceQNameField, "ArmandoStellato"),
				par(Annotation.urlPageString, "http://art.uniroma2.it/stellato"),
				par(Annotation.titleString, "Armando Stellato Home Page")
		);
		System.out.println(resp);
		
		resp = annotationService.makeRequest(Annotation.relateAndAnnotateRequest, 
				par(Annotation.op, Annotation.bindCreate),
				par(Annotation.instanceQNameField, "ArmandoStellato"),
				par(Annotation.propertyQNameField, "st_example:worksIn"),
				par(Annotation.objectQNameField, "UnivTorVergata"),
				par(Annotation.objectClsNameField, "st_example:University"),
				//par(Annotation.langField, "it"),
				par(Annotation.urlPageField, "http://www.uniroma2.it"),
				par(Annotation.titleField, "Tor Vergata University Home Page")
		);
		System.out.println(resp);
		
		resp = individualService.makeRequest(Individual.individualDescriptionRequest,
				par(Individual.instanceQNameField, "ArmandoStellato"),
				par("method", Resource.templateandvalued)
		);
		System.out.println(resp);

		
		
	/*	
		resp = propertyService.makeRequest(Property.getPropertiesTreeRequest);
		System.out.println(resp);
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

		ResourceTest test = new ResourceTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();

	}

}
