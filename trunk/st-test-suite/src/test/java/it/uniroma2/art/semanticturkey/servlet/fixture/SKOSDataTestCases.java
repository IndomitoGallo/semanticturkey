package it.uniroma2.art.semanticturkey.servlet.fixture;

import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.main.SKOS;
import it.uniroma2.art.semanticturkey.servlet.main.SKOSXL;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest.ParameterPair;
import static it.uniroma2.art.semanticturkey.test.fixture.ServiceTest.par;

public class SKOSDataTestCases {

	private static final String AGROVOCURI = "http://aims.fao.org/aos/agrovoc";
	private static final String ITSampleURI = "http://starred.inc/it";
	public static final Vocabulary AGROVOC = new Vocabulary(AGROVOCURI, AGROVOCURI, AGROVOCURI + "/");
	public static final Vocabulary IT = new Vocabulary(ITSampleURI, ITSampleURI, ITSampleURI + "/");


	public static void createSampleSKOSITData(SkosMode mode) {
		SKOSDataCreator dc = getSKOSDataCreator(mode);
		
		Response resp = dc.addConcept(IT, "telecommunicationsTools", null, "strumenti per le telecomunicazioni",
				"it");
		System.out.println("addconcept:\n" + resp);
		dc.addConcept(IT, "smartphones", "telecommunicationsTools", "Smart Phones", "it");
		dc.addConcept(IT, "informationStorageTools", null, "sistemi per la memorizzazione di informazione", "it");
		dc.addConcept(IT, "DatabaseSystems", "informationStorageTools", "sistemi per basi di dati", "it");
		dc.addConcept(IT, "TripleStores", "informationStorageTools", "sistemi per memorizzazione di triple",
				"it");
		dc.addConcept(IT, "Companies", null, "Aziende", "it");
		dc.addConcept(IT, "SemanticWebCompanies", null, "Aziende in ambito Semantic Web", "it");
	}

	
	public static void createSampleSKOSAGROVOCData(SkosMode mode) {
		
		SKOSDataCreator dc = getSKOSDataCreator(mode);
		Response resp = dc.addScheme(AGROVOC, "AGROVOC", "en");
		System.out.println("addconcept:\n" + resp);
		dc.addConcept(AGROVOC, "c_plant", null, "plant", "en");		
		dc.addConcept(AGROVOC, "c_mais", "c_plant", "corn", "en");
		dc.addConcept(AGROVOC, "c_maismorado", "c_mais", "black corn", "en");

	}
	
	
	
	
	
	
	
	
	public static class SKOSDataCreator {
		
		public Response addScheme(Vocabulary voc, String prefLabel, String lang) {
			return ServiceUTFixture.serviceTester.skosService.makeRequest(SKOS.Req.createSchemeRequest, 
					par(SKOS.Par.scheme, voc.scheme), par(SKOS.Par.prefLabel, prefLabel),
					par(SKOS.Par.langTag, lang));
		}
		
		public Response addConcept(Vocabulary voc, String name, String broaderConceptName, String scheme,
				String prefLabel, String lang) {
			int args = ((broaderConceptName != null) ? 5 : 4);
			ParameterPair[] pars = new ParameterPair[5];
			pars[0] = par(SKOS.Par.concept, voc.defNS + name);
			pars[1] = par(SKOS.Par.scheme, scheme);
			pars[2] = par(SKOS.Par.prefLabel, prefLabel);
			pars[3] = par(SKOS.Par.langTag, lang);
			if (args == 5)
				pars[4] = par(SKOS.Par.broaderConcept, voc.defNS + broaderConceptName);

			return ServiceUTFixture.serviceTester.skosService.makeRequest(SKOS.Req.createConceptRequest, pars);
		}
		
		public Response addConcept(Vocabulary voc, String name, String broaderConceptName,
				String prefLabel, String lang) {
			return addConcept(voc, name, broaderConceptName, voc.scheme, prefLabel, lang);
		}
	}
	
	public static class SKOSXLDataCreator extends SKOSDataCreator {
		
		public Response addConcept(Vocabulary voc, String name, String broaderConceptName, String scheme,
				String prefLabel, String lang) {
			int args = ((broaderConceptName != null) ? 3 : 2);
			ParameterPair[] pars = new ParameterPair[args];
			
			String conceptURI = voc.defNS + name;
			
			pars[0] = par(SKOS.Par.concept, conceptURI);
			pars[1] = par(SKOS.Par.scheme, scheme);
			if (args == 3)
				pars[2] = par(SKOS.Par.broaderConcept, voc.defNS + broaderConceptName);

			Response resp = ServiceUTFixture.serviceTester.skosXLService.makeRequest(SKOS.Req.createConceptRequest, pars);
						
			resp = ServiceUTFixture.serviceTester.skosXLService.makeRequest(SKOSXL.Req.setPrefLabelRequest,
					par(SKOSXL.Par.concept, conceptURI),
					par(SKOSXL.Par.label, prefLabel),
					par(SKOSXL.Par.langTag, lang),
					par(SKOSXL.Par.mode, "bnode")
			);
			
			return resp;
		}
				
		public Response addConcept(Vocabulary voc, String name, String broaderConceptName,
				String prefLabel, String lang) {
			return addConcept(voc, name, broaderConceptName, voc.scheme, prefLabel, lang);
		}
	}


	public enum SkosMode {skos, skosxl}
	

	private static SKOSDataCreator getSKOSDataCreator(SkosMode mode) {
		if (mode==SkosMode.skos)
			return new SKOSDataCreator();
		else
			return new SKOSXLDataCreator();

	}
	


	public static class Vocabulary {
		public String uri;
		public String scheme;
		public String defNS;

		public Vocabulary(String uri, String scheme, String defNS) {
			this.uri = uri;
			this.scheme = scheme;
			this.defNS = defNS;
		}
	}

}
