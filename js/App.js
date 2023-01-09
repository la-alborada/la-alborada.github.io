// Prevent transitions on page load
window.addEventListener("load", () => {
  document.body.classList.remove("preload");
});

// NavBurger
const burger = document.querySelector(".burger");
const navLinks = document.querySelector(".nav-links");

burger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// ScrollMagic
const cards = document.querySelectorAll(".scene");
const controller = new ScrollMagic.Controller();
const scenes = [];

cards.forEach(card => {
  const cardScene = new ScrollMagic.Scene({
    triggerElement: card,
    triggerHook: "onEnter",
    offset: 160,
  }).addTo(controller);

  scenes.push(cardScene);
});

scenes.forEach(scene => {
  scene.on("start", event => {
    event.target.triggerElement().classList.add("show");
  });
});

// DatePicker & Form
const dateFrom = document.querySelector('input[name="ingreso"]');
const dateTo = document.querySelector('input[name="salida"]');

if (dateFrom && dateTo) {
  const contactForm = document.querySelector("#contact-form");
  const submitBtn = document.querySelector("#submit-btn");
  const submitMsg = document.querySelector("#submit-msg");
  const handleKey = event => {
    if (event.code !== "Tab" || event.key !== "Tab") {
      event.preventDefault();
    }
  };
  let reqInProgress = false;

  contactForm.reset();
  dateTo.disabled = true;

  const datePickerFrom = new Datepicker(dateFrom, {
    language: "es",
    maxView: 1,
    minDate: Date.now(),
    maxDate: new Date().setFullYear(new Date().getFullYear() + 2),
    autohide: true,
  });
  const datePickerTo = new Datepicker(dateTo, {
    language: "es",
    maxView: 1,
    minDate: Date.now(),
    maxDate: new Date().setFullYear(new Date().getFullYear() + 2),
    autohide: true,
  });

  dateFrom.addEventListener("changeDate", event => {
    dateTo.disabled = event.detail.date ? false : true;

    datePickerTo.setDate({
      clear: true,
    });

    datePickerTo.setOptions({
      minDate: event.detail.date,
    });
  });

  dateFrom.addEventListener("keydown", handleKey);
  dateTo.addEventListener("keydown", handleKey);

  contactForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (reqInProgress) {
      return;
    }

    submitMsg.innerText = "";
    reqInProgress = true;

    // Get form data and validate for spam messages
    var data = new FormData(event.target);
    var msg = data.get("mensaje").toString();

    if (msg.search(/https?:\/\//im) > -1) {
      reqInProgress = false;
      return;
    }

    data.append("duplex", event.target.parentNode.dataset.id);

    fetch(event.target.action, {
      method: event.target.method,
      body: data,
      headers: {
        Accept: "application/json",
      },
    })
      .then(response => {
        if (response.ok) {
          // Update form status
          submitBtn.disabled = true;
          submitBtn.innerText = "GRACIAS";
          submitMsg.innerText = "Recibimos tu consulta! En breve nos pondremos en contacto.";

          // Reset form
          contactForm.reset();
          dateTo.disabled = true;
        } else {
          submitMsg.innerText = "Ha ocurrido un error. Por favor intente nuevamente.";
        }

        reqInProgress = false;
      })
      .catch(error => {
        submitMsg.innerText = "Ha ocurrido un error. Por favor intente nuevamente.";
        reqInProgress = false;
      });
  });
}

// Image gallery
const slideImages = document.querySelectorAll(".slide-img");
const slideDesc = document.querySelector(".slide-desc");
const slideDots = document.querySelectorAll(".dot");
const slidePrev = document.querySelector(".slide-prev");
const slideNext = document.querySelector(".slide-next");

if (slideImages.length > 0) {
  let slideIndex = 0;
  let slideTimer = null;
  let slideTotal = slideImages.length - 1;

  slideDots.forEach(dot => {
    dot.addEventListener("click", slideImageByIndex);
  });

  slidePrev.addEventListener("click", () => {
    slideStopTimer();
    slideIndex = slideIndex === 0 ? slideTotal : slideIndex - 1;
    slideImage();
  });

  slideNext.addEventListener("click", () => {
    slideStopTimer();
    slideIndex = slideIndex === slideTotal ? 0 : slideIndex + 1;
    slideImage();
  });

  function slideImageByIndex(e) {
    slideStopTimer();
    slideIndex = e.target.dataset.index - 1;
    slideImage();
  }

  function slideStartTimer() {
    slideTimer = window.setTimeout(() => {
      slideIndex = slideIndex === slideTotal ? 0 : slideIndex + 1;
      slideImage();
    }, 5000);
  }

  function slideStopTimer() {
    if (slideTimer) {
      window.clearTimeout(slideTimer);
    }
  }

  function slideImage() {
    slideImages.forEach((image, index) => {
      image.style.transform = `translateX(${100 * (index - slideIndex)}%)`;

      if (slideIndex === index) {
        slideDots[index].classList.add("active");
        slideDesc.innerText = image.alt;
      } else {
        slideDots[index].classList.remove("active");
      }
    });

    slideStartTimer();
  }

  // Pause image gallery
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      slideStopTimer();
    } else {
      slideStartTimer();
    }
  });

  slideImage();
}
