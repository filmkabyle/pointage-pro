
// =================================================================
// === CLOUD WORKER ATTENDANCE SYSTEM - FULL SCRIPT
// =================================================================
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // === 1. FIREBASE & GLOBAL STATE INITIALIZATION
    // =================================================================
    const firebaseConfig = {
        apiKey: "AIzaSyDAR0_nS6yK_qUa_kVX_fJdPx_C4Nu1jjI",
        authDomain: "vpn-pro-23526.firebaseapp.com",
        projectId: "vpn-pro-23526",
        storageBucket: "vpn-pro-23526.appspot.com",
        messagingSenderId: "250679041250",
        appId: "1:250679041250:web:c6d988aedc514769d952bb"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Global State
    let currentUser = null;
    let currentWorkerId = null;
    let workersCache = [];
    let currentRecords = [];
    let attendanceChart = null;
    
    // DOM Element Selectors
    const allAppSections = document.querySelectorAll('#appSection > .card');
    const mainAppSection = document.getElementById('appSection');
    const authSections = {
        login: document.getElementById('loginSection'),
        signup: document.getElementById('signupSection')
    };
    const appSections = {
        home: document.getElementById('homeSection'),
        workersList: document.getElementById('workersListSection'),
        editWorker: document.getElementById('editWorkerSection'),
        workerDetail: document.getElementById('workerDetailSection'),
        record: document.getElementById('recordSection'),
        leaveManagement: document.getElementById('leaveManagementSection'),
        settings: document.getElementById('settingsSection'),
    };

    // =================================================================
    // === 2. TRANSLATION SYSTEM
    // =================================================================
    const translations = {
        en: {
            pageTitle: "Cloud Worker Attendance System", brandTitle: "Worker Attendance", navHome: "Home", navWorkers: "Worker List", navLeaveRequests: "Leave Requests", navSettings: "Settings", language: "Language", logoutBtn: "Logout", loginTitle: "Login", loginSubtitle: "Enter your email and password.", emailPlaceholder: "Email", passwordPlaceholder: "Password", loginBtn: "Login", createAccountBtn: "Create Account", signupTitle: "Create New Account", signupSubtitle: "Enter your details to register.", backToLoginBtn: "Back to Login", addWorkerHeader: "Add New Worker", workerNameLabel: "Worker Name", workerNamePlaceholder: "Enter worker's name", addWorkerBtn: "Add Worker", workerListHeader: "Worker List", searchPlaceholder: "Search for a worker...", editWorkerHeader: "Edit Worker Profile", backBtn: "Back", professionLabel: "Profession", hourlyRateLabel: "Hourly Rate", overtimeRateLabel: "Overtime Rate", saveChangesBtn: "Save Changes", deleteWorkerBtn: "Delete Worker", editFileBtn: "Edit", newRecordBtn: "New Record", recordsTab: "Records", statsTab: "Reports", recordsTableHeaderDate: "Date", recordsTableHeaderType: "Type", recordsTableHeaderArrival: "Arrival", recordsTableHeaderDeparture: "Departure", recordsTableHeaderOvertime: "Overtime", recordsTableHeaderLocation: "Location", recordsTableHeaderActions: "Actions", filterByDate: "Filter by Date", applyBtn: "Apply", exportCsvBtn: "Export CSV", exportPdfBtn: "Export PDF", loadingStats: "Loading statistics...", backToWorkerListBtn: "Back to Worker List", addRecordTitle: "Add Attendance Record", recordDateLabel: "Date", recordTypeLabel: "Record Type", recordTypeAttendance: "Attendance", recordTypeAbsence: "Absence", arrivalTimeLabel: "Arrival Time", departureTimeLabel: "Departure Time", overtimeLabel: "Overtime Hours", saveRecordBtn: "Save Record", leaveManagementHeader: "Leave Request Management", newLeaveRequestTitle: "Submit New Leave Request", workerLabel: "Worker", selectWorkerOption: "Select a worker...", startDateLabel: "Start Date", endDateLabel: "End Date", submitRequestBtn: "Submit", leaveRequestsHistoryTitle: "Leave Requests History", statusLabel: "Status", actionsLabel: "Actions", userSettingsHeader: "User Settings", currentModeLabel: "Appearance", lightMode: "Light", darkMode: "Dark", saveSettingsBtn: "Save Settings", statusPending: "Pending", statusApproved: "Approved", statusRejected: "Rejected", approveBtn: "Approve", rejectBtn: "Reject",
        },
        ar: {
            pageTitle: "نظام حضور العمال السحابي", brandTitle: "حضور العمال", navHome: "الرئيسية", navWorkers: "قائمة العمال", navLeaveRequests: "طلبات الإجازة", navSettings: "الإعدادات", language: "اللغة", logoutBtn: "تسجيل الخروج", loginTitle: "تسجيل الدخول", loginSubtitle: "أدخل بريدك الإلكتروني وكلمة المرور للدخول.", emailPlaceholder: "البريد الإلكتروني", passwordPlaceholder: "كلمة المرور", loginBtn: "تسجيل الدخول", createAccountBtn: "إنشاء حساب", signupTitle: "إنشاء حساب جديد", signupSubtitle: "أدخل بياناتك للتسجيل.", backToLoginBtn: "عودة لتسجيل الدخول", addWorkerHeader: "إضافة عامل جديد", workerNameLabel: "اسم العامل", workerNamePlaceholder: "أدخل اسم العامل", addWorkerBtn: "إضافة عامل", workerListHeader: "قائمة العمال", searchPlaceholder: "ابحث عن عامل...", editWorkerHeader: "تعديل ملف العامل", backBtn: "العودة", professionLabel: "المهنة", hourlyRateLabel: "الأجر بالساعة", overtimeRateLabel: "أجر الساعة الإضافية", saveChangesBtn: "حفظ التعديلات", deleteWorkerBtn: "حذف العامل", editFileBtn: "تعديل", newRecordBtn: "سجل جديد", recordsTab: "السجلات", statsTab: "التقارير", recordsTableHeaderDate: "التاريخ", recordsTableHeaderType: "النوع", recordsTableHeaderArrival: "الحضور", recordsTableHeaderDeparture: "الانصراف", recordsTableHeaderOvertime: "إضافي", recordsTableHeaderLocation: "الموقع", recordsTableHeaderActions: "إجراءات", filterByDate: "فلترة حسب التاريخ", applyBtn: "تطبيق", exportCsvBtn: "تصدير CSV", exportPdfBtn: "تصدير PDF", loadingStats: "جاري تحميل الإحصائيات...", backToWorkerListBtn: "العودة لقائمة العمال", addRecordTitle: "إضافة سجل حضور", recordDateLabel: "التاريخ", recordTypeLabel: "نوع السجل", recordTypeAttendance: "حضور", recordTypeAbsence: "غياب", arrivalTimeLabel: "وقت الحضور", departureTimeLabel: "وقت الانصراف", overtimeLabel: "الساعات الإضافية", saveRecordBtn: "حفظ السجل", leaveManagementHeader: "إدارة طلبات الإجازة", newLeaveRequestTitle: "تقديم طلب إجازة جديد", workerLabel: "العامل", selectWorkerOption: "اختر عاملاً...", startDateLabel: "تاريخ البدء", endDateLabel: "تاريخ الانتهاء", submitRequestBtn: "إرسال", leaveRequestsHistoryTitle: "سجل طلبات الإجازة", statusLabel: "الحالة", actionsLabel: "إجراءات", userSettingsHeader: "إعدادات المستخدم", currentModeLabel: "المظهر", lightMode: "فاتح", darkMode: "داكن", saveSettingsBtn: "حفظ الإعدادات", statusPending: "معلق", statusApproved: "مقبول", statusRejected: "مرفوض", approveBtn: "موافقة", rejectBtn: "رفض",
        },
        fr: {
            pageTitle: "Système de Présence des Employés", brandTitle: "Présence Employés", navHome: "Accueil", navWorkers: "Liste des Employés", navLeaveRequests: "Demandes de Congé", navSettings: "Paramètres", language: "Langue", logoutBtn: "Déconnexion", loginTitle: "Connexion", loginSubtitle: "Entrez votre email et mot de passe.", emailPlaceholder: "Email", passwordPlaceholder: "Mot de passe", loginBtn: "Se connecter", createAccountBtn: "Créer un compte", signupTitle: "Créer un nouveau compte", signupSubtitle: "Entrez vos informations.", backToLoginBtn: "Retour à la connexion", addWorkerHeader: "Ajouter un Employé", workerNameLabel: "Nom de l'employé", workerNamePlaceholder: "Entrez le nom", addWorkerBtn: "Ajouter Employé", workerListHeader: "Liste des Employés", searchPlaceholder: "Rechercher un employé...", editWorkerHeader: "Modifier Profil", backBtn: "Retour", professionLabel: "Profession", hourlyRateLabel: "Taux Horaire", overtimeRateLabel: "Taux Heures Sup.", saveChangesBtn: "Enregistrer", deleteWorkerBtn: "Supprimer Employé", editFileBtn: "Modifier", newRecordBtn: "Nouveau Relevé", recordsTab: "Relevés", statsTab: "Rapports", recordsTableHeaderDate: "Date", recordsTableHeaderType: "Type", recordsTableHeaderArrival: "Arrivée", recordsTableHeaderDeparture: "Départ", recordsTableHeaderOvertime: "Heures Sup.", recordsTableHeaderLocation: "Lieu", recordsTableHeaderActions: "Actions", filterByDate: "Filtrer par Date", applyBtn: "Appliquer", exportCsvBtn: "Exporter CSV", exportPdfBtn: "Exporter PDF", loadingStats: "Chargement...", backToWorkerListBtn: "Retour à la liste", addRecordTitle: "Ajouter un Relevé", recordDateLabel: "Date", recordTypeLabel: "Type de relevé", recordTypeAttendance: "Présence", recordTypeAbsence: "Absence", arrivalTimeLabel: "Heure d'arrivée", departureTimeLabel: "Heure de départ", overtimeLabel: "Heures Supplémentaires", saveRecordBtn: "Enregistrer", leaveManagementHeader: "Gestion des Congés", newLeaveRequestTitle: "Nouvelle Demande", workerLabel: "Employé", selectWorkerOption: "Sélectionnez...", startDateLabel: "Date de Début", endDateLabel: "Date de Fin", submitRequestBtn: "Soumettre", leaveRequestsHistoryTitle: "Historique des Demandes", statusLabel: "Statut", actionsLabel: "Actions", userSettingsHeader: "Paramètres Utilisateur", currentModeLabel: "Apparence", lightMode: "Clair", darkMode: "Sombre", saveSettingsBtn: "Enregistrer", statusPending: "En attente", statusApproved: "Approuvé", statusRejected: "Rejeté", approveBtn: "Approuver", rejectBtn: "Rejeter",
        }
    };
    
    window.setLanguage = (lang) => {
        const langData = translations[lang] || translations.en;
        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.getAttribute('data-translate-key');
            if (langData[key]) {
                const target = el.placeholder !== undefined ? 'placeholder' : 'textContent';
                el[target] = langData[key];
            }
        });
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('appLanguage', lang);
    };

    // =================================================================
    // === 3. THEME (DARK/LIGHT MODE) MANAGEMENT
    // =================================================================
    const applyTheme = (theme) => {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        document.getElementById('themeSelect').value = theme;
    };

    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
        const selectedTheme = document.getElementById('themeSelect').value;
        localStorage.setItem('appTheme', selectedTheme);
        applyTheme(selectedTheme);
        alert('Settings saved!');
    });

    // =================================================================
    // === 4. NAVIGATION & UI HELPERS
    // =================================================================
    const showSection = (sectionName) => {
        Object.values(appSections).forEach(section => section.classList.add('hidden'));
        if (appSections[sectionName]) {
            appSections[sectionName].classList.remove('hidden');
        }
    };

    const showLoadingSkeleton = (listElement, skeletonElement) => {
        listElement.classList.add('hidden');
        skeletonElement.classList.remove('hidden');
    };

    const hideLoadingSkeleton = (listElement, skeletonElement) => {
        listElement.classList.remove('hidden');
        skeletonElement.classList.add('hidden');
    };
    
    const setupNavigation = () => {
        document.getElementById('navHome').addEventListener('click', (e) => { e.preventDefault(); showSection('home'); });
        document.getElementById('navWorkers').addEventListener('click', (e) => { e.preventDefault(); loadAndDisplayWorkers(); showSection('workersList'); });
        document.getElementById('navLeaveRequests').addEventListener('click', (e) => { e.preventDefault(); showSection('leaveManagement'); });
        document.getElementById('navSettings').addEventListener('click', (e) => { e.preventDefault(); showSection('settings'); });
        document.getElementById('backToWorkersList').addEventListener('click', () => showSection('workersList'));
        document.getElementById('backFromEditWorkerBtn').addEventListener('click', () => showSection('workersList'));
        document.getElementById('backFromRecordBtn').addEventListener('click', () => showSection('workerDetail'));
    };

    // =================================================================
    // === 5. AUTHENTICATION
    // =================================================================
    const setupAuth = () => {
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                mainAppSection.classList.remove('hidden');
                Object.values(authSections).forEach(s => s.classList.add('hidden'));
                document.getElementById('userEmail').textContent = user.email;
                document.getElementById('logoutBtn').classList.remove('hidden');
                
                const savedTheme = localStorage.getItem('appTheme') || 'light';
                const savedLang = localStorage.getItem('appLanguage') || 'ar';
                applyTheme(savedTheme);
                setLanguage(savedLang);

                showSection('home');
                loadAndDisplayWorkers();
                loadAndDisplayLeaveRequests();
            } else {
                currentUser = null;
                mainAppSection.classList.add('hidden');
                authSections.login.classList.remove('hidden');
                authSections.signup.classList.add('hidden');
                document.getElementById('userEmail').textContent = '';
                document.getElementById('logoutBtn').classList.add('hidden');
            }
        });

        document.getElementById('loginBtnAuth').addEventListener('click', () => {
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            auth.signInWithEmailAndPassword(email, password).catch(err => {
                document.getElementById('authErrorMsg').textContent = err.message;
            });
        });

        document.getElementById('signupBtn').addEventListener('click', () => {
            const email = document.getElementById('signupEmailInput').value;
            const password = document.getElementById('signupPasswordInput').value;
            auth.createUserWithEmailAndPassword(email, password).catch(err => {
                document.getElementById('signupErrorMsg').textContent = err.message;
            });
        });

        document.getElementById('logoutBtn').addEventListener('click', () => auth.signOut());
        document.getElementById('gotoSignupBtn').addEventListener('click', () => {
            authSections.login.classList.add('hidden');
            authSections.signup.classList.remove('hidden');
        });
        document.getElementById('backToLoginBtn').addEventListener('click', () => {
            authSections.signup.classList.add('hidden');
            authSections.login.classList.remove('hidden');
        });
    };

    // =================================================================
    // === 6. WORKER MANAGEMENT (CRUD)
    // =================================================================
    const setupWorkerManagement = () => {
        const addWorkerForm = document.getElementById('addWorkerForm');
        const workersListEl = document.getElementById('workersList');
        const workersListSkeleton = document.getElementById('workersListSkeleton');

        addWorkerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const workerName = document.getElementById('workerNameInput').value.trim();
            if (!workerName || !currentUser) return;

            try {
                await db.collection('users').doc(currentUser.uid).collection('workers').add({
                    name: workerName,
                    profession: '',
                    hourlyRate: 0,
                    overtimeRate: 0,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                addWorkerForm.reset();
                alert('Worker added successfully!');
                loadAndDisplayWorkers();
                showSection('workersList');
            } catch (error) {
                console.error("Error adding worker: ", error);
            }
        });

        window.loadAndDisplayWorkers = async () => {
            if (!currentUser) return;
            showLoadingSkeleton(workersListEl, workersListSkeleton);
            
            try {
                const snapshot = await db.collection('users').doc(currentUser.uid).collection('workers').orderBy('name').get();
                workersCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                displayWorkers(workersCache);
                populateWorkerSelects();
            } catch (error) {
                console.error("Error loading workers: ", error);
            } finally {
                hideLoadingSkeleton(workersListEl, workersListSkeleton);
            }
        };

        const displayWorkers = (workers) => {
            workersListEl.innerHTML = '';
            if (workers.length === 0) {
                workersListEl.innerHTML = `<li class="list-group-item text-center text-muted">No workers added yet.</li>`;
                return;
            }
            workers.forEach(worker => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center pointer';
                li.innerHTML = `<div><strong>${worker.name}</strong><small class="d-block text-muted">${worker.profession || 'No profession'}</small></div><i class="fas fa-chevron-right text-muted"></i>`;
                li.addEventListener('click', () => showWorkerDetails(worker.id));
                workersListEl.appendChild(li);
            });
        };

        const showWorkerDetails = async (workerId) => {
            currentWorkerId = workerId;
            const worker = workersCache.find(w => w.id === workerId);
            if (!worker) return;

            document.getElementById('workerDetailName').textContent = worker.name;
            document.getElementById('startDateFilter').value = '';
            document.getElementById('endDateFilter').value = '';

            await loadAndDisplayRecords(workerId);
            showSection('workerDetail');
        };

        document.getElementById('editWorkerBtn').addEventListener('click', () => {
            const worker = workersCache.find(w => w.id === currentWorkerId);
            if (!worker) return;
            document.getElementById('editWorkerId').value = worker.id;
            document.getElementById('editWorkerName').value = worker.name;
            document.getElementById('editWorkerProfession').value = worker.profession || '';
            document.getElementById('editWorkerHourlyRate').value = worker.hourlyRate || 0;
            document.getElementById('editWorkerOvertimeRate').value = worker.overtimeRate || 0;
            showSection('editWorker');
        });

        document.getElementById('editWorkerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const workerId = document.getElementById('editWorkerId').value;
            const data = {
                name: document.getElementById('editWorkerName').value,
                profession: document.getElementById('editWorkerProfession').value,
                hourlyRate: parseFloat(document.getElementById('editWorkerHourlyRate').value) || 0,
                overtimeRate: parseFloat(document.getElementById('editWorkerOvertimeRate').value) || 0
            };
            await db.collection('users').doc(currentUser.uid).collection('workers').doc(workerId).update(data);
            alert('Worker updated!');
            await loadAndDisplayWorkers();
            showSection('workersList');
        });
        
        document.getElementById('deleteWorkerBtn').addEventListener('click', async () => {
            const workerId = document.getElementById('editWorkerId').value;
            if (!confirm('Are you sure you want to delete this worker and all their records? This cannot be undone.')) return;
            await db.collection('users').doc(currentUser.uid).collection('workers').doc(workerId).delete();
            alert('Worker deleted!');
            await loadAndDisplayWorkers();
            showSection('workersList');
        });

        document.getElementById('searchInput').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredWorkers = workersCache.filter(worker => worker.name.toLowerCase().includes(searchTerm));
            displayWorkers(filteredWorkers);
        });
    };
    
    // =================================================================
    // === 7. ATTENDANCE RECORD MANAGEMENT
    // =================================================================
    const setupRecordManagement = () => {
        document.getElementById('addRecordBtn').addEventListener('click', () => {
            document.getElementById('recordForm').reset();
            document.getElementById('recordId').value = '';
            document.getElementById('recordDate').valueAsDate = new Date();
            showSection('record');
        });

        document.getElementById('recordForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const recordId = document.getElementById('recordId').value;
            
            const location = await captureLocation();

            const recordData = {
                date: document.getElementById('recordDate').value,
                type: document.getElementById('recordType').value,
                arrivalTime: document.getElementById('arrivalTime').value,
                departureTime: document.getElementById('departureTime').value,
                overtime: parseFloat(document.getElementById('overtime').value) || 0,
                location: location
            };
            
            const recordRef = db.collection('users').doc(currentUser.uid).collection('workers').doc(currentWorkerId).collection('records');
            try {
                if (recordId) {
                    await recordRef.doc(recordId).update(recordData);
                } else {
                    await recordRef.add(recordData);
                }
                alert('Record saved!');
                await loadAndDisplayRecords(currentWorkerId);
                showSection('workerDetail');
            } catch (error) {
                console.error("Error saving record: ", error);
            }
        });

        window.loadAndDisplayRecords = async (workerId, startDate = null, endDate = null) => {
            let query = db.collection('users').doc(currentUser.uid).collection('workers').doc(workerId).collection('records').orderBy('date', 'desc');
            if (startDate) query = query.where('date', '>=', startDate);
            if (endDate) query = query.where('date', '<=', endDate);
            const snapshot = await query.get();
            currentRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderRecordsTable(currentRecords);
            renderStatistics(currentRecords, workerId);
        };
        
        const renderRecordsTable = (records) => {
            const tableBody = document.getElementById('recordsTableBody');
            tableBody.innerHTML = '';
            if (records.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No records found.</td></tr>`;
                return;
            }
            records.forEach(record => {
                const tr = document.createElement('tr');
                const locationHTML = record.location ? `<a id="locationLink" href="https://www.google.com/maps?q=${record.location.latitude},${record.location.longitude}" target="_blank">View</a>` : 'N/A';
                tr.innerHTML = `<td>${record.date}</td><td>${record.type}</td><td>${record.arrivalTime || '--'}</td><td>${record.departureTime || '--'}</td><td>${record.overtime || 0}</td><td>${locationHTML}</td><td><button class="btn btn-sm btn-outline-danger delete-record-btn" data-id="${record.id}"><i class="fas fa-trash"></i></button></td>`;
                tableBody.appendChild(tr);
            });
        };

        document.getElementById('recordsTableBody').addEventListener('click', async (e) => {
            const btn = e.target.closest('button.delete-record-btn');
            if (!btn) return;
            const recordId = btn.dataset.id;
            if (!confirm('Are you sure you want to delete this record?')) return;
            await db.collection('users').doc(currentUser.uid).collection('workers').doc(currentWorkerId).collection('records').doc(recordId).delete();
            await loadAndDisplayRecords(currentWorkerId);
        });

        document.getElementById('recordType').addEventListener('change', (e) => {
            document.getElementById('timeFields').style.display = e.target.value === 'حضور' ? 'block' : 'none';
        });
    };

    // =================================================================
    // === 8. GEOLOCATION
    // =================================================================
    const captureLocation = () => {
        return new Promise(resolve => {
            if (!('geolocation' in navigator)) { resolve(null); return; }
            navigator.geolocation.getCurrentPosition(
                pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                () => resolve(null),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    };
    
    // =================================================================
    // === 9. REPORTS, STATISTICS & EXPORTING
    // =================================================================
    const setupReporting = () => {
        document.getElementById('applyFilterBtn').addEventListener('click', () => {
            const startDate = document.getElementById('startDateFilter').value;
            const endDate = document.getElementById('endDateFilter').value;
            loadAndDisplayRecords(currentWorkerId, startDate || null, endDate || null);
        });

        window.renderStatistics = (records, workerId) => {
            const container = document.getElementById('statisticsContainer');
            const worker = workersCache.find(w => w.id === workerId);
            if (!worker) { container.innerHTML = '<p class="text-muted">Worker data not found.</p>'; return; }

            const presentDays = records.filter(r => r.type === 'حضور').length;
            const absentDays = records.filter(r => r.type === 'غياب').length;
            const onLeaveDays = records.filter(r => r.type === 'إجازة').length;
            const totalOvertime = records.reduce((sum, r) => sum + (parseFloat(r.overtime) || 0), 0);
            const totalWorkHours = records.reduce((sum, r) => {
                if (r.arrivalTime && r.departureTime) {
                    const diff = (new Date(`1970-01-01T${r.departureTime}`) - new Date(`1970-01-01T${r.arrivalTime}`)) / 3600000;
                    return sum + (diff > 0 ? diff : 0);
                }
                return sum;
            }, 0);

            const hourlyRate = parseFloat(worker.hourlyRate) || 0;
            const overtimeRate = parseFloat(worker.overtimeRate) || hourlyRate;
            const salary = ((totalWorkHours - totalOvertime) * hourlyRate) + (totalOvertime * overtimeRate);

            container.innerHTML = `<div class="card-body"><h5>Performance Summary</h5><div class="row text-center my-3"><div class="col"><strong>${presentDays}</strong><br><small>Present</small></div><div class="col"><strong>${absentDays}</strong><br><small>Absent</small></div><div class="col"><strong>${onLeaveDays}</strong><br><small>On Leave</small></div></div><hr><h5>Hours & Salary Summary</h5><p>Total Work Hours: <strong>${totalWorkHours.toFixed(2)} hrs</strong></p><p>Total Overtime Hours: <strong>${totalOvertime.toFixed(2)} hrs</strong></p><h5 class="mt-3">Estimated Salary: <span class="text-success">${salary.toFixed(2)}</span></h5><canvas id="statsChart" class="mt-4" style="max-height: 250px;"></canvas></div>`;

            const ctx = document.getElementById('statsChart').getContext('2d');
            if (attendanceChart) attendanceChart.destroy();
            attendanceChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Present', 'Absent', 'On Leave'], datasets: [{ data: [presentDays, absentDays, onLeaveDays], backgroundColor: ['#34c759', '#ff3b30', '#ff9500'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
        };

        document.getElementById('exportCsvBtn').addEventListener('click', () => {
            const worker = workersCache.find(w => w.id === currentWorkerId);
            let csvContent = "data:text/csv;charset=utf-8,Date,Type,Arrival,Departure,Overtime\n";
            currentRecords.forEach(r => {
                csvContent += `${r.date},${r.type},${r.arrivalTime || ''},${r.departureTime || ''},${r.overtime || 0}\n`;
            });
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${worker.name}_report.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const worker = workersCache.find(w => w.id === currentWorkerId);
            
            doc.text(`Attendance Report for: ${worker.name}`, 14, 16);
            
            const tableColumn = ["Date", "Type", "Arrival", "Departure", "Overtime"];
            const tableRows = [];
            currentRecords.forEach(r => {
                const rowData = [r.date, r.type, r.arrivalTime || '-', r.departureTime || '-', r.overtime || 0];
                tableRows.push(rowData);
            });

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 20,
            });
            
            doc.save(`${worker.name}_report.pdf`);
        });
    };

    // =================================================================
    // === 10. LEAVE MANAGEMENT
    // =================================================================
    const setupLeaveManagement = () => {
        const leaveWorkerSelect = document.getElementById('leaveWorkerSelect');
        
        window.populateWorkerSelects = () => {
            leaveWorkerSelect.innerHTML = `<option value="" data-translate-key="selectWorkerOption">Select a worker...</option>`;
            workersCache.forEach(worker => {
                const option = document.createElement('option');
                option.value = worker.id;
                option.textContent = worker.name;
                leaveWorkerSelect.appendChild(option);
            });
        };

        document.getElementById('leaveRequestForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const workerId = leaveWorkerSelect.value;
            const workerName = workersCache.find(w => w.id === workerId)?.name;
            if (!workerId) { alert("Please select a worker."); return; }

            const request = {
                workerId, workerName,
                startDate: document.getElementById('leaveStartDate').value,
                endDate: document.getElementById('leaveEndDate').value,
                status: 'pending',
                requestedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('users').doc(currentUser.uid).collection('leaveRequests').add(request);
            alert('Leave request submitted!');
            document.getElementById('leaveRequestForm').reset();
            loadAndDisplayLeaveRequests();
        });

        window.loadAndDisplayLeaveRequests = async () => {
            const snapshot = await db.collection('users').doc(currentUser.uid).collection('leaveRequests').orderBy('requestedAt', 'desc').get();
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderLeaveRequests(requests);
        };

        const renderLeaveRequests = (requests) => {
            const tableBody = document.getElementById('leaveRequestsTableBody');
            tableBody.innerHTML = '';
            requests.forEach(req => {
                const tr = document.createElement('tr');
                let actionsHtml = '';
                if (req.status === 'pending') {
                    actionsHtml = `<button class="btn btn-sm btn-approve" data-id="${req.id}" data-translate-key="approveBtn">Approve</button> <button class="btn btn-sm btn-reject" data-id="${req.id}" data-translate-key="rejectBtn">Reject</button>`;
                }
                tr.innerHTML = `<td>${req.workerName}</td><td>${req.startDate}</td><td>${req.endDate}</td><td><span class="status-${req.status}" data-translate-key="status${req.status.charAt(0).toUpperCase() + req.status.slice(1)}">${req.status}</span></td><td>${actionsHtml}</td>`;
                tableBody.appendChild(tr);
            });
        };

        document.getElementById('leaveRequestsTableBody').addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;
            const requestId = btn.dataset.id;
            const newStatus = btn.classList.contains('btn-approve') ? 'approved' : 'rejected';
            
            await db.collection('users').doc(currentUser.uid).collection('leaveRequests').doc(requestId).update({ status: newStatus });
            
            if (newStatus === 'approved') {
                const req = (await db.collection('users').doc(currentUser.uid).collection('leaveRequests').doc(requestId).get()).data();
                const start = new Date(req.startDate);
                const end = new Date(req.endDate);
                for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                    const dateString = d.toISOString().split('T')[0];
                    await db.collection('users').doc(currentUser.uid).collection('workers').doc(req.workerId).collection('records').add({ date: dateString, type: 'إجازة' });
                }
            }
            loadAndDisplayLeaveRequests();
        });
    };

    // =================================================================
    // === 11. INITIALIZATION CALLS
    // =================================================================
    setupNavigation();
    setupAuth();
    setupWorkerManagement();
    setupRecordManagement();
    setupReporting();
    setupLeaveManagement();
});
