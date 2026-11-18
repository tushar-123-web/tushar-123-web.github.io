
const form = document.querySelector(".form-panel form");

const nameInput = document.getElementById("f-name");
const courseInput = document.getElementById("f-course");
const companyInput = document.getElementById("f-company");
const statusInput = document.getElementById("f-status");

const searchInput = document.querySelector(".search input");
const statusFilter = document.querySelectorAll(".filters select")[0];
const companyFilter = document.querySelectorAll(".filters select")[1];

const tableBody = document.querySelector("tbody");
const tableEmpty = document.querySelector(".table-empty");
const recordsCount = document.querySelector(".records-count");

// Local Storage
let students = JSON.parse(localStorage.getItem("placementStudents")) || [];

function saveData() {
    localStorage.setItem(
        "placementStudents",
        JSON.stringify(students)
    );
}


form.addEventListener("submit", function(e) {

    e.preventDefault();

    const name = nameInput.value.trim();
    const course = courseInput.value.trim();
    const company = companyInput.value.trim();
    const status = statusInput.value;

    if (!name || !course || !company) {
        alert("Please fill all student details!");
        return;
    }

    const student = {
        id: Date.now(),
        name: name,
        course: course,
        company: company,
        status: status,
        date: new Date().toLocaleString()
    };

    students.push(student);

    saveData();

    form.reset();

    renderStudents();

    alert("Student record added successfully!");

});

function renderStudents() {

    const searchValue = searchInput.value.toLowerCase();
    const selectedStatus = statusFilter.value;
    const selectedCompany = companyFilter.value;

    tableBody.innerHTML = "";

    const filteredStudents = students.filter(student => {

        const matchSearch =
            student.name.toLowerCase().includes(searchValue) ||
            student.company.toLowerCase().includes(searchValue);

        const matchStatus =
            selectedStatus === "All Statuses" ||
            student.status === selectedStatus;

        const matchCompany =
            selectedCompany === "All Companies" ||
            student.company === selectedCompany;

        return matchSearch && matchStatus && matchCompany;

    });


    // Empty Message
    tableEmpty.style.display =
        filteredStudents.length === 0 ? "block" : "none";

    recordsCount.textContent =
        `${filteredStudents.length} records shown`;


    // Create Table Rows
    filteredStudents.forEach((student, index) => {

        const row = document.createElement("tr");

        let statusClass = "";

        if (student.status === "Selected") {
            statusClass = "green";
        } 
        else if (student.status === "Pending") {
            statusClass = "amber";
        } 
        else {
            statusClass = "red";
        }

        row.innerHTML = `
            <td>${index + 1}</td>

            <td>${escapeHTML(student.name)}</td>

            <td>${escapeHTML(student.course)}</td>

            <td>${escapeHTML(student.company)}</td>

            <td>
                <span class="${statusClass}">
                    ${student.status}
                </span>
            </td>

            <td>
                <button
                    class="delete-btn"
                    data-id="${student.id}"
                    type="button">
                    🗑️ Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);

    });

    updateDashboard();

    updateCompanyFilter();

}

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

}

tableBody.addEventListener("click", function(e) {

    if (e.target.classList.contains("delete-btn")) {

        const id = Number(e.target.dataset.id);

        const confirmDelete = confirm(
            "Are you sure you want to delete this record?"
        );

        if (confirmDelete) {

            students = students.filter(
                student => student.id !== id
            );

            saveData();

            renderStudents();

        }

    }

});

function updateDashboard() {

    const total = students.length;

    const selected = students.filter(
        s => s.status === "Selected"
    ).length;

    const pending = students.filter(
        s => s.status === "Pending"
    ).length;

    const rejected = students.filter(
        s => s.status === "Rejected"
    ).length;


    const statNumbers = document.querySelectorAll(".stat-num");

    statNumbers[0].textContent = total;
    statNumbers[1].textContent = selected;
    statNumbers[2].textContent = pending;
    statNumbers[3].textContent = rejected;


    // Calculate Percentage
    const selectedPercent = total ? (selected / total) * 100 : 0;
    const pendingPercent = total ? (pending / total) * 100 : 0;
    const rejectedPercent = total ? (rejected / total) * 100 : 0;


    // Update Progress Bars
    const percentages = [
        selectedPercent,
        pendingPercent,
        rejectedPercent
    ];

    const fills = document.querySelectorAll(".overview-row .fill");
    const pctLabels = document.querySelectorAll(".overview-row .pct");

    percentages.forEach((percent, index) => {

        fills[index].style.width = percent + "%";

        pctLabels[index].textContent =
            Math.round(percent) + "%";

    });


    // Update Recent Activity
    updateActivity();

}

function updateActivity() {

    const activityPanel = document.querySelectorAll(".cols .panel")[1];

    activityPanel.querySelector(".empty-state")?.remove();

    let oldActivity = activityPanel.querySelector(".activity-list");

    if (oldActivity) {
        oldActivity.remove();
    }

    const activityList = document.createElement("div");

    activityList.className = "activity-list";

    const recentStudents = [...students].slice(-5).reverse();

    if (recentStudents.length === 0) {

        const empty = document.createElement("div");

        empty.className = "empty-state";
        empty.textContent = "No placement activity available yet.";

        activityPanel.appendChild(empty);

        return;
    }

    recentStudents.forEach(student => {

        const item = document.createElement("div");

        item.style.padding = "12px 0";
        item.style.borderBottom = "1px solid #eee";

        item.textContent =
            `${student.name} - ${student.company} (${student.status})`;

        activityList.appendChild(item);

    });

    activityPanel.appendChild(activityList);

}

function updateCompanyFilter() {

    const currentValue = companyFilter.value;

    const companies = [...new Set(
        students.map(student => student.company)
    )];

    companyFilter.innerHTML =
        '<option value="All Companies">All Companies</option>';

    companies.forEach(company => {

        const option = document.createElement("option");

        option.value = company;
        option.textContent = company;

        companyFilter.appendChild(option);

    });

    companyFilter.value = companies.includes(currentValue)
        ? currentValue
        : "All Companies";

}

searchInput.addEventListener("input", renderStudents);

statusFilter.addEventListener("change", renderStudents);

companyFilter.addEventListener("change", renderStudents);

document.querySelector(".reset-btn").addEventListener("click", function() {

    searchInput.value = "";

    statusFilter.value = "All Statuses";

    companyFilter.value = "All Companies";

    renderStudents();

});

renderStudents();
