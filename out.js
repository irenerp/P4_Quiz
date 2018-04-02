const figlet = require('figlet');
const chalk = require('chalk');


/**
 *Dar color a un string
 */

 const colorize = (msg, color) =>{
 	if (typeof color !== "undefined"){
 		msg = chalk[color].bold(msg);
 	}
 	return msg;
 };

 /**
  *Escribe un mensage de log
  *Querenmos que se escriba en el localhost conectado
  */
  const log = (socket, msg,color) => {
  	//llamamos a socket para que me escriba lo que quiero
  	//soccket mete un retardo de carro, y metemos la n para el retormo de carro
  	socket.write(colorize(msg,color) + "\n");
  };


/**
*Escribe un mensage de log grande.
*/

const biglog = (socket, msg,color) => {
	log(socket, figlet.textSync(msg, {horizontalLayout: 'full'}), color);	
};

/**
 *Escribe el mensage de error emsg.
 */
const errorlog = (socket, emsg) => {
	socket.write(`${colorize("Error", "red")}: ${colorize(colorize(emsg, "red"), "bgYellowBright")} \n`);
};

exports = module.exports = {
	colorize,
	log,
	biglog,
	errorlog
};
