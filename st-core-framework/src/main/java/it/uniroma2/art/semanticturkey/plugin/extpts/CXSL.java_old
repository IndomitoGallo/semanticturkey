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

package it.uniroma2.art.semanticturkey.plugin.extpts;





import java.io.*;

import javax.xml.transform.TransformerFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.stream.StreamSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerConfigurationException;
import javax.xml.transform.dom.DOMSource;

import org.w3c.dom.*;
import javax.xml.transform.ErrorListener;


/**
 * @author Donato Griesi
 *
 */
public class CXSL implements ErrorListener {
//    private XSLTProcessor processor;
  private Transformer processor;
  private ServletInterface servlet;

  public CXSL(String sScript) throws TransformerConfigurationException {
    TransformerFactory tFactory = TransformerFactory.newInstance();
    processor = tFactory.newTransformer(new StreamSource(sScript));
  }
  
  /**
   * Constructor holds the compiled script for repeated use
   */
  public CXSL(String sScript, ServletInterface servlet) throws TransformerConfigurationException {
	    this.servlet = servlet;
	    TransformerFactory tFactory = TransformerFactory.newInstance();
	    processor = tFactory.newTransformer(new StreamSource(sScript));
  }

  public void setParam(String p, String v) {
    processor.setParameter(p, v);
  }

  /**
   * Apply stylesheet to source document
   */

  public void apply(Document source, OutputStream out) throws TransformerException {
    processor.transform(new DOMSource(source), new StreamResult(out));
  }

  /**
   * Apply stylesheet to source document
   */
  public void apply(InputStream source, OutputStream out) throws TransformerException {
    processor.transform(new StreamSource(source), new StreamResult(out));
  }

  /**
   * Apply stylesheet to source document
   */
  public void apply(String source, OutputStream out) throws TransformerException {
    processor.transform(new StreamSource(new StringReader(source)),new StreamResult(out));
  }
  
  /**
   * Implementa i metodi dichiarati in ErrorListner e permette
   * di scrivere sul log i warning  
   */
  public void warning(TransformerException e) {
    servlet.log(e.getMessageAndLocation());
  }

  /**
   * Implementa i metodi dichiarati in ErrorListner e permette
   * di scrivere sul log gli error   
   */
  public void error(TransformerException e) {
    servlet.log(e.getMessageAndLocation());
  }

  /**
   * Implementa i metodi dichiarati in ErrorListner e permette
   * di scrivere  i fatal error  
   */
  public void fatalError(TransformerException e) {
    servlet.log(e.getMessageAndLocation());
  }
}
