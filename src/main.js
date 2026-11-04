import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "./style.css";

import * as THREE from "three";

const game = document.querySelector("#game");
const world = document.querySelector("#world");
const loading = document.querySelector("#loading");
const sceneError = document.querySelector("#scene-error");
const startButton = document.querySelector("#start-button");
const viewButton = document.querySelector("#view-button");
const memoryButton = document.querySelector("#memory-button");
const toast = document.querySelector("#toast");
const storyLine = document.querySelector("#story-line");
const questTitle = document.querySelector("#quest-title");
const questCopy = document.querySelector("#quest-copy");
const questChapter = document.querySelector(".quest-chapter");
const questProgress = document.querySelector("#quest-progress");
const progressFill = document.querySelector("#progress-fill");
const progressLabel = document.querySelector("#progress-label");
const locationLabel = document.querySelector("#location-label");
const chapters = [
  {
    x: 0.5,
    z: -27,
    title: "Mảnh ký ức đầu tiên",
    description: "Bức ảnh cũ ở cổng trường gợi lại ngày hai người từng cùng đi dạo.",
    story: "“Hồi ấy, chỉ đi hết một vòng sân trường thôi cũng thấy ngày dài thật đẹp.”",
    location: "CỔNG TRƯỜNG · 17:36",
    progress: 33
  },
  {
    x: -1.8,
    z: -57,
    title: "Qua quảng trường trung tâm",
    description: "Đài phun nước phía trước từng là nơi hai người ngồi chờ hết một cơn mưa.",
    story: "“Em từng nói sau này sẽ quay lại thăm trường. Hóa ra chỉ có anh giữ lời.”",
    location: "QUẢNG TRƯỜNG · 17:49",
    progress: 66
  },
  {
    x: 2.2,
    z: -101,
    title: "Một cuộc gặp gỡ mới",
    description: "Có người đang ngắm sân trường dưới nắng chiều. Anh có muốn bước đến chào cô ấy?",
    story: "“Anh không cần quên em để có thể cho trái tim mình một cơ hội khác.”",
    location: "SÂN TRƯỜNG · 18:02",
    progress: 100
  }
];

const moveState = {
  forward: false,
  back: false,
  left: false,
  right: false,
  sprint: false
};
const keyMap = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "sprint",
  ShiftRight: "sprint"
};
const pressedKeys = new Set();
const touchMoves = new Set();

let renderer;
let camera;
let scene;
let player;
let character;
let leftArm;
let rightArm;
let leftLeg;
let rightLeg;
let coatTail;
let beacon;
let targetIndex = 0;
let cameraOrbit = 0.38;
let dragPointer = null;
let lastPointerX = 0;
let toastTimer;
let memoryOpen = false;
let elapsed = 0;
let previousFrameTime = 0;

function color(value) {
  return new THREE.Color(value);
}

function createMaterial(tint, roughness = 0.8, options = {}) {
  return new THREE.MeshStandardMaterial({ color: tint, roughness, ...options });
}

