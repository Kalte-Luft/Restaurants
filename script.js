const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const restaurantGrid = document.getElementById("restaurantGrid");
const loadingSpinner = document.getElementById("loadingSpinner");
const cuisineFilter = document.getElementById("cuisineFilter");
const priceFilter = document.getElementById("priceFilter");
const alcoholFilter = document.getElementById("alcoholFilter");
const smokingFilter = document.getElementById("smokingFilter");
const parkingFilter = document.getElementById("parkingFilter");
const clearFilters = document.getElementById("clearFilters");
const sortBy = document.getElementById("sortBy");
const restaurantCount = document.getElementById("restaurantCount");
const totalUsers = document.getElementById("totalUsers");
const totalReviews = document.getElementById("totalReviews");
const totalRestaurants = document.getElementById("totalRestaurants");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
let restaurantsData = [];
let cuisinesData = [];
let usersData = [];
let ratingsData = [];
let hoursData = [];
let acceptsData = [];
let parkingData = [];
let userCuisineData = [];
let userPaymentData = [];
const sampleRestaurants = [
  {
    placeID: "135110",
    name: "El Rincon de San Francisco",
    address: "Universidad 169",
    city: "San Luis Potosi",
    latitude: 22.1497088,
    longitude: -100.9760928,
    alcohol: "Wine-Beer",
    smoking_area: "only at bar",
    dress_code: "informal",
    accessibility: "partially",
    price: "medium",
    Rambience: "familiar",
    franchise: "f",
    area: "open",
    other_services: "none",
  },
  {
    placeID: "134999",
    name: "Kiku Cuernavaca",
    address: "Revolucion",
    city: "Cuernavaca",
    latitude: 18.915421,
    longitude: -99.184871,
    alcohol: "No_Alcohol_Served",
    smoking_area: "none",
    dress_code: "informal",
    accessibility: "no_accessibility",
    price: "medium",
    Rambience: "familiar",
    franchise: "f",
    area: "closed",
    other_services: "none",
  },
  {
    placeID: "135111",
    name: "La Terraza del Sol",
    address: "Calle Sol 45",
    city: "Guadalajara",
    latitude: 20.659698,
    longitude: -103.349609,
    alcohol: "Full_Bar",
    smoking_area: "section",
    dress_code: "formal",
    accessibility: "yes",
    price: "high",
    Rambience: "friends",
    franchise: "t",
    area: "closed",
    other_services: "wifi",
  },
];
const sampleCuisines = [
  { placeID: "135110", Rcuisine: "Spanish" },
  { placeID: "134999", Rcuisine: "Japanese" },
];
const sampleRatings = [
  {
    userID: "U1077",
    placeID: "135110",
    rating: 2,
    food_rating: 2,
    service_rating: 2,
  },
  {
    userID: "U1068",
    placeID: "134999",
    rating: 1,
    food_rating: 1,
    service_rating: 2,
  },
];
const sampleHours = [
  { placeID: "135110", hours: "12:00-22:00", days: "Mon-Sun" },
  { placeID: "134999", hours: "11:00-21:00", days: "Mon-Sat" },
];
const sampleAccepts = [
  { placeID: "135110", Rpayment: "cash" },
  { placeID: "135110", Rpayment: "VISA" },
  { placeID: "134999", Rpayment: "cash" },
];
const sampleParking = [
  { placeID: "135110", parking_lot: "yes" },
  { placeID: "134999", parking_lot: "none" },
];
const sampleUsers = [
  {
    userID: "U1077",
    latitude: 22.1473922,
    longitude: -100.974845,
    smoker: "false",
    drink_level: "casual drinker",
    dress_preference: "informal",
    ambience: "family",
    transport: "car owner",
    marital_status: "single",
    hijos: "independent",
    birth_year: 1990,
    interest: "technology",
    personality: "hard-worker",
    religion: "none",
    activity: "student",
    color: "blue",
    weight: 70,
    budget: "medium",
    height: 1.75,
    age: 35,
  },
  {
    userID: "U1068",
    latitude: 18.922839,
    longitude: -99.234357,
    smoker: "true",
    drink_level: "social drinker",
    dress_preference: "formal",
    ambience: "friends",
    transport: "public",
    marital_status: "married",
    hijos: "kids",
    birth_year: 1985,
    interest: "eco-friendly",
    personality: "conformist",
    religion: "Catholic",
    activity: "professional",
    color: "green",
    weight: 65,
    budget: "high",
    height: 1.65,
    age: 40,
  },
];
const sampleUserCuisine = [
  { userID: "U1077", Rcuisine: "Spanish" },
  { userID: "U1068", Rcuisine: "Japanese" },
];
const sampleUserPayment = [
  { userID: "U1077", Upayment: "cash" },
  { userID: "U1068", Upayment: "VISA" },
];
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  loadSampleData();
});
function initializeApp() {
  hideLoading();
  setupSmoothScrolling();
  populateFilters();
}
function setupEventListeners() {
  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });
  cuisineFilter.addEventListener("change", applyFilters);
  priceFilter.addEventListener("change", applyFilters);
  alcoholFilter.addEventListener("change", applyFilters);
  smokingFilter.addEventListener("change", applyFilters);
  parkingFilter.addEventListener("change", applyFilters);
  sortBy.addEventListener("change", applyFilters);
  clearFilters.addEventListener("click", clearAllFilters);
  navToggle.addEventListener("click", toggleMobileNav);
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = this.getAttribute("href");
    });
  });
}
function loadSampleData() {
  showLoading();
  setTimeout(() => {
    restaurantsData = sampleRestaurants;
    cuisinesData = sampleCuisines;
    ratingsData = sampleRatings;
    hoursData = sampleHours;
    acceptsData = sampleAccepts;
    parkingData = sampleParking;
    usersData = sampleUsers;
    userCuisineData = sampleUserCuisine;
    userPaymentData = sampleUserPayment;
    displayRestaurants(restaurantsData);
    updateStats();
    populateFilters();
    generateActivityChart();
    hideLoading();
  }, 1000);
}

