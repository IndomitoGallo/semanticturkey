package it.uniroma2.art.semanticturkey.test.fixture;

// import it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl;
import it.uniroma2.art.owlart.models.conf.ModelConfiguration;
import it.uniroma2.art.semanticturkey.SemanticTurkey;
import it.uniroma2.art.semanticturkey.exceptions.STInitializationException;
import it.uniroma2.art.semanticturkey.ontology.OntologyManagerFactory;
import it.uniroma2.art.semanticturkey.plugin.PluginManager;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.servlet.main.Administration;
import it.uniroma2.art.semanticturkey.servlet.main.Annotate;
import it.uniroma2.art.semanticturkey.servlet.main.Annotation;
import it.uniroma2.art.semanticturkey.servlet.main.Cls;
import it.uniroma2.art.semanticturkey.servlet.main.Delete;
import it.uniroma2.art.semanticturkey.servlet.main.Environment;
import it.uniroma2.art.semanticturkey.servlet.main.Individual;
import it.uniroma2.art.semanticturkey.servlet.main.InputOutput;
import it.uniroma2.art.semanticturkey.servlet.main.Metadata;
import it.uniroma2.art.semanticturkey.servlet.main.ModifyName;
import it.uniroma2.art.semanticturkey.servlet.main.OntManager;
import it.uniroma2.art.semanticturkey.servlet.main.OntoSearch;
import it.uniroma2.art.semanticturkey.servlet.main.Page;
import it.uniroma2.art.semanticturkey.servlet.main.Plugins;
import it.uniroma2.art.semanticturkey.servlet.main.Projects;
import it.uniroma2.art.semanticturkey.servlet.main.Property;
import it.uniroma2.art.semanticturkey.servlet.main.SPARQL;
import it.uniroma2.art.semanticturkey.servlet.main.Statement;
import it.uniroma2.art.semanticturkey.servlet.main.Synonyms;
import it.uniroma2.art.semanticturkey.servlet.main.SystemStart;
import it.uniroma2.art.semanticturkey.test.servicewrappers.ServiceDirectWrapper;
import it.uniroma2.art.semanticturkey.test.servicewrappers.ServiceHttpWrapper;
import it.uniroma2.art.semanticturkey.test.servicewrappers.ServiceWrapper;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.DefaultHttpClient;

public abstract class ServiceTest {

	final static String STExtDirName = "STTest/extensions/extDir";
	final static String XULResourcesDir = "../st-firefox-ext/src/main/firefox";
	final static String dataDirName = "components/data";
	final static String extensionsDirName = "extensions";
	protected static Log logger = LogFactory.getLog(ServiceTest.class);

	private String accessType;

	protected HttpClient httpclient;

	public ServiceWrapper administrationService;
	public ServiceWrapper annotateService;
	public ServiceWrapper annotationService;
	public ServiceWrapper clsService;
	public ServiceWrapper deleteService;
	public ServiceWrapper individualService;
	public ServiceWrapper inputOutputService;
	public ServiceWrapper metadataService;
	public ServiceWrapper modifyNameService;
	public ServiceWrapper pageService;
	public ServiceWrapper propertyService;
	public ServiceWrapper resourceServlet;
	public ServiceWrapper searchOntologyService;
	public ServiceWrapper synonymsService;
	public ServiceWrapper systemStartService;
	public ServiceWrapper projectsService;
	public ServiceWrapper pluginsService;
	public ServiceWrapper sparqlService;
	public ServiceWrapper statementService;
	public ServiceWrapper environmentService;
	public ServiceWrapper ontManagerService;

	public void initialize(boolean delete) throws STInitializationException, IOException {
		String sConfigFile = "testMod.properties";
		InputStream in = ClassLoader.getSystemClassLoader().getResourceAsStream(sConfigFile);
		Properties props = new java.util.Properties();
		props.load(in);
		if (delete)
			deleteWorkingFiles();
		initialize(props.getProperty("access"));
	}

