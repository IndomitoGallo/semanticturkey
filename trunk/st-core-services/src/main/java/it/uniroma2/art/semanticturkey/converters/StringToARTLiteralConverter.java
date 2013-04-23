package it.uniroma2.art.semanticturkey.converters;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.io.RDFNodeSerializer;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.semanticturkey.project.ProjectManager;

import org.springframework.core.convert.converter.Converter;

public class StringToARTLiteralConverter implements Converter<String, ARTLiteral> {

	@Override
	public ARTLiteral convert(String NTTerm) {
		RDFModel model = ProjectManager.getCurrentProject().getOntModel();
		try {
			return RDFNodeSerializer.createLiteral(NTTerm, model);
		} catch (ModelAccessException e) {
			throw new RuntimeException(e);
		}
	}

}
