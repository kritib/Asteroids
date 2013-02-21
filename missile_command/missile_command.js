WIDTH = 500;
HEIGHT = 600;
CANNON_BLAST_RADIUS = 30;
MISSILE_BLAST_RADIUS = 15;
FPS = 32;

var MC = (function () {

  function Missile (x, angle) {
    var that = this;

    that.startPos = {
      x: x,
      y: 0
    };

    that.currentPos = {
      x: x,
      y: 0
    }

    that.angle = angle;
    that.speed = 1;

    that.draw = function (ctx) {
      ctx.strokeStyle = "rgb(255, 0, 0)";
      ctx.beginPath();
      ctx.moveTo(that.startPos.x, that.startPos.y);
      ctx.lineTo(that.currentPos.x, that.currentPos.y);
      ctx.stroke();
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.beginPath();
      ctx.arc(that.currentPos.x, that.currentPos.y, 2, 0, 2*Math.PI, true);
      ctx.fill();
    };

    that.update = function (game) {
      that.currentPos.x += (Math.cos(that.angle) * that.speed);
      that.currentPos.y += (Math.sin(that.angle) * that.speed);

      if (that.currentPos.y > 525) {
        game.missileExplosions.push(new MissileExplosion(
                                               that.currentPos.x,
                                               that.currentPos.y));
        game.missiles = _.without(game.missiles, that);
        var baseHit = game.closestBase(that.currentPos.x);
        if (baseHit) {
          baseHit.health -= 50;
        } else {
          game.endGame();
        };
      };
    };

    that.isHit = function (explosion) {

      var distance = Math.sqrt(
                     Math.pow(explosion.pos.x - that.currentPos.x, 2) +
                     Math.pow(explosion.pos.y - that.currentPos.y, 2));

      if (distance < explosion.radius) {
        return true;
      } else {
        return false;
      };
    };

  };

  Missile.newRandom = function () {
    var startX = Math.floor(Math.random() * WIDTH);
    var endX = Math.floor(Math.random() * WIDTH);

    var slope = (525 - 0)/(endX - startX);
    if (slope > 0) {
      var angle = Math.atan(slope);
    } else {
      var angle = Math.atan(slope) + Math.PI;
    };

    // angle = (Math.random() * (Math.PI/3)) + (Math.PI/3);

    return new Missile (startX, angle);
  };


  function Base (x) {
    var that = this;

    that.pos = {
      x: x,
      y: 525 };

    that.numCannons = 10;

    that.health = 100;


    that.draw = function (ctx) {
      ctx.fillStyle = "rgb(64, 64, 64)";
      ctx.fillRect (that.pos.x - 20, that.pos.y + 20,
                    40, 40);
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.textAlign = "center";
      if (that.numCannons == 0) {
        ctx.fillText("OUT", that.pos.x, that.pos.y + 33);
      } else {
        ctx.fillText(that.numCannons, that.pos.x, that.pos.y + 33);
        ctx.fillText(that.health + "%", that.pos.x, that.pos.y + 50);
      };
    };

    that.update = function () {
      if (that.health <= 0) {
        that.numCannons = 0;

      }
    };

    that.fireCannon = function(x, y, game) {
      that.numCannons--;
      game.firedCannons.push(new Cannon(that.pos.x, that.pos.y, x, y));
    };

  };

  function Cannon (startX, startY, endX, endY) {
    var that = this;


    that.startPos = {
      x: startX,
      y: startY
    };

    that.currentPos = {
      x: startX,
      y: startY
    };

    that.speed = 8;

    var slope = (endY - startY)/(endX - startX);
    if (slope < 0) {
      that.angle = Math.atan(slope);
    } else {
      that.angle = Math.atan(slope) + Math.PI;
    };

    that.draw = function (ctx) {
      ctx.strokeStyle = "rgb(0, 255, 0)";
      ctx.beginPath();
      ctx.moveTo(that.startPos.x, that.startPos.y);
      ctx.lineTo(that.currentPos.x, that.currentPos.y);
      ctx.stroke();
    };

    that.update = function (game) {
      that.currentPos.x += (Math.cos(that.angle) * that.speed);
      that.currentPos.y += (Math.sin(that.angle) * that.speed);

      var distance = Math.sqrt(
                     Math.pow(that.currentPos.x - endX, 2) +
                     Math.pow(that.currentPos.y - endY, 2));

      if (distance < 10) {
        game.cannonExplosions.push(new CannonExplosion(endX, endY));
        game.firedCannons = _.without(game.firedCannons, that);
      };
    };
  };

  function CannonExplosion (x, y) {
    var that = this;

    that.pos = {
      x: x,
      y: y
    };

    that.radius = 3;
    that.transparency = 1.0;

    that.draw = function (ctx) {
      ctx.fillStyle = "rgba(255,102,0," + that.transparency + ")";
      ctx.beginPath();
      ctx.arc(that.pos.x, that.pos.y, that.radius, 0, 2*Math.PI, true);
      ctx.fill();
    };

    that.update = function (game) {
      that.radius += 1.5;
      that.transparency -= 0.05;
      if (that.radius > CANNON_BLAST_RADIUS) {
        game.cannonExplosions = _.without(game.cannonExplosions, that);
      };
    };

  };

  function MissileExplosion (x, y) {
    var that = this;

    that.pos = {
      x: x,
      y: y
    };

    that.radius = 1;
    that.transparency = 1.0;

    that.draw = function (ctx) {
      ctx.fillStyle = "rgba(255,255,255," + that.transparency + ")";
      ctx.beginPath();
      ctx.arc(that.pos.x, that.pos.y, that.radius, 0, 2*Math.PI, true);
      ctx.fill();
    };

    that.update = function (game) {
      that.radius += 2;
      that.transparency -= 0.1;
      if (that.radius > MISSILE_BLAST_RADIUS) {
        game.missileExplosions = _.without(game.missileExplosions, that);
      };
    };

  };


  function Game (ctx) {
    var that = this;

    that.missiles = [];

    _.times(10, function () {
      that.missiles.push(Missile.newRandom())
    });

    that.bases = [new Base(55),
                  new Base(250),
                  new Base(445)];

    that.firedCannons = [];
    that.cannonExplosions = [];
    that.missileExplosions = [];
    that.score = 0;

    that.setupCanvas = function () {
      var background = new Image();
      background.onload = function () {
        that.background = background;
      }
      background.src = 'missile_command_img.jpg';
    };

    that.drawScore = function () {
      ctx.fillStyle = "rgb(64, 64, 64)";
      ctx.fillRect (WIDTH - 60, 0, 60, 20);
      ctx.fillStyle = "rgb(255,255,255)";
      ctx.textAlign = "left";
      ctx.font = "10pt sans-serif";
      ctx.fillText("Score: " + that.score, WIDTH - 58, 13);
    }


    that.draw = function () {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.drawImage(that.background, 0, 0);


      that.missiles.forEach(function (missile) {
        missile.draw(ctx);
      });

      that.bases.forEach(function (base) {
        base.draw(ctx);
      });

      that.firedCannons.forEach(function (firedCannon) {
        firedCannon.draw(ctx);
      });

      that.cannonExplosions.forEach(function (explosion) {
        explosion.draw(ctx);
      });

      that.missileExplosions.forEach(function (explosion) {
        explosion.draw(ctx);
      });

      that.drawScore();

    };

    that.update = function () {

      that.missiles.forEach(function (missile) {
        missile.update(that);
      });

      that.bases.forEach(function (base) {
        base.update();
      });

      that.firedCannons.forEach(function (firedCannon) {
        firedCannon.update(that);
      });

      that.cannonExplosions.forEach(function (explosion) {
        explosion.update(that);
      });

      that.missileExplosions.forEach(function (explosion) {
        explosion.update(that);
      });
    };

    that.endGame = function() {
      clearInterval(that.timerId);
      alert("Game Over");
    };

    that.isGameOver = function () {
      var over = true;
      that.bases.forEach(function (base) {
        if (base.health > 0) {
          over = false;
        };
      });
      return over;
    };

    that.checkCollision = function() {
      that.cannonExplosions.forEach(function (explosion) {
        that.missiles.forEach(function (missile) {
          if (missile.isHit(explosion)) {
            that.missileExplosions.push(new MissileExplosion(
                                                   missile.currentPos.x,
                                                   missile.currentPos.y));
            that.missiles = _.without(that.missiles, missile);
            that.score += 1;
          };
        });
      });
    };

    that.start = function () {
      that.setupCanvas();
      that.mouseClickHandler();
      that.timerId = setInterval(function () {
        that.update();
        that.draw();
        that.checkCollision();
        if (that.isGameOver()) {
          that.endGame();
        }
      }, 1000/FPS);
    };

    that.closestCannon = function (x) {
      var distance = WIDTH;
      var closest = null;

      that.bases.forEach(function (base) {
        if (base.numCannons > 0) {
          if (Math.abs(base.pos.x - x) < distance) {
            closest = base;
            distance = Math.abs(base.pos.x - x);
          };
        };
      })
      return closest;
    };

    that.closestBase = function (x) {
      var distance = WIDTH;
      var closest = null;

      that.bases.forEach(function (base) {
        if (base.health > 0) {
          if (Math.abs(base.pos.x - x) < distance) {
            closest = base;
            distance = Math.abs(base.pos.x - x);
          };
        };
      })
      return closest;
    };


    that.mouseClickHandler = function () {
      $('canvas').click(function (event) {
        var base = that.closestCannon(event.pageX);
        if (base) {
          base.fireCannon(event.pageX - 13, event.pageY - 13, that);
        };
      });

    };

  };

  return {
    Game: Game
  }


})();


$(function () {
  var canvas = $("<canvas width='"+ WIDTH + "' height='"
              + HEIGHT + "'></canvas>");

  $('body').append(canvas);

  var ctx = canvas.get(0).getContext('2d');
  new MC.Game(ctx).start();

})