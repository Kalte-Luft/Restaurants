// Global variables
let restaurantsData = [];
let cuisinesData = [];
let ratingsData = [];
let parkingData = [];
let hoursData = []; // Thêm hoursData

// Sample data (same as script.js)
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

const sampleParking = [
  { placeID: "135110", parking_lot: "yes" },
  { placeID: "134999", parking_lot: "none" },
];

// DOM Elements
const restaurantGrid = document.getElementById("restaurantGrid");
const loadingSpinner = document.getElementById("loadingSpinner");
const sortBy = document.getElementById("sortBy");
const restaurantCount = document.getElementById("restaurantCount");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  loadSampleData();
});

function initializeApp() {
  hideLoading();
}

function setupEventListeners() {
  sortBy.addEventListener("change", applySort);
  navToggle.addEventListener("click", toggleMobileNav);

  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = this.getAttribute("href");
    });
  });

  window.addEventListener("scroll", handleScroll);
}

function loadSampleData() {
  showLoading();
  setTimeout(() => {
    restaurantsData = sampleRestaurants;
    cuisinesData = sampleCuisines;
    ratingsData = sampleRatings;
    hoursData = sampleHours;
    parkingData = sampleParking;

    displayRestaurants(restaurantsData);
    hideLoading();
  }, 1000);
}

function displayRestaurants(restaurants) {
  restaurantGrid.innerHTML = "";

  if (restaurants.length === 0) {
    restaurantGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Không tìm thấy nhà hàng nào</h3>
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

  // Check if the restaurant is open
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
                  .map(
                    (cuisine) => `<span class="cuisine-tag">${cuisine}</span>`
                  )
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
  const now = new Date("2025-05-25T23:19:00+07:00");
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

function applySort() {
  let sortedRestaurants = [...restaurantsData];

  const sortValue = sortBy.value;
  sortedRestaurants.sort((a, b) => {
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
        return priceOrder[a.price] - priceOrder[b.price];
      default:
        return 0;
    }
  });

  displayRestaurants(sortedRestaurants);
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

function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    console.log("Reached bottom, load more restaurants...");
  }
}
