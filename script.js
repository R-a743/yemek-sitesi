
const themeToggle = document.getElementById("themeToggle");


function initTheme() {
    const savedTheme = localStorage.getItem("appTheme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (themeToggle) themeToggle.textContent = "☀️ Aydınlık Mod";
    } else {
        document.body.classList.remove("dark-mode");
        if (themeToggle) themeToggle.textContent = "🌙 Karanlık Mod";
    }
}

// Butona tıklandığında temayı değiştir ve kaydet
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark-mode");
        localStorage.setItem("appTheme", isDark ? "dark" : "light");
        themeToggle.textContent = isDark ? "☀️ Aydınlık Mod" : "🌙 Karanlık Mod";
    });
}


initTheme();

 
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const mealList = document.getElementById("mealList");
const mealDetail = document.getElementById("mealDetail");
const statusMessage = document.getElementById("statusMessage");
const sortSelect = document.getElementById("sortSelect");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const totalCount = document.getElementById("totalCount");
const favCount = document.getElementById("favCount");

//  DEĞİŞKENLER VE VERİLER 
let allMeals = [];
let visibleCount = 6;
let favorites = JSON.parse(localStorage.getItem("mealFavs")) || [];

const trToEn = {
    tatlı: "dessert", tatlılar: "dessert", tavuk: "chicken", 
    et: "beef", balık: "fish", makarna: "pasta", çorba: "soup"
};

// API VE LİSTELEME FONKSİYONLARI 
async function fetchMeals(searchTerm) {
    try {
        statusMessage.textContent = "✓ Yükleniyor...";
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`);
        const data = await response.json();
        const results = data.meals || [];
        statusMessage.textContent = results.length === 0 ? "! Sonuç Yok" : "✓ Veriler getirildi.";
        return results;
    } catch (error) {
        statusMessage.textContent = "⚠ API Hatası";
        return [];
    }
}

function renderMeals(meals) {
    mealList.innerHTML = "";
    const itemsToShow = meals.slice(0, visibleCount);

    itemsToShow.forEach(meal => {
        const { strMeal, strMealThumb, idMeal, strCategory, strArea } = meal;
        const isFav = favorites.includes(idMeal);
        const card = document.createElement("div");
        card.className = "meal-card"; 
        card.innerHTML = `
            <img src="${strMealThumb}" alt="${strMeal}">
            <div class="card-body">
                <h3>${strMeal}</h3>
                <div class="card-info">
                    <p><b>${strCategory}</b> | ${strArea}</p>
                </div>
                <div style="margin-top:10px;">
                    <button class="detailBtn" style="width:65%; padding:5px; cursor:pointer;">Detay</button>
                    <button class="favBtn" style="width:25%; padding:5px; cursor:pointer;">${isFav ? "⭐" : "☆"}</button>
                </div>
            </div>
        `;
        card.querySelector(".detailBtn").onclick = () => showMealDetail(meal);
        card.querySelector(".favBtn").onclick = () => toggleFavorite(idMeal);
        mealList.appendChild(card);
    });

    loadMoreBtn.style.display = (visibleCount < meals.length) ? "inline-block" : "none";
    updateStats();
}


function toggleFavorite(id) {
    favorites = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    localStorage.setItem("mealFavs", JSON.stringify(favorites));
    renderMeals(allMeals);
}

function updateStats() {
    if(favCount) favCount.textContent = favorites.length;
    if(totalCount) totalCount.textContent = allMeals.length;
}

function showMealDetail(meal) {
    const { strMeal, strInstructions, strMealThumb } = meal;
    mealDetail.innerHTML = `
        <div class="detail-box">
            <img src="${strMealThumb}" alt="${strMeal}" class="detail-img">
            <div class="detail-text">
                <h2>${strMeal}</h2>
                <br>
                <p><strong>Hazırlanışı:</strong> ${strInstructions.substring(0, 400)}...</p>
                <br>
                <button onclick="closeDetail()" style="padding:10px; cursor:pointer;">Geri / Kapat</button>
            </div>
        </div>
    `;
    document.getElementById("mealDetailArea").scrollIntoView({ behavior: 'smooth' });
}

window.closeDetail = function() {
    mealDetail.innerHTML = `<p style="text-align: center; color: #888;">Görüntülenecek bir detay yok.</p>`;
};

// --- 6. EVENT LISTENERS ---
if (searchBtn) {
    searchBtn.onclick = async () => {
        visibleCount = 6;
        const term = trToEn[searchInput.value.trim().toLowerCase()] || searchInput.value.trim();
        allMeals = await fetchMeals(term);
        renderMeals(allMeals);
    };
}

if (loadMoreBtn) {
    loadMoreBtn.onclick = () => {
        visibleCount += 6;
        renderMeals(allMeals);
    };
}

if (sortSelect) {
    sortSelect.onchange = (e) => {
        if (e.target.value === "az") allMeals.sort((a, b) => a.strMeal.localeCompare(b.strMeal));
        else if (e.target.value === "za") allMeals.sort((a, b) => b.strMeal.localeCompare(a.strMeal));
        renderMeals(allMeals);
    };
}

// Sayfa açıldığında istatistikleri güncelle
updateStats();