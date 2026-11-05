import * as THREE from "three";
import { createClient } from "@supabase/supabase-js";
import "./office.css";

const teams = [
  { id: "marketing", floor: 1, title: "Phòng Marketing", short: "Marketing" },
  { id: "training", floor: 2, title: "Xưởng Đào tạo", short: "Đào tạo" },
  { id: "brand", floor: 3, title: "Khu Thương hiệu", short: "Thương hiệu" }
];

const agents = [
  { id: "coordinator", name: "Giám đốc", role: "Điều phối · Tầng 1", team: "marketing", state: "working", color: "#3787db", job: "Theo dõi tiến độ và giao việc đúng thứ tự", description: "Điều phối các nhóm, tổng hợp báo cáo và phân công nhiệm vụ cho đúng phòng ban.", progress: 68, code: ".github/agents/office-coordinator.agent.md", pos: [-6, -3] },
  { id: "research", name: "Nghiên cứu", role: "Nghiên cứu · Tầng 1", team: "marketing", state: "resting", color: "#58a69a", job: "Đang chờ yêu cầu nghiên cứu mới", description: "Tìm hiểu thị trường, tổng hợp nguồn và ghi rõ dữ kiện cần kiểm chứng.", progress: 0, code: ".github/agents/market-research.agent.md", pos: [0, -3] },
  { id: "social", name: "Nội dung Fanpage", role: "Nội dung · Tầng 1", team: "marketing", state: "waiting", color: "#e5a84d", job: "7 bài đang chờ duyệt", description: "Soạn nội dung mạng xã hội theo giọng thương hiệu và lịch đăng đã giao.", progress: 82, code: ".github/agents/social-content.agent.md", pos: [6, -3] },
  { id: "short-video", name: "TikTok ảnh cuộn", role: "Sáng tạo · Tầng 1", team: "marketing", state: "waiting", color: "#da8065", job: "9 bài chờ · 7 bài đã gửi nháp", description: "Lên ý tưởng, kịch bản ngắn và cấu trúc nội dung ảnh cuộn cho TikTok.", progress: 54, code: ".github/agents/short-video.agent.md", pos: [-6, 3] },
  { id: "publisher", name: "Phát hành", role: "Phát hành · Tầng 1", team: "marketing", state: "resting", color: "#8e79d4", job: "0 bài đã hẹn", description: "Chuẩn bị nội dung được duyệt để xuất bản theo lịch và kênh chỉ định.", progress: 0, code: ".github/agents/publishing-planner.agent.md", pos: [0, 3] },
  { id: "sales", name: "Bán hàng · Chăm sóc KH", role: "Hỗ trợ · Tầng 1", team: "marketing", state: "working", color: "#4c9dcb", job: "2 yêu cầu cần phản hồi", description: "Soạn phản hồi chăm sóc khách hàng và gợi ý bước tiếp theo theo chính sách.", progress: 42, code: ".github/agents/customer-support.agent.md", pos: [6, 3] },
  { id: "video", name: "Edit · Làm video", role: "Sản xuất · Tầng 2", team: "training", state: "working", color: "#df8d4c", job: "Đang dựng video bán hàng", description: "Lập shot list, cấu trúc nội dung video và checklist hậu kỳ cho nhóm sản xuất.", progress: 61, code: ".github/agents/video-production.agent.md", pos: [-6, -3] },
  { id: "training", name: "Đào tạo AI", role: "Đào tạo · Tầng 2", team: "training", state: "resting", color: "#5e9a78", job: "Đang chờ yêu cầu đào tạo", description: "Tạo tài liệu hướng dẫn và quy trình thao tác có thể kiểm tra lại.", progress: 0, code: ".github/agents/ai-training.agent.md", pos: [0, -3] },
  { id: "landing", name: "Web / Landing", role: "Phát triển web · Tầng 2", team: "training", state: "working", color: "#5178cf", job: "2 yêu cầu đang được lên kế hoạch", description: "Hỗ trợ xây dựng nội dung, cấu trúc và kiểm thử trang web/landing page.", progress: 31, code: ".github/agents/web-landing.agent.md", pos: [6, -3] },
  { id: "brand-review", name: "Kiểm tra lỗi Shop · Brand", role: "Kiểm duyệt · Tầng 3", team: "brand", state: "working", color: "#4da77d", job: "12 cảnh báo đã được xử lý", description: "Rà soát tính nhất quán thương hiệu, lỗi nội dung và các checklist cửa hàng.", progress: 94, code: ".github/agents/brand-review.agent.md", pos: [-6, -3] },
  { id: "brand-voice", name: "Quản lý thương hiệu", role: "Thương hiệu · Tầng 3", team: "brand", state: "resting", color: "#b57fca", job: "Đang chờ brief thương hiệu", description: "Duy trì giọng điệu, thông điệp và tài liệu nền tảng của thương hiệu.", progress: 0, code: ".github/agents/brand-manager.agent.md", pos: [0, -3] },
  { id: "quality", name: "Kiểm duyệt nội dung", role: "Chất lượng · Tầng 3", team: "brand", state: "waiting", color: "#d57281", job: "16 nội dung chờ kiểm duyệt", description: "Kiểm tra thông tin, chính tả, liên kết và nội dung trước khi phê duyệt.", progress: 73, code: ".github/agents/content-reviewer.agent.md", pos: [6, -3] }
];

