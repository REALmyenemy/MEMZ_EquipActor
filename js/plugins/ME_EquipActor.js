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
		this.changeEquip(slot, 0);
		ME_EquipActor.equipActor.call(this, slot, id);
	}
	else {
		ME_EquipActor.unequipActor.call(this, slot, id);
	}
	$gamePlayer.refresh()
};

Game_Actor.prototype.inheritedSkillSet = null;

ME_EquipActor.isMatch = function (item) {
	if (item)
		return item.note.match(/.*<equipactor:\s*([0-9]+)\s*([0-9]*)>.*/i);
	else return null;
};
//Checks if actor has the tag for inheritable skill
ME_EquipActor.hasInheritableSkills = function (actorId) {
	if (actorId) {
		var note = $dataActors[actorId].note;
		if (note)
			return note.match(/.*<equipactor_inheritableskills:\s*((?:\d+,\s*)*\d+)\s*>.*/i);
	}
	return null;
};
//Checks what skills in the list in the above function, has the actor.
ME_EquipActor.inheritableSkills = function (actorId) {
	var inheritableSkills = this.hasInheritableSkills(actorId);

	if (inheritableSkills) {
		inheritableSkills = (inheritableSkills[1].replace(" ", "")).split(",");

		var actor = $gameActors.actor(actorId);
		var list = [];
		for (var i = 0; i < inheritableSkills.length; i++) {
			var aux=parseInt(inheritableSkills[i]);
			if (actor._skills.includes(aux)) {
				list.push(aux);
			}
		}
		return list;
	}
	else
		return;
};
//Every time the actor learns a skill naturally, save it into different array, so we can know which ones come from equipment when duped
Game_Actor.prototype.learnSkill = function (skillId) {
	ME_EquipActor.learnSkill.call(this, skillId)
	if (this._naturalSkills) {
		this._naturalSkills.push(skillId);
	}
	else {
		this._naturalSkills = this._skills;
	}
};
//Main process
ME_EquipActor.equipActor = function (slot, id) {
	var match = ME_EquipActor.isMatch(id);
	if (match) {
		if ($gameParty.members().contains($gameActors.actor(match[1])) && $gameActors.actor(match[1]) != this) {
			if (match[2]) {
				$gameSwitches.setValue(match[2], true);
			}
			var actorId = parseInt(match[1])
			$gameParty.removeActor(actorId);

			ME_EquipActor.changeEquip.call(this, slot, id);
			ME_EquipActor.learnEquipedSkillset.call(this, actorId, slot); //New add on
		}
	}
	else
		ME_EquipActor.changeEquip.call(this, slot, id);
};
// Removes the actor. I have to add the remove skill functions
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
// Stores each bunch of inherited skills into an array into the target actor.
ME_EquipActor.learnEquipedSkillset = function (actorId, slot) {
	if (!this.inheritedSkillSet) {
		this.inheritedSkillSet=[];
		for (var i = 0; i < this._equips.length; i++) {
			this.inheritedSkillSet.push(null);
		}
	}
	var skillset = ME_EquipActor.inheritableSkills(actorId)
	this.inheritedSkillSet[slot] = skillset;
	for (var i = 0; i < skillset.length; i++) {
		if (!this._skills.contains(skillset[i])) {
			this._skills.push(skillset[i]);
		}
	}
}