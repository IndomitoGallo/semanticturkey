INSTRUCTIONS FOR BUILDING THIS PROJECT AND REPLOYING IT TO SEMANTIC TURKEY BM PROJECT:

We have to fix something in this to-build release, however, if you follow this recipe, you'll be able to build and deploy
the Sesame2 Implementation of Semantic OntologyManager (i.e. this project), inside the extensions/ontmanager folder
of the SemanticTurkeyBM project.
Once this project has been deployed inside SemanticTurkeyBM, you can run: 
console> ant
from inside SemanticTurkeyBM to build Semantic Turkey into a installable XPI for Firefox

BUILD for Sesame2 Implementation of Semantic OntologyManager:

1)	Be sure, before working on this project, to launch:
    console> mvn install
    on the SemanticTurkeyBM project, so that semantic turkey 0.7.1 is installed in your maven local repository (Semantic Turkey is not on repository central)
    
2)	run the following:
		console> mvn ant:ant org.apache.felix:maven-bundle-plugin:ant (it should work, creating some files into the project dir)
		with the following parameter:
		name: manifestLocation
		value: /

3)	now run the following:
    console> ant (it could fail, but don't worry, it is necessary in any case to compile the source files)

4)	finally run the following:
		console> ant -f deploy_to_BM.xml (it should work)		
		to deploy the bundle jar inside inside the extensions/ontmanager folder of the SemanticTurkeyBM project.
