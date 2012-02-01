@echo off
REM java -classpath components\lib;components\lib\resources;components\lib\st-core-framework.jar;components\lib\google-collections-1.0-rc1.jar;components\lib\javaFirefoxExtensionUtils.jar;components\lib\jcl-over-slf4j-1.5.6.jar;components\lib\jetty-5.1.10.jar;components\lib\json-20090211.jar;components\lib\log4j-1.2.14.jar;components\lib\org.apache.felix.main-2.0.1.jar;components\lib\owlart-api-2.0.4-SNAPSHOT.jar;components\lib\secondstring-2006.06.15.jar;components\lib\servlet-api-2.4.jar;components\lib\slf4j-api-1.5.6.jar;components\lib\slf4j-log4j12-1.5.6.jar it.uniroma2.art.semanticturkey.SemanticTurkey

 setLocal EnableDelayedExpansion
 set CLASSPATH="components\lib;components\lib\resources
 for %%a in (components\lib\*.jar) do (
   set CLASSPATH=!CLASSPATH!;%%a
 )
 set CLASSPATH=!CLASSPATH!"
 
@ECHO ON 

java -classpath %CLASSPATH% it.uniroma2.art.semanticturkey.SemanticTurkey
