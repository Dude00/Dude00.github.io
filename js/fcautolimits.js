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

FCAutoLimit.getRawRuin = function(sold) {
	if (Game.hasGod)
	{
		var godLvl=Game.hasGod('ruin');
		if (godLvl==1) return sold*0.01;
		else if (godLvl==2) return sold*0.005;
		else if (godLvl==3) return sold*0.0025;
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

FCAutoLimit.getSumPrice=function(building, amount) {
	var price=0;
	for (var i=0;i<amount;i++)
	{
		price+=Game.Objects[building].basePrice*Math.pow(Game.priceIncrease,Math.max(0,i-Game.Objects[building].free));
	}
	price=Game.modifyBuildingPrice(Game.Objects[building],price);
	return Math.ceil(price);
}

FCAutoLimit.updateLimits = function(){
	if(FrozenCookies && !Game.hasBuff('Cursed finger')) { //the finger ruins everything
		var base = FCAutoLimit.getRawClickCps(FrozenCookies.frenzyClickSpeed)*777*10;
		if(FrozenCookies.cursorLimit) {
			var cursorCount = 0;
			var sellBonus = Game.Objects['Cursor'].getReverseSumPrice(Game.Objects['Cursor'].amount);
			var maxMax = 0;
			var curMax = 0;
			do{
				maxMax = curMax;
				cursorCount++;
				curMax = base*FCAutoLimit.getRawRuin(cursorCount)+sellBonus-FCAutoLimit.getSumPrice('Cursor', cursorCount);
			} while(curMax >= maxMax);
			FrozenCookies.cursorMax = cursorCount-1;
		}

		if(FrozenCookies.farmLimit){
			var farmCount = 1;
			var sellBonus = Game.Objects['Farm'].getReverseSumPrice(Game.Objects['Farm'].amount-1);
			var maxMax = 0;
			var curMax = 0;
			do{
				maxMax = curMax;
				farmCount++;
				curMax = base*FCAutoLimit.getRawRuin(farmCount)+sellBonus-FCAutoLimit.getSumPrice('Farm', farmCount);
			} while(curMax >= maxMax);
			FrozenCookies.farmMax = farmCount-1;
		}
		
		if(FrozenCookies.mineLimit){
			var farmCount = 1;
			var sellBonus = Game.Objects['Mine'].getReverseSumPrice(Game.Objects['Mine'].amount-1);
			var maxMax = 0;
			var curMax = 0;
			do{
				maxMax = curMax;
				farmCount++;
				curMax = base*FCAutoLimit.getRawRuin(farmCount)+sellBonus-FCAutoLimit.getSumPrice('Mine', farmCount);
			} while(curMax >= maxMax);
			FrozenCookies.mineMax = farmCount-1;
		}
		
		if(FrozenCookies.factoryLimit){
			var farmCount = 1;
			var sellBonus = Game.Objects['Factory'].getReverseSumPrice(Game.Objects['Factory'].amount-1);
			var maxMax = 0;
			var curMax = 0;
			do{
				maxMax = curMax;
				farmCount++;
				curMax = base*FCAutoLimit.getRawRuin(farmCount)+sellBonus-FCAutoLimit.getSumPrice('Factory', farmCount);
			} while(curMax >= maxMax);
			FrozenCookies.factoryMax = farmCount-1;
		}
	}
}

FCAutoLimit.init = function(){
	Game.registerHook('check', FCAutoLimit.updateLimits);
}

Game.registerMod("Frozen Cookies Automatic Godzamok Limits", FCAutoLimit);
