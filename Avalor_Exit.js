//=============================================================================
 /*:
 * @plugindesc Add a exit command in the title screen
 * and also in the Menu during the game.
 * @author Orphanage Studio
*
 * @param Exit name
 * @desc Name of your "Exit command".
 * @default Exit 
 * 
 * @help
 * Permet d'ajouter un boutton Exit dans le menu principal et dans le menu "echap"
 * 

 */


var Avalor = Avalor || {};
Avalor.LINK = Avalor.LINK || {}; //Le Link permet d'éviter les undifined de la valeur Avalor si le moteur ne la trouve pas
Avalor.LINK.version = 1.00

Avalor.Parameters = PluginManager.parameters('Avalor_Exit'); //Affiche le plugin dans le plugin Manager
Avalor.exit_commandName = String(Avalor.Parameters['Exit name'] || "Quitter"); // Paramètre le nom du bouton "Exit" dans plugin manager


// Window_TitleCommand
//===================
// La fenêtre pour "New Game/Continue" dans l'écran titre.

Avalor.LINK.Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
Window_TitleCommand.prototype.makeCommandList = function() { 
    Avalor.LINK.Window_TitleCommand_makeCommandList.call(this); // appel la fonction a addComand
		this.addCommand(String(Avalor.exit_commandName), 'homepage' );
};

//Window_GameEnd
//===================
// La fenêtre pour le retour à l'écran titre.

Avalor.LINK.Window_GameEnd_makeCommandList = Window_GameEnd.prototype.makeCommandList;
Window_GameEnd.prototype.makeCommandList = function() {
    Avalor.LINK.Window_GameEnd_makeCommandList.call(this);
	this.addCommand(String(Avalor.exit_commandName), 'Quitter');
};

// SceneMenu
//===================
// La classe de la scene du menu

Avalor.LINK.Scene_GameEnd_createCommandWindow = Scene_GameEnd.prototype.createCommandWindow;
	Scene_GameEnd.prototype.createCommandWindow = function() {  //créer la commande pour le bouton
    Avalor.LINK.Scene_GameEnd_createCommandWindow.call(this);
		this._commandWindow.setHandler('Quitter', this.commandExit.bind(this)); 
		//on attribue cette commande à la référence du paramètre String modifiable
};

Scene_GameEnd.prototype.commandExit = function() { //appel de la commande pour quitter la scene où l'on se trouve
	this.fadeOutAll();								// Ici depuis le menu en jeu
	SceneManager.exit();  //fadeOutAll fait un fondu au noir, avant que SceneManager.exit fasse son taff
};


// Scene_Base
//===================
// La classe de la scene de l'écran titre.

Avalor.LINK.Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
Scene_Title.prototype.createCommandWindow = function() {
    Avalor.LINK.Scene_Title_createCommandWindow.call(this);
		this._commandWindow.setHandler('homepage', this.command.bind(this));
};

Scene_Title.prototype.command = function() {  //appel de la commande pour quitter la scene où l'on se trouve
	this.fadeOutAll();							// Ici depuis le menu principal
	SceneManager.exit();
};


