//=========================================
/*:
 * @plugindesc Add a menu in the actor menu wich use to upgrade the stat
 * with point, wich can won by reach levels.
 * @author Orphanage Studio
 * 
 * @param Default Stats
 * @desc A list of stats Actors can distribute to by default.
 * @default mhp, mmp, atk, def, mat, mdf, agi, luk
 * 
 * @param Default
 * @desc Number of point per lvl
 * @default Math.ceil(level / 10)
 * 
 * @param Default Stats
 * @desc Stats par défaut
 * @defaut
 * 
 * @param Show on Menu
 * @desc If 'true', this plugin will place the command in the menu.
 * @defaut true
 * 
 * @param == Custom Texts ==
 * @default
 * 
 * @param Command Name
 * @desc If 'true', this plugin will place the command in the menu.
 * @defaut true
 * 
 * @param Level Up Message
 * @desc This message is displayed when an actor levels up to show how many points were gained. %1 is the number of points.
 * @defaut Got %1 stat points!
 * 
 * @param Points Text
 * @desc The text used to display how much points an Actor has.
 * @default Stat Points:
 *
 * @param Upgrade Text
 * @desc The text used to display how much points an upgrade is worth.
 * @default Upgrade Cost:
 *
 * @param Spend Text
 * @desc The text used in the command window to begin spending.
 * @default Spend
 * 
 * @param Finish Text
 * @desc The text used in the command window to leave the scene.
 * @default Finish
 * 
 * 
 * @help
 * == Base Stats ==
 * mhp - Max HP
 * mmp - Max MP
 * atk - Attack
 * def - Defense
 * mat - Magical Attack
 * mdf - Magical Defense
 * agi - Agility
 * luk - Luck
*/


var Avalor = Avalor || {};
Avalor.LINK = Avalor.LINK || {}; //permet d'éviter les undefined, si on ne trouve pas la variable Avalor
Avalor.LINK.Stats = Avalor.LINK.Stats|| {}; 
Avalor.LINK.version = 1.00

var $dataDistributeStats = {};

function Scene_Distribute() {
	this.initialize.apply(this, arguments);
}

function Window_DistributePoints() {
	this.initialize.apply(this, arguments);
}

function Window_Distribute() {
	this.initialize.apply(this, arguments);
}

Avalor.Parameters = PluginManager.parameters('Avalor_Stats'); //affiche le nom dans le gestionnaire de plugin


Avalor.Param = Avalor.Param || {};

Avalor.Param.stats = String(params['Default Stats']).split(";");
Avalor.Param.formula = String(params['Default Formula']); // formule pour le gain de point par level
Avalor.Param.show = String(params['Show on Menu']) === 'true'; //affiche la commande dans le menu

Avalor.Param.name = String(params['Command Name']);
Avalor.Param.messsage = String(params['Level Up Message']);
Avalor.Param.points = String(params['Points Text']);   // pour ces 6 là tout est dit mdr
Avalor.Param.upgrade = String(params['Upgrade Text']);
Avalor.Param.spendText = String(params['Spend Text']);
Avalor.Param.finishText = String(params['Finish Text'])

Avalor.Param.checkFileExists = function() {
	FileManager.checkDataExists("DistributionStats.json", JsonEx.stringify({
		"mhp":{"name":"Max HP","description":"The maximum amount of HP for the actor.","cost":"1","gain":"5","max":"500","min_col":"#ffa655","max_col":"#ea7000"},
		"mmp":{"name":"Max MP","description":"The maximum amount of MP for the actor.","cost":"1","gain":"2","max":"200","min_col":"#6666ff","max_col":"#0000ff"},
		"atk":{"name":"Attack","description":"Strengthens the damage of physical skills used by \nthe actor.","cost":"1","gain":"1","max":"100","min_col":"#ff7777","max_col":"#f90000"},
		"def":{"name":"Defense","description":"Reduces the damage of physical skills the actor is \ntargeted with.","cost":"1","gain":"1","max":"100","min_col":"#52ff33","max_col":"#12b700"},
		"mat":{"name":"Magic Attack","description":"Strengthens the damage of magical skills used by \nthe actor.","cost":"1","gain":"1","max":"100","min_col":"#b355ff","max_col":"#a300d9"},
		"mdf":{"name":"Magic Defense","description":"Reduces the damage of magical skills the actor is \ntargeted with.","cost":"1","gain":"1","max":"100","min_col":"#55ffe6","max_col":"#00d7b7"},
		"agi":{"name":"Agility","description":"Determines how soon the actor will be able to \npreform a turn in battle.","cost":"1","gain":"1","max":"100","min_col":"#fbff55","max_col":"#d9d300"},       
		"luk":{"name":"Luck","description":"Influences various luck factors for the actor in \ntheir favor.","cost":"1","gain":"1","max":"100","min_col":"#ff55e6","max_col":"#cc00ad"},
	}));
};