const stateLabels = { working: "Đang làm", waiting: "Chờ duyệt", resting: "Nghỉ" };
const stateColors = { working: "#36b67e", waiting: "#e6a23c", resting: "#a4adba" };
const taskStatusLabels = { queued: "Chờ xử lý", in_progress: "Đang xử lý", completed: "Hoàn thành", failed: "Thất bại" };
const providerLabels = { gemini: "Google Gemini", openai: "OpenAI / ChatGPT" };
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const agentList = document.querySelector("#agent-list");
const agentDetail = document.querySelector("#agent-detail");
const floorTabs = document.querySelector("#floor-tabs");
const activityList = document.querySelector("#activity-list");
const taskList = document.querySelector("#task-list");
const toast = document.querySelector("#toast");
const canvas = document.querySelector("#office-canvas");
const sceneViewport = document.querySelector("#scene-viewport");
const sceneError = document.querySelector("#scene-error");
const authScreen = document.querySelector("#auth-screen");
const appShell = document.querySelector("#app-shell");
let selectedAgentId = "coordinator";
let selectedTeamId = "marketing";
let taskQueue = [];
let taskLoadError = "";
let supabase;
let currentUser;
let taskRefreshTimer;
let appEventsSetup = false;
let renderer;
let scene;
let camera;
let raycaster;
let pointer;
let avatarMeshes = [];
let autoRotate = false;
let rotation = 0.6;
let zoom = 1;
let dragging = false;
let dragMoved = false;
let previousX = 0;
let toastTimer;
const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (supabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Cấu hình Supabase không hợp lệ:", error);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
}

