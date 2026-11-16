import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "./duc-phuc.css";

const products = [
  {
    id: "essential-tee",
    name: "Áo thun Essential",
    category: "Áo",
    audience: "Unisex",
    price: 249000,
    oldPrice: 329000,
    badge: "BST MỚI",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    description: "Áo thun phom suông, chất vải mềm nhẹ, dễ mặc cùng quần jeans hoặc quần short. Sản phẩm và giá trong trang là dữ liệu minh họa.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "linen-shirt",
    name: "Sơ mi Linen Everyday",
    category: "Áo",
    audience: "Nam",
    price: 389000,
    oldPrice: 459000,
    badge: "BÁN CHẠY",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85",
    description: "Sơ mi phong cách tối giản với bề mặt vải tự nhiên, phù hợp từ ngày làm việc đến những buổi gặp gỡ cuối tuần.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "daily-jacket",
    name: "Áo khoác Daily",
    category: "Áo khoác",
    audience: "Unisex",
    price: 549000,
    oldPrice: 690000,
    badge: "GIÁ TỐT",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
    description: "Lớp khoác gọn nhẹ với thiết kế dễ phối lớp, tạo điểm nhấn cho trang phục thường ngày.",
    sizes: ["M", "L", "XL"]
  },
  {
    id: "straight-jeans",
    name: "Quần Jeans Straight",
    category: "Quần",
    audience: "Unisex",
    price: 459000,
    oldPrice: 559000,
    badge: "",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
    description: "Quần jeans phom đứng kinh điển, dễ kết hợp cùng áo thun, sơ mi hoặc áo khoác.",
    sizes: ["28", "29", "30", "31", "32"]
  },
  {
    id: "soft-hoodie",
    name: "Hoodie Soft Touch",
    category: "Áo",
    audience: "Unisex",
    price: 499000,
    oldPrice: 0,
    badge: "BST MỚI",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
    description: "Chiếc hoodie thoải mái cho những ngày cần thêm một lớp ấm áp, tối giản để phối theo nhiều phong cách.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "wide-leg-pants",
    name: "Quần Wide Leg",
    category: "Quần",
    audience: "Nữ",
    price: 429000,
    oldPrice: 0,
    badge: "",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=85",
    description: "Phom quần rộng thanh lịch giúp tổng thể trang phục trông nhẹ nhàng và hiện đại.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "classic-cap",
    name: "Nón Classic",
    category: "Phụ kiện",
    audience: "Unisex",
    price: 189000,
    oldPrice: 229000,
    badge: "GIÁ TỐT",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85",
    description: "Phụ kiện đơn giản để hoàn thiện bộ đồ mỗi ngày. Sản phẩm trong ảnh chỉ mang tính minh họa.",
    sizes: ["Một cỡ"]
  },
  {
    id: "crossbody-bag",
    name: "Túi Đeo Mini",
    category: "Phụ kiện",
    audience: "Unisex",
    price: 299000,
    oldPrice: 0,
    badge: "",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
    description: "Túi đeo nhỏ gọn cho những vật dụng cần thiết, điểm nhấn tiện dụng cho phong cách dạo phố.",
    sizes: ["Một cỡ"]
  }
];

