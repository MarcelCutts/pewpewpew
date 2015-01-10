// function to check that the object won't go of the screen
var clamp = function(x, min, max){
	return x < min ? min : ( x > max ? max : x);
};

// creating an instance of the game engine
var Q = Quintus( { development: true } ) // pass in { development: true } to run on development mode. This will force assets to reload at every refresh
	.include("Sprites, Anim, Input, Touch, Scenes, UI") // including the Modules
	.setup({width: $(window).width()*0.75, height: $(window).height()*0.75, scaleToFit: true }) // setup binds the engine to canvas. maximize: true for full screen; scaleToFit: true
	.touch();

// specify display ruled for the touch controls
// these are only visible on phone/tablet
Q.input.touchControls({
	controls:
	[
		['left', '<'],
		['right', '>'],
		[], // empty controls to enleave empty space in the middle
		[], // and make the existing controls smaller
		[],
		[],
		['fire', 'a']
	]
});

Q.controls();

Q.Sprite.extend("Player", {
	init: function(p){
		this._super(p, {
			sprite: "player", 
			sheet: "player",
			x: Q.el.width / 2,
			y: Q.el.height - 60,
			type: Q.SPRITE_FRIENDLY,
			speed: 10
		});

		this.add("animation");
		this.play("default");
		this.add("FriendlyGun");
		this.on("hit", function(col){
			if(col.obj.isA("Shot") && ((col.obj.p.type & Q.SPRITE_ENEMY) == Q.SPRITE_ENEMY)){
				this.destroy();
				col.obj.destroy();
				Q.stageScene("endGame", 1, { label: "You Died!" });
			}
		})
	},
	step: function(dt){
		if(Q.inputs['left'])
			this.p.x -= this.p.speed;
		if(Q.inputs['right'])
			this.p.x += this.p.speed;

		this.p.x = clamp(this.p.x, 0 + (this.p.w / 2), Q.el.width - (this.p.w / 2));
		this.stage.collide(this);
	}
});

Q.Sprite.extend("Alien", {
	init: function(p){
		this._super(p, {
			sprite: "alien",
			sheet: "alien",
			x: Q.el.width * Math.random(),
			speed: 200
		});

		this.p.y = this.p.h;
		this.add("animation");
		this.play("default");
		this.add("BasicAI");
		this.on("hit", function(col){

			if(col.obj.isA("Shot") && ((col.obj.p.type & Q.SPRITE_FRIENDLY) == Q.SPRITE_FRIENDLY)){
				this.destroy();
				col.obj.destroy();
				Q.stageScene("endGame", 1, { label: "You Won!" });
			}
		});
	},
	step: function(dt) {
		this.stage.collide(this);
	}
});

Q.Sprite.extend("Shot", {
	init: function(p){
		this._super(p, {
			sprite: "shot",
			sheet: "shot",
			speed: 200
		});
		this.add("animation");
		this.play("default");
	},
	step: function(dt){
		this.p.y -= this.p.speed * dt;

		if(this.p.y > Q.el.height || this.p.y < 0){
			this.destroy();
		}

	}
});

Q.component("BasicAI", {
	// make the AI automatically change directions every 1-5 seconds
	added: function(){
		this.entity.changeDirections();
		this.entity.on("step", this, "move");
		this.entity.on("step", this, "tryToFire");
		this.entity.add("AlienGun");
	},
	extend: {
		changeDirections: function(){
			var entity = this;
			var numberOfSeconds = Math.floor((Math.random() * 5 ) + 1);
			setTimeout(function(){
				entity.p.speed = -entity.p.speed;
				entity.changeDirections();
			}, numberOfSeconds * 1000);
		}
	},
	move: function(dt){

		this.entity.p.x -= this.entity.p.speed * dt;

		// when at end of page, turn around
		if(this.entity.p.x > Q.el.width - (this.entity.p.w / 2) || this.entity.p.x < 0 + (this.entity.p.w / 2)){
			this.entity.p.speed = -this.entity.p.speed;
		};
	},
		tryToFire: function(){
			// check if we're within the width of the player then try to fire
			var player = Q("Player").first();
			if(!player)
				return;
			if(player.p.x + player.p.w > this.entity.p.x && player.p.x - player.p.w < this.entity.p.x){
				this.entity.fire(Q.SPRITE_ENEMY);
			}
		}
});