function shortName(name) {
  return name.split(/[\s·]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function getAgent(agentId) {
  return agents.find((agent) => agent.id === agentId);
}

function getAgentTasks(agentId) {
  return taskQueue.filter((task) => task.agent_id === agentId);
}

function getActiveAgentTask(agentId) {
  return getAgentTasks(agentId).find((task) => task.status === "in_progress" || task.status === "queued");
}

function getAgentState(agentId) {
  const task = getActiveAgentTask(agentId);
  if (task?.status === "in_progress") return "working";
  if (task?.status === "queued") return "waiting";
  return getAgentTasks(agentId)[0]?.status === "failed" ? "failed" : "resting";
}

function getAgentProgress(agentId) {
  const task = getActiveAgentTask(agentId);
  if (task) return task.progress;
  return getAgentTasks(agentId)[0]?.status === "completed" ? 100 : 0;
}

function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Thời gian không xác định" : new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  }).format(date);
}

function renderAgentList() {
  agentList.innerHTML = agents.map((agent) => {
    const state = getAgentState(agent.id);
    const label = getActiveAgentTask(agent.id) ? stateLabels[state] : state === "failed" ? "có lỗi" : "sẵn sàng";
    return `
    <button class="agent-entry${agent.id === selectedAgentId ? " is-selected" : ""}" type="button" data-agent="${agent.id}" aria-pressed="${agent.id === selectedAgentId}">
      <i class="status-dot ${state}" aria-hidden="true"></i><span>${agent.name}</span><small>${label}</small>
    </button>`;
  }).join("");
}

function renderAgentDetail() {
  const agent = getAgent(selectedAgentId) || agents[0];
  const activeTask = getActiveAgentTask(agent.id);
  const latestTask = getAgentTasks(agent.id)[0];
  const state = getAgentState(agent.id);
  const statusText = activeTask ? taskStatusLabels[activeTask.status] : latestTask?.status === "failed" ? "Nhiệm vụ lỗi" : "Sẵn sàng";
  const progress = getAgentProgress(agent.id);
  agentDetail.innerHTML = `
    <div class="selected-agent">
      <div class="selected-agent-top">
        <span class="agent-avatar" style="background:${agent.color}">${shortName(agent.name)}</span>
        <span class="agent-heading"><small>${agent.role}</small><strong>${agent.name}</strong></span>
      </div>
      <span class="agent-state ${state}"><i class="status-dot ${state}"></i>${statusText}</span>
      <p class="agent-description">${activeTask ? escapeHtml(activeTask.title) : latestTask?.status === "failed" ? escapeHtml(latestTask.error || "Hãy xem lại cấu hình AI.") : agent.description}</p>
      <div class="progress-label"><span>${activeTask ? "Tiến độ xử lý" : "Nhiệm vụ mới nhất"}</span><strong>${activeTask ? `${progress}%` : latestTask ? taskStatusLabels[latestTask.status] : "Chưa giao"}</strong></div>
      <div class="progress-track"><span style="width:${progress}%"></span></div>
      <div class="agent-command">${agent.code}</div>
      <div class="detail-actions"><button class="button button-primary" id="assign-selected" type="button">Giao việc</button><button class="button button-quiet" id="focus-selected" type="button">Tìm trong sơ đồ</button></div>
    </div>`;
}

function renderTaskList() {
  const taskCount = document.querySelector("#task-count-label");
  taskCount.textContent = taskLoadError ? "Không thể tải dữ liệu" : `${taskQueue.length} nhiệm vụ đã lưu`;
  taskList.innerHTML = taskLoadError
    ? `<p class="task-empty">${escapeHtml(taskLoadError)}</p>`
    : taskQueue.length
      ? taskQueue.map((task) => {
        const status = taskStatusLabels[task.status] || "Không xác định";
        const provider = providerLabels[task.provider] || task.provider;
        const agent = getAgent(task.agent_id)?.name || "AI Agent";
        const error = task.error ? `<p class="task-error">${escapeHtml(task.error)}</p>` : "";
        const result = task.result
          ? `<div class="task-actions"><button class="task-view-result" type="button" data-task-result="${task.id}">Xem kết quả</button></div>`
          : "";
        const retry = task.status === "failed"
          ? `<div class="task-actions"><button class="task-view-result" type="button" data-retry-task="${task.id}">Thử lại</button></div>`
          : "";
        return `
          <article class="task-row">
            <div class="task-row-head"><div><h3 class="task-row-title">${escapeHtml(task.title)}</h3><div class="task-row-meta"><span>${escapeHtml(agent)}</span><span>${escapeHtml(provider)}</span><span>${formatTime(task.created_at)}</span></div></div><span class="task-status ${task.status}">${status}</span></div>
            <div class="task-progress"><div class="progress-track"><span style="width:${Number(task.progress) || 0}%"></span></div><small>${Number(task.progress) || 0}%</small></div>
            ${error}${result}${retry}
          </article>`;
      }).join("")
      : '<p class="task-empty">Chưa có nhiệm vụ. Chọn “Giao công việc” để bắt đầu.</p>';
}

function renderMetrics() {
  const count = (status) => taskQueue.filter((task) => task.status === status).length;
  document.querySelector("#metric-total").textContent = String(taskQueue.length);
  document.querySelector("#metric-running").textContent = String(count("in_progress"));
  document.querySelector("#metric-completed").textContent = String(count("completed"));
  document.querySelector("#metric-queued").textContent = String(count("queued"));
  document.querySelector("#metric-failed").textContent = String(count("failed"));
}

function renderDashboard() {
  renderMetrics();
  renderTaskList();
  renderAgentList();
  renderAgentDetail();
  renderActivities();
  updateOfficeAgentIndicators();
}

async function refreshTasks() {
  if (!supabase || !currentUser) return;
  const { data, error } = await supabase
    .from("ai_tasks")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.error("Không thể tải nhiệm vụ:", error);
    taskQueue = [];
    taskLoadError = "Không tải được dữ liệu nhiệm vụ. Kiểm tra cấu hình database và quyền RLS.";
    renderDashboard();
    return;
  }
  taskQueue = data;
  taskLoadError = "";
  renderDashboard();
}

