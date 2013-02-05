/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License");  you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 *
 * The Original Code is SemanticTurkey.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2007.
 * All Rights Reserved.
 *
 * SemanticTurkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata (ART)
 * Current information about SemanticTurkey can be obtained at 
 * http://semanticturkey.uniroma2.it
 *
 */

/*
 * Contributor(s): Armando Stellato stellato@info.uniroma2.it
 */
package it.uniroma2.art.semanticturkey.ontology;

import static it.uniroma2.art.semanticturkey.ontology.ImportMethod.fromLocalFile;
import static it.uniroma2.art.semanticturkey.ontology.ImportMethod.fromOntologyMirror;
import static it.uniroma2.art.semanticturkey.ontology.ImportMethod.fromWeb;
import static it.uniroma2.art.semanticturkey.ontology.ImportMethod.fromWebToMirror;
import static it.uniroma2.art.semanticturkey.ontology.ImportMethod.toOntologyMirror;
import it.uniroma2.art.owlart.exceptions.ModelAccessException;
import it.uniroma2.art.owlart.exceptions.ModelCreationException;
import it.uniroma2.art.owlart.exceptions.ModelUpdateException;
import it.uniroma2.art.owlart.exceptions.UnsupportedRDFFormatException;
import it.uniroma2.art.owlart.io.RDFFormat;
import it.uniroma2.art.owlart.model.ARTResource;
import it.uniroma2.art.owlart.model.ARTURIResource;
import it.uniroma2.art.owlart.model.NodeFilters;
import it.uniroma2.art.owlart.models.ModelFactory;
import it.uniroma2.art.owlart.models.OWLArtModelFactory;
import it.uniroma2.art.owlart.models.OWLModel;
import it.uniroma2.art.owlart.models.RDFModel;
import it.uniroma2.art.owlart.models.SKOSModel;
import it.uniroma2.art.owlart.models.conf.ModelConfiguration;
import it.uniroma2.art.owlart.navigation.ARTNamespaceIterator;
import it.uniroma2.art.owlart.navigation.ARTResourceIterator;
import it.uniroma2.art.owlart.navigation.ARTStatementIterator;
import it.uniroma2.art.owlart.navigation.ARTURIResourceIterator;
import it.uniroma2.art.owlart.utilities.ModelUtilities;
import it.uniroma2.art.owlart.utilities.RDFIterators;
import it.uniroma2.art.owlart.vocabulary.OWL;
import it.uniroma2.art.owlart.vocabulary.RDF;
import it.uniroma2.art.semanticturkey.exceptions.ImportManagementException;
import it.uniroma2.art.semanticturkey.exceptions.ProjectInconsistentException;
import it.uniroma2.art.semanticturkey.project.Project;
import it.uniroma2.art.semanticturkey.resources.MirroredOntologyFile;
import it.uniroma2.art.semanticturkey.resources.OntFile;
import it.uniroma2.art.semanticturkey.resources.OntTempFile;
import it.uniroma2.art.semanticturkey.resources.OntologiesMirror;
import it.uniroma2.art.semanticturkey.resources.Resources;
import it.uniroma2.art.semanticturkey.utilities.Utilities;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;
import it.uniroma2.art.semanticturkey.vocabulary.SemAnnotVocab;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Iterators;

/**
 * @author Armando Stellato
 * 
 */
public abstract class STOntologyManager<T extends RDFModel> {

	protected static Logger logger = LoggerFactory.getLogger(STOntologyManager.class);

	protected T owlModel;
	protected OWLArtModelFactory<? extends ModelConfiguration> modelFactory;
	protected NSPrefixMappings nsPrefixMappings;
	protected File tripleStoreDir;
	protected Project<T> proj;

	/**
	 * this map tells whether a given ontology import has been refreshed or not<br>
	 * this information can't be accessed:
	 * <ul>
	 * <li>through <b>supportOntologies/applicationOntologies/listofExplicitOWLImports</b>: since these are
	 * <i>declarations of the intention</i> to import an ontology, but do not reflect its true import of data</li>
	 * <li>by <b>checking availability of the ontology as a Named Graph in the ontology triples</b>. The
	 * reason is that when the ontology is being declared as a WEB resource, then it needs to be refreshed
	 * from the WEB, even if its content is already present as a NG, every time the project is loaded</li>
	 * </ul>
	 * for these reasons, this map is used to formally acknowledge the fact that the a ontology has been
	 * loaded/refreshed for the current working session
	 */
	protected HashMultimap<ImportModality, ARTResource> refreshedOntologies;

	/**
	 * this set contains named graphs containing triples that should be never shown to the user (whether he is
	 * in user or admin mode)<br/>
	 * typical examples of ontologies in this set are those needed by specific triple stores to handle
	 * reasoning<br/>
	 * note that these ontologies are <i>declared</i> to be support ontologies, but the developer must still
	 * check whether they are imported or not
	 * 
	 */
	protected HashSet<ARTURIResource> supportOntologiesNG;

	/**
	 * Triples with predicate having a namespace contained in this set should be never shown to the user
	 * (whether he is in user or admin mode)<br/>
	 * typical examples of ontologies in this set are those needed by specific triple stores to handle
	 * reasoning<br/>
	 * note that these ontologies are <i>declared</i> to be support ontologies, but the developer must still
	 * check whether they are imported or not
	 */
	protected HashSet<String> supportOntologiesNamespace;

	/**
	 * This set contains named graphs adopted by the application or its extension to model their own behavior. <br/>
	 * The triples associated to these NG should be hidden to the user unless in admin mode<br/>
	 * The base application ontology for Semantic Turkey is annotation.owl<br/>
	 * note that these ontologies are <i>declared</i> to be application ontologies, but the developer must
	 * still check whether they are imported or not
	 */
	protected HashSet<ARTURIResource> applicationOntologiesNG;

	/**
	 * This set contains namespaces of ontologies adopted by the application or its extension to model their
	 * own behavior. <br/>
	 * Triples with predicate having a namespace contained in this set should be hidden to the user unless in
	 * admin mode.<br/>
	 * The base application ontology for Semantic Turkey is annotation.owl<br/>
	 * note that these ontologies are <i>declared</i> to be application ontologies, but the developer must
	 * still check whether they are imported or not
	 */
	protected HashSet<String> applicationOntologiesNamespace;

