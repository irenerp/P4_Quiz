const {models} = require('./model');
const {log, biglog, errorlog, colorize} = require('./out');
const Sequelize = require ('sequelize');

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

	models.quiz.findAll()  //Promesa que pasara a la siguiente sentencia. en este caso es catch y no hay sentencias
	.each(quiz => { //tomo todos los quiz
		log(` [${colorize(quiz.id, 'magenta')}]: ${quiz.question}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

/**
 *Muestra el quiz indicado en el parámetro: la pregunta y la respuesta.
 *
 *@param id Clave del quiz a mostrar.
 */
const validateIde = id => {
	//usamos las promesas de Sequelize
	return new Sequelize.Promise ((resolve, reject) => {
		if(typeof id === "undefined"){
			reject(new Error (`Falta el parametro <id>. `));
		}else{
			id=parseInt(id);
			if(Number.isNaN(id)){
				reject(new Error (`El valordel parámetro <id> no es un número.` ));
			}else{
				resolve(id);
			}
		}
	});
};

exports.showCmd = (rl, id) => {
	validateIde(id)
	.then(id = models.quiz.findById(id))
	.then(quiz =>{
		if(!quiz){
			throw ner Error(`No existe un quiz asociado al id = ${id}.`);
		}
		log(`[${colorize(quiz.id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

/*
 *Añade un nuevo quiz al módelo.
 *Pregunta interactivamente por la pregunta y por la respuesta.
 */


//Me creo una constante que hace una pregunta
 const makeQuestion = (rl, text) =>{
 	return new Sequelize.Promise ((resolve, reject) => { 
 		rl.question(colorize(text. 'red'), answer => {
 			resolve(answer.trim()); //resuelvo la promesa con el valor que quiero que me de. Trim para 	quitar espacios vacios. 
 		});
 	});
 };

//minuto 23:31 del video

exports.addCmd = rl => {
	//Promesa que hasta que se teclee la pregunta no finaliza.
	makeQuestion(rl, 'Introduzca una pregunta: ') 
	.then(q => { //Se hace otra promesa. Parametro la promesa del texto
		return makeQuestion(rl, 'Introduzca la respuesta: ')
		.then(a => { //Los pongo anidados para tener acceso a q y a
			return {question: q, answer: a}; //construyo un quiz
			//return de la promesa
		});
	})

	.then((quiz) => { //llamo al metodo para que ma lo cree
		return models.quiz.create(quiz);
	})

	.then((quiz) => {
		log(`${colorize('Se ha añadido', 'magenta')} : ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	//Me pasa en error el error que ha ocurrido
	.catch(Sequelize.ValidationError, error => {
		errorlog('El quiz es erroneo: ');
		//Array con todos los errores que ocurren
		error.errors.forEach(({message}) => errorlog(message));
	})
	//cualquier otro tipo de error
	.catch(error => {
		errorlog(error.message);
	})
	.then(() =>{
		rl.prompt();
	});
}; 



exports.deleteCmd = (rl, id) => {
	//Promesa. Si se cumple me da el id que quiero
	validateIde(id)
	//El elemento que quiero destruir es el que tiene como valor id
	.then(d => models.quiz.destroy({where: {id}}))
	.catch(error => {
		errorlog(error.message);
	})
	.then(() =>{
		rl .prompt();
	});
			
};

exports.editCmd = (rl, id) => {
	validateIde(id) //promesa oara ver si me gista id  
	//pregunta que saco de la base de datos
	.then(id => models.quiz.findById(id)) 
	.then(quiz => {
		if (!quiz) => { //lanzo error si no hay el id que busco 
			throw new Error (`No existe un quiz asociado al id= ${id}.`);
		}

		process.stdout.isTTY && setTimeout(()=> {
			rl.write(quiz.question)}, 0);
		return makeQuestion(rl, 'Introduzca la pregunta: ')
		.then(q => { //texto de la pregunta esta en q
			process.stdout.isTTY && setTimeout(() => {
				rl.write(quiz.answer)}, 0);
			return makeQuestion(rl, 'Introduzcala respuesta: ')
			.then(a => { //Texto de la respuesta esta en a
				quiz.question = q;
				quiz.answer = a;
				return quiz;
			});
		});
	})
	//recivo el quiz cambiado y lo guardo en la base de datos
	.then(quiz => {
		return qui.save();
	})

	.then(quiz => {
		log(`Se ha coambiado el quiz ${colorize(quiz.id, 'magenta')} por: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
	})
	//solo me coge los errores de validacion
	.catch(Sequelize.ValidationError, error => {
		errorlog('El quiz es erroneo: '); 
		//recorro el array mostrando los errores ocurridos
		error.errors.forEach(({message}) => errorlog(message));
	})
	//cualquier error que no es de validacion
	.catch(error => {
		errorlog(error.message);
	})

	.then(() => {
		rl.prompt();
	});
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
	let score = 0;
	let sinHacer = [];
	
	const playOne = () => {
		return Promise.resolve()
		.then(() => {		
		if(sinHacer.length === 0){
			log("Fin del juego! Aciertos: " + score);
			biglog(score, 'magenta');
			rl.prompt();
			return;
		} 
		
		let id = Math.floor(Math.random() * sinHacer.length);
		let quiz = sinHacer[id];
		sinHacer.splice(id, 1);

		makeQuestion(rl, quiz.question)
		.then(answer => {

			if(answer.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
					score++;
					log('CORRECTO - LLeva '+ score + ' aciertos.', 'green');
					playOne();
				} else{
					log('INCORRECTO.', 'red');
					log("Fin del juego! Aciertos: " + score);
					biglog(score, 'magenta');		
				}

			})
		.then(() => {
			rl.prompt();
		});
		});
	};
	/*raw para que solo te devuelva el array con los valores, y no datos extra, si no lo pones no pasa nada */
	models.quiz.findAll({raw: true}) 
	.then(quizzes => {
		sinHacer = quizzes;
	})
	/*Cuando acabe esta promesa llama al playone, no antes porque no estaria el array relleno*/
	.then(() => {
		return playOne();
	})
	.catch(error => {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
	
};

exports.creditsCmd = rl => {
	log('Autores de la practica.');
    log('Irene Ramirez Panduro.', 'green');
    log('Monica Ramirez Panduro.', 'green');
    rl.prompt();
};

exports.quitCmd = rl => {
	rl.close();
	rl.prompt();
};