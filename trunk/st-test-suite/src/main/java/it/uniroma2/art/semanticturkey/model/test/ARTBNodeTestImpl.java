package it.uniroma2.art.semanticturkey.model.test;

import it.uniroma2.art.owlart.model.ARTBNode;

public class ARTBNodeTestImpl extends ARTResourceTestImpl implements ARTBNode {

	public ARTBNodeTestImpl(String content) {
		super(content);
	}

	public String getID() {
		return content;
	}
	
	
}
