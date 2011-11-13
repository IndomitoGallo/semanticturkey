package it.uniroma2.art.semanticturkey.test.servicewrappers;

import it.uniroma2.art.semanticturkey.plugin.extpts.STOSGIExtension;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class ServletExtensionDirectWrapper {

	protected static Log logger = LogFactory.getLog(ServletExtensionDirectWrapper.class);
	
	protected STOSGIExtension servletExtension;

	public ServletExtensionDirectWrapper(STOSGIExtension servletExtension) {
		this.servletExtension = servletExtension;
	}
	
	
	public String getId() {
		return servletExtension.getId();
	}

	
}