	/**
	 * importStatusMap is a map pointing to structures (ImportStatus) telling the import status (LOCAL, WEB,
	 * NULL, FAILED) of a ontology which should be imported by the main graph, and the location of its file in
	 * case it is a LOCAL import
	 * 
	 * Some notes: I was thinking about making this map a persistence object. However, I would rather use the
	 * following strategy, which considers the introduction of quad store repositories and a straight use of
	 * the mirror
	 * 
	 * <ul>
	 * <li>once loaded the model, STOntologyManager checks all imports</li>
	 * <li>this could be done in two ways:
	 * <ul>
	 * <li>through: owlModel.listOntologyImports(owlModel.createURIResource(owlModel.getBaseURI()))</li>
	 * <li>or through: owlModel.listOntologyImports(NodeFilters.ANY);</li>
	 * </ul>
	 * </li>
	 * <li>
	 * <p>
	 * the second one gets all imports in a row, so it is faster, but the first one allows you to stop other
	 * imports should another import they depend on be no more able to work
	 * </p>
	 * <p>
	 * I would use the first one, but I should also make sure that, when an import is explicitly removed, then
	 * all imports depending exclusively on it are also removed. They *should*, since they are written in the
	 * imported ontology, which is on another named graph, and which is deleted when the import is removed. So
	 * I only need to check that the cascade of imported ontologies is removed (and only if these are not in
	 * turn imported by another part of the imported tree)
	 * </p>
	 * </li>
	 * <li>then it checks if the related URI is present in the mirror and in the NAMED GRAPHS. Then you have
	 * the following 4 possibilities
	 * <ul>
	 * <li>MIRROR & NO_NG: it loads it from the mirror (strange situation, if you have an import, then also
	 * the data should have already been loaded)</li>
	 * <li>MIRROR & NG: it checks if the timestamp of the mirror is more recent than that of the repository (I
	 * should put it in a global property of the repo) and in affirmative case it cancels the old named graph
	 * and then loads it again from the mirror file (otherwise it keeps the one already in the repo)</li>
	 * <li>NO_MIRROR & NO_NG: load it from the web, if available put status=WEB, otherwise put status=FAILED</li>
	 * <li>NO_MIRROR & NG: remove the NG, then behave as: NO_MIRROR & NO_NG (this is used for ontologies
	 * imported from the WEB and not mirrored, in this case the system behaves as the ontology is never
	 * present (though it is persisted in the NG). For this reason the associated NG is deleted and the
	 * ontology is loaded back from the WEB</li>
	 * </ul>
	 * </li>
	 * </ul>
	 */
	protected HashMap<ARTURIResource, ImportStatus> importsStatusMap;

	private HashMap<ImportModality, HashSet<ARTURIResource>> importModalityMap;

	protected STOntologyManager(Project<T> project, ModelFactory<? extends ModelConfiguration> fact) {
		// creates the model factory from the specific model factory passed through the constructor from the
		// triple store implementation
		modelFactory = OWLArtModelFactory.createModelFactory(fact);

		// initializes user, application and support ontology sets
		applicationOntologiesNG = new HashSet<ARTURIResource>();
		applicationOntologiesNamespace = new HashSet<String>();
		supportOntologiesNG = new HashSet<ARTURIResource>();
		supportOntologiesNamespace = new HashSet<String>();

		importModalityMap = new HashMap<ImportModality, HashSet<ARTURIResource>>();
		importModalityMap.put(ImportModality.APPLICATION, applicationOntologiesNG);
		importModalityMap.put(ImportModality.SUPPORT, supportOntologiesNG);

		refreshedOntologies = HashMultimap.create();

		proj = project;
	}

	/**
	 * @param baseuri
	 *            the baseuri of the repository
	 * @param repositoryDirectory
	 *            the baseuri of
	 * @return
	 * @throws RepositoryCreationException
	 */
	public T startOntModel(String baseuri, File directoryFile, ModelConfiguration modelConfiguration)
			throws ModelCreationException {

		logger.debug("loading the model");

		if (!directoryFile.exists())
			throw new ModelCreationException("the directory specified for hosting the ontology ("
					+ directoryFile + ") does not exist");

		logger.debug("directory exists: " + directoryFile);

		refreshedOntologies = HashMultimap.create();

		try {
			// creates the model
			logger.debug("loading model; type: " + proj.getModelType());
			owlModel = modelFactory.loadModel(proj.getModelType(), baseuri, directoryFile.getAbsolutePath(),
					modelConfiguration);

			tripleStoreDir = directoryFile;

			// delegates to specific triple store implementation of this class which ontologies will be
			// considered as support ontologies
			declareSupportOntologies();

			// stores the prefix for the SemanticAnnotationOntology
			owlModel.setNsPrefix(SemAnnotVocab.NAMESPACE, "ann");

			// initializes the importStatus map (if reload, importStatus is already initialized)
			importsStatusMap = new HashMap<ARTURIResource, ImportStatus>();

			refreshImports(ImportModality.SUPPORT, ImportModality.APPLICATION, ImportModality.USER);

		} catch (ModelUpdateException e1) {
			throw new ModelCreationException(e1);
		} catch (IOException e) {
			throw new ModelCreationException(e.getMessage());
		} catch (ModelAccessException e) {
			throw new ModelCreationException(e.getMessage());
		} catch (ProjectInconsistentException e) {
			throw new ModelCreationException(e.getMessage());
		}

		return owlModel;
	}

	abstract public String getId();

	public void clearData() throws ModelCreationException, ModelUpdateException {
		logger.debug("clearing RDF:\nontology dir = " + Resources.getSemTurkeyDataDir());
		try {
			logger.debug("clearing namespace prefixes");
			if (nsPrefixMappings != null) // this check is only needed because of the ugly startOntologyData()
				// implementation in SaveToStoreProject.java which activates clearRepository to clean all
				// eventually left persistence files when loading a save-to-store project
				// in that case, nsPrefixMappings is still not loaded in the OntManager because it will be
				// initialized once the loadTriples() method invocation will be concluded
				nsPrefixMappings.clearNSPrefixMappings();

		} catch (NSPrefixMappingUpdateException e) {
			throw new ModelUpdateException(e);
		}
		if (owlModel == null)
			logger.debug("owlModel not active: no need to clear RDF data");
		else {
			owlModel.clearRDF();
			logger.debug("RDF Data cleared");
		}
	}

	public void initializeMappingsPersistence(NSPrefixMappings nsPrefixMappings) throws ModelUpdateException {
		this.nsPrefixMappings = nsPrefixMappings;
		// owlModel nsPrefixMapping regeneration from persistenceNSPrefixMapping
		Map<String, String> nsPrefixMapTable = nsPrefixMappings.getNSPrefixMappingTable();
		Set<Map.Entry<String, String>> mapEntries = nsPrefixMapTable.entrySet();
		for (Map.Entry<String, String> entry : mapEntries) {
			owlModel.setNsPrefix(entry.getValue(), entry.getKey());
		}
	}

	/* *
	 * ****************** DECLARED IMPORTS MANAGEMENT **********************************
	 */

	/**
	 * <p>
	 * retrieves the list of imports for the given {@link ImportModality}<br/>
	 * note that these are imports declared (it is not assured that they have been imported successfully)
	 * </p>
	 * <p>
	 * for example, <code>getImportSet(ImportModality.USER)</code> retrieves the set of all ontology imports
	 * set by the user
	 * </p>
	 * 
	 * @param mod
	 * @return
	 * @throws ModelAccessException
	 */
	public Collection<ARTURIResource> getDeclaredImports(ImportModality mod) throws ModelAccessException {
		if (mod == ImportModality.USER) {
			ARTURIResource baseURI = owlModel.createURIResource(owlModel.getBaseURI());
			ArrayList<ARTURIResource> ontImports = new ArrayList<ARTURIResource>();
			ARTURIResourceIterator importsIterator = ((OWLModel) owlModel).listOntologyImports(baseURI);
			Iterators.addAll(ontImports, importsIterator);
			importsIterator.close();
			return ontImports;
		} else
			return importModalityMap.get(mod);
	}

	/**
	 * gets the set of ontologies imported by the user
	 * 
	 * @return
	 * @throws ModelAccessException
	 */
	public Collection<ARTURIResource> getOntologyImports() throws ModelAccessException {
		return getDeclaredImports(ImportModality.USER);
	}

