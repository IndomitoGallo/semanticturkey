//Daniele Bagni, Marco Cappella (2009): script per la creazione di un nuovo thread


function spawn(generator) {
	return new Thread(generator).start();
}

//Daniele Bagni, Marco Cappella (2009): metodo utilizzato per far dormire un thread
function sleep(millis) {
	setTimeout((yield CONTINUATION), millis);
	yield SUSPEND;
}
