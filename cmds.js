const model = require('./model');
const {log, biglog, errorlog, colorize} = require('./out');

/**
 *Muestra la ayuda.
 */

exports.helpCmd = rl => {
	  log("commandos", "green");
      log(" h|help - Muestra esta ayuda");
      log(" list - Listar los quizzes existentes.");
      log(" show <id> - Muestra la pregunta y la respuesta el quiz indicado");
      log(" add - Añadir un nuevo quiz interactivamente");
      log(" delete <id> - Editar el quiz ind icado.");
      log(" edit <id> - Editar el quiz indicado.");
      log(" test <id> - Probar el quiz indicado.");
      log(" p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
      log(" credits - Créditos.");
      log(" q|quiz - Salir del programa.");
      rl.prompt();
};
/**
 *Lista todos los quizzes existentes en el medio.
 */

exports.listCmd = rl => {
	model.getAll().forEach((quiz, id) => {
		//Imprimir por pantalla
		log(`[${colorize(id, 'magenta')}]: ${quiz.question}`);
	});
	rl.prompt();
};

/**
 *Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 *@param id Clave del quiz a mostrar.
 */

exports.showCmd = (rl, id) => {
	//compruebo que este el parametro id
	if(typeof id === "undefined"){
		errorlog(`Falta el parametro id`);
	}else{
		try{
			//Intento acceder a la pregunta de id
			const quiz = model.getByIndex(id);
			log(`[${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
		}catch(error){
			errorlog(error.message);
		}
	}

	rl.prompt();
};

/*
 *Añade un nuevo quiz al módelo.
 *Pregunta interactivamente por la pregunta y por la respuesta.
 */

exports.addCmd = rl => {
	rl.question(colorize('Introduzca una pregunta: ', 'red'), question => {
		rl.question(colorize('Introduzca la respuesta: ', 'red'), answer => {
			model.add(question,answer);
			//$interpolacion de strings
			log(`${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
		});
	});
}; 

exports.deleteCmd = (rl, id) => {
	if(typeof id === "undefined"){
		errorlog(`Falta el parametro id`);
	}else{
		try{
			//Intento acceder a la pregunta de id
			const quiz = model.deleteByIndex(id);
			
		}catch(error){
			errorlog(error.message);
		}
	}
	rl.prompt();
};

exports.editCmd = (rl, id) => {
	if(typeof id === "undefined"){
		errorlog(`Falta el parametro id`);
		rl.prompt(); 
	}else{
		try{
			const quiz = model.getByIndex(id);
			process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);
			rl.question(colorize('Introduzca una pregunta: ', 'red'), question =>{
				process.stdout.isTTY && setTimeout (() => {rl.write(quiz.answer)},0);
				rl.question(colorize('Introduzca la respuesta: ', 'red'), answer => {
					model.update(id, question, answer);
					//quiero modificar la posicion
					log(`Se ha cambiado el quiz ${colorize(id, 'magenta')} por: ${question} ${colorize('=>', 'magenta')} ${answer}`);
					rl.prompt();
				});
			});

		}catch(error){
			errorlog(error.message); 
			rl.prompt();
		}
	}

};

exports.testCmd = (rl, id) => {
	if(typeof id === "undefined"){
		errorlog(`Falta el parametro id`);
		rl.prompt(); 
	}else{
		try{
			const quiz = model.getByIndex(id);
			rl.question(colorize(quiz.question + '? ', 'red'), answer =>{
				if(quiz.answer.toLowerCase().trim() === answer.toLowerCase().trim()){
					log('Su respuest es correcta.', 'yellow');
					biglog('CORRECTO', 'green');
				}else{
					log('Su respuest es incorrecta.', 'yellow');
					biglog('INCORRECTO', 'red');
				}
				rl.prompt(); 
		});
	}catch(error){
			errorlog(error.message); 
			rl.prompt();
		}
	}

};

exports.playCmd = rl => {
	//variable para almacenar preguntas acertadas
	let score = 0;
	//Para no repetir las preguntas tengo un array con los id
	let toBeResolved = [];
	for(let i=0; i< model.count(); i++){
		toBeResolved[i] = model.getByIndex(i);
	}
	//ma invento una constante(funcion play) = funcion 
	const playOne = () => {

		if(toBeResolved.length === 0){
			log('No hay nada más que preguntar.' , 'yellow');
			log ('Aciertos: ' + score);
			biglog(score, 'green');
			score = 0;
			rl.prompt();
		}else{
			//cogemos una variable(pregunta) al azar y la quitamos para que no se repita
			let idRandom = Math.random()*(toBeResolved.length - 1); //me da el tamaño maximo del array con *
			let id = Math.round(idRandom);
			//Hago la pregunta
			rl.question(colorize(toBeResolved[id].question+"? ", 'red'), answer => {
				if(toBeResolved[id].answer.toLowerCase().trim() === answer.toLowerCase().trim()){
					score ++;
					log('CORRECTO - Lleva ' + score + ' aciertos.', 'yellow');
					toBeResolved.splice(id, 1);
					//llamo a la funcion para que vuelva a empezar
					playOne();
					//rl.prompt();
				}else{
					log('INCORRECTO', 'red');
					log('Fin del juego. Aciertos: ' + score, 'yellow');
					biglog(score, 'green');
					rl.prompt();
				}
			});

		}
	};

	playOne();
	
};

exports.creditsCmd = rl => {
	log('Autores de la practica.');
    log('Irene Ramirez Panduro.', 'green');
    log('Mónica Ramirez Panduro.', 'green');
    rl.prompt();
};

exports.quitCmd = rl => {
	rl.close();
	rl.prompt();
};