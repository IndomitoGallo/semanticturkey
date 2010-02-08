INSTRUCTIONS FOR:
- BUILD
- INSTALLATION INSIDE SEMANTIC TURKEY

BUILD:

	This OSGi bundle can be built:
	- through the ant_bundle.xml file, which is an ant builder which exploits some maven tasks by using the
	- through Maven (through the Felix maven-bundle-plugin)	
	  maven-ant-tasks-2.0.10.jar library located in SemanticTurkeyBM project
	- manually
	
	1) ANT-MAVEN (suggested method)
	you can build this bundle through the defined ant build (which uses maven itself), from the file: ant_bundle.xml
	If your build is not successful, try to first:
	 a) run: "mvn clean install" on this project. Even if the build file, java classes should have been produced
	 b) then run: "ant -buildfile ant_bundle.xml" to package the whole stuff into a maven bundle
	
	 
	2) MAVEN: 
	if you plan to build it through maven (with the bundle plugin), calling the ant task:
	
		ant:ant org.apache.felix:maven-bundle-plugin:ant
		
		with the following parameter:
		name: manifestLocation
		value: /
		
				MAVEN (ONLY THE MANIFEST)	
				if you just plan to build the manifest through maven, this is the task:
				
					org.apache.felix:maven-bundle-plugin:manifest
				
					with the following parameter:
					name: manifestLocation
					value: /
	 	 
	 	 
	3) MANUALLY 
	finally, you can build it manually; in this case just add a directory named lib and put inside it all the files listed here:
	 lib/owlart-sesame2impl-1.0.1.jar,
	 lib/slf4j-api-1.5.6.jar,
	 lib/slf4j-jcl-1.5.6.jar,
	 lib/sesame-2.3.0.jar
 
 
 INSTALLATION INSIDE SEMANTIC TURKEY:
 - just copy it inside Semantic Turkey BM project, into the directory: extensions/repository