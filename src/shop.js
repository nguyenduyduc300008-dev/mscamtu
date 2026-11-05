import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "./shop.css";

const products = [
  {
    id: "yamaha-fg830",
    name: "Yamaha FG830",
    category: "Acoustic",
    origin: "Nhật Bản",
    condition: "used",
    price: 5200000,
    image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1000&q=84",
    description: "Âm thanh cân bằng, tiếng vang ấm và ngoại hình gỗ vân đẹp. Một cây đàn acoustic dễ đồng hành từ những buổi tập đầu tiên."
  },
  {
    id: "cordoba-c5",
    name: "Cordoba C5",
    category: "Classic",
    origin: "Tây Ban Nha",
    condition: "new",
    price: 6800000,
    image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=1000&q=84",
    description: "Guitar classic dây nylon êm tay, phù hợp để học ngón, chơi cổ điển hoặc đệm hát nhẹ nhàng."
  },
  {
    id: "takamine-gd20",
    name: "Takamine GD20",
    category: "Acoustic",
    origin: "Nhật Bản",
    condition: "used",
    price: 7400000,
    image: "https://images.unsplash.com/photo-1550291652-6ea9114a47b1?auto=format&fit=crop&w=1000&q=84",
    description: "Tiếng đàn sáng, rõ và có độ vang tốt. Cây đàn đã qua sử dụng, được kiểm tra và setup trước khi lên kệ."
  },
  {
    id: "swing-classic-01",
    name: "Classic Việt Nam",
    category: "Classic",
    origin: "Việt Nam",
    condition: "new",
    price: 1850000,
    image: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1000&q=84",
    description: "Cây đàn mộc mạc, thân thiện cho người mới làm quen với guitar classic và những giai điệu đầu tiên."
  },
  {
    id: "squier-classic-vibe",
    name: "Squier Classic Vibe",
    category: "Electric",
    origin: "Nhật Bản",
    condition: "used",
    price: 8900000,
    image: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&w=1000&q=84",
    description: "Guitar điện phong cách cổ điển, âm sắc linh hoạt từ clean đến overdrive. Tình trạng và phụ kiện được tư vấn khi xem đàn."
  },
  {
    id: "swing-bass-01",
    name: "Bass 4 dây",
    category: "Bass",
    origin: "Việt Nam",
    condition: "new",
    price: 3200000,
    image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=1000&q=84",
    description: "Cây bass 4 dây dễ chơi để bạn bắt đầu giữ nhịp và hòa vào ban nhạc của mình."
  }
];

