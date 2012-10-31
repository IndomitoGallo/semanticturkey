

/**
 * Created a new class in the ontology
 * @param {} classRes
 * @param {} superClassRes
 * @param {} parameters
 */
art_semanticturkey.classAddedClass = function(classRes, superClassRes){
	var classRes = classRes;
	var superClassRes = superClassRes;
	
	this.getClassRes = function(){
		return classRes;
	};
	
	this.getSuperClassRes = function(){
		return superClassRes;
	};
};

art_semanticturkey.classRemovedClass = function(classRes){
	var classRes = classRes;
	
	this.getClassRes = function(){
		return classRes;
	};
};

art_semanticturkey.classRenamedClass = function(newClassName, oldClassName){
	var newClassName = newClassName;
	var oldClassName = oldClassName;
	
	this.getNewClassName = function(){
		return newClassName;
	};
	
	this.getOldClassName = function(){
		return oldClassName;
	};
};

/**
 * Rename an instance in the ontology
 * @param {} newIndividualName
 * @param {} oldIndividualName
 */
art_semanticturkey.individualRenamedIndividual = function(newIndividualName, oldIndividualName){
	var oldIndividualName = oldIndividualName;
	var newIndividualName = newIndividualName;
	
	this.getNewIndividualName = function(){
		return newIndividualName;
	};
	this.getOldIndividualName = function(){
		return oldIndividualName;
	};
};
/**
 * Created a new instance in the ontology
 * @param {} instanceName
 * @param {} className
 */
art_semanticturkey.instanceAddedClass = function(instanceName, className){
	var instanceName = instanceName;
	var className = className;
	
	this.getResource = function(){
		return instanceName;
	};
	this.getType = function(){
		return className;
	};
};

/**
 * Removed an instance from the ontology
 * @param {} instanceName
 */
art_semanticturkey.instanceRemovedClass = function(instanceName){
	var instanceName = instanceName;
	
	this.getResource = function(){
		return instanceName;
	};
	
};

/**
 * Created a new Property in the ontology
 * @param {} propertyName
 * @param {} superPropertyName
 */
art_semanticturkey.propertyAddedClass = function(propertyName, superPropertyName, propertyType){
	var propertyName;
	var superPropertyName;
	var propertyType;
	
	this.getResource = function(){
		return propertyName;
	};
	this.getSuperProperty = function(){
		return superPropertyName;
	};
};



/**
 * The subclassof property was added for a class
 * @param {} classRes
 * @param {} superClassRes
 */
art_semanticturkey.subClsOfAddedClass = function(classRes, superClassRes){
	var classRes = classRes;
	var superClassRes = superClassRes;
	
	this.getClassRes = function(){
		return classRes;
	};
	this.getSuperClassRes = function(){
		return superClassRes;
	};
};

/**
 * The subclassof property was removed for a class
 * @param {} classRes
 * @param {} superClassRes
 */
art_semanticturkey.subClsOfRemovedClass = function(classRes, superClassRes){
	var classRes = classRes;
	var superClassRes = superClassRes;
	
	this.getClassRes = function(){
		return classRes;
	};
	this.getSuperClassRes = function(){
		return superClassRes;
	};
};


/**
 * The subproperty property was ramoved for a property
 * @param {} propertyName
 * @param {} superPropertyName
 */
art_semanticturkey.subPropOfRemovedClass = function(propertyName, superPropertyName){
	var propertyName = propertyName;
	var superPropertyName = superPropertyName;
	
	this.getResource = function(){
		return propertyName;
	};
	this.getSuperProp = function(){
		return superPropertyName;
	};
};


/**
 * The type was removed for an instance
 * @param {} instanceRes
 * @param {} classRes
 */
art_semanticturkey.typeRemovedClass = function(instanceRes, classRes){
	alert("ciao22");
	var instanceRes = instanceRes;
	var classRes = classRes;
	
	this.getResource = function(){
		return instanceRes;
	};
	this.getType = function(){
		return classRes;
	};
};


