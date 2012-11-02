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
  * The Original Code is st-core-framework.
  *
  * The Initial Developer of the Original Code is University of Roma Tor Vergata.
  * Portions created by University of Roma Tor Vergata are Copyright (C) 2012.
  * All Rights Reserved.
  *
  * st-core-framework was developed by the Artificial Intelligence Research Group
  * (ai-nlp.info.uniroma2.it) at the University of Roma Tor Vergata
  * Current information about st-core-framework can be obtained at 
  * http//ai-nlp.info.uniroma2.it/software/...
  *
  */

  /*
   * Contributor(s): Armando Stellato stellato@info.uniroma2.it
  */
package it.uniroma2.art.semanticturkey.ontology.utilities;

import it.uniroma2.art.owlart.io.RDFNodeSerializer;
import it.uniroma2.art.owlart.model.ARTLiteral;
import it.uniroma2.art.owlart.model.ARTURIResource;

public class STRDFLiteralImpl extends STRDFNodeImpl implements STRDFLiteral {

	private String dtQName;
	private String dtURI;
	private boolean isTypedLiteral;
	
	/**
	 * it automatically implies the literal is a typed literal
	 * 
	 * @param node
	 * @param explicit
	 * @param show
	 * @param dtQName
	 */
	STRDFLiteralImpl(ARTLiteral node, boolean explicit, String show, String dtQName) {
		super(node, explicit, show);
		this.dtQName = dtQName;
		isTypedLiteral = true;
		dtURI = node.getDatatype().getURI();
	}

	STRDFLiteralImpl(ARTLiteral node, boolean explicit, String show) {
		super(node, explicit, show);		
		ARTURIResource dt = node.getDatatype();
		if (dt!=null) {
			dtURI = dt.getURI();
			isTypedLiteral = true;
		}
	}
	
	STRDFLiteralImpl(ARTLiteral node, boolean explicit) {
		super(node, explicit);		
		ARTURIResource dt = node.getDatatype();
		if (dt!=null) {
			dtURI = dt.getURI();
			isTypedLiteral = true;
		} 
		setRendering(node.getNominalValue());
	}
	
	public String getLabel() {
		return ((ARTLiteral)node).getLabel();
	}

	public String getLanguage() {
		return ((ARTLiteral)node).getLanguage();
	}

	public String getDatatypeURI() {
		return dtURI;
	}

	public String getDatatypeQName() {
		return dtQName;
	}

	public void setDatatypeQName(String dtQName) {
		this.dtQName = dtQName; 
	}

	public String toNT() {
		return RDFNodeSerializer.toNT((ARTLiteral)node);
	}
	
	public boolean isTypedLiteral() {
		return isTypedLiteral;
	}
	
}
