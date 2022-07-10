/*:
* Version 1.1.0
* @target MZ
* Last update 110/07/22
* @author myenemy
* @plugindesc This plugin allows you to equip items as party members
* @help
* Notetags:<equipActor: x> or <equipActor: x y>
* It's quite a simple plugin type in the note box <equipActor: x y> where X is
* the actor's id in the database, and Y an optional parameter to activate
* the Y switch in case you want some control on who's equiped.
* Upon equiping, if actor X is in the party and it's not the one you want to
* equip with this item, actor X will banish from party before equiping it to
* another actor. Also, when you unequip this, the actor will join again as
* soon as you unequip this item (and the switch will go off).
* Warning: This plugin disables Optimize and Clear
*
==============================================
 * @Terms of use
 * - Common:
 * -  Free to use as in money.
 * -  Feel free to modify to redistribute it.
 * -  This plugin comes as is, with no guarantees.
 * -  I'll try to give support about it, but I can't say I will do it for sure.
 * - Non Commercial:
 * -  No credit required unless you modify it then credit yourself, in other words,
 *   no claiming as your own!
 * - Commercial:
 * -  Give credit me as the author of this plugin, I don't mind if you do so in some
 *   scene or some easter egg.
 * -  Report any bugs, incompatibilities and issues with this plugin to me, even if
 *   you have someone else fixing them.
 * 
 * @Terms of redistribution and disambiguation
 * - You must include a link to the original RPG Maker Forums Post plugin.
 * - You can add terms to it, but you can't remove or modify the ones already existent.
 * - You must follow GPL 3.0.
*
==============================================
*
*
*/
var Imported = Imported || {};
Imported.ME_EquipActor = "1.1.0";

function ME_EquipActor() { };

ME_EquipActor.changeEquip = Game_Actor.prototype.changeEquip;
ME_EquipActor.learnSkill = Game_Actor.prototype.learnSkill;

Game_Actor.prototype.changeEquip = function (slot, id) {
	if (id) {
		ME_EquipActor.equipActor.call(this, slot, id);
	}
	else {
		ME_EquipActor.unequipActor.call(this, slot, id);
	}
	$gamePlayer.refresh()
}

ME_EquipActor.isMatch = function (item) {
	if (item)
		return item.note.match(/.*<equipactor:\s*([0-9]+)\s*([0-9]*)>.*/i);
	else return null;
}

Game_Actor.prototype.learnSkill = function (skillId) {
	ME_EquipActor.learnSkill.call(this, skillId)
	if (this._naturalSkills) {
		this._naturalSkills.push(skillId);
	}
	else {
		this._naturalSkills = this._skills;
	}
};

ME_EquipActor.equipActor = function (slot, id) {

	var match = ME_EquipActor.isMatch(id);
	if (match) {
		if ($gameParty.members().contains($gameActors.actor(match[1])) && $gameActors.actor(match[1]) != this) {
			if (match[2]) {
				$gameSwitches.setValue(match[2], true);
			}

			$gameParty.removeActor(parseInt(match[1]));

			ME_EquipActor.changeEquip.call(this, slot, id);
		}
	}
	else
		ME_EquipActor.changeEquip.call(this, slot, id);
};

ME_EquipActor.unequipActor = function (slot, id) {
	var match = ME_EquipActor.isMatch(this.equips()[slot]);
	if (Array.isArray(match)) {
		if (match[2]) {
			$gameSwitches.setValue(match[2], false);
		}
		$gameParty.addActor(parseInt(match[1]));

	}
	ME_EquipActor.changeEquip.call(this, slot, id);
};

ME_EquipActor.learnSkills = function (target, source) {
	var targetActor = $gameActors.actor(target);
	var sourceActor = $gameActors.actor(source);
	

}

ME_EquipActor.learnSkill = function (actorId, skillId) {
	if (!this.isLearnedSkill(skillId)) {
		this._skills.push(skillId);
		this._skills.sort((a, b) => a - b);
	}
}


ME_EquipActor.forgetSkill = function () { }

