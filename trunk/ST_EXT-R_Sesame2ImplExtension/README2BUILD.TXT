INSTRUCTIONS FOR BUILDING THIS PROJECT AND DEPLOYING IT TO SEMANTIC TURKEY BM PROJECT:

We have to fix something in this to-build release, however, if you follow this recipe, you'll be able to build and deploy
the Sesame2 Implementation of Semantic OntologyManager (i.e. this project), inside the extensions/ontmanager folder
of the SemanticTurkeyBM project.
Once this project has been deployed inside SemanticTurkeyBM, you can run: 
console> ant
from inside SemanticTurkeyBM to build Semantic Turkey into a installable XPI for Firefox

BUILD for Sesame2 Implementation of Semantic OntologyManager:

1)	Be sure, before working on this project, to launch:
    	console> mvn install
    on the SemanticTurkeyBM project, so that proper semantic turkey is installed in your maven local repository
    (Semantic Turkey is not on repository central)
    
2)	run the following:
		console> mvn clean install org.apache.felix:maven-bundle-plugin:bundle
		
3) copy the bundle produced in target directory, to SemanticTurkeyBM/extensions/ontmanager directory

Ignore the ant files. They come from past installations, and have been left for very specific uses.