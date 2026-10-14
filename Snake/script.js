//-----------
//  PATTERN
//-----------
var sCanvas = document.getElementById("snakeCanvas");
var sCtx = sCanvas.getContext("2d");

function resSCanvas() {
  sCanvas.width = window.innerWidth;
  sCanvas.height = window.innerHeight;
  drawSPattern();
}

function drawSPattern() {
  sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
  //8-Bit Retro
  sCtx.strokeStyle = "#768256";
  sCtx.lineWidth = 32;
  sCtx.lineCap = "square";
  sCtx.lineJoin = "miter";

  var tSnakes = 3; //pattern generator

  for (var i = 0; i < tSnakes; i++) {
    //random start along left edge
    var x = 0;
    var y = Math.floor(Math.random() * (sCanvas.height / 32)) * 32;

    sCtx.beginPath();
    sCtx.moveTo(x, y);

    var segmentL = 64;

    while (x < sCanvas.width) {
      x += segmentL; //slither up or down 90 degree
      y += Math.random() > 0.5 ? 96 : -96;

      //background path safety

      if (y < 32) y = 64;
      if (y > sCanvas.height - 32) y = sCanvas.height - 64;

      sCtx.lineTo(x, y);
    }
    sCtx.stroke();
  }
}

window.addEventListener("resize", resSCanvas);
resSCanvas(); //first background pattern

//-----------
//    GAME
//-----------
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

//variables
var score = 0;
var count = 0;
var grid = 16;

//var to hold frame delay on slider
var fDelay = 6;

//listener that update the speed when slider move
var sSlider = document.getElementById("speedSlider");
var sValue = document.getElementById("speedValue");
if (sSlider && sValue) {
  sSlider.addEventListener("input", function (e) {
    fDelay = 17 - parseInt(e.target.value);
    sValue.innerHTML = e.target.value;
  });
}

//objects
var snake = {
  x: 160,
  y: 160,
  dx: grid,
  dy: 0,
  cells: [],
  maxCells: 4,
};
var apple = {
  x: 320,
  y: 320,
};

//Keys
document.addEventListener("keydown", function (e) {
  //left arrow key
  if (e.which === 37 && snake.dx === 0) {
    snake.dx = -grid;
    snake.dy = 0;
  }
  //up arrow key
  else if (e.which === 38 && snake.dy === 0) {
    snake.dy = -grid;
    snake.dx = 0;
  }
  //right arrow key
  else if (e.which === 39 && snake.dx === 0) {
    snake.dx = grid;
    snake.dy = 0;
  }
  //down arrow key
  else if (e.which === 40 && snake.dy === 0) {
    snake.dy = grid;
    snake.dx = 0;
  }
});

//randomizer
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//the loop
function Loop() {
  requestAnimationFrame(Loop);
  if (++count < fDelay) {
    return;
  }
  count = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //snake velocity
  snake.x += snake.dx;
  snake.y += snake.dy;
  //wrap snake position horizontally edge of screen
  if (snake.x < 0) {
    snake.x = canvas.width - grid;
  } else if (snake.x >= canvas.width) {
    snake.x = 0;
  }
  //wrap snake position vertically edge of screen
  if (snake.y < 0) {
    snake.y = canvas.height - grid;
  } else if (snake.y >= canvas.height) {
    snake.y = 0;
  }
  //track where snake has been, front array head
  snake.cells.unshift({ x: snake.x, y: snake.y });
  //cells gone when move away
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }
  //apple
  ctx.fillStyle = "red";
  ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);
  //snake 1 cell at a time
  ctx.fillStyle = "#a3b574";
  snake.cells.forEach(function (cell, index) {
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);
    //apple gone
    if (cell.x === apple.x && cell.y === apple.y) {
      score += 1;
      document.getElementById("score").innerHTML = score;
      snake.maxCells += 1;
      apple.x = getRandomInt(0, 25) * grid;
      apple.y = getRandomInt(0, 25) * grid;
    }
    for (var i = index + 1; i < snake.cells.length; i++) {
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        snake.x = 160;
        snake.y = 160;
        snake.cells = [];
        snake.maxCells = 4;
        snake.dx = grid;
        snake.dy = 0;
        apple.x = getRandomInt(0, 25) * grid;
        apple.y = getRandomInt(0, 25) * grid;
      }
    }
  });
}
requestAnimationFrame(Loop);