Avalor.Param.checkFileExists(); //vérifie que le fichier existe 


//Plugin_Command
//================

Avalor.PluginCommands._sd_getActorType = function(args) { //permet d'jouter des point au perso principal
	const type = String(args[0]).toLowerCase();				
	const id = parseInt(args[1]);
	let actor;
	if(type === 'actor') {
		actor = $gameActors.actor(id);
	}
	return actor;
};

Avalor.PluginCommands['openstatdistribution'] = function(args) { // fonction dubouton permet d'ouvrir
	const actor = Avalor.PluginCommands._sd_getActorType(args);  //le menu de la distribution de stats.
	if(actor) {
		$gameParty.setMenuActor(actor);
		SceneManager.push(Scene_Distribute);
	}
};

Avalor.PluginCommands['addstatpoints'] = function(args) { // fonction du bouton qui permet d'ajouter les points
	const actor = Avalor.PluginCommands._sd_getActorType(args);
	if(actor) {
		const points = parseInt(args[2]);
		actor.addDistributePoints(points);
	}
};



// Data_Manager
//================

DataManager._testExceptions.push("DistributionStats.json");
DataManager.Avalor.databaseFiles.push({name: '$dataDistributeStats', src: "DistributionStats.json"});
// Permet d'envoyer le fichier avec les données dans la base de donnée

// Game_Actor
//================

Game_Actor.Params = ['mhp', 'mmp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk']; //paramètre qui vont être utilisé pour les points

Avalor.Game_Actor_initMembers = Game_Actor.prototype.initMembers; //initie les paramètre de points à 0
Game_Actor.prototype.initMembers = function() {						
	Avalor.Game_Actor_initMembers.apply(this, arguments);
	this._ditributePoints = 0;
	this._pointGained = 0;
	this._pointGainedTemp = 0;
	this.clearDistributePointSpent();   //fonction pour remettre les points utilisé à 0
	this.clearDistributeStats();		//fonction pour remettre les stat avant l'ajout de point
};

Avalor.Game_Actor_paramRate = Game_Actor.prototype.paramBase;
Game_Actor.prototype.paramBase = function(paramId) {
	return _.Game_Actor_paramRate.apply(this, arguments) + this._distributeParams[paramId];
};

Avalor.Game_Actor_levelUp = Game_Actor.prototype.levelUp; //appel de la fonction pour le level up
Game_Actor.prototype.levelUp = function() {					
	_.Game_Actor_levelUp.apply(this, arguments);		//applique la fonction gainDistributePoints
	this.gainDistributePoints();
};

Game_Actor.prototype.distributePoints = function() { //fonction pour initier distributionPoints
	return this._distributePoints;
};

Game_Actor.prototype.setDistributePoints = function(value) { //fonction pour attribuer distributionPoints à "value"
	this._distributePoints = value;
};

Game_Actor.prototype.addDistributePointsTemp = function(value) { 
	this.setDistributePoints(this._distributePoints + value);
};

Game_Actor.prototype.addDistributePoints = function(value) { //ajoute le nombre de point 
	this._pointsGained += value;
	this._pointsGainedTemp += value;
	this.addDistributePointsTemp(value);
};

Game_Actor.prototype.gainDistributePoints = function() {   //fonction pour le gain de points par level
	const formula = this.actor()._sd_formula || _.formula;
	const level = this._level;
	const actor = this;
	const points = eval(formula);
	this.addDistributePoints(points);
};

Game_Actor.prototype.pointsUsed = function() {   // indique le nombre de point utilisé
	return this._pointsGained - this._distributePoints;
};

