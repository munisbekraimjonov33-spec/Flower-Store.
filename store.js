// store.js - Gul do'koni uchun asosiy JavaScript logikasi

// Global o'zgaruvchilar
let products = [];      
let cart = [];          
let selectedProduct = null; 
let reviews = [];       
let currentUser = null; // Tizimga kirgan foydalanuvchi obyekti

// LocalStorage kalitlari
const CART_KEY = 'flowerStoreCart';
const USER_KEY = 'currentUser'; 
const REVIEWS_KEY = 'productReviews';
const RATING_PREFIX = 'productRating_';

// 🚨 MUHIM: Bu token va CHAT_ID ni o'zingiznikiga o'zgartiring!
const BOT_TOKEN = "7909031390:AAES4vyH19qUyK96o0Hp9TzRw1B-Bvkp6Jo"; 
const CHAT_ID = "702646100";                                      

// ---
// ==========================================================
// 🔔 CUSTOM XABARNOMA (Toast) FUNKSIYASI
// ==========================================================
function customXabarnoma(xabar, isError = false) {
    const xabarnomaEl = document.getElementById('custom-xabarnoma');
    if (!xabarnomaEl) return;

    const span = xabarnomaEl.querySelector('span');
    span.textContent = xabar;

    xabarnomaEl.style.backgroundColor = isError ? '#ff3366' : '#3cbe00'; // Xato bo'lsa qizil

    // Ko'rsatish
    xabarnomaEl.classList.add('show');
    
    // 3 soniyadan keyin yashirish
    setTimeout(() => {
        xabarnomaEl.classList.remove('show');
    }, 3000); 
}

// ---
// ==========================================================
// 💾 SAVATNI SAQLASH/YUKLASH FUNKSIYALARI (Persistence)
// ==========================================================
function loadCart() {
    const storedCart = localStorage.getItem(CART_KEY);
    cart = storedCart ? JSON.parse(storedCart) : [];
}

function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ---
// ==========================================================
// 👤 FOYDALANUVCHI (AUTH) FUNKSIYALARI
// ==========================================================
// LocalStorage'dan foydalanuvchini yuklash
function loadUser() {
    const storedUser = localStorage.getItem(USER_KEY);
    // Hozirda faqat ism va statusni saqlaymiz, haqiqiy parollarni emas!
    currentUser = storedUser ? JSON.parse(storedUser) : null;
    updateUserAuthUI();
}

// Foydalanuvchini saqlash (Kirish/Ro'yxatdan o'tish muvaffaqiyatli bo'lsa)
function saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    currentUser = user;
    updateUserAuthUI();
}

// Foydalanuvchi holatini yangilash (UI da)
function updateUserAuthUI() {
    const authBtn = document.getElementById("userAuthBtn");
    
    if (currentUser) {
        // Tizimga kirgan holat
        const userName = currentUser.name || 'User';
        authBtn.innerHTML = `👤 ${userName.split(' ')[0]}`; // Birinchi ismni ko'rsatish
        authBtn.title = "Tizimdan chiqish";
        authBtn.onclick = chiqish;
    } else {
        // Tizimga kirmagan holat
        authBtn.innerHTML = `👤`;
        authBtn.title = "Ro'yxatdan o'tish / Kirish";
        authBtn.onclick = openAuthModal;
    }
}

// Chiqish
function chiqish() {
    localStorage.removeItem(USER_KEY);
    currentUser = null;
    updateUserAuthUI();
    customXabarnoma('Xayr, tizimdan chiqdingiz.');
}

// Kirish/Ro'yxatdan o'tish modalini ochish
function openAuthModal() {
    document.getElementById("authModal").classList.add("active");
    // Forma rejimini "Kirish" holatiga qaytarish
    document.getElementById("authTitle").textContent = "Tizimga Kirish";
    document.getElementById("authSubmitBtn").textContent = "Kirish";
    document.getElementById("authName").style.display = 'none';
    document.getElementById("toggleAuthText").textContent = "Akkauntingiz yo'qmi?";
    document.getElementById("toggleAuthMode").textContent = "Ro'yxatdan o'tish";
    document.getElementById("authMessage").textContent = ""; 
    document.getElementById("authForm").reset(); 
}

