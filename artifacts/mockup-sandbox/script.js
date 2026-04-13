// 🔐 LOGIN
function login(){

  let u = document.getElementById("user").value;
  let p = document.getElementById("pass").value;

  if(u==="admin" && p==="1234"){
    window.location.href="dashboard.html";
  } else {
    document.getElementById("msg").innerText="Wrong login ❌";
  }
}

// 🎨 THEME
function setTheme(color){

  let body = document.getElementById("body");

  if(!body) return;

  if(color==="blue") body.style.background="#dbeafe";
  if(color==="red") body.style.background="#fee2e2";
  if(color==="green") body.style.background="#dcfce7";
  if(color==="black") body.style.background="#111827";
  if(color==="purple") body.style.background="#ede9fe";
}

// 👥 TEAM TOGGLE
function toggleTeam(){
  let el = document.getElementById("teamList");
  if(el){
    el.style.display = el.style.display==="none"?"block":"none";
  }
}

// 📝 COMPLAINT TOGGLE
function toggleComplaints(){
  let el = document.getElementById("list");
  if(el){
    el.style.display = el.style.display==="none"?"block":"none";
  }
}

// 🚪 LOGOUT
function logout(){
  window.location.href="index.html";
}