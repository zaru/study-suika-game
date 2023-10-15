import Phaser from "phaser";
import { weightedRandomInt } from "./util.ts";

class Scene extends Phaser.Scene {
  #balls: Phaser.Physics.Matter.Image[];
  #line: Phaser.GameObjects.Graphics;
  #maxTypeNum = 11;
  #ballSize = {
    1: 0.08,
    2: 0.13,
    3: 0.2,
    4: 0.28,
    5: 0.36,
    6: 0.44,
    7: 0.56,
    8: 0.63,
    9: 0.73,
    10: 0.8,
    11: 0.9,
  };
  #nextBallType = "ball1";

  constructor() {
    super();
    this.#balls = [];
  }

  preload() {
    this.load.json("ballShape", "assets/ball.json");
    for (let i = 1; i <= this.#maxTypeNum; i++) {
      this.load.image(`ball${i}`, `assets/ball${i}.png`);
    }
    this.load.image("next", "assets/next.png");
  }

  create() {
    this.matter.world.setBounds(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
    );

    this.#line = this.add.graphics({
      lineStyle: { width: 6, color: 0xeeeeee, alpha: 0.5 },
    });

    const nextBg = this.matter.add.image(650, 50, "next");
    nextBg.setScale(0.22);
    nextBg.setStatic(true);
    const nextBall = this.matter.add.image(650, 55, this.#nextBallType);
    nextBall.setScale(0.08);
    nextBall.setStatic(true);

    // マウスの動きに応じて更新
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.drawVerticalLine(pointer.x);
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.createBall(this.#nextBallType, pointer.x, 100);
      this.#nextBallType = `ball${weightedRandomInt()}`;
      nextBall.setTexture(this.#nextBallType);
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
      restitution: 0.15,
      friction: 0.001,
    });
    const ballNum = Number(ballType.replace("ball", ""));
    ball.setScale(this.#ballSize[ballNum]);

    ball.setData("ballType", ballType);
    this.#balls.push(ball);
  }

  private drawVerticalLine(x: number) {
    const segmentLength = 10;
    const gapLength = 5;
    const totalHeight = this.sys.game.config.height as number;

    this.#line.clear();

    for (let y = 0; y < totalHeight; y += segmentLength + gapLength) {
      const startY = y;
      const endY = Phaser.Math.Clamp(y + segmentLength, 0, totalHeight);
      this.#line.lineBetween(x, startY, x, endY);
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 700,
  height: 900,
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