function createCharacter() {
  const group = new THREE.Group();
  const coat = createMaterial("#343840", 0.9);
  const coatShadow = createMaterial("#20232b", 0.94);
  const trousers = createMaterial("#20232a", 0.94);
  const skin = createMaterial("#ad8069", 0.8);
  const hair = createMaterial("#191a20", 0.92);
  const scarf = createMaterial("#9c775c", 0.9);
  const shoe = createMaterial("#11141b", 0.86);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.37, 0.78, 5, 10), coat);
  torso.position.set(0, 1.25, 0);
  torso.castShadow = true;
  torso.receiveShadow = true;
  group.add(torso);

  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.405, 12, 9), coat);
  shoulder.scale.set(1, 0.62, 0.72);
  shoulder.position.set(0, 1.72, 0);
  shoulder.castShadow = true;
  group.add(shoulder);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.055, 5, 9), scarf);
  collar.position.set(0, 1.82, -0.005);
  collar.rotation.x = Math.PI / 2;
  group.add(collar);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.23, 8), skin);
  neck.position.set(0, 1.94, 0);
  group.add(neck);

  const head = new THREE.Group();
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.245, 12, 10), skin);
  face.scale.set(0.88, 1.12, 0.92);
  face.position.y = 2.16;
  head.add(face);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hair);
  hairCap.position.set(0, 2.22, 0.01);
  head.add(hairCap);

  const fringe = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), hair);
  fringe.scale.set(1.3, 0.5, 0.8);
  fringe.position.set(0.01, 2.32, -0.16);
  head.add(fringe);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 5), skin);
  nose.scale.set(0.8, 0.75, 1);
  nose.position.set(0, 2.14, -0.22);
  head.add(nose);
  group.add(head);

  const earGeometry = new THREE.SphereGeometry(0.055, 7, 6);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(earGeometry, skin);
    ear.position.set(side * 0.21, 2.15, -0.005);
    group.add(ear);
  }

  const lapelGeometry = new THREE.BufferGeometry();
  lapelGeometry.setAttribute("position", new THREE.Float32BufferAttribute([
    -0.16, 1.78, -0.31, -0.03, 1.57, -0.365, -0.01, 1.77, -0.35,
    0.16, 1.78, -0.31, 0.03, 1.57, -0.365, 0.01, 1.77, -0.35
  ], 3));
  lapelGeometry.setIndex([0, 1, 2, 3, 5, 4]);
  lapelGeometry.computeVertexNormals();
  const lapels = new THREE.Mesh(lapelGeometry, coatShadow);
  group.add(lapels);

  leftArm = new THREE.Group();
  rightArm = new THREE.Group();
  for (const [arm, side] of [[leftArm, -1], [rightArm, 1]]) {
    arm.position.set(side * 0.39, 1.66, 0);
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.5, 4, 8), coatShadow);
    sleeve.position.y = -0.33;
    sleeve.rotation.z = side * -0.08;
    sleeve.castShadow = true;
    arm.add(sleeve);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), skin);
    hand.position.set(side * -0.025, -0.68, -0.015);
    arm.add(hand);
    group.add(arm);
  }

  leftLeg = new THREE.Group();
  rightLeg = new THREE.Group();
  for (const [leg, side] of [[leftLeg, -1], [rightLeg, 1]]) {
    leg.position.set(side * 0.2, 0.76, 0);
    const trouser = new THREE.Mesh(new THREE.CapsuleGeometry(0.145, 0.54, 4, 8), trousers);
    trouser.position.y = -0.32;
    trouser.castShadow = true;
    leg.add(trouser);

    const boot = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.15, 0.44), shoe);
    boot.position.set(0, -0.67, -0.105);
    boot.castShadow = true;
    leg.add(boot);
    group.add(leg);
  }

  coatTail = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.49, 0.16), coatShadow);
  coatTail.position.set(0, 0.84, 0.27);
  coatTail.rotation.x = -0.14;
  group.add(coatTail);

  const satchel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.4, 0.14), scarf);
  satchel.position.set(-0.49, 1.17, 0.1);
  satchel.rotation.z = 0.16;
  satchel.castShadow = true;
  group.add(satchel);

  return group;
}

function createEnvironment() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 680),
    createMaterial("#36523b", 0.98)
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -0.2, -230);
  floor.receiveShadow = true;
  scene.add(floor);

  const promenade = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 660),
    createMaterial("#9a7968", 0.86)
  );
  promenade.rotation.x = -Math.PI / 2;
  promenade.position.set(0, -0.13, -225);
  promenade.receiveShadow = true;
  scene.add(promenade);

  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(7.5, 660),
    createMaterial("#c59b7e", 0.79)
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, -0.115, -225);
  path.receiveShadow = true;
  scene.add(path);

  const borderMaterial = createMaterial("#e3c9a0", 0.65);
  const tileGeometry = new THREE.BoxGeometry(7.5, 0.018, 0.075);
  for (let z = 18; z > -540; z -= 3.2) {
    const tile = new THREE.Mesh(tileGeometry, borderMaterial);
    tile.position.set(0, -0.095, z);
    scene.add(tile);
  }

  const curbMaterial = createMaterial("#c2a887", 0.83);
  for (const side of [-1, 1]) {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 660), curbMaterial);
    curb.position.set(side * 6.12, -0.06, -225);
    curb.receiveShadow = true;
    scene.add(curb);
  }

  createCampusSky();
  createCampusBuildings();
  createCampusTrees();
  createCampusFurniture();
  createCampusGateway();
  createCampusImageBoard();
  createSportsCourts();
  createFountain();
  createStreetLights();
  createDestination();
}

