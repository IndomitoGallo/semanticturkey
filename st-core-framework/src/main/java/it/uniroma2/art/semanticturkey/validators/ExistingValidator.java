package it.uniroma2.art.semanticturkey.validators;

import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.semanticturkey.constraints.Existing;
import it.uniroma2.art.semanticturkey.project.ProjectManager;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

public class ExistingValidator implements
		ConstraintValidator<Existing, ARTResource> {

	@Override
	public void initialize(Existing value) {
	}

	@Override
	public boolean isValid(ARTResource value, ConstraintValidatorContext context) {
		ARTResource test;
		try {
			if (value.isBlank()) {
				test = ProjectManager.getCurrentProject().getOntModel()
						.retrieveBNode(value.asBNode().getID());
			} else {
				test = ProjectManager.getCurrentProject().getOntModel()
						.retrieveURIResource(value.asURIResource().getURI());
			}
		} catch(Exception e) {
			e.printStackTrace();
			return false;
		}
		return (test != null);
	}
}
