const userInfo = document.getElementById("userInfo");
const ratingsGrid = document.getElementById("ratingsGrid");
const recommendationsGrid = document.getElementById("recommendationsGrid");
const loadingSpinner = document.getElementById("loadingSpinner");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
let usersData = [];
let userCuisineData = [];
let userPaymentData = [];
let ratingsData = [];
let restaurantsData = [];
let cuisinesData = [];
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
];
const sampleCuisines = [
  { placeID: "135110", Rcuisine: "Spanish" },
  { placeID: "134999", Rcuisine: "Japanese" },
];
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
  loadSampleData();
});
function initializeApp() {
  hideLoading();
}
function setupEventListeners() {
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
    usersData = sampleUsers;
    userCuisineData = sampleUserCuisine;
    userPaymentData = sampleUserPayment;
    ratingsData = sampleRatings;
    restaurantsData = sampleRestaurants;
    cuisinesData = sampleCuisines;
    displayUserDetail();
    hideLoading();
  }, 1000);
}
function displayUserDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const userID = urlParams.get("userID");
  const user = usersData.find((u) => u.userID === userID);
  if (!user) {
    userInfo.innerHTML = `
      <div class="no-results">
        <i class="fas fa-user"></i>
        <h3>Không tìm thấy người dùng</h3>
        <p>Kiểm tra ID người dùng hoặc thử lại</p>
      </div>
    `;
    return;
  }
  const cuisines = userCuisineData
    .filter((c) => c.userID === userID)
    .map((c) => c.Rcuisine);
  const payments = userPaymentData
    .filter((p) => p.userID === userID)
    .map((p) => p.Upayment);
  userInfo.innerHTML = `
    <div class="user-header">
      <div class="user-avatar">
        <i class="fas fa-user-circle"></i>
      </div>
      <div>
        <div class="user-name">Người dùng ${user.userID}</div>
        <div class="user-email">N/A</div>
      </div>
    </div>
    <div class="user-info">
      <div class="user-details">
        <div class="user-detail-item">
          <i class="fas fa-utensils"></i>
          <span>Loại Ẩm Thực: ${cuisines.join(", ") || "N/A"}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-credit-card"></i>
          <span>Phương thức thanh toán: ${payments.join(", ") || "N/A"}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-smoking"></i>
          <span>Hút thuốc: ${user.smoker === "true" ? "Có" : "Không"}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-wine-glass"></i>
          <span>Mức độ uống: ${getDrinkLevelDisplay(user.drink_level)}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-tshirt"></i>
          <span>Trang phục: ${getDressPreferenceDisplay(
            user.dress_preference
          )}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-dollar-sign"></i>
          <span>Ngân sách: ${getBudgetDisplay(user.budget)}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-map-pin"></i>
          <span>Tọa độ: (${user.latitude}, ${user.longitude})</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-home"></i>
          <span>Không gian: ${getAmbienceDisplay(user.ambience)}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-car"></i>
          <span>Phương tiện: ${getTransportDisplay(user.transport)}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-ring"></i>
          <span>Tình trạng hôn nhân: ${getMaritalStatusDisplay(
            user.marital_status
          )}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-child"></i>
          <span>Con cái: ${getChildrenDisplay(user.hijos)}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-birthday-cake"></i>
          <span>Năm sinh: ${user.birth_year || "N/A"} (Tuổi: ${
    user.age || "N/A"
  })</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-heart"></i>
          <span>Sở thích: ${getInterestDisplay(user.interest)}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-user-tie"></i>
          <span>Tính cách: ${getPersonalityDisplay(user.personality)}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-pray"></i>
          <span>Tôn giáo: ${getReligionDisplay(user.religion)}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-briefcase"></i>
          <span>Hoạt động: ${getActivityDisplay(user.activity)}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-palette"></i>
          <span>Màu sắc yêu thích: ${user.color || "N/A"}</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-weight"></i>
          <span>Cân nặng: ${user.weight || "N/A"} kg</span>
        </div>
        <div class="user-detail-item">
          <i class="fas fa-ruler-vertical"></i>
          <span>Chiều cao: ${user.height || "N/A"} m</span>
        </div>
      </div>
    </div>
  `;
  displayUserRatings(userID);
  displayRecommendations(user);
}
function displayUserRatings(userID) {
  ratingsGrid.innerHTML = "";
  const userRatings = ratingsData.filter((r) => r.userID === userID);
  if (userRatings.length === 0) {
    ratingsGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-star"></i>
        <h3>Chưa có đánh giá</h3>
        <p>Người dùng này chưa đánh giá nhà hàng nào.</p>
      </div>
    `;
    return;
  }
  userRatings.forEach((rating) => {
    const restaurant = restaurantsData.find(
      (r) => r.placeID === rating.placeID
    );
    if (restaurant) {
      const ratingCard = document.createElement("div");
      ratingCard.className = "rating-card";
      ratingCard.innerHTML = `
        <div class="rating-header">
          <a href="restaurant-detail.html?placeID=${
            restaurant.placeID
          }" class="restaurant-name">${restaurant.name}</a>
          <div class="rating-stars">${generateStars(rating.rating)}</div>
        </div>
        <div class="rating-details">
          <p><strong>Đánh giá tổng: </strong>${rating.rating}/2</p>
          <p><strong>Đồ ăn: </strong>${rating.food_rating}/2</p>
          <p><strong>Dịch vụ: </strong>${rating.service_rating}/2</p>
        </div>
      `;
      ratingsGrid.appendChild(ratingCard);
    }
  });
}
function displayRecommendations(user) {
  recommendationsGrid.innerHTML = "";
  const userCuisines = userCuisineData
    .filter((c) => c.userID === user.userID)
    .map((c) => c.Rcuisine);
  let recommendedRestaurants = restaurantsData.filter((restaurant) => {
    const restaurantCuisines = cuisinesData
      .filter((c) => c.placeID === restaurant.placeID)
      .map((c) => c.Rcuisine);
    const cuisineMatch = userCuisines.some((cuisine) =>
      restaurantCuisines.includes(cuisine)
    );
    const budgetMatch = restaurant.price === user.budget;
    return cuisineMatch || budgetMatch;
  });
  if (recommendedRestaurants.length === 0) {
    recommendationsGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-utensils"></i>
        <h3>Chưa có gợi ý</h3>
        <p>Không tìm thấy nhà hàng phù hợp với sở thích của người dùng.</p>
      </div>
    `;
    return;
  }
  recommendedRestaurants = recommendedRestaurants.slice(0, 3);
  recommendedRestaurants.forEach((restaurant) => {
    const restaurantCard = createRestaurantCard(restaurant);
    recommendationsGrid.appendChild(restaurantCard);
  });
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
      </div>
    </div>
  `;
  return card;
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
function getDrinkLevelDisplay(drinkLevel) {
  const drinkLevelMap = {
    "casual drinker": "Bình thường",
    "social drinker": "Xã giao",
    abstemious: "Kiêng rượu",
    "?": "Không xác định",
  };
  return drinkLevelMap[drinkLevel] || "N/A";
}
function getDressPreferenceDisplay(dressPreference) {
  const displayMap = {
    informal: "Bình thường",
    casual: "Thoải mái",
    formal: "Trang trọng",
    "no preference": "Không có sở thích",
    "?": "Không xác định",
  };
  return displayMap[dressPreference] || "N/A";
}
function getBudgetDisplay(budget) {
  const budgetMap = {
    low: "Rẻ ($)",
    medium: "Trung bình ($$)",
    high: "Cao ($$$)",
    "?": "Không xác định",
  };
  return budgetMap[budget] || "N/A";
}
function getAmbienceDisplay(ambience) {
  const displayMap = {
    family: "Gia đình",
    friends: "Bạn bè",
    solitary: "Một mình",
    "?": "Không xác định",
  };
  return displayMap[ambience] || "N/A";
}
function getTransportDisplay(transport) {
  const displayMap = {
    "on foot": "Đi bộ",
    public: "Phương tiện công cộng",
    "car owner": "Có xe hơi",
    "?": "Không xác định",
  };
  return displayMap[transport] || "N/A";
}
function getMaritalStatusDisplay(status) {
  const displayMap = {
    single: "Độc thân",
    married: "Đã kết hôn",
    widow: "Góa",
    "?": "Không xác định",
  };
  return displayMap[status] || "N/A";
}
function getChildrenDisplay(hijos) {
  const displayMap = {
    independent: "Độc lập",
    kids: "Có con",
    dependent: "Phụ thuộc",
    "?": "Không xác định",
  };
  return displayMap[hijos] || "N/A";
}
function getInterestDisplay(interest) {
  const displayMap = {
    none: "Không có",
    technology: "Công nghệ",
    "eco-friendly": "Thân thiện môi trường",
    retro: "Cổ điển",
    variety: "Đa dạng",
    "?": "Không xác định",
  };
  return displayMap[interest] || "N/A";
}
function getPersonalityDisplay(personality) {
  const displayMap = {
    "thrifty-protector": "Tiết kiệm",
    "hunter-ostentatious": "Phô trương",
    "hard-worker": "Chăm chỉ",
    conformist: "Truyền thống",
    "?": "Không xác định",
  };
  return displayMap[personality] || "N/A";
}
function getReligionDisplay(religion) {
  const displayMap = {
    none: "Không có",
    Catholic: "Công giáo",
    Christian: "Cơ đốc",
    Jewish: "Do Thái",
    "?": "Không xác định",
  };
  return displayMap[religion] || "N/A";
}
function getActivityDisplay(activity) {
  const displayMap = {
    student: "Sinh viên",
    professional: "Chuyên gia",
    unemployed: "Thất nghiệp",
    "working-class": "Lao động",
    "?": "Không xác định",
  };
  return displayMap[activity] || "N/A";
}
function showLoading() {
  loadingSpinner.style.display = "flex";
  userInfo.style.display = "none";
  ratingsGrid.style.display = "none";
  recommendationsGrid.style.display = "none";
}
function hideLoading() {
  loadingSpinner.style.display = "none";
  userInfo.style.display = "block";
  ratingsGrid.style.display = "block";
  recommendationsGrid.style.display = "grid";
}
function toggleMobileNav() {
  navMenu.classList.toggle("active");
}
