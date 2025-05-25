let usersData = [];
let userCuisineData = [];
let userPaymentData = [];
let cuisineChartInstance = null;
let paymentChartInstance = null;
let ageChartInstance = null;
let personalityChartInstance = null;
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
const loadingSpinner = document.getElementById("loadingSpinner");
const usersGrid = document.getElementById("usersGrid");
document.addEventListener("DOMContentLoaded", function () {
  loadSampleData();
  setupEventListeners();
});
function loadSampleData() {
  showLoading();
  setTimeout(() => {
    usersData = sampleUsers;
    userCuisineData = sampleUserCuisine;
    userPaymentData = sampleUserPayment;
    hideLoading();
    displayUsers();
    generateCharts();
  }, 1000);
}
function setupEventListeners() {
  window.addEventListener("resize", generateCharts);
  document
    .querySelector(".nav-toggle")
    .addEventListener("click", toggleMobileNav);
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = this.getAttribute("href");
    });
  });
}
function showLoading() {
  loadingSpinner.style.display = "flex";
  usersGrid.style.display = "none";
}
function hideLoading() {
  loadingSpinner.style.display = "none";
  usersGrid.style.display = "grid";
}
function displayUsers() {
  usersGrid.innerHTML = "";
  if (usersData.length === 0) {
    usersGrid.innerHTML = `
      <div class="no-results">
        <i class="fas fa-user"></i>
        <h3>Không tìm thấy người dùng nào</h3>
        <p>Thử tải lại trang hoặc kiểm tra dữ liệu</p>
      </div>
    `;
    return;
  }
  usersData.forEach((user) => {
    const userCard = document.createElement("a");
    userCard.className = "user-card compact";
    userCard.href = `user-detail.html?userID=${user.userID}`;
    const cuisines = userCuisineData
      .filter((c) => c.userID === user.userID)
      .map((c) => c.Rcuisine);
    userCard.innerHTML = `
      <div class="user-header">
        <div class="user-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div>
          <div class="user-name">Người dùng ${user.userID}</div>
        </div>
      </div>
      <div class="user-info">
        <div class="user-details">
          <div class="user-detail-item">
            <i class="fas fa-utensils"></i>
            <span>Ẩm thực: ${cuisines.join(", ") || "N/A"}</span>
          </div>
          <div class="user-detail-item">
            <i class="fas fa-dollar-sign"></i>
            <span>Ngân sách: ${getBudgetDisplay(user.budget)}</span>
          </div>
          <div class="user-detail-item">
            <i class="fas fa-birthday-cake"></i>
            <span>Tuổi: ${user.age || "N/A"}</span>
          </div>
        </div>
      </div>
    `;
    usersGrid.appendChild(userCard);
  });
}
function generateCharts() {
  if (cuisineChartInstance) cuisineChartInstance.destroy();
  if (paymentChartInstance) paymentChartInstance.destroy();
  if (ageChartInstance) ageChartInstance.destroy();
  if (personalityChartInstance) personalityChartInstance.destroy();
  const cuisineCounts = {};
  const paymentCounts = {};
  const ageGroups = {
    "Dưới 20": 0,
    "20-30": 0,
    "31-40": 0,
    "41-50": 0,
    "Trên 50": 0,
  };
  const personalityCounts = {};
  userCuisineData.forEach((cuisine) => {
    cuisineCounts[cuisine.Rcuisine] =
      (cuisineCounts[cuisine.Rcuisine] || 0) + 1;
  });
  userPaymentData.forEach((payment) => {
    paymentCounts[payment.Upayment] =
      (paymentCounts[payment.Upayment] || 0) + 1;
  });
  usersData.forEach((user) => {
    if (user.age) {
      if (user.age < 20) ageGroups["Dưới 20"]++;
      else if (user.age <= 30) ageGroups["20-30"]++;
      else if (user.age <= 40) ageGroups["31-40"]++;
      else if (user.age <= 50) ageGroups["41-50"]++;
      else ageGroups["Trên 50"]++;
    }
    const personality = user.personality || "Unknown";
    personalityCounts[personality] = (personalityCounts[personality] || 0) + 1;
  });
  const cuisineCtx = document.getElementById("cuisineChart").getContext("2d");
  cuisineChartInstance = new Chart(cuisineCtx, {
    type: "pie",
    data: {
      labels: Object.keys(cuisineCounts),
      datasets: [
        {
          data: Object.values(cuisineCounts),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Loại Ẩm Thực Phổ Biến" },
      },
    },
  });
  const paymentCtx = document.getElementById("paymentChart").getContext("2d");
  paymentChartInstance = new Chart(paymentCtx, {
    type: "doughnut",
    data: {
      labels: Object.keys(paymentCounts),
      datasets: [
        {
          data: Object.values(paymentCounts),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        title: { display: true, text: "Phương Thức Thanh Toán" },
      },
    },
  });
  const ageCtx = document.getElementById("ageChart");
  if (ageCtx) {
    ageChartInstance = new Chart(ageCtx.getContext("2d"), {
      type: "bar",
      data: {
        labels: Object.keys(ageGroups),
        datasets: [
          {
            label: "Số lượng người dùng",
            data: Object.values(ageGroups),
            backgroundColor: "#36A2EB",
            borderColor: "#333",
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
            title: { display: true, text: "Số lượng người dùng" },
          },
          x: {
            title: { display: true, text: "Nhóm tuổi" },
          },
        },
        plugins: {
          legend: { display: false },
          title: { display: true, text: "Phân bố độ tuổi người dùng" },
        },
      },
    });
  }
  const personalityCtx = document.getElementById("personalityChart");
  if (personalityCtx) {
    personalityChartInstance = new Chart(personalityCtx.getContext("2d"), {
      type: "pie",
      data: {
        labels: Object.keys(personalityCounts),
        datasets: [
          {
            data: Object.values(personalityCounts),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Phân bố tính cách người dùng" },
        },
      },
    });
  }
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
function toggleMobileNav() {
  document.querySelector(".nav-menu").classList.toggle("active");
}
