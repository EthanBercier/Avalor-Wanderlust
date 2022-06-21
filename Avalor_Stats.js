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
 * 
 * Developement version
*/


var Avalor = Avalor || {};
Avalor.LINK = Avalor.LINK || {}; //permet d'éviter les undefined, si on ne trouve pas la variable Avalor
Avalor.LINK.Stats = Avalor.LINK.Stats|| {}; 
Avalor.LINK.version = 1.00

var $dataDistributeStats = {};



function Window_DistributePoints() {
	this.initialize.apply(this, arguments);
}

function Window_Distribute() {
	this.initialize.apply(this, arguments);
}

function Window_DistributeStatus() {
	this.initialize.apply(this, arguments);
}

function Window_DistributeCommand(){
	this.initialize.apply(this, arguments);
}

//==================================
// PluginManager.Parameters

Avalor.Parameters = PluginManager.parameters('Avalor_Stats'); //affiche le nom dans le gestionnaire de plugin


_.stats = String(Avalor.parameters['Default Stats']).split(";");
_.formula = Number(Avalor.parameters['Default point']); //gain de point par level (palier)
_.show = String(Avalor.parameters['Show on Menu']) === 'true'; //affiche la commande dans le menu

_.name = String(Avalor.parameters['Command Name']);
_.messsage = String(Avalor.parameters['Level Up Message']);
_.points = String(Avalor.parameters['Points Text']);   // pour ces 6 là tout est dit mdr
_.upgrade = String(Avalor.parameters['Upgrade Text']);
_.spendText = String(Avalor.parameters['Spend Text']);
_.finishText = String(Avalor.parameters['Finish Text'])



//==================================
// Oppening Commands
//==================================



Input.keyMapper["80"] = "distributeMenu";

_alias_scene_map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    _alias_scene_map_update.call(this);
    if (Input.isTriggered("distributeMenu")) SceneManager.push(Scene_CustomMenu);
};

SRD.PluginCommands['openstatdistribution'] = function() {  //via le bouton dans le menu 
	console.log("c'est ouvert");
	//const actor = SRD.PluginCommands._sd_getActorType(args);
	//if(actor) {
		//$gameParty.setMenuActor(actor);
		//SceneManager.push(Scene_Distribute);
	//}
};





//==================================
//Scene_Menu
//==================================



function Scene_Menu() {
    this.initialize.apply(this, arguments);
}

Scene_Menu.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Menu.prototype.constructor = Scene_Menu;

Scene_Menu.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};


Avalor.LINK.Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
	_.Scene_Menu_createCommandWindow.apply(this, arguments);
    this._commandWindow = new Window_MenuCommand(0, 0);
    this._commandWindow.setHandler('distribute', this.commandPersonal.bind(this));
};


Avalor.LINK.Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
Scene_Menu.prototype.onPersonalOk = function() {
	if(this._commandWindow.currentSymbol() === 'distribute') {
		this.openStatDistribution();
		return;
	}
	_.Scene_Menu_onPersonalOk.apply(this, arguments);
};

Scene_Menu.prototype.openStatDistribution = function() {
	console.log("c'est ouvert"); //test
	//SceneManager.push(Scene_Distribute);
};


//==================================
//
//==================================



function Scene_Distribute() {
	this.initialize.apply(this, arguments);
}