// Ro'yxatdan o'tish/Kirish modalini yopish
function closeAuthModal() {
    document.getElementById("authModal").classList.remove("active");
}

// Forma rejimini almashtirish (Kirish <-> Ro'yxatdan o'tish)
function toggleAuthMode(e) {
    e.preventDefault();
    const isRegisterMode = document.getElementById("authName").style.display !== 'none';
    
    if (isRegisterMode) {
        // Kirish rejimiga o'tish
        document.getElementById("authTitle").textContent = "Tizimga Kirish";
        document.getElementById("authSubmitBtn").textContent = "Kirish";
        document.getElementById("authName").style.display = 'none';
        document.getElementById("toggleAuthText").textContent = "Akkauntingiz yo'qmi?";
        document.getElementById("toggleAuthMode").textContent = "Ro'yxatdan o'tish";
    } else {
        // Ro'yxatdan o'tish rejimiga o'tish
        document.getElementById("authTitle").textContent = "Ro'yxatdan O'tish";
        document.getElementById("authSubmitBtn").textContent = "Ro'yxatdan O'tish";
        document.getElementById("authName").style.display = 'block';
        document.getElementById("toggleAuthText").textContent = "Akkauntingiz bormi?";
        document.getElementById("toggleAuthMode").textContent = "Tizimga kirish";
    }
    document.getElementById("authMessage").textContent = ""; 
    document.getElementById("authForm").reset(); 
}

// Kirish/Ro'yxatdan o'tish formasini boshqarish
function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value.trim();
    const nameInput = document.getElementById("authName");
    const messageEl = document.getElementById("authMessage");
    const isRegisterMode = nameInput.style.display !== 'none';

    messageEl.textContent = "";

    if (isRegisterMode) {
        // --- Ro'yxatdan O'tish Mantig'i ---
        const name = nameInput.value.trim();
        if (name.length < 3) {
            messageEl.textContent = "Ismingiz kamida 3 ta belgidan iborat bo'lishi kerak.";
            return;
        }
        
        // Haqiqiy loyihada bu yerda ma'lumotlar bazasiga yoziladi.
        // Hozirgi kunda shartli ro'yxatdan o'tish.
        const newUser = { email, password, name, status: 'loggedin' };
        saveUser(newUser);
        closeAuthModal();
        customXabarnoma(`✅ Rahmat, ${name}! Muvaffaqiyatli ro'yxatdan o'tdingiz.`);
        
    } else {
        // --- Tizimga Kirish Mantig'i ---
        // Haqiqiy loyihada ma'lumotlar bazasidan tekshiriladi.
        // Hozirda shartli kirish (Parol: 123456)
        
        if (email && password === '123456') {
            const tempUser = { email, name: email.split('@')[0], status: 'loggedin' };
            saveUser(tempUser);
            closeAuthModal();
            customXabarnoma(`Hush kelibsiz, ${tempUser.name}!`);
        } else {
            messageEl.textContent = "Email yoki parol noto'g'ri (Demo parol: 123456)";
        }
    }
}

// ---
// ==========================================================
// 🌙 DARK/LIGHT MODE FUNKSIYASI
// ==========================================================
// Sayt yuklanganda oxirgi tanlangan rejimni (dark/light) qo'llaydi
function loadInitialMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'; // Saqlangan rejimni tekshirish
    const body = document.body;
    const modeToggleBtn = document.getElementById("modeToggleBtn");
    
    if (isDarkMode) {
        body.classList.add('dark-mode');
        modeToggleBtn.innerHTML = '🌙'; // Tugma belgisini oyga o'zgartirish
    } else {
        body.classList.remove('dark-mode');
        modeToggleBtn.innerHTML = '☀️'; // Tugma belgisini quyoshga o'zgartirish
    }
}

// Rejimni almashtirish (Dark <-> Light) va uni saqlash
function toggleDarkMode() {
    const body = document.body;
    const modeToggleBtn = document.getElementById("modeToggleBtn");
    
    body.classList.toggle('dark-mode'); // CSS klassini almashtirish
    
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode); // Yangi rejimni saqlash

    modeToggleBtn.innerHTML = isDarkMode ? '🌙' : '☀️';
}

