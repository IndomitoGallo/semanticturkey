package it.uniroma2.art.semanticturkey.test.servicewrappers;

import java.util.HashMap;
import java.util.Map;

import it.uniroma2.art.semanticturkey.servlet.ServiceRequest;
import it.uniroma2.art.semanticturkey.servlet.ServiceVocabulary.SerializationType;

public class ServiceRequestDirectImpl implements ServiceRequest {

	private HashMap<String, String> pars;
	
	public ServiceRequestDirectImpl() {
		pars = new HashMap<String, String>();
	}
	
	public String getParameter(String parName) {		
		return pars.get(parName);
	}
	
	public void setParameter(String parName, String value) {
		pars.put(parName, value);
	}

	public Map<String, String> getParameterMap() {
		return pars;
	}

	// TODO check this!	
	public SerializationType getAcceptContent() {
		return null;
	}

}
