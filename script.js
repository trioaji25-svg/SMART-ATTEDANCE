
const getData = (key) => {
    return JSON.parse(localStorage.getItem(key) || "[]");
};

const saveData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

const loginPage = document.getElementById("loginPage");
const registerPage = document.getElementById("registerPage");
const dashboard = document.getElementById("dashboard");

function showPage(page) {
    loginPage.classList.add("hidden");
    registerPage.classList.add("hidden");
    dashboard.classList.add("hidden");

    page.classList.remove("hidden");
}

document.getElementById("showRegister").onclick = function(event) {
    event.preventDefault();
    showPage(registerPage);
};

document.getElementById("showLogin").onclick = function(event) {
    event.preventDefault();
    showPage(loginPage);
};

// REGISTER
document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("registerUsername").value.trim();
    const password = document.getElementById("registerPassword").value;

    let users = getData("users");

    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
        alert("Username sudah digunakan!");
        return;
    }

    users.push({ username, password });
    saveData("users", users);

    alert("Pendaftaran berhasil! Silakan login.");

    this.reset();
    showPage(loginPage);
});

// LOGIN
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    const users = getData("users");

    const user = users.find(item =>
        item.username === username &&
        item.password === password
    );

    if (!user) {
        alert("Username atau password salah!");
        return;
    }

    localStorage.setItem("currentUser", username);
    openDashboard(username);
    this.reset();
});

// DASHBOARD
function openDashboard(username) {
    showPage(dashboard);

    document.getElementById("welcomeName").textContent = username;
    document.getElementById("profileName").textContent = username;
    document.getElementById("studentName").value = username;

    renderHistory();
}

// ABSENSI
document.getElementById("attendanceForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const username = localStorage.getItem("currentUser");
    const name = document.getElementById("studentName").value.trim();
    const status = document.getElementById("attendanceStatus").value;

    if (!name || !status) {
        alert("Lengkapi data absensi!");
        return;
    }

    let attendance = getData("attendance");

    const today = new Date().toLocaleDateString("id-ID");

    const alreadyPresent = attendance.some(item =>
        item.username === username && item.date === today
    );

    if (alreadyPresent) {
        alert("Kamu sudah mengisi absensi hari ini.");
        return;
    }

    attendance.push({
        username: username,
        name: name,
        status: status,
        date: today
    });

    saveData("attendance", attendance);

    document.getElementById("attendanceMessage").textContent =
        "Absensi berhasil disimpan!";

    document.getElementById("attendanceStatus").value = "";

    renderHistory();
});

// RIWAYAT
function renderHistory() {
    const username = localStorage.getItem("currentUser");
    const attendance = getData("attendance");

    const history = attendance.filter(item =>
        item.username === username
    );

    const table = document.getElementById("attendanceHistory");
    table.innerHTML = "";

    if (history.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="3">Belum ada riwayat absensi.</td>
            </tr>
        `;
        return;
    }

    history.slice().reverse().forEach(item => {
        const row = document.createElement("tr");

        [item.name, item.status, item.date].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

// LOGOUT
document.getElementById("logoutButton").addEventListener("click", function() {
    localStorage.removeItem("currentUser");
    document.getElementById("attendanceMessage").textContent = "";

    alert("Kamu berhasil logout!");
    showPage(loginPage);
});

// CEK LOGIN SAAT APLIKASI DIBUKA
const currentUser = localStorage.getItem("currentUser");

if (currentUser) {
    openDashboard(currentUser);
} else {
    showPage(loginPage);
}

// DAFTARKAN SERVICE WORKER
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("./service-worker.js")
            .catch(error => console.log("Service Worker gagal:", error));
    });
}