// ---
// ==========================================================
// 📦 MAHSULOTLARNI YUKLASH
// ==========================================================
// 'products.json' faylidan mahsulotlar ro'yxatini asinxron yuklaydi
async function loadProducts() {
    try {
        const response = await fetch('products.json'); 
        if (!response.ok) throw new Error("JSON fayl topilmadi");
        products = await response.json(); 
        
        loadRatings(); 
        loadReviews(); 
        populateFlowerSelect(); 
        displayProducts(); 
        displayReviews(false); 
    } catch (err) {
        console.error(err);
        document.getElementById("productsContainer").innerHTML = "<p>Xatolik: Mahsulotlar yuklanmadi</p>";
    }
}

// 🌸 Gul nomlarini filtrlash uchun select qutisiga (tanlash) joylash
function populateFlowerSelect() {
    const select = document.getElementById("selectFlowerName");
    const flowerNames = [...new Set(products.map(p => p.name))].sort();
    
    select.innerHTML = '<option value="">— Barcha gullar —</option>';
    flowerNames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// ---
// ==========================================================
// ⭐️ YULDUZCHA BILAN BAHOLASH
// ==========================================================
// LocalStorage dan har bir mahsulot uchun avvalgi baholarni yuklaydi
function loadRatings() {
    products.forEach(p => {
        const r = localStorage.getItem(RATING_PREFIX + p.id);
        p.rating = r ? parseInt(r) : 0; 
    });
}

// Yangi bahoni LocalStorage ga saqlaydi va modal oynani ochadi
function saveRating(id, rating) {
    localStorage.setItem(RATING_PREFIX + id, rating);
    const product = products.find(p => p.id === id);
    if (product) product.rating = rating;
    updateProductCardRating(id, rating); 
    openReviewModal(id, rating); 
}

// Mahsulot kartasidagi yulduzcha ko'rinishini yangilaydi
function updateProductCardRating(id, newRating) {
    const container = document.querySelector(`.rating[data-product-id="${id}"]`);
    if (container) {
        container.querySelectorAll('i').forEach((star, i) => {
            if (i < newRating) star.classList.add('rated');
            else star.classList.remove('rated');
        });
    }
}

// Yulduzchani bosish hodisasini boshqarish
function handleRatingClick(e) {
    if (!e.target.classList.contains('fa-star')) return; 
    const rating = parseInt(e.target.dataset.value); 
    const productId = parseInt(e.target.closest('.rating').dataset.productId);
    saveRating(productId, rating);
}

// ---
// ==========================================================
// 💬 SHARHLAR (REVIEW)
// ==========================================================
// LocalStorage dan sharhlarni yuklaydi
function loadReviews() {
    const stored = localStorage.getItem(REVIEWS_KEY);
    reviews = stored ? JSON.parse(stored) : [];
}

// Yangi sharhni massivga qo'shadi va LocalStorage ga saqlaydi
function saveReview(review) {
    reviews.push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    displayReviews(); 
}

// Sharh qoldirish modalini ochadi
function openReviewModal(id, rating) {
    const p = products.find(p => p.id === id);
    if (!p) return;

    document.getElementById("reviewProductName").textContent = `Sharhingiz: ${p.name}`;
    document.getElementById("reviewProductId").value = id;

    const stars = document.getElementById("modalReviewRating");
    stars.innerHTML = "";
    for (let i = 0; i < rating; i++) stars.innerHTML += '<i class="fa-solid fa-star rated"></i>';

    document.getElementById("reviewUserName").value = localStorage.getItem('lastUserName') || (currentUser ? currentUser.name : '');
    document.getElementById("reviewComment").value = '';
    document.getElementById("reviewModal").classList.add("active");
}

// Sharh qoldirish modalini yopadi
function closeReviewModal() {
    document.getElementById("reviewModal").classList.remove("active");
}

// Sharhlar ro'yxatini sahifada ko'rsatadi
function displayReviews(showAll = false) {
    const container = document.getElementById("reviewsContainer");
    container.innerHTML = "";

    if (reviews.length === 0) {
        container.innerHTML = "<p style='text-align:center;color:#777;'>Hali sharhlar yo'q.</p>";
        return;
    }

    const reversed = reviews.slice().reverse(); 
    const toShow = showAll ? reversed : reversed.slice(0, 10); 

    toShow.forEach(r => {
        const p = products.find(p => p.id === r.productId);
        if (!p) return;

        let stars = '';
        for (let i = 0; i < r.rating; i++) stars += '<i class="fa-solid fa-star rated"></i>';

        const div = document.createElement('div');
        div.classList.add('review-card');
        div.innerHTML = `
            <h4>${p.name}</h4>
            <div class="rating user-rating">${stars}</div>
            <p><b>${r.userName}</b> • <small>${new Date(r.date).toLocaleDateString()}</small></p>
            <p>${r.comment || "<i>Sharh yozilmagan</i>"}</p>
        `;
        container.appendChild(div);
    });

    const btnDiv = document.createElement('div');
    btnDiv.style.textAlign = 'center';
    btnDiv.style.marginTop = '20px';

    const btn = document.createElement('button');
    btn.textContent = showAll ? "🔙 Eng yangi 10 tasini ko‘rsatish" : `📖 Barcha ${reviews.length} ta sharhni ko‘rish`;
    
    btn.addEventListener('click', () => displayReviews(!showAll)); 
    container.appendChild(btnDiv);
    btnDiv.appendChild(btn);
}

// Sharh formasini jo'natish hodisasini boshqarish
function handleReviewSubmit(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById("reviewProductId").value);
    const name = document.getElementById("reviewUserName").value.trim();
    const comment = document.getElementById("reviewComment").value.trim();
    const p = products.find(p => p.id === id);
    if (!p) return;

    const rating = p.rating; 

    const newReview = {
        productId: id,
        userName: name,
        rating,
        comment,
        date: new Date().toISOString()
    };

    saveReview(newReview);
    localStorage.setItem('lastUserName', name); 
    closeReviewModal();
    customXabarnoma("✅ Sharhingiz saqlandi!"); // customXabarnoma bilan almashtirildi
}

