BUILD AND DEPLOY:

1) MAVEN THIRD PARTY LIBRARIES INSTALLATION

Some libraries needed by this application are not hosted on main Maven repository, nor we provide a Maven
repository which hosts them.
So, before you build this project, we suggest downloading the following jars from the web:

secondstring.jar (version 2006.06.15) available from: http://sourceforge.net/projects/secondstring/
javaFirefoxExtensionUtils.jar (version 2.0) available from: http://simile.mit.edu/repository/java-firefox-extension/tools/javaFirefoxExtensionUtils.jar

and install them on your local maven repository, through the following maven commands

mvn install:install-file -Dfile=secondstring-20060615.jar -DgroupId=com.wcohen.ss -DartifactId=secondstring -Dversion=2006.06.15 -Dpackaging=jar
mvn install:install-file -Dfile=javaFirefoxExtensionUtils.jar -DgroupId=edu.mit.simile -DartifactId=javaFirefoxExtensionUtils -Dversion=2.0 -Dpackaging=jar

These instructions assume that the following lib:

- owlart-api (groupID: it.uniroma2.art.owlart)

will be available through Maven Central repository. If it is not, look on the project site if the jar is available

2) BE SURE TO REQUIRED PROJECTS ON THE SAME DIRECTORY
   In order to build this project (SemanticTurkeyBM), you need also:
   - SemanticTurkeySE
   - SemanticTurkeyUI
   in the same directory of SemanticTurkeyBM. The ant build file (see point 4) will retrieve resources from these
   projects in order to build and deploy the final XPI of the system

2) IMPORT A STONTOLOGY-MANAGER IMPLEMENTATION

- you must download a bundle implementing the STOntologyManager extension point in order to have Semantic
  Turkey be able to manage RDF
- sesame2ontmanager (groupId:it.uniroma2.art.semanticturkey.ontology) is a sesame implementation of STOntologyManager
  and is the one which is bundled with the xpi of Semantic Turkey hosted on Firefox extensions' site. Get it
  and place it inside the extensions/ontmanager folder of this project 
  
3) BUILD AND DEPLOY

  - run the ant build file: build.xml