const news = [
  {
    id: "everyday-capsule",
    category: "GỢI Ý PHỐI ĐỒ",
    date: "08.11.2026",
    title: "Tủ đồ cơ bản: bắt đầu từ những món dễ phối",
    excerpt: "Một vài lựa chọn đơn giản giúp bạn kết hợp trang phục linh hoạt hơn mỗi ngày.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=85",
    content: "Một chiếc áo thun vừa vặn, sơ mi dễ mặc và quần jeans phom thoải mái có thể tạo nên nhiều lựa chọn khác nhau. Hãy bắt đầu với màu sắc bạn thường mặc, ưu tiên cảm giác dễ chịu và phối thêm phụ kiện khi muốn tạo điểm nhấn. Bài viết này là nội dung minh họa cho bản demo."
  },
  {
    id: "choose-fabric",
    category: "CHẤT LIỆU",
    date: "01.11.2026",
    title: "Chọn chất liệu phù hợp với nhịp sống mỗi ngày",
    excerpt: "Đọc nhãn, cảm nhận bề mặt vải và chọn thiết kế phù hợp với nhu cầu của bạn.",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1100&q=85",
    content: "Chất liệu có ảnh hưởng đến cảm giác khi mặc và cách chăm sóc trang phục. Khi lựa chọn, hãy xem thông tin trên nhãn, cân nhắc thời tiết và hoạt động thường ngày, đồng thời làm theo hướng dẫn giặt ủi để trang phục giữ được phom dáng lâu hơn. Bài viết này là nội dung minh họa cho bản demo."
  },
  {
    id: "color-pairing",
    category: "CẢM HỨNG",
    date: "25.10.2026",
    title: "Phối màu trung tính mà không đơn điệu",
    excerpt: "Thử kết hợp sắc độ, chất liệu và một phụ kiện nổi bật để làm mới trang phục.",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=85",
    content: "Bảng màu trung tính là điểm khởi đầu dễ ứng dụng. Bạn có thể kết hợp nhiều sắc độ sáng tối, tạo tương phản bằng chất liệu, sau đó thêm một phụ kiện có màu sắc yêu thích. Hãy thử từng cách phối và chọn điều khiến bạn cảm thấy tự tin. Bài viết này là nội dung minh họa cho bản demo."
  }
];

const cartStorageKey = "duc-phuc-group-cart-v1";
const productGrid = document.querySelector("#product-grid");
const categoryFilters = document.querySelector("#category-filters");
const searchInput = document.querySelector("#header-search");
const priceSort = document.querySelector("#price-sort");
const catalogSummary = document.querySelector("#catalog-summary");
const emptyState = document.querySelector("#empty-state");
const productDialog = document.querySelector("#product-dialog");
const productDetail = document.querySelector("#product-detail");
const cartDialog = document.querySelector("#cart-dialog");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartTotal = document.querySelector("#cart-total");
const cartCount = document.querySelector("#cart-count");
const openCartButton = document.querySelector("#open-cart");
const checkoutButton = document.querySelector("#checkout-button");
const cartStatus = document.querySelector("#cart-status");
const newsGrid = document.querySelector("#news-grid");
const newsDialog = document.querySelector("#news-dialog");
const newsDetail = document.querySelector("#news-detail");
const primaryNav = document.querySelector("#primary-nav");
const menuToggle = document.querySelector("#menu-toggle");
const toast = document.querySelector("#toast");

let selectedCategory = "all";
let selectedProductId = "";
let selectedSize = "";
let cart = readCart();
let toastTimer;

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
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(price);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
    if (!Array.isArray(stored)) throw new TypeError("Giỏ hàng cần là một danh sách.");
    return stored.filter((item) => {
      const product = products.find((candidate) => candidate.id === item?.id);
      return product && product.sizes.includes(item.size) && Number.isInteger(item.quantity) && item.quantity > 0;
    }).map((item) => ({ id: item.id, size: item.size, quantity: Math.min(item.quantity, 99) }));
  } catch (error) {
    console.error("Không thể đọc giỏ hàng demo trên thiết bị:", error);
    return [];
  }
}