Q.component("FriendlyGun", new Gun(500,500))
Q.component("AlienGun", new Gun(300,600));

Q.scene("mainLevel", function(stage){
	Q.gravity = 0;
	stage.insert(new Q.Sprite({ asset: "background-city.jpg", x: Q.el.width / 2, y: Q.el.height / 2, type: Q.SPRITE_NONE }));
	stage.insert(new Q.Player());
	stage.insert(new Q.Alien());
});

Q.scene("endGame", function(stage){
	var container = stage.insert(new Q.UI.Container({
		x: Q.width / 2, y: Q.height / 2, fill: "#FFFFFF"
	}));

	var button = container.insert(new Q.UI.Button({
		x:0, y:0, fill: "#CCCCCC", label: "Play!"
	}));

	container.insert(new Q.UI.Text({
		x: 5, y: -10 - button.p.h, label: stage.options.label
	}));

	button.on("click", function(){
		Q.clearStages();
		Q.stageScene("mainLevel");
	});
	container.fit(20);
});

// need to lead all the assets here
// quintus automatically looks for the assets in the "images" folder
Q.load(["background-city.jpg", "spritesheet_new.png", "player.json", "shot.png", "shot.json", "mike-med.png", "alien.json"], function(){
	Q.compileSheets("spritesheet_new.png", "player.json");
	Q.compileSheets("shot.png", "shot.json");
	Q.compileSheets("mike-med.png", "alien.json");
	Q.animations("player", { default: { frames: [0, 1, 2, 3, 4, 5], rate: 1/4 }});
	Q.animations("shot", { default: { frames: [0, 1], rate: 1/4 }});
	Q.animations("alien", { default: { frames: [0], rate: 1/4 }});
	Q.stageScene("endGame", 1, { label: "Time to shoot!" });
	//Q.stageScene("mainLevel");
});


/**
 * Constructs a new gun object with properties that are understood
 * if used in to a Q.component() method argument 
 * @param {int} minimumFiringPause Shortest allowed time between firing
 * @param {int} maximumFiringPause Longest allowed time between firing
 */
function Gun(minimumFiringPause, maximumFiringPause) {
	this.added = function(){ // executes as soon as component is added
		this.entity.p.shots = []; // this is where we will store all the shots the sprite has fired
		this.entity.p.canFire = true;
		this.entity.on("step", "handleFiring");
	};

	this.extend = {
		handleFiring: function(dt){

			// remove shots from the array of shots
			for(var i = this.p.shots.length - 1; i>=0; i--){
				if(this.p.shots[i].isDestroyed){
					this.p.shots.splice(i, 1);
				}
			}

			if(Q.inputs['fire'] && this.p.type == Q.SPRITE_FRIENDLY){
				this.fire(Q.SPRITE_FRIENDLY);
			}
		},
		fire: function(type){
			var entity = this;

			if(!entity.p.canFire)
				return;

			var shot;
			if(type == Q.SPRITE_FRIENDLY){
				shot = Q.stage().insert(new Q.Shot({ x: entity.p.x, y: entity.p.y - 80, speed: 200, type: Q.SPRITE_DEFAULT | Q.SPRITE_FRIENDLY}));	
			}
			else{
				shot = Q.stage().insert(new Q.Shot({ x: entity.p.x, y: entity.p.y + entity.p.h - 20, speed: -200, type: Q.SPRITE_DEFAULT | Q.SPRITE_ENEMY}));	
			}

			entity.p.shots.push(shot);
			entity.p.canFire = false;
			setTimeout(function(){
				entity.p.canFire = true;
			}, utilities.randomIntFromInterval(minimumFiringPause, maximumFiringPause));
		}
	};
}