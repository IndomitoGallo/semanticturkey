package it.uniroma2.art.semanticturkey.converters;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.io.RDFNodeSerializer;
import it.uniroma2.art.owlart.model.ARTBNode;

import org.springframework.core.convert.converter.Converter;

public class StringToARTBNodeConverter implements Converter<String, ARTBNode> {

	@Override
	public ARTBNode convert(String NTTerm) {
		try {
			return RDFNodeSerializer.createBNode(NTTerm);
		} catch (ModelAccessException e) {
			throw new RuntimeException(e);
		}
	}

}
