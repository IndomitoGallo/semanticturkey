package it.uniroma2.art.semanticturkey.test.servicewrappers;

import it.uniroma2.art.semanticturkey.servlet.Response;

public interface PluginWrapper extends ServletExtensionWrapper {

	public Response init();
	
	public Response dispose();
	
}