// ---
// ==========================================================
// 🛒 MAHSULOTLARNI CHIQARISH / QIDIRUV / FILTRLASH
// ==========================================================
function displayProducts(filtered = products) {
    const container = document.getElementById("productsContainer");
    container.innerHTML = "";

    if (filtered.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>Mos mahsulot topilmadi.</p>";
        return;
    }

    filtered.forEach(p => {
        const minPrice = p.variants.reduce((m, v) => Math.min(m, v.price), Infinity);
        
        let ratingHtml = `<div class="rating" data-product-id="${p.id}">`;
        for (let i = 1; i <= 5; i++) {
            ratingHtml += `<i class="fa-solid fa-star ${i <= (p.rating || 0) ? 'rated' : ''}" data-value="${i}"></i>`;
        }
        ratingHtml += "</div>";

        const div = document.createElement('div');
        div.classList.add('product');
        div.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            ${ratingHtml}
            <p>${minPrice.toLocaleString()} so'm dan</p>
            <button class="select-options-btn" data-id="${p.id}">Tanlash</button>
        `;
        container.appendChild(div);
    });
}

function searchProducts() {
    const selectName = document.getElementById("selectFlowerName").value.trim();
    const nameTerm = document.getElementById("searchNameInput").value.toLowerCase().trim();
    const priceTerm = document.getElementById("searchPriceInput").value.trim();
    const maxPrice = priceTerm === "" ? Infinity : parseInt(priceTerm) || Infinity;

    const filtered = products.filter(p => {
        const matchSelect = selectName === "" || p.name === selectName;
        const matchName = p.name.toLowerCase().includes(nameTerm);
        const minPrice = p.variants.reduce((m, v) => Math.min(m, v.price), Infinity);
        const matchPrice = minPrice <= maxPrice;
        
        return matchSelect && matchName && matchPrice;
    });

    displayProducts(filtered); 
}

// ---
// ==========================================================
// 🛍 SAVAT FUNKSIONALI
// ==========================================================
function updateCartBadge() {
    const badge = document.getElementById("cartCountBadge");
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none'; 
}

function openProductModal(id) {
    selectedProduct = products.find(p => p.id === id); 
    if (!selectedProduct) return;

    document.getElementById("modalProductName").textContent = selectedProduct.name;
    document.getElementById("modalProductImage").src = selectedProduct.image;

    const select = document.getElementById("sizeSelect");
    select.innerHTML = "";
    selectedProduct.variants.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.size;
        opt.textContent = `${v.size} - ${v.price.toLocaleString()} so'm`;
        opt.dataset.price = v.price; 
        select.appendChild(opt);
    });

    document.getElementById("quantityInput").value = 1; 
    updateModalPrice(); 
    document.getElementById("productModal").classList.add("active");
}

