/* eslint-disable no-undef */
import Lift from './lift.js';
import Skier from './skier.js';
import Util from './util.js';

export default class Game {
	constructor() {
		this.util = new Util();
		this.skier = new Skier(this);
		this.lift = new Lift(this);
		this.treeSmallDensity = 0.6;
		this.treeLargeDensity = 0.3;
		this.treeBareDensity = 0.1;
		this.bumpGroupDensity = 0.2;
		this.bumpSmallDensity = 0.2;
		this.bumpLargeDensity = 0.2;
		this.rockDensity = 0.05;
		this.stumpDensity = 0.05;
		this.jumpDensity = 0.05;
		this.otherSkierDensity = 0.05;
		this.jumpVBase = 0.7;
		this.jumpVMult = 0.0022;
		this.resCoefficient = 50 / 562860.0;
		this.collisionsEnabled = true;
		this.loadImages();
		this.loadFont();
		this.init();
	}

	// initialize game settings and generate game objects for start of game
	init() {
		this.isPaused = false;
		this.yDist = 0;
		this.style = 0;
		this.mousePos = {x: 0, y: 0};
		this.startTime = this.util.timestamp();
		this.currentTime = this.startTime;
		this.timestampFire = this.startTime;
		this.lastLogTime = null;
		this.gameWidth = window.innerWidth;
		this.gameHeight = window.innerHeight;
		this.skierTrail = [];
		this.currentTreeFireImg = this.tree_bare_fire1;
		this.stylePointsToAwardOnLanding = 0;
		this.calculateGameObjectCounts();

		// spawn game objects on and around the game screen for start of game
		this.treesSmall = this.initGameObjectsAtStart('tree_small', this.treeSmallCount);
		this.treesLarge = this.initGameObjectsAtStart('tree_large', this.treeLargeCount);
		this.treesBare = this.initGameObjectsAtStart('tree_bare', this.treeBareCount);
		this.bumpsGroup = this.initGameObjectsAtStart('bump_group', this.bumpGroupCount);
		this.bumpsSmall = this.initGameObjectsAtStart('bump_small', this.bumpSmallCount);
		this.bumpsLarge = this.initGameObjectsAtStart('bump_large', this.bumpLargeCount);
		this.rocks = this.initGameObjectsAtStart('rock', this.rockCount);
		this.jumps = this.initGameObjectsAtStart('jump', this.jumpCount);
		this.stumps = this.initGameObjectsAtStart('stump', this.stumpCount);
		this.otherSkiers = this.initGameObjectsAtStart('other_skier', this.otherSkierCount);
	}

	// restart the game
	restart() {
		this.init();
		this.skier.init();
		this.lift.init();
	}

	// load game assets
	loadImages() {
		this.tree_small = this.util.loadImage('/img/tree_small.png');
		this.tree_large = this.util.loadImage('/img/tree_large.png');
		this.tree_bare = this.util.loadImage('/img/tree_bare.png');
		this.tree_bare_fire1 = this.util.loadImage('/img/tree_bare_fire1.png');
		this.tree_bare_fire2 = this.util.loadImage('/img/tree_bare_fire2.png');
		this.lodge = this.util.loadImage('/img/lodge.png');
		this.bump_small = this.util.loadImage('/img/bump_small.png');
		this.bump_large = this.util.loadImage('/img/bump_large.png');
		this.bump_group = this.util.loadImage('/img/bump_group.png');
		this.rock = this.util.loadImage('/img/rock.png');
		this.stump = this.util.loadImage('/img/stump.png');
		this.jump = this.util.loadImage('/img/jump.png');
		this.otherSkier1 = this.util.loadImage('/img/other_skier1.png');
		this.otherSkier2 = this.util.loadImage('/img/other_skier2.png');
		this.otherSkier3 = this.util.loadImage('/img/other_skier3.png');
		this.otherSkierCrash = this.util.loadImage('/img/other_skier_crash.png');
	}

	// load the font family used for the in-game hud
	loadFont() {
		this.font = new FontFace('ModernDOS', 'url(../font/ModernDOS8x16.ttf)');
		this.font.load().then(function (loaded_face) {
			document.fonts.add(loaded_face);
			document.body.style.fontFamily = '"ModernDOS", Arial';
		}).catch(function (error) {
			console.log('Error loading ModernDOS font: ', error);
		});
	}