function renderActivities() {
  activityList.innerHTML = taskQueue.length
    ? taskQueue.slice(0, 6).map((task) => `<div class="activity-item"><i class="${task.status === "failed" ? "failed" : ""}"></i><span>${escapeHtml(getAgent(task.agent_id)?.name || "AI Agent")} · ${escapeHtml(taskStatusLabels[task.status] || task.status)}<time>${formatTime(task.updated_at || task.created_at)}</time></span></div>`).join("")
    : taskLoadError
      ? `<p class="activity-empty">${escapeHtml(taskLoadError)}</p>`
      : '<p class="activity-empty">Chưa có nhiệm vụ. Hãy giao việc đầu tiên.</p>';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function setSelectedAgent(agentId) {
  const agent = getAgent(agentId);
  if (!agent) return;
  selectedAgentId = agent.id;
  if (agent.team !== selectedTeamId) setTeam(agent.team);
  renderDashboard();
  if (renderer) renderer.render(scene, camera);
}

function setTeam(teamId) {
  const team = teams.find((item) => item.id === teamId);
  if (!team) return;
  selectedTeamId = team.id;
  const floorAgents = agents.filter((agent) => agent.team === team.id);
  if (!floorAgents.some((agent) => agent.id === selectedAgentId)) selectedAgentId = floorAgents[0].id;
  renderFloorTabs();
  renderDashboard();
  document.querySelector("#scene-floor-label").textContent = `Tầng ${team.floor}`;
  if (renderer) drawOffice();
}

function renderFloorTabs() {
  floorTabs.innerHTML = teams.map((team, index) => `
    <button class="floor-tab${team.id === selectedTeamId ? " is-active" : ""}" type="button" role="tab" aria-selected="${team.id === selectedTeamId}" data-team="${team.id}"><b>${index + 1}</b>${team.title}</button>`).join("");
}

function disposeScene() {
  if (!scene) return;
  for (const child of [...scene.children]) {
    if (child.isLight) continue;
    scene.remove(child);
    child.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else if (object.material) object.material.dispose();
    });
  }
  avatarMeshes = [];
}

