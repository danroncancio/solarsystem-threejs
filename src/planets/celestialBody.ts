import * as THREE from "three";

class CelestialBody extends THREE.Mesh {
  name: string;
  mass: number;
  radius: number;
  initialVelocity: THREE.Vector3;
  currentVelocity: THREE.Vector3;

  constructor(
    name: string,
    surfaceGravity: number,
    radius = 0,
    initialVelocity = new THREE.Vector3()
  ) {
    super();
    this.name = name;
    this.mass = (surfaceGravity * radius * radius) / 0.01;
    this.radius = radius;
    this.initialVelocity = initialVelocity;
    this.currentVelocity = this.initialVelocity;
  }

  updateVelocity(allBodies: CelestialBody[], timeStep: number) {
    let sunMag: number, redMag: number;
    allBodies.forEach((otherBody) => {
      if (otherBody != this) {
        let sqrDst = otherBody.position.distanceToSquared(this.position);

        let forceDir = new THREE.Vector3(
          otherBody.position.x - this.position.x,
          otherBody.position.y - this.position.y,
          otherBody.position.z - this.position.z
        ).normalize();
        let acceleration = forceDir.multiplyScalar(
          (0.0001 * otherBody.mass) / sqrDst
        );
        this.currentVelocity.x += acceleration.x * timeStep;
        this.currentVelocity.y += acceleration.y * timeStep;
        this.currentVelocity.z += acceleration.z * timeStep;
        if (otherBody.name === "sun" && this.name === "moon") {
          sunMag = Math.sqrt(
            acceleration.x * acceleration.x + acceleration.y * acceleration.y
          );
        }
        if (otherBody.name === "redGiant" && this.name === "moon") {
          redMag = Math.sqrt(
            acceleration.x * acceleration.x + acceleration.y * acceleration.y
          );
        }
        if (redMag && sunMag) {
          if (redMag > sunMag) {
            console.log("redGiant");
          } else {
            console.log("sun");
          }
        }
      }
    });
  }

  updatePosition(timeStep: number) {
    if (this.name !== "sun") {
      let currentVelocityCopy = new THREE.Vector3().copy(this.currentVelocity);
      this.position.add(currentVelocityCopy.multiplyScalar(timeStep));
    }
  }
}

export default CelestialBody;
