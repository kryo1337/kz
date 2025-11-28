import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { BaseLevel } from './base_level';
import { Chunk } from './chunk';

export class PlaygroundLevel extends BaseLevel {
  private static readonly BHOP_START_POS = { x: 4, y: 0.5, z: -34 };
  private static readonly BHOP_JUMP_DIST = 8.5;
  private static readonly BHOP_HEIGHT_GAIN = 0.2;
  private static readonly BHOP_LIMIT = 45;
  private static readonly BHOP_BLOCK_COUNT = 49;
  private static readonly BHOP_BLOCK_SIZE: [number, number, number] = [3, 1, 3];
  private static readonly BHOP_BLOCK_COLOR = 0xe0b0ff;

  private static readonly SURF_RAMP_SIZE: [number, number, number] = [10, 1, 30];
  private static readonly SURF_RAMP_COLOR = 0xe0b0ff;
  private static readonly SURF_RAMPS_DATA = [
    { pos: [2, 0, 65], rotZ: Math.PI / 4 },
    { pos: [-2, 0, 100], rotZ: -Math.PI / 4 },
    { pos: [2, 0, 140], rotZ: Math.PI / 4 },
    { pos: [-2, 0, 190], rotZ: -Math.PI / 4 },
    { pos: [2, 0, 250], rotZ: Math.PI / 4 }
  ];

  public load() {
    this.createGround();
    this.createBhopCourse();
    this.createSurfRamps();
  }

  public update() { }

  private createGround() {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    const grid = new THREE.GridHelper(100, 100);
    grid.rotation.x = Math.PI / 2;
    mesh.add(grid);

    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    const collider = this.world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.1, 50), body);

    this.activeChunks.push(new Chunk(mesh, body, collider, this.scene, this.world));
  }

  private createBhopCourse() {
    const start = PlaygroundLevel.BHOP_START_POS;

    this.spawnBlock(
      { x: start.x, y: start.y, z: start.z },
      PlaygroundLevel.BHOP_BLOCK_SIZE,
      PlaygroundLevel.BHOP_BLOCK_COLOR
    );

    let currentPos = new THREE.Vector3(start.x, start.y, start.z);
    let dir = new THREE.Vector3(1, 0, 0);

    for (let i = 0; i < PlaygroundLevel.BHOP_BLOCK_COUNT; i++) {
      currentPos.addScaledVector(dir, PlaygroundLevel.BHOP_JUMP_DIST);
      currentPos.y += PlaygroundLevel.BHOP_HEIGHT_GAIN;

      if (dir.x > 0 && currentPos.x > PlaygroundLevel.BHOP_LIMIT) {
        dir.set(0, 0, 1);
      } else if (dir.z > 0 && currentPos.z > PlaygroundLevel.BHOP_LIMIT) {
        dir.set(-1, 0, 0);
      } else if (dir.x < 0 && currentPos.x < -PlaygroundLevel.BHOP_LIMIT) {
        dir.set(0, 0, -1);
      } else if (dir.z < 0 && currentPos.z < -PlaygroundLevel.BHOP_LIMIT) {
        dir.set(1, 0, 0);
      }

      this.spawnBlock(
        { x: currentPos.x, y: currentPos.y, z: currentPos.z },
        PlaygroundLevel.BHOP_BLOCK_SIZE,
        PlaygroundLevel.BHOP_BLOCK_COLOR
      );
    }
  }

  private createSurfRamps() {
    const size = PlaygroundLevel.SURF_RAMP_SIZE;
    const color = PlaygroundLevel.SURF_RAMP_COLOR;

    PlaygroundLevel.SURF_RAMPS_DATA.forEach(r => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), new THREE.MeshStandardMaterial({ color }));
      mesh.position.set(r.pos[0], r.pos[1], r.pos[2]);
      mesh.rotation.z = r.rotZ;
      this.scene.add(mesh);

      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, r.rotZ));
      const body = this.world.createRigidBody(
        RAPIER.RigidBodyDesc.fixed()
          .setTranslation(r.pos[0], r.pos[1], r.pos[2])
          .setRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
      );
      const collider = this.world.createCollider(RAPIER.ColliderDesc.cuboid(size[0] / 2, size[1] / 2, size[2] / 2), body);

      this.activeChunks.push(new Chunk(mesh, body, collider, this.scene, this.world));
    });
  }
}
