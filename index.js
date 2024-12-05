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
document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    link.addEventListener('click', function () {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        if (navbarToggler && navbarCollapse.classList.contains('show')) {
            navbarToggler.click();
        }
        menu.classList.toggle("openmenu");
    });
});
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
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    const formData = new FormData(this);
    const validationResult = isValidForm(formData);

    if (!validationResult.isValid) {
        Swal.fire({
            icon: 'warning',
            title: 'Error',
            text: validationResult.errorMessage,
            confirmButtonText: 'OK'
        });
        return;
    }

    fetch('https://formspree.io/f/mgveqedv', {
        method: 'POST',
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())  
    .then(data => {
        if (data.ok) {
            document.getElementById('contact-form').reset();
            Swal.fire({
                icon: 'success',
                title: 'Thank you!',
                text: 'Your message has been sent successfully.',
                confirmButtonText: 'OK'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'There was an issue with your submission. Please try again.',
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(error => {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'There was an error submitting the form. Please try again.',
            confirmButtonText: 'OK'
        });
    });
});

function isValidForm(formData) {
    const validations = [
        {
            field: 'name',
            value: formData.get('name'),
            pattern: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
            errorMessage: 'Name should contain only letters and spaces.'
        },
        {
            field: 'email',
            value: formData.get('email'),
            pattern: /^[a-z]+[a-z0-9-]*(?:\.[a-z0-9-]+)*[a-z0-9-]*@[a-z]+(?:\.[a-z]+)*\.(com|org|net|edu|gov|co|io|ai|info)$/,
            errorMessage: 'Please enter a valid email address.'
        },
        {
            field: 'phone',
            value: formData.get('phone'),
            pattern: /^[6789]\d{9}$/,
            errorMessage: 'Please enter a valid phone number.'
        },
        {
            field: 'subject',
            value: formData.get('subject'),
            pattern: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
            errorMessage: 'Subject should contain only letters and spaces.'
        },
        {
            field: 'message',
            value: formData.get('message'),
            pattern: /.{1,}/,  
            errorMessage: 'Please enter a message.'
        }
    ];

    for (const validation of validations) {
        if (!validation.value || !validation.pattern.test(validation.value)) {
            return { isValid: false, errorMessage: validation.errorMessage };
        }
    }

    return { isValid: true };
}
