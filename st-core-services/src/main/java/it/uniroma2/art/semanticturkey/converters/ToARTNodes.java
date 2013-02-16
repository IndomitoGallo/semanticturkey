package it.uniroma2.art.semanticturkey.converters;

import it.uniroma2.art.owlart.model.ARTBNode;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTNode;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.vocabulary.VocabUtilities;

import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;

public class ToARTNodes implements ConverterFactory<String, ARTNode> {

	@Override
	public <T extends ARTNode> Converter<String, T> getConverter(
			final Class<T> target) {
		return new Converter<String, T>() {

			@Override
			public T convert(String sourceValue) {
				// TODO better Turtle parser :-D
				if (target.isAssignableFrom(ARTURIResource.class)) {
					if (sourceValue.startsWith("<")
							&& sourceValue.endsWith(">")) {
						return target.cast(VocabUtilities.nodeFactory
								.createURIResource(sourceValue.substring(1,
										sourceValue.length() - 1)));
					}
				}

				if (target.isAssignableFrom(ARTBNode.class)) {
					if (sourceValue.startsWith("_:")) {
						return target.cast(VocabUtilities.nodeFactory
								.createBNode(sourceValue.substring(2)));
					}
				}

				if (target.isAssignableFrom(ARTLiteral.class)) {
					if (sourceValue.startsWith("\"")) {
						int endSurface = sourceValue.lastIndexOf("\"");
						String surface = sourceValue.substring(1, endSurface);

						if (sourceValue.charAt(endSurface + 1) == '@') {
							return target.cast(VocabUtilities.nodeFactory
									.createLiteral(surface.replace("\\\"", "\""), sourceValue
											.substring(endSurface + 2)));
						} else {
							return target
									.cast(VocabUtilities.nodeFactory
											.createLiteral(
													surface,
													VocabUtilities.nodeFactory
															.createURIResource(sourceValue
																	.substring(
																			endSurface + 4,
																			sourceValue
																					.length() - 1))));
						}
					}
				}

				throw new IllegalArgumentException();
			}

		};
	}
}