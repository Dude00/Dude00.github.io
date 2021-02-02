if(FCAutoLimit === undefined) var FCAutoLimit = {};

FCAutoLimit.getRuin = function(sold) {
	if (Game.hasGod)
	{
		var godLvl=Game.hasGod('ruin');
		if (godLvl==1) return 1+sold*0.01;
		else if (godLvl==2) return 1+sold*0.005;
		else if (godLvl==3) return 1+sold*0.0025;
	}
	return 1; //
}

FCAutoLimit.getRawClickCps = function(clickSpeed){
    var clickMod = 1;
	var cpsMod = 1;
	for (var i in Game.buffs)
	{
		if (typeof Game.buffs[i].multCpS!=='undefined') cpsMod*=Game.buffs[i].multCpS;
	}
	if (Game.Has('Golden switch [off]'))
	{
		var goldenSwitchMult=1.5;
		if (Game.Has('Residual luck'))
		{
			var upgrades=Game.goldenCookieUpgrades;
			for (var i in upgrades) {if (Game.Has(upgrades[i])) goldenSwitchMult+=0.1;}
		}
		cpsMod*=goldenSwitchMult;
	}
	for (var i in Game.buffs)
	{
		if (typeof Game.buffs[i].multClick != 'undefined') clickMod*=Game.buffs[i].multClick;
	}
    var cpc = Game.mouseCps() / (cpsMod * clickMod);
    return clickSpeed * cpc;
}

FCAutoLimit.getBill=function(building, have, budget) {
	var cost=0;
	var total=0;
	var price = 0;
	do
	{
		total++;
		price = Game.Objects[building].basePrice*Math.pow(Game.priceIncrease,Math.max(0,have-Game.Objects[building].free));
		price = Math.ceil(Game.modifyBuildingPrice(Game.Objects[building],price));
		cost += price;
		have++;
	}
	while(budget > cost);
	
	return [cost-price,have-1]
}

FCAutoLimit.updateLimits = function(){
	if(FrozenCookies) {
		if(FrozenCookies.cursorLimit) {
			var cursorCount = [0,0];
			var fullCost = 0;
			do{
				cursorCount = FCAutoLimit.getBill('Cursor', cursorCount[1], FCAutoLimit.getRawClickCps(FrozenCookies.frenzyClickSpeed)*777*FCAutoLimit.getRuin(cursorCount[1])-fullCost);
				fullCost += cursorCount[0];
			} while(cursorCount[0] > 0);
			FrozenCookies.cursorMax = cursorCount[1];
		}

		if(FrozenCookies.farmLimit){
			var farmCount = [0,1];
			var fullCost = 0;
			do{
				farmCount = FCAutoLimit.getBill('Farm', farmCount[1], FCAutoLimit.getRawClickCps(FrozenCookies.frenzyClickSpeed)*777*FCAutoLimit.getRuin(farmCount[1])-fullCost);
				fullCost += farmCount[0];
			} while(farmCount[0] > 0);
			FrozenCookies.farmMax = farmCount[1];
		}
	}
}

FCAutoLimit.init = function(){
	Game.registerHook('check', FCAutoLimit.updateLimits);
}

Game.registerMod("Frozen Cookies Automatic Godzamok Limits", FCAutoLimit);
