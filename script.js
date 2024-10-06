window.onload = function () {
	class SnakeGame {
		constructor() {
			this.fieldSize = 10;
			this.gameField = document.getElementById('game');
			this.scoreElement = document.getElementById('scoreScreen');
			this.recordElement = document.getElementById('record');
			this.restartButton = document.getElementById('restart');
			this.cells = [];
			this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
			this.baseSpeed = 500; // Базовая скорость
			this.currentSpeed = this.baseSpeed;
			this.direction = 'right';
			this.apple = null;
			this.score = 0;
			this.isGameOver = false;
			this._initGame();
		}

		_initGame() {
			this._createField();
			this._renderSnake();
			this._placeApple();
			this._bindEvents();
			this._startGame();
			this._updateRecord();
		}

		_createField() {
			for (let y = 0; y < this.fieldSize; y++) {
				for (let x = 0; x < this.fieldSize; x++) {
					const cell = document.createElement('div');
					cell.className = 'cell';
					cell.dataset.x = x;
					cell.dataset.y = y;
					this.gameField.appendChild(cell);
					this.cells.push(cell);
				}
			}
		}

		_renderSnake() {
			this.cells.forEach(cell => cell.classList.remove('snake'));
			this.snake.forEach(part => {
				const cell = this._getCell(part.x, part.y);
				if (cell) cell.classList.add('snake');
			});
		}

		_placeApple() {
			let x, y;
			do {
				x = Math.floor(Math.random() * this.fieldSize);
				y = Math.floor(Math.random() * this.fieldSize);
			} while (this._isSnake(x, y));
			this.apple = { x, y };
			const appleCell = this._getCell(x, y);
			appleCell.classList.add('apple');
		}

		_getCell(x, y) {
			return this.cells[y * this.fieldSize + x];
		}

		_isSnake(x, y) {
			return this.snake.some(part => part.x === x && part.y === y);
		}

		_move() {
			if (this.isGameOver) return;
			let { x, y } = this.snake[0];
			switch (this.direction) {
				case 'up': y--; break;
				case 'down': y++; break;
				case 'left': x--; break;
				case 'right': x++; break;
			}

			// Проверка на выход за пределы поля
			if (x < 0 || x >= this.fieldSize || y < 0 || y >= this.fieldSize) {
				this._gameOver();
				return;
			}

			if (this._isSnake(x, y)) {
				this._gameOver();
				return;
			}

			this.snake.unshift({ x, y });

			if (x === this.apple.x && y === this.apple.y) {
				this.score++;
				this.scoreElement.textContent = `Счёт: ${this.score}`;
				const currentAppleCell = this._getCell(this.apple.x, this.apple.y);
				currentAppleCell.classList.remove('apple');
				this._placeApple();
				this._updateSpeed(); // Обновляем скорость после съедения яблока
			} else {
				this.snake.pop();
			}
			this._renderSnake();
		}

		_gameOver() {
			this.isGameOver = true;
			this.gameField.innerHTML += '<div class="game-over">Игра окончена!</div>';
			this._checkRecord();
			this.restartButton.style.display = 'block';
		}

		_checkRecord() {
			let record = localStorage.getItem('snakeRecord') || 0;
			if (this.score > record) {
				localStorage.setItem('snakeRecord', this.score);
				this.recordElement.textContent = this.score;
			}
		}

		_updateRecord() {
			this.recordElement.textContent = localStorage.getItem('snakeRecord') || 0;
		}

		_bindEvents() {
			document.addEventListener('keydown', (e) => {
				switch (e.key) {
					case 'ArrowUp': if (this.direction !== 'down') this.direction = 'up'; break;
					case 'ArrowDown': if (this.direction !== 'up') this.direction = 'down'; break;
					case 'ArrowLeft': if (this.direction !== 'right') this.direction = 'left'; break;
					case 'ArrowRight': if (this.direction !== 'left') this.direction = 'right'; break;
				}
			});
			this.gameField.addEventListener('click', () => {
				if (this.isGameOver) return;
				this._startGame();
			});
			this.restartButton.addEventListener('click', () => {
				this._restartGame();
			});
		}
		_updateSpeed() {
			this.currentSpeed = Math.max(500, this.baseSpeed - this.score * 50); // Минимальная скорость 500ms
			clearInterval(this.gameLoop); // Очищаем текущий интервал
			this.gameLoop = setInterval(() => this._move(), this.currentSpeed); // Устанавливаем новый интервал
		}

		_startGame() {
			if (!this.gameLoop) {
				this.gameLoop = setInterval(() => this._move(), this.currentSpeed);
			}
		}

		_restartGame() {
			this.gameField.innerHTML = '';
			this.cells = [];
			this.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }];
			this.direction = 'right';
			this.apple = null;
			this.score = 0;
			this.isGameOver = false;
			this.scoreElement.textContent = '0';
			this.restartButton.style.display = 'none';
			this._initGame();
		}
	}

	new SnakeGame();
}
