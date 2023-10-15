import Phaser from "phaser";

class Scene extends Phaser.Scene {
  #balls: Phaser.Physics.Matter.Image[];
  #maxTypeNum = 11;
  #ballSize = {
    1: 0.1,
    2: 0.115,
    3: 0.135,
    4: 0.155,
    5: 0.225,
    6: 0.3,
    7: 0.4,
    8: 0.5,
    9: 0.6,
    10: 0.7,
    11: 0.8,
  };

  constructor() {
    super();
    this.#balls = [];
  }

  preload() {
    this.load.json("ballShape", "assets/ball.json");
    for (let i = 1; i <= this.#maxTypeNum; i++) {
      this.load.image(`ball${i}`, `assets/ball${i}.png`);
    }
  }

  create() {
    this.matter.world.setBounds(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
    );

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const ballType = `ball${Math.floor(Math.random() * 5) + 1}`;
      this.createBall(ballType, pointer.x, pointer.y);
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
          if (ballNum < this.#maxTypeNum) {
            ballA.parent.gameObject.destroy();
            ballB.parent.gameObject.destroy();
            this.createBall(`ball${ballNum + 1}`, x, y);
          } else if (ballNum === this.#maxTypeNum) {
            ballA.parent.gameObject.destroy();
            ballB.parent.gameObject.destroy();
          }
        }
      },
    );
  }

  private createBall(ballType: string, x: number, y: number) {
    const ballShape = this.cache.json.get("ballShape");
    const ball = this.matter.add.image(x, y, ballType, undefined, {
      shape: ballShape[ballType],
      restitution: 0.5,
      friction: 0.01,
    });
    const ballNum = Number(ballType.replace("ball", ""));
    ball.setScale(this.#ballSize[ballNum]);

    ball.setData("ballType", ballType);
    this.#balls.push(ball);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 1200,
  parent: "app",
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 1.5 },
      debug: false,
    },
  },
  scene: Scene,
};

new Phaser.Game(config);
