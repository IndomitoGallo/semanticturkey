package it.uniroma2.art.semanticturkey.model.test;

import it.uniroma2.art.owlart.model.ARTURIResource;

public class ARTURIResourceTestImpl extends ARTResourceTestImpl implements ARTURIResource {

	public ARTURIResourceTestImpl(String content) {
		super(content);
	}

	public String getLocalName() {
		if (content.contains("#"))			
			return content.split("#")[1];
		else {
			String[] contents = content.split("/");
			return contents[contents.length-1];
		}
	}

	public String getNamespace() {
		if (content.contains("#"))			
			return content.split("#")[0]+"#";
		else {
			int index = content.lastIndexOf("/");
			return content.substring(0, index+1);
		}
	}

	public String getURI() {
		return content;
	}

}
