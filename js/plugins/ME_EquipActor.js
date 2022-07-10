/*:
* Version 1.0.2
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
 * - You must follow LGPL 2.1.
 *
==============================================
*
*
*/

var ME_EA_changeEquip = Game_Actor.prototype.changeEquip;
Game_Actor.prototype.changeEquip = function (slot, id) {
	if (id) {
		var match = isMatch(id);
		if (match) {
			if ($gameParty.members().contains($gameActors.actor(match[1])) && $gameActors.actor(match[1]) != this) {
				if (match[2]) {
					$gameSwitches.setValue(match[2], true);
				}

				$gameParty.removeActor(parseInt(match[1]));

				ME_EA_changeEquip.call(this, slot, id);
			}
		}
		else
			ME_EA_changeEquip.call(this, slot, id);
	}
	else {
		var match = isMatch(this.equips()[slot]);
		if (Array.isArray(match)) {
			if (match[2]) {
				$gameSwitches.setValue(match[2], false);
			}
			$gameParty.addActor(parseInt(match[1]));
		}
		ME_EA_changeEquip.call(this, slot, id);
	}
	$gamePlayer.refresh()
}

function isMatch(item) {
	if (item)
		return item.note.match(/.*<equipactor:\s*([0-9]+)\s*([0-9]*)>.*/i);
	else return null;
}