/**
 * The type was added for an instance
 * @param {} instanceRes
 * @param {} classRes
 * @param {} explicit
 * @param {} instanceType
 */
art_semanticturkey.typeAddedClass = function(instanceRes, classRes, explicit, instanceType){
	var instanceRes = instanceRes;
	var classRes = classRes;
	var instanceType = instanceType;
	var explicit = explicit;
	
	this.getResource = function(){
		return instanceRes;
	};
	this.getType = function(){
		return classRes;
	};
	this.getExplicit = function(){
		return explicit;
	};
	this.getIstanceType = function(){
		return instanceType;
	};
};

/**
 * A generic triple was added
 * @param {} subj
 * @param {} predicate
 * @param {} obj
 */
art_semanticturkey.tripleAddedClass = function(subj, predicate, obj){
	var subj = subj;
	var predicate = predicate;
	var obj = obj;
	
	this.getSubject = function(){
		return subj;
	};
	this.getPredicate = function(){
		return predicate;
	};
	this.getObject = function(){
		return obj;
	};
	
};

/**
 * A generic triple was deleted
 * @param {} subj
 * @param {} predicate
 * @param {} obj
 */
art_semanticturkey.tripleDeletedClass = function(subj, predicate, obj){
	var subj = subj;
	var predicate = predicate;
	var obj = obj;
	
	this.getSubject = function(){
		return subj;
	};
	this.getPredicate = function(){
		return predicate;
	};
	this.getObject = function(){
		return obj;
	};
};

art_semanticturkey.projectOpenedClass = function(projName, type){
	var projName = projName;
	var type = type;
	
	this.getProjectName = function(){
		return projName;
	};
	
	this.getType = function(){
		return type;
	};
};

art_semanticturkey.projectClosedClass = function(projName){
	var projName = projName;
	
	this.getProjectName = function(){
		return projName;
	};
};


art_semanticturkey.genericEventClass = function(){
};


/*******************************************************/


/**
 * This class is the one that should be used to register an object for a particuar event
 * @param {} eventId
 * @param {} registeringFunction
 * @param {} unregisteringFunction
 */
art_semanticturkey.eventListener = function(eventId, registeringFunction, unregisteringFunction){
	var eventId = eventId;
	art_semanticturkey.evtMgr.registerForEvent(eventId, this);
	
	
	this.getEventId = function(){
		return eventId;
	};
	
	this.eventHappened = function(eventId, eventObject) {
		registeringFunction(eventId, eventObject);
	};

	this.unregister = function() {
		if(unregisteringFunction != null)
			unregisteringFunction();
		art_semanticturkey.evtMgr.deregisterForEvent(eventId, this);
	};
	
};

/**
 * This class should be used when someone wants to register more than one listener (even for different events)
 * and there is non reason to keep track of the different listener
 */
art_semanticturkey.eventListenerArrayClass = function(){
	var arrayListener = new Array();
	
	this.addEventListenerToArrayAndRegister = function(eventId, registerFunction, deregisterFunction){
		if(arrayListener[eventId] == undefined){
			arrayListener[eventId] = new Array();
		}
		var listener = new art_semanticturkey.eventListener(eventId, registerFunction, deregisterFunction);
		arrayListener[eventId].push(listener);
	};
	
	
	this.deregisterAllListener = function(){
		for ( var id in arrayListener) {
			for(var i=0; i<arrayListener[id].length; ++i){
				art_semanticturkey.evtMgr.deregisterForEvent(id, arrayListener[id][i]);
			}
		}
	};
};



/*****************************************************/

 /*
List of all the eventid used at the moment in Semantic Turkey

* visLevelChanged
* projectOpened
* projectClosed
* rdfLoaded
* clearedData
* removedClass
* createdSubClass
* subClsOfAddedClass
* subClsOfRemovedClass
* renamedClass
* addedType
* removedType
* 
* 
* refreshEditor  just a placeholder for all other events inside the editor panel
* 
*/