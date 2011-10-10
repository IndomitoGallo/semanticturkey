/*
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License");  you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * http//www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
 * the specific language governing rights and limitations under the License.
 *
 * The Original Code is Semantic Turkey.
 *
 * The Initial Developer of the Original Code is University of Roma Tor Vergata.
 * Portions created by University of Roma Tor Vergata are Copyright (C) 2010.
 * All Rights Reserved.
 *
 * Semantic Turkey was developed by the Artificial Intelligence Research Group
 * (art.uniroma2.it) at the University of Roma Tor Vergata
 * Current information about Semantic Turkey can be obtained at 
 * http://semanticturkey.uniroma2.it
 *
 */

package it.uniroma2.art.semanticturkey.resources;

/**
 * a class for representing/managing Semantic Turkey version number
 * 
 * 
 * @author Armando Stellato
 * 
 */
public class VersionNumber implements Comparable<VersionNumber> {

	private int major;
	private int minor;
	private int revision;

	public VersionNumber(int major) {
		this(major, 0, 0);
	}

	public VersionNumber(int major, int minor) {
		this(major, minor, 0);
	}

	public VersionNumber(int major, int minor, int revision) {
		this.major = major;
		this.minor = minor;
		this.revision = revision;
	}

	public VersionNumber(String versionCode) {
		// if null all values are = 0
		if (versionCode != null) {
			String[] codes = versionCode.split("\\.");
			int nums = codes.length;
			if (nums > 0)
				major = parseNumber(codes[0]);
			if (nums > 1)
				minor = parseNumber(codes[1]);
			if (nums > 2)
				revision = parseNumber(codes[2]);
		}
	}

	private int parseNumber(String number) {
		try {
			return Integer.parseInt(number);
		} catch (Exception e) {
			return 0;
		}
	}

	public void setMajor(int major) {
		this.major = major;
	}

	public int getMajor() {
		return major;
	}

	public void setMinor(int minor) {
		this.minor = minor;
	}

	public int getMinor() {
		return minor;
	}

	public void setRevision(int revision) {
		this.revision = revision;
	}

	public int getRevision() {
		return revision;
	}

	public String toString() {
		return major + "." + minor + "." + revision;
	}

	public int compareTo(VersionNumber o) {
		int majorCompare = this.getMajor() -  o.getMajor();
		if (majorCompare!=0)
			return majorCompare;
		int minorCompare = this.getMinor() -  o.getMinor();
		if (minorCompare!=0)
			return minorCompare;
		return this.getRevision() -  o.getRevision();
	}

}
