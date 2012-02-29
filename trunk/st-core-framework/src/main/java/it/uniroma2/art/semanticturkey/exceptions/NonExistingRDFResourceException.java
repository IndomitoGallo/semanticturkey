package it.uniroma2.art.semanticturkey.exceptions;

import java.util.Arrays;

import it.uniroma2.art.owlart.model.ARTResource;

public class NonExistingRDFResourceException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = -7470247664805672183L;

	/**
	 * construct this exception with the uri of the resource which has not been found
	 * 
	 * @param uri
	 */
	public NonExistingRDFResourceException(ARTResource resource) {
		super("resource: " + resource + " does not exist");
	}
	
	public NonExistingRDFResourceException(ARTResource resource, ARTResource[] graphs) {
		super("resource: " + resource + " does not exist in graphs: " + Arrays.toString(graphs));
	}	
	
}
