EXPORTED_SYMBOLS = [ "OntManager" ];

var knownOntologyManagerInterfacesPrettyPrint = new Array();
knownOntologyManagerInterfacesPrettyPrint["it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl"] = "Sesame2";

var knownRDFModelInterfacesPrettyPrint = new Array();
knownRDFModelInterfacesPrettyPrint["it.uniroma2.art.owlart.models.RDFModel"] = "RDF";
knownRDFModelInterfacesPrettyPrint["it.uniroma2.art.owlart.models.RDFSModel"] = "RDFS";
knownRDFModelInterfacesPrettyPrint["it.uniroma2.art.owlart.models.OWLModel"] = "OWL";
knownRDFModelInterfacesPrettyPrint["it.uniroma2.art.owlart.models.SKOSModel"] = "SKOS";
knownRDFModelInterfacesPrettyPrint["it.uniroma2.art.owlart.models.SKOSXLModel"] = "SKOS-XL";


OntManager = new function() {

	this.getOntManagerPrettyPrint = function(interfaceName) {
		if (interfaceName == null)
			return null;
		var prettyPrinted = knownOntologyManagerInterfacesPrettyPrint[interfaceName];	
		if (prettyPrinted == null)
			prettyPrinted = interfaceName.substring(interfaceName.lastIndexOf('.') + 1);
		return prettyPrinted;
	};

	this.getRDFModelPrettyPrint = function(interfaceName) {
		if (interfaceName == null)
			return null;
		var prettyPrinted = knownRDFModelInterfacesPrettyPrint[interfaceName];	
		if (prettyPrinted == null)
			prettyPrinted = interfaceName.substring(interfaceName.lastIndexOf('.') + 1);		
		return prettyPrinted;
	};
	
};