function createCampusSky() {
  const gradient = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 skyDirection;
      void main() {
        skyDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 skyDirection;
      void main() {
        float horizon = smoothstep(-0.2, 0.9, skyDirection.y);
        vec3 sunset = vec3(0.69, 0.38, 0.34);
        vec3 peach = vec3(0.94, 0.60, 0.44);
        vec3 upper = vec3(0.39, 0.38, 0.49);
        vec3 color = mix(sunset, peach, smoothstep(-0.12, 0.19, skyDirection.y));
        color = mix(color, upper, smoothstep(0.18, 0.88, skyDirection.y));
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(490, 24, 16), gradient);
  sky.renderOrder = -1;
  scene.add(sky);

  const sunMaterial = new THREE.MeshBasicMaterial({ color: "#ffd39b" });
  const sun = new THREE.Mesh(new THREE.SphereGeometry(5.2, 24, 16), sunMaterial);
  sun.position.set(-54, 35, -135);
  scene.add(sun);

  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(8, 24, 16),
    new THREE.MeshBasicMaterial({ color: "#ffac78", transparent: true, opacity: 0.13 })
  );
  sunHalo.position.copy(sun.position);
  scene.add(sunHalo);
}

function createCampusBuildings() {
  const random = seededRandom(2726);
  const facadeColors = ["#dfcdb1", "#e7d8c1", "#d0bfa5", "#e3d1ba"];
  const trimColors = ["#c96549", "#d77950", "#ad503e", "#c17a58"];
  const buildings = [];
  for (const side of [-1, 1]) {
    for (let index = 0; index < 7; index += 1) {
      const z = -17 - index * 29 - random() * 7;
      const width = 10 + random() * 9;
      const height = 10 + random() * 11;
      const depth = 16 + random() * 12;
      const centerX = side * (15.8 + width / 2 + random() * 4.2);
      const building = {
        x: centerX,
        y: height / 2,
        z,
        width,
        height,
        depth,
        side
      };
      buildings.push(building);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        createMaterial(facadeColors[Math.floor(random() * facadeColors.length)], 0.93)
      );
      mesh.position.set(building.x, building.y, building.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      const roofline = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.55, 0.4, depth + 0.55),
        createMaterial(trimColors[index % trimColors.length], 0.85)
      );
      roofline.position.set(centerX, height + 0.2, z);
      roofline.castShadow = true;
      scene.add(roofline);

      const innerX = centerX - side * (width / 2 + 0.06);
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, height * 0.89, depth * 0.76),
        createMaterial(trimColors[(index + 1) % trimColors.length], 0.81)
      );
      trim.position.set(innerX, height * 0.5, z);
      scene.add(trim);

      const windows = new THREE.Group();
      const windowMaterial = createMaterial("#a6c1bd", 0.31, { metalness: 0.16 });
      const windowFrame = createMaterial("#eee2cf", 0.74);
      const floorCount = Math.max(2, Math.floor(height / 3.4));
      const columnCount = Math.max(3, Math.floor(depth / 2.25));
      for (let floorIndex = 0; floorIndex < floorCount; floorIndex += 1) {
        for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
          const windowZ = z - depth * 0.36 + columnIndex * (depth * 0.72 / (columnCount - 1));
          const windowY = 2.2 + floorIndex * 3.15;
          const windowMesh = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 1.65, 1.05),
            windowMaterial
          );
          windowMesh.position.set(innerX - side * 0.13, windowY, windowZ);
          windows.add(windowMesh);
          const header = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.12, 1.23),
            windowFrame
          );
          header.position.set(innerX - side * 0.2, windowY + 0.9, windowZ);
          windows.add(header);
        }
      }
      scene.add(windows);

      const entrance = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 2.7, 2.4),
        createMaterial("#4d5451", 0.7)
      );
      entrance.position.set(innerX - side * 0.2, 1.35, z + depth * 0.31);
      scene.add(entrance);
    }
  }

  const rearMaterial = createMaterial("#bdac91", 0.96);
  for (let index = 0; index < 16; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const width = 13 + random() * 15;
    const height = 7 + random() * 7;
    const depth = 12 + random() * 17;
    const x = side * (77 + random() * 27);
    const z = -12 - Math.floor(index / 2) * 25 - random() * 11;
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      rearMaterial
    );
    building.position.set(x, height / 2, z);
    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);
  }
}