	// @TODO this method will be put in a subclass of this which only handles OWLModel
	/**
	 * checks if ontology <code>ont</code> has been explicitly imported with modality <code>mod</code> in the
	 * managed ontology
	 * 
	 * @param ont
	 * @param mod
	 * @return
	 * @throws ModelAccessException
	 */
	public boolean hasDeclaredImport(ARTURIResource ont, ImportModality mod) throws ModelAccessException {
		ARTURIResource baseURI = owlModel.createURIResource(owlModel.getBaseURI());
		if (mod == ImportModality.USER) {
			// @TODO this is the dirty code, see comment above
			ARTURIResourceIterator importsIterator = ((OWLModel) owlModel).listOntologyImports(baseURI);
			boolean contains = Iterators.contains(importsIterator, ont);
			importsIterator.close();
			return contains;
		} else
			return importModalityMap.get(mod).contains(ont);
	}

	public boolean isImportedInAnotherModality(ARTURIResource ont, ImportModality mod)
			throws ModelAccessException {
		if ((mod == ImportModality.APPLICATION && (hasDeclaredImport(ont, ImportModality.USER) || hasDeclaredImport(
				ont, ImportModality.SUPPORT)))
				|| (mod == ImportModality.USER && (hasDeclaredImport(ont, ImportModality.APPLICATION) || hasDeclaredImport(
						ont, ImportModality.SUPPORT)))
				|| (mod == ImportModality.SUPPORT && (hasDeclaredImport(ont, ImportModality.USER) || hasDeclaredImport(
						ont, ImportModality.APPLICATION))))
			return true;
		else
			return false;
	}

	/**
	 * tells if named graph <code>ont</code> is present in the current ontology
	 * 
	 * @param ont
	 * @return
	 * @throws ModelAccessException
	 */
	protected boolean availableNG(ARTResource ont) throws ModelAccessException {
		ARTResourceIterator graphs = owlModel.listNamedGraphs();
		if (Iterators.contains(graphs, ont))
			return true;
		else
			return false;
	}

	protected boolean isRefreshedOntology(ARTURIResource ont) {
		return (refreshedOntologies.containsValue(ont));
	}

	/**
	 * this gets a complete set of required ontology imports, by recursively navigating the import list of the
	 * ontology <code>ont</code> and of each of its imported ontologies <br/>
	 * the recursive exploration is necessary, since we have to keep two structures: <div>
	 * <ul>
	 * <li>a tree with root on the main graph, importing other user ontologies</li>
	 * <li>a forest with roots given from application ontologies</li>
	 * </ul>
	 * </div>
	 * 
	 * @param mods
	 * @throws IOException
	 * @throws ModelAccessException
	 * @throws ModelUpdateException
	 */
	private void refreshImports(ImportModality... mods) throws IOException, ModelAccessException,
			ModelUpdateException {
		// actually, the method itself is not recursive, though it invokes recoverOntology on each imported
		// ontology, which launches, for each of the ontologies that the above imports the method
		// refreshImportsForOntology
		for (ImportModality mod : mods) {
			logger.debug("refreshing " + mod + " imports:");
			for (ARTURIResource ont : getDeclaredImports(mod)) {
				logger.debug("\timport: " + ont);
				if (!isRefreshedOntology(ont)) {
					logger.debug(ont + " still not imported, adding it");
					recoverOntology(ont, mod);
				}
			}
		}
		guessMissingPrefixes();
	}

	private void refreshImportsForOntology(ARTURIResource ont, ImportModality mod)
			throws ModelAccessException, ModelUpdateException {
		ARTURIResourceIterator ontImports = ((OWLModel) owlModel).listOntologyImports(ont); // gets the import
		// list for
		// each imported ontology
		while (ontImports.streamOpen()) {
			ARTURIResource newImport = ontImports.next();
			logger.debug("checking import: <" + newImport + "> against refreshed ontologies: "
					+ refreshedOntologies);

			if (!isRefreshedOntology(newImport)) {
				logger.debug(ont + " still not imported, adding it");
				recoverOntology(newImport, mod);
			}
		}
		ontImports.close();
	}

	/**
	 * this method reloads ontologies when a previously built project is reloaded from its serialization
	 * 
	 * @param importedOntology
	 * @param mod
	 * @throws ModelAccessException
	 * @throws ModelUpdateException
	 */
	private void recoverOntology(ARTURIResource importedOntology, ImportModality mod)
			throws ModelAccessException, ModelUpdateException {

		logger.debug("recovering ontology: " + importedOntology);
		String baseURI = importedOntology.getURI();
		String mirroredOntologyEntry = OntologiesMirror.getMirroredOntologyEntry(baseURI);
		// I could nest the following 4 conditions and make them more compact, but I prefer to keep 'em
		// separate as they are. See also comments on the importStatus variable

		// if a cached mirror file is available for the importedBaseURI,
		// but the ontology is NOT loaded in a named graph in the quad store
		// STRANGE SITUATION: it should never happen, because you add the import statement
		// only after you successfully managed to add the named graph to the quad store
		if (mirroredOntologyEntry != null && !availableNG(importedOntology)) {
			logger.debug("MIRROR & NO_NG for graph: " + importedOntology);
			addOntologyImportFromMirror(baseURI, mirroredOntologyEntry, mod, false);
		}

		// if a cached mirror file is available for the importedBaseURI,
		// and the ontology is already loaded in a named graph in the quad store...
		else if (mirroredOntologyEntry != null && availableNG(importedOntology)) {
			logger.debug("MIRROR & NG for graph: " + importedOntology);
			long projTimeStamp = proj.getTimeStamp();
			long mirroredOntFileTimeStamp = OntologiesMirror.getMirroredOntologyFile(baseURI).lastModified();
			if (mirroredOntFileTimeStamp > projTimeStamp) {
				logger.debug("mirrored ontology is more recent than the project, so named graph is updated with data from the mirror");
				owlModel.deleteTriple(NodeFilters.ANY, NodeFilters.ANY, NodeFilters.ANY, importedOntology);
				addOntologyImportFromMirror(baseURI, mirroredOntologyEntry, mod, false);
			} else {
				logger.debug("ng cached data is more recent than the mirror, keeping NG as it is");
				importsStatusMap.put(owlModel.createURIResource(baseURI), new ImportStatus(
						ImportStatus.Values.NG, null));
			}
		}

		// if a cached mirror file is NOT available for the importedBaseURI,
		// and the ontology is NOT loaded in a named graph in the quad store...
		else if (mirroredOntologyEntry == null && !availableNG(importedOntology)) {
			logger.debug("NO_MIRROR & NO_NG for graph: " + importedOntology);
			addOntologyImportFromWeb(baseURI, baseURI, null, mod, false); // TODO if I save alternative
																			// download
			// locations for files from web in the
			// project, this could be handled
			// automatically by the application
			// instead of always failing
		}

		// if a cached mirror file is NOT available for the importedBaseURI,
		// and the ontology is already loaded in a named graph in the quad store...
		else if (mirroredOntologyEntry == null && availableNG(importedOntology)) {
			logger.debug("NO_MIRROR & NG for graph: " + importedOntology);
			owlModel.deleteTriple(NodeFilters.ANY, NodeFilters.ANY, NodeFilters.ANY, importedOntology);
			addOntologyImportFromWeb(baseURI, baseURI, null, mod, false); // TODO if I save alternative
																			// download
			// locations for files from web in the
			// project, this could be handled
			// automatically by the application
			// instead of always failing
		}
	}

