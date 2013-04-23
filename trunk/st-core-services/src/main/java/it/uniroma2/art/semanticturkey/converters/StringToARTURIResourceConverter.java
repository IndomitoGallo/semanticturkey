package it.uniroma2.art.semanticturkey.converters;

import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.io.RDFNodeSerializer;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.semanticturkey.project.ProjectManager;

import org.springframework.core.convert.converter.Converter;

public class StringToARTURIResourceConverter implements Converter<String, ARTURIResource> {

	@Override
	public ARTURIResource convert(String NTTerm) {
		RDFModel model = ProjectManager.getCurrentProject().getOntModel();
		try {
			return RDFNodeSerializer.createURI(model, NTTerm);
		} catch (ModelAccessException e) {
			throw new RuntimeException(e);
		}
	}

}