function createCampusTrees() {
  const random = seededRandom(511);
  const trunks = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.16, 0.24, 2.6, 6),
    createMaterial("#72513b", 0.98),
    70
  );
  const canopies = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    createMaterial("#438451", 0.96),
    70
  );
  const transform = new THREE.Object3D();
  let treeIndex = 0;

  for (let z = 7; z > -215; z -= 7.2) {
    for (const side of [-1, 1]) {
      const x = side * (10.4 + random() * 2.7);
      const treeZ = z - random() * 2.2;
      const height = 4.7 + random() * 1.8;
      transform.position.set(x, 1.2, treeZ);
      transform.scale.set(1, 1, 1);
      transform.updateMatrix();
      trunks.setMatrixAt(treeIndex, transform.matrix);

      transform.position.set(x, height, treeZ);
      transform.scale.set(1.8 + random() * 0.7, 1.75 + random() * 0.8, 1.65 + random() * 0.8);
      transform.rotation.set(random() * 0.3, random() * Math.PI, random() * 0.3);
      transform.updateMatrix();
      canopies.setMatrixAt(treeIndex, transform.matrix);
      treeIndex += 1;
    }
  }

  trunks.count = treeIndex;
  canopies.count = treeIndex;
  trunks.instanceMatrix.needsUpdate = true;
  canopies.instanceMatrix.needsUpdate = true;
  trunks.castShadow = true;
  canopies.castShadow = true;
  scene.add(trunks, canopies);

  const shrubMaterial = createMaterial("#356541", 1);
  for (let z = 5; z > -220; z -= 5.2) {
    for (const side of [-1, 1]) {
      const shrub = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.42, 0),
        shrubMaterial
      );
      shrub.position.set(side * 8.05, 0.32, z);
      shrub.scale.set(1.5, 0.75, 0.8);
      scene.add(shrub);
    }
  }
}

function createCampusFurniture() {
  const poleMaterial = createMaterial("#414540", 0.54, { metalness: 0.38 });
  const lampMaterial = new THREE.MeshStandardMaterial({
    color: "#ffe3a7",
    emissive: "#ffb45c",
    emissiveIntensity: 1.7
  });
  const wood = createMaterial("#81563c", 0.82);
  const metal = createMaterial("#434944", 0.66, { metalness: 0.32 });

  for (let index = 0; index < 16; index += 1) {
    const side = index % 2 === 0 ? -1 : 1;
    const z = 1 - index * 14;
    const x = side * (7.1 + (index % 3) * 0.28);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.09, 4.8, 7),
      poleMaterial
    );
    pole.position.set(x, 2.3, z);
    pole.castShadow = true;
    scene.add(pole);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), lampMaterial);
    bulb.position.set(x, 4.7, z);
    scene.add(bulb);

    if (index % 4 === 0) {
      const lamp = new THREE.PointLight("#ffcc8f", 9, 10, 1.8);
      lamp.position.set(x, 4.4, z);
      scene.add(lamp);
    }

    if (index % 3 === 0) {
      const bench = new THREE.Group();
      bench.position.set(side * 9.4, 0, z - 3.4);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 0.56), wood);
      seat.position.y = 0.65;
      seat.castShadow = true;
      bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.75, 0.13), wood);
      back.position.set(0, 1.05, 0.25);
      bench.add(back);
      for (const legSide of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.7, 0.14), metal);
        leg.position.set(legSide * 0.83, 0.34, 0);
        bench.add(leg);
      }
      scene.add(bench);
    }
  }

  const flagCanvas = document.createElement("canvas");
  flagCanvas.width = 256;
  flagCanvas.height = 160;
  const flagContext = flagCanvas.getContext("2d");
  flagContext.fillStyle = "#d52232";
  flagContext.fillRect(0, 0, 256, 160);
  flagContext.fillStyle = "#ffd44d";
  drawStar(flagContext, 128, 80, 5, 35, 14);
  const flagTexture = new THREE.CanvasTexture(flagCanvas);
  flagTexture.colorSpace = THREE.SRGBColorSpace;
  const flagMaterial = new THREE.MeshStandardMaterial({ map: flagTexture, side: THREE.DoubleSide });

  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.11, 9.4, 8),
      metal
    );
    pole.position.set(side * 2.35, 4.7, -48);
    pole.castShadow = true;
    scene.add(pole);

    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 1.02, 6, 4), flagMaterial);
    flag.position.set(side * 1.5, 8.15, -48);
    flag.rotation.y = side * -0.08;
    scene.add(flag);
  }

}

