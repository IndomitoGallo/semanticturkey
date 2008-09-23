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

import  org.w3c.dom.*;
import org.apache.xml.serialize.*;
import java.io.*;


/**
 * @author Donato Griesi
 *
 */
public class XMLHelp {

	 /**Questo metodo non viene mai invocato*/	
  public static String XML2String (Document xml) {
    return XML2String (xml.getDocumentElement(), false);
  }
  /**Questo metodo non viene mai invocato*/
  public static String XML2String (Element xml) {
    return XML2String (xml, false);
  }
  public static String XML2String (Document xml, boolean indent) {
    return XML2String (xml.getDocumentElement(), indent);
  }
  /**Fa il parser utilizzando DOM del file xml dato in ingresso e ritorna la stringa corrispondente se non è null
   *@param Element xml
   *@param boolean indent
   *@return String stringOut
   */
  public static String XML2String (Element xml, boolean indent) {
    if (xml == null) {
      return null;
    }
    else {
      ByteArrayOutputStream stringOut = new ByteArrayOutputStream();
      try {
        OutputFormat format = new OutputFormat(xml.getOwnerDocument()); //Serialize DOM
        format.setOmitXMLDeclaration(true);
        format.setIndenting(indent);
        format.setEncoding("UTF-8");
        XMLSerializer serial = new XMLSerializer(stringOut, format);
        serial.asDOMSerializer(); // As a DOM Serializer
        serial.serialize(xml);
      }
      catch (IOException e) {}
      return stringOut.toString();
    }
  }
  /**Funzione che crea un nuovo elemento e gli assegna il nome e il valore dati in input
   *@param Element parent
   *@param String nm
   *@param String val*/
  public static Element newElement(Element parent, String nm, String val) {
    Element oNode = null;
    if (val != null && val.trim().length()>0 && parent!=null) {
      oNode = parent.getOwnerDocument().createElement(nm);
      oNode.appendChild(parent.getOwnerDocument().createTextNode(val));
      parent.appendChild(oNode);
  }
    return oNode;
  }
  /**Funzione che crea un nuovo elemento e gli assegna il nome dato in input
   *@param Element parent
   *@param String nm*/
  public static Element newElement(Element parent, String nm) {
    Element oNode = null;
    if (parent!=null) {
      oNode = parent.getOwnerDocument().createElement(nm);
      parent.appendChild(oNode);
    }
    return oNode;
  }


}