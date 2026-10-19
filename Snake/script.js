//-----------
//  PATTERN
//-----------
var sCanvas = document.getElementById("sC");
var sCtx = sCanvas.getContext("2d");

function resSCanvas() {
  sCanvas.width = window.innerWidth;
  sCanvas.height = window.innerHeight;
  drawSPattern();
}

function drawSPattern() {
  sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
  sCtx.strokeStyle = "#768256";
  sCtx.lineWidth = 32;
  sCtx.lineCap = "square";

  var tSnakes = 3; //pattern

  for (var i = 0; i < tSnakes; i++) {
    //random start along left edge
    var x = 0;
    var y = Math.floor(Math.random() * (sCanvas.height / 32)) * 32;

    sCtx.beginPath();
    sCtx.moveTo(x, y);

    var segmentL = 64;

    while (x < sCanvas.width) {
      x += segmentL; //slither 90 degree
      y += Math.random() > 0.5 ? 96 : -96;

      //safety

      if (y < 32) y = 64;
      if (y > sCanvas.height - 32) y = sCanvas.height - 64;

      sCtx.lineTo(x, y);
    }
    sCtx.stroke();
  }
}

window.addEventListener("resize", resSCanvas);
resSCanvas(); //first bp

//-----------
//    GAME
//-----------
var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");

//vars
var score = 0;
var count = 0;
var grid = 16;
var gO = false;
var poison = false;
var pEnd = 0;
var p_Dur = 10000; //10s in ms
var p_C = 0.025; //2.5%
var p_S = 1.25;

//var to hold fDelay on slider
var fDelay = 6;

//listener that update the speed when slider move
var sSlider = document.getElementById("slider");
var sValue = document.getElementById("value");
if (sSlider && sValue) {
  sSlider.addEventListener("input", function (e) {
    fDelay = 17 - parseInt(e.target.value);
    sValue.innerHTML = e.target.value;
  });
}

//objects
var snake = {
  x: 0,
  y: 0,
  dx: 0,
  dy: 0,
  cells: [],
  maxCells: 4,
};
var apple = {
  x: 0,
  y: 0,
  poison: false,
};

//randomizer
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function spawnApple() {
  apple.x = getRandomInt(0, 25) * grid;
  apple.y = getRandomInt(0, 25) * grid;
  apple.poison = Math.random() < p_C;
}

//Highscore
var d_ms = 24 * 60 * 60 * 1000;

function lScore() {
  //score load
  var saved = localStorage.getItem("scores");
  if (saved == null) {
    return [];
  }
  return JSON.parse(saved);
}
function gAllt() {
  //get all time
  var saved = localStorage.getItem("sAllt");
  if (saved == null) {
    return 0;
  }
  return parseInt(saved);
}
function gBest(winMs) {
  //best score in last x ms
  var now = Date.now();
  var scores = lScore();
  var best = 0;
  for (var i = 0; i < scores.length; i++) {
    if (now - scores[i].time < winMs && scores[i].score > best) {
      best = scores[i].score;
    }
  }
  return best;
}
function svScore(s) {
  //save score
  if (s <= 0) return;
  var now = Date.now();
  var scores = lScore();

  var recent = []; //older than 7 days score gone
  for (var i = 0; i < scores.length; i++) {
    if (now - scores[i].time < 7 * d_ms) {
      recent.push(scores[i]);
    }
  }
  recent.push({ score: s, time: now });
  localStorage.setItem("scores", JSON.stringify(recent));

  if (s > gAllt()) {
    localStorage.setItem("sAllt", s);
  }
}
function swBest() {
  var el = document.getElementById("best");
  if (el) {
    el.innerHTML = gBest(d_ms);
  }
}
//for gameover
function reset() {
  snake.x = 160;
  snake.y = 160;
  snake.cells = [];
  snake.maxCells = 4;
  snake.dx = grid;
  snake.dy = 0;
  poison = false;
  gO = false;
  score = 0;
  document.getElementById("score").innerHTML = score;
  swBest();
  spawnApple();
}
function eGame() {
  gO = true;
  svScore(score);
  swBest();

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = "16px sans-serif";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 - 10);
  ctx.fillText(
    "Today's best: " + gBest(d_ms),
    canvas.width / 2,
    canvas.height / 2 + 15,
  );
  ctx.fillText(
    "Weekly best: " + gBest(7 * d_ms),
    canvas.width / 2,
    canvas.height / 2 + 40,
  );
  ctx.fillText(
    "All-Time best: " + gAllt(),
    canvas.width / 2,
    canvas.height / 2 + 65,
  );
  ctx.fillText(
    "Press space/enter to retry :P",
    canvas.width / 2,
    canvas.height / 2 + 95,
  );
}

//Keys
document.addEventListener("keydown", function (e) {
  //retry key
  if (gO) {
    if (e.which === 32 || e.which === 13) {
      reset();
    }
    return;
  }
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

//the loop
function Loop() {
  requestAnimationFrame(Loop);
  if (gO) return; //froze the overlay

  if (poison && Date.now() >= pEnd) {
    poison = false;
  }
  var d = poison ? fDelay / p_S : fDelay;
  if (++count < d) {
    return;
  }
  count = 0;

  //velocity
  snake.x += snake.dx;
  snake.y += snake.dy;
  //walls
  if (
    snake.x < 0 ||
    snake.x >= canvas.width ||
    snake.y < 0 ||
    snake.y >= canvas.height
  ) {
    eGame();
    return;
  }
  //track snake been, front array head
  snake.cells.unshift({ x: snake.x, y: snake.y });
  //apple gone
  if (snake.x === apple.x && snake.y === apple.y) {
    score += 1;
    document.getElementById("score").innerHTML = score;
    if (apple.poison) {
      poison = true;
      pEnd = Date.now() + p_Dur;
      snake.maxCells = 1;
    } else if (!poison) {
      snake.maxCells += 1;
    }
    spawnApple();
  }
  //cells gone when move away
  while (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //apple
  ctx.fillStyle = apple.poison ? "purple" : "red";
  ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  //snake 1 cell at a time
  ctx.fillStyle = poison ? "#7bd34f" : "#a3b574";
  snake.cells.forEach(function (cell) {
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);
  });
  //self collision
  for (var i = 1; i < snake.cells.length; i++) {
    if (snake.x === snake.cells[i].x && snake.y === snake.cells[i].y) {
      eGame();
      // return;
    }
  }
}
reset();
requestAnimationFrame(Loop);
