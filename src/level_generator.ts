import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

interface Block {
  pos: [number, number, number];
  size: [number, number, number];
  color: number;
}

export class LevelGenerator {
  private scene: THREE.Scene;
  private world: RAPIER.World;

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

  constructor(scene: THREE.Scene, world: RAPIER.World) {
    this.scene = scene;
    this.world = world;
  }

  public createGround() {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    this.scene.add(new THREE.GridHelper(100, 100));

    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(50, 0.1, 50), body);
  }

  public createBhopCourse() {
    const blocks: Block[] = [];
    const start = LevelGenerator.BHOP_START_POS;

    blocks.push({
      pos: [start.x, start.y, start.z],
      size: LevelGenerator.BHOP_BLOCK_SIZE,
      color: LevelGenerator.BHOP_BLOCK_COLOR
    });

    let currentPos = new THREE.Vector3(start.x, start.y, start.z);
    let dir = new THREE.Vector3(1, 0, 0);

    for (let i = 0; i < LevelGenerator.BHOP_BLOCK_COUNT; i++) {
      currentPos.addScaledVector(dir, LevelGenerator.BHOP_JUMP_DIST);
      currentPos.y += LevelGenerator.BHOP_HEIGHT_GAIN;

      if (dir.x > 0 && currentPos.x > LevelGenerator.BHOP_LIMIT) {
        dir.set(0, 0, 1);
      } else if (dir.z > 0 && currentPos.z > LevelGenerator.BHOP_LIMIT) {
        dir.set(-1, 0, 0);
      } else if (dir.x < 0 && currentPos.x < -LevelGenerator.BHOP_LIMIT) {
        dir.set(0, 0, -1);
      } else if (dir.z < 0 && currentPos.z < -LevelGenerator.BHOP_LIMIT) {
        dir.set(1, 0, 0);
      }

      blocks.push({
        pos: [currentPos.x, currentPos.y, currentPos.z],
        size: LevelGenerator.BHOP_BLOCK_SIZE,
        color: LevelGenerator.BHOP_BLOCK_COLOR
      });
    }

    this.createInstancedBlocks(blocks);
  }

  private createInstancedBlocks(blocks: Block[]) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, blocks.length);

    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const rotation = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    const color = new THREE.Color();

    blocks.forEach((b, i) => {
      position.set(...b.pos);
      scale.set(...b.size);
      matrix.compose(position, rotation, scale);
      instancedMesh.setMatrixAt(i, matrix);

      color.setHex(b.color);
      instancedMesh.setColorAt(i, color);

      const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(...b.pos));
      this.world.createCollider(RAPIER.ColliderDesc.cuboid(b.size[0] / 2, b.size[1] / 2, b.size[2] / 2), body);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    this.scene.add(instancedMesh);
  }

  public createSurfRamps() {
    const size = LevelGenerator.SURF_RAMP_SIZE;
    const color = LevelGenerator.SURF_RAMP_COLOR;

    LevelGenerator.SURF_RAMPS_DATA.forEach(r => {
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
      this.world.createCollider(RAPIER.ColliderDesc.cuboid(size[0] / 2, size[1] / 2, size[2] / 2), body);
    });
  }
}
