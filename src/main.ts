// import Phaser from "phaser";
//
// class Scene extends Phaser.Scene {
//   #ground: Phaser.Physics.Arcade.StaticGroup;
//   #balls: Phaser.Physics.Arcade.Group;
//
//   constructor() {
//     super();
//   }
//
//   preload() {
//     this.load.json("ballShape", "assets/ball.json");
//     this.load.image("ball", "assets/ball.png");
//   }
//   create() {
//     this.#balls = this.physics.add.group({
//       bounceX: 0.4,
//       bounceY: 0.4,
//       collideWorldBounds: true,
//     });
//
//     this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
//       this.createBall(pointer.x, pointer.y);
//     });
//   }
//
//   private createBall(x: number, y: number) {
//     const ballShape = this.cache.json.get("ballShape");
//     const ball = this.physics.add.sprite(x, y, "ball");
//     ball.body.setCircle(
//       ballShape.ball.fixtures[0].circle.radius,
//       ballShape.ball.fixtures[0].circle.x,
//       ballShape.ball.fixtures[0].circle.y,
//     );
//     ball.setBounce(0.6);
//     ball.setCollideWorldBounds(true);
//
//     this.#balls.add(ball);
//     this.physics.add.collider(ball, this.#balls);
//   }
// }
//
// const config: Phaser.Types.Core.GameConfig = {
//   type: Phaser.AUTO,
//   width: 800,
//   height: 600,
//   parent: "app",
//   physics: {
//     default: "arcade",
//     arcade: {
//       gravity: { y: 1500 },
//     },
//   },
//   scene: Scene,
// };
//
// new Phaser.Game(config);

import Phaser from "phaser";

class Scene extends Phaser.Scene {
  #balls: Phaser.Physics.Matter.MatterPhysics.Image[];

  constructor() {
    super();
  }

  preload() {
    this.load.json("ballShape", "assets/ball.json");
    this.load.image("ball", "assets/ball.png");
  }

  create() {
    this.matter.world.setBounds(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
    );

    this.#balls = [];

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.createBall(pointer.x, pointer.y);
    });
  }

  private createBall(x: number, y: number) {
    const ballShape = this.cache.json.get("ballShape");
    const ball = this.matter.add.image(x, y, "ball", null, {
      shape: ballShape.ball,
      restitution: 0.6,
      friction: 0.01,
    });

    this.#balls.push(ball);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "app",
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 1.5 },
      debug: false, // これをtrueに設定することでMatterのデバッグレンダリングを有効にできます
    },
  },
  scene: Scene,
};

new Phaser.Game(config);
