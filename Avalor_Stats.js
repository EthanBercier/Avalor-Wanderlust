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
 * @param Default point
 * @desc Number of point per lvl
 * @default 1
 *  
 * @param Default Star Stat
 * @desc Number of Star point per lvl
 * @default 2
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
Avalor.Param.formula = Number(params['Default point']); //gain de point par level (palier)
Avalor.Param.star = Number(params['Star Stat']); //gain de point par level (stat étoile)
Avalor.Param.show = String(params['Show on Menu']) === 'true'; //affiche la commande dans le menu

Avalor.Param.name = String(params['Command Name']);
Avalor.Param.messsage = String(params['Level Up Message']);
Avalor.Param.points = String(params['Points Text']);   // pour ces 6 là tout est dit mdr
Avalor.Param.upgrade = String(params['Upgrade Text']);
Avalor.Param.spendText = String(params['Spend Text']);
Avalor.Param.finishText = String(params['Finish Text'])

Avalor.Param.checkFileExists = function() {
	FileManager.checkDataExists("DistributionStats.json", JsonEx.stringify({
		"mhp":{"name":"Max HP","description":"The maximum amount of HP for the actor.","cost":"1","gain":"1","max":"200","min_col":"#ffa655","max_col":"#ea7000"},
		"mmp":{"name":"Max MP","description":"The maximum amount of MP for the actor.","cost":"1","gain":"1","max":"200","min_col":"#6666ff","max_col":"#0000ff"},
		"atk":{"name":"Attack","description":"Strengthens the damage of physical skills used by \nthe actor.","cost":"1","gain":"1","max":"200","min_col":"#ff7777","max_col":"#f90000"},
		"def":{"name":"Defense","description":"Reduces the damage of physical skills the actor is \ntargeted with.","cost":"1","gain":"1","max":"200","min_col":"#52ff33","max_col":"#12b700"},
		"mat":{"name":"Magic Attack","description":"Strengthens the damage of magical skills used by \nthe actor.","cost":"1","gain":"1","max":"200","min_col":"#b355ff","max_col":"#a300d9"},
		"mdf":{"name":"Magic Defense","description":"Reduces the damage of magical skills the actor is \ntargeted with.","cost":"1","gain":"1","max":"200","min_col":"#55ffe6","max_col":"#00d7b7"},
		"agi":{"name":"Agility","description":"Determines how soon the actor will be able to \npreform a turn in battle.","cost":"1","gain":"1","max":"200","min_col":"#fbff55","max_col":"#d9d300"},       
		"luk":{"name":"Luck","description":"Influences various luck factors for the actor in \ntheir favor.","cost":"1","gain":"1","max":"200","min_col":"#ff55e6","max_col":"#cc00ad"},
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
	if(this._level % 5 === 0){
		_.Game_Actor_levelUp.apply(this, arguments);		//applique la fonction gainDistributePoints
		this.gainDistributePoints();	
	}				
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


Avalor.Game_Actor_levelPoint = Game_Actor.prototype.levelPoint; //pour établir combien de point gagné par stat tout les niveaux
Game_Actor.prototype.levelUp = function(){
	for(i=0; i< Params.length; i++){
		Params[i] += 1;
	}
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

Scene_Distribute.prototype.commandSpend = function() {
	this._distributeWindow.activate();
	this._distributeWindow.select(0);
};

Scene_Distribute.prototype.distributeFinish = function() {
	this._distributeWindow.applyBonuses();
	this._distributeWindow.clearInfo();
	this._statusWindow.refresh();
	this.distributeEnd();
};

Scene_Distribute.prototype.distributeCancel = function() {
	this._distributeWindow.restartInfo();
	this.distributeEnd();
};

Scene_Distribute.prototype.distributeEnd = function() {
	this._pointsWindow.clear();
	this._distributeWindow.refresh();
	this._distributeWindow.deselect();
	this._commandWindow.activate();
	this._commandWindow.refreshCost();
	this._commandWindow.refresh();
};

Scene_Distribute.prototype.onActorChange = function() {
	this.refreshActor();
	this._commandWindow.activate();
};

// Window_MenuCommand
//-----------------------------------------------------------------------------

_.Window_MenuCommand_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function() {
	_.Window_MenuCommand_addOriginalCommands.apply(this, arguments);
	if(_.show) {
		this.addCommand(_.name, 'distribute', this.isDistributeEnabled());
	}
};

Window_MenuCommand.prototype.isDistributeEnabled = function() {
	return true;
};

// Window_DistributeCommand
//-----------------------------------------------------------------------------
// Pour les commandes disposées à l'horizontale

Window_DistributeCommand.prototype = Object.create(Window_HorzCommand.prototype);
Window_DistributeCommand.prototype.constructor = Window_DistributeCommand;

Window_DistributeCommand.prototype.initialize = function(x, y) {
	Window_HorzCommand.prototype.initialize.call(this, x, y);
	this._cost = 0;
	this._actor = null;
	this._pointsWindow = null;
};

Window_DistributeCommand.prototype.playOkSound = function() {
	const symbol = this.commandSymbol(this.index());
	if(symbol === 'clear') {
		SoundManager.playUseItem();
	} else {
		Window_HorzCommand.prototype.playOkSound.apply(this, arguments);
	}
};

Window_DistributeCommand.prototype.windowWidth = function() {
	return Graphics.boxWidth;
};

Window_DistributeCommand.prototype.maxCols = function() {
	return this._list.length;
};

Window_DistributeCommand.prototype.makeCommandList = function() {
	this.addCommand(_.spendText, 'spend');
	if(_.reset) {
		const actorReady = this._actor && this._actor.pointsUsed() > 0;
		this.addCommand(_.resetText, 'clear', actorReady && this._cost <= $gameParty.gold());
	}
	this.addCommand(_.finishText, 'cancel');
};

Window_DistributeCommand.prototype.setPointsWindow = function(window) {
	this._pointsWindow = window;
};

Window_DistributeCommand.prototype.setActor = function(actor) {
	if(this._actor !== actor) {
		this._actor = actor;
		this.refreshCost();
		this.refresh();
	}
};

Window_DistributeCommand.prototype.getCost = function() {
	return this._cost;
};

Window_DistributeCommand.prototype.refreshCost = function() {
	const actor = this._actor;
	const level = this._actor.level;
	const points = this._actor.pointsUsed();
	this._cost = eval(_.cost);
};

Window_DistributeCommand.prototype.select = function(index) {
	Window_HorzCommand.prototype.select.apply(this, arguments);
	if(!this._pointsWindow) return;
	const symbol = this.commandSymbol(index);
	this._pointsWindow.clear();
	if(symbol === 'clear') {
		this._pointsWindow.setGoldCost(this._cost);
	}
};

Window_DistributeCommand.prototype.setActor = function(actor) {
	if(this._actor !== actor) {
		this._actor = actor;
		this.refreshCost();
		this.refresh();
	}
};

Window_DistributeCommand.prototype.getCost = function() {
	return this._cost;
};

Window_DistributeCommand.prototype.refreshCost = function() {
	const actor = this._actor;
	const level = this._actor.level;
	const points = this._actor.pointsUsed();
	this._cost = eval(_.cost);
};

Window_DistributeCommand.prototype.select = function(index) {
	Window_HorzCommand.prototype.select.apply(this, arguments);
	if(!this._pointsWindow) return;
	const symbol = this.commandSymbol(index);
	this._pointsWindow.clear();
	if(symbol === 'clear') {
		this._pointsWindow.setGoldCost(this._cost);
	}
};

// Window_DistributePoints
//-----------------------------------------------------------------------------

Window_DistributePoints.prototype = Object.create(Window_Base.prototype);
Window_DistributePoints.prototype.constructor = Window_DistributePoints;

Window_DistributePoints.prototype.initialize = function(x, y) {
	const width = this.windowWidth();
	const height = this.windowHeight();
	Window_Base.prototype.initialize.call(this, x, y, width, height);
	this._actor = null;
	this._points = 0;
};

Window_DistributePoints.prototype.windowWidth = function() {
	return 408;
};

Window_DistributePoints.prototype.windowHeight = function() {
	return this.fittingHeight(1);
};

Window_DistributePoints.prototype.refresh = function() {
	const x = this.textPadding();
	const width = this.contentsWidth() - this.textPadding() * 2;
	const unitWidth = _.iconIndex ? Window_Base._iconWidth : this.textWidth(_.pointText);
	this.clear();
	this.resetTextColor();
	this.drawText(this.points(), x, 0, width - unitWidth - 12, 'right');
	if(_.iconIndex) {
		this.drawIcon(_.iconIndex, this.windowWidth() - this.standardPadding() - Window_Base._iconWidth - 24, 2);
	} else {
		this.changeTextColor(_.labelColor);
		this.drawText(_.pointText, x, 0, width - 6, 'right');
	}
	this.changeTextColor(this.systemColor());
	this.contents.fontSize = 24;
	this.drawText(this.label(), 0, 0, width, 'left');
	this.resetFontSettings();
};

Window_DistributePoints.prototype.clear = function() {
	this.contents.clear();
};

Window_DistributePoints.prototype.points = function() {
	return this._points;
};

Window_DistributePoints.prototype.setValue = function(value) {
	this._points = value;
	this.refresh();
};

Window_DistributePoints.prototype.label = function() {
	return _.upgrade;
};

Avalor.Window_Gold_refresh = Window_Gold.prototype.refresh;
Window_DistributePoints.prototype.setGoldCost = function(gold) {
	this._value = gold;
	_.Window_Gold_refresh.apply(this, arguments);
	this.drawResetCost();
};

Window_DistributePoints.prototype.drawResetCost = function() {
	const width = this.contentsWidth() - this.textPadding() * 2;
	this.changeTextColor(this.systemColor());
	this.contents.fontSize = 24;
	this.drawText("Reset Cost:", 0, 0, width, 'left');
	this.resetFontSettings();
};

Window_DistributePoints.prototype.currencyUnit = Window_Gold.prototype.currencyUnit;

Window_DistributePoints.prototype.value = function() {
	return this._value;
};

// Window_DistributeStatus
//-----------------------------------------------------------------------------

Window_DistributeStatus.prototype = Object.create(Window_Selectable.prototype);
Window_DistributeStatus.prototype.constructor = Window_DistributeStatus;

Window_DistributeStatus.prototype.initialize = function(x, y) {
	Window_Selectable.prototype.initialize.call(this, x, y, 408, this.fittingHeight(8));
	this._actor = null;
	this.refresh();
	this.activate();
};

Window_DistributeStatus.prototype.setActor = function(actor) {
	if(this._actor !== actor) {
		this._actor = actor;
		this.refresh();
	}
};

Window_DistributeStatus.prototype.refresh = function() {
	this.contents.clear();
	if(this._actor) {
		const lineHeight = this.lineHeight();
		//Line 1
		this.drawActorName(this._actor, 6, 0);
		this.drawActorClass(this._actor, 192, 0);
		//Line 2
		this.drawHorzLine(lineHeight);
		//Line 3
		this.drawActorFace(this._actor, 12, lineHeight * 2);
		this.drawBasicInfo(180, lineHeight * 2, this.contentsWidth() - 180);
		//Line 7
		this.drawHorzLine(lineHeight * 6);
		//Line 8
		this.drawActorPoints(lineHeight * 7, this.contentsWidth() - this.textPadding() * 2);
	}
};

Window_DistributeStatus.prototype.drawBasicInfo = function(x, y, width) {
	const lineHeight = this.lineHeight();
	this.drawActorLevel(this._actor, x, y + lineHeight * 0);
	this.drawActorIcons(this._actor, x, y + lineHeight * 1);
	this.drawActorHp(this._actor, x, y + lineHeight * 2, width);
	this.drawActorMp(this._actor, x, y + lineHeight * 3, width);
};

Window_DistributeStatus.prototype.drawHorzLine = function(y) {
	const lineY = y + this.lineHeight() / 2 - 1;
	this.contents.paintOpacity = 48;
	this.contents.fillRect(0, lineY, this.contentsWidth(), 2, this.normalColor());
	this.contents.paintOpacity = 255;
};

Window_DistributeStatus.prototype.drawActorPoints = function(y, width) {
	const x = this.textPadding();
	const unitWidth = _.iconIndex ? Window_Base._iconWidth : this.textWidth(_.pointText);
	this.resetTextColor();
	this.drawText(this._actor.distributePoints(), x, y, width - unitWidth - 12, 'right');
	if(_.iconIndex) {
		this.drawIcon(_.iconIndex, this.width - this.standardPadding() - Window_Base._iconWidth - 24, y + 2);
	} else {
		this.changeTextColor(_.labelColor);
		this.drawText(_.pointText, x, y, width - 6, 'right');
	}
	this.contents.fontSize = 24;
	this.drawText(_.points, 0, y, width, 'left');
	this.resetFontSettings();
};

Window_DistributeStatus.prototype.refreshPoints = function() {
	const lineHeight = this.lineHeight();
	const width = this.contentsWidth();
	this.contents.clearRect(0, lineHeight * 7, width, lineHeight);
	this.drawActorPoints(lineHeight * 7, width - this.textPadding() * 2);
};

// Window_Distribute
//-----------------------------------------------------------------------------

Window_Distribute.prototype = Object.create(Window_Command.prototype);
Window_Distribute.prototype.constructor = Window_Distribute;

Window_Distribute.prototype.initialize = function(x, y, width) {
	this._windowWidth = width;
	this._maxHeight = Graphics.boxHeight - y;
	this._statusWindow = null;
	this._pointsWindow = null;
	this.clearInfo();
	Window_Command.prototype.initialize.call(this, x, y);
	this.deselect();
	this.deactivate();
};

Window_Distribute.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
	const fillW = Math.floor(width * rate);
	const gaugeY = y + this.lineHeight() - 2 - _.gaugeHeight;
	this.contents.fillRect(x - 1, gaugeY - 1, width + 2, _.gaugeHeight + 2, "#000");
	this.contents.fillRect(x, gaugeY, width, _.gaugeHeight, this.gaugeBackColor());
	this.contents.gradientFillRect(x, gaugeY, fillW, _.gaugeHeight, color1, color2);
};

Window_Distribute.prototype.playOkSound = function() {
	const symbol = this.commandSymbol(this.index());
	if(symbol === 'finish') {
		SoundManager.playSave();
	} else {
		Window_Command.prototype.playOkSound.apply(this, arguments);
	}
};

Window_Distribute.prototype.windowWidth = function() {
	return this._windowWidth;
};

Window_Distribute.prototype.windowHeight = function() {
	return Math.min(this.fittingHeight(this.numVisibleRows()), this._maxHeight);
};

Window_Distribute.prototype.setActor = function(actor) {
	if(this._actor !== actor) {
		this._actor = actor;
		this.clearInfo();
		this.refresh();
	}
};

Window_Distribute.prototype.setStatusWindow = function(window) {
	this._statusWindow = window;
};

Window_Distribute.prototype.setPointsWindow = function(window) {
	this._pointsWindow = window;
};

Window_Distribute.prototype.restartInfo = function() {
	this._actor.addDistributePointsTemp(this._pointsSpent);
	this.refreshEverything();
	this.clearInfo();
};

Window_Distribute.prototype.clearInfo = function() {
	this._pointsSpent = 0;
	this._maxPoints = this._actor ? this._actor.distributePoints() : 0;
	this._bonuses = {};
};

Window_Distribute.prototype.applyBonuses = function() {
	if(this._actor) {
		Object.keys(this._bonuses).forEach(function(key) {
			this._actor.addDistribute(key, this._bonuses[key]);
		}, this);
	}
	this._actor.addDistributePointsSpent(this._pointsSpent);
	this._pointsSpent = 0;
};

Window_Distribute.prototype.updateHelp = function() {
	const index = this.index();
	if(!this._list[index]) return;
	const symbol = this.commandSymbol(index);
	this._pointsWindow.clear();
	this._helpWindow.clear();
	if(symbol !== 'finish') {
		const data = $dataDistributeStats[symbol];
		const actor = this._actor;
		this._pointsWindow.setValue(eval(data.cost));
		this._helpWindow.setText(data.description);
	}
};

Window_Distribute.prototype.makeCommandList = function() {
	if(this._actor) {
		const stats = this._actor.actor()._sd_stats || _.stats;
		stats.forEach(function(stat) {
			if($dataDistributeStats[stat]) {
				this.addCommand($dataDistributeStats[stat].name, stat);
			}
		}, this);
	}
	this.addCommand("Finish", 'finish');
};

Window_Distribute.prototype.drawItem = function(index) {
	const symbol = this.commandSymbol(index);
	if(symbol === 'finish') {
		this.drawFinishItem(index);
	} else {
		this.drawNormalItem(index, symbol);
	}
};

Window_Distribute.prototype.drawNormalItem = function(index, symbol) {
	const rect = this.itemRectForText(index);
	const name = this.commandName(index);
	const nameWidth = this.textWidth(name);
	const statWidth = rect.width - nameWidth;
	let stat = this._actor[symbol];
	this.changeTextColor(this.systemColor());
	const actor = this._actor;
	const data = $dataDistributeStats[symbol];
	const cost = eval(data.cost);
	let add = 0;
	if(this._bonuses[symbol] && this._bonuses[symbol] > 0) add = this._bonuses[symbol];
	const current = (actor.getDistribute(symbol) + add);
	const max = eval(data.max);
	this.changePaintOpacity((current < max && this.hasPoints(cost)) || (this._bonuses[symbol] && this._bonuses[symbol] > 0));
	if(_.drawGauges) {
		let rate = 0;
		rate = current / max;
		this.drawGauge(rect.x, rect.y, rect.width, rate, data.min_col, data.max_col);
	}
	this.drawText(name, rect.x, rect.y, nameWidth, 'left');
	this.drawNormalItemNumbers(stat, symbol, nameWidth, statWidth, rect);
};

Window_Distribute.prototype.drawNormalItemNumbers = function(stat, symbol, nameWidth, statWidth, rect) {
	if(stat !== undefined) {
		const percent = Game_Actor.xParams.contains(symbol) || Game_Actor.sParams.contains(symbol);
		let bonusWidth = -12;
		this.contents.fontSize = 22;
		if(this._bonuses[symbol]) {
			const bonusText = percent ? `(+${Math.round(this._bonuses[symbol]*1000) / 10}%)` : `(+${this._bonuses[symbol]})`;
			bonusWidth = this.textWidth(bonusText);
			this.changeTextColor("#66ff66");
			this.drawText(bonusText, nameWidth, rect.y, statWidth, 'right');
		}
		this.resetTextColor();
		if(percent) stat = `${Math.round(stat*1000) / 10}%`;
		this.drawText(stat, nameWidth, rect.y, statWidth - bonusWidth - 12, 'right');
		this.resetFontSettings();
	}
};

Window_Distribute.prototype.drawFinishItem = function(index) {
	const rect = this.itemRectForText(index);
	const isEnabled = this._pointsSpent > 0;
	this.changePaintOpacity(isEnabled);
	this._list[this._list.length - 1].enabled = isEnabled;
	this.contents.fontSize = 24;
	this.drawText(this.commandName(index), rect.x, rect.y, rect.width, 'center');
	this.resetFontSettings();
};

Window_Distribute.prototype.hasPoints = function(amount) {
	return this._actor.distributePoints() >= amount;
};

Window_Distribute.prototype.canReturnPoints = function(amount) {
	return this._pointsSpent >= amount;
};

Window_Distribute.prototype.removePoint = function(amount) {
	this._actor.addDistributePointsTemp(-amount);
	this._pointsSpent += amount;
	this.refreshEverything();
};

Window_Distribute.prototype.addPoint = function(amount) {
	this._actor.addDistributePointsTemp(amount);
	this._pointsSpent -= amount;
	this.refreshEverything();
};

Window_Distribute.prototype.refreshEverything = function() {
	this._pointsWindow.refresh();
	this._statusWindow.refreshPoints();
	this.refresh();
};

Window_Distribute.prototype.processOk = function() {
	const index = this.index();
	const symbol = this.commandSymbol(index);
	if(symbol === 'finish') {
		Window_Command.prototype.processOk.apply(this, arguments);
	} else {
		this.cursorRight();
	}
};

Window_Distribute.prototype.cursorRight = function(wrap) {
	const index = this.index();
	const symbol = this.commandSymbol(index);
	if(symbol === 'finish') return;
	const actor = this._actor;
	const current = actor.getDistribute(symbol);
	const data = $dataDistributeStats[symbol];
	const cost = eval(data.cost);
	if(!this.hasPoints(cost)) {
		return;
	}
	if(this._bonuses[symbol] === undefined) this._bonuses[symbol] = 0;
	const prev = this._bonuses[symbol];
	this._bonuses[symbol] += eval(data.gain);
	this._bonuses[symbol] = this._bonuses[symbol].clamp(0, eval(data.max) - current);
	if(this._bonuses[symbol] !== prev) {
		this.removePoint(cost);
		this.refreshEverything();
		SoundManager.playCursor();
	}
};

Window_Distribute.prototype.cursorLeft = function(wrap) {
	const index = this.index();
	const symbol = this.commandSymbol(index);
	if(symbol === 'finish') return;
	const actor = this._actor;
	const current = actor.getDistribute(symbol);
	const data = $dataDistributeStats[symbol];
	const cost = eval(data.cost);
	if(!this.canReturnPoints(cost)) {
		return;
	}
	if(this._bonuses[symbol] === undefined) this._bonuses[symbol] = 0;
	const prev = this._bonuses[symbol];
	this._bonuses[symbol] -= eval(data.gain);
	this._bonuses[symbol] = this._bonuses[symbol].clamp(0, eval(data.max) - current);
	if(this._bonuses[symbol] !== prev) {
		this.addPoint(cost);
		this.refreshEverything();
		SoundManager.playCursor();
	}
};

Window_Distribute.prototype.refresh = function() {
	this.clearCommandList();
	this.makeCommandList();
	this.height = this.windowHeight();
	this.createContents();
	Window_Selectable.prototype.refresh.call(this);
};