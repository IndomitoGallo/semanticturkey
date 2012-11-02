package it.uniroma2.art.semanticturkey.test.servicewrappers;

import it.uniroma2.art.semanticturkey.plugin.extpts.PluginInterface;
import it.uniroma2.art.semanticturkey.servlet.Response;

public class PluginDirectWrapper extends ServletExtensionDirectWrapper implements PluginWrapper {

	public PluginDirectWrapper(PluginInterface service) {
		super(service);
	}

	public Response init() {
		return ((PluginInterface)servletExtension).activate();
	}
	
	public Response dispose() {
		return ((PluginInterface)servletExtension).deactivate();
	}


}