	// ONTOLOGY IMPORT MODALITIES SETTINGS

	public Collection<ARTURIResource> getApplicationOntologies() {
		return applicationOntologiesNG;
	}

	public Collection<ARTURIResource> getSupportOntologies() {
		return supportOntologiesNG;
	}

	public boolean isSupportNG(ARTURIResource ontology) {
		if (supportOntologiesNG.contains(ontology))
			return true;
		return false;
	}

	public boolean isSupportOntNamespace(String ns) {
		if (supportOntologiesNamespace.contains(ns))
			return true;
		return false;
	}

	public boolean isApplicationNG(ARTURIResource ontology) {
		if (applicationOntologiesNG.contains(ontology))
			return true;
		return false;
	}

	public boolean isApplicationOntNamespace(String ns) {
		if (applicationOntologiesNamespace.contains(ns))
			return true;
		return false;
	}

	/**
	 * can be used by ST extensions to declare use of application ontologies for supporting their
	 * functionalities<br/>
	 * if <code>ng</code> is <b>true</b>, this prevents triples in the namedgraph of this ontology to be shown
	 * (when ST is in <code>user</code> mode)<br/>
	 * if <code>ns</code> is <b>true</b>, this prevents triples having a predicate with namespace matching the
	 * name of ontology <code>ont</code> to be shown (again, when ST is in <code>user</code> mode)<br/>
	 * One of the two boolean arguments must obviously be true, otherwise this declaration has no effect
	 * 
	 * @param ont
	 * @param ng
	 * @param ns
	 */
	public void declareApplicationOntology(ARTURIResource ont, boolean ng, boolean ns) {
		if (ng)
			applicationOntologiesNG.add(ont);
		if (ns)
			applicationOntologiesNamespace
					.add(ModelUtilities.createDefaultNamespaceFromBaseURI(ont.getURI()));
	}

	/**
	 * can be used by implementations of this class to declare use of support ontologies for supporting their
	 * functionalities<br/>
	 * if <code>ng</code> is <b>true</b>, this prevents triples in the namedgraph of this ontology to be shown<br/>
	 * if <code>ns</code> is <b>true</b>, this prevents triples having a predicate with namespace matching the
	 * name of ontology <code>ont</code> to be shown<br/>
	 * One of the two boolean arguments must obviously be true, otherwise this declaration has no effect
	 * 
	 * @param ont
	 * @param ng
	 * @param ns
	 */
	protected void declareSupportOntology(ARTURIResource ont, boolean ng, boolean ns) {
		if (ng)
			supportOntologiesNG.add(ont);
		if (ns)
			supportOntologiesNamespace.add(ModelUtilities.createDefaultNamespaceFromBaseURI(ont.getURI()));
	}

	/**
	 * need to be implemented by specific Ontology Manager to declare support ontologies which need to be
	 * loaded by them. These are expected to be automatically loaded by the specific Ontology Manager
	 * implementation, so they just need to be declared with this method
	 */
	protected abstract void declareSupportOntologies();

	// ADD IMPORTS SECTION

	/**
	 * as for {@link addOntologyImportFromLocalFile(baseURI, fromLocalFilePath, toLocalFile, true)}
	 * 
	 * @param baseURI
	 * @param fromLocalFilePath
	 * @param toLocalFile
	 * @throws MalformedURLException
	 * @throws ModelUpdateException
	 */
	public void addOntologyImportFromLocalFile(String baseURI, String fromLocalFilePath, String toLocalFile)
			throws MalformedURLException, ModelUpdateException {
		addOntologyImportFromLocalFile(baseURI, fromLocalFilePath, toLocalFile, ImportModality.USER, true);
	}

	public void addOntologyImportFromLocalFile(String baseURI, String fromLocalFilePath, String toLocalFile,
			ImportModality modality, boolean updateImportStatement) throws MalformedURLException,
			ModelUpdateException {
		logger.debug("adding: " + baseURI + " from localfile: " + fromLocalFilePath + " to Mirror: "
				+ toLocalFile);
		File inputFile = new File(fromLocalFilePath);
		MirroredOntologyFile mirFile = new MirroredOntologyFile(toLocalFile);
		try {
			owlModel.addRDF(inputFile, baseURI, RDFFormat.guessRDFFormatFromFile(inputFile),
					owlModel.createURIResource(baseURI));
		} catch (Exception e) {
			if (!updateImportStatement) {
				importsStatusMap.put(owlModel.createURIResource(baseURI),
						ImportStatus.createFailedStatus(e.getMessage()));
			} else
				throw new ModelUpdateException(e);
		}
		notifiedAddedOntologyImport(fromLocalFile, baseURI, fromLocalFilePath, mirFile, modality,
				updateImportStatement);
	}

	/**
	 * as for {@link addOntologyImportFromMirror(baseURI, mirFileString, true)}
	 * 
	 * @param baseURI
	 * @param mirFileString
	 * @throws MalformedURLException
	 * @throws ModelUpdateException
	 */
	public void addOntologyImportFromMirror(String baseURI, String mirFileString)
			throws MalformedURLException, ModelUpdateException {
		addOntologyImportFromMirror(baseURI, mirFileString, ImportModality.USER, true);
	}

	public void addOntologyImportFromMirror(String baseURI, String mirFileString, ImportModality modality,
			boolean updateImportStatement) throws ModelUpdateException {
		MirroredOntologyFile mirFile = new MirroredOntologyFile(mirFileString);
		File physicalMirrorFile = new File(mirFile.getAbsolutePath());
		try {
			owlModel.addRDF(physicalMirrorFile, baseURI,
					RDFFormat.guessRDFFormatFromFile(physicalMirrorFile), owlModel.createURIResource(baseURI));
		} catch (Exception e) {
			if (!updateImportStatement) {
				importsStatusMap.put(owlModel.createURIResource(baseURI),
						ImportStatus.createFailedStatus(e.getMessage()));
			} else
				throw new ModelUpdateException(e);
		}
		notifiedAddedOntologyImport(fromOntologyMirror, baseURI, null, mirFile, modality,
				updateImportStatement);
	}

	/**
	 * as for {@link #addOntologyImportFromWeb(String, String, {@link ImportModality.USER}, <code>true</code>
	 * )}
	 * 
	 * @param baseURI
	 * @param sourceURL
	 * @throws MalformedURLException
	 * @throws ModelUpdateException
	 */
	public void addOntologyImportFromWeb(String baseURI, String sourceURL, RDFFormat rdfFormat)
			throws MalformedURLException, ModelUpdateException {
		addOntologyImportFromWeb(baseURI, sourceURL, rdfFormat, ImportModality.USER, true);
	}