	// spawn the specified number of the specified type of game object on and around the screen at start of game
	initGameObjectsAtStart(type, count) {
		let gameObjects = [];
		for (let n = 0; n < count; n++) {
			let x = this.util.randomInt(-this.gameWidth * 3 / 2, this.gameWidth * 3 / 2);
			let y = this.util.randomInt(-this.gameHeight / 3, this.gameHeight * 5 / 3);

			gameObjects.push(this.spawnNewGameObject(type, x, y));
		}
		return gameObjects;
	}

	// spawn a new object of the given type in a random location offscreen
	spawnNewGameObjectOffScreen(type) {
		let xy = this.getRandomCoordinateOffScreen();
		return this.spawnNewGameObject(type, xy.x, xy.y);
	}

	// get an x/y coordinate pair for a location nearby offscreen
	getRandomCoordinateOffScreen() {
		let x = this.util.randomInt(-this.gameWidth * 3 / 2, this.gameWidth * 3 / 2);
		let y = this.util.randomInt(-this.gameHeight / 3, this.gameHeight * 5 / 3);

		// if coordinate would be onscreen, spawn it nearby offscreen instead
		if (x > -this.gameWidth / 2 - 50 && x < this.gameWidth / 2 &&
			y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3) {
			switch (this.util.randomInt(0, 5)) {
			case 0:
				x -= (this.gameWidth + 50);
				break;
			case 1:
				x -= this.gameWidth;
				y += this.gameHeight;
				break;
			case 2:
				y += this.gameHeight;
				break;
			case 3:
				x += this.gameWidth;
				y += this.gameHeight;
				break;
			default:
				x += this.gameWidth;
			}
		}
		return {x: x, y: y};
	}

