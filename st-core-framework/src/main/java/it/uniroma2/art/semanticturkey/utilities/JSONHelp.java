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

package it.uniroma2.art.semanticturkey.utilities;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * @author Ramon Orrù
 * 
 */
public class JSONHelp {

	
	/**
	 * this method adds a new JSONObject {@link JSONObject} to an existing {@link JSONObject}
	 * 
	 * @param parent
	 *            the parent {@link JSONObject } to which the new one is added
	 * @param nm
	 *            the name of the new JSONObject
	 * @param val
	 *            the text value of the new JSONObject 
	 * @return the created {@link JSONObject }
	 * @throws JSONException 
	 */
	public static JSONObject newObject(JSONObject parent, String nm, String val) throws JSONException {
		JSONObject oNode = null;
		if (val != null && val.trim().length() > 0 && parent != null) {
			oNode=new JSONObject();
			parent.put(nm,val);
		}
		return oNode;
	}

	/**
	 * this method adds a new JSONObject {@link JSONObject} to an existing {@link JSONObject}
	 * 
	 * @param parent
	 *            the parent {@link JSONObject } to which the new one is added
	 * @param nm
	 *            the name of the new JSONObject
	 * @return the created {@link JSONObject }
	 * @throws JSONException 
	 */
	public static JSONObject newObject(JSONObject parent, String nm) throws JSONException  {
		JSONObject oNode = null;
		if (parent != null) {
			oNode=new JSONObject();
			parent.put(nm,oNode);
		}
		return oNode;
	}

}