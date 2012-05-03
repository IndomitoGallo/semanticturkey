package it.uniroma2.art.semanticturkey.resources;

import java.io.File;

public class ConfigurationUpdateException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 6982015820027623735L;

	public ConfigurationUpdateException(File file, Throwable e) {
		super("failed in updating file: " + file + " due to exception: " + e + ":\n" + e.getMessage());
	}
	
}
