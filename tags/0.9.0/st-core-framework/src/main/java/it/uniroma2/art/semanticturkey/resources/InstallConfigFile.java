package it.uniroma2.art.semanticturkey.resources;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

public class InstallConfigFile extends PropertyFileManager {

	private static final String _dataDirProp = "data.dir";
	
	
	public InstallConfigFile(File file) throws FileNotFoundException, IOException {
		super(file);
	}

	public InstallConfigFile(String filePath) throws FileNotFoundException, IOException {
		super(filePath);
	}
	
	public File getDataDir() {
		return new File(getPropertyValue(_dataDirProp));
	}
	
	public void setDataDirProp(String dataDirPath) throws ConfigurationUpdateException {
		setPropertyValue(_dataDirProp, dataDirPath);
	}
	
}
