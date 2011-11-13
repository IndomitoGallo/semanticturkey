package it.uniroma2.art.semanticturkey.model.test;

import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTURIResource;

public class ARTLiteralTestImpl extends ARTNodeTestImpl implements ARTLiteral {

	ARTLiteralTestImpl(String label, String language) {
		super(label+"@"+language);
	}
	
	public ARTLiteralTestImpl(String content) {
		super(content);
	}

	public ARTURIResource getDatatype() {
		throw new IllegalAccessError();
	}

	public String getLabel() {
		return content.split("@")[0];
	}

	public String getLanguage() {
		String[] contents = content.split("@");
		if (contents.length>1)
			return contents[1];
		else
			return null;
	}

}
