const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show-items");

        } else {
            entry.target.classList.remove("show-items");
        }
    })
});
const scrollScale = document.querySelectorAll(".scroll-scale");
scrollScale.forEach((el) => observer.observe(el));

const scrollBottom = document.querySelectorAll(".scroll-bottom");
scrollBottom.forEach((el) => observer.observe(el));

const scrollLeft = document.querySelectorAll(".scroll-left");
scrollLeft.forEach((el) => observer.observe(el));

const scrollRight = document.querySelectorAll(".scroll-right");
scrollRight.forEach((el) => observer.observe(el));

const scrollFlipY = document.querySelectorAll(".scroll-flipy");
scrollFlipY.forEach((el) => observer.observe(el));

const scrollFlipX = document.querySelectorAll(".scroll-flipx");
scrollFlipX.forEach((el) => observer.observe(el));

const scrollAn = document.querySelectorAll(".scroll-an");
scrollAn.forEach((el) => observer.observe(el));

const scrollZoom = document.querySelectorAll(".scroll-zoom");
scrollZoom.forEach((el) => observer.observe(el));

const scrollRotx = document.querySelectorAll(".scroll-rotx");
scrollRotx.forEach((el) => observer.observe(el));

const scrollRoty = document.querySelectorAll(".scroll-roty");
scrollRoty.forEach((el) => observer.observe(el));

const scrollClose = document.querySelectorAll(".scroll-close");
scrollClose.forEach((el) => observer.observe(el));

const scrollOpen = document.querySelectorAll(".scroll-open");
scrollOpen.forEach((el) => observer.observe(el));

const scrollPrg = document.querySelectorAll(".b");
scrollPrg.forEach((el) => observer.observe(el));


var menu = document.getElementById("menu");
menu.onclick = function() {
    menu.classList.toggle("openmenu");
}

let progressBars= document.querySelectorAll(".num");
progressBars.forEach((value) => {
    let progress=value.parentElement;
    let startValue = 0;
    let endValue = parseInt(value.getAttribute("data-value"));
    let counter = setInterval(function() {
        startValue += 1;
        progress.style.width = `${startValue}%`;
        value.textContent = `${startValue}%`;
        if (startValue == endValue) {
            clearInterval(counter);
        }
    }, 100)
})

let circularProgressBars = document.querySelectorAll(".prg-val");
circularProgressBars.forEach((value)=>{
    let circularProgress= value.previousElementSibling;
    let startValue=0;
    let endValue=parseInt(value.getAttribute("data-value"));
    let progress=setInterval(function(){
        startValue += 1;
        value.textContent=`${startValue}%`
        circularProgress.style.background = `conic-gradient(#373737 ${startValue*3.6}deg,#ededed 0deg)`;
        if (startValue == endValue) {
            clearInterval(progress);
        }
    },100)
})