// =================================================================
// تهيئة Firebase والخدمات
// =================================================================
var firebaseConfig = {
    apiKey: "AIzaSyDAR0_nS6yK_qUa_kVX_fJdPx_C4Nu1jjI",
    authDomain: "vpn-pro-23526.firebaseapp.com",
    projectId: "vpn-pro-23526",
    storageBucket: "vpn-pro-23526.appspot.com",
    messagingSenderId: "250679041250",
    appId: "1:250679041250:web:c6d988aedc514769d952bb"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// =================================================================
// المتغيرات العامة وحالة التطبيق
// =================================================================
let currentWorkerId = null;
let notifications = [];

// =================================================================
// منطق الترجمة واللغات
// =================================================================
const translations = {
  pageTitle: { ar: "نظام حضور العمال السحابي", en: "Cloud Worker Attendance System", fr: "Présence des Travailleurs" },
  brandTitle: { ar: "نظام حضور العمال", en: "Worker Attendance", fr: "Présence des Travailleurs" },
  language: { ar: "اللغة", en: "Language", fr: "Langue" },
  logoutBtn: { ar: "تسجيل الخروج", en: "Logout", fr: "Déconnexion" },
  loginTitle: { ar: "تسجيل الدخول", en: "Login", fr: "Connexion" },
  signupTitle: { ar: "إنشاء حساب جديد", en: "Create New Account", fr: "Créer un Nouveau Compte" },
};
function setLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('selectedLanguage', lang);
  document.querySelectorAll('[data-translate-key]').forEach(element => {
    const key = element.getAttribute('data-translate-key');
    if (translations[key] && translations[key][lang]) {
        // التحقق مما إذا كان العنصر يحتوي على أيقونة للحفاظ عليها
        const icon = element.querySelector('i.fas');
        const text = translations[key][lang];
        element.innerHTML = icon ? `${icon.outerHTML} ${text}` : text;
    }
  });
}
function initializeLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage');
    const browserLang = navigator.language.split('-')[0];
    if (savedLang && ['ar', 'en', 'fr'].includes(savedLang)) {
        setLanguage(savedLang);
    } else if (['en', 'fr'].includes(browserLang)) {
        setLanguage(browserLang);
    } else {
        setLanguage('ar');
    }
}

// =================================================================
// دوال الواجهة الرئيسية والتنقل والإشعارات
// =================================================================
function hideAllSections() {
    document.querySelectorAll('#appSection > .card').forEach(s => s.classList.add('hidden'));
}
function showSection(sectionId) {
    hideAllSections();
    document.getElementById(sectionId).classList.remove('hidden');
}
function addNotification(message, isError = false) {
    notifications.unshift({ text: message, time: new Date(), isError });
    updateNotificationUI();
}
function updateNotificationUI() {
    const list = document.getElementById('notification-list');
    const dot = document.getElementById('notification-dot');
    list.innerHTML = '';
    if (notifications.length === 0) {
        list.innerHTML = '<li><a class="dropdown-item" href="#">لا توجد إشعارات</a></li>';
        dot.classList.add('hidden');
    } else {
        dot.classList.remove('hidden');
        notifications.slice(0, 10).forEach(n => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item ${n.isError ? 'text-danger' : ''}" href="#">${n.text}<div class="notification-time">${n.time.toLocaleTimeString()}</div></a>`;
            list.appendChild(li);
        });
    }
}

// =================================================================
// إدارة المصادقة (Authentication) -- هذا هو الجزء الذي تم إصلاحه
// =================================================================
auth.onAuthStateChanged(user => {
    if (user) {
        // المستخدم مسجل دخوله: إخفاء نماذج الدخول وإظهار التطبيق
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('signupSection').classList.add('hidden');
        document.getElementById('appSection').classList.remove('hidden');
        
        // تحديث شريط التنقل
        document.getElementById('logoutBtn').classList.remove('hidden');
        document.getElementById('userEmail').textContent = user.email;
        
        // عرض القسم الافتراضي داخل التطبيق
        showSection('homeSection');
        loadWorkers();
    } else {
        // المستخدم غير مسجل دخوله: إظهار نموذج الدخول وإخفاء التطبيق
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('signupSection').classList.add('hidden');
        document.getElementById('appSection').classList.add('hidden');
        
        // تحديث شريط التنقل
        document.getElementById('logoutBtn').classList.add('hidden');
        document.getElementById('userEmail').textContent = '';
    }
});