	/**
	 * imports an ontology from the Web
	 * 
	 * @param baseURI
	 *            the baseuri of the ontology to be imported.
	 * @param sourceURL
	 *            the alternative url, in case the baseuri is not the physical location for the ontology
	 * @param rdfFormat
	 *            the serialization format of the rdf content to be parsed. <code>null</code> will result in
	 *            the format being inferred from file extension or mime type, as for OWLART API
	 * @param modality
	 *            one of {@link ImportModality#USER} or {@link ImportModality#APPLICATION}
	 * @param updateImportStatement
	 *            this tells if the method is (likely to be) invoked (variable set to <code>true</code>) to
	 *            explicitly import an ontology (such as when invoked following a <code>import</code> user
	 *            request) or (variable set to <code>false</code>) when an ontology needs to be added for
	 *            whatever reason (like reloading it from the web because it is already available as a
	 *            <code>WEB import</code>)
	 * @throws ModelUpdateException
	 */
	public void addOntologyImportFromWeb(String baseURI, String sourceURL, RDFFormat rdfFormat,
			ImportModality modality, boolean updateImportStatement) throws ModelUpdateException {
		try {
			logger.debug("importing: " + baseURI);
			owlModel.addRDF(new URL(sourceURL), baseURI, rdfFormat, owlModel.createURIResource(baseURI));
		} catch (Exception e) {
			// an exception has been thrown
			if (!updateImportStatement) {
				// if this method has not been invoked to produce a new import (just because the ontology is
				// already formally imported, then update its import status to FAILED
				importsStatusMap.put(owlModel.createURIResource(baseURI),
						ImportStatus.createFailedStatus(e.getMessage()));
			} else
				// in the opposite situation (the ontology is being formally imported for the first time) an
				// exception is thrown
				throw new ModelUpdateException(e);
		}
		notifiedAddedOntologyImport(fromWeb, baseURI, sourceURL, null, modality, updateImportStatement);
	}

	/**
	 * as for {@link addOntologyImportFromWebToMirror(baseURI, sourceURL, toLocalFile, true)}
	 * 
	 * @param baseURI
	 * @param sourceURL
	 * @param toLocalFile
	 * @throws MalformedURLException
	 * @throws ModelUpdateException
	 */
	public void addOntologyImportFromWebToMirror(String baseURI, String sourceURL, String toLocalFile,
			RDFFormat rdfFormat) throws MalformedURLException, ModelUpdateException {
		addOntologyImportFromWebToMirror(baseURI, sourceURL, toLocalFile, rdfFormat, ImportModality.USER,
				true);
	}

	/**
	 * as for {@link #addOntologyImportFromWeb(String, String, RDFFormat, ImportModality, boolean)} with the
	 * exception that the imported ontology is stored in the mirror
	 */
	public void addOntologyImportFromWebToMirror(String baseURI, String sourceURL, String toLocalFile,
			RDFFormat rdfFormat, ImportModality modality, boolean updateImportStatement)
			throws MalformedURLException, ModelUpdateException {
		MirroredOntologyFile mirFile = new MirroredOntologyFile(toLocalFile);
		try {
			owlModel.addRDF(new URL(sourceURL), baseURI, rdfFormat, owlModel.createURIResource(baseURI));
		} catch (Exception e) {
			if (!updateImportStatement) {
				importsStatusMap.put(owlModel.createURIResource(baseURI),
						ImportStatus.createFailedStatus(e.getMessage()));
			} else
				throw new ModelUpdateException(e);
		}
		notifiedAddedOntologyImport(fromWebToMirror, baseURI, sourceURL, mirFile, modality,
				updateImportStatement);
	}

	// @TODO this method will be put in a subclass of this which only handles OWLModel

	/**
	 * this method, depending on the kind of import chosen:
	 * <ul>
	 * <li>downloads or copies the source ontology file into the temp cache or in the ontology mirror</li>
	 * <li>in case of a mirror, adds the entry to the mirror registry</li>
	 * <li>updates the in-memory importsStatusMap</li>
	 * <li>updates the imports registry</li>
	 * <li>adds the import statement to the main ontology</li>
	 * </ul>
	 * 
	 * @param method
	 * @param baseURI
	 * @param sourcePath
	 * @param localFile
	 * @param mod
	 * @param updateImportStatement
	 * @throws ModelUpdateException
	 */
	private void notifiedAddedOntologyImport(ImportMethod method, String baseURI, String sourcePath,
			OntFile localFile, ImportModality mod, boolean updateImportStatement) throws ModelUpdateException {
		logger.debug("notifying added ontology import with method: " + method + " with baseuri: " + baseURI
				+ " sourcePath: " + sourcePath + " localFile: " + localFile + " importModality: " + mod
				+ ", thought for updating the import status: " + updateImportStatement);
		try {
			ARTURIResource ont = owlModel.createURIResource(baseURI);

			// ***************************
			// Checking that the imported ontology has exactly the same URI used to import it. This may happen
			// when the given URI is a successful URL for retrieving the ontology but it is not the URI of
			// the ontology

			Set<ARTURIResource> declOnts = RDFIterators.getSetFromIterator(RDFIterators
					.toURIResourceIterator(owlModel.listSubjectsOfPredObjPair(RDF.Res.TYPE, OWL.Res.ONTOLOGY,
							false, ont)));

			// the import ont does not contain the declaration of itself as an ont and it contains at least
			// one declaration (probably its own one)
			if (!declOnts.contains(ont) && !declOnts.isEmpty()) {
				// extracting the real baseURI of the imported ontology
				ARTURIResource realURI = declOnts.iterator().next();
				// checking that the realURI has not already been imported, by checking the existence of its
				// NG in the current data
				if (owlModel.hasTriple(NodeFilters.ANY, NodeFilters.ANY, NodeFilters.ANY, false, realURI)) {
					// if realURI is already imported, then remove the data imported in the wrong URI
					owlModel.deleteTriple(NodeFilters.ANY, NodeFilters.ANY, NodeFilters.ANY, ont);
					// and throw an exception
					throw new ModelUpdateException("the real URI for the imported ontology: " + ont
							+ " is actually: " + realURI + " which, however, has already been imported");
				} else {
					// we have to move imported data to the correct baseuri
					renameNG(ont, realURI);
					ont = realURI;
					baseURI = realURI.getURI();
				}
			}

			// ***************************

			if (method == fromWebToMirror) {
				Utilities.download(new URL(sourcePath), localFile.getAbsolutePath());
			} else if (method == fromLocalFile)
				Utilities.copy(sourcePath, localFile.getAbsolutePath());

			if (method == fromWebToMirror || method == fromLocalFile)
				OntologiesMirror.addCachedOntologyEntry(baseURI, (MirroredOntologyFile) localFile);

			if (method == fromWebToMirror || method == fromLocalFile || method == fromOntologyMirror) {
				logger.debug("setting : " + baseURI + " import status to \"local\" on file: " + localFile);
				importsStatusMap.put(ont, new ImportStatus(ImportStatus.Values.LOCAL, localFile));
			} else if (method == fromWeb) {
				logger.debug("setting : " + baseURI + " import status to \"WEB\" on file: " + localFile);
				importsStatusMap.put(ont, new ImportStatus(ImportStatus.Values.WEB, localFile));
			} else
				throw new ModelUpdateException("the addImport method invoked, identified by id: " + method
						+ " has not been recognized");

			// if the import is explicitly asked by the user, then the import statement is explicitly added to
			// the ontology
			if (updateImportStatement) {
				logger.debug("adding import statement for uri: " + baseURI);
				((OWLModel) owlModel).addImportStatement(baseURI);
			}

			// updates the related import set with the loaded ontology
			refreshedOntologies.put(mod, ont);
			logger.debug("import set for: " + mod + " updated: " + importModalityMap.get(mod));

			// recursively load imported ontologies
			logger.debug("refreshing the import situation after adding new ontology: " + ont);
			refreshImportsForOntology(ont, mod);

			if (updateImportStatement) {
				// if updateImportStatement==true then it is an explicit request from the user so in this way
				// we wait before all the cascade of imports has been resolved (which is invoked through
				// recoverOntology, having updateImportStatement==false), but then guess missing prefixes
				// just one time
				logger.debug("updating prefixes: " + baseURI);
				guessMissingPrefixes();
			}

		} catch (MalformedURLException e) {
			throw new ModelUpdateException(e.getMessage() + " is not a valid URL");
		} catch (java.net.UnknownHostException e) {
			throw new ModelUpdateException(e.getMessage() + " is not resident on a host known by your DNS");
		} catch (IOException e) {
			throw new ModelUpdateException(e.getMessage() + " is not reachable");
		} catch (ModelAccessException e) {
			throw new ModelUpdateException(e);
		}
	}

