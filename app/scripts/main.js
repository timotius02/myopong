(function(window){

	var y1 = 0, angle;
var myMyo = Myo.create();
myMyo.on('gyroscope', function(data) {
    angle = Math.floor(data.x);
    y1 = Math.floor(data.y);
});

myMyo.on('wave_in', function(edge){
	myo.zeroOrientation();
    y1 = 0;
    myMyo.vibrate();
});

window.onload = function() {

    var game = new Phaser.Game(640, 480, Phaser.AUTO, '', {
        preload: preload,
        create: create,
        update: update
    });

    function preload() {
        //game.add.tileSprite(0, 0, 480, 640, 'background');
        game.load.image('oppo', 'assets/images/opponent.png');
        game.load.image('player', 'assets/images/player.png');
        game.load.image('ball', 'assets/images/ball.png');
        game.load.image('background', 'assets/images/background.jpg');
        var playerBar;
        var computerBar;
        var ball;

        var computerBarSpeed = 190;
        var ballSpeed = 300;
    }

    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);

        //game.add.sprite(0, 0, 'background');
        //game.add.sprite(20, 20, 'rect');
        playerBar = createBar(40, game.world.centerY, 'player');
        computerBar = createBar(600, game.world.centerY, 'oppo');
        ball = createBall(game.world.centerX, game.world.centerY);
        game.physics.enable(ball, Phaser.Physics.ARCADE);
        game.input.onTap.add(releaseBall, this);

    }

    function update() {
        //Control the player's racket
        //playerBar.y = game.input.y;
        playerBar.angle = Math.floor(angle / 6)

        //if( playerBar.y + (y1 * .2) > 480)
        playerBar.y = playerBar.y + (y1 * .2);

        var playerBarHalfHeight = playerBar.height / 2;

        if (playerBar.y < playerBarHalfHeight) {
            playerBar.y = playerBarHalfHeight;
        } else if (playerBar.y > game - playerBarHalfHeight) {
            playerBar.y = game.height - playerBarHalfHeight;
        }
        var computerBarSpeed = 190;
        //Control the computer's racket
        if (computerBar.y - ball.y < -15) {
            computerBar.body.velocity.y = computerBarSpeed;
        } else if (computerBar.y - ball.y > 15) {
            computerBar.body.velocity.y = -computerBarSpeed;
        } else {
            computerBar.body.velocity.y = 0;
        }

        //Check and process the collision ball and racket
        game.physics.arcade.collide(ball, playerBar, ballHitsBar, null, this);
        game.physics.arcade.collide(ball, computerBar, ballHitsBar, null, this);
        checkGoal();

    }

    function createBar(x, y, user) {
        if (user == 'player') {
            var bar = game.add.sprite(x, y, 'player');
        } else {
            var bar = game.add.sprite(x, y, 'oppo');
        }
        game.physics.enable(bar, Phaser.Physics.ARCADE);

        bar.anchor.setTo(0.5, 0.5);
        bar.body.collideWorldBounds = true;
        bar.body.bounce.setTo(1, 1);
        bar.body.immovable = true;

        return bar;

    }

    function createBall(x, y) {
        var ball = game.add.sprite(x, y, 'ball');
        game.physics.enable(ball, Phaser.Physics.ARCADE);

        ball.anchor.setTo(0.5, 0.5);
        ball.body.collideWorldBounds = true;
        ball.body.bounce.setTo(1, 1);
        return ball;

    }

    var ballReleased = false;

    function releaseBall() {
        var ballSpeed = 300;
        if (!ballReleased) {
            ball.body.velocity.y = ballSpeed;
            ball.body.velocity.x = -ballSpeed;
            ballReleased = true;
        }
    }

    function ballHitsBar(_ball, _bar) {
        var diff = 0;

        if (_ball.y < _bar.y) {
            //If ball is in the left hand side on the racket
            diff = _bar.y - _ball.y;
            _ball.body.velocity.y = (-10 * diff);
        } else if (_ball.y > _bar.y) {
            //If ball is in the right hand side on the racket
            diff = _ball.y - _bar.y;
            _ball.body.velocity.y = (10 * diff);
        } else {
            //The ball hit the center of the racket, let's add a little bit of a tragic accident(random) of his movement
            _ball.body.velocity.y = 2 + Math.random() * 8;
        }
    }

    function checkGoal() {
        if (ball.x < 20) {
            setBall();
        } else if (ball.x > 620) {
            setBall();
        }
    }

    function setBall() {
        if (ballReleased) {
            ball.x = game.world.centerX;
            ball.y = game.world.centerY;
            ball.body.velocity.x = 0;
            ball.body.velocity.y = 0;
            ballReleased = false;
        }
    }

};

})(window);