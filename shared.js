// Shared helpers: config fill + sticky header behavior + SEO helpers
function setYear(){
  const y = document.getElementById("year");
  if(y) y.textContent = new Date().getFullYear();
}
function fillConfig(){
  document.querySelectorAll("[data-company]").forEach(el => el.textContent = SITE_CONFIG.companyName);
  document.querySelectorAll("[data-tagline]").forEach(el => el.textContent = SITE_CONFIG.tagline);
  document.querySelectorAll("[data-email]").forEach(el => { el.textContent = SITE_CONFIG.email; el.href = "mailto:" + SITE_CONFIG.email; });
  document.querySelectorAll("[data-phone]").forEach(el => { el.textContent = SITE_CONFIG.phoneDisplay; el.href = "tel:" + SITE_CONFIG.phoneTel; });
  document.querySelectorAll("[data-service-area]").forEach(el => el.textContent = SITE_CONFIG.serviceArea);
  document.querySelectorAll("[data-address]").forEach(el => {
    el.textContent = SITE_CONFIG.addressLine;
    if(SITE_CONFIG.mapsUrl){
      el.href = SITE_CONFIG.mapsUrl; el.target="_blank"; el.rel="noopener";
    }
  });
}
function setCanonical(){
  const link = document.querySelector('link[rel="canonical"]');
  if(!link) return;
  const base = (SITE_CONFIG.siteUrl || "").replace(/\/+$/,"");
  if(!base) return;
  const path = location.pathname.replace(/\/+$/,"/");
  link.href = base + path;
}
function initHeaderUX(){
  const toTopBtn = document.getElementById("toTopBtn");
  const menuBtn = document.getElementById("menuBtn");
  const navInline = document.getElementById("navInline");
  const overlay = document.getElementById("menuOverlay");
  const menuClose = document.getElementById("menuClose");

  function isMobile(){ return window.matchMedia("(max-width: 820px)").matches; }

  function updateTopBtn(){
    if(!toTopBtn) return;
    if(window.scrollY > 220) toTopBtn.classList.add("show");
    else toTopBtn.classList.remove("show");
  }
  function openOverlay(){
    if(!overlay) return;
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden","false");
    document.body.style.overflow = "hidden";
    if(menuBtn) menuBtn.classList.add("open");
  }
  function closeOverlay(){
    if(!overlay) return;
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden","true");
    document.body.style.overflow = "";
    if(menuBtn) menuBtn.classList.remove("open");
  }
  function toggleDesktopNav(){
    if(!navInline) return;
    const willOpen = !navInline.classList.contains("open");
    navInline.classList.toggle("open");
    if(menuBtn) menuBtn.classList.toggle("open", willOpen);
  }

  updateTopBtn();
  window.addEventListener("scroll", updateTopBtn, { passive:true });

  if(toTopBtn){
    toTopBtn.addEventListener("click", (e) => { e.preventDefault(); window.scrollTo({top:0, behavior:"smooth"}); });
  }
  if(menuBtn){
    menuBtn.addEventListener("click", () => {
      if(isMobile()){
        if(overlay && overlay.classList.contains("show")) closeOverlay();
        else openOverlay();
      } else {
        toggleDesktopNav();
      }
    });
  }
  if(menuClose) menuClose.addEventListener("click", closeOverlay);
  if(overlay){
    overlay.addEventListener("click", (e) => { if(e.target === overlay) closeOverlay(); });
  }
  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      closeOverlay();
      if(navInline) navInline.classList.remove("open");
      if(menuBtn) menuBtn.classList.remove("open");
    }
  });
  window.addEventListener("resize", () => {
    if(isMobile() && navInline) navInline.classList.remove("open");
    if(!isMobile() && overlay) closeOverlay();
    if(menuBtn) menuBtn.classList.remove("open");
  });
}
document.addEventListener("DOMContentLoaded", () => {
  setYear(); fillConfig(); setCanonical(); initHeaderUX();
});