// =================================================================
// إدارة العمال (إضافة، عرض، تعديل، حذف)
// =================================================================
async function loadWorkers() {
    const user = auth.currentUser;
    if (!user) return;
    const snapshot = await db.collection("workers").where("createdBy", "==", user.uid).orderBy("name").get();
    const workersList = document.getElementById("workersList");
    const salaryWorkerSelect = document.getElementById("salaryWorkerSelect");
    workersList.innerHTML = '';
    salaryWorkerSelect.innerHTML = '<option value="">اختر عاملاً...</option>';
    snapshot.forEach(doc => {
        const worker = doc.data();
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center pointer";
        li.innerHTML = `<span onclick="showWorkerDetail('${doc.id}')">${worker.name}</span><div><button class='btn btn-sm btn-outline-warning me-1' onclick="editWorker('${doc.id}')"><i class='fas fa-edit'></i></button><button class='btn btn-sm btn-outline-danger' onclick="deleteWorker('${doc.id}', '${worker.name}')"><i class='fas fa-trash'></i></button></div>`;
        workersList.appendChild(li);
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = worker.name;
        salaryWorkerSelect.appendChild(option);
    });
}
async function showWorkerDetail(workerId) {
    currentWorkerId = workerId;
    const workerDoc = await db.collection('workers').doc(workerId).get();
    document.getElementById('workerDetailName').textContent = workerDoc.data().name;
    showSection('workerDetailSection');
    loadWorkerRecords(workerId);
}
async function editWorker(workerId) {
    const doc = await db.collection("workers").doc(workerId).get();
    if (doc.exists) {
        const worker = doc.data();
        document.getElementById("editWorkerId").value = workerId;
        document.getElementById("editWorkerName").value = worker.name || "";
        document.getElementById("editHourlyRate").value = worker.hourlyRate || 0;
        document.getElementById("editOvertimeRate").value = worker.overtimeRate || 1.5;
        document.getElementById("editWorkHours").value = worker.workHoursPerDay || 8;
        showSection('editWorkerSection');
    }
}
function deleteWorker(workerId, workerName) {
    if (confirm(`هل أنت متأكد من حذف العامل "${workerName}" وكل سجلاته؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
        db.collection("workers").doc(workerId).delete().then(() => {
            addNotification(`تم حذف العامل ${workerName} بنجاح.`);
            loadWorkers();
            showSection('workersListSection');
        }).catch(err => addNotification(`فشل حذف العامل: ${err.message}`, true));
    }
}

// =================================================================
// إدارة سجلات الحضور، الإجازات، والموقع الجغرافي
// =================================================================
function openRecordForm(recordId = null) {
    document.getElementById('recordForm').reset();
    document.getElementById('recordId').value = recordId;
    document.getElementById('recordDate').valueAsDate = new Date();
    showSection('recordSection');
}
async function loadWorkerRecords(workerId) {
    const snapshot = await db.collection("workers").doc(workerId).collection("records").orderBy("date", "desc").get();
    const tableBody = document.getElementById("recordsTableBody");
    tableBody.innerHTML = "";
    snapshot.forEach(doc => {
        const record = doc.data();
        const tr = document.createElement("tr");
        const recordTypes = {
            'حضور': { text: 'حضور', class: 'record-type-attendance' },
            'غياب-غير-مبرر': { text: 'غياب غير مبرر', class: 'record-type-unjustified' },
            'غياب-مرضي': { text: 'إجازة مرضية', class: 'record-type-sick' },
            'غياب-سنوي': { text: 'إجازة سنوية', class: 'record-type-annual' }
        };
        const typeInfo = recordTypes[record.type] || { text: record.type, class: '' };
        let locationHTML = record.location ? `<a href="https://maps.google.com?q=${record.location.lat},${record.location.lon}" target="_blank" class="location-link">عرض الخريطة</a>` : '-';
        let workHours = '-';
        if (record.type === 'حضور' && record.arrival && record.departure) {
            const diff = (new Date(`1970-01-01T${record.departure}`) - new Date(`1970-01-01T${record.arrival}`)) / 3600000;
            workHours = diff > 0 ? diff.toFixed(2) : '-';
        }
        tr.className = typeInfo.class;
        tr.innerHTML = `<td>${record.date}</td><td>${typeInfo.text}</td><td>${record.arrival||'-'}</td><td>${record.departure||'-'}</td><td>${workHours}</td><td>${locationHTML}</td><td><button class="btn btn-sm btn-outline-danger" onclick="deleteRecord('${doc.id}')"><i class="fas fa-trash"></i></button></td>`;
        tableBody.appendChild(tr);
    });
}
function deleteRecord(recordId) {
    if (confirm("هل أنت متأكد من حذف هذا السجل؟")) {
        db.collection("workers").doc(currentWorkerId).collection("records").doc(recordId).delete()
        .then(() => loadWorkerRecords(currentWorkerId));
    }
}
async function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("المتصفح لا يدعم تحديد الموقع."));
        navigator.geolocation.getCurrentPosition(
            pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => reject(new Error("لم يتم السماح بالوصول للموقع."))
        );
    });
}

// =================================================================
// إدارة الرواتب والتقارير والتصدير
// =================================================================
async function generateSalaryReport() {
    const workerId = document.getElementById('salaryWorkerSelect').value;
    const startDate = document.getElementById('salaryStartDate').value;
    const endDate = document.getElementById('salaryEndDate').value;
    if (!workerId || !startDate || !endDate) return alert("يرجى اختيار العامل وتحديد فترة زمنية.");

    const workerDoc = await db.collection('workers').doc(workerId).get();
    const worker = workerDoc.data();
    document.getElementById('reportWorkerName').textContent = `تقرير: ${worker.name}`;

    const snapshot = await db.collection('workers').doc(workerId).collection('records')
        .where('date', '>=', startDate).where('date', '<=', endDate).orderBy('date').get();
    
    let totalHours = 0, totalOvertime = 0, totalSalary = 0;
    const tableBody = document.getElementById('salaryReportTableBody');
    tableBody.innerHTML = '';

    snapshot.forEach(doc => {
        const record = doc.data();
        let dailyHours = 0, dailyOvertime = 0, dailyWage = 0, status = record.type;
        if (record.type === 'حضور' && record.arrival && record.departure) {
            const duration = (new Date(`1970-01-01T${record.departure}`) - new Date(`1970-01-01T${record.arrival}`)) / 3600000;
            if (duration > 0) {
                dailyHours = Math.min(duration, worker.workHoursPerDay);
                dailyOvertime = Math.max(0, duration - worker.workHoursPerDay);
                dailyWage = (dailyHours * worker.hourlyRate) + (dailyOvertime * worker.hourlyRate * worker.overtimeRate);
                status = `حضور (${duration.toFixed(2)} ساعة)`;
            }
        }
        totalHours += dailyHours;
        totalOvertime += dailyOvertime;
        totalSalary += dailyWage;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${record.date}</td><td>${status}</td><td>${(dailyHours + dailyOvertime).toFixed(2)}</td><td>${dailyWage.toFixed(2)}</td>`;
        tableBody.appendChild(tr);
    });

    document.getElementById('totalHours').textContent = totalHours.toFixed(2);
    document.getElementById('totalOvertime').textContent = totalOvertime.toFixed(2);
    document.getElementById('totalSalary').textContent = `${totalSalary.toFixed(2)} $`;
    document.getElementById('reportResult').classList.remove('hidden');
}
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,التاريخ,الحالة,ساعات العمل,الأجر اليومي\n";
    document.querySelectorAll("#salaryReportTable tbody tr").forEach(row => {
        let rowData = Array.from(row.cells).map(cell => `"${cell.innerText}"`).join(",");
        csvContent += rowData + "\n";
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `salary_${document.getElementById('salaryWorkerSelect').value}.csv`);
    link.click();
}
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(`Salary Report: ${document.getElementById('reportWorkerName').textContent}`, 14, 16);
    doc.autoTable({ html: '#salaryReportTable', startY: 20 });
    doc.save('salary_report.pdf');
}