function saveCart(nextCart) {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(nextCart));
  } catch (error) {
    console.error("Không thể lưu giỏ hàng demo trên thiết bị:", error);
    showToast("Không lưu được giỏ hàng. Hãy kiểm tra bộ nhớ trình duyệt rồi thử lại.");
    return false;
  }
  cart = nextCart;
  renderCart();
  return true;
}

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("vi");
  const visibleProducts = products.filter((product) => {
    const categoryMatches = selectedCategory === "all" || product.category === selectedCategory;
    const searchable = `${product.name} ${product.category} ${product.audience}`.toLocaleLowerCase("vi");
    return categoryMatches && searchable.includes(query);
  });

  if (priceSort.value === "price-asc") visibleProducts.sort((a, b) => a.price - b.price);
  if (priceSort.value === "price-desc") visibleProducts.sort((a, b) => b.price - a.price);

  productGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <button class="product-image-button" type="button" data-open-product="${escapeHtml(product.id)}" aria-label="Xem chi tiết ${escapeHtml(product.name)}">
        <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy">
        ${product.badge ? `<span class="product-badge">${escapeHtml(product.badge)}</span>` : ""}
        <span class="product-quick-view">Xem sản phẩm <span aria-hidden="true">↗</span></span>
      </button>
      <div class="product-info">
        <div class="product-meta"><span>${escapeHtml(product.category)}</span><span>${escapeHtml(product.audience)}</span></div>
        <h3>${escapeHtml(product.name)}</h3>
        <div class="product-price-row">
          <strong class="product-price">${formatPrice(product.price)}</strong>
          ${product.oldPrice ? `<del class="product-old-price">${formatPrice(product.oldPrice)}</del>` : ""}
        </div>
      </div>
    </article>
  `).join("");
  catalogSummary.textContent = `${visibleProducts.length} sản phẩm · Giá trong bản demo`;
  emptyState.hidden = visibleProducts.length > 0;
  productGrid.hidden = visibleProducts.length === 0;
}

function showProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    console.error(`Không tìm thấy sản phẩm demo: ${productId}`);
    return;
  }

  selectedProductId = product.id;
  selectedSize = product.sizes[0];
  productDetail.innerHTML = `
    <div class="product-detail">
      <div class="product-detail-image"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}"></div>
      <div class="product-detail-copy">
        <p class="eyebrow"><span></span> ${escapeHtml(product.category)} · ${escapeHtml(product.audience)}</p>
        <h2 id="product-dialog-title">${escapeHtml(product.name)}</h2>
        <p>${escapeHtml(product.description)}</p>
        <div class="detail-price">${formatPrice(product.price)}${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del>` : ""}</div>
        <p class="size-label">Chọn kích cỡ</p>
        <div class="size-list" role="group" aria-label="Chọn kích cỡ">
          ${product.sizes.map((size, index) => `<button class="size-option${index === 0 ? " is-selected" : ""}" type="button" data-select-size="${escapeHtml(size)}" aria-pressed="${index === 0}">${escapeHtml(size)}</button>`).join("")}
        </div>
        <button class="button button-dark detail-add" type="button" data-add-to-cart>Thêm vào giỏ <span aria-hidden="true">＋</span></button>
      </div>
    </div>
  `;
  productDialog.showModal();
}

function addToCart(productId, size) {
  const product = products.find((item) => item.id === productId);
  if (!product || !product.sizes.includes(size)) {
    showToast("Vui lòng chọn sản phẩm và kích cỡ hợp lệ.");
    return;
  }
  const existing = cart.find((item) => item.id === productId && item.size === size);
  const nextCart = existing
    ? cart.map((item) => item === existing ? { ...item, quantity: Math.min(item.quantity + 1, 99) } : item)
    : [...cart, { id: productId, size, quantity: 1 }];
  if (saveCart(nextCart)) {
    productDialog.close();
    showToast(`${product.name} · size ${size} đã được thêm vào giỏ demo.`);
  }
}

function renderCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  cartCount.textContent = String(quantity);
  openCartButton.setAttribute("aria-label", `Giỏ hàng, ${quantity} sản phẩm`);
  cartTotal.textContent = formatPrice(total);
  cartEmpty.hidden = cart.length > 0;
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((candidate) => candidate.id === item.id);
    if (!product) return "";
    const key = `${product.id}:${item.size}`;
    return `
      <article class="cart-item">
        <img class="cart-item-image" src="${escapeHtml(product.image)}" alt="" loading="lazy">
        <div>
          <h3>${escapeHtml(product.name)}</h3>
          <small>Kích cỡ: ${escapeHtml(item.size)}</small>
          <div class="cart-item-price">${formatPrice(product.price)}</div>
          <div class="cart-quantity" aria-label="Số lượng ${escapeHtml(product.name)}">
            <button type="button" data-cart-action="decrease" data-cart-key="${escapeHtml(key)}" aria-label="Giảm số lượng ${escapeHtml(product.name)}">−</button>
            <span>${item.quantity}</span>
            <button type="button" data-cart-action="increase" data-cart-key="${escapeHtml(key)}" aria-label="Tăng số lượng ${escapeHtml(product.name)}">＋</button>
          </div>
        </div>
        <button class="cart-remove" type="button" data-cart-action="remove" data-cart-key="${escapeHtml(key)}" aria-label="Xóa ${escapeHtml(product.name)} khỏi giỏ">×</button>
      </article>
    `;
  }).join("");
  checkoutButton.disabled = cart.length === 0;
  cartStatus.textContent = cart.length
    ? "Đây là giỏ hàng minh họa; chưa gửi đơn hoặc thanh toán."
    : "Thêm sản phẩm vào giỏ để xem lại lựa chọn demo.";
}

