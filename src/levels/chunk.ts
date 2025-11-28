import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export class Chunk {
  public mesh: THREE.Mesh;
  public body: RAPIER.RigidBody;
  public collider: RAPIER.Collider;
  private scene: THREE.Scene;
  private world: RAPIER.World;
  private currentSize: [number, number, number] | null = null;

  constructor(
    mesh: THREE.Mesh,
    body: RAPIER.RigidBody,
    collider: RAPIER.Collider,
    scene: THREE.Scene,
    world: RAPIER.World
  ) {
    this.mesh = mesh;
    this.body = body;
    this.collider = collider;
    this.scene = scene;
    this.world = world;
  }

  public activate(pos: { x: number, y: number, z: number }, size: [number, number, number], color: number) {
    this.mesh.position.set(pos.x, pos.y, pos.z);
    this.mesh.scale.set(size[0], size[1], size[2]);
    (this.mesh.material as THREE.MeshStandardMaterial).color.setHex(color);
    this.mesh.visible = true;
    this.scene.add(this.mesh);

    this.body.setTranslation(pos, true);
    this.body.setEnabled(true);

    if (
      !this.currentSize ||
      this.currentSize[0] !== size[0] ||
      this.currentSize[1] !== size[1] ||
      this.currentSize[2] !== size[2]
    ) {
      this.collider.setShape(new RAPIER.Cuboid(size[0] / 2, size[1] / 2, size[2] / 2));
      this.currentSize = [size[0], size[1], size[2]];
    }
  }

  public deactivate() {
    this.body.setEnabled(false);
    this.mesh.visible = false;
    this.scene.remove(this.mesh);
  }

  public destroy() {
    this.deactivate();
    this.world.removeRigidBody(this.body);

    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach(m => m.dispose());
    } else if (this.mesh.material) {
      this.mesh.material.dispose();
    }
  }
}



