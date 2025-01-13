
//https://phaser.io/tutorials/making-your-first-phaser-3-game/part1
//https://github.com/23a-bam/Phaser2ndGame/blob/main/game.js
var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 500,
    parent: game,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}
var game = new Phaser.Game(config);

//Змінні

var player
var enemy
var stars
var bombs
var platforms
var cursors
var fire

var scoreText
var lifeText
var resetButton

var gameOver = false

var life = 5
var score = 0
var playerSpeed = 300
var screenCount = 5
var worldWidth = config.width * screenCount
var enemyCount = 10
var enemyHealthText;
var enemyFireHit = 0

function preload() {
    //Зображення для фону 1920 x 1080
    this.load.image('fon+', 'assets/fon++.png');


    this.load.image('fon1', 'assets/fon1.png');
    this.load.image('ground', 'assets/png/tile/2.png');

    //повітряні платформи
    this.load.image('skyGroundStart', 'assets/png/tile/14.png');
    this.load.image('skyGround', 'assets/png/tile/15.png');
    this.load.image('skyGroundEnd', 'assets/png/tile/16.png');

    //Об'єкти світу
    this.load.image('cactus', 'assets/png/Objects/Cactus(1).png');
    this.load.image('stone', 'assets/png/Objects/Stone.png');
    this.load.image('tree', 'assets/png/Objects/Tree.png');

    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');

    //ворог
    this.load.image('enemy', 'assets/png/Objects/Skeleton.png');

    //постріл
    this.load.image('fire', 'assets/bullet32.png');

    //гравець
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 84, frameHeight: 126 }
    );
}