const customProductsKey = "swing-music-catalog-v1";
const inquiriesKey = "swing-music-inquiries-v1";
const grid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#catalog-search");
const resultCount = document.querySelector("#result-count");
const emptyMessage = document.querySelector("#catalog-empty");
const productDialog = document.querySelector("#product-dialog");
const addDialog = document.querySelector("#add-dialog");
const productDetail = document.querySelector("#product-detail");
const addForm = document.querySelector("#add-form");
const addStatus = document.querySelector("#add-status");
const contactInterest = document.querySelector("#contact-interest");
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#form-status");
const menuToggle = document.querySelector("#menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
let selectedCategory = "all";
let selectedCondition = "all";
let customProducts = [];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function formatPrice(price) {
  return price ? `${new Intl.NumberFormat("vi-VN").format(price)}đ` : "Liên hệ";
}

function getAllProducts() {
  return [...customProducts, ...products];
}

function readStoredData(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error(`Không thể đọc dữ liệu ${key} từ trình duyệt:`, error);
    return [];
  }
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("vi");
  const visibleProducts = getAllProducts().filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesCondition = selectedCondition === "all" || product.condition === selectedCondition;
    const searchableText = `${product.name} ${product.origin} ${product.category}`.toLocaleLowerCase("vi");
    return matchesCategory && matchesCondition && searchableText.includes(query);
  });

  grid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <button class="product-image-button" type="button" data-open-product="${escapeHtml(product.id)}" aria-label="Xem hình và chi tiết ${escapeHtml(product.name)}">
        <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
        <span class="product-condition">${product.condition === "used" ? "2ND HAND" : "NEW"}</span>
        <span class="image-view" aria-hidden="true">Xem đàn ↗</span>
      </button>
      <div class="product-info">
        <div class="product-meta"><span>${escapeHtml(product.origin)}</span><span>${escapeHtml(product.category === "Electric" ? "Guitar điện" : product.category)}</span></div>
        <h3>${escapeHtml(product.name)}</h3>
        <div class="product-bottom"><strong>${formatPrice(product.price)}</strong><button type="button" class="product-open" data-open-product="${escapeHtml(product.id)}" aria-label="Xem chi tiết ${escapeHtml(product.name)}">↗</button></div>
      </div>
    </article>
  `).join("");

  resultCount.textContent = `${visibleProducts.length} cây đàn`;
  emptyMessage.hidden = visibleProducts.length > 0;
  grid.hidden = visibleProducts.length === 0;
}

function showProduct(productId) {
  const product = getAllProducts().find((item) => item.id === productId);
  if (!product) {
    console.error(`Không tìm thấy sản phẩm trong catalog: ${productId}`);
    return;
  }

  productDetail.innerHTML = `
    <div class="product-detail-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"></div>
    <div class="product-detail-copy">
      <p class="eyebrow"><span class="eyebrow-line"></span> ${product.condition === "used" ? "ĐÀN 2ND HAND" : "ĐÀN MỚI"} · ${escapeHtml(product.origin)}</p>
      <h2 id="dialog-title">${escapeHtml(product.name)}</h2>
      <p class="detail-category">${escapeHtml(product.category === "Electric" ? "Guitar điện" : product.category)}</p>
      <p class="detail-description">${escapeHtml(product.description)}</p>
      <strong class="detail-price">${formatPrice(product.price)}</strong>
      <a class="button button-dark detail-cta" href="#contact" data-interest="Hỏi về ${escapeHtml(product.name)}">Hỏi về cây đàn này <span aria-hidden="true">↗</span></a>
    </div>
  `;
  productDialog.showModal();
}

function setInterest(value) {
  if (!value) return;
  const existingOption = [...contactInterest.options].find((option) => option.value === value || option.textContent === value);
  if (existingOption) {
    contactInterest.value = existingOption.value || existingOption.textContent;
  } else {
    const customOption = new Option(value, value, true, true);
    contactInterest.add(customOption);
    contactInterest.value = value;
  }
}

document.querySelector("#category-filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  document.querySelectorAll(".filter-chip").forEach((chip) => {
    const active = chip === button;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
});

document.querySelector(".condition-filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-condition]");
  if (!button) return;
  selectedCondition = button.dataset.condition;
  document.querySelectorAll(".condition-chip").forEach((chip) => {
    const active = chip === button;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-product]");
  if (button) showProduct(button.dataset.openProduct);
});

document.querySelector("#add-instrument").addEventListener("click", () => {
  addForm.reset();
  addStatus.textContent = "";
  addDialog.showModal();
});

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(addForm);
  const rawImage = String(formData.get("image")).trim();
  let imageUrl;
  try {
    imageUrl = new URL(rawImage);
  } catch {
    addStatus.textContent = "Vui lòng nhập đường dẫn ảnh hợp lệ bắt đầu bằng https://";
    return;
  }
  if (!["http:", "https:"].includes(imageUrl.protocol)) {
    addStatus.textContent = "Đường dẫn hình ảnh chỉ được dùng http hoặc https.";
    return;
  }

  const rawPrice = formData.get("price");
  const product = {
    id: `custom-${Date.now()}`,
    name: String(formData.get("name")).trim(),
    category: String(formData.get("category")),
    origin: String(formData.get("origin")).trim(),
    condition: String(formData.get("condition")),
    price: rawPrice ? Number(rawPrice) : 0,
    image: imageUrl.href,
    description: String(formData.get("description")).trim() || "Hãy liên hệ Swing để biết thêm về cây đàn này."
  };
  customProducts.unshift(product);

  try {
    localStorage.setItem(customProductsKey, JSON.stringify(customProducts));
  } catch (error) {
    customProducts.shift();
    console.error("Không thể lưu catalog vào trình duyệt:", error);
    addStatus.textContent = "Không lưu được catalog trên thiết bị này. Vui lòng kiểm tra dung lượng trình duyệt.";
    return;
  }

  renderProducts();
  addDialog.close();
  document.querySelector("#catalog").scrollIntoView({ behavior: "smooth" });
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-interest]");
  if (!link) return;
  setInterest(link.dataset.interest);
  productDialog.close();
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(contactForm);
  const inquiry = {
    name: String(formData.get("name")).trim(),
    contact: String(formData.get("contact")).trim(),
    interest: String(formData.get("interest")),
    message: String(formData.get("message")).trim(),
    createdAt: new Date().toISOString()
  };
  const inquiries = readStoredData(inquiriesKey);
  inquiries.unshift(inquiry);

  try {
    localStorage.setItem(inquiriesKey, JSON.stringify(inquiries));
  } catch (error) {
    console.error("Không thể lưu lời nhắn vào trình duyệt:", error);
    contactStatus.textContent = "Không lưu được lời nhắn trên thiết bị này. Vui lòng thử lại sau.";
    return;
  }

  contactStatus.textContent = "Lời nhắn đã được lưu trên thiết bị này. Đây là bản demo, Swing chưa nhận được thông tin.";
  contactForm.reset();
});

document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

[productDialog, addDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Mở menu" : "Đóng menu");
  primaryNav.classList.toggle("is-open", !isExpanded);
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Mở menu");
  }
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
customProducts = readStoredData(customProductsKey).filter((product) => product && typeof product.id === "string");
renderProducts();
