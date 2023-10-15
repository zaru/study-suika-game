import Phaser from "phaser";

class Scene extends Phaser.Scene {
  #balls: Phaser.Physics.Matter.MatterPhysics.Image[];

  constructor() {
    super();
  }

  preload() {
    this.load.json("ballShape", "assets/ball.json");
    this.load.image("ball1", "assets/ball1.png");
    this.load.image("ball2", "assets/ball2.png");
    this.load.image("ball3", "assets/ball3.png");
    this.load.image("ball4", "assets/ball4.png");
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
      this.createBall("ball1", pointer.x, pointer.y);
    });

    this.matter.world.on(
      "collisionstart",
      (
        _: MatterJS.IEventCollision<MatterJS.Engine>,
        ballA: MatterJS.BodyType,
        ballB: MatterJS.BodyType,
      ) => {
        if (
          this.#balls.includes(ballA.parent.gameObject) &&
          this.#balls.includes(ballB.parent.gameObject) &&
          ballA.parent.gameObject.getData("ballType") ===
            ballB.parent.gameObject.getData("ballType")
        ) {
          const x = ballA.position.x;
          const y = ballA.position.y;
          const ballNum = Number(
            ballA.parent.gameObject.getData("ballType").replace("ball", ""),
          );
          if (ballNum < 5) {
            ballA.parent.gameObject.destroy();
            ballB.parent.gameObject.destroy();
            this.createBall(`ball${ballNum + 1}`, x, y);
          }
        }
      },
    );
  }

  private createBall(ballType: string, x: number, y: number) {
    const ballShape = this.cache.json.get("ballShape");
    const ball = this.matter.add.image(x, y, ballType, undefined, {
      shape: ballShape[ballType],
      restitution: 0.6,
      friction: 0.01,
    });
    ball.setData("ballType", ballType);
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