function create() {

    //Створюємо фон плиткою
    this.add.tileSprite(0, 0, worldWidth, 1080, "fon+")
        .setOrigin(0, 0)
        .setScale(1)
        .setDepth(0)
        .setScrollFactor(0.2);

    //Додаємо платформи
    platforms = this.physics.add.staticGroup();

    //Додаємо землю на всю ширину екрану
    for (var x = 0; x < worldWidth; x = x + 128) {
        //console.log(x)
        platforms
            .create(x, 1080 - 128, 'ground')
            .setOrigin(0, 0)
            .refreshBody();
    }

    //Створюємо гравця
    player = this.physics.add.sprite(800, 800, 'dude');
    player
        .setBounce(0.2)
        .setCollideWorldBounds(true)
        .setDepth(5)

    //Анімація гравця
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });



    // Налаштування камери
    this.cameras.main.setBounds(0, 0, worldWidth, 1080);
    this.physics.world.setBounds(0, 0, worldWidth, 1080);

    // Слідкування камери за гравцем
    this.cameras.main.startFollow(player);

    //Додаємо об'єкти випадковим чином всю ширину екрану
    cactus = this.physics.add.staticGroup();
    createWorldsObjects(cactus, 'cactus')

    //Додаємо об'єкти випадковим чином всю ширину екрану
    stone = this.physics.add.staticGroup();
    createWorldsObjects(stone, 'stone')

    //Додаємо об'єкти випадковим чином всю ширину екрану
    var tree = this.physics.add.staticGroup();
    createWorldsObjects(tree, 'tree')

    //Додаємо об'єкти випадковим чином всю ширину екрану
    //var enemy = this.physics.add.group();
    //createEnemy(enemy, 'enemy')

    //Додавання зірок
    stars = this.physics.add.group({
        key: 'star',
        repeat: worldWidth / 100,
        setXY: { x: 12, y: 0, stepX: 100 }
    });

    stars.children.iterate(function (child) {

        child
            .setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
            .setDepth(11)


    });


    // Генерація бомб
    bombs = this.physics.add.group({
        key: 'bomb',
        repeat: 10,
        setXY: { x: 25, y: 0, stepX: 120 }
    });

    bombs.children.iterate(function (child) {
        child
            .setBounce(Phaser.Math.FloatBetween(0, 1))
            .setCollideWorldBounds(true)
            .setVelocityX(Phaser.Math.FloatBetween(-500, 500))
            .setVelocityY(Phaser.Math.FloatBetween(-500, 500))
    });

    //Додаємо воргів випадковим чином всю ширину ігрового світу по одному на екран 

    enemy = this.physics.add.group({
        key: 'enemy',
        repeat: enemyCount,
        setXY: { x: 1000, y: 1080 - 150, stepX: Phaser.Math.FloatBetween(300, 500) }
    });

    enemy.children.iterate(function (child) {
        child
            .setCollideWorldBounds(true)
            .setVelocityX(Phaser.Math.FloatBetween(-500, 500))
    });


    //Додаємо платформи в повітрі випадковим чином всю ширину екрану    
    //Процес!!!


    for (var x = 0; x < worldWidth; x = x + Phaser.Math.Between(256, 500)) {
        var stepY
        var y = Phaser.Math.Between(128, 800)

        platforms.create(x, y, 'skyGroundStart')
        var i
        for (i = 1; i <= Phaser.Math.Between(1, 5); i++) {
            platforms.create(x + 128 * i, y, 'skyGround')
        }
        platforms.create(x + 128 * i, y, 'skyGroundEnd')
    }



    //Рахунок
    scoreText = this.add.text(50, 50, 'Score: 0', { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0)

    //Кількість ворогів
    enemyText = this.add.text(300, 50, showTextSymbols('👾', enemyCount), { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0)

    //Життя
    lifeText = this.add.text(1500, 50, showTextSymbols('💖', life), { fontSize: '40px', fill: '#FFF' })
        .setOrigin(0, 0)
        .setScrollFactor(0)



    //Кнопка перезапуску гри
    resetButton = this.add.text(400, 450, 'reset', { fontSize: '40px', fill: '#ccc' })
        .setInteractive()
        .setScrollFactor(0)
        .on('pointerdown', function () {
            
            refreshBody()
        });



    // //Додаємо платформи випадковим чином всю ширину екрану    
    // //Не реалізовано!!!
    // var yStart = 93;
    // for (var x = 0; x < worldWidth; x = x + Phaser.Math.Between(400, 500)) {

    //     var yStep = Phaser.Math.Between(-1, 1);
    //     var y = yStart * yStep

    //     platforms.create(x, y, 'skyGroundStart');

    //     var i;
    //     for (i = 1; i < Phaser.Math.Between(0, 5); i++) {
    //         platforms.create(x + 128 * i, y, 'skyGround');
    //     }

    //     platforms.create(x + 128 * i, y, 'skyGroundEnd');
    // }

    //Обробка натискання клавіш
    cursors = this.input.keyboard.createCursorKeys();

    //Колізія гравця та платформ
    this.physics.add.collider(player, platforms);

    //Колізія зірок та платформ
    this.physics.add.collider(stars, platforms);

    //Колізія гравця та зірок
    this.physics.add.collider(player, stars, collectStar, null, this);

    //Колізія бомб та платформ
    this.physics.add.collider(bombs, platforms);

    //Колізія гравця та бомб
    this.physics.add.collider(player, bombs, hitBomb, null, this);

    //Колізія ворогів та платформ
    this.physics.add.collider(enemy, platforms);

    //Колізія ворогів та гравця
    this.physics.add.collider(player, enemy, () => {

        player.x = player.x + Phaser.Math.FloatBetween(-500, 500);

    }, null, this);


    //this.physics.add.collider(enemy, fire, hitEnemyFire, null, this);
}

function update() {
    //Агро радіус !!!

    {
        enemy.children.iterate((child) => {

            if (Math.abs(player.x - child.x) < 500) {
                console.log('Агро радіус' + Math.abs(player.x - child.x))
                let angle = Phaser.Math.Angle.Between(child.x, child.y, player.x, player.y);
                let velocityX = Math.cos(angle) * 100;


                child.setVelocity(velocityX, 0);
                //child.moveTo(player, player.x, player.y, 300, 1)   
            }

        })

    }

    //Зміна напрямку руху ворога
    enemy.children.iterate((child) => {
        if (Math.random() < 0.1) {
            child.setVelocityX(Phaser.Math.FloatBetween(-500, 500))
        }
    })

    //Перезапуск гри при закінченні життів
    if (life == 0) {
        refreshBody();
    }

    //Рух гравця
    if (cursors.left.isDown) {
        // console.log('left')
        player.setVelocityX(-playerSpeed);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        //console.log('right')
        player.setVelocityX(playerSpeed);

        player.anims.play('right', true);
    }
    else if (cursors.down.isDown) {
        player.setVelocityY(500);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    //Пришвидшений рух донизу
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }


    //Постріл 
    if (cursors.space.isDown) {     
        //Створюємо постріл
        fire = this.physics.add.sprite(player.x, player.y, 'fire');        
        fire.setVelocityX(player.body.velocity.x * 5)

        this.physics.add.collider(fire, platforms, (fire) => {
            fire.disableBody(true, true);
        });
    }

    
    bombs.children.iterate((child) => {
        this.physics.add.collider(child,fire, () => {
            child.disableBody(true, true);
            fire.disableBody(true, true);
        });
    })


    //Колізія постріла та ворога 
    enemy.children.iterate((child) => {
        var enemyFireHit = 0
        this.physics.add.collider(child, fire, () => {


            fire.disableBody(true, true);
            enemyFireHit++
            console.log(enemyFireHit)
            if (enemyFireHit == 10) {
                enemyCount -= 1
                enemyText.setText(showTextSymbols('👾', enemyCount))
                child.disableBody(true, true);
            }
        }, null, this);
    })

}


//Генерація об'єктів світу 
function createWorldsObjects(object, picture) {

    //Додаємо об'єкти випадковим чином всю ширину екрану 
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(1000, 1500)) {

        object
            .create(x, 1080 - 128, picture)
            .setOrigin(0, 1)
            .setScale(Phaser.Math.FloatBetween(0.8, 1.5))
            .setDepth(Phaser.Math.Between(1, 10))

    }
}