function drawStar(context, centerX, centerY, points, outerRadius, innerRadius) {
  context.beginPath();
  for (let point = 0; point < points * 2; point += 1) {
    const radius = point % 2 === 0 ? outerRadius : innerRadius;
    const angle = -Math.PI / 2 + point * Math.PI / points;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    if (point === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.closePath();
  context.fill();
}

function createCampusGateway() {
  const stone = createMaterial("#eee0c9", 0.82);
  const accent = createMaterial("#c45e44", 0.81);
  for (const side of [-1, 1]) {
    const column = new THREE.Mesh(new THREE.BoxGeometry(1.15, 5.7, 0.9), stone);
    column.position.set(side * 10.4, 2.85, -12);
    column.castShadow = true;
    scene.add(column);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.42, 1.2), accent);
    cap.position.set(side * 10.4, 5.78, -12);
    scene.add(cap);

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.42, 1.2), accent);
    base.position.set(side * 10.4, 0.32, -12);
    scene.add(base);
  }

  const lintel = new THREE.Mesh(new THREE.BoxGeometry(22.5, 0.95, 1.05), stone);
  lintel.position.set(0, 5.55, -12);
  lintel.castShadow = true;
  scene.add(lintel);

  const sign = new THREE.Mesh(new THREE.BoxGeometry(15.7, 0.68, 0.1), accent);
  sign.position.set(0, 5.58, -11.42);
  scene.add(sign);

  const inscription = createTextTexture("ĐẠI HỌC CÔNG NGHIỆP HÀ NỘI", {
    width: 1024,
    height: 128,
    color: "#fff2dd",
    font: "700 36px Arial"
  });
  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 0.49),
    new THREE.MeshBasicMaterial({ map: inscription, transparent: true })
  );
  title.position.set(0, 5.58, -11.355);
  scene.add(title);

  const flowerBed = createMaterial("#658453", 1);
  for (const side of [-1, 1]) {
    const planter = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.48, 2.3), stone);
    planter.position.set(side * 7.5, 0.2, -18.2);
    scene.add(planter);

    const planting = new THREE.Mesh(new THREE.BoxGeometry(4.85, 0.3, 1.85), flowerBed);
    planting.position.set(side * 7.5, 0.56, -18.2);
    scene.add(planting);
  }
}

function createTextTexture(text, options = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = options.width ?? 1024;
  canvas.height = options.height ?? 128;
  const context = canvas.getContext("2d");
  context.fillStyle = options.background ?? "rgba(255,255,255,0)";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = options.color ?? "#fff";
  context.font = options.font ?? "700 44px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createCampusImageBoard() {
  const frameMaterial = createMaterial("#714c37", 0.74);
  const board = new THREE.Group();
  board.position.set(-5.3, 0, -14.1);
  board.rotation.y = 0.32;

  const frame = new THREE.Mesh(new THREE.BoxGeometry(4.35, 2.84, 0.22), frameMaterial);
  frame.position.y = 2.72;
  frame.castShadow = true;
  board.add(frame);

  const title = new THREE.Mesh(
    new THREE.PlaneGeometry(3.9, 0.31),
    new THREE.MeshBasicMaterial({
      map: createTextTexture("KHUÔN VIÊN HAUI · HÀ NỘI", {
        width: 1024,
        height: 100,
        color: "#fff0d5",
        font: "700 42px Arial"
      }),
      transparent: true
    })
  );
  title.position.set(0, 3.83, 0.125);
  board.add(title);

  const photoMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.72,
    side: THREE.DoubleSide
  });
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(3.88, 2.17), photoMaterial);
  photo.position.set(0, 2.57, 0.13);
  board.add(photo);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    "/assets/haui-campus.jpg",
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
      photoMaterial.map = texture;
      photoMaterial.needsUpdate = true;
    },
    undefined,
    (error) => {
      console.error("Không thể tải ảnh khuôn viên do người dùng cung cấp:", error);
      showToast("Không tải được ảnh khuôn viên. Kiểm tra thư mục public/assets.");
    }
  );

  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.1, 0.18), frameMaterial);
    leg.position.set(side * 1.7, 0.92, 0);
    board.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.12, 0.48), frameMaterial);
    foot.position.set(side * 1.7, 0.08, 0.08);
    board.add(foot);
  }
  scene.add(board);
}

function createFountain() {
  const stone = createMaterial("#ded1b9", 0.68);
  const water = new THREE.MeshStandardMaterial({
    color: "#93bdc1",
    emissive: "#456c73",
    emissiveIntensity: 0.2,
    metalness: 0.38,
    roughness: 0.19
  });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.4, 0.44, 16), stone);
  base.position.set(0, 0.12, -60);
  scene.add(base);

  const basin = new THREE.Mesh(new THREE.CylinderGeometry(2.85, 2.7, 0.27, 16, 1, true), stone);
  basin.position.set(0, 0.46, -60);
  scene.add(basin);

  const pool = new THREE.Mesh(new THREE.CircleGeometry(2.75, 20), water);
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(0, 0.53, -60);
  scene.add(pool);

  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.58, 1.65, 8), stone);
  pedestal.position.set(0, 1.23, -60);
  scene.add(pedestal);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.74, 16, 12),
    createMaterial("#d6aa73", 0.52, { metalness: 0.18 })
  );
  orb.position.set(0, 2.42, -60);
  scene.add(orb);
}

