package it.uniroma2.art.semanticturkey.test.servicewrappers;

import java.util.Arrays;

import it.uniroma2.art.semanticturkey.plugin.extpts.ServiceInterface;
import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.test.fixture.ServiceTest;

public class ServiceDirectWrapper extends ServletExtensionDirectWrapper implements ServiceWrapper {

	public ServiceDirectWrapper(ServiceInterface service) {
		super(service);
	}

	public Response makeRequest(String request, ServiceTest.ParameterPair... pars) {
		ServiceRequestDirectImpl servReq = new ServiceRequestDirectImpl();
		servReq.setParameter("request", request);
		System.out.println("pars: " + Arrays.toString(pars));
		if (pars != null && (pars.length > 0)) {
			for (ServiceTest.ParameterPair pair : pars) {
				servReq.setParameter(pair.getParName(), pair.getParValue());
			}
		}

		((ServiceInterface)servletExtension).setServiceRequest(servReq);
		return ((ServiceInterface)servletExtension).getResponse();
	}

}
