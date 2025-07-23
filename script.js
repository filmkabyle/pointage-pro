var firebaseConfig = {
  apiKey: "AIzaSyDAR0_nS6yK_qUa_kVX_fJdPx_C4Nu1jjI",
  authDomain: "vpn-pro-23526.firebaseapp.com",
  databaseURL: "https://vpn-pro-23526-default-rtdb.firebaseio.com",
  projectId: "vpn-pro-23526",
  storageBucket: "vpn-pro-23526.appspot.com",
  messagingSenderId: "250679041250",
  appId: "1:250679041250:web:c6d988aedc514769d952bb",
  measurementId: "G-FF3VXH5LSW"
};
firebase.initializeApp(firebaseConfig);
var auth = firebase.auth();
var db = firebase.firestore();
var loginSection = document.getElementById("loginSection");
var signupSection = document.getElementById("signupSection");
var appSection = document.getElementById("appSection");
var emailInput = document.getElementById("emailInput");
var passwordInput = document.getElementById("passwordInput");
var authErrorMsg = document.getElementById("authErrorMsg");
var loginBtnAuth = document.getElementById("loginBtnAuth");
var gotoSignupBtn = document.getElementById("gotoSignupBtn");
var logoutBtn = document.getElementById("logoutBtn");
var userEmailSpan = document.getElementById("userEmail");
var usernameInput = document.getElementById("usernameInput");
var signupEmailInput = document.getElementById("signupEmailInput");
var signupPasswordInput = document.getElementById("signupPasswordInput");
var signupBtn = document.getElementById("signupBtn");
var backToLoginBtn = document.getElementById("backToLoginBtn");
var signupErrorMsg = document.getElementById("signupErrorMsg");
function showApp(){
  loginSection.classList.add("hidden");
  signupSection.classList.add("hidden");
  appSection.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
}
function showAuth(){
  loginSection.classList.remove("hidden");
  signupSection.classList.add("hidden");
  appSection.classList.add("hidden");
  logoutBtn.classList.add("hidden");
}
gotoSignupBtn.addEventListener("click", function(){
  loginSection.classList.add("hidden");
  signupSection.classList.remove("hidden");
});
backToLoginBtn.addEventListener("click", function(){
  signupSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});