	/*
	 * I should add this to OWLART instead
	 */
	/**
	 * renames an existing NG to a new name (actually, moves all o the data from the old one to the new one,
	 * and deletes the triples in the old one)
	 * 
	 * @param oldNG
	 * @param newNG
	 * @throws ModelAccessException
	 * @throws ModelUpdateException
	 */
	public void renameNG(ARTURIResource oldNG, ARTURIResource newNG) throws ModelAccessException,
			ModelUpdateException {
		ARTStatementIterator it = owlModel.listStatements(NodeFilters.ANY, NodeFilters.ANY, NodeFilters.ANY,
				false, oldNG);
		while (it.streamOpen()) {
			owlModel.addStatement(it.getNext(), newNG);
		}
		owlModel.deleteTriple(NodeFilters.ANY, NodeFilters.ANY, NodeFilters.ANY, oldNG);
	}

	// @TODO this method will be put in a subclass of this which only handles OWLModel

	/**
	 * removes an ontology import declaration from the given ImportModality <code>mod</code>. Note that this
	 * removes only the import declaration, though it does not remove the RDF data (if any) associated to that
	 * named graph
	 * 
	 * @param ont
	 * @param mod
	 * @throws ModelUpdateException
	 */
	public void removeDeclaredImport(ARTURIResource ont, ImportModality mod) throws ModelUpdateException {
		if (mod == ImportModality.USER) {
			((OWLModel) owlModel).removeImportStatement(ont);
		} else
			importModalityMap.get(mod).remove(ont);
	}

	/**
	 * as for {@link #removeDeclaredImport(ARTURIResource, ImportModality)} with second argument =
	 * {@link ImportModality#USER} <br/>
	 * this method thus removes an import declared by the user
	 * 
	 * @param ont
	 * @param mod
	 * @throws ModelUpdateException
	 */
	public void removeImportDeclaration(ARTURIResource ont) throws ModelUpdateException {
		removeDeclaredImport(ont, ImportModality.USER);
	}

	/**
	 * as for {@link #removeOntologyImport(String, ImportModality)} with second argument =
	 * {@link ImportModality#USER} <br/>
	 * 
	 * @param uriToBeRemoved
	 * @throws IOException
	 * @throws ModelUpdateException
	 * @throws ModelAccessException
	 */
	public void removeOntologyImport(String uriToBeRemoved) throws IOException, ModelUpdateException,
			ModelAccessException {
		removeOntologyImport(uriToBeRemoved, ImportModality.USER);
	}

	/**
	 * removes an import from the managed ontology.<br/>
	 * This implies:
	 * <ul>
	 * <li>removing <code>uriToBeRemoved</code> from the import declaration for USER ontologies or from the
	 * list of APPLICATION ontologies</li>
	 * <li>removing the RDF data associated to its named graph</li>
	 * <li>doing the above for any ontology which is imported by <code>uriToBeRemoved</code> and is not
	 * imported by other ontologies nor available as an APPLICATION ontology</li>
	 * </ul>
	 * 
	 * @param uriToBeRemoved
	 * @param mod
	 * @throws IOException
	 * @throws ModelUpdateException
	 * @throws ModelAccessException
	 */
	public void removeOntologyImport(String uriToBeRemoved, ImportModality mod) throws IOException,
			ModelUpdateException, ModelAccessException {
		ARTURIResource ont = owlModel.createURIResource(uriToBeRemoved);

		Set<ARTURIResource> toBeRemovedOntologies = computeImportsClosure(ont);
		logger.debug("transitive closure of imports to be removed: " + toBeRemovedOntologies);

		// removes the ontology from the import set
		logger.debug("removing import declaration for ontology: " + ont + ". Modality: " + mod);
		removeDeclaredImport(ont, mod);

		Set<ARTURIResource> toBeSavedOntologies = computeImportsClosure(ImportModality.getModalities());
		logger.debug("transitive closure of other imports: " + toBeSavedOntologies);

		toBeRemovedOntologies.removeAll(toBeSavedOntologies);
		logger.debug("computed difference between the two sets: " + toBeRemovedOntologies);

		// deletes ontology content and its entry from the input status only if this ontology is not imported
		// by any other modality

		// we need to check this in advance because if it's equal to zero, then we cannot pass the empty
		// array to clearRDF (see below), which means "all named graphs"
		int numOntToBeRemoved = toBeRemovedOntologies.size();
		if (numOntToBeRemoved != 0) {
			// deletes the content of the imported ontologies
			logger.debug("clearing all RDF data associated to named graphs: " + toBeRemovedOntologies);
			owlModel.clearRDF(toBeRemovedOntologies.toArray(new ARTURIResource[toBeRemovedOntologies.size()]));

			for (ARTURIResource remOnt : toBeRemovedOntologies) {
				// deletes the entry from the importStatusMap
				importsStatusMap.remove(remOnt);
				// the ontology is no more on the refresh list of the given modality
				refreshedOntologies.remove(mod, remOnt);
			}
		}
	}

	public static Set<ImportModality> getOtherModalities(ImportModality mod) {
		Set<ImportModality> mods = ImportModality.getModalities();
		mods.remove(mod);
		return mods;
	}

	/**
	 * computes and returns the transitive closure of the owl:imports relationship over the managed ontology
	 * along all ontology imports declared under modalities <code>mods</code>
	 * 
	 * @param mods
	 * @return
	 * @throws ModelAccessException
	 * @throws ModelUpdateException
	 */
	public Set<ARTURIResource> computeImportsClosure(Set<ImportModality> mods) throws ModelAccessException,
			ModelUpdateException {
		HashSet<ARTURIResource> importClosure = new HashSet<ARTURIResource>();
		logger.debug("computing global import closure on modalities: " + mods);
		for (ImportModality otherMod : mods) {
			logger.debug("checking declared " + otherMod + " imports for establishing import closure");
			for (ARTURIResource ont : getDeclaredImports(otherMod)) {
				logger.debug("\timport: " + ont);
				importClosure.addAll(computeImportsClosure(ont));
			}
		}
		return importClosure;
	}