function renderNews() {
  newsGrid.innerHTML = news.map((article) => `
    <article class="news-card">
      <button class="news-image-button" type="button" data-open-news="${escapeHtml(article.id)}" aria-label="Đọc bài viết: ${escapeHtml(article.title)}">
        <img src="${escapeHtml(article.image)}" alt="" loading="lazy">
      </button>
      <div class="news-meta"><span>${escapeHtml(article.category)}</span><span>${escapeHtml(article.date)}</span></div>
      <h3>${escapeHtml(article.title)}</h3>
      <p>${escapeHtml(article.excerpt)}</p>
      <button class="text-link news-read" type="button" data-open-news="${escapeHtml(article.id)}">Đọc bài viết <span aria-hidden="true">→</span></button>
    </article>
  `).join("");
}

function showNews(articleId) {
  const article = news.find((item) => item.id === articleId);
  if (!article) {
    console.error(`Không tìm thấy bài viết demo: ${articleId}`);
    return;
  }
  newsDetail.innerHTML = `
    <img class="news-detail-image" src="${escapeHtml(article.image)}" alt="">
    <div class="news-detail-copy">
      <p class="eyebrow"><span></span> ${escapeHtml(article.category)} · ${escapeHtml(article.date)}</p>
      <h2 id="news-dialog-title">${escapeHtml(article.title)}</h2>
      <p>${escapeHtml(article.content)}</p>
    </div>
  `;
  newsDialog.showModal();
}

categoryFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  categoryFilters.querySelectorAll("[data-category]").forEach((chip) => {
    const active = chip === button;
    chip.classList.toggle("is-active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
});

searchInput.addEventListener("input", renderProducts);
priceSort.addEventListener("change", renderProducts);

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-product]");
  if (button) showProduct(button.dataset.openProduct);
});

productDetail.addEventListener("click", (event) => {
  const sizeButton = event.target.closest("[data-select-size]");
  if (sizeButton) {
    selectedSize = sizeButton.dataset.selectSize;
    productDetail.querySelectorAll("[data-select-size]").forEach((button) => {
      const selected = button === sizeButton;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    return;
  }
  if (event.target.closest("[data-add-to-cart]")) addToCart(selectedProductId, selectedSize);
});

document.querySelector("#open-cart").addEventListener("click", () => {
  renderCart();
  cartDialog.showModal();
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;
  const [productId, size] = button.dataset.cartKey.split(":");
  const item = cart.find((entry) => entry.id === productId && entry.size === size);
  if (!item) return;

  if (button.dataset.cartAction === "remove") {
    saveCart(cart.filter((entry) => entry !== item));
  } else {
    const change = button.dataset.cartAction === "increase" ? 1 : -1;
    const quantity = item.quantity + change;
    saveCart(quantity < 1
      ? cart.filter((entry) => entry !== item)
      : cart.map((entry) => entry === item ? { ...entry, quantity: Math.min(quantity, 99) } : entry));
  }
});

checkoutButton.addEventListener("click", () => {
  cartStatus.textContent = "Đây là bản demo: shop chưa nhận đơn và thanh toán chưa được kết nối.";
  showToast("Bản demo chưa kết nối đặt hàng hoặc thanh toán.");
});

newsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-news]");
  if (button) showNews(button.dataset.openNews);
});

document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

[productDialog, cartDialog, newsDialog].forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Mở menu" : "Đóng menu");
  primaryNav.classList.toggle("is-open", !expanded);
});

primaryNav.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  if (link.dataset.sortLink) {
    priceSort.value = link.dataset.sortLink;
    renderProducts();
  }
  primaryNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Mở menu");
});

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
renderProducts();
renderNews();
renderCart();
