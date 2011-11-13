package it.uniroma2.art.semanticturkey.test.servicewrappers;

import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;


public interface ServiceWrapper extends ServletExtensionWrapper {

	public abstract Response makeRequest(String request, ServiceTest.ParameterPair...pars);
		
	
}
