MAVEN BUNDLE BUILD:

If you need to just compile this project into a bundle, run the maven tasks:

clean install org.apache.felix:maven-bundle-plugin:bundle

and then copy the bundle inside Semantic Turkey directory


FULL BUILD FROM SEMANTIC TURKEY MAIN PROJECT:

Otherwise, compile the manifest just one time; The ant task for producing the manifest is:
org.apache.felix:maven-bundle-plugin:manifest
with the following parameter:
name: manifestLocation
value: .

and each time you run the ST ant build file from SemanticTurkeyBM project,
all files into SE will be compiled and put in the bundle together with the MANIFEST above



