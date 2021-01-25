//ccse
//blatantly borrowing klattmose's code (mit license)

if(GardenLoveMachine === undefined) var GardenLoveMachine = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
GardenLoveMachine.name = 'Garden Love Machine';
GardenLoveMachine.version = '0.01';
GardenLoveMachine.GameVersion = '2.031';

GardenLoveMachine.launch = function(){
	GardenLoveMachine.init = function(){
		GardenLoveMachine.isLoaded = true;
		
		GardenLoveMachine.plotOffX = [0, 3, 0, 3];
		GardenLoveMachine.plotOffY = [0, 0, 3, 3];
		
		GardenLoveMachine.data = GardenLoveMachine.defaultData();
		CCSE.customSave.push(function(){
			CCSE.save.OtherMods.GardenLoveMachine = GardenLoveMachine.data;
		});
		CCSE.customLoad.push(function(){
			if(CCSE.save.OtherMods.GardenLoveMachine) GardenLoveMachine.data = CCSE.save.OtherMods.GardenLoveMachine;
		});
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(GardenLoveMachinename, GardenLoveMachinegetMenuString());
		});

		GardenLoveMachine.recipes = [];
		
		CCSE.MinigameReplacer(function(){
			var objKey = 'Farm';
			var M = Game.Objects[objKey].minigame;
			
			GardenLoveMachine.M = M;
			GardenLoveMachine.makeRecipes();
		}, 'Farm');
		
		Game.registerHook('check', GardenLoveMachine.check);
		
		if (Game.prefs.popups) Game.Popup('Garden Love Machine loaded!');
		else Game.Notify('Garden Love Machine loaded!', '', '', 1, 1);
	}
	
	GardenLoveMachine.calculateRecipeTime = function(plantArray){
		var M = GardenLoveMachine.M;
		var skip = true;
		var time = 0;
		var growTime = 0;
		//dumb and hacky
		for (var i in plantArray)
		{
			if (skip){
				time += M.plants[i].mature/(M.plants[i].ageTick+(M.plants[i].ageTickR/2));
			}
			else{
				growTime = Math.max(growTime, M.plants[i].mature/(M.plants[i].ageTick+(M.plants[i].ageTickR/2)));
			}
		}
		return time+growTime;
	}
	
	GardenLoveMachine.makeRecipes = function(){
		var M = GardenLoveMachine.M;
		
		//special cases
		
		//the "none" recipe, to be handed out when there are no valid recipes
		GardenLoveMachine.recipes['none'].valid = function(){return true;};
		GardenLoveMachine.recipes['none'].recipeTime = 0;
		GardenLoveMachine.recipes['none'].none = true;
		//meddleweed = fresh air
		GardenLoveMachine.recipes['meddleweed'].valid = function(){return true;};
		GardenLoveMachine.recipes['meddleweed'].recipeTime = GardenLoveMachine.calculateRecipeTime(['meddleweed']);
		GardenLoveMachine.recipes['meddleweed'].meddleweed = true;
		//brown mold = harvest meddleweed
		GardenLoveMachine.recipes['brownMold'].valid = function(){return M.plants['meddleweed'].unlocked;};
		GardenLoveMachine.recipes['brownMold'].recipeTime = GardenLoveMachine.calculateRecipeTime(['brownMold', 'meddleweed']);
		GardenLoveMachine.recipes['brownMold'].fill = true;
		GardenLoveMachine.recipes['brownMold'].fertilizer = true;
		GardenLoveMachine.recipes['brownMold'].mother = 'meddleweed';
		//crumbspore = harvest meddleweed
		GardenLoveMachine.recipes['crumbspore'].valid = function(){return M.plants['meddleweed'].unlocked;};
		GardenLoveMachine.recipes['crumbspore'].recipeTime = GardenLoveMachine.calculateRecipeTime(['crumbspore', 'meddleweed']);
		GardenLoveMachine.recipes['crumbspore'].fill = true;
		GardenLoveMachine.recipes['crumbspore'].fertilizer = true;
		GardenLoveMachine.recipes['crumbspore'].mother = 'meddleweed';
		//juicy queenbeet = 8 queenbeet
		GardenLoveMachine.recipes['queenbeetLump'].valid = function(){return M.plants['queenbeet'].unlocked;};
		GardenLoveMachine.recipes['queenbeetLump'].recipeTime = GardenLoveMachine.calculateRecipeTime(['queenbeetLump', 'queenbeet']);
		GardenLoveMachine.recipes['queenbeetLump'].juicy = true;
		GardenLoveMachine.recipes['queenbeetLump'].mother = 'queenbeet';
		//shriekbulb = 3 duketater (immature)
		GardenLoveMachine.recipes['shriekbulb'].valid = function(){return (M.plants['duketater'].unlocked && M.plants['queenbeetLump'].unlocked);}; //defer until we have a juicy
		GardenLoveMachine.recipes['shriekbulb'].recipeTime = GardenLoveMachine.calculateRecipeTime(['shriekbulb', 'duketater']);
		GardenLoveMachine.recipes['shriekbulb'].shriek = true;
		GardenLoveMachine.recipes['shriekbulb'].mother = 'duketater';
		//everdaisy = 3 tidygrass, 3 elderwort
		GardenLoveMachine.recipes['everdaisy'].valid = function(){return (M.plants['duketater'].unlocked && M.plants['queenbeetLump'].unlocked);};
		GardenLoveMachine.recipes['everdaisy'].recipeTime = GardenLoveMachine.calculateRecipeTime(['everdaisy', 'tidygrass']);
		GardenLoveMachine.recipes['everdaisy'].boxcars = true;
		GardenLoveMachine.recipes['everdaisy'].mother = 'tidygrass';
		GardenLoveMachine.recipes['everdaisy'].father = 'elderwort';
		//white mildew = 1 brown mold
		GardenLoveMachine.recipes['whiteMildew'].valid = function(){return M.plants['brownMold'].unlocked;};
		GardenLoveMachine.recipes['whiteMildew'].recipeTime = GardenLoveMachine.calculateRecipeTime(['whiteMildew', 'brownMold']);
		GardenLoveMachine.recipes['whiteMildew'].solo = true;
		GardenLoveMachine.recipes['whiteMildew'].mother = 'brownMold';
		
		
		//normal stuffs
		
		//chocoroot = 1 wheat, 1 brown mold (immature)
		GardenLoveMachine.recipes['chocoroot'].mother = 'bakerWheat';
		GardenLoveMachine.recipes['chocoroot'].father = 'brownMold';
		//white chocoroot = 1 chocoroot, 1x white mildew (immature)
		GardenLoveMachine.recipes['whiteChocoroot'].mother = 'bakerWheat';
		GardenLoveMachine.recipes['whiteChocoroot'].father = 'brownMold';
		//thumbcorn = 2 wheat
		GardenLoveMachine.recipes['thumbcorn'].valid = function(){return M.plants['bakeberry'].unlocked;} //defer for bakeberry
		GardenLoveMachine.recipes['thumbcorn'].mother = 'bakerWheat';
		GardenLoveMachine.recipes['thumbcorn'].father = 'bakerWheat';
		//bakeberry = 2 wheat
		GardenLoveMachine.recipes['bakeberry'].mother = 'bakerWheat';
		GardenLoveMachine.recipes['bakeberry'].father = 'bakerWheat';
		//cronerice = 1 wheat, 1 thumbcorn
		GardenLoveMachine.recipes['cronerice'].mother = 'bakerWheat';
		GardenLoveMachine.recipes['cronerice'].father = 'thumbcorn';
		//gildmillet = 1 cronerice, 1 thumbcorn
		GardenLoveMachine.recipes['gildmillet'].mother = 'cronerice';
		GardenLoveMachine.recipes['gildmillet'].father = 'thumbcorn';
		//clover = 1 gildmillet, 1 wheat
		GardenLoveMachine.recipes['clover'].valid = function(){return (M.plants['gildmillet'].unlocked && M.plants['goldenClover'].unlocked);}; //defer for golden clovers
		GardenLoveMachine.recipes['clover'].mother = 'gildmillet';
		GardenLoveMachine.recipes['clover'].father = 'bakerWheat';
		//gold clover = 1 gildmillet, 1 wheat
		GardenLoveMachine.recipes['goldenClover'].mother = 'gildmillet';
		GardenLoveMachine.recipes['goldenClover'].father = 'bakerWheat';
		//shimmerlily = 1 clover, 1 gildmillet
		GardenLoveMachine.recipes['shimmerlily'].mother = 'clover';
		GardenLoveMachine.recipes['shimmerlily'].father = 'gildmillet';
		//elderwort = 1 cronerice, 1 shimmerlily
		GardenLoveMachine.recipes['elderwort'].mother = 'cronerice';
		GardenLoveMachine.recipes['elderwort'].father = 'shimmerlily';
		//whiskerbloom = 1 shimmerlily, 1 white chocoroot
		GardenLoveMachine.recipes['whiskerbloom'].mother = 'shimmerlily';
		GardenLoveMachine.recipes['whiskerbloom'].father = 'whiteChocoroot';
		//chimerose = 1 shimmerlilly, 1 whiskerbloom
		GardenLoveMachine.recipes['chimerose'].mother = 'whiskerbloom';
		GardenLoveMachine.recipes['chimerose'].father = 'shimmerlily';
		//nursetulip = 2 whiskerbloom
		GardenLoveMachine.recipes['nursetulip'].mother = 'whiskerbloom';
		GardenLoveMachine.recipes['nursetulip'].father = 'whiskerbloom';
		//drowsyfern = 1 chocoroot, 1 keenmoss
		GardenLoveMachine.recipes['drowsyfern'].mother = 'keenmoss';
		GardenLoveMachine.recipes['drowsyfern'].father = 'chocoroot';
		//wardlichen = 1 cronerice, 1 white mildew
		GardenLoveMachine.recipes['wardlichen'].mother = 'cronerice';
		GardenLoveMachine.recipes['wardlichen'].father = 'whiteMildew';
		//keenmoss = 1 green rot, 1 brown mold
		GardenLoveMachine.recipes['keenmoss'].mother = 'greenRot';
		GardenLoveMachine.recipes['keenmoss'].father = 'brownMold';
		//queenbeet = 1 bakeberry, 1 chocoroot
		GardenLoveMachine.recipes['queenbeet'].mother = 'bakeberry';
		GardenLoveMachine.recipes['queenbeet'].father = 'chocoroot';
		//duketater = 2 queenbeet
		GardenLoveMachine.recipes['duketater'].valid = function(){return (M.plants['queenbeetLump'].unlocked);}; //defer for juicy
		GardenLoveMachine.recipes['duketater'].mother = 'queenbeet';
		GardenLoveMachine.recipes['duketater'].father = 'queenbeet';
		//tidygrass = 1 wheat, 1 white chocoroot
		GardenLoveMachine.recipes['tidygrass'].mother = 'bakerWheat';
		GardenLoveMachine.recipes['tidygrass'].father = 'whiteChocoroot';
		//doughshroom = 2 crumbspore
		GardenLoveMachine.recipes['doughshroom'].mother = 'crumbspore';
		GardenLoveMachine.recipes['doughshroom'].father = 'crumbspore';
		//glovemorel = 1 crumbspore, 1 thumbcorn
		GardenLoveMachine.recipes['glovemorel'].mother = 'crumbspore';
		GardenLoveMachine.recipes['glovemorel'].father = 'thumbcorn';
		//cheapcap = 1 crumbspore, 1 shimmerlily
		GardenLoveMachine.recipes['cheapcap'].mother = 'crumbspore';
		GardenLoveMachine.recipes['cheapcap'].father = 'shimmerlily';
		//fools bolete = 1 doughshroom, 1 green rot
		GardenLoveMachine.recipes['foolBolete'].mother = 'doughshroom';
		GardenLoveMachine.recipes['foolBolete'].father = 'greenRot';
		//wrinklegill = 1 crumbspore, 1 brown mold
		GardenLoveMachine.recipes['wrinklegill'].mother = 'crumbspore';
		GardenLoveMachine.recipes['wrinklegill'].father = 'brownMold';
		//green rot = 1 white mildew, 1 ordinary clover
		GardenLoveMachine.recipes['greenRot'].mother = 'clover';
		GardenLoveMachine.recipes['greenRot'].father = 'whiteMildew';
		//ichorpuff = 1 elderwort, 1 crumbspore
		GardenLoveMachine.recipes['ichorpuff'].mother = 'elderwort';
		GardenLoveMachine.recipes['ichorpuff'].father = 'crumbspore';
		
		for (var i in GardenLoveMachine.recipes)
		{
			if (typeof GardenLoveMachine.recipes[i].valid ==='undefined'){
				GardenLoveMachine.recipes[i].valid = function(){return (M.plants[i.mother].unlocked && M.plants[i.father].unlocked);};
			}
			if (typeof GardenLoveMachine.recipes[i].recipeTime ==='undefined'){
				GardenLoveMachine.recipes[i].recipeTime = GardenLoveMachine.calculateRecipeTime([i, i.mother, i.father]);
			}
			GardenLoveMachine.recipes[i].key = i;
		}
		
		GardenLoveMachine.recipes.sort(function(a,b){return b.recipeTime - a.recipeTime});
	}
	
	GardenLoveMachine.getMenuString = function(){
		var writeHeader = function(text) {
			var div = document.createElement('div');
			div.className = 'listing';
			div.style.padding = '5px 16px';
			div.style.opacity = '0.7';
			div.style.fontSize = '17px';
			div.style.fontFamily = '\"Kavoon\", Georgia, serif';
			div.textContent = text;
			return div.outerHTML;
		}
		
		var WriteButton = function(prefName, button, on, off, callback, invert){
			var invert = invert ? 1 : 0;
			if (!callback) callback = '';
			callback += 'PlaySound(\'snd/tick.mp3\');';
			return '<a class="option' + ((GardenLoveMachine.data[prefName]^invert) ? '' : ' off') + '" id="' + button + '" ' + Game.clickStr + '="GardenLoveMachine.togglePref(\'' + prefName + '\',\'' + button + '\',\'' + on.replace("'","\\'") + '\',\'' + off.replace("'","\\'") + '\',\'' + invert + '\');' + callback + '">' + (GardenLoveMachine.data[prefName] ? on : off) + '</a>';
		}
		
		
		var str = '';
			
		str += '<div class="listing">' + WriteButton('autoBreed', 'autoBreedButton', 'Autobreed ON', 'Autobreed OFF', '') + '<label>Automatically plant in breeding formations. Effectively automates the entire garden.</label></div>';
		str += '<div class="listing">' + WriteButton('autoSacrifice', 'autoSacrificelButton', 'Autosacrifice ON', 'Autosacrifice OFF', '') + '<label>Automatically sacrifice garden when all plants are unlocked.</label></div>';
		str += '<div class="listing">' + WriteButton('autoSalvage', 'autoSalvageButton', 'Autosalvage ON', 'Autosalvage OFF', '') + '<label>Automatically harvest plants one tick close to death that grant effects when harvested.</label></div>';
	
		
		return str;
	}
	
	GardenLoveMachine.changeSoil = function(soil_id){
		//no easy way to call this, so i copied the function
		//if i figure out the proper method, change to that
		var M = GardenLoveMachine.M;
		
		var me=M.soilsById[soil_id];
		if (M.freeze || M.soil==soil_id || M.nextSoil>Date.now() || M.parent.amount<me.req){return false;}
		PlaySound('snd/toneTick.mp3');
		M.nextSoil=Date.now()+(Game.Has('Turbo-charged soil')?1:(1000*60*10));
		M.toCompute=true;
		M.soil=soil_id;
		M.computeStepT();
		for (var i in M.soils){
			var it=M.soils[i];
			if (it.id==M.soil){
				l('gardenSoil-'+it.id).classList.add('on');
			}
			else{
				l('gardenSoil-'+it.id).classList.remove('on');
			}
		}
		return true;
	}
	
	//data
	GardenLoveMachine.defaultData = function(){
		return {
			autoBreed: false,
			autoSacrifice: false,
			autoSalvage: false,
			
			plotState: [0, 0, 0, 0],
			plotRecipe: ['none', 'none', 'none', 'none'],
			planterPlot: []
		}
	}
	
	GardenLoveMachine.togglePref = function(prefName, button, on, off, invert){
		if (GardenLoveMachine.data[prefName]){
			l(button).innerHTML = off;
			GardenLoveMachine.data[prefName] = 0;
		}else{
			l(button).innerHTML = on;
			GardenLoveMachine.data[prefName] = 1;
		}

		l(button).className = 'option' + ((GardenLoveMachine.data[prefName]^invert) ? '' : ' off');
	}
	
	//helper functions, we're going to be doing this a lot
	GardenLoveMachine.forEachTile = function(callback) {
		var result = false;
		for (let x=0; x<6; x++) {
			for (let y=0; y<6; y++) {
				if (GardenLoveMachine.M.isTileUnlocked(x, y)) {
					result = result || callback(x, y);
				}
			}
		}
		return result;
	}
	
	GardenLoveMachine.forEachPlot = function(callback,offsetX,offsetY) {
		var result = false;
		for (let x=offsetX; x<offsetX+3; x++) {
			for (let y=offsetY,; y<offsetY+3; y++) {
				if (GardenLoveMachine.M.isTileUnlocked(x, y)) {
					result = result || callback(x, y);
				}
			}
		}
		return result;
	}
	
	GardenLoveMachine.forEachPlotAnd = function(callback,offsetX,offsetY) {
		var result = false;
		for (let x=offsetX; x<offsetX+3; x++) {
			for (let y=offsetY,; y<offsetY+3; y++) {
				if (GardenLoveMachine.M.isTileUnlocked(x, y)) {
					result = result && callback(x, y);
				}
			}
		}
		return result;
	}
	
	//alert
	//yell at plots that we found a new seed so do something else
	GardenLoveMachine.newSeedAlert = function(seed){
		for (var i = 0; i < 4; i++){
			if (GardenLoveMachine.data.plotRecipe[i].key == seed){
				GardenLoveMachine.data.plotState[i] = 0;
			}
		}
	}
	
	GardenLoveMachine.isOnClickPlant = function(seed){
		return in_array(seed,['bakeberry','chocoroot','whiteChocoroot','queenbeet','duketater']);
	}
	
	//harvester
	//delete anything weird in the plots, unless it's a new seed
	//special rules for meddleweed:
	//-harvest immediately if new
	//-wait until one step from death if brown mold/crumbspore isn't unlocked
	GardenLoveMachine.harvest = function(x,y){
		var M = GardenLoveMachine.M;
		var tile = M.getTile(x,y);
		if(tile[0] != 0){
			var plant = M.plantsById[tile[0] - 1];
			if (plant.unlocked) {
				//special meddleweed case
				if ((!M.plants['brownMold'].unlocked || !!M.plants['crumbspore'].unlocked) && plant.key==['meddleweed']) {
					if (tile[1] + plant.ageTick + plant.ageTickR >= 100){
						M.clickTile(x,y);
					}
				}
				else {
					if (plant.id != planterPlot[x][y]) {
						M.clickTile(x,y);
					}
					if(autoSalvage && (tile[1] + plant.ageTick + plant.ageTickR >= 100) && GardenLoveMachine.isOnClickPlant(plant.key)){
						M.clickTile(x,y)
					}
				}
			}
			else
			{
				GardenLoveMachine.newSeedAlert(plant.key);
				if (tile[1] >= plant.mature){
					M.clickTile(x,y);
				}
			}
		}
	}
	
	GardenLoveMachine.recipeGet = function(){
		for (var i in GardenLoveMachine.recipes)
		{
			var M = GardenLoveMachine.M;
			if(GardenLoveMachine.recipes[i].valid && !M.plants[i].unlocked){
				if(GardenLoveMachine.recipes[i].none) return i;
				var plantCheck = GardenLoveMachine.forEachTile(function(x,y){
					var M = GardenLoveMachine.M;
					var tile = M.getTile(x,y);
					return (tile[0]-1) == M.plants[i].id;
				});
				if (!plantCheck) then return i;
			}
		}
		return 'none';
	}
	
	GardenLoveMachine.tileBreedViable = function(x,y){
		var M = GardenLoveMachine.M;
		var tile = M.getTile(x,y);
		if(tile[0] != 0){
			var plant = M.plantsById[tile[0] - 1];
			if(tile[1] + plant.ageTick + plant.ageTickR >= plant.mature){return true} else return false;
		}
		return true;
	}
	
	
	//plot states:
	//0 = empty, find new seed
	GardenLoveMachine.plotStart = function(i){
		var M = GardenLoveMachine.M;
		
		GardenLoveMachine.data.plotRecipe[i] = GardenLoveMachine.recipeGet();
		GardenLoveMachine.forEachPlot((function(x,y){GardenLoveMachine.data.planterPlot[x][y] = -1;}, GardenLoveMachine.plotOffX[i], GardenLoveMachine.plotOffY[i]);
		if (GardenLoveMachine.data.plotRecipe[i].none) return;
		if (GardenLoveMachine.data.plotRecipe[i].fill) {
			GardenLoveMachine.forEachPlot((function(x,y){GardenLoveMachine.data.planterPlot[x][y] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;}, GardenLoveMachine.plotOffX[i], GardenLoveMachine.plotOffY[i]);
		}
		else if (GardenLoveMachine.data.plotRecipe[i].juicy) {
			GardenLoveMachine.forEachPlot((function(x,y){GardenLoveMachine.data.planterPlot[x][y] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;}, GardenLoveMachine.plotOffX[i], GardenLoveMachine.plotOffY[i]);
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = -1;
		}
		else if (GardenLoveMachine.data.plotRecipe[i].shriek) {
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;
			GardenLoveMachine.data.planterPlot[0+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;
			GardenLoveMachine.data.planterPlot[2+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;
		}
		else if (GardenLoveMachine.data.plotRecipe[i].boxcars) {
			GardenLoveMachine.data.planterPlot[0+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;
			GardenLoveMachine.data.planterPlot[2+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;
			
			GardenLoveMachine.data.planterPlot[0+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].father].id;
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].father].id;
			GardenLoveMachine.data.planterPlot[2+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].father].id;
		}
		else if (!GardenLoveMachine.data.plotRecipe[i].meddleweed) {
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].mother].id;
			if (!GardenLoveMachine.data.plotRecipe[i].solo) {
				GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].father].id;
				GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.data.plotRecipe[i].father].id;
			}
		}
		
		GardenLoveMachine.data.plotState[i] = 2;
	}
	//1 = planting, to attempt to make sure shit grows at the same time (dummied out until i care)
	//2 = growing, mostly idle until prereqs for 3 are hit
	//3 = one tick from breeding/breed viable, indicator we want that breed soil
	GardenLoveMachine.plotGrowCheck = function(i) {
		var breedViable = false;
		if (GardenLoveMachine.data.plotRecipe[i].none) {
			GardenLoveMachine.data.plotState[i] = 0;
			return;
		}
		//only fill is meddleweed so don't breed
		else if (!GardenLoveMachine.data.plotRecipe[i].fill) {
			breedViable = GardenLoveMachine.forEachPlotAnd(GardenLoveMachine.tileBreedViable, GardenLoveMachine.plotOffX[i], GardenLoveMachine.plotOffY[i]);
		}
		if(breedViable)
			GardenLoveMachine.data.plotState[i] = 3;
		else
			GardenLoveMachine.data.plotState[i] = 2;
	}
	//4 = nursing, do nothing until plant is fully grown 
	
	GardenLoveMachine.plotThink = function(){
		for (var i = 0; i < 4; i++){
			switch (GardenLoveMachine.data.plotState[i]) {
				case 0:
					GardenLoveMachine.plotStart(i);
					break;
				case 1:
					break;
				case 2:
				case 3:
					GardenLoveMachine.plotGrowCheck(i);
					break;
				case 4:
					GardenLoveMachine.data.plotState[i] = 0;
					break;
				default:
					break;
			}
			
		}
	}
	
	GardenLoveMachine.planter = function(x,y){
		var M = GardenLoveMachine.M;
		var tile = M.getTile(x,y);
		if (planterPlot[x][y] > -1 && tile[0] == 0) {
			M.useTool(planterPlot[x][y],x,y);
			M.toCompute=true;
		}	
	}
	
	GardenLoveMachine.fertilizer = function(){
		var targetSoil = 1;
		for (var i = 0; i < 4; i++) {
			if (GardenLoveMachine.data.plotState[i] == 5) targetSoil = 4;
		}
		GardenLoveMachine.changeSoil(targetSoil);
	}
	
	GardenLoveMachine.findNewPlant = function(x, y){
		var M = GardenLoveMachine.M;
		var tile = M.getTile(x,y)
		if(tile[0] != 0){
			var plant = M.plantsById[tile[0] - 1];
			if(!plant.unlocked)
				return true;
		}
		return false;
	}
	
	GardenLoveMachine.newCheck = function(){
		for (var i = 0; i < 4; i++) {
			var foundPlant = foundPlant = GardenLoveMachine.forEachPlot(newCheck, GardenLoveMachine.plotOffX[i], GardenLoveMachine.plotOffY[i]);
			if (foundPlant) {
				GardenLoveMachine.data.plotState[i] = 4;
			}
		}
	}

	
	GardenLoveMachine.check = function(){
		var M = GardenLoveMachine.M;
		if(autoBreed){
			GardenLoveMachine.forEachTile(GardenLoveMachine.harvest);
			GardenLoveMachine.newCheck();
			GardenLoveMachine.plotThink();
			GardenLoveMachine.forEachTile(GardenLoveMachine.planter);
			GardenLoveMachine.fertilizer();
		}
		if(autoSacrifice){
			M.convert(); //automatically returns if you can't, so
		}
	}

	
	if(CCSE.ConfirmGameVersion(GardenLoveMachine.name, GardenLoveMachine.version, GardenLoveMachine.GameVersion)) Game.registerMod(GardenLoveMachine.name, GardenLoveMachine); // GardenLoveMachine.init();
}


if(!GardenLoveMachine.isLoaded){
	if(CCSE && CCSE.isLoaded){
		GardenLoveMachine.launch();
	}
	else{
		if(!CCSE) var CCSE = {};
		if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
		CCSE.postLoadHooks.push(GardenLoveMachine.launch);
	}
}