function createSportsCourts() {
  const courtMaterial = createMaterial("#56845b", 0.93);
  const lineMaterial = createMaterial("#ede5cb", 0.76);
  const poleMaterial = createMaterial("#55534a", 0.65);
  for (const side of [-1, 1]) {
    const centerX = side * 44;
    const centerZ = -85;
    const court = new THREE.Mesh(new THREE.PlaneGeometry(23, 34), courtMaterial);
    court.rotation.x = -Math.PI / 2;
    court.position.set(centerX, -0.15, centerZ);
    scene.add(court);

    for (const xOffset of [-10.8, 0, 10.8]) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.035, 33.6), lineMaterial);
      line.position.set(centerX + xOffset, -0.13, centerZ);
      scene.add(line);
    }
    for (const zOffset of [-16.7, 0, 16.7]) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(22, 0.035, 0.075), lineMaterial);
      line.position.set(centerX, -0.13, centerZ + zOffset);
      scene.add(line);
    }
    for (const zOffset of [-18, 18]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 4.2, 7), poleMaterial);
      post.position.set(centerX, 2, centerZ + zOffset);
      scene.add(post);
    }
  }
}

function createStreetLights() {
  const poleMaterial = createMaterial("#51544c", 0.6, { metalness: 0.34 });
  const bulbMaterial = new THREE.MeshStandardMaterial({
    color: "#ffdfaa",
    emissive: "#ffb65f",
    emissiveIntensity: 1.9
  });

  for (let i = 0; i < 16; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 1 - Math.floor(i / 2) * 17;
    const x = side * (7.35 + (i % 3) * 0.25);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.095, 4.7, 7),
      poleMaterial
    );
    pole.position.set(x, 2.3, z);
    pole.castShadow = true;
    scene.add(pole);

    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.075, 0.075), poleMaterial);
    arm.position.set(x - side * 0.3, 4.58, z);
    scene.add(arm);

    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), bulbMaterial);
    bulb.position.set(x - side * 0.64, 4.47, z);
    scene.add(bulb);

    if (i % 4 === 0) {
      const lamp = new THREE.PointLight("#ffd19a", 7, 12, 1.8);
      lamp.position.set(x - side * 0.5, 4.3, z);
      scene.add(lamp);
    }
  }
}

