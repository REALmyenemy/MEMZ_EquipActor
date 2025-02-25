/*:
* @target MZ
* Version 1.2.0
* Last update 05/03/25
* @author myenemy
* @plugindesc This plugin allows you to equip items as party members
* @help
* Type in the note box <equipActor: x y> where X is the actor's id in the database, and Y an optional
* parameter to activate the Y switch in case you want some control over who's equiped.
* Upon equiping, if actor X is in the party and it's not the one you want to
* equip with this item, actor X will banish from party before equiping it to
* another actor. Also, when you unequip this, the actor will join again as
* soon as you unequip this item (and the switch will go off).
* Warning: This plugin disables Optimize. I cannot fix Optimize wrecking
* havock to figure out what part to equip the best.
* Notetags:
* Equipables: <equipActor: x> or <equipActor: x y>
* Actors: <equipactor_inheritableskills: a, b, c>
* 
* @Changelog
* 0.9.1: Initial release, port from MV version, not stable.
* 1.0.0: Actual proper release, stabilized for MZ.
* 1.0.2: A small bugfix and a revamp of the code convention
* 1.1.0: A BIG bugfix. Added inheritable skills
*
* @param expPercent
* @text Exp Gain
* @type number
* @default 0
* @desc Set the experience equipedActors earn from basic systems
*
*
*
*
*
*
*
*
*
*
*
*
*
*
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
Imported.ME_EquipActor = "1.2.0";

function ME_EquipActor() { };

ME_EquipActor.changeEquip = Game_Actor.prototype.changeEquip;
ME_EquipActor.learnSkill = Game_Actor.prototype.learnSkill;
ME_EquipActor.levelUp = Game_Actor.prototype.levelUp;
ME_EquipActor.gainExp = Game_Actor.prototype.gainExp;

/*
//Actually important function to check if skill is learnt. Add re-checking for inheritable skills here.
Game_Actor.prototype.levelUp = function() {
	this._level++;
	for (const learning of this.currentClass().learnings) {
		if (learning.level === this._level) {
			this.learnSkill(learning.skillId);
		}
	}
};

//Function to gain exp and level up, may be helpful
Game_Actor.prototype.gainExp = function(exp) {
	const newExp = this.currentExp() + Math.round(exp * this.finalExpRate());
	this.changeExp(newExp, this.shouldDisplayLevelUp());
};

//Lead to show a sign for "inherited new skill" in general.
BattleManager.gainExp = function() {
	const exp = this._rewards.exp;
	for (const actor of $gameParty.allMembers()) {
		actor.gainExp(exp);
	}
};

//Lead to show a sign for "inherited new skill", and re-check all inherited skills after battle.
BattleManager.gainRewards = function() {
	this.gainExp();
	this.gainGold();
	this.gainDropItems();
};

//To fix optimize, planned to disable items marked as item actors
Game_Actor.prototype.bestEquipItem = function(slotId) {
    const etypeId = this.equipSlots()[slotId];
    const items = $gameParty
        .equipItems()
        .filter(item => item.etypeId === etypeId && this.canEquip(item));
    let bestItem = null;
    let bestPerformance = -1000;
    for (let i = 0; i < items.length; i++) {
        const performance = this.calcEquipItemPerformance(items[i]);
        if (performance > bestPerformance) {
            bestPerformance = performance;
            bestItem = items[i];
        }
    }
    return bestItem;
};

*/
Game_Actor.prototype.inheritedSkillSet = null;
Game_Actor.prototype._naturalSkills = null;

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


ME_EquipActor.isMatch = function (item) {
	if (item)
		return item.note.match(/.*<equipactor:\s*([0-9]+)\s*([0-9]*)>.*/i);
	else return null;
};

//Checks if actor has the tag for inheritable skill
ME_EquipActor.hasInheritableSkills = function (actorId) {
	if (actorId) {
		let note = $dataActors[actorId].note;
		if (note)
			return note.match(/.*<equipactor_inheritableskills:\s*((?:\d+,\s*)*\d+)\s*>.*/i);
	}
	return null;
};

//Checks what skills in the list in the above function, has the actor.
ME_EquipActor.inheritableSkills = function (actorId) {
	let inheritableSkills = this.hasInheritableSkills(actorId);

	if (inheritableSkills) {
		inheritableSkills = (inheritableSkills[1].replace(" ", "")).split(",");

		let actor = $gameActors.actor(actorId);
		let list = [];
		for (let i = 0; i < inheritableSkills.length; i++) {
			let aux = parseInt(inheritableSkills[i]);
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
	ME_EquipActor.learnSkill.call(this, skillId) //!!! Get a notification
	if (this._naturalSkills) {
		this._naturalSkills.push(skillId);
	}
	else {
		this._naturalSkills = this._skills;
	}
};

//Main process
ME_EquipActor.equipActor = function (slot, id) {
	let match = ME_EquipActor.isMatch(id);
	if (match) {
		if ($gameParty.members().contains($gameActors.actor(match[1])) && $gameActors.actor(match[1]) != this) {
			if (match[2]) {
				$gameSwitches.setValue(match[2], true);
			}
			let actorId = parseInt(match[1]);
			$gameParty.removeActor(actorId);

			ME_EquipActor.changeEquip.call(this, slot, id);
			ME_EquipActor.learnEquipedSkillset.call(this, actorId, slot); //New add on
		}
	}
	else
		ME_EquipActor.changeEquip.call(this, slot, id);
};

ME_EquipActor.restoreSkills = function (slot) {
	let skillsInnherited = this.inheritedSkillSet[slot];
	this.inheritedSkillSet[slot] = this._naturalSkills;

	for (let i = 0; i < skillsInnherited.length; i++) {
		let deletable = true;
		for (let j = 0; j < this.inheritedSkillSet.length && deletable; j++) {
			if (this.inheritedSkillSet[j] && this.inheritedSkillSet[j].contains(skillsInnherited[i]))
				deletable = false;
		}
		if (deletable) {
			this._skills.remove(skillsInnherited[i])
		}

	}
	this.inheritedSkillSet[slot] = null;
}

// Removes the item actor
ME_EquipActor.unequipActor = function (slot, id) {
	let match = ME_EquipActor.isMatch(this.equips()[slot]);
	if (Array.isArray(match)) {
		if (match[2]) {
			$gameSwitches.setValue(match[2], false);
		}
		$gameParty.addActor(parseInt(match[1]));
		ME_EquipActor.restoreSkills.call(this, slot)

	}
	ME_EquipActor.changeEquip.call(this, slot, id);
};

// Manages skill inheriting
ME_EquipActor.learnEquipedSkillset = function (actorId, slot) {
	if (!this.inheritedSkillSet) {
		this.inheritedSkillSet = [];
		for (let i = 0; i < this._equips.length; i++) {
			this.inheritedSkillSet.push(null);
		}
	}
	let skillset = ME_EquipActor.inheritableSkills(actorId)
	this.inheritedSkillSet[slot] = skillset;
	for (let i = 0; i < skillset.length; i++) {
		if (!this._skills.contains(skillset[i])) {
			this._skills.push(skillset[i]);
		}
	}
}