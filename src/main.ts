import Phaser from "phaser";
import { weightedRandomInt } from "./util.ts";

class Scene extends Phaser.Scene {
  #balls: Phaser.Physics.Matter.Image[];
  #line: Phaser.GameObjects.Graphics;
  #maxTypeNum = 11;
  #ballSize = {
    1: 0.08,
    2: 0.115,
    3: 0.135,
    4: 0.195,
    5: 0.265,
    6: 0.3,
    7: 0.5,
    8: 0.6,
    9: 0.7,
    10: 0.8,
    11: 0.9,
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

    this.#line = this.add.graphics({
      lineStyle: { width: 6, color: 0xeeeeee, alpha: 0.5 },
    });

    // マウスの動きに応じて更新
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.drawVerticalLine(pointer.x);
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const ballType = `ball${weightedRandomInt()}`;
      this.createBall(ballType, pointer.x, 100);
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