	public void initialize(String type) throws STInitializationException, IOException {

		accessType = type;

		System.err.println("access type: " + type);

		if (type.equals("http")) {
			httpInitialize();
			initializeServiceHttpWrappers();
		} else if (type.equals("direct")) {
			directInitialize();
			initializeServiceDirectWrappers();
		} else
			throw new IllegalArgumentException(
					"ServiceTest need to be initialized either with \"http\" or \"direct\" argument");
	}

	// INITIALIZE METHODS

	public void baseInitialize() throws IOException {
		// this is done to always get a fresh copy of the data dir from the original SemanticTurkeyBM folder
		// it is used whenever the SemanticTurkeyData dir in the STTest is deleted
		File fakeSTSourceDataDir = new File(STExtDirName, dataDirName);
		Utilities.deleteDir(fakeSTSourceDataDir);
		Utilities.recursiveCopy(new File(XULResourcesDir, dataDirName), fakeSTSourceDataDir);

		// this is done to always get a fresh copy of the extensions dir from the original SemanticTurkeyBM
		// folder
		// it is used whenever the SemanticTurkeyData dir in the STTest is deleted
		// this is necessary for FelixFixture since it behaves the same way as the runtime system, and
		// uses felix to dinamically load services bundled in this directory
		// we just use it anyway even in non-felix implementation of the test fixture
		File fakeSTSourceExtensionsDir = new File(STExtDirName, extensionsDirName);
		Utilities.deleteDir(fakeSTSourceExtensionsDir);
		Utilities.recursiveCopy(new File(XULResourcesDir, extensionsDirName), fakeSTSourceExtensionsDir);

	}

	@SuppressWarnings("unchecked")
	public Class<? extends OntologyManagerFactory<ModelConfiguration>> getOntologyManagerClass() {
		try {
			// I would have used the direct reference to the class, but
			// OntologyManagerFactorySesame2Impl.class is of type ...<? extends ModelConfiguration> and not
			// directly ...<ModelConfiguration>. I tried to change all the signatures to accept
			// <? extends ModelConfiguration> but I incurred in:
			// http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=6302954
			// so shortest way is to leave everything as it is and change the reference here by using the
			// Class.forName method on a String, which is not resolved at compile time
			// ...damned generics..
			return (Class<? extends OntologyManagerFactory<ModelConfiguration>>) Class
					.forName("it.uniroma2.art.semanticturkey.ontology.sesame2.OntologyManagerFactorySesame2Impl");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
			return null;
		}
	}

	public void directInitialize() throws STInitializationException, IOException {
		baseInitialize(); // not necessary in direct initialization
		try {
			XMLHelp.initialize();
		} catch (Exception e) {
			e.printStackTrace();
		}
		// the PluginManager allows to be used in "direct access test mode", so that when invoked internally
		// by Semantic
		// Turkey, it will return instances of the OntologyManager class specified here instead of those
		// dynamically loaded through felix
		PluginManager.setTestOntManagerFactoryImpl(getOntologyManagerClass());
		PluginManager.setDirectAccessTest(true);

		// then the rest is done normally as of ST initialization, with the data inside test directory being
		// copied on its own to the SemanticTurkeyDataFolder if it does not exist (i.e. ST first install) or
		// left as it is it it exists
		Resources.setExtensionPath(STExtDirName);
		Resources.initializeUserResources();
	}

	public void httpInitialize() throws IOException {
		baseInitialize();
		// String curDir = System.getProperty("user.dir");
		// File STExtDirFullPath = new File(curDir);
		// STExtDirFullPath.get
		File STExtDirFile = new File(STExtDirName);
		System.out.println(STExtDirFile.getCanonicalFile().toURI());
		SemanticTurkey.initialize(STExtDirFile.getCanonicalFile().toURI().toString());
		httpclient = new DefaultHttpClient();
	}

	// END OF INITIALIZE METHODS

