//Nombre del fichero donde se guardan las preguntas
const fs = require("fs");

//Carga el contenido del fichero DB_FILENAME en la variable quizzes
const DB_FILENAME = "quizzes.json";

const load = () => {
	fs.readFile(DB_FILENAME, (err, data)=> {
		if(err){
			//La primera vez no existe el fichero
			if(err.code === "ENOENT"){
				save(); //valores iniciales
				return;
			}
			throw err;
		}
		let json = JSON.parse(data);
		if(json){
			quizzes = json;
		}
	});
};

//guarda las preguntas en el fichero

const save = () => {
	fs.writeFile(DB_FILENAME,
		JSON.stringify(quizzes),
		err => {
			if (err) throw err;
		});
};

let quizzes = [
{
	question: "Capital de Italia",
	answer: "Roma"
},
{
	question: "Capital de España",
	answer: "Madrid"
},
{
	question: "Capital de Portugal",
	answer: "Lisboa"
},
{
	question: "Capital de Francia",
	answer: "Paris"
}
];

/**Devuelve el numero total de preguntas existentes
*/
exports.count = () => quizzes.length;

/**Añade un nuevo quiz
*/

exports.add = (question, answer) => {
	quizzes.push({
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};

/**Actualiza el quiz situado en la posicion index
*/

exports.update = (id, question, answer) => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined") {
		throw new Error(`El valor del parametro id no es valido.`);
	}
	quizzes.splice(id, 1, {
		question: (question || "").trim(),
		answer: (answer || "").trim()
	});
	save();
};


/**
 *Devuelve todos los quizzes existentes.
 */

 exports.getAll = () => JSON.parse(JSON.stringify(quizzes));

 /**
 *Devuelve un clon del quiz almacenado 
 */


exports.getByIndex = id => {
	const quiz = quizzes[id];
	if(typeof quiz === "undefined"){
		throw new Error(`El valor del parametro id no es valido.`);
	}
	return JSON.parse(JSON.stringify(quiz));
};

/**
*Elimina el quiz situado en la posicion dada
*/
exports.deleteByIndex = id => {
	const quiz = quizzes[id];
	if (typeof quiz === "undefined") {
		throw new Error(`El valor del parametro id no es valido.`);
	}
	quizzes.splice(id, 1);
	save();
};

//carga los quizzes almacenados en el fichero
load();