	/**
	 * computes and returns the transitive closure of the owl:imports relationship over the managed ontology
	 * starting from import <code>ont</code>
	 * 
	 * @param ont
	 * @return
	 * @throws ModelAccessException
	 */
	public Set<ARTURIResource> computeImportsClosure(ARTURIResource ont) throws ModelAccessException {
		logger.debug("computing imports closure for import: " + ont);
		HashSet<ARTURIResource> importClosure = new HashSet<ARTURIResource>();
		computeImportsClosure(ont, importClosure);
		return importClosure;
	}

	// @TODO this method will be put in a subclass of this which only handles OWLModel

	/**
	 * computes the transitive closure of the owl:imports relationship over the managed ontology starting from
	 * import <code>ont</code>, storing all computed imports in <code>importClosure</code>
	 * 
	 * @param ont
	 * @param importClosure
	 * @throws ModelAccessException
	 */
	protected void computeImportsClosure(ARTURIResource ont, HashSet<ARTURIResource> importClosure)
			throws ModelAccessException {
		logger.debug("adding import: " + ont);
		importClosure.add(ont);
		ARTURIResourceIterator it = ((OWLModel) owlModel).listOntologyImports(ont);
		while (it.streamOpen()) {
			ARTURIResource nextImp = it.getNext();
			// this if prevents infinite loops with cyclic imports
			if (!importClosure.contains(nextImp))
				computeImportsClosure(nextImp, importClosure);
		}
		it.close();
	}

	// IMPORTED ONTOLOGIES DOWNLOADS SECTION
	// THE FIRST THREE ONES ARE RELATED TO FAILED IMPORTS WHICH THE USER IS TRYING TO RECOVER
	// THE LAST ONE IS TO MIRROR A WEB-IMPORTED ONTOLOGY

	/**
	 * downloads an ontology which is in the import list as a FAILED import from web to the mirror (needs to
	 * specify an alternative URL, because the baseURI failed)
	 * 
	 * @param method
	 * @param baseURI
	 * @param fromLocalFilePath
	 * @param localFile
	 * @throws RepositoryUpdateException
	 * @throws ImportManagementException
	 */
	public void downloadImportedOntologyFromWebToMirror(String baseURI, String altURL, String toLocalFile)
			throws ModelUpdateException, ImportManagementException {
		checkImportFailed(baseURI);
		MirroredOntologyFile mirFile = new MirroredOntologyFile(toLocalFile);
		try {
			owlModel.addRDF(new URL(baseURI), baseURI, null, owlModel.createURIResource(baseURI));
		} catch (Exception e) {
			throw new ModelUpdateException(e);
		}
		getImportedOntology(fromWebToMirror, baseURI, altURL, null, mirFile);
	}

	/**
	 * downloads an ontology which is in the import list as a FAILED import from web (needs to specify an
	 * alternative URL, because the baseURI failed)
	 * 
	 * @param altURL
	 * @throws MalformedURLException
	 * @throws RepositoryUpdateException
	 * @throws ImportManagementException
	 */
	public void downloadImportedOntologyFromWeb(String baseURI, String altURL) throws MalformedURLException,
			ModelUpdateException, ImportManagementException {
		checkImportFailed(baseURI);
		try {
			owlModel.addRDF(new URL(baseURI), baseURI, null, owlModel.createURIResource(baseURI));
		} catch (Exception e) {
			throw new ModelUpdateException(e);
		}
		getImportedOntology(fromWeb, baseURI, altURL, null, null);
	}

	/**
	 * downloads an ontology which is in the import list as a FAILED import, from a local file
	 * 
	 * @param altURL
	 * @param fromLocalFilePath
	 * @param toLocalFile
	 * @throws MalformedURLException
	 * @throws RepositoryUpdateException
	 * @throws ImportManagementException
	 */
	public void getImportedOntologyFromLocalFile(String baseURI, String fromLocalFilePath, String toLocalFile)
			throws MalformedURLException, ModelUpdateException, ImportManagementException {
		File inputFile = new File(fromLocalFilePath);
		checkImportFailed(baseURI);
		MirroredOntologyFile mirFile = new MirroredOntologyFile(toLocalFile);
		try {
			owlModel.addRDF(inputFile, baseURI, RDFFormat.guessRDFFormatFromFile(inputFile),
					owlModel.createURIResource(baseURI));
		} catch (Exception e) {
			throw new ModelUpdateException(e);
		}
		getImportedOntology(fromLocalFile, baseURI, null, fromLocalFilePath, mirFile);
	}

	/**
	 * mirrors an ontology which has already been successfully imported from the web
	 * 
	 * @throws ImportManagementException
	 * @throws RepositoryUpdateException
	 */
	public void mirrorOntology(String baseURI, String toLocalFile) throws ImportManagementException,
			ModelUpdateException {
		ImportStatus impStatus = importsStatusMap.get(owlModel.createURIResource(baseURI));
		OntFile tempFile;

		if (impStatus == null)
			throw new ImportManagementException("the import for: " + baseURI
					+ " should be stored inside the import status map, while it is not");
		if (impStatus.getValue() == ImportStatus.Values.FAILED) // this is different from the one in
			// "checkImportFailed"
			throw new ImportManagementException("the import for: " + baseURI
					+ " is a FAILED import, so you should not be allowed to mirror this ontology");

		tempFile = impStatus.getCacheFile();
		MirroredOntologyFile mirFile = new MirroredOntologyFile(toLocalFile);
		logger.debug("saving data for Mirroring Ontology:\nbaseURI: " + baseURI + "\ntempFile: " + tempFile
				+ "\nmirFile: " + mirFile);

		getImportedOntology(toOntologyMirror, baseURI, baseURI, null, mirFile);
	}

	private void checkImportFailed(String baseURI) throws ImportManagementException {
		ImportStatus impStatus = importsStatusMap.get(baseURI);
		if (impStatus == null)
			throw new ImportManagementException("the import for: " + baseURI
					+ " should be stored inside the import status map, while it is not");
		if (impStatus.getValue() != ImportStatus.Values.FAILED)
			throw new ImportManagementException("the import for: " + baseURI
					+ " should be a FAILED import for this request to make sense, while it is not");
	}

	private void getImportedOntology(ImportMethod method, String baseURI, String altURL,
			String fromLocalFilePath, OntFile mirror_cacheFile) throws ModelUpdateException {

		ImportStatus.Values statusBeingSet = ImportStatus.Values.UNASSIGNED;
		try {

			if (method == fromWebToMirror || method == toOntologyMirror) { // with previous RepositoryManager,
				// WEB used local tempFiles and
				// was also on the check here
				Utilities.download(new URL(altURL), mirror_cacheFile.getAbsolutePath());
			} else if (method == fromLocalFile) // wrt previous RepositoryManager, toOntologyMirror has been
				// moved to previous check, because ontologies are downloaded
				// from their original site
				Utilities.copy(fromLocalFilePath, mirror_cacheFile.getAbsolutePath());

			if (method == fromWebToMirror || method == fromLocalFile || method == toOntologyMirror) {
				OntologiesMirror.addCachedOntologyEntry(baseURI, (MirroredOntologyFile) mirror_cacheFile);
				statusBeingSet = ImportStatus.Values.LOCAL;
			} else if (method == fromWeb) {
				statusBeingSet = ImportStatus.Values.WEB;
			}

			ImportStatus impStatus = importsStatusMap.get(baseURI);
			if (impStatus == null)
				importsStatusMap.put(owlModel.createURIResource(baseURI), new ImportStatus(statusBeingSet,
						mirror_cacheFile));
			else
				impStatus.setValue(statusBeingSet, mirror_cacheFile);

		} catch (MalformedURLException e) {
			throw new ModelUpdateException(e);
		} catch (IOException e) {
			throw new ModelUpdateException(e);
		}
	}

