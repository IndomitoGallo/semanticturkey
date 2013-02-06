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
import it.uniroma2.art.semanticturkey.servlet.main.Cls;
import it.uniroma2.art.semanticturkey.servlet.main.InputOutput;
import it.uniroma2.art.semanticturkey.servlet.main.Metadata;
import it.uniroma2.art.semanticturkey.servlet.main.SystemStart;

import java.io.IOException;

/**
 * @author Armando Stellato
 * 
 */
public class MetadataTest extends SystemStartTest {
	
	public void doTest() {

		super.doTest();
		
		String stxOntologyURI = "http://art.uniroma2.it/ontologies/st_example";
		
		Response 
		
				
		
		resp = metadataService.makeRequest(Metadata.addFromWebToMirrorRequest,
				par(Metadata.baseuriPar, stxOntologyURI),
				par(Metadata.mirrorFilePar, "st_example.owl")
		);
		System.out.println(resp);
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp); 
		
		resp = inputOutputService.makeRequest(InputOutput.saveRDFRequest,
				par(InputOutput.filePar, "./testOutput/stx_export.owl")
		);
		System.out.println(resp);
		
		resp = inputOutputService.makeRequest(InputOutput.clearDataRequest);
		System.out.println(resp);
		
		resp = systemStartService.makeRequest(SystemStart.startRequest,
				par(SystemStart.baseuriPar,	"http://art.uniroma2.it/ontologies/myont")
		);
		System.out.println(resp);	
		
		
		resp = inputOutputService.makeRequest(InputOutput.loadRDFRequest,
				par(InputOutput.filePar, "./testOutput/stx_export.owl"),
				par(InputOutput.baseUriPar, "http://art.uniroma2.it/ontologies/st_example")
		);
		System.out.println(resp);
	
		
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp); 
			
		resp = metadataService.makeRequest(Metadata.getNSPrefixMappingsRequest);
		System.out.println(resp);
		
		resp = metadataService.makeRequest(Metadata.getImportsRequest);
		System.out.println(resp);
		
		/*
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp); 
		
		
		resp = metadataService.makeRequest(Metadata.getImportsRequest);
		System.out.println(resp);
		
		resp = metadataService.makeRequest(Metadata.mirrorOntologyRequest,
				par(Metadata.baseuriPar, stxOntologyURI),
				par(Metadata.mirrorFilePar, "st_example.owl")
		);
		System.out.println(resp);
		
		resp = metadataService.makeRequest(Metadata.getImportsRequest);
		System.out.println(resp);
		
		resp = metadataService.makeRequest(Metadata.removeImportRequest,
				par(Metadata.baseuriPar, "http://art.uniroma2.it/ontologies/st_example")
		);
		System.out.println(resp);

		resp = metadataService.makeRequest(Metadata.getImportsRequest);
		System.out.println(resp);

		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp); 
		*/
		
		
		/*
		
		//ADD FILAS ONTOLOGY FROM WEB TO MIRROR
		String filasOntologyURI = "http://art.uniroma2.it/ontologies/filas";
		
		Response resp1 = metadataService.makeRequest(Metadata.addFromWebToMirrorRequest,
				par(Metadata.baseuriPar, filasOntologyURI),
				par(Metadata.mirrorFilePar, "filas.owl")
		);
		System.out.println(resp1);

		resp1 = metadataService.makeRequest(Metadata.setNSPrefixMappingRequest, 
				par(Metadata.namespacePar, filasOntologyURI+"#"),				
				par(Metadata.prefixPar, "stx")
		);
		System.out.println(resp1);		
		
		
		Response resp = metadataService.makeRequest(Metadata.getImportsRequest);
		System.out.println(resp);
				

		resp = metadataService.makeRequest(Metadata.getNSPrefixMappingsRequest);
		System.out.println(resp);
		
		resp = metadataService.makeRequest(Metadata.removeImportRequest,
				par(Metadata.baseuriPar, filasOntologyURI)
		);
		System.out.println(resp);

		resp = metadataService.makeRequest(Metadata.getImportsRequest);
		System.out.println(resp);
		
		resp = metadataService.makeRequest(Metadata.addFromOntologyMirrorRequest,
				par(Metadata.baseuriPar, filasOntologyURI),
				par(Metadata.mirrorFilePar, "filas.owl")
		);
		System.out.println(resp);
				
		pause();
		
		*/
		
		/*
		resp = metadataService.makeRequest(Metadata.removeNSPrefixMappingRequest, 
				par(Metadata.namespacePar, filasOntologyURI+"#")
		);
		System.out.println(resp);
		*/
		
		/*
		Response 
		resp = annotationService.makeRequest(Annotation.chkAnnotationsRequest,
				par(Annotation.urlPageString, "http://art.uniroma2.it/stellato")
		);
		System.out.println(resp);
		*/
		
		/*
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp); 		
		
		resp = metadataService.makeRequest(Metadata.removeImportRequest,
				par(Metadata.baseuriPar, filasOntologyURI)
		);
		System.out.println(resp);

		resp = metadataService.makeRequest(Metadata.getImportsRequest);
		System.out.println(resp);

		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp); 
		*/
		
		/*
		resp = clsService.makeRequest(Cls.getClassTreeRequest);
		System.out.println(resp); 		
		
		resp = clsService.makeRequest(Cls.createClassRequest,
				par(Cls.superClassNamePar, "owl:Thing" ),
				par(Cls.newClassNamePar, "Person")
		);
		*/
		
		/*
 		OWLModel owlModel = ProjectManager.getCurrentProject().getOntModel();
		try {
			ARTStatementIterator it = owlModel.listStatements(NodeFilters.ANY, NodeFilters.ANY, NodeFilters.ANY, false );
			while(it.streamOpen()) {
				logger.debug(it.getNext());
			}
			it.close();
		} catch (ModelAccessException e) {
			e.printStackTrace();
		}

		  
		 */
		
		/* ************************************************************* */
		/* *****************	METADATA REQUESTS	******************** */ 
		/* ************************************************************* */
			
		/*
		 IMPORT
		 
			resp = metadataService.makeRequest(Metadata.addFromWebRequest,
					par(Metadata.baseuriPar, stxOntologyURI)
			);
		  
			resp = metadataService.makeRequest(Metadata.addFromWebToMirrorRequest,
					par(Metadata.baseuriPar, filasOntologyURI),
					par(Metadata.mirrorFilePar, "filas.owl")
			);
		  
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

		MetadataTest test = new MetadataTest();
		test.deleteWorkingFiles();
		test.initialize(testType);
		test.doTest();

	}

}
