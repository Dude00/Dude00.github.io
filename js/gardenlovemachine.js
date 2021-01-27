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
			CCSE.config.OtherMods.GardenLoveMachine = GardenLoveMachine.data;
		});
		CCSE.customLoad.push(function(){
			if(CCSE.config.OtherMods.GardenLoveMachine) GardenLoveMachine.data = CCSE.save.OtherMods.GardenLoveMachine;
		});
		Game.customOptionsMenu.push(function(){
			CCSE.AppendCollapsibleOptionsMenu(GardenLoveMachine.name, GardenLoveMachine.getMenuString());
		});
		
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
			if (!M.plants[plantArray[i]]) console.log('No plant named '+plantArray[i]);
			else {
				var it=M.plants[plantArray[i]];
				if (skip){
					time += it.mature/(it.ageTick+(it.ageTickR/2));
					skip = false;
				}
				else{
					growTime = Math.max(growTime, it.mature/(it.ageTick+(it.ageTickR/2)));
				}
			}
		}
		return time+growTime;
	}
	
	GardenLoveMachine.makeRecipes = function(){
		var M = GardenLoveMachine.M;
		
		//special cases
		GardenLoveMachine.recipes = {
		//the "none" recipe, to be handed out when there are no valid recipes
			'none':{
				valid: function(){return true;},
				recipeTime: 0,
				none: true
			},
		//meddleweed: fresh air
			'meddleweed':{
				valid: function(){return true;},
				recipeTime: GardenLoveMachine.calculateRecipeTime(['meddleweed']),
				meddleweed: true
			},
		//brown mold: harvest meddleweed
			'brownMold':{
				valid: function(){return M.plants['meddleweed'].unlocked;},
				recipeTime: GardenLoveMachine.calculateRecipeTime(['brownMold', 'meddleweed']),
				fill: true,
				mother: 'meddleweed'
			},
		//crumbspore: harvest meddleweed
			'crumbspore':{
				valid: function(){return M.plants['meddleweed'].unlocked;},
				recipeTime: GardenLoveMachine.calculateRecipeTime(['crumbspore', 'meddleweed']),
				fill: true,
				mother: 'meddleweed'
			},
		//juicy queenbeet: 8 queenbeet
			'queenbeetLump':{
				valid: function(){return M.plants['queenbeet'].unlocked;},
				recipeTime: GardenLoveMachine.calculateRecipeTime(['queenbeetLump', 'queenbeet']),
				juicy: true,
				mother: 'queenbeet'
			},
		//shriekbulb: 3 duketater (immature)
			'shriekbulb':{
				valid: function(){return (M.plants['duketater'].unlocked && M.plants['queenbeetLump'].unlocked);}, //defer until we have a juicy
				recipeTime: GardenLoveMachine.calculateRecipeTime(['shriekbulb', 'duketater']),
				shriek: true,
				mother: 'duketater'
			},
		//everdaisy: 3 tidygrass, 3 elderwort
			'everdaisy':{
				valid: function(){return (M.plants['duketater'].unlocked && M.plants['queenbeetLump'].unlocked);},
				recipeTime: GardenLoveMachine.calculateRecipeTime(['everdaisy', 'tidygrass']),
				boxcars: true,
				mother: 'tidygrass',
				father: 'elderwort'
			},
		//white mildew: 1 brown mold
			'whiteMildew':{
				valid: function(){return M.plants['brownMold'].unlocked;},
				recipeTime: GardenLoveMachine.calculateRecipeTime(['whiteMildew', 'brownMold']),
				solo: true,
				mother: 'brownMold'
			},
		
		
		//normal stuffs
		
		//chocoroot: 1 wheat, 1 brown mold (immature)
			'chocoroot':{
				mother: 'bakerWheat',
				father: 'brownMold'
			},
		//white chocoroot: 1 chocoroot, 1x white mildew (immature)
			'whiteChocoroot':{
				mother: 'bakerWheat',
				father: 'brownMold'
			},
		//thumbcorn: 2 wheat
			'thumbcorn':{
				valid: function(){return M.plants['bakeberry'].unlocked;}, //defer for bakeberry
				mother: 'bakerWheat',
				father: 'bakerWheat'
			},
		//bakeberry: 2 wheat
			'bakeberry':{
				mother: 'bakerWheat',
				father: 'bakerWheat'
			},
		//cronerice: 1 wheat, 1 thumbcorn
			'cronerice':{
				mother: 'bakerWheat',
				father: 'thumbcorn'
			},
		//gildmillet: 1 cronerice, 1 thumbcorn
			'gildmillet':{
				mother: 'cronerice',
				father: 'thumbcorn'
			},
		//clover: 1 gildmillet, 1 wheat
			'clover':{
				valid: function(){return (M.plants['gildmillet'].unlocked && M.plants['goldenClover'].unlocked);}, //defer for golden clovers
				mother: 'gildmillet',
				father: 'bakerWheat'
			},
		//gold clover: 1 gildmillet, 1 wheat
			'goldenClover':{
				mother: 'gildmillet',
				father: 'bakerWheat'
			},
		//shimmerlily: 1 clover, 1 gildmillet
			'shimmerlily':{
				mother: 'clover',
				father: 'gildmillet'
			},
		//elderwort: 1 cronerice, 1 shimmerlily
			'elderwort':{
				mother: 'cronerice',
				father: 'shimmerlily'
			},
		//whiskerbloom: 1 shimmerlily, 1 white chocoroot
			'whiskerbloom':{
				mother: 'shimmerlily',
				father: 'whiteChocoroot'
			},
		//chimerose: 1 shimmerlilly, 1 whiskerbloom
			'chimerose':{
				mother: 'whiskerbloom',
				father: 'shimmerlily'
			},
		//nursetulip: 2 whiskerbloom
			'nursetulip':{
				mother: 'whiskerbloom',
				father: 'whiskerbloom'
			},
		//drowsyfern: 1 chocoroot, 1 keenmoss
			'drowsyfern':{
				mother: 'keenmoss',
				father: 'chocoroot'
			},
		//wardlichen: 1 cronerice, 1 white mildew
			'wardlichen':{
				mother: 'cronerice',
				father: 'whiteMildew'
			},
		//keenmoss: 1 green rot, 1 brown mold
			'keenmoss':{
				mother: 'greenRot',
				father: 'brownMold'
			},
		//queenbeet: 1 bakeberry, 1 chocoroot
			'queenbeet':{
				mother: 'bakeberry',
				father: 'chocoroot'
			},
		//duketater: 2 queenbeet
			'duketater':{
				valid: function(){return (M.plants['queenbeetLump'].unlocked);}, //defer for juicy
				mother: 'queenbeet',
				father: 'queenbeet'
			},
		//tidygrass: 1 wheat, 1 white chocoroot
			'tidygrass':{
				mother: 'bakerWheat',
				father: 'whiteChocoroot'
			},
		//doughshroom: 2 crumbspore
			'doughshroom':{
				mother: 'crumbspore',
				father: 'crumbspore'
			},
		//glovemorel: 1 crumbspore, 1 thumbcorn
			'glovemorel':{
				mother: 'crumbspore',
				father: 'thumbcorn'
			},
		//cheapcap: 1 crumbspore, 1 shimmerlily
			'cheapcap':{
				mother: 'crumbspore',
				father: 'shimmerlily'
			},
		//fools bolete: 1 doughshroom, 1 green rot
			'foolBolete':{
				mother: 'doughshroom',
				father: 'greenRot'
			},
		//wrinklegill: 1 crumbspore, 1 brown mold
			'wrinklegill':{
				mother: 'crumbspore',
				father: 'brownMold'
			},
		//green rot: 1 white mildew, 1 ordinary clover
			'greenRot':{
				mother: 'clover',
				father: 'whiteMildew'
			},
		//ichorpuff: 1 elderwort, 1 crumbspore
			'ichorpuff':{
				mother: 'elderwort',
				father: 'crumbspore'
			}
		}
		
		for (var i in GardenLoveMachine.recipes)
		{
			if (typeof GardenLoveMachine.recipes[i].valid ==='undefined'){
				GardenLoveMachine.recipes[i].valid = Function("return (GardenLoveMachine.M.plants[\'"+GardenLoveMachine.recipes[i].mother+"\'].unlocked && GardenLoveMachine.M.plants[\'"+ GardenLoveMachine.recipes[i].father+"\'].unlocked);");
			}
			if (typeof GardenLoveMachine.recipes[i].recipeTime ==='undefined'){
				GardenLoveMachine.recipes[i].recipeTime = GardenLoveMachine.calculateRecipeTime([i, GardenLoveMachine.recipes[i].mother, GardenLoveMachine.recipes[i].father]);
			}
			if (typeof GardenLoveMachine.recipes[i].none ==='undefined'){
				GardenLoveMachine.recipes[i].none = false;
			}
			if (typeof GardenLoveMachine.recipes[i].meddleweed ==='undefined'){
				GardenLoveMachine.recipes[i].meddleweed = false;
			}
			if (typeof GardenLoveMachine.recipes[i].fill ==='undefined'){
				GardenLoveMachine.recipes[i].fill = false;
			}
			if (typeof GardenLoveMachine.recipes[i].juicy ==='undefined'){
				GardenLoveMachine.recipes[i].juicy = false;
			}
			if (typeof GardenLoveMachine.recipes[i].shriek ==='undefined'){
				GardenLoveMachine.recipes[i].shriek = false;
			}
			if (typeof GardenLoveMachine.recipes[i].boxcars ==='undefined'){
				GardenLoveMachine.recipes[i].boxcars = false;
			}
			if (typeof GardenLoveMachine.recipes[i].solo ==='undefined'){
				GardenLoveMachine.recipes[i].solo = false;
			}
			GardenLoveMachine.recipes[i].key = i;
		}
		GardenLoveMachine.recipesSorted = []
		for (var i in GardenLoveMachine.recipes){
			GardenLoveMachine.recipesSorted.push([i, GardenLoveMachine.recipes[i].recipeTime]);
		}
		
		GardenLoveMachine.recipesSorted.sort(function(a,b){return b[1] - a[1]});
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
			planterPlot: [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]]
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
		for (var x = offsetX; x<offsetX+3; x++) {
			for (var y = offsetY; y<offsetY+3; y++) {
				if (GardenLoveMachine.M.isTileUnlocked(x, y)) {
					result = result || callback(x, y);
				}
			}
		}
		return result;
	}
	
	GardenLoveMachine.forEachPlotAnd = function(callback,offsetX,offsetY) {
		var result = false;
		for (var x = offsetX; x<offsetX+3; x++) {
			for (var y = offsetY; y<offsetY+3; y++) {
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
			if (GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].key == seed){
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
		for (var i in GardenLoveMachine.recipesSorted)
		{
			var plant = GardenLoveMachine.recipesSorted[i][0];
			var M = GardenLoveMachine.M;
			if(GardenLoveMachine.recipes[plant].valid() && !M.plants[plant].unlocked){
				if(GardenLoveMachine.recipes[plant].none) return plant;
				var plantCheck = GardenLoveMachine.forEachTile(function(x,y){
					var M = GardenLoveMachine.M;
					var tile = M.getTile(x,y);
					return (tile[0]-1) == M.plants[plant].id;
				});
				if (!plantCheck) return plant;
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
		
		GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i] = GardenLoveMachine.recipeGet();
		GardenLoveMachine.forEachPlot(function(x,y){GardenLoveMachine.data.planterPlot[x][y] = -1;}, GardenLoveMachine.plotOffX[i], GardenLoveMachine.plotOffY[i]);
		if (GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].none) return;
		if (GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].fill) {
			GardenLoveMachine.forEachPlot(function(x,y){GardenLoveMachine.data.planterPlot[x][y] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;}, GardenLoveMachine.plotOffX[i], GardenLoveMachine.plotOffY[i]);
		}
		else if (GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].juicy) {
			GardenLoveMachine.forEachPlot(function(x,y){GardenLoveMachine.data.planterPlot[x][y] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;}, GardenLoveMachine.plotOffX[i], GardenLoveMachine.plotOffY[i]);
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = -1;
		}
		else if (GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].shriek) {
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;
			GardenLoveMachine.data.planterPlot[0+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;
			GardenLoveMachine.data.planterPlot[2+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;
		}
		else if (GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].boxcars) {
			GardenLoveMachine.data.planterPlot[0+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;
			GardenLoveMachine.data.planterPlot[2+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;
			
			GardenLoveMachine.data.planterPlot[0+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].father].id;
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].father].id;
			GardenLoveMachine.data.planterPlot[2+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].father].id;
		}
		else if (!GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].meddleweed) {
			GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][1+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].mother].id;
			if (!GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].solo) {
				GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][0+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].father].id;
				GardenLoveMachine.data.planterPlot[1+GardenLoveMachine.plotOffX[i]][2+GardenLoveMachine.plotOffY[i]] = M.plants[GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i]].father].id;
			}
		}
		
		GardenLoveMachine.data.plotState[i] = 2;
	}
	//1 = planting, to attempt to make sure shit grows at the same time (dummied out until i care)
	//2 = growing, mostly idle until prereqs for 3 are hit
	//3 = one tick from breeding/breed viable, indicator we want that breed soil
	GardenLoveMachine.plotGrowCheck = function(i) {
		var breedViable = false;
		if (GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].none) {
			GardenLoveMachine.data.plotState[i] = 0;
			return;
		}
		//only fill is meddleweed so don't breed
		else if (!GardenLoveMachine.recipes[GardenLoveMachine.data.plotRecipe[i].fill) {
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
			var foundPlant = GardenLoveMachine.forEachPlot(GardenLoveMachine.findNewPlant, GardenLoveMachine.plotOffX[i], GardenLoveMachine.plotOffY[i]);
			if (foundPlant) {
				GardenLoveMachine.data.plotState[i] = 4;
			}
		}
	}

	
	GardenLoveMachine.check = function(){
		var M = GardenLoveMachine.M;
		if(GardenLoveMachine.data.autoBreed){
			GardenLoveMachine.forEachTile(GardenLoveMachine.harvest);
			GardenLoveMachine.newCheck();
			GardenLoveMachine.plotThink();
			GardenLoveMachine.forEachTile(GardenLoveMachine.planter);
			GardenLoveMachine.fertilizer();
		}
		if(GardenLoveMachine.data.autoSacrifice){
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