function closeProductModal() {
    document.getElementById("productModal").classList.remove("active");
}

function updateModalPrice() {
    const select = document.getElementById("sizeSelect");
    const input = document.getElementById("quantityInput");
    const price = Number(select.options[select.selectedIndex].dataset.price);
    const qty = parseInt(input.value);
    document.getElementById("currentProductPrice").textContent = (price * qty).toLocaleString() + " so'm";
}

// Mahsulotni savatga qo'shish
function addToCart(id, size, qty, price) {
    const p = products.find(p => p.id === id);
    if (!p) return;
    const uid = `${id}-${size}`; 
    const found = cart.find(i => i.uniqueId === uid);

    if (found) found.quantity += qty; 
    else cart.push({ uniqueId: uid, id, name: `${p.name} (${size})`, price, quantity: qty }); 

    saveCart(); 
    displayCart();
    updateCartBadge(); 
    closeProductModal();
    customXabarnoma(`✅ ${p.name} savatga qo‘shildi`); // customXabarnoma bilan almashtirildi
}

function displayCart() {
    const container = document.getElementById("cartItems");
    container.innerHTML = "";
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    updateCartBadge(); 
    
    if (cart.length === 0) {
        container.innerHTML = "<p>Savat bo‘sh</p>";
        document.getElementById("totalPrice").textContent = "0 so'm";
        return;
    }

    cart.forEach(i => {
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
            <span>${i.name} (x${i.quantity})</span>
            <span>${(i.price * i.quantity).toLocaleString()} so'm</span>
            <button class="remove-btn" data-id="${i.uniqueId}">O‘chirish</button>
        `;
        container.appendChild(div);
    });
    document.getElementById("totalPrice").textContent = total.toLocaleString() + " so'm";
}

function removeFromCart(uid) {
    cart = cart.filter(i => i.uniqueId !== uid);
    saveCart(); 
    displayCart();
    updateCartBadge(); 
    customXabarnoma("🗑 Mahsulot o'chirildi", true); // O'chirish xabari
}

function openCart() {
    document.getElementById("cartModal").classList.add("active");
}

function closeCart() {
    document.getElementById("cartModal").classList.remove("active");
    document.getElementById("xabar").textContent = ""; 
}

// ---
// ==========================================================
// ✉️ TELEGRAMGA BUYURTMA YUBORISH
// ==========================================================
function sendOrderToTelegram(xabar) {
    document.getElementById("xabar").textContent = "Yuborilmoqda...";
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: xabar, parse_mode: "HTML" })
    })
    .then(r => r.json())
    .then(d => {
        if (d.ok) {
            document.getElementById("xabar").textContent = "✅ Buyurtma yuborildi!";
            // Muvaffaqiyatli yuborilgach, savatni tozalash
            cart = [];
            saveCart(); 
            displayCart();
            updateCartBadge(); 
            customXabarnoma("🎉 Buyurtmangiz muvaffaqiyatli qabul qilindi!"); // Muvaffaqiyat xabari
        } else {
            document.getElementById("xabar").textContent = "❌ Xatolik yuz berdi.";
            customXabarnoma("❌ Buyurtmani yuborishda xatolik yuz berdi.", true);
        }
    })
    .catch(() => {
        document.getElementById("xabar").textContent = "❌ Internet xatosi.";
        customXabarnoma("❌ Internetga ulanishda xato.", true);
    });
}

// ---
// ==========================================================
// 🧩 EVENTLAR (Sayt yuklanganda ishga tushadi)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    // Boshlang'ich funksiyalarni ishga tushirish
    loadInitialMode();
    loadUser(); // Foydalanuvchini yuklash
    loadProducts();
    
    loadCart(); 
    displayCart();
    updateCartBadge(); 

    // Filtrlash eventlari
    document.getElementById("selectFlowerName").addEventListener("change", searchProducts);
    document.getElementById("searchNameInput").addEventListener("input", searchProducts);
    document.getElementById("searchPriceInput").addEventListener("input", searchProducts);

    // Rejim almashtirish
    document.getElementById("modeToggleBtn").addEventListener("click", toggleDarkMode);

    // Mahsulotlar konteyneridagi tugmalarni va yulduzchalarni boshqarish
    document.getElementById("productsContainer").addEventListener("click", e => {
        if (e.target.classList.contains("select-options-btn")) {
            openProductModal(parseInt(e.target.dataset.id)); 
        } else if (e.target.classList.contains("fa-star")) {
            handleRatingClick(e); 
        }
    });

    // Savat ichidagi O'chirish tugmasini boshqarish
    document.getElementById("cartItems").addEventListener("click", e => {
        if (e.target.classList.contains("remove-btn")) {
            removeFromCart(e.target.dataset.id);
        }
    });

    // Modal ichida narxni avtomatik yangilash
    document.getElementById("sizeSelect").addEventListener("change", updateModalPrice);
    document.getElementById("quantityInput").addEventListener("input", updateModalPrice);
    
    // Modal ochish/yopish tugmalari
    document.getElementById("openCartBtn").addEventListener("click", openCart);
    document.getElementById("closeCartBtn").addEventListener("click", closeCart);
    document.getElementById("closeProductBtn").addEventListener("click", closeProductModal);
    document.getElementById("closeReviewBtn").addEventListener("click", closeReviewModal);

    // Sharh formasini jo'natish
    document.getElementById("reviewForm").addEventListener("submit", handleReviewSubmit);

    // ---------------------------------------------
    // 👤 YANGI: AUTH EVENTLARI
    // ---------------------------------------------
    document.getElementById("userAuthBtn").addEventListener("click", () => {
        // Funksiya chaqiruvi loadUser() ichida updateUserAuthUI() orqali belgilangan.
        // openAuthModal yoki chiqish() ishga tushadi.
    });
    document.getElementById("closeAuthBtn").addEventListener("click", closeAuthModal);
    document.getElementById("toggleAuthMode").addEventListener("click", toggleAuthMode);
    document.getElementById("authForm").addEventListener("submit", handleAuthSubmit);
    // ---------------------------------------------
    
    // Modalning tashqarisini bosganda yopish
    window.addEventListener("click", e => {
        if (e.target.id === "cartModal") closeCart();
        if (e.target.id === "productModal") closeProductModal();
        if (e.target.id === "reviewModal") closeReviewModal();
        if (e.target.id === "authModal") closeAuthModal(); // YANGI: Auth modalni yopish
    });

    // Mahsulotni savatga qo'shish formasini boshqarish
    document.getElementById("productOptionsForm").addEventListener("submit", e => {
        e.preventDefault();
        const select = document.getElementById("sizeSelect");
        const size = select.value;
        const qty = parseInt(document.getElementById("quantityInput").value);
        const price = Number(select.options[select.selectedIndex].dataset.price);
        if (qty > 0) addToCart(selectedProduct.id, size, qty, price);
    });

    // Buyurtma berish formasini boshqarish
    document.getElementById("orderForm").addEventListener("submit", e => {
        e.preventDefault();
        if (cart.length === 0) {
            document.getElementById("xabar").textContent = "Savat bo‘sh!";
            customXabarnoma("Savatingiz bo'sh!", true); // Xabarnoma
            return;
        }

        const ism = document.getElementById("ism").value.trim();
        const raqam = document.getElementById("raqam").value.trim();
        const manzil = document.getElementById("manzil").value.trim();
        const sharh = document.getElementById("sharh").value.trim();
        const xabarMatni = document.getElementById("xabar_matni").value.trim();

        let xabar = `🛍 <b>Yangi buyurtma!</b>\n👤 <b>${ism}</b>\n📞 ${raqam}\n📍 ${manzil}\n\n`;

        if (sharh) xabar += `📝 Izoh: ${sharh}\n`;
        if (xabarMatni) xabar += `💐 Gul xabari: "${xabarMatni}"\n\n`;

        xabar += "📦 Mahsulotlar:\n";
        cart.forEach(i => {
            xabar += `• ${i.name} (x${i.quantity}) - ${(i.price * i.quantity).toLocaleString()} so'm\n`;
        });

        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        xabar += `\n💰 Umumiy: <b>${total.toLocaleString()} so'm</b>`;

        sendOrderToTelegram(xabar); 
    });
});
