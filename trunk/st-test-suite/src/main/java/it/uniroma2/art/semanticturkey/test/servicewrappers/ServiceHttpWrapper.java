package it.uniroma2.art.semanticturkey.test.servicewrappers;

import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.client.HttpClient;

public class ServiceHttpWrapper extends ServletExtensionHttpWrapper implements ServiceWrapper {

	protected static Log logger = LogFactory.getLog(ServiceHttpWrapper.class);

	public ServiceHttpWrapper(String id, HttpClient httpclient) {
		super(id, httpclient);
	}
	
	public Response makeRequest(String request, ServiceTest.ParameterPair... pars) {
		if (pars==null || (pars.length==0))
			return askServer(getId(), request);		
		String[] parameters = new String[pars.length];
		int i=0;
		for (ServiceTest.ParameterPair pair : pars) {	
			parameters[i]= pair.getParName()+"="+pair.getParValue();
			i++;
		}
		return askServer(getId(), request, parameters);
	}
	


	
}
