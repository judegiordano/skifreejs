/* eslint-disable no-undef */
export default class InputHandler {
	constructor(canvas, game) {
		if (!game.util.isOnMobile()) {
			canvas.addEventListener('mousemove', (event) => {
				game.mousePos.x = event.clientX - ((window.innerWidth - canvas.width) / 2);
				game.mousePos.y = event.clientY - ((window.innerHeight - canvas.height) / 2);
			});

			canvas.addEventListener('mousedown', (event) => {
				if (!game.isPaused) {
					if (event.button == 0) {
						if (!game.skier.isCrashed && game.skier.isJumping) {
							game.skier.rotateJumpStage();
						}
					} else if (event.button == 2 && !game.skier.trick1Disabled) {
						if (!game.skier.isCrashed && game.skier.isJumping) {
							game.skier.isDoingTrick1 = true;
							game.skier.trick1Disabled = true;
							game.skier.trick1StartTime = game.util.timestamp();
						}
					}
				}
			});

			canvas.addEventListener('mouseup', (event) => {
				if (!game.isPaused) {
					if (event.button == 0) {
						if (!game.skier.isCrashed) {
							if (!game.skier.isJumping) {
								game.skier.isJumping = true;
								game.skier.jumpV = game.skier.jumpVInit;
							}
						} else if (game.skier.isStopped) {
							game.skier.isCrashed = false;
						}
					} else if (event.button == 2) {
						game.skier.isDoingTrick1 = false;
						game.skier.trick1EndTime = game.util.timestamp();
					}
				}
			});

			let left = 65, right = 68, f2 = 113, space = 32;

			document.addEventListener('keydown', (event) => {
				switch (event.keyCode) {
				case left:
					if (game.skier.isStopped) {
						game.skier.isSkatingLeft = true;
					}
					break;
				case right:
					if (game.skier.isStopped) {
						game.skier.isSkatingRight = true;
					}
					break;
				}
			});

			document.addEventListener('keyup', (event) => {
				switch (event.keyCode) {
				case left:
					game.skier.isSkatingLeft = false;
					break;
				case right:
					game.skier.isSkatingRight = false;
					break;
				case space:
					if (game.isPaused) {
						game.startTime += (game.util.timestamp() - game.timePausedAt);
						game.isPaused = false;
					} else {
						game.drawIsPaused = false; // will be flipped to true immediately in game.draw()
						game.timePausedAt = game.util.timestamp();
						game.isPaused = true;
					}
					break;
				case f2:
					game.init();
					break;
				}
			});

		} else {
			canvas.addEventListener('touchstart', (event) => {
				event.preventDefault();
				if (!game.isPaused) {
					game.touchStartTime = game.util.timestamp();
					let touch = event.touches[0];
					let touchX = touch.clientX - ((window.innerWidth - canvas.width) / 2);
					let touchY = touch.clientY - ((window.innerHeight - canvas.height) / 2);
					game.lastTouchLoc = { x: touchX, y: touchY };
					if (touchY >= game.skier.y + 30) {
						game.mousePos.x = touchX;
						game.mousePos.y = touchY;
						if (game.skier.isJumping && !game.skier.trick1Disabled && !game.skier.isCrashed) {
							game.skier.isDoingTrick1 = true;
							game.skier.trick1Disabled = true;
							game.skier.trick1StartTime = game.util.timestamp();
						}
					} else {
						if (game.skier.isJumping ) {
							game.skier.rotateJumpStage();
						}
					}
					if (game.skier.isCrashed) {
						game.skier.isCrashed = false;
					}
				}
			});

			canvas.addEventListener('touchmove', (event) => {
				event.preventDefault();
				if (!game.isPaused) {
					let touch = event.touches[0];
					let touchX = touch.clientX - ((window.innerWidth - canvas.width) / 2);
					let touchY = touch.clientY - ((window.innerHeight - canvas.height) / 2);
					game.lastTouchLoc = { x: touchX, y: touchY };
					if (touchY >= game.skier.y + 30) {
						game.mousePos.x = touchX;
						game.mousePos.y = touchY;
					}
				}
			});

			canvas.addEventListener('touchend', (event) => {
				event.preventDefault();
				if (!game.isPaused) {
					if (game.util.timestamp() - game.touchStartTime < 200 && game.lastTouchLoc.y < game.skier.y + 30) {
						if (!game.skier.isCrashed) {
							if (!game.skier.isJumping) {
								game.skier.isJumping = true;
								game.skier.jumpV = game.skier.jumpVInit;
							}
						}
					}
					if (game.skier.isDoingTrick1) {
						game.skier.isDoingTrick1 = false;
						game.skier.trick1EndTime = game.util.timestamp();
					}
				}
			});
		}
	}
}