function makeBox(width, height, depth, tint, x, y, z, options = {}) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color: tint, roughness: .82, ...options });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function makeAgent(agent) {
  const group = new THREE.Group();
  group.position.set(agent.pos[0], 0, agent.pos[1]);
  group.userData.agentId = agent.id;
  const bodyMat = new THREE.MeshStandardMaterial({ color: agent.color, roughness: .76 });
  const skinMat = new THREE.MeshStandardMaterial({ color: "#f1c8a9", roughness: .9 });
  const darkMat = new THREE.MeshStandardMaterial({ color: "#465568", roughness: .86 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.22, .34, 3, 7), bodyMat);
  body.position.set(0, .54, 0);
  body.castShadow = true;
  group.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.19, 12, 10), skinMat);
  head.position.set(0, .95, -.015);
  head.castShadow = true;
  group.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.195, 12, 8, 0, Math.PI * 2, 0, Math.PI * .55), darkMat);
  hair.position.set(0, 1.01, -.015);
  group.add(hair);
  const state = getAgentState(agent.id);
  const status = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), new THREE.MeshBasicMaterial({ color: stateColors[state] || "#d65b56" }));
  status.name = "agent-status-indicator";
  status.position.set(.22, 1.22, 0);
  group.add(status);
  group.traverse((object) => {
    if (object.isMesh) object.userData.agentId = agent.id;
  });
  scene.add(group);
  avatarMeshes.push(group);
}

function updateOfficeAgentIndicators() {
  if (!renderer || !scene) return;
  for (const avatar of avatarMeshes) {
    const indicator = avatar.getObjectByName("agent-status-indicator");
    if (indicator) indicator.material.color.set(stateColors[getAgentState(avatar.userData.agentId)] || "#d65b56");
  }
  renderer.render(scene, camera);
}

function drawOffice() {
  if (!renderer) return;
  disposeScene();
  const team = teams.find((item) => item.id === selectedTeamId);
  const teamAgents = agents.filter((agent) => agent.team === team.id);
  const floorMat = new THREE.MeshStandardMaterial({ color: "#f2f5f8", roughness: 1 });
  const floor = new THREE.Mesh(new THREE.BoxGeometry(19, .16, 13), floorMat);
  floor.position.y = -.1;
  floor.receiveShadow = true;
  scene.add(floor);
  makeBox(19.2, .15, .16, "#87b8e4", 0, .02, -6.5);
  makeBox(19.2, .15, .16, "#dce3eb", 0, .02, 6.5);
  makeBox(.16, .15, 13, "#dce3eb", -9.5, .02, 0);
  makeBox(.16, .15, 13, "#dce3eb", 9.5, .02, 0);

  for (let index = 0; index < 3; index += 1) {
    const x = -6 + index * 6;
    makeBox(.08, .68, 3.2, "#d7dce2", x + 3, .32, 0);
    makeBox(5.1, .7, .07, "#e0e4e9", x, .35, 1.45);
  }

  teamAgents.forEach((agent, index) => {
    const [x, z] = agent.pos;
    const deskColor = index % 2 ? "#f5f1eb" : "#ebe7e0";
    makeBox(1.75, .12, .95, deskColor, x, .86, z - .48);
    makeBox(.08, .82, .08, "#c8ced5", x - .72, .4, z - .17);
    makeBox(.08, .82, .08, "#c8ced5", x + .72, .4, z - .17);
    makeBox(.12, .62, .08, "#596d82", x, 1.22, z - .81);
    makeBox(.75, .48, .035, "#dcecff", x, 1.22, z - .76, { emissive: "#c5e0ff", emissiveIntensity: .16 });
    makeBox(.85, .09, .09, "#64768a", x, .54, z + .55);
    makeAgent(agent);
  });

  const rug = new THREE.Mesh(new THREE.BoxGeometry(4.5, .025, 1.8), new THREE.MeshStandardMaterial({ color: "#e8f0fa", roughness: 1 }));
  rug.position.set(0, .005, 4.65);
  scene.add(rug);
  const plantMat = new THREE.MeshStandardMaterial({ color: "#62a47c", roughness: .95 });
  for (const [x, z] of [[-8.3, -5.2], [8.3, 5.2], [-8.3, 5.2], [8.3, -5.2]]) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(.22, .29, .38, 8), new THREE.MeshStandardMaterial({ color: "#d5b9a2", roughness: .9 }));
    pot.position.set(x, .18, z);
    scene.add(pot);
    const leaves = new THREE.Mesh(new THREE.IcosahedronGeometry(.42, 1), plantMat);
    leaves.position.set(x, .64, z);
    leaves.scale.set(.7, 1.25, .7);
    leaves.castShadow = true;
    scene.add(leaves);
  }
  renderer.render(scene, camera);
}