//Формування смуги символів
function showTextSymbols(symbol, count) {
    var symbolLine = ''

    for (var i = 0; i < count; i++) {
        symbolLine = symbolLine + symbol
    }

    return symbolLine
}





//Відпрацювання колізії гравця та зірок
function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);


    //
    // if (stars.countActive(true) === 0) {
    //     stars.children.iterate(function (child) {

    //         child.enableBody(true, child.x, 0, true, true);

    //     });

    //     var x = (player.x < 800) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    //     var bomb = bombs.create(x, 16, 'bomb');
    //     bomb.setBounce(1);
    //     bomb.setCollideWorldBounds(true);
    //     bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    // }
}


//Відпрацювання колізії гравця та бомб
function hitBomb(player, bomb) {
    //this.physics.pause();
    bomb.disableBody(true, true);

    player.setTint(0xff0000);
    life -= 1
    lifeText.setText(showTextSymbols('💖', life))

    console.log('boom')
    player.anims.play('turn');

    if (life == 0) gameOver = true;
}

//Відпрацювання колізії гравця та сердечка
function hitHeart(player, heart) {
    heart.disableBody(true, true);
    life += 1
    lifeText.setText(showTextSymbols('💖', life))
    if (life > 10) life = 10;
}

//Відпрацювання колізії пострілу та ворога
function hitEnemyFire(enemy, fire) {
    fire.disableBody(true, true);
    enemy.disableBody(true, true);
    enemyCount -= 1
    enemyText.setText(showTextSymbols('👾', enemyCount))
}

//Перезапуск гри
function refreshBody() {
    console.log('game over')
    location.reload()   
};