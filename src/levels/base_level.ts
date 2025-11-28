import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { Chunk } from './chunk';

const SHARED_BOX_GEOMETRY = new THREE.BoxGeometry(1, 1, 1);

export abstract class BaseLevel {
  protected scene: THREE.Scene;
  protected world: RAPIER.World;
  protected activeChunks: Chunk[] = [];
  protected inactiveChunks: Chunk[] = [];

  constructor(scene: THREE.Scene, world: RAPIER.World) {
    this.scene = scene;
    this.world = world;
  }

  public abstract load(): void;
  public abstract update(playerZ: number, playerSpeed: number): void;

  public dispose() {
    this.activeChunks.forEach(chunk => this.releaseChunk(chunk));
    this.activeChunks = [];

    this.inactiveChunks.forEach(chunk => chunk.destroy());
    this.inactiveChunks = [];
  }

  protected spawnBlock(pos: { x: number, y: number, z: number }, size: [number, number, number], color: number): Chunk {
    let chunk: Chunk | undefined = this.inactiveChunks.pop();

    if (!chunk) {
      const material = new THREE.MeshStandardMaterial();
      const mesh = new THREE.Mesh(SHARED_BOX_GEOMETRY, material);

      const bodyDesc = RAPIER.RigidBodyDesc.fixed();
      const body = this.world.createRigidBody(bodyDesc);
      const colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
      const collider = this.world.createCollider(colliderDesc, body);

      chunk = new Chunk(mesh, body, collider, this.scene, this.world);
    }

    chunk.activate(pos, size, color);
    this.activeChunks.push(chunk);
    return chunk;
  }

  protected releaseChunk(chunk: Chunk) {
    chunk.deactivate();
    this.inactiveChunks.push(chunk);
  }
}