function createDestination() {
  const light = new THREE.PointLight("#ffd6a2", 9, 15, 1.5);
  light.position.set(chapters[2].x, 3.1, chapters[2].z);
  scene.add(light);

  const woman = new THREE.Group();
  woman.position.set(chapters[2].x, 0, chapters[2].z - 1.2);
  woman.rotation.y = 0.22;
  const coat = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.34, 0.82, 5, 10),
    createMaterial("#84654f", 0.94)
  );
  coat.position.y = 1.02;
  coat.castShadow = true;
  woman.add(coat);

  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.48, 0.82, 9),
    createMaterial("#51434a", 0.96)
  );
  skirt.position.y = 0.5;
  woman.add(skirt);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 12, 10),
    createMaterial("#c59072", 0.84)
  );
  head.position.y = 1.89;
  woman.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.235, 12, 8),
    createMaterial("#332322", 0.9)
  );
  hair.position.set(0, 1.99, 0.085);
  hair.scale.set(1.05, 1.28, 1.05);
  woman.add(hair);

  scene.add(woman);

  beacon = new THREE.Group();
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: "#edc18b",
    emissive: "#c98c51",
    emissiveIntensity: 1.8,
    metalness: 0.52,
    roughness: 0.28
  });
  const floorRing = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.045, 8, 48), ringMaterial);
  floorRing.rotation.x = Math.PI / 2;
  floorRing.position.y = 0.12;
  beacon.add(floorRing);

  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.35, 3.8, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: "#f4bf83",
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  beam.position.y = 1.93;
  beacon.add(beam);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 12, 8),
    new THREE.MeshBasicMaterial({ color: "#ffe0aa" })
  );
  orb.position.y = 3.9;
  beacon.add(orb);
  beacon.position.set(chapters[0].x, 0, chapters[0].z);
  scene.add(beacon);
}

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createScene() {
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (error) {
    loading.hidden = true;
    sceneError.hidden = false;
    sceneError.textContent = "Trình duyệt không khởi tạo được WebGL. Hãy bật tăng tốc phần cứng hoặc mở trang bằng Chrome/Edge mới nhất.";
    console.error("Không thể khởi tạo cảnh 3D WebGL:", error);
    return false;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(world.clientWidth, world.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.tabIndex = -1;
  world.prepend(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = color("#dc9c80");
  scene.fog = new THREE.FogExp2("#d99b80", 0.0032);

  camera = new THREE.PerspectiveCamera(54, world.clientWidth / world.clientHeight, 0.1, 500);
  camera.position.set(5, 4, 8);

  scene.add(new THREE.HemisphereLight("#ffe6c9", "#53684a", 2.2));

  const sunlight = new THREE.DirectionalLight("#ffd29a", 3.1);
  sunlight.position.set(-42, 38, -75);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);
  sunlight.shadow.camera.left = -30;
  sunlight.shadow.camera.right = 30;
  sunlight.shadow.camera.top = 32;
  sunlight.shadow.camera.bottom = -32;
  sunlight.shadow.camera.near = 1;
  sunlight.shadow.camera.far = 115;
  sunlight.shadow.bias = -0.0007;
  scene.add(sunlight);

  player = new THREE.Group();
  player.position.set(0, 0, 0);
  character = createCharacter();
  player.add(character);
  scene.add(player);

  const characterLight = new THREE.PointLight("#ffe0b0", 1.3, 7, 2);
  characterLight.position.set(-1.7, 2.7, 2);
  player.add(characterLight);

  createEnvironment();
  resize();
  loading.hidden = true;
  animate();
  return true;
}

function updateInput() {
  for (const action of Object.keys(moveState)) {
    moveState[action] = false;
  }
  for (const code of pressedKeys) {
    const action = keyMap[code];
    if (action) moveState[action] = true;
  }
  for (const action of touchMoves) moveState[action] = true;
}

function handleKeyDown(event) {
  if (event.code === "Escape" && game.classList.contains("ui-hidden")) {
    setUiVisible(true);
    return;
  }
  if (!(event.code in keyMap)) return;
  event.preventDefault();
  pressedKeys.add(event.code);
  updateInput();
}

function handleKeyUp(event) {
  if (!(event.code in keyMap)) return;
  pressedKeys.delete(event.code);
  updateInput();
}

function beginJourney() {
  if (game.classList.contains("is-playing")) return;
  game.classList.add("is-playing");
  startButton.setAttribute("aria-label", "Đang trong hành trình");
  showToast("WASD / phím mũi tên để đi. Kéo chuột để nhìn quanh.");
}

function setUiVisible(visible) {
  game.classList.toggle("ui-hidden", !visible);
  viewButton.setAttribute("aria-label", visible ? "Ẩn giao diện" : "Hiện giao diện");
  viewButton.title = visible ? "Ẩn giao diện" : "Hiện giao diện";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 3300);
}

function advanceChapter() {
  const chapter = chapters[targetIndex];
  if (!chapter || Math.hypot(player.position.x - chapter.x, player.position.z - chapter.z) > 2.8) return;

  storyLine.textContent = chapter.story;
  questTitle.textContent = chapter.title;
  questCopy.textContent = chapter.description;
  locationLabel.textContent = chapter.location;
  progressFill.style.width = `${chapter.progress}%`;
  progressLabel.textContent = `${chapter.progress}%`;
  questProgress.setAttribute("aria-valuenow", String(chapter.progress));

  targetIndex += 1;
  questChapter.textContent = `${String(Math.min(targetIndex + 1, chapters.length)).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
  if (targetIndex < chapters.length) {
    beacon.position.set(chapters[targetIndex].x, 0, chapters[targetIndex].z);
    showToast(targetIndex === 2 ? "Một người bạn mới đang đợi cạnh đài phun nước." : "Một ký ức khác hiện lên giữa sân trường.");
  } else {
    beacon.visible = false;
    showToast("Anh đã đến nơi. Đôi khi, bắt đầu lại chỉ cần một lời chào.");
  }
}

function updatePlayer(delta) {
  const forward = Number(moveState.forward) - Number(moveState.back);
  const sideways = Number(moveState.right) - Number(moveState.left);
  const moving = forward !== 0 || sideways !== 0;
  const input = new THREE.Vector2(sideways, forward);
  if (input.lengthSq() > 1) input.normalize();

  if (moving) {
    const speed = moveState.sprint ? 8.1 : 4.6;
    const forwardX = Math.sin(player.rotation.y);
    const forwardZ = -Math.cos(player.rotation.y);
    const rightX = Math.cos(player.rotation.y);
    const rightZ = Math.sin(player.rotation.y);
    const directionX = forwardX * input.y + rightX * input.x;
    const directionZ = forwardZ * input.y + rightZ * input.x;

    player.position.x += directionX * speed * delta;
    player.position.z += directionZ * speed * delta;
    player.position.x = THREE.MathUtils.clamp(player.position.x, -6.1, 6.1);
    player.position.z = Math.min(20, player.position.z);
    player.rotation.y = Math.atan2(directionX, -directionZ);
  }

  const walkCycle = moving ? elapsed * (moveState.sprint ? 12 : 8) : elapsed * 1.5;
  const step = moving ? Math.sin(walkCycle) : 0;
  leftArm.rotation.x = step * (moving ? 0.43 : 0.035);
  rightArm.rotation.x = -step * (moving ? 0.43 : 0.035);
  leftLeg.rotation.x = -step * (moving ? 0.42 : 0);
  rightLeg.rotation.x = step * (moving ? 0.42 : 0);
  character.position.y = moving ? Math.abs(Math.cos(walkCycle * 2)) * 0.035 : Math.sin(elapsed * 1.2) * 0.009;
  character.rotation.z = moving ? -input.x * 0.035 : 0;
  coatTail.rotation.x = -0.14 - step * (moving ? 0.035 : 0.008);
  if (moving) beginJourney();

  if (targetIndex < chapters.length) advanceChapter();
}

function updateCamera(delta) {
  const yaw = player.rotation.y + cameraOrbit;
  const runFov = moveState.sprint ? 57 : 54;
  camera.fov = THREE.MathUtils.damp(camera.fov, runFov, 2, delta);
  camera.updateProjectionMatrix();

  const desired = new THREE.Vector3(
    player.position.x + Math.sin(yaw) * 7.7,
    3.65,
    player.position.z + Math.cos(yaw) * 7.7
  );
  camera.position.lerp(desired, 1 - Math.exp(-4.4 * delta));

  const look = new THREE.Vector3(
    player.position.x - Math.sin(player.rotation.y) * 3.6,
    1.38,
    player.position.z - Math.cos(player.rotation.y) * 3.6
  );
  camera.lookAt(look);
}

function animate() {
  renderer.setAnimationLoop((time) => {
    const delta = Math.min(0.05, previousFrameTime ? (time - previousFrameTime) / 1000 : 0.016);
    previousFrameTime = time;
    elapsed += delta;
    updatePlayer(delta);
    updateCamera(delta);
    if (beacon.visible) {
      beacon.children[0].rotation.z = elapsed * 0.34;
      beacon.children[2].position.y = 3.9 + Math.sin(elapsed * 2) * 0.16;
    }
    renderer.render(scene, camera);
  });
}

function resize() {
  if (!renderer || !camera) return;
  const width = world.clientWidth;
  const height = world.clientHeight;
  if (!width || !height) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function bindControls() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", () => {
    pressedKeys.clear();
    touchMoves.clear();
    updateInput();
  });
  window.addEventListener("resize", resize);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(world);

  world.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".hud-layer, .topbar")) return;
    dragPointer = event.pointerId;
    lastPointerX = event.clientX;
    world.setPointerCapture(event.pointerId);
  });
  world.addEventListener("pointermove", (event) => {
    if (dragPointer !== event.pointerId) return;
    const distance = event.clientX - lastPointerX;
    lastPointerX = event.clientX;
    cameraOrbit = THREE.MathUtils.clamp(cameraOrbit - distance * 0.003, -1.05, 1.05);
  });
  world.addEventListener("pointerup", (event) => {
    if (dragPointer === event.pointerId) dragPointer = null;
  });
  world.addEventListener("pointercancel", () => { dragPointer = null; });

  document.querySelectorAll("[data-move]").forEach((button) => {
    const action = button.dataset.move;
    const activate = (event) => {
      event.preventDefault();
      touchMoves.add(action);
      updateInput();
      beginJourney();
      button.classList.add("is-down");
      button.setPointerCapture(event.pointerId);
    };
    const release = () => {
      touchMoves.delete(action);
      updateInput();
      button.classList.remove("is-down");
    };
    button.addEventListener("pointerdown", activate);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  });

  startButton.addEventListener("click", beginJourney);
  viewButton.addEventListener("click", () => setUiVisible(game.classList.contains("ui-hidden")));

  memoryButton.addEventListener("click", () => {
    memoryOpen = !memoryOpen;
    memoryButton.setAttribute("aria-pressed", String(memoryOpen));
    storyLine.textContent = memoryOpen
      ? "“Nếu một ngày quay lại trường, nhớ kể em nghe xem hàng cây cũ đã cao thêm bao nhiêu.”"
      : "“Bao năm rồi mà hàng cây này vẫn vậy. Chỉ có người từng đi cùng anh là không còn ở đây.”";
    showToast(memoryOpen ? "Lời nhắn cũ · Ngày tựu trường" : "Lời tự sự của Minh");
  });
}

bindControls();
if (createScene()) {
  window.addEventListener("beforeunload", () => {
    renderer.setAnimationLoop(null);
  }, { once: true });
}