	protected void initializeServiceHttpWrappers() {
		administrationService = new ServiceHttpWrapper("administration", httpclient);
		annotateService = new ServiceHttpWrapper("annotate", httpclient);
		annotationService = new ServiceHttpWrapper("annotation", httpclient);
		clsService = new ServiceHttpWrapper("cls", httpclient);
		deleteService = new ServiceHttpWrapper("delete", httpclient);
		environmentService = new ServiceHttpWrapper("environment", httpclient);
		individualService = new ServiceHttpWrapper("individual", httpclient);
		inputOutputService = new ServiceHttpWrapper("inputOutput", httpclient);
		metadataService = new ServiceHttpWrapper("metadata", httpclient);
		modifyNameService = new ServiceHttpWrapper("modifyName", httpclient);
		pageService = new ServiceHttpWrapper("page", httpclient);
		pluginsService = new ServiceHttpWrapper("plugins", httpclient);
		propertyService = new ServiceHttpWrapper("property", httpclient);
		projectsService = new ServiceHttpWrapper("projects", httpclient);
		searchOntologyService = new ServiceHttpWrapper("ontologySearch", httpclient);
		synonymsService = new ServiceHttpWrapper("synonyms", httpclient);
		systemStartService = new ServiceHttpWrapper("systemStart", httpclient);
		sparqlService = new ServiceHttpWrapper("sparql", httpclient);
		statementService = new ServiceHttpWrapper("statement", httpclient);
		ontManagerService = new ServiceHttpWrapper("ontManager", httpclient);
	}

	protected void initializeServiceDirectWrappers() {
		administrationService = new ServiceDirectWrapper(new Administration(""));
		annotateService = new ServiceDirectWrapper(new Annotate(""));
		annotationService = new ServiceDirectWrapper(new Annotation(""));
		clsService = new ServiceDirectWrapper(new Cls(""));
		deleteService = new ServiceDirectWrapper(new Delete(""));
		environmentService = new ServiceDirectWrapper(new Environment(""));
		individualService = new ServiceDirectWrapper(new Individual(""));
		inputOutputService = new ServiceDirectWrapper(new InputOutput(""));
		metadataService = new ServiceDirectWrapper(new Metadata(""));
		modifyNameService = new ServiceDirectWrapper(new ModifyName(""));
		pageService = new ServiceDirectWrapper(new Page(""));
		pluginsService = new ServiceDirectWrapper(new Plugins(""));
		propertyService = new ServiceDirectWrapper(new Property(""));
		projectsService = new ServiceDirectWrapper(new Projects(""));
		searchOntologyService = new ServiceDirectWrapper(new OntoSearch(""));
		synonymsService = new ServiceDirectWrapper(new Synonyms(""));
		systemStartService = new ServiceDirectWrapper(new SystemStart(""));
		sparqlService = new ServiceDirectWrapper(new SPARQL(""));
		statementService = new ServiceDirectWrapper(new Statement(""));
		ontManagerService = new ServiceDirectWrapper(new OntManager(""));
	}

	public static ParameterPair par(String par, String value) {
		return new ParameterPair(par, value);
	}

	public static class ParameterPair {
		String par;
		String value;

		ParameterPair(String par, String value) {
			this.par = par;
			this.value = value;
		}

		public String getParName() {
			return par;
		}

		public String getParValue() {
			return value;
		}
	}

	public void pause() {
		try {
			System.out.println("press a key");
			System.in.read();
		} catch (IOException e1) {
			e1.printStackTrace();
		}
	}

	public void deleteWorkingFiles() {
		File semTurkeyDataDir = new File(STExtDirName, "/../../SemanticTurkeyData");
		try {
			System.out.println("deleting data dir: " + semTurkeyDataDir.getCanonicalPath());
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		boolean cleaned = Utilities.deleteDir(semTurkeyDataDir);
		if (!cleaned)
			logger.info("SemanticTurkeyData not cleaned, directory cannot be deleted");
		else
			logger.info("SemanticTurkeyData cleaned");
	}

	protected void tearDown() throws Exception {
		System.out.println("tearin' down the test");
		// repository.close(); //this reference is null!!! recheck the whole system to have good unit testing
		System.out.println("repository disposed");
		PluginManager.stopFelix();
		System.out.println("Felix stopped: resources under SemanticTurkeyData directory have been released");
		deleteWorkingFiles();
		System.out.println("test teared down");
	}

	public String getAccessType() {
		return accessType;
	}

}
