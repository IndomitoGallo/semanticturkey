#! /bin/bash
#LIB=components/lib:components/lib/resources:components/lib/st-launcher.jar:components/lib/google-collections-1.0-rc1.jar:components/lib/javaFirefoxExtensionUtils.jar:components/lib/jcl-over-slf4j-1.5.6.jar:components/lib/jetty-5.1.10.jar:components/lib/json-20090211.jar:components/lib/log4j-1.2.14.jar:components/lib/org.apache.felix.main-2.0.1.jar:components/lib/owlart-api-2.0.4.jar:components/lib/secondstring-2006.06.15.jar:components/lib/servlet-api-2.4.jar:components/lib/slf4j-api-1.5.6.jar:components/lib/slf4j-log4j12-1.5.6.jar
LIB=components/lib:components/lib/resources
for i in `ls components/lib/*.jar`
do
	LIB=${LIB}:$i
done
java -classpath ${LIB} it.uniroma2.art.semanticturkey.launcher.SemanticTurkeyLauncher