loginBtnAuth.addEventListener("click", function(){
  var email = emailInput.value;
  var password = passwordInput.value;
  auth.signInWithEmailAndPassword(email, password)
    .then(function(){
      authErrorMsg.textContent = "";
      showApp();
      loadWorkers();
    })
    .catch(function(error){
      authErrorMsg.textContent = error.message;
    });
});
signupBtn.addEventListener("click", function(){
  var username = usernameInput.value;
  var email = signupEmailInput.value;
  var password = signupPasswordInput.value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(function(result){
      return result.user.updateProfile({ displayName: username });
    })
    .then(function(){
      signupErrorMsg.textContent = "";
      showApp();
    })
    .catch(function(error){
      signupErrorMsg.textContent = error.message;
    });
});
logoutBtn.addEventListener("click", function(){
  auth.signOut().then(function(){
    showAuth();
  }).catch(function(error){
    console.error("خطأ أثناء تسجيل الخروج:", error);
  });
});
auth.onAuthStateChanged(function(user){
  if(user){
    userEmailSpan.textContent = user.email;
    showApp();
    loadWorkers();
  } else {
    userEmailSpan.textContent = "";
    showAuth();
  }
});
var currentWorkerId = "";
var activityLog = [];
function hideAllSections(){
  document.getElementById("homeSection").classList.add("hidden");
  document.getElementById("workersListSection").classList.add("hidden");
  document.getElementById("workerDetailSection").classList.add("hidden");
  document.getElementById("recordSection").classList.add("hidden");
  document.getElementById("dashboardSection").classList.add("hidden");
  document.getElementById("activityLogSection").classList.add("hidden");
  document.getElementById("shiftScheduleSection").classList.add("hidden");
  document.getElementById("fingerprintAttendanceSection").classList.add("hidden");
  document.getElementById("settingsSection").classList.add("hidden");
  document.getElementById("detailedReportSection").classList.add("hidden");
  document.getElementById("helpSection").classList.add("hidden");
  document.getElementById("editWorkerSection").classList.add("hidden");
}
var navHome = document.getElementById("navHome");
var navWorkers = document.getElementById("navWorkers");
var navDashboard = document.getElementById("navDashboard");
var navActivity = document.getElementById("navActivity");
var navShifts = document.getElementById("navShifts");
var navFingerprintAttendance = document.getElementById("navFingerprintAttendance");
var navSettings = document.getElementById("navSettings");
var navHelp = document.getElementById("navHelp");
navHome.addEventListener("click", function(e){ e.preventDefault(); hideAllSections(); document.getElementById("homeSection").classList.remove("hidden"); });
navWorkers.addEventListener("click", function(e){ e.preventDefault(); hideAllSections(); document.getElementById("workersListSection").classList.remove("hidden"); loadWorkers(); });
navDashboard.addEventListener("click", function(e){ e.preventDefault(); hideAllSections(); document.getElementById("dashboardSection").classList.remove("hidden"); renderChart(); });
navActivity.addEventListener("click", function(e){ e.preventDefault(); hideAllSections(); document.getElementById("activityLogSection").classList.remove("hidden"); updateActivityLogDisplay(); });
navShifts.addEventListener("click", function(e){ e.preventDefault(); hideAllSections(); document.getElementById("shiftScheduleSection").classList.remove("hidden"); loadShiftWorkers(); loadShifts(); });
navFingerprintAttendance.addEventListener("click", function(e){ e.preventDefault(); hideAllSections(); document.getElementById("fingerprintAttendanceSection").classList.remove("hidden"); });
navSettings.addEventListener("click", function(e){ e.preventDefault(); hideAllSections(); document.getElementById("settingsSection").classList.remove("hidden"); });
navHelp.addEventListener("click", function(e){ e.preventDefault(); hideAllSections(); document.getElementById("helpSection").classList.remove("hidden"); });
document.getElementById("backFromFingerprintAttendance").addEventListener("click", function(){ hideAllSections(); document.getElementById("homeSection").classList.remove("hidden"); });
function loadWorkers(){
  var workersList = document.getElementById("workersList");
  var user = auth.currentUser;
  if(!user) return;
  db.collection("workers").where("createdBy", "==", user.uid).orderBy("createdAt").onSnapshot(function(snapshot){
    workersList.innerHTML = "";
    snapshot.forEach(function(doc){
      var worker = doc.data();
      var li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center pointer";
      li.innerHTML = "<span onclick=\"window.showWorkerDetail('" + doc.id + "')\">" + worker.name + "</span><div><button class='btn btn-sm btn-outline-warning me-1' onclick=\"window.editWorker('" + doc.id + "')\"><i class='fas fa-edit'></i></button><button class='btn btn-sm btn-outline-danger' onclick=\"window.deleteWorkerItem('" + doc.id + "')\"><i class='fas fa-trash'></i></button></div>";
      workersList.appendChild(li);
    });
  });
}
function deleteWorkerItem(workerId){
  if(confirm("هل أنت متأكد من حذف هذا العامل?")){
    db.collection("workers").doc(workerId).delete().then(function(){ logActivity("تم حذف العامل"); }).catch(function(error){ console.error("Error deleting worker:", error); });
  }
}
function editWorker(workerId){
  db.collection("workers").doc(workerId).get().then(function(doc){
    if(doc.exists){
      var worker = doc.data();
      document.getElementById("editWorkerId").value = workerId;
      document.getElementById("editWorkerName").value = worker.name || "";
      document.getElementById("editWorkerPhone").value = worker.phone || "";
      document.getElementById("editWorkerProfession").value = worker.profession || "";
      document.getElementById("editWorkerGmail").value = worker.gmail || "";
      document.getElementById("editWorkerAddress").value = worker.address || "";
      const statusElem = document.getElementById("fingerprintStatus");
      if(worker.fingerprintData) { statusElem.textContent = translations.fingerprintStatusRegistered[localStorage.getItem('selectedLanguage') || 'ar']; }
      else { statusElem.textContent = translations.fingerprintStatusNotRegistered[localStorage.getItem('selectedLanguage') || 'ar']; }
      hideAllSections();
      document.getElementById("editWorkerSection").classList.remove("hidden");
    }
  });
}
window.editWorker = editWorker;
window.deleteWorkerItem = deleteWorkerItem;
document.getElementById("editWorkerForm").addEventListener("submit", function(e){
  e.preventDefault();
  var workerId = document.getElementById("editWorkerId").value;
  var updatedData = { name: document.getElementById("editWorkerName").value.trim(), phone: document.getElementById("editWorkerPhone").value.trim(), profession: document.getElementById("editWorkerProfession").value.trim(), gmail: document.getElementById("editWorkerGmail").value.trim(), address: document.getElementById("editWorkerAddress").value.trim() };
  db.collection("workers").doc(workerId).update(updatedData).then(function(){ logActivity("تم تحديث ملف العامل"); hideAllSections(); document.getElementById("workersListSection").classList.remove("hidden"); }).catch(function(error){ console.error("Error updating worker:", error); });
});
document.getElementById("backFromEditWorkerBtn").addEventListener("click", function(){ hideAllSections(); document.getElementById("workersListSection").classList.remove("hidden"); });
document.getElementById("searchInput").addEventListener("input", function(){
  var filter = this.value.toLowerCase();
  var items = document.querySelectorAll("#workersList li");
  items.forEach(function(item){ item.style.display = item.textContent.toLowerCase().includes(filter) ? "block" : "none"; });
});
function showWorkerDetail(workerId){
  db.collection("workers").doc(workerId).get().then(function(doc){
    if(doc.exists){
      var worker = doc.data();
      currentWorkerId = workerId;
      document.getElementById("workerDetailName").textContent = worker.name;
      loadWorkerRecords(workerId);
      loadStatistics(workerId);
      hideAllSections();
      document.getElementById("workerDetailSection").classList.remove("hidden");
      logActivity("عرض تفاصيل العامل: " + worker.name);
    }
  });
}
window.showWorkerDetail = showWorkerDetail;
document.getElementById("backToWorkersList").addEventListener("click", function(){ hideAllSections(); document.getElementById("workersListSection").classList.remove("hidden"); });
function loadWorkerRecords(workerId){
  var recordsTableBody = document.getElementById("recordsTableBody");
  db.collection("workers").doc(workerId).collection("records").orderBy("date").onSnapshot(function(snapshot){
    recordsTableBody.innerHTML = "";
    snapshot.forEach(function(doc){
      var record = doc.data();
      var tr = document.createElement("tr");
      var formattedDate = record.date ? record.date.split("-").reverse().join("/") : "-";
      var locationCell = "-";
      var lang = localStorage.getItem('selectedLanguage') || 'ar';
      tr.innerHTML = "<td>" + formattedDate + "</td><td>" + (record.type === 'حضور' ? translations.recordTypeAttendance[lang] : translations.recordTypeAbsence[lang]) + "</td><td>" + (record.arrival || "-") + "</td><td>" + (record.departure || "-") + "</td><td>" + (record.overtime || "0") + "</td><td>" + locationCell + "</td><td><button class='btn btn-ios-outline btn-sm' onclick=\"openRecordSection('" + workerId + "', '" + doc.id + "')\"><i class='fas fa-edit'></i></button> <button class='btn btn-danger btn-sm' onclick=\"deleteRecord('" + workerId + "', '" + doc.id + "')\"><i class='fas fa-trash'></i></button></td>";
      recordsTableBody.appendChild(tr);
    });
  });
}
function loadStatistics(workerId){
  var statsContainer = document.getElementById("statisticsContainer");
  var lang = localStorage.getItem('selectedLanguage') || 'ar';
  db.collection("workers").doc(workerId).collection("records").onSnapshot(function(snapshot){
    var totalAttendance = 0, totalAbsences = 0, totalOvertime = 0;
    snapshot.forEach(function(doc){
      var record = doc.data();
      if(record.type === "حضور") totalAttendance++;
      if(record.type === "غياب") totalAbsences++;
      totalOvertime += parseFloat(record.overtime || 0);
    });
    statsContainer.innerHTML = "<div class='row'><div class='col-md-4 mb-3'><div class='card text-white bg-primary'><div class='card-body text-center'><h5 class='card-title'>" + translations.statsAttendance[lang] + "</h5><p class='card-text' style='font-size: 1.5rem;'>" + totalAttendance + "</p></div></div></div><div class='col-md-4 mb-3'><div class='card text-white bg-danger'><div class='card-body text-center'><h5 class='card-title'>" + translations.statsAbsence[lang] + "</h5><p class='card-text' style='font-size: 1.5rem;'>" + totalAbsences + "</p></div></div></div><div class='col-md-4 mb-3'><div class='card text-white bg-success'><div class='card-body text-center'><h5 class='card-title'>" + translations.statsOvertime[lang] + "</h5><p class='card-text' style='font-size: 1.5rem;'>" + totalOvertime.toFixed(1) + "</p></div></div></div></div>";
  });
}
function openRecordSection(workerId, recordId){
  hideAllSections();
  document.getElementById("recordSection").classList.remove("hidden");
  var formTitle = document.getElementById("recordFormTitle");
  var lang = localStorage.getItem('selectedLanguage') || 'ar';
  document.getElementById("recordForm").reset();
  document.getElementById("recordId").value = recordId || "";
  if(recordId === ""){
    formTitle.textContent = translations.addRecordTitle[lang];
    toggleTimeFields();
  } else {
    formTitle.textContent = translations.editRecordTitle[lang];
    db.collection("workers").doc(workerId).collection("records").doc(recordId).get().then(function(doc){
      if(doc.exists){
        var record = doc.data();
        document.getElementById("recordDate").value = record.date;
        document.getElementById("recordType").value = record.type;
        document.getElementById("arrivalTime").value = record.arrival;
        document.getElementById("departureTime").value = record.departure;
        document.getElementById("overtime").value = record.overtime;
        toggleTimeFields();
      }
    });
  }
}
document.getElementById("addRecordBtn").addEventListener("click", function(){ openRecordSection(currentWorkerId, ""); });
document.getElementById("backFromRecordBtn").addEventListener("click", function(){ hideAllSections(); document.getElementById("workerDetailSection").classList.remove("hidden"); });
function toggleTimeFields(){
  var type = document.getElementById("recordType").value;
  var timeFields = document.getElementById("timeFields");
  if(type === "غياب"){
    timeFields.style.display = "none";
    document.getElementById("arrivalTime").value = "";
    document.getElementById("departureTime").value = "";
  } else {
    timeFields.style.display = "block";
  }
}
document.getElementById("recordType").addEventListener("change", toggleTimeFields);
document.getElementById("recordForm").addEventListener("submit", function(e){
  e.preventDefault();
  var recordId = document.getElementById("recordId").value;
  var date = document.getElementById("recordDate").value;
  var type = document.getElementById("recordType").value;
  var arrival = (type === "غياب") ? "" : document.getElementById("arrivalTime").value;
  var departure = (type === "غياب") ? "" : document.getElementById("departureTime").value;
  var overtime = document.getElementById("overtime").value || "0";
  var recordData = { date: date, type: type, arrival: arrival, departure: departure, overtime: overtime, createdBy: auth.currentUser.uid };
  if(recordId === ""){
    db.collection("workers").doc(currentWorkerId).collection("records").add(recordData).then(function(){ logActivity("تم إضافة سجل حضور بتاريخ " + date); hideAllSections(); document.getElementById("workerDetailSection").classList.remove("hidden"); }).catch(function(error){ console.error("Error saving record:", error); });
  } else {
    db.collection("workers").doc(currentWorkerId).collection("records").doc(recordId).set(recordData).then(function(){ logActivity("تم تحديث سجل حضور بتاريخ " + date); hideAllSections(); document.getElementById("workerDetailSection").classList.remove("hidden"); }).catch(function(error){ console.error("Error updating record:", error); });
  }
});
function deleteRecord(workerId, recordId){
  if(confirm("هل أنت متأكد من حذف السجل؟")){
    db.collection("workers").doc(workerId).collection("records").doc(recordId).delete().then(function(){ logActivity("تم حذف سجل حضور"); }).catch(function(error){ console.error("Error deleting record:", error); });
  }
}
var chartInstance;
function renderChart(){
  var lang = localStorage.getItem('selectedLanguage') || 'ar';
  db.collection("workers").doc(currentWorkerId).collection("records").get().then(function(snapshot){
    var attendance = 0, absence = 0;
    snapshot.forEach(function(doc){
      var record = doc.data();
      if(record.type === "حضور") attendance++;
      else if(record.type === "غياب") absence++;
    });
    var ctx = document.getElementById("attendanceChart").getContext("2d");
    if(chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: { labels: [translations.recordTypeAttendance[lang], translations.recordTypeAbsence[lang]], datasets: [{ data: [attendance, absence], backgroundColor: ['#28a745', '#dc3545'] }] },
      options: { responsive: true }
    });
  });
}
function logActivity(message){
  var timestamp = new Date().toLocaleTimeString();
  var logEntry = timestamp + " - " + message;
  activityLog.push(logEntry);
  updateActivityLogDisplay();
}
function updateActivityLogDisplay(){
  var logList = document.getElementById("activityLogList");
  if(!logList) return;
  logList.innerHTML = "";
  activityLog.slice().reverse().forEach(function(entry){
    var li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = entry;
    logList.appendChild(li);
  });
}
document.getElementById("detailedReportBtn").addEventListener("click", function(){ showDetailedReport(); });
function showDetailedReport(){
  var lang = localStorage.getItem('selectedLanguage') || 'ar';
  db.collection("workers").doc(currentWorkerId).collection("records").orderBy("date").get().then(function(snapshot){
    var totalAttendance = 0, totalAbsences = 0, totalOvertime = 0;
    var tableRows = "";
    snapshot.forEach(function(doc){
      var record = doc.data();
      if(record.type === "حضور") totalAttendance++;
      if(record.type === "غياب") totalAbsences++;
      totalOvertime += parseFloat(record.overtime || 0);
      tableRows += "<tr><td>" + (record.date || "-") + "</td><td>" + (record.type === 'حضور' ? translations.recordTypeAttendance[lang] : translations.recordTypeAbsence[lang]) + "</td><td>" + (record.arrival || "-") + "</td><td>" + (record.departure || "-") + "</td><td>" + (record.overtime || "0") + "</td></tr>";
    });
    var reportHtml = "<div class='row mb-3'><div class='col-md-4 mb-3'><div class='card text-white bg-primary'><div class='card-body text-center'><h5 class='card-title'>" + translations.statsAttendance[lang] + "</h5><p class='card-text' style='font-size: 1.5rem;'>" + totalAttendance + "</p></div></div></div><div class='col-md-4 mb-3'><div class='card text-white bg-danger'><div class='card-body text-center'><h5 class='card-title'>" + translations.statsAbsence[lang] + "</h5><p class='card-text' style='font-size: 1.5rem;'>" + totalAbsences + "</p></div></div></div><div class='col-md-4 mb-3'><div class='card text-white bg-success'><div class='card-body text-center'><h5 class='card-title'>" + translations.statsOvertime[lang] + "</h5><p class='card-text' style='font-size: 1.5rem;'>" + totalOvertime.toFixed(1) + "</p></div></div></div></div><h5 class='mb-3'>" + translations.recordsTableTitle[lang] + "</h5><div class='table-responsive'><table class='table table-bordered'><thead class='table-light'><tr><th>" + translations.recordsTableHeaderDate[lang] + "</th><th>" + translations.recordsTableHeaderType[lang] + "</th><th>" + translations.recordsTableHeaderArrival[lang] + "</th><th>" + translations.recordsTableHeaderDeparture[lang] + "</th><th>" + translations.recordsTableHeaderOvertime[lang] + "</th></tr></thead><tbody>" + tableRows + "</tbody></table></div>";
    document.getElementById("detailedReportContent").innerHTML = reportHtml;
    hideAllSections();
    document.getElementById("detailedReportSection").classList.remove("hidden");
  });
}
document.getElementById("backFromDetailedReportBtn").addEventListener("click", function(){ hideAllSections(); document.getElementById("workerDetailSection").classList.remove("hidden"); });
document.getElementById("backFromHelpBtn").addEventListener("click", function(){ hideAllSections(); document.getElementById("homeSection").classList.remove("hidden"); });
function loadShiftWorkers(){
  var shiftWorkerSelect = document.getElementById("shiftWorkerSelect");
  var lang = localStorage.getItem('selectedLanguage') || 'ar';
  shiftWorkerSelect.innerHTML = '<option value="">' + translations.selectWorkerOption[lang] + '</option>';
  var user = auth.currentUser;
  if(!user) return;
  db.collection("workers").where("createdBy", "==", user.uid).orderBy("createdAt").get().then(function(snapshot){
    snapshot.forEach(function(doc){
      var worker = doc.data();
      var option = document.createElement("option");
      option.value = doc.id;
      option.textContent = worker.name;
      shiftWorkerSelect.appendChild(option);
    });
  });
}
document.getElementById("shiftForm").addEventListener("submit", function(e){
  e.preventDefault();
  var shiftDate = document.getElementById("shiftDate").value;
  var workerId = document.getElementById("shiftWorkerSelect").value;
  var shiftStart = document.getElementById("shiftStart").value;
  var shiftEnd = document.getElementById("shiftEnd").value;
  if(!shiftDate || !workerId || !shiftStart || !shiftEnd) return;
  db.collection("shifts").add({ shiftDate: shiftDate, workerId: workerId, shiftStart: shiftStart, shiftEnd: shiftEnd, createdBy: auth.currentUser.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() }).then(function(){ logActivity("تم إضافة مناوبة بتاريخ " + shiftDate); document.getElementById("shiftForm").reset(); loadShifts(); }).catch(function(error){ console.error("Error adding shift:", error); });
});
function loadShifts(){
  var shiftsTableBody = document.getElementById("shiftsTableBody");
  db.collection("shifts").where("createdBy", "==", auth.currentUser.uid).orderBy("shiftDate").onSnapshot(function(snapshot){
    shiftsTableBody.innerHTML = "";
    snapshot.forEach(function(doc){
      var shift = doc.data();
      db.collection("workers").doc(shift.workerId).get().then(function(workerDoc){
        var workerName = workerDoc.exists ? workerDoc.data().name : "-";
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + shift.shiftDate + "</td><td>" + workerName + "</td><td>" + shift.shiftStart + "</td><td>" + shift.shiftEnd + "</td>";
        shiftsTableBody.appendChild(tr);
      });
    });
  });
}
document.getElementById("settingsForm").addEventListener("submit", function(e){
  e.preventDefault();
  var theme = document.getElementById("themeSelect").value;
  if(theme === "dark"){
    document.body.style.backgroundColor = "#333";
    document.body.style.color = "#f2f2f2";
  } else {
    document.body.style.backgroundColor = "#f2f2f7";
    document.body.style.color = "#000";
  }
  logActivity("تم حفظ إعدادات المستخدم");
});
document.getElementById("printWorkerBtn").addEventListener("click", function(){ printWorkerTable(currentWorkerId); });
async function printWorkerTable(workerId){
  var workerDoc = await db.collection("workers").doc(workerId).get();
  if(!workerDoc.exists) return;
  var worker = workerDoc.data();
  var recordsTable = document.getElementById("recordsTable");
  var newWin = window.open("");
  newWin.document.write(`<html><head><title>طباعة سجلات ${worker.name}</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"><style>body{direction:rtl;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #dee2e6;padding:8px;text-align:center}</style></head><body><h4 class="text-center mb-3">${worker.name} - سجلات الحضور</h4>${recordsTable.outerHTML}</body></html>`);
  newWin.document.close();
  newWin.print();
}
document.getElementById("addWorkerForm").addEventListener("submit", function(e){
  e.preventDefault();
  var workerName = document.getElementById("workerNameInput").value.trim();
  if(workerName === ""){ alert("يرجى إدخال اسم العامل"); return; }
  var user = auth.currentUser;
  if(!user){ alert("يجب تسجيل الدخول أولاً"); return; }
  var newWorker = { name: workerName, createdBy: user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp() };
  db.collection("workers").add(newWorker).then(function(docRef){
    var workersList = document.getElementById("workersList");
    var li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center pointer";
    li.innerHTML = "<span onclick=\"window.showWorkerDetail('" + docRef.id + "')\">" + workerName + "</span><div><button class='btn btn-sm btn-outline-warning me-1' onclick=\"window.editWorker('" + docRef.id + "')\"><i class='fas fa-edit'></i></button><button class='btn btn-sm btn-outline-danger' onclick=\"window.deleteWorkerItem('" + docRef.id + "')\"><i class='fas fa-trash'></i></button></div>";
    if(workersList) { workersList.appendChild(li); }
    showSuccessMessage("تمت إضافة العامل بنجاح");
    document.getElementById("workerNameInput").value = "";
  }).catch(function(error){ console.error("خطأ في إضافة العامل:", error); alert("حدث خطأ أثناء إضافة العامل. حاول مرة أخرى."); });
});
function showSuccessMessage(message){
  var successAlert = document.createElement("div");
  successAlert.className = "alert alert-success text-center position-fixed top-0 start-50 translate-middle-x";
  successAlert.style.zIndex = "1050";
  successAlert.style.width = "50%";
  successAlert.innerHTML = message;
  document.body.appendChild(successAlert);
  setTimeout(function(){ successAlert.remove(); }, 1500);
}
function base64ToUint8Array(base64String){
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  var rawData = atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for(var i = 0; i < rawData.length; ++i){ outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}
document.getElementById("btnFingerprintAttendance").addEventListener("click", function(){ fingerprintAttendance(); });
function fingerprintAttendance(){
  if(window.PublicKeyCredential){
    var user = auth.currentUser;
    if(!user){ alert("يجب تسجيل الدخول أولاً"); return; }
    db.collection("workers").where("createdBy", "==", user.uid).get().then(function(snapshot){
      var allowCredentials = [];
      var workersData = [];
      snapshot.forEach(function(doc){
        var data = doc.data();
        if(data.fingerprintData && data.fingerprintData.trim() !== ""){
          workersData.push({ id: doc.id, data: data });
          allowCredentials.push({ type: "public-key", id: base64ToUint8Array(data.fingerprintData) });
        }
      });
      if(allowCredentials.length === 0){ alert("لم يتم تسجيل أي بصمة. يرجى تسجيل بصمة العامل أولاً."); return; }
      var publicKeyOptions = { challenge: Uint8Array.from("randomchallenge", c => c.charCodeAt(0)), timeout: 60000, rpId: window.location.hostname, userVerification: "required", allowCredentials: allowCredentials };
      navigator.credentials.get({ publicKey: publicKeyOptions }).then(function(credential){
        var fingerprintId = credential.id;
        var matchedWorker = workersData.find(function(worker){ return worker.data.fingerprintData === fingerprintId; });
        if(!matchedWorker){ alert("لم يتم التعرف على العامل. تأكد من تسجيل بصمتك مسبقاً."); }
        else {
          var workerId = matchedWorker.id;
          var currentDate = new Date();
          var formattedDate = currentDate.toISOString().split("T")[0];
          var formattedTime = currentDate.toTimeString().split(" ")[0].slice(0,5);
          var recordsRef = db.collection("workers").doc(workerId).collection("records").where("date", "==", formattedDate);
          recordsRef.get().then(function(querySnapshot){
            if(querySnapshot.empty){
              var newRecord = { date: formattedDate, type: "حضور", arrival: formattedTime, departure: "", overtime: "0", createdBy: auth.currentUser.uid };
              db.collection("workers").doc(workerId).collection("records").add(newRecord).then(function(){ alert("تم تسجيل الحضور (وقت الوصول) بنجاح!"); logActivity("تم تسجيل وصول العامل (" + matchedWorker.data.name + ") بالبصمة"); hideAllSections(); document.getElementById("homeSection").classList.remove("hidden"); }).catch(function(error){ console.error("Error saving arrival record:", error); });
            } else {
              var recordToUpdate = null;
              querySnapshot.forEach(function(doc){ var record = doc.data(); if(!record.departure || record.departure.trim() === ""){ recordToUpdate = doc; } });
              if(recordToUpdate){
                recordToUpdate.ref.update({ departure: formattedTime }).then(function(){ alert("تم تسجيل الحضور (وقت الانصراف) بنجاح!"); logActivity("تم تسجيل انصراف العامل (" + matchedWorker.data.name + ") بالبصمة"); hideAllSections(); document.getElementById("homeSection").classList.remove("hidden"); }).catch(function(error){ console.error("Error updating departure:", error); });
              } else {
                var newRecord = { date: formattedDate, type: "حضور", arrival: formattedTime, departure: "", overtime: "0", createdBy: auth.currentUser.uid };
                db.collection("workers").doc(workerId).collection("records").add(newRecord).then(function(){ alert("تم تسجيل الحضور (وقت الوصول) بنجاح!"); logActivity("تم تسجيل وصول العامل (" + matchedWorker.data.name + ") بالبصمة"); hideAllSections(); document.getElementById("homeSection").classList.remove("hidden"); }).catch(function(error){ console.error("Error saving new arrival record:", error); });
              }
            }
          }).catch(function(error){ console.error("Error checking today's record:", error); alert("حدث خطأ أثناء تسجيل الحضور بالبصمة."); });
        }
      }).catch(function(error){ alert("فشل التحقق من البصمة. حاول مرة أخرى."); console.error("Fingerprint authentication error:", error); });
    }).catch(function(error){ console.error("Error fetching worker credentials:", error); alert("حدث خطأ أثناء استرجاع بيانات البصمة."); });
  } else { alert("متصفحك لا يدعم التحقق بالبصمة."); }
}
function stringToArrayBuffer(str){ return new TextEncoder().encode(str); }
document.getElementById("registerFingerprintBtn").addEventListener("click", function(){
  var workerId = document.getElementById("editWorkerId").value;
  if(!workerId){ alert("لم يتم تحديد العامل."); return; }
  if(window.PublicKeyCredential){
    var challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    var publicKeyCreationOptions = { challenge: challenge, rp: { name: "نظام حضور العمال", id: window.location.hostname }, user: { id: stringToArrayBuffer(workerId), name: "worker_" + workerId, displayName: "العامل " + workerId }, pubKeyCredParams: [{ type: "public-key", alg: -7 }], authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" }, timeout: 60000, attestation: "direct" };
    navigator.credentials.create({ publicKey: publicKeyCreationOptions }).then(function(credential){
      db.collection("workers").doc(workerId).update({ fingerprintData: credential.id }).then(function(){ alert("تم تسجيل بصمة العامل بنجاح"); document.getElementById("fingerprintStatus").textContent = "مسجلة"; logActivity("تم تسجيل بصمة العامل"); }).catch(function(error){ console.error("Error saving fingerprint data:", error); alert("حدث خطأ أثناء حفظ بيانات البصمة."); });
    }).catch(function(error){ console.error("Fingerprint registration error:", error); alert("فشل تسجيل البصمة. تأكد من دعم جهازك لهذه الميزة وحاول مرة أخرى."); });
  } else { alert("متصفحك لا يدعم تسجيل البصمة."); }
});
const translations = {
  pageTitle: { ar: "نظام حضور العمال السحابي", en: "Cloud Worker Attendance System", fr: "Système de Présence des Travailleurs Cloud" },
  brandTitle: { ar: "نظام حضور العمال", en: "Worker Attendance", fr: "Présence des Travailleurs" },
  language: { ar: "اللغة", en: "Language", fr: "Langue" },
  navHome: { ar: "الرئيسية", en: "Home", fr: "Accueil" },
  navWorkers: { ar: "قائمة العمال", en: "Workers List", fr: "Liste des Travailleurs" },
  navDashboard: { ar: "لوحة المعلومات", en: "Dashboard", fr: "Tableau de Bord" },
  navActivity: { ar: "سجل النشاط", en: "Activity Log", fr: "Journal d'Activité" },
  navShifts: { ar: "جدول المناوبات", en: "Shift Schedule", fr: "Calendrier des Équipes" },
  navFingerprintAttendance: { ar: "تسجيل الحضور بالبصمة", en: "Fingerprint Attendance", fr: "Pointage par Empreinte" },
  navSettings: { ar: "إعدادات", en: "Settings", fr: "Paramètres" },
  navHelp: { ar: "مساعدة", en: "Help", fr: "Aide" },
  logoutBtn: { ar: "تسجيل الخروج", en: "Logout", fr: "Déconnexion" },
  loginTitle: { ar: "تسجيل الدخول", en: "Login", fr: "Connexion" },
  loginSubtitle: { ar: "أدخل بريدك الإلكتروني وكلمة المرور لتسجيل الدخول.", en: "Enter your email and password to log in.", fr: "Entrez votre e-mail et mot de passe pour vous connecter." },
  emailPlaceholder: { ar: "البريد الإلكتروني", en: "Email", fr: "E-mail" },
  passwordPlaceholder: { ar: "كلمة المرور", en: "Password", fr: "Mot de passe" },
  loginBtn: { ar: "تسجيل الدخول", en: "Login", fr: "Connexion" },
  createAccountBtn: { ar: "إنشاء حساب", en: "Create Account", fr: "Créer un Compte" },
  backToLoginBtn: { ar: "عودة لتسجيل الدخول", en: "Back to Login", fr: "Retour à la Connexion" },
  signupTitle: { ar: "إنشاء حساب جديد", en: "Create New Account", fr: "Créer un Nouveau Compte" },
  signupSubtitle: { ar: "أدخل اسم المستخدم، الإيميل، وكلمة المرور.", en: "Enter username, email, and password.", fr: "Entrez le nom d'utilisateur, l'e-mail et le mot de passe." },
  usernamePlaceholder: { ar: "اسم المستخدم", en: "Username", fr: "Nom d'utilisateur" },
  addWorkerHeader: { ar: "إضافة عامل جديد", en: "Add New Worker", fr: "Ajouter un Travailleur" },
  workerNameLabel: { ar: "اسم العامل", en: "Worker Name", fr: "Nom du Travailleur" },
  workerNamePlaceholder: { ar: "أدخل اسم العامل", en: "Enter worker name", fr: "Entrez le nom du travailleur" },
  addWorkerBtn: { ar: "إضافة عامل", en: "Add Worker", fr: "Ajouter" },
  workerListHeader: { ar: "قائمة العمال", en: "Workers List", fr: "Liste des Travailleurs" },
  searchPlaceholder: { ar: "ابحث عن عامل...", en: "Search for a worker...", fr: "Rechercher un travailleur..." },
  editWorkerHeader: { ar: "تعديل ملف العامل", en: "Edit Worker Profile", fr: "Modifier le Profil du Travailleur" },
  backBtn: { ar: "العودة", en: "Back", fr: "Retour" },
  phoneLabel: { ar: "رقم الهاتف", en: "Phone Number", fr: "Numéro de Téléphone" },
  professionLabel: { ar: "المهنة", en: "Profession", fr: "Profession" },
  gmailLabel: { ar: "البريد الإلكتروني", en: "Email", fr: "E-mail" },
  addressLabel: { ar: "العنوان", en: "Address", fr: "Adresse" },
  fingerprintLabel: { ar: "البصمة", en: "Fingerprint", fr: "Empreinte Digitale" },
  fingerprintStatusNotRegistered: { ar: "غير مسجلة", en: "Not Registered", fr: "Non Enregistrée" },
  fingerprintStatusRegistered: { ar: "مسجلة", en: "Registered", fr: "Enregistrée" },
  registerFingerprintBtn: { ar: "تسجيل بصمة العامل", en: "Register Worker Fingerprint", fr: "Enregistrer l'Empreinte" },
  saveChangesBtn: { ar: "حفظ التعديلات", en: "Save Changes", fr: "Enregistrer les Modifications" },
  editFileBtn: { ar: "تعديل الملف", en: "Edit Profile", fr: "Modifier Profil" },
  detailedReportBtn: { ar: "تقرير مفصل", en: "Detailed Report", fr: "Rapport Détaillé" },
  printBtn: { ar: "طباعة", en: "Print", fr: "Imprimer" },
  newRecordBtn: { ar: "سجل جديد", en: "New Record", fr: "Nouveau Relevé" },
  recordsTab: { ar: "سجلات الحضور", en: "Attendance Records", fr: "Relevés de Présence" },
  statsTab: { ar: "الإحصائيات", en: "Statistics", fr: "Statistiques" },
  recordsTableHeaderDate: { ar: "التاريخ", en: "Date", fr: "Date" },
  recordsTableHeaderType: { ar: "نوع السجل", en: "Record Type", fr: "Type" },
  recordsTableHeaderArrival: { ar: "وقت الحضور", en: "Arrival Time", fr: "Heure d'Arrivée" },
  recordsTableHeaderDeparture: { ar: "وقت الانصراف", en: "Departure Time", fr: "Heure de Départ" },
  recordsTableHeaderOvertime: { ar: "الساعات الإضافية", en: "Overtime", fr: "Heures Supp." },
  recordsTableHeaderLocation: { ar: "الموقع", en: "Location", fr: "Lieu" },
  recordsTableHeaderActions: { ar: "الإجراءات", en: "Actions", fr: "Actions" },
  backToWorkerListBtn: { ar: "العودة لقائمة العمال", en: "Back to Workers List", fr: "Retour à la Liste" },
  addRecordTitle: { ar: "إضافة سجل حضور", en: "Add Attendance Record", fr: "Ajouter un Relevé" },
  editRecordTitle: { ar: "تعديل السجل", en: "Edit Record", fr: "Modifier le Relevé" },
  recordDateLabel: { ar: "التاريخ", en: "Date", fr: "Date" },
  recordTypeLabel: { ar: "نوع السجل", en: "Record Type", fr: "Type de Relevé" },
  recordTypeAttendance: { ar: "حضور", en: "Attendance", fr: "Présence" },
  recordTypeAbsence: { ar: "غياب", en: "Absence", fr: "Absence" },
  arrivalTimeLabel: { ar: "وقت الحضور", en: "Arrival Time", fr: "Heure d'Arrivée" },
  departureTimeLabel: { ar: "وقت الانصراف", en: "Departure Time", fr: "Heure de Départ" },
  overtimeLabel: { ar: "الساعات الإضافية", en: "Overtime Hours", fr: "Heures Supplémentaires" },
  saveRecordBtn: { ar: "حفظ السجل", en: "Save Record", fr: "Enregistrer" },
  selectWorkerOption: { ar: "اختر العامل", en: "Select Worker", fr: "Choisir un Travailleur" },
  addShiftBtn: { ar: "إضافة مناوبة", en: "Add Shift", fr: "Ajouter Équipe" },
  shiftTableHeaderDate: { ar: "التاريخ", en: "Date", fr: "Date" },
  shiftTableHeaderWorker: { ar: "العامل", en: "Worker", fr: "Travailleur" },
  shiftTableHeaderStart: { ar: "بداية المناوبة", en: "Shift Start", fr: "Début d'Équipe" },
  shiftTableHeaderEnd: { ar: "نهاية المناوبة", en: "Shift End", fr: "Fin d'Équipe" },
  fingerprintAttendanceInstruction: { ar: "ضع إصبعك على الجهاز لتسجيل الحضور", en: "Place your finger on the device to record attendance", fr: "Placez votre doigt sur l'appareil pour pointer" },
  userSettingsHeader: { ar: "إعدادات المستخدم", en: "User Settings", fr: "Paramètres Utilisateur" },
  currentModeLabel: { ar: "الوضع الحالي", en: "Current Mode", fr: "Mode Actuel" },
  lightMode: { ar: "فاتح", en: "Light", fr: "Clair" },
  darkMode: { ar: "داكن", en: "Dark", fr: "Sombre" },
  saveSettingsBtn: { ar: "حفظ الإعدادات", en: "Save Settings", fr: "Enregistrer" },
  detailedReportHeader: { ar: "تقرير مفصل", en: "Detailed Report", fr: "Rapport Détaillé" },
  helpInstructionsTitle: { ar: "كيفية استخدام النظام:", en: "How to use the system:", fr: "Comment utiliser le système :" },
  helpLi1: { ar: "تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور.", en: "Log in using email and password.", fr: "Connectez-vous avec e-mail et mot de passe." },
  helpLi2: { ar: "إضافة العمال وتسجيل حضورهم وغيابهم.", en: "Add workers and record their attendance and absence.", fr: "Ajoutez des travailleurs et enregistrez leur présence et absence." },
  helpLi3: { ar: "عرض تقرير مفصل لكل عامل عبر زر \"تقرير مفصل\".", en: "View a detailed report for each worker via the 'Detailed Report' button.", fr: "Affichez un rapport détaillé pour chaque travailleur via le bouton 'Rapport Détaillé'." },
  helpLi4: { ar: "متابعة سجل النشاط لمعرفة أحدث الإجراءات.", en: "Follow the activity log to see the latest actions.", fr: "Suivez le journal d'activité pour voir les dernières actions." },
  helpLi5: { ar: "تنظيم جدول المناوبات من خلال قسم \"جدول المناوبات\".", en: "Organize the shift schedule through the 'Shift Schedule' section.", fr: "Organisez le calendrier des équipes dans la section 'Calendrier des Équipes'." },
  helpLi6: { ar: "تسجيل الحضور بالبصمة في حالة دعم الجهاز لهذه الخاصية.", en: "Register attendance by fingerprint if the device supports this feature.", fr: "Pointez par empreinte si l'appareil supporte cette fonction." },
  helpFAQTitle: { ar: "الأسئلة الشائعة:", en: "Frequently Asked Questions:", fr: "Questions Fréquentes :" },
  helpFAQContent: { ar: "إذا واجهت أي مشكلة، يرجى التواصل مع الدعم الفني.", en: "If you encounter any issues, please contact technical support.", fr: "Si vous rencontrez un problème, veuillez contacter le support technique." },
  statsAttendance: { ar: "أيام الحضور", en: "Attendance Days", fr: "Jours de Présence" },
  statsAbsence: { ar: "أيام الغياب", en: "Absence Days", fr: "Jours d'Absence" },
  statsOvertime: { ar: "الساعات الإضافية", en: "Overtime Hours", fr: "Heures Supp." },
  recordsTableTitle: { ar: "جدول السجلات", en: "Records Table", fr: "Tableau des Relevés" }
};
function setLanguage(lang) {
  if (lang === 'ar') { document.documentElement.setAttribute('dir', 'rtl'); document.documentElement.setAttribute('lang', 'ar'); } 
  else { document.documentElement.setAttribute('dir', 'ltr'); document.documentElement.setAttribute('lang', lang); }
  document.querySelectorAll('[data-translate-key]').forEach(element => {
    const key = element.getAttribute('data-translate-key');
    if (translations[key] && translations[key][lang]) {
      if (element.hasAttribute('placeholder')) { element.setAttribute('placeholder', translations[key][lang]); } 
      else if (element.tagName === 'TITLE') { element.textContent = translations[key][lang]; }
      else {
        const icon = element.querySelector('i');
        if (icon) { element.innerHTML = `${icon.outerHTML} ${translations[key][lang]}`; } 
        else { element.textContent = translations[key][lang]; }
      }
    }
  });
  localStorage.setItem('selectedLanguage', lang);
  if(currentWorkerId) { loadWorkerRecords(currentWorkerId); loadStatistics(currentWorkerId); }
}
function initializeLanguage() {
  const savedLang = localStorage.getItem('selectedLanguage');
  const browserLang = navigator.language.split('-')[0];
  if (savedLang) { setLanguage(savedLang); } 
  else if (['en', 'fr'].includes(browserLang)) { setLanguage(browserLang); } 
  else { setLanguage('ar'); }
}
document.addEventListener('DOMContentLoaded', initializeLanguage);