function updateCamera() {
  const radius = 30 / zoom;
  camera.position.set(Math.sin(rotation) * radius, 25 / zoom, Math.cos(rotation) * radius);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function initScene() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xf8fafc, 0);
    scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight("#ffffff", "#dce5ef", 2.1));
    const sun = new THREE.DirectionalLight("#ffffff", 2.2);
    sun.position.set(-7, 18, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    scene.add(sun);
    camera = new THREE.OrthographicCamera(-12, 12, 9, -9, .1, 100);
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    resizeScene();
    drawOffice();
    window.addEventListener("resize", resizeScene);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerCancel);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    requestAnimationFrame(animate);
  } catch (error) {
    console.error("Không thể khởi tạo văn phòng 3D:", error);
    sceneError.hidden = false;
  }
}

function resizeScene() {
  if (!renderer || !camera) return;
  const width = Math.max(1, sceneViewport.clientWidth);
  const height = Math.max(1, sceneViewport.clientHeight);
  renderer.setSize(width, height, false);
  const aspect = width / height;
  const viewHeight = 17 / zoom;
  camera.left = -viewHeight * aspect / 2;
  camera.right = viewHeight * aspect / 2;
  camera.top = viewHeight / 2;
  camera.bottom = -viewHeight / 2;
  updateCamera();
}

function animate() {
  if (autoRotate && !dragging) {
    rotation += .0018;
    updateCamera();
  }
  requestAnimationFrame(animate);
}

function onPointerDown(event) {
  dragging = true;
  dragMoved = false;
  previousX = event.clientX;
  canvas.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!dragging) return;
  const delta = event.clientX - previousX;
  if (Math.abs(delta) > 2) dragMoved = true;
  rotation += delta * .008;
  previousX = event.clientX;
  updateCamera();
}

function onPointerUp(event) {
  if (dragging && !dragMoved) selectAtPointer(event);
  dragging = false;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
}

function onPointerCancel() { dragging = false; }

function onWheel(event) {
  event.preventDefault();
  zoom = THREE.MathUtils.clamp(zoom + (event.deltaY < 0 ? .08 : -.08), .72, 1.5);
  resizeScene();
}

function selectAtPointer(event) {
  const bounds = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(avatarMeshes, true);
  const agentId = hits[0]?.object.userData.agentId;
  if (agentId) setSelectedAgent(agentId);
}

function openTaskDialog() {
  const dialog = document.querySelector("#task-dialog");
  const select = document.querySelector("#task-agent");
  select.innerHTML = agents.map((agent) => `<option value="${agent.id}"${agent.id === selectedAgentId ? " selected" : ""}>${escapeHtml(agent.name)} — ${escapeHtml(agent.role)}</option>`).join("");
  if (!dialog.open) dialog.showModal();
  document.querySelector("#task-prompt").focus();
}