Game_Actor.prototype.addDistributePointsSpent = function(value) { //ajoute le nombre de point utilisé (distribué)
	this._distributePointsSpent += value;
};

Game_Actor.prototype.clearDistributePointsSpent = function() { // remet le compteur de point ditribué à 0
	this._distributePointsSpent = 0;
};

Game_Actor.prototype.clearDistributeStats = function() { //remet les stat distribué à 0 pour toute
	this._distributeParams = [0, 0, 0, 0, 0, 0, 0, 0];
};

Game_Actor.prototype.getDistribute = function(param) {
	return this._distributeParams[Game_Actor.Params.indexOf(param)];	//prends les point attribué
};

Game_Actor.prototype.addDistribute = function(param, value) { // attribue les points
	this.addBaseDistribute(Game_Actor.Params.indexOf(param), value);			
};

// Scene_Menu 
//================

Avalor.Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow; //initie la scene 
Scene_Menu.prototype.createCommandWindow = function() {
	this._commandWindow.setHandler('Stat Upgrade', this.command.bind(this));
};

Avalor.Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk; 
Scene_Menu.prototype.onPersonalOk = function() {
	if(this._commandWindow.currentSymbol() === 'Stat Upgrade') { //permet d'ouvrir StatDistribution si on appuie sur Stat Upgrade
		this.openStatDistribution();
		return;
	}
	Avalor.Scene_Menu_onPersonalOk.apply(this, arguments);
};
/** Scene_Menu.prototype.onPersonalOk = function() {      voilà la fonction dans rpg_scene, à laquelle conrespond
    switch (this._commandWindow.currentSymbol()) {		  Scene_Menu.prototype.onPersonalOk 
    case 'skill':
        SceneManager.push(Scene_Skill);
        break;
    case 'equip':
        SceneManager.push(Scene_Equip);
        break;
    case 'status':
        SceneManager.push(Scene_Status);
        break;
    }
};*/


Scene_Menu.prototype.openStatDistribution = function() {  // ouvre le menu où on va attribuer les points 
	SceneManager.push(Scene_Distribute);
};

// Scene_Distribute
//===================
// La classe pour distribuer

Avalor.Scene_Name.prototype = Object.create(Scene_Distribute.prototype); //créer l'objet scene distribute
Avalor.Scene_Name.prototype.constructor = Scene_Distribute;

Avalor.Scene_Distribute.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
	ImageManager.loadFace($gameParty.menuActor().faceName()); //va permettre dans la fenêtre de voir le visage de personnage
};

Scene_Distribute.prototype.create = function() {
	Scene_MenuBase.prototype.create.call(this);
	this.createCommandWindow(); // 
	this.createPointsWindow(); // 
	this.createDistributeWindow();  // 
	this.refreshActor();   // 
};

Scene_Distribute.prototype.createStatusWindow = function() {
	const wy = this._commandWindow.y + this._commandWindow.height;
	this._statusWindow = new Window_DistributeStatus(0, wy);
	this.addWindow(this._statusWindow);
}; 

Scene_Distribute.prototype.createPointsWindow = function() {
	const wy = this._statusWindow.y + this._statusWindow.height;
	this._pointsWindow = new Window_DistributePoints(0, wy);
	this.addWindow(this._pointsWindow);
	this._commandWindow.setPointsWindow(this._pointsWindow);
}; // créer la fenêtre de point acquis

Scene_Distribute.prototype.createDistributeWindow = function() {
	const wx = this._statusWindow.width;  
	const wy = this._commandWindow.y + this._commandWindow.height;
	const ww = Graphics.boxWidth - wx;
	this._distributeWindow = new Window_Distribute(wx, wy, ww);
	this._distributeWindow.setStatusWindow(this._statusWindow);
	this._distributeWindow.setPointsWindow(this._pointsWindow);
	this._distributeWindow.setHandler('finish', this.distributeFinish.bind(this));
	this._distributeWindow.setHandler('cancel', this.distributeCancel.bind(this));
	this.addWindow(this._distributeWindow);
}; // créer la fenêtre de distribution

Scene_Distribute.prototype.refreshActor = function() {
	const actor = this.actor();
	this._commandWindow.setActor(actor);
	this._statusWindow.setActor(actor);
	this._distributeWindow.setActor(actor);
};