	// spawn a new game object of specified type at the specified coordinates
	spawnNewGameObject(type, x, y) {
		switch (type) {
		case 'bump_group':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 64, hbHeight: 32, jumpOverHeight: 8, onCollision: this.slowOnCollision, img: this.bump_group };
		case 'bump_small':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 16, hbHeight: 4, jumpOverHeight: 4, onCollision: this.slowOnCollision, img: this.bump_small };
		case 'bump_large':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 24, hbHeight: 8, jumpOverHeight: 8, onCollision: this.slowOnCollision, img: this.bump_large };
		case 'tree_small':
			return { game: this, x: x, y: y, hbXOffset: 8, hbYOffset: 22, hbWidth: 14, hbHeight: 10, jumpOverHeight: 32, hasCollided: false, onCollision: this.crashOnCollision, otherSkierCanCrashInto: true, img: this.tree_small, drawThresholdY: -5 };
		case 'tree_large':
			return { game: this, x: x, y: y, hbXOffset: 9, hbYOffset: 52, hbWidth: 15, hbHeight: 12, jumpOverHeight: 64, hasCollided: false, onCollision: this.crashOnCollision, otherSkierCanCrashInto: true, img: this.tree_large, drawThresholdY: -37 };
		case 'tree_bare':
			return { game: this, x: x, y: y, hbXOffset: 7, hbYOffset: 18, hbWidth: 9, hbHeight: 9, jumpOverHeight: 27, hasCollided: false, onCollision: this.crashOnCollision, otherSkierCanCrashInto: true, img: this.tree_bare, drawThresholdY: 1 , isOnFire: false};
		case 'rock':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 23, hbHeight: 11, jumpOverHeight: 11, hasCollided: false, onCollision: this.crashOnCollision, otherSkierCanCrashInto: true, img: this.rock };
		case 'jump':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 32, hbHeight: 8, jumpOverHeight: 8, hasCollided: false, onCollision: this.jumpOnCollision, img: this.jump };
		case 'stump':
			return { game: this, x: x, y: y, hbXOffset: 0, hbYOffset: 0, hbWidth: 16, hbHeight: 11, jumpOverHeight: 11, hasCollided: false, onCollision: this.crashOnCollision, otherSkierCanCrashInto: true, img: this.stump };
		case 'other_skier':
			return { x: x, y: y, xv: 0, yv: 0.1, xSpeed: 0.15, hbXOffset: 7, hbYOffset: 13, hbWidth: 11, hbHeight: 11, hasCollided: false, isCrashed: false, timestamp: this.startTime + this.util.randomInt(0, 1000), img: this.otherSkier3 };
		default:
			throw('Error! Invalid game object type: ' + type);
		}
	}

	// adapt game to the size of the window
	resize(newWidth, newHeight) {
		this.gameWidth = newWidth;
		this.gameHeight = newHeight;

		this.skier.x = this.gameWidth / 2;
		this.skier.y = this.gameHeight / 3;

		this.adaptGameObjectCountToScreenSize();
	}

	// determine the target number of game objects of each type proportional to total game screen area
	calculateGameObjectCounts() {
		let area = this.gameWidth * this.gameHeight;
		this.treeSmallCount = Math.floor(area * this.resCoefficient * this.treeSmallDensity);
		this.treeLargeCount = Math.floor(area * this.resCoefficient * this.treeLargeDensity);
		this.treeBareCount = Math.floor(area * this.resCoefficient * this.treeBareDensity);
		this.bumpGroupCount = Math.floor(area * this.resCoefficient * this.bumpGroupDensity);
		this.bumpSmallCount = Math.floor(area * this.resCoefficient * this.bumpSmallDensity);
		this.bumpLargeCount = Math.floor(area * this.resCoefficient * this.bumpLargeDensity);
		this.rockCount = Math.floor(area * this.resCoefficient * this.rockDensity);
		this.jumpCount = Math.floor(area * this.resCoefficient * this.jumpDensity);
		this.stumpCount = Math.floor(area * this.resCoefficient * this.stumpDensity);
		this.otherSkierCount = Math.floor(area * this.resCoefficient * this.otherSkierDensity);
	}

	// trim or add new game objects proportionally to the size of the window
	adaptGameObjectCountToScreenSize() {
		this.calculateGameObjectCounts();
		this.correctGameObjectCount(this.treesSmall, this.treeSmallCount, 'tree_small');
		this.correctGameObjectCount(this.treesLarge, this.treeLargeCount, 'tree_large');
		this.correctGameObjectCount(this.treesBare, this.treeBareCount, 'tree_bare');
		this.correctGameObjectCount(this.bumpsGroup, this.bumpGroupCount, 'bump_group');
		this.correctGameObjectCount(this.bumpsSmall, this.bumpSmallCount, 'bump_small');
		this.correctGameObjectCount(this.bumpsLarge, this.bumpLargeCount, 'bump_large');
		this.correctGameObjectCount(this.rocks, this.rockCount, 'rock');
		this.correctGameObjectCount(this.jumps, this.jumpCount, 'jump');
		this.correctGameObjectCount(this.stumps, this.stumpCount, 'stump');
		this.correctGameObjectCount(this.otherSkiers, this.otherSkierCount, 'other_skier');
	}

	// trim or add new game objects until desired count matches actual
	correctGameObjectCount(gameObjects, desiredCount, type) {
		let diff = Math.abs(gameObjects.length - desiredCount);

		// trim excess offscreen objects
		if (gameObjects.length > desiredCount) {
			for (let i = 0; i < gameObjects.length; i++) {
				let trimmedCount = 0;
				let x = gameObjects[i].x;
				let y = gameObjects[i].y;

				// remove the object if it is offscreen
				if (!(x > -this.gameWidth / 2 && x < this.gameWidth / 2 &&
					y > -this.gameHeight / 3 && y < this.gameHeight * 2 / 3)) {
					gameObjects.splice(i, 1);
					trimmedCount++;
				}

				if (trimmedCount >= diff) {
					break;
				}
			}
		// add new objects offscreen
		} else if (gameObjects.length < desiredCount) {
			for (let n = 0; n < diff; n++) {
				gameObjects.push(this.spawnNewGameObjectOffScreen(type));
			}
		}
	}

	// update the gamestate
	update(step) {
		this.currentTime = this.util.timestamp();
		this.skier.update(this.getMouseAndVelocityInfo());
		this.lift.update(step);

		this.recycleGameObjectsAndCheckForCollisions(this.bumpsGroup);
		this.recycleGameObjectsAndCheckForCollisions(this.bumpsSmall);
		this.recycleGameObjectsAndCheckForCollisions(this.bumpsLarge);
		this.recycleGameObjectsAndCheckForCollisions(this.treesSmall);
		this.recycleGameObjectsAndCheckForCollisions(this.treesLarge);
		this.recycleGameObjectsAndCheckForCollisions(this.treesBare);
		this.recycleGameObjectsAndCheckForCollisions(this.rocks);
		this.recycleGameObjectsAndCheckForCollisions(this.jumps);
		this.recycleGameObjectsAndCheckForCollisions(this.stumps);

		// update position of game objects based on x/y-velocity of skier
		this.updatePosition(this.bumpsGroup, step);
		this.updatePosition(this.bumpsSmall, step);
		this.updatePosition(this.bumpsLarge, step);
		this.updatePosition(this.treesSmall, step);
		this.updatePosition(this.treesLarge, step);
		this.updatePosition(this.treesBare, step);
		this.updatePosition(this.rocks, step);
		this.updatePosition(this.jumps, step);
		this.updatePosition(this.stumps, step);

		this.updateOtherSkiers(step);

		for (let i = 0; i < this.skierTrail.length; i++) {
			this.skierTrail[i][0] -= this.skier.xv * step;
			this.skierTrail[i][1] -= this.skier.yv * step;
		}

		// delete offscreen skier trail
		for (let i = 0; i < this.skierTrail.length; i++) {
			if (this.skierTrail[i][1] < -this.gameHeight / 3 - 50) {
				this.skierTrail.splice(i, 1);
			}
		}

		// update total distance traveled vertically
		this.yDist += this.skier.yv * step;

		// flip the tree-on-fire image back and forth to create flicker effect
		let now = this.util.timestamp();
		if (now - this.timestampFire >= 50) {
			if (this.currentTreeFireImg == this.tree_bare_fire1) {
				this.currentTreeFireImg = this.tree_bare_fire2;
			} else {
				this.currentTreeFireImg = this.tree_bare_fire1;
			}
			this.timestampFire = now;
		}
	}

	// update image, velocity, and position of the other skiers
	updateOtherSkiers(step) {
		for (let i = 0; i < this.otherSkiers.length; i++) {
			let otherSkier = this.otherSkiers[i];

			// give the other skier a random xv (left, center, or right) every 1 sec
			if (!otherSkier.isCrashed) {
				let now = this.util.timestamp();
				if (now - otherSkier.timestamp >= 1000) {
					let newXV = this.util.randomInt(0, 3);
					switch(newXV){
					case 0:
						otherSkier.xv = -otherSkier.xSpeed;
						otherSkier.img = this.otherSkier1;
						break;
					case 1:
						otherSkier.xv = otherSkier.xSpeed;
						otherSkier.img = this.otherSkier2;
						break;
					default:
						otherSkier.xv = 0;
						otherSkier.img = this.otherSkier3;
						break;
					}
					otherSkier.timestamp = now;
					otherSkier.yv = 0.1;
				}

				// if the other skier hits another other skier, crash them both
				for (let j = 0; j < this.otherSkiers.length; j++) {
					if (i != j) {
						let otherOtherSkier = this.otherSkiers[j];
						if (this.isGameObjectCollidingWithOtherSkier(otherSkier, otherOtherSkier)) {
							this.crashOtherSkierOnCollision(otherSkier);
							this.crashOtherSkierOnCollision(otherOtherSkier);
						}
					}
				}
			// recycle the other skier's position if they have are crashed and have been passed
			} else if (this.hasGameObjectBeenPassed(otherSkier)) {
				this.recycleGameObjectPosition(otherSkier);
				otherSkier.isCrashed = false;
			}

			// if the other skier hits the skier, crash them both
			if (!otherSkier.hasCollided && this.isGameObjectCollidingWithSkier(otherSkier) && this.skier.jumpOffset < 29) {
				this.skier.isCrashed = true;
				this.style = 0;
				otherSkier.hasCollided = true;
				this.crashOtherSkierOnCollision(otherSkier);
			}
	
			otherSkier.x -= this.skier.xv * step - otherSkier.xv;
			otherSkier.y -= this.skier.yv * step - otherSkier.yv;
		}
	}

	// update position of game objects
	updatePosition(gameObjectList, step) {
		for (let i = 0; i < gameObjectList.length; i++) {
			gameObjectList[i].x -= this.skier.xv * step;
			gameObjectList[i].y -= this.skier.yv * step;
		}
	}
	// recycle the position of a list of game objects
	recycleGameObjects(gameObjects) {
		for (let i = 0; i < gameObjects.length; i++) {
			let object = gameObjects[i];
			if (this.hasGameObjectBeenPassed(object)) {
				this.recycleGameObjectPosition(object);
			}
		}
	}

	// recycle uphill offscreen game objects once they are passed, and also check if any are colliding with the skier
	recycleGameObjectsAndCheckForCollisions(gameObjects) {
		for (let i = 0; i < gameObjects.length; i++) {
			let object = gameObjects[i];

			// recycle the position of uphill offscreen game objects once they are passed
			if (this.hasGameObjectBeenPassed(object)) {
				this.recycleGameObjectPosition(gameObjects[i]);
			}
			// if the skier hits an object they haven't hit already, mark it as hit and do collision action if applicable
			else if (this.isGameObjectCollidingWithSkier(object) && this.skier.jumpOffset < object.jumpOverHeight && this.collisionsEnabled) {
				if (typeof object.onCollision !== 'undefined') {
					if (typeof object.hasCollided !== 'undefined') {
						if (!object.hasCollided) {
							object.onCollision();
							object.hasCollided = true;
						}
					} else {
						object.onCollision();
					}
				}
			}

			// if an other skier hits an object...
			for (let i = 0; i < this.otherSkiers.length; i++) {
				let otherSkier = this.otherSkiers[i];
				if (!otherSkier.isCrashed && this.isGameObjectCollidingWithOtherSkier(otherSkier, object) && this.collisionsEnabled) {
					if (typeof object.otherSkierCanCrashInto !== 'undefined' && object.otherSkierCanCrashInto) {
						this.crashOtherSkierOnCollision(otherSkier);
					}
				}
			}
			
		}
	}

	// update the x/y coordinate of the given game object to a random offscreen coordinate downhill
	recycleGameObjectPosition(gameObject) {
		let xy = this.getRandomCoordinateOffScreen();
		gameObject.x = xy.x;
		gameObject.y = xy.y;
		if (typeof gameObject.hasCollided !== undefined)
			gameObject.hasCollided = false;
		if (typeof gameObject.isOnFire !== undefined) {
			gameObject.isOnFire = false;
		}
	}

	// return true if the given game object is offscreen uphill or is far enough away horizontally
	hasGameObjectBeenPassed(object) {
		return object.y < -this.gameHeight / 3 - 50 ||
				object.x < -this.gameWidth * 3 / 2 ||
				object.x > this.gameWidth * 3 / 2;
	}

	// determine if the game object is colliding with the skier
	isGameObjectCollidingWithSkier(object) {
		let rect1 = this.skier.hitbox;
		let rect2 = { x: object.x + object.hbXOffset, y: object.y + object.hbYOffset, width: object.hbWidth, height: object.hbHeight };

		return this.util.areRectanglesColliding(rect1, rect2);
	}

	// determine if the game object is colliding with an other skier
	isGameObjectCollidingWithOtherSkier(otherSkier, object) {
		let rect1 = { x: otherSkier.x + otherSkier.hbXOffset, y: otherSkier.y + otherSkier.hbYOffset, width: otherSkier.hbWidth, height: otherSkier.hbHeight };
		let rect2 = { x: object.x + object.hbXOffset, y: object.y + object.hbYOffset, width: object.hbWidth, height: object.hbHeight };

		return this.util.areRectanglesColliding(rect1, rect2);
	}

	// make the skier crash
	crashOnCollision() {
		this.game.skier.isCrashed = true;
		this.game.style = 0;
		if (typeof this.isOnFire !== undefined) {
			if (this.game.skier.isJumping) {
				this.isOnFire = true;
			}
		}
	}

	crashOtherSkierOnCollision(otherSkier) {
		if (!otherSkier.isCrashed) {
			otherSkier.isCrashed = true;
			otherSkier.xv = 0;
			otherSkier.yv = 0;
			otherSkier.img = this.otherSkierCrash;
		}
	}

	// make the skier jump
	jumpOnCollision() {
		if (!this.game.skier.isCrashed && !this.game.skier.isSkatingLeft && !this.game.skier.isSkatingRight && !this.game.skier.isJumping) {
			let jumpV = this.game.skier.yv * this.game.jumpVMult + this.game.jumpVBase;
			this.game.skier.jumpV = jumpV;
			this.game.skier.isJumping = true;
			this.game.stylePointsToAwardOnLanding = jumpV * 5;
		}
	}

	// make the skier slow down
	slowOnCollision() {
		undefined;
	}

	// return info about the instantaneous skier-to-mouse angle and velocity vectors
	getMouseAndVelocityInfo() {
		let mouseDiffX = -(this.mousePos.x - ((this.gameWidth / 2) + 8));
		let mouseDiffY = -(this.mousePos.y - ((this.gameHeight / 3) + 32));
		let mouseAtanDegrees = this.util.degrees(Math.atan(mouseDiffY / mouseDiffX));
		let mouseAngle = 0, mouseDiffXVector = 0, mouseDiffYVector = 0;

		if (mouseDiffX > 0) {
			mouseAngle = mouseAtanDegrees;
			mouseDiffXVector = -Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = -Math.sin(this.util.radians(mouseAngle));
		} else if (mouseDiffX < 0) {
			if (mouseDiffY > 0) {
				mouseAngle = 180 + mouseAtanDegrees;
			} else if (mouseDiffY < 0) {
				mouseAngle = -180 + mouseAtanDegrees;
			}
			mouseDiffXVector = -Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = -Math.sin(this.util.radians(mouseAngle));
		} else if (mouseDiffX == 0) {
			if (mouseDiffY > 0) {
				mouseAngle = -90;
			} else {
				mouseAngle = 90;
			}
			mouseDiffXVector = Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = Math.sin(this.util.radians(mouseAngle));
		} else if (mouseDiffY == 0) {
			mouseAngle = 180;
			mouseDiffXVector = Math.cos(this.util.radians(mouseAngle));
			mouseDiffYVector = Math.sin(this.util.radians(mouseAngle));
		}

		let vAtanDegrees = this.util.degrees(Math.atan(this.skier.yv / this.skier.xv));
		let vAngle = 0, xvVector = 0, yvVector = 0;

		if (this.skier.xv > 0) {
			vAngle = vAtanDegrees;
			xvVector = -Math.cos(this.util.radians(vAngle));
			yvVector = -Math.sin(this.util.radians(vAngle));
		} else if (this.skier.xv < 0) {
			if (this.skier.yv > 0) {
				vAngle = 180 + vAtanDegrees;
			} else if (this.skier.yv < 0) {
				vAngle = -180 + vAtanDegrees;
			}
			xvVector = -Math.cos(this.util.radians(vAngle));
			yvVector = -Math.sin(this.util.radians(vAngle));
		} else if (this.skier.xv == 0) {
			if (this.skier.yv > 0) {
				vAngle = -90;
			} else {
				vAngle = 90;
			}
			xvVector = Math.cos(this.util.radians(vAngle));
			yvVector = Math.sin(this.util.radians(vAngle));
		} else if (this.skier.yv == 0) {
			vAngle = 180;
			xvVector = Math.cos(this.util.radians(vAngle));
			yvVector = Math.sin(this.util.radians(vAngle));
		}

		return [mouseAngle, [mouseDiffXVector, mouseDiffYVector], [xvVector, yvVector]];
	}

	// render the current state of the game
	draw(ctx) {
		// clear and fill with background color
		ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

		// draw bumps
		for (let i = 0; i < this.bumpsGroup.length; i++) {
			let bump = this.bumpsGroup[i];
			ctx.drawImage(bump.img, this.skier.x + bump.x, this.skier.y + bump.y);
		}
		for (let i = 0; i < this.bumpsSmall.length; i++) {
			let bump = this.bumpsSmall[i];
			ctx.drawImage(bump.img, this.skier.x + bump.x, this.skier.y + bump.y);
		}
		for (let i = 0; i < this.bumpsLarge.length; i++) {
			let bump = this.bumpsLarge[i];
			ctx.drawImage(bump.img, this.skier.x + bump.x, this.skier.y + bump.y);
		}

		// draw skier trail
		for (let i = 0; i < this.skierTrail.length; i++) {
			ctx.fillStyle = '#DDDDDD';
			ctx.fillRect(this.skier.x + this.skierTrail[i][0], this.skier.y + this.skierTrail[i][1], 2, 1);
			ctx.fillRect(this.skier.x + this.skierTrail[i][0] + 8, this.skier.y + this.skierTrail[i][1], 2, 1);
		}

		// draw jumps
		for (let i = 0; i < this.jumps.length; i++) {
			let jump = this.jumps[i];
			ctx.drawImage(jump.img, this.skier.x + jump.x, this.skier.y + jump.y);
		}

		// draw other skiers
		for (let i = 0; i < this.otherSkiers.length; i++) {
			let otherSkier = this.otherSkiers[i];
			ctx.drawImage(otherSkier.img, this.skier.x + otherSkier.x, this.skier.y + otherSkier.y);
		}

		// draw rocks
		for (let i = 0; i < this.rocks.length; i++) {
			let rock = this.rocks[i];
			ctx.drawImage(rock.img, this.skier.x + rock.x, this.skier.y + rock.y);
		}

		// draw stumps
		for (let i = 0; i < this.stumps.length; i++) {
			let stump = this.stumps[i];
			ctx.drawImage(stump.img, this.skier.x + stump.x, this.skier.y + stump.y);
		}

		// draw trees above skier
		for (let i = 0; i < this.treesSmall.length; i++) {
			let tree = this.treesSmall[i];
			if (tree.y < tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesLarge.length; i++) {
			let tree = this.treesLarge[i];
			if (tree.y < tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesBare.length; i++) {
			let tree = this.treesBare[i];
			if (tree.y < tree.drawThresholdY) {
				if (tree.isOnFire) {
					ctx.drawImage(this.currentTreeFireImg, this.skier.x + tree.x, this.skier.y + tree.y);
				} else {
					ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
				}
			}
		}

		// draw lift towers above skier
		this.lift.drawTowersAbovePlayer(ctx);

		// draw skier
		this.skier.draw(ctx);

		// draw trees below skier
		for (let i = 0; i < this.treesSmall.length; i++) {
			let tree = this.treesSmall[i];
			if (tree.y >= tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesLarge.length; i++) {
			let tree = this.treesLarge[i];
			if (tree.y >= tree.drawThresholdY) {
				ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
			}
		}
		for (let i = 0; i < this.treesBare.length; i++) {
			let tree = this.treesBare[i];
			if (tree.y >= tree.drawThresholdY) {
				if (tree.isOnFire) {
					ctx.drawImage(this.currentTreeFireImg, this.skier.x + tree.x, this.skier.y + tree.y);
				} else {
					ctx.drawImage(tree.img, this.skier.x + tree.x, this.skier.y + tree.y);
				}
			}
		}

		// draw lift chairs
		this.lift.drawChairs(ctx);

		// draw lift cables
		this.lift.drawCables(ctx);

		// draw lift towers below skier
		this.lift.drawTowersBelowPlayer(ctx);
		this.lift.drawTowerTops(ctx);

		// draw hud (140x52 black border 1px)
		ctx.fillStyle = '#000000';
		ctx.fillRect(this.gameWidth - 140, 0, 140, 52);
		ctx.fillStyle = '#FFFFFF';
		ctx.fillRect(this.gameWidth - 139, 0, 139, 51);
		ctx.font = '14px ModernDOS';
		ctx.fillStyle = '#000000';
		ctx.fillText('Time:  ' + this.util.timeToString(this.currentTime - this.startTime), this.gameWidth - 136, 10);
		let leadingSpace = '     ';
		let dist = Math.ceil(this.yDist / 28.7514);
		if (dist > 999999) {
			leadingSpace = '';
		} else if (dist > 99999) {
			leadingSpace = ' ';
		} else if (dist > 9999) {
			leadingSpace = '  ';
		} else if (dist > 999) {
			leadingSpace = '   ';
		} else if (dist > 99) {
			leadingSpace = '    ';
		}
		ctx.fillText('Dist:' + leadingSpace + dist.toString().padStart(2, '0') + 'm', this.gameWidth - 136, 22);
		ctx.fillText('Speed:    ' + Math.ceil(this.skier.currentSpeed / 28.7514).toString().padStart(2, '0') + 'm/s', this.gameWidth - 136, 34);
		ctx.fillText('Style:       ' + Math.floor(this.style), this.gameWidth - 136, 46);
	}
}