function fetchDataFromBackend() {
  // This function would be implemented to fetch actual CSV data
  // For now, we'll use sample data
  console.log("In a real app, this would fetch data from the backend");
}

function displayRestaurants(restaurants) {
  restaurantGrid.innerHTML = "";
  if (restaurants.length === 0) {
    restaurantGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-search"></i>
        <h3>Không tìm thấy nhà hàng nào</h3>
        <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    `;
    return;
  }
  restaurants.forEach((restaurant) => {
    const restaurantCard = createRestaurantCard(restaurant);
    restaurantGrid.appendChild(restaurantCard);
  });
  updateRestaurantCount(restaurants.length);
}
function createRestaurantCard(restaurant) {
  const card = document.createElement("a");
  card.className = "restaurant-card";
  card.href = `restaurant-detail.html?placeID=${restaurant.placeID}`;
  const cuisines = cuisinesData
    .filter((c) => c.placeID === restaurant.placeID)
    .map((c) => c.Rcuisine);
  const restaurantRatings = ratingsData.filter(
    (r) => r.placeID === restaurant.placeID
  );
  const avgRating = calculateAverageRating(restaurantRatings);
  const parking =
    parkingData.find((p) => p.placeID === restaurant.placeID)?.parking_lot ||
    "N/A";
  const hours = hoursData.find((h) => h.placeID === restaurant.placeID);
  const isOpen = hours ? checkIfOpen(hours.hours, hours.days) : false;
  card.innerHTML = `
    <div class="restaurant-header">
      <div class="restaurant-name">${restaurant.name}</div>
      <div class="restaurant-address">
        <i class="fas fa-map-marker-alt"></i>
        ${restaurant.address || "Địa chỉ không có sẵn"}, ${
    restaurant.city || ""
  }
      </div>
    </div>
    <div class="restaurant-info">
      <div class="restaurant-details">
        <div class="detail-item">
          <i class="fas fa-dollar-sign"></i>
          <span>${getPriceDisplay(restaurant.price)}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-wine-glass"></i>
          <span>${getAlcoholDisplay(restaurant.alcohol)}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-smoking"></i>
          <span>${getSmokingDisplay(restaurant.smoking_area)}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-parking"></i>
          <span>${getParkingDisplay(parking)}</span>
        </div>
      </div>
      <div class="cuisine-tags">
        ${cuisines
          .map((cuisine) => `<span class="cuisine-tag">${cuisine}</span>`)
          .join("")}
      </div>
      <div class="restaurant-rating">
        <div class="rating-stars">
          ${generateStars(avgRating)}
        </div>
        <span class="rating-number">${avgRating.toFixed(1)}</span>
        <span class="rating-count">(${restaurantRatings.length})</span>
        <span class="status ${isOpen ? "open" : "closed"}">
          ${isOpen ? "Đang mở" : "Đóng cửa"}
        </span>
      </div>
    </div>
  `;
  return card;
}
function checkIfOpen(hours, days) {
  const now = new Date();
  const currentDay = now.toLocaleString("en-US", { weekday: "short" });
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const daysArray = days.split(";").map((d) => d.trim());
  const dayMatch = daysArray.some((dayRange) => {
    if (dayRange.includes("-")) {
      const [startDay, endDay] = dayRange.split("-").map((d) => d.trim());
      const daysList = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const startIndex = daysList.indexOf(startDay);
      const endIndex = daysList.indexOf(endDay);
      const currentIndex = daysList.indexOf(currentDay);
      if (startIndex <= endIndex) {
        return currentIndex >= startIndex && currentIndex <= endIndex;
      } else {
        return currentIndex >= startIndex || currentIndex <= endIndex;
      }
    } else {
      return dayRange === currentDay;
    }
  });
  if (!dayMatch) return false;
  const [openTime, closeTime] = hours.split("-").map((time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  });
  return currentTime >= openTime && currentTime <= closeTime;
}
function calculateAverageRating(ratings) {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return sum / ratings.length;
}
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  let stars = "";
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  return stars;
}
function getPriceDisplay(price) {
  const priceMap = {
    low: "Rẻ ($)",
    medium: "Trung bình ($$)",
    high: "Cao ($$$)",
  };
  return priceMap[price] || "N/A";
}
function getAlcoholDisplay(alcohol) {
  const alcoholMap = {
    No_Alcohol_Served: "Không có rượu",
    "Wine-Beer": "Rượu vang/Bia",
    Full_Bar: "Đầy đủ",
  };
  return alcoholMap[alcohol] || "N/A";
}
function getSmokingDisplay(smoking) {
  const smokingMap = {
    none: "Không hút thuốc",
    section: "Khu vực riêng",
    permitted: "Được phép",
    "only at bar": "Chỉ tại quầy bar",
    "not permitted": "Không được phép",
  };
  return smokingMap[smoking] || "N/A";
}
function getParkingDisplay(parking) {
  const parkingMap = {
    yes: "Có",
    none: "Không",
    public: "Công cộng",
    "valet parking": "Valet",
  };
  return parkingMap[parking] || "N/A";
}
function performSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (!searchTerm) {
    applyFilters();
    return;
  }
  const filteredRestaurants = restaurantsData.filter((restaurant) => {
    const nameMatch = restaurant.name.toLowerCase().includes(searchTerm);
    const addressMatch =
      restaurant.address &&
      restaurant.address.toLowerCase().includes(searchTerm);
    const cityMatch =
      restaurant.city && restaurant.city.toLowerCase().includes(searchTerm);
    const cuisineMatch = cuisinesData
      .filter((c) => c.placeID === restaurant.placeID)
      .map((c) => c.Rcuisine.toLowerCase())
      .some((cuisine) => cuisine.includes(searchTerm));
    return nameMatch || addressMatch || cityMatch || cuisineMatch;
  });
  applyFilters(filteredRestaurants);
}
function applyFilters(baseRestaurants = restaurantsData) {
  let filteredRestaurants = [...baseRestaurants];
  const selectedCuisine = cuisineFilter.value;
  if (selectedCuisine) {
    const restaurantsWithCuisine = cuisinesData
      .filter((c) => c.Rcuisine === selectedCuisine)
      .map((c) => c.placeID);
    filteredRestaurants = filteredRestaurants.filter((r) =>
      restaurantsWithCuisine.includes(r.placeID)
    );
  }
  const selectedPrice = priceFilter.value;
  if (selectedPrice) {
    filteredRestaurants = filteredRestaurants.filter(
      (r) => r.price === selectedPrice
    );
  }
  const selectedAlcohol = alcoholFilter.value;
  if (selectedAlcohol) {
    filteredRestaurants = filteredRestaurants.filter(
      (r) => r.alcohol === selectedAlcohol
    );
  }
  const selectedSmoking = smokingFilter.value;
  if (selectedSmoking) {
    filteredRestaurants = filteredRestaurants.filter(
      (r) => r.smoking_area === selectedSmoking
    );
  }
  const selectedParking = parkingFilter.value;
  if (selectedParking) {
    filteredRestaurants = filteredRestaurants.filter(
      (r) =>
        parkingData.find((p) => p.placeID === r.placeID)?.parking_lot ===
        selectedParking
    );
  }
  const sortValue = sortBy.value;
  filteredRestaurants.sort((a, b) => {
    switch (sortValue) {
      case "name":
        return a.name.localeCompare(b.name);
      case "rating":
        const ratingA = calculateAverageRating(
          ratingsData.filter((r) => r.placeID === a.placeID)
        );
        const ratingB = calculateAverageRating(
          ratingsData.filter((r) => r.placeID === b.placeID)
        );
        return ratingB - ratingA;
      case "price":
        const priceOrder = { low: 1, medium: 2, high: 3 };
        return (priceOrder[a.price] || 0) - (priceOrder[b.price] || 0);
      default:
        return 0;
    }
  });
  displayRestaurants(filteredRestaurants);
}
function clearAllFilters() {
  cuisineFilter.value = "";
  priceFilter.value = "";
  alcoholFilter.value = "";
  smokingFilter.value = "";
  parkingFilter.value = "";
  sortBy.value = "name";
  searchInput.value = "";
  displayRestaurants(restaurantsData);
}
function populateFilters() {
  const uniqueCuisines = [
    ...new Set(cuisinesData.map((c) => c.Rcuisine)),
  ].sort();
  cuisineFilter.innerHTML = '<option value="">Tất cả</option>';
  uniqueCuisines.forEach((cuisine) => {
    const option = document.createElement("option");
    option.value = cuisine;
    option.textContent = cuisine;
    cuisineFilter.appendChild(option);
  });
  const uniqueParking = [
    ...new Set(parkingData.map((p) => p.parking_lot)),
  ].sort();
  parkingFilter.innerHTML = '<option value="">Tất cả</option>';
  uniqueParking.forEach((parking) => {
    const option = document.createElement("option");
    option.value = parking;
    option.textContent = getParkingDisplay(parking);
    parkingFilter.appendChild(option);
  });
}
function updateStats() {
  // Update user stats (you would get these from actual data)
  totalUsers.textContent = "138"; // From CSV data
  totalReviews.textContent = ratingsData.length.toString();
  totalRestaurants.textContent = restaurantsData.length.toString();
}
function generateActivityChart() {
  const activityCanvas = document.getElementById("activityChart");
  if (!activityCanvas) return;
  const activityCounts = {};
  usersData.forEach((user) => {
    const activity = user.activity || "Unknown";
    activityCounts[activity] = (activityCounts[activity] || 0) + 1;
  });
  const activityCtx = activityCanvas.getContext("2d");
  new Chart(activityCtx, {
    type: "bar",
    data: {
      labels: Object.keys(activityCounts),
      datasets: [
        {
          label: "Số lượng người dùng",
          data: Object.values(activityCounts),
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          borderColor: ["#333", "#333333", "#555", "#555555"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Số lượng người dùng",
          },
        },
        x: {
          title: {
            display: true,
            text: "Nghề nghiệp",
          },
        },
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Phân bố nghề nghiệp của người dùng",
        },
      },
    },
  });
}
function updateRestaurantCount(count) {
  restaurantCount.textContent = `${count} nhà hàng`;
}
function showLoading() {
  loadingSpinner.style.display = "block";
  restaurantGrid.style.display = "none";
}
function hideLoading() {
  loadingSpinner.style.display = "none";
  restaurantGrid.style.display = "grid";
}
function toggleMobileNav() {
  navMenu.classList.toggle("active");
}
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
}
