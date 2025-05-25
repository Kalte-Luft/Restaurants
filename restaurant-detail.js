// Global variables
let restaurantsData = [];
let cuisinesData = [];
let ratingsData = [];
let hoursData = [];
let acceptsData = [];
let parkingData = [];

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

const sampleAccepts = [
  { placeID: "135110", Rpayment: "cash" },
  { placeID: "135110", Rpayment: "VISA" },
  { placeID: "134999", Rpayment: "cash" },
];

const sampleParking = [
  { placeID: "135110", parking_lot: "yes" },
  { placeID: "134999", parking_lot: "none" },
];

// DOM Elements
const restaurantName = document.getElementById("restaurantName");
const restaurantAddress = document.getElementById("restaurantAddress");
const basicInfo = document.getElementById("basicInfo");
const cuisineTags = document.getElementById("cuisineTags");
const paymentTags = document.getElementById("paymentTags");
const hoursInfo = document.getElementById("hoursInfo");
const ratingStars = document.getElementById("ratingStars");
const ratingNumber = document.getElementById("ratingNumber");
const ratingCount = document.getElementById("ratingCount");
const recentReviews = document.getElementById("recentReviews");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  loadSampleData();
  setupEventListeners();
  displayRestaurantDetail();
});

function loadSampleData() {
  restaurantsData = sampleRestaurants;
  cuisinesData = sampleCuisines;
  ratingsData = sampleRatings;
  hoursData = sampleHours;
  acceptsData = sampleAccepts;
  parkingData = sampleParking;
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

function displayRestaurantDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const placeID = urlParams.get("placeID");
  const restaurant = restaurantsData.find((r) => r.placeID === placeID);

  if (!restaurant) {
    document.getElementById("restaurantDetail").innerHTML = `
            <div class="no-results">
                <h3>Không tìm thấy nhà hàng</h3>
            </div>
        `;
    return;
  }

  // Display restaurant name and address
  restaurantName.textContent = restaurant.name;
  restaurantAddress.textContent = `${restaurant.address || "N/A"}, ${
    restaurant.city || "N/A"
  }`;

  // Display basic info
  basicInfo.innerHTML = `
        <div class="detail-row">
            <strong>Mức giá:</strong> ${getPriceDisplay(restaurant.price)}
        </div>
        <div class="detail-row">
            <strong>Rượu/Bia:</strong> ${getAlcoholDisplay(restaurant.alcohol)}
        </div>
        <div class="detail-row">
            <strong>Khu vực hút thuốc:</strong> ${getSmokingDisplay(
              restaurant.smoking_area
            )}
        </div>
        <div class="detail-row">
            <strong>Tiếp cận:</strong> ${getAccessibilityDisplay(
              restaurant.accessibility
            )}
        </div>
        <div class="detail-row">
            <strong>Dress code:</strong> ${getDressCodeDisplay(
              restaurant.dress_code
            )}
        </div>
        <div class="detail-row">
            <strong>Không gian:</strong> ${getAmbienceDisplay(
              restaurant.Rambience
            )}
        </div>
        <div class="detail-row">
            <strong>Franchise:</strong> ${
              restaurant.franchise === "t" ? "Có" : "Không"
            }
        </div>
        <div class="detail-row">
            <strong>Khu vực:</strong> ${getAreaDisplay(restaurant.area)}
        </div>
        <div class="detail-row">
            <strong>Dịch vụ khác:</strong> ${
              restaurant.other_services || "Không có"
            }
        </div>
        <div class="detail-row">
            <strong>Đỗ xe:</strong> ${getParkingDisplay(
              parkingData.find((p) => p.placeID === restaurant.placeID)
                ?.parking_lot || "N/A"
            )}
        </div>
    `;

  // Display cuisines
  const cuisines = cuisinesData
    .filter((c) => c.placeID === restaurant.placeID)
    .map((c) => c.Rcuisine);
  cuisineTags.innerHTML =
    cuisines.length > 0
      ? cuisines
          .map((cuisine) => `<span class="cuisine-tag">${cuisine}</span>`)
          .join("")
      : "<span>Không có thông tin</span>";

  // Display payment methods
  const payments = acceptsData
    .filter((a) => a.placeID === restaurant.placeID)
    .map((a) => a.Rpayment);
  paymentTags.innerHTML =
    payments.length > 0
      ? payments
          .map((payment) => `<span class="payment-tag">${payment}</span>`)
          .join("")
      : "<span>Không có thông tin</span>";

  // Display hours with status
  const hours = hoursData.filter((h) => h.placeID === restaurant.placeID);
  hoursInfo.innerHTML =
    hours.length > 0
      ? hours
          .map((h) => {
            const isOpen = checkIfOpen(h.hours, h.days);
            return `
              <div class="detail-row">
                  <strong>${h.days}:</strong> ${h.hours}
                  <span class="status ${isOpen ? "open" : "closed"}">
                      (${isOpen ? "Đang mở" : "Đóng cửa"})
                  </span>
              </div>
            `;
          })
          .join("")
      : "<span>Không có thông tin</span>";

  // Display ratings
  const restaurantRatings = ratingsData.filter(
    (r) => r.placeID === restaurant.placeID
  );
  const avgRating = calculateAverageRating(restaurantRatings);
  ratingStars.innerHTML = generateStars(avgRating);
  ratingNumber.textContent = avgRating.toFixed(1) + "/5";
  ratingCount.textContent = `(${restaurantRatings.length} đánh giá)`;
  recentReviews.innerHTML = generateRecentReviews(restaurantRatings);
}

function checkIfOpen(hours, days) {
  const now = new Date("2025-05-25T23:19:00+07:00"); // Thời gian hiện tại
  const currentDay = now.toLocaleString("en-US", { weekday: "short" }); // Sun, Mon, v.v.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Phút kể từ nửa đêm

  // Kiểm tra ngày hiện tại có nằm trong khoảng days không
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

  // Kiểm tra giờ hiện tại có nằm trong khoảng hours không
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

function generateRecentReviews(ratings) {
  if (ratings.length === 0) {
    return "<p>Chưa có đánh giá nào.</p>";
  }

  return ratings
    .slice(0, 3)
    .map(
      (rating) => `
        <div class="review-item">
            <div class="reviewer">Người dùng ${rating.userID}</div>
            <div class="review-ratings">
                <span>Tổng thể: ${generateStars(rating.rating)}</span>
                <span>Đồ ăn: ${generateStars(rating.food_rating)}</span>
                <span>Dịch vụ: ${generateStars(rating.service_rating)}</span>
            </div>
        </div>
    `
    )
    .join("");
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

function getAccessibilityDisplay(accessibility) {
  const accessMap = {
    no_accessibility: "Không",
    completely: "Hoàn toàn",
    partially: "Một phần",
  };
  return accessMap[accessibility] || "N/A";
}

function getDressCodeDisplay(dressCode) {
  const dressCodeMap = {
    informal: "Bình thường",
    casual: "Thoải mái",
    formal: "Trang trọng",
  };
  return dressCodeMap[dressCode] || "N/A";
}

function getAmbienceDisplay(ambience) {
  const ambienceMap = {
    familiar: "Gia đình",
    quiet: "Yên tĩnh",
    formal: "Trang trọng",
  };
  return ambienceMap[ambience] || "N/A";
}

function getAreaDisplay(area) {
  const areaMap = {
    open: "Mở",
    closed: "Đóng",
  };
  return areaMap[area] || "N/A";
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

function toggleMobileNav() {
  navMenu.classList.toggle("active");
}