// =================================================================
// تسجيل البصمة
// =================================================================
async function registerFingerprint() {
    const workerId = document.getElementById('editWorkerId').value;
    if (!workerId) return addNotification("الرجاء حفظ العامل أولاً.", true);
    if (!window.PublicKeyCredential) return addNotification("متصفحك لا يدعم البصمة.", true);

    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    const workerName = document.getElementById('editWorkerName').value;

    const publicKeyCreationOptions = {
        challenge,
        rp: { name: "نظام حضور العمال", id: window.location.hostname },
        user: { id: new TextEncoder().encode(workerId), name: workerName, displayName: workerName },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
        authenticatorSelection: { userVerification: "required" },
        timeout: 60000,
        attestation: "none"
    };

    try {
        const credential = await navigator.credentials.create({ publicKey: publicKeyCreationOptions });
        const credentialId = btoa(String.fromCharCode.apply(null, new Uint8Array(credential.rawId)));
        await db.collection("workers").doc(workerId).update({ fingerprintCredentialId: credentialId });
        addNotification("تم تسجيل بصمة العامل بنجاح!");
    } catch (error) {
        addNotification("فشل تسجيل البصمة: " + error.message, true);
    }
}

// =================================================================
// ربط الأحداث (Event Listeners) عند تحميل الصفحة
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeLanguage();
    updateNotificationUI();

    // المصادقة
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const authErrorMsg = document.getElementById('authErrorMsg');
    const signupEmailInput = document.getElementById('signupEmailInput');
    const signupPasswordInput = document.getElementById('signupPasswordInput');
    const signupErrorMsg = document.getElementById('signupErrorMsg');

    document.getElementById('loginBtnAuth').addEventListener('click', () => auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value).catch(err => authErrorMsg.textContent = err.message));
    document.getElementById('signupBtn').addEventListener('click', () => auth.createUserWithEmailAndPassword(signupEmailInput.value, signupPasswordInput.value).catch(err => signupErrorMsg.textContent = err.message));
    document.getElementById('logoutBtn').addEventListener('click', () => auth.signOut());
    document.getElementById('gotoSignupBtn').addEventListener('click', () => { document.getElementById('loginSection').classList.add('hidden'); document.getElementById('signupSection').classList.remove('hidden'); });
    document.getElementById('backToLoginBtn').addEventListener('click', () => { document.getElementById('signupSection').classList.add('hidden'); document.getElementById('loginSection').classList.remove('hidden'); });
    
    // التنقل
    document.getElementById('navHome').addEventListener('click', (e) => { e.preventDefault(); showSection('homeSection'); });
    document.getElementById('navWorkers').addEventListener('click', (e) => { e.preventDefault(); showSection('workersListSection'); });
    document.getElementById('navSalaries').addEventListener('click', (e) => { e.preventDefault(); showSection('salaryReportSection'); });
    
    // النماذج
    document.getElementById('addWorkerForm').addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('workerNameInput').value;
        if (!name) return;
        db.collection('workers').add({ name, createdBy: auth.currentUser.uid, hourlyRate: 10, overtimeRate: 1.5, workHoursPerDay: 8 })
        .then(() => { addNotification(`تمت إضافة العامل ${name}.`); loadWorkers(); e.target.reset(); });
    });
    document.getElementById('editWorkerForm').addEventListener('submit', e => {
        e.preventDefault();
        const workerId = document.getElementById('editWorkerId').value;
        const data = {
            name: document.getElementById('editWorkerName').value,
            hourlyRate: parseFloat(document.getElementById('editHourlyRate').value),
            overtimeRate: parseFloat(document.getElementById('editOvertimeRate').value),
            workHoursPerDay: parseFloat(document.getElementById('editWorkHours').value)
        };
        db.collection('workers').doc(workerId).update(data).then(() => { addNotification('تم تحديث بيانات العامل.'); showSection('workersListSection'); loadWorkers(); });
    });
    document.getElementById('recordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const record = {
            date: document.getElementById('recordDate').value,
            type: document.getElementById('recordType').value,
            arrival: document.getElementById('arrivalTime').value,
            departure: document.getElementById('departureTime').value,
            location: null
        };
        if (!record.date) return alert('الرجاء تحديد التاريخ.');

        if (record.type === 'حضور' && record.arrival) {
            try { record.location = await getCurrentLocation(); addNotification("تم تسجيل الموقع."); } 
            catch (error) { addNotification(error.message, true); }
        }
        db.collection('workers').doc(currentWorkerId).collection('records').add(record)
        .then(() => { addNotification('تم حفظ السجل.'); showWorkerDetail(currentWorkerId); });
    });

    // الأزرار
    document.getElementById('backFromEditWorkerBtn').addEventListener('click', () => showSection('workersListSection'));
    document.getElementById('backToWorkersList').addEventListener('click', () => showSection('workersListSection'));
    document.getElementById('backFromRecordBtn').addEventListener('click', () => showSection('workerDetailSection'));
    document.getElementById('editWorkerBtn').addEventListener('click', () => editWorker(currentWorkerId));
    document.getElementById('addRecordBtn').addEventListener('click', () => openRecordForm());
    document.getElementById('generateSalaryReportBtn').addEventListener('click', generateSalaryReport);
    document.getElementById('exportCsvBtn').addEventListener('click', exportToCSV);
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    document.getElementById('registerFingerprintBtn').addEventListener('click', registerFingerprint);
});

// جعل الدوال قابلة للوصول من HTML onclick
window.setLanguage = setLanguage;
window.showWorkerDetail = showWorkerDetail;
window.editWorker = editWorker;
window.deleteWorker = deleteWorker;
window.deleteRecord = deleteRecord;