async function saveTask(event) {
  event.preventDefault();
  const agent = getAgent(document.querySelector("#task-agent").value);
  const prompt = document.querySelector("#task-prompt").value.trim();
  const provider = document.querySelector("#task-provider").value;
  if (!agent || !prompt || !providerLabels[provider]) {
    showToast("Hãy chọn agent và nhập nội dung công việc.");
    return;
  }
  const submitButton = document.querySelector(".dialog-submit");
  submitButton.disabled = true;
  submitButton.textContent = "Đang lưu nhiệm vụ...";
  const { data: task, error } = await supabase.from("ai_tasks").insert({
    title: prompt.length > 100 ? `${prompt.slice(0, 97)}...` : prompt,
    prompt,
    agent_id: agent.id,
    provider,
    status: "queued",
    progress: 0
  }).select().single();
  submitButton.disabled = false;
  submitButton.textContent = "Giao việc cho AI";
  if (error) {
    console.error("Không thể lưu nhiệm vụ:", error);
    showToast("Không lưu được nhiệm vụ. Kiểm tra đăng nhập và chính sách RLS của Supabase.");
    return;
  }
  taskQueue.unshift(task);
  document.querySelector("#task-dialog").close();
  document.querySelector("#task-form").reset();
  setSelectedAgent(agent.id);
  renderDashboard();
  showToast(`Đã giao việc cho ${agent.name}. AI đang xử lý...`);
  void runAgent(task);
}

async function runAgent(task) {
  try {
    const { error } = await supabase.functions.invoke("run-agent", { body: { taskId: task.id } });
    if (error) {
      console.error("Không thể chạy AI Agent:", error);
      const { error: updateError } = await supabase.from("ai_tasks").update({
        status: "failed",
        error: "Không gọi được backend AI. Kiểm tra Edge Function, quyền truy cập và API key."
      }).eq("id", task.id);
      if (updateError) console.error("Không thể cập nhật trạng thái nhiệm vụ lỗi:", updateError);
      showToast("AI chưa chạy được. Mở nhiệm vụ để xem trạng thái và kiểm tra cấu hình backend.");
    }
  } catch (error) {
    console.error("Lỗi ngoài dự kiến khi chạy AI Agent:", error);
    showToast("Không gửi được nhiệm vụ tới backend AI. Kiểm tra kết nối rồi tải lại.");
  } finally {
    await refreshTasks();
  }
}

async function retryTask(taskId) {
  const previousTask = taskQueue.find((task) => task.id === taskId && task.status === "failed");
  if (!previousTask) return;
  const { data: task, error } = await supabase.from("ai_tasks").insert({
    title: previousTask.title,
    prompt: previousTask.prompt,
    agent_id: previousTask.agent_id,
    provider: previousTask.provider,
    status: "queued",
    progress: 0
  }).select().single();
  if (error) {
    console.error("Không thể tạo lại nhiệm vụ:", error);
    showToast("Không tạo lại được nhiệm vụ. Kiểm tra cấu hình database.");
    return;
  }
  taskQueue.unshift(task);
  renderDashboard();
  showToast("Đã đưa lại nhiệm vụ vào hàng đợi.");
  void runAgent(task);
}

function showTaskResult(taskId) {
  const task = taskQueue.find((item) => item.id === taskId);
  if (!task) return;
  document.querySelector("#result-title").textContent = task.title;
  document.querySelector("#result-meta").textContent = `${getAgent(task.agent_id)?.name || "AI Agent"} · ${providerLabels[task.provider] || task.provider} · ${taskStatusLabels[task.status] || task.status}`;
  document.querySelector("#result-content").textContent = task.result || task.error || "Kết quả chưa sẵn sàng.";
  document.querySelector("#result-dialog").showModal();
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("#auth-message");
  const submitButton = document.querySelector("#login-submit");
  if (!supabase) {
    message.textContent = "Chưa cấu hình Supabase. Làm theo SETUP.md rồi thêm hai biến VITE_SUPABASE_*.";
    return;
  }
  const formData = new FormData(form);
  submitButton.disabled = true;
  submitButton.textContent = "Đang xác thực...";
  message.textContent = "";
  message.classList.remove("success");
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password"))
  });
  submitButton.disabled = false;
  submitButton.textContent = "Đăng nhập an toàn";
  if (error) {
    console.error("Đăng nhập Supabase thất bại:", error);
    message.textContent = "Đăng nhập thất bại. Kiểm tra email, mật khẩu và cấu hình Supabase Auth.";
  }
}

