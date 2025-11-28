import { BaseLevel } from './base_level';

export class InfiniteLevel extends BaseLevel {
  private nextBlockZ: number = 0;
  private readonly blockTypes = [
    { type: 'normal', weight: 100, color: 0xe0b0ff }
  ];

  private static readonly GEN_CONFIG = {
    BLOCK_SIZE: [3, 1, 3] as [number, number, number],
    SPACING_BASE: 8.0,
    SPACING_SPEED_FACTOR: 5.0,
    X_SPREAD: 10.0,
    Y_OFFSET: 0
  };

  public load() {
    this.spawnBlock({ x: 0, y: 0, z: 0 }, [10, 1, 10], 0x333333);
    this.nextBlockZ = 12;
  }

  public update(playerZ: number, playerSpeed: number) {
    for (let i = this.activeChunks.length - 1; i >= 0; i--) {
      const chunk = this.activeChunks[i];
      const isStart = Math.abs(chunk.mesh.position.z) < 0.1 && Math.abs(chunk.mesh.position.x) < 0.1;

      if (!isStart && chunk.mesh.position.z < playerZ - 30) {
        this.releaseChunk(chunk);
        this.activeChunks.splice(i, 1);
      }
    }

    let futureBlocks = 0;
    for (const c of this.activeChunks) {
      if (c.mesh.position.z > playerZ) futureBlocks++;
    }

    if (futureBlocks < 3) {
      const spacing = InfiniteLevel.GEN_CONFIG.SPACING_BASE + (playerSpeed / InfiniteLevel.GEN_CONFIG.SPACING_SPEED_FACTOR);

      const type = this.pickBlockType();

      const x = (Math.random() - 0.5) * InfiniteLevel.GEN_CONFIG.X_SPREAD;
      const y = InfiniteLevel.GEN_CONFIG.Y_OFFSET;

      this.spawnBlock(
        { x: x, y: y, z: this.nextBlockZ },
        InfiniteLevel.GEN_CONFIG.BLOCK_SIZE,
        type.color
      );

      this.nextBlockZ += spacing;
    }
  }

  private pickBlockType() {
    const totalWeight = this.blockTypes.reduce((sum, b) => sum + b.weight, 0);
    let random = Math.random() * totalWeight;
    for (const b of this.blockTypes) {
      if (random < b.weight) return b;
      random -= b.weight;
    }
    return this.blockTypes[0];
  }
}