	// IMPORT STATUS MANAGEMENT

	public ImportStatus getImportStatus(String baseURI) {
		return importsStatusMap.get(owlModel.createURIResource(baseURI));
	}

	public void printImportsStatus() {
		Collection<ARTURIResource> baseURIs = importsStatusMap.keySet();
		for (ARTURIResource baseURI : baseURIs)
			System.out.println("baseURI: " + baseURI + " status: " + importsStatusMap.get(baseURI).getValue()
					+ " file: " + importsStatusMap.get(baseURI).getCacheFile());
	}

	// RDF I/O FOR THE WORKING ONTOLOGY

	// @TODO this method will be put in a subclass of this which only handles OWLModel

	/**
	 * this method adds RDF data directly to the ontology being edited (i.e. it is not a read-only import of
	 * an external ontology that the working ontology depends on, but a mass add of RDF triples to the main
	 * graph of the working ontology)
	 * 
	 * @param inputFile
	 *            the RDF file from which RDF data is being loaded
	 * @param baseURI
	 *            the baseURI to be used when importing relative names from loaded RDF data
	 * @throws FileNotFoundException
	 * @throws IOException
	 * @throws ModelAccessException
	 * @throws ModelUpdateException
	 * @throws UnsupportedRDFFormatException
	 */
	public void loadOntologyData(File inputFile, String baseURI, RDFFormat format, ARTResource graph)
			throws FileNotFoundException, IOException, ModelAccessException, ModelUpdateException,
			UnsupportedRDFFormatException {
		owlModel.addRDF(inputFile, baseURI, format, graph);
		logger.debug("rdf data added from file: " + inputFile);
		ARTURIResourceIterator it = ((OWLModel) owlModel).listOntologyImports(NodeFilters.ANY, graph);
		while (it.streamOpen()) {
			System.out.println(it.next());
		}
		it.close();

		refreshImports(ImportModality.USER);
	}

	public void loadOntologyData(File inputFile, String baseURI, RDFFormat format)
			throws FileNotFoundException, IOException, ModelAccessException, ModelUpdateException,
			UnsupportedRDFFormatException {
		loadOntologyData(inputFile, baseURI, format, NodeFilters.MAINGRAPH);
	}

	/**
	 * as {@link #writeRDFOnFile(File, RDFFormat, boolean)} with last argument = false;
	 * 
	 * @param outPutFile
	 * @param format
	 * @throws UnsupportedRDFFormatException
	 * @throws ModelAccessException
	 * @throws IOException
	 * @throws Exception
	 */
	public void writeRDFOnFile(File outPutFile, RDFFormat format) throws IOException, ModelAccessException,
			UnsupportedRDFFormatException {
		writeRDFOnFile(outPutFile, format, false);
	}

	public void writeRDFOnFile(File outPutFile, RDFFormat format, boolean multigraph) throws IOException,
			ModelAccessException, UnsupportedRDFFormatException {
		if (multigraph)
			owlModel.writeRDF(outPutFile, format);
		else
			owlModel.writeRDF(outPutFile, format, NodeFilters.MAINGRAPH);
	}

	public Document writeRDFonDOMDocument(OWLModel r) throws Exception {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		BufferedOutputStream bos = new BufferedOutputStream(baos);
		owlModel.writeRDF(bos, RDFFormat.RDFXML, NodeFilters.MAINGRAPH);
		bos.flush();
		return XMLHelp.byteArrayOutputStream2XML(baos);
	}

	// NS PREFIX MAPPINGS
	/*
	 * "getNSPrefixMappings"; "setNSPrefixMapping"; "changeNSPrefixMapping"; "removeNSPrefixMapping";
	 */

	/**
	 * @param explicit
	 *            specifies if the full mapping provided by the OWL Art API implementation or the sole
	 *            mappings expressed by the user should be returned
	 * @return a copy of the internal mapping from prefixes to namespaces (as strings).
	 * @throws ModelAccessException
	 */
	public Map<String, String> getNSPrefixMappings(boolean explicit) throws ModelAccessException {
		if (explicit)
			return nsPrefixMappings.getNSPrefixMappingTable();
		else
			return owlModel.getNamespacePrefixMapping();
	}

	public void setNSPrefixMapping(String prefix, String namespace) throws NSPrefixMappingUpdateException,
			ModelUpdateException {
		nsPrefixMappings.setNSPrefixMapping(namespace, prefix);
		owlModel.setNsPrefix(namespace, prefix);
	}

	public void removeNSPrefixMapping(String namespace) throws NSPrefixMappingUpdateException,
			ModelUpdateException {
		nsPrefixMappings.removeNSPrefixMapping(namespace);
		owlModel.removeNsPrefixMapping(namespace);
	}

	public void guessMissingPrefixes() throws ModelAccessException, ModelUpdateException {
		ARTNamespaceIterator namespaceIt = owlModel.listNamespaces();
		while (namespaceIt.streamOpen()) {
			String ns = namespaceIt.getNext().getName();
			guessMissingPrefix(ns);
		}
		namespaceIt.close();

		for (ARTURIResource userOnt : getOntologyImports()) {
			String ns = ModelUtilities.createDefaultNamespaceFromBaseURI(userOnt.getURI());
			guessMissingPrefix(ns);
		}
	}

	public void guessMissingPrefix(String ns) throws ModelAccessException, ModelUpdateException {
		logger.debug("checking namespace: " + ns + " for missing prefix");
		if (owlModel.getPrefixForNS(ns) == null) {
			String guessedPrefix = ModelUtilities.guessPrefix(ns);
			owlModel.setNsPrefix(ns, guessedPrefix);
			logger.debug("namespace: " + ns
					+ " was missing from mapping table, guessed and added new prefix: " + guessedPrefix);
		}
	}

	/**
	 * this method is used to get the path of a new temp file to be used for whatever reason (the file is
	 * stored in the default temp file directory of Semantic Turkey
	 * 
	 * @return the path to the temp file
	 */
	public static OntTempFile getTempFileEntry() {
		UUID uuid;
		String tempFilePath;
		File tempFile;
		do {
			uuid = UUID.randomUUID();
			tempFilePath = Resources.getOntTempDir() + "/" + uuid + ".owl";
			tempFile = new File(tempFilePath);
		} while (tempFile.exists());
		return new OntTempFile(uuid + ".owl");
	}

	public T getOntModel() {
		return owlModel;
	}

	/**
	 * this is really not general at the moment. It assumes a project is either OWL or SKOS (which is what
	 * happens at the moment). in the future, this class will be subclassed with a class having OWL or SKOS
	 * models and this method will only be available there. So, in the case of OWL, the model itself will be
	 * returned, while in the case of SKOS, the OWLModel will be returned through
	 * {@link SKOSModel#getOWLModel()} method
	 * 
	 * @return
	 */
	public OWLModel getOWLModel() {
		if (owlModel instanceof OWLModel)
			return (OWLModel) owlModel;
		else
			// if (proj.getOntologyType().equals(OntologyType.SKOS))
			return ((SKOSModel) owlModel).getOWLModel();

	}
}