function leaveApp() {
  currentUser = undefined;
  clearInterval(taskRefreshTimer);
  taskRefreshTimer = undefined;
  appShell.hidden = true;
  authScreen.hidden = false;
}

async function enterApp(user) {
  if (!user || !supabase) return leaveApp();
  currentUser = user;
  authScreen.hidden = true;
  appShell.hidden = false;
  document.querySelector("#account-email").textContent = user.email || "Tài khoản quản trị";
  document.querySelector("#account-email").title = user.email || "";
  renderFloorTabs();
  renderDashboard();
  if (!renderer) initScene();
  if (!appEventsSetup) {
    setupEvents();
    appEventsSetup = true;
  }
  await refreshTasks();
  if (!taskRefreshTimer) taskRefreshTimer = setInterval(() => { void refreshTasks(); }, 5000);
}

async function initializeAuthentication() {
  const loginForm = document.querySelector("#login-form");
  loginForm.addEventListener("submit", handleLogin);
  document.querySelector("#logout-button").addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Không thể đăng xuất:", error);
      showToast("Đăng xuất không thành công. Hãy thử lại.");
    }
  });
  if (!supabase) {
    document.querySelector("#login-submit").disabled = true;
    document.querySelector("#auth-message").textContent = "Chưa cấu hình Supabase. Làm theo SETUP.md rồi thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.";
    return;
  }
  supabase.auth.onAuthStateChange((_event, session) => {
    queueMicrotask(() => {
      if (session?.user) void enterApp(session.user);
      else leaveApp();
    });
  });
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Không thể khôi phục phiên đăng nhập:", error);
    document.querySelector("#auth-message").textContent = "Không kiểm tra được phiên đăng nhập. Tải lại trang để thử lại.";
    return;
  }
  if (data.session?.user) await enterApp(data.session.user);
}

function setupEvents() {
  agentList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-agent]");
    if (button) setSelectedAgent(button.dataset.agent);
  });
  floorTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-team]");
    if (button) setTeam(button.dataset.team);
  });
  document.querySelector("#new-task-button").addEventListener("click", openTaskDialog);
  document.querySelector("#add-agent").addEventListener("click", () => showToast("12 profile Copilot Agent đã có trong .github/agents/."));
  document.querySelector("#task-form").addEventListener("submit", (event) => { void saveTask(event); });
  document.querySelector("#refresh-tasks").addEventListener("click", (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    void refreshTasks().finally(() => { button.disabled = false; });
  });
  taskList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-task-result]");
    if (button) showTaskResult(button.dataset.taskResult);
    const retryButton = event.target.closest("[data-retry-task]");
    if (retryButton) void retryTask(retryButton.dataset.retryTask);
  });
  document.querySelector("#rotate-button").addEventListener("click", (event) => {
    autoRotate = !autoRotate;
    event.currentTarget.setAttribute("aria-pressed", String(autoRotate));
    event.currentTarget.querySelector("span").textContent = autoRotate ? "Dừng xoay" : "Tự xoay";
  });
  document.querySelector("#zoom-in").addEventListener("click", () => { zoom = Math.min(1.5, zoom + .1); resizeScene(); });
  document.querySelector("#zoom-out").addEventListener("click", () => { zoom = Math.max(.72, zoom - .1); resizeScene(); });
  document.querySelector("#reset-view").addEventListener("click", () => { rotation = .6; zoom = 1; resizeScene(); });
  agentDetail.addEventListener("click", (event) => {
    if (event.target.closest("#assign-selected")) openTaskDialog();
    if (event.target.closest("#focus-selected")) showToast(`${getAgent(selectedAgentId).name} đang được chọn trong sơ đồ.`);
  });
  document.querySelectorAll(".nav-item[data-notice]").forEach((button) => {
    button.addEventListener("click", () => showToast(button.dataset.notice));
  });
}

function init() {
  const now = new Date();
  document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" }).format(now);
  renderFloorTabs();
  renderDashboard();
  renderActivities();
  void initializeAuthentication();
}

init();
