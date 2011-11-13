package it.uniroma2.art.semanticturkey.test.servicewrappers;

import it.uniroma2.art.semanticturkey.servlet.Response;
import it.uniroma2.art.semanticturkey.servlet.STServer;

import org.apache.http.client.HttpClient;

public class PluginHttpWrapper extends ServletExtensionHttpWrapper implements PluginWrapper {
	
	public PluginHttpWrapper(String id, HttpClient httpClient) {
		super(id, httpClient);
	}
	
	public Response init() {
		return makeRequest(STServer.pluginActivateRequest);
	}
	
	public Response dispose() {
		return makeRequest(STServer.pluginDeactivateRequest);
	}
	
	protected Response makeRequest(String request) {
		String[] parameters = new String[1];
		parameters[0]= "name="+getId();
		return askServer("plugin", request, parameters);
	}
	
}
