window.addEventListener('DOMContentLoaded', function () {

   // Tabs

   let tabs = document.querySelectorAll('.tabheader__item'),
      tabsContent = document.querySelectorAll('.tabcontent'),
      tabsParent = document.querySelector('.tabheader__items');

   function hideTabContent() {

      tabsContent.forEach(item => {
         item.classList.add('hide');
         item.classList.remove('show', 'fade');
      });

      tabs.forEach(item => {
         item.classList.remove('tabheader__item_active');
      });
   }

   function showTabContent(i = 0) {
      tabsContent[i].classList.add('show', 'fade');
      tabsContent[i].classList.remove('hide');
      tabs[i].classList.add('tabheader__item_active');
   }

   hideTabContent();
   showTabContent();

   tabsParent.addEventListener('click', function (event) {
      const target = event.target;
      if (target && target.classList.contains('tabheader__item')) {
         tabs.forEach((item, i) => {
            if (target == item) {
               hideTabContent();
               showTabContent(i);
            }
         });
      }
   });

   // Timer

   const deadline = '2021-05-20';

   function getTimeRemaining(endTime) {
      const t = Date.parse(endTime) - Date.parse(new Date()),
         days = Math.floor(t / (1000 * 60 * 60 * 24)),
         hours = Math.floor((t / (1000 * 60 * 60)) % 24),
         minutes = Math.floor((t / (1000 * 60)) % (60)),
         seconds = Math.floor((t / (1000)) % (60));

      return {
         'total': t,
         'days': days,
         'hours': hours,
         'minutes': minutes,
         'seconds': seconds
      };
   }

   function getZero(num) {
      if (num >= 0 && num < 10) {
         return `0${num}`;
      } else {
         return num;
      }
   }

   function setClock(selector, endTime) {
      const timer = document.querySelector(selector),
         days = timer.querySelector('#days'),
         hours = timer.querySelector('#hours'),
         minutes = timer.querySelector('#minutes'),
         seconds = timer.querySelector('#seconds'),
         timerInterval = setInterval(updateClock, 1000);

      updateClock();
      function updateClock() {
         const t = getTimeRemaining(endTime);

         days.innerHTML = getZero(t.days);
         hours.innerHTML = getZero(t.hours);
         minutes.innerHTML = getZero(t.minutes);
         seconds.innerHTML = getZero(t.seconds);

         if (t.total <= 0) {
            clearInterval(timerInterval);
         }
      }
   }

   setClock('.timer', deadline);

   // Modal

   const modalTriger = document.querySelectorAll('[data-modal]'),
      modal = document.querySelector('.modal');


   function openModal() {
      modal.classList.add('show');
      modal.classList.remove('hide');
      document.body.style.overflow = 'hidden';
      clearInterval(modalTimerId);
   }

   modalTriger.forEach(item => {
      item.addEventListener('click', openModal);
   });

   function closeModal() {
      modal.classList.add('hide');
      modal.classList.remove('show');
      document.body.style.overflow = '';
   }


   modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.getAttribute('data-close') == '') {
         closeModal();
      }
   });

   document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && modal.classList.contains('show')) {
         closeModal();
      }
   });

   const modalTimerId = setTimeout(openModal, 10000);

   function showModalByScroll() {
      if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
         openModal();
         window.removeEventListener('scroll', showModalByScroll);
      }
   }

   window.addEventListener('scroll', showModalByScroll);

   //Use classes for cards
   class Cards {
      constructor(src, alt, menuSubtitle, description, price, parentSelector, ...classes) {
         this.src = src;
         this.alt = alt;
         this.menuSubtitle = menuSubtitle;
         this.description = description;
         this.price = price;
         this.classes = classes;
         this.parent = document.querySelector(parentSelector);
         this.transfer = 27;
         this.changeToUAH();
      }

      changeToUAH() {
         this.price = this.price * this.transfer;
      }

      render() {
         const element = document.createElement('div');

         if (this.classes.length == 0) {
            this.element = 'menu__item';
            element.classList.add(this.element);
         } else {
            this.classes.forEach(className => element.classList.add(className));
         }

         element.innerHTML = `
         <img src= ${this.src} alt= ${this.alt}>
         <h3 class="menu__item-subtitle">${this.menuSubtitle}</h3>
         <div class="menu__item-descr">${this.description}</div>
         <div class="menu__item-divider"></div>
         <div class="menu__item-price">
            <div class="menu__item-cost">Цена:</div>
            <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
         </div>
         `;

         this.parent.append(element);
      }
   }

   axios.get('http://localhost:3000/menu')
   .then(data => {
            data.data.forEach(({img, altimg, title, descr, price}) => {
               new Cards(img, altimg, title, descr, price, '.menu .container').render();
            });
         });
   // Forms

   const forms = document.querySelectorAll('form');
   const message = {
      loading: 'img/form/spinner.svg',
      success: 'Спасибо! Скоро мы с вами свяжемся',
      failure: 'Что-то пошло не так...'
   };

   forms.forEach(item => {
      bindPostData(item);
   });

   const postData = async (url, data) => {
      const res = await fetch(url, {
         method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: data
      });

      return await res.json();
   };

   function bindPostData(form) {
      form.addEventListener('submit', (e) => {
         e.preventDefault();

         let statusMessage = document.createElement('img');
         statusMessage.src = message.loading;
         statusMessage.style.cssText = `
            display: block;
            margin: 0 auto;
         `;
         form.appendChild(statusMessage);
         form.insertAdjacentElement('afterend', statusMessage);



         const formData = new FormData(form);

         const json = JSON.stringify(Object.fromEntries(formData.entries()));

         postData('http://localhost:3000/requests', json)
         .then(data => {
            console.log(data);
            showThanksModal(message.success);
            statusMessage.remove();
         }).catch(() => {
            showThanksModal(message.failure);
         }).finally(() => {
            form.reset();
         });
      });
      }

   function showThanksModal(message) {
            const prevModalDialog = document.querySelector('.modal__dialog');

            prevModalDialog.classList.add('hide');
            openModal();

            const thanksModal = document.createElement('div');
            thanksModal.classList.add('modal__dialog');
            thanksModal.innerHTML = `
      <div class="modal__content">
         <div class="modal__close" data-close>&times;</div>
         <div class="modal__title">${message}</div>
      </div>
      `;

            document.querySelector('.modal').append(thanksModal);
            setTimeout(() => {
               thanksModal.remove();
               prevModalDialog.classList.add('show');
               prevModalDialog.classList.remove('hide');
               closeModal();
            }, 4000);
         }

         fetch('http://localhost:3000/menu')
            .then(data => data.json())
            .then(res => console.log(res));

   // Slider
   
   const slides = document.querySelectorAll('.offer__slide'),
         slider = document.querySelector('.offer__slider'),
         prev = document.querySelector('.offer__slider-prev'),
         next = document.querySelector('.offer__slider-next'),
         current = document.querySelector('#current'),
         total = document.querySelector('#total'),
         slidesWrapper = document.querySelector('.offer__slider-wrapper'),
         slidesField = slidesWrapper.querySelector('.offer__slider-inner'),
         width = window.getComputedStyle(slidesWrapper).width;
   let slideIndex = 1;
   let offset = 0;

   if (slides.length < 10) {
         total.textContent = `0${slides.length}`;
         current.textContent = `0${slideIndex}`;
      } else {
         total.textContent = slides.length;
         current.textContent = slideIndex;
      }

   slidesField.style.width = 100 * slides.length + '%';
   slidesField.style.display = 'flex'; 
   slidesField.style.transition = '0.5s all';

   slidesWrapper.style.overflow = 'hidden';

   slides.forEach(slide => {
      slide.style.width = width;
   });

   slider.style.position = 'relative';

   const indicators = document.createElement('ol'),
         dots = [];
   indicators.classList.add('carousel-indicators');
   slider.append(indicators);

   for (let i = 0; i < slides.length; i++) {
      const dot = document.createElement('li');
      dot.setAttribute('data-slide-to', i + 1);
      dot.classList.add('dot');
      if (i == 0) {
         dot.style.opacity = '1';
      }
      indicators.append(dot);
      dots.push(dot);
   }

   

   next.addEventListener('click', () => {
      if (offset == parseInt(width) * (slides.length - 1)) {
         offset = 0;
      }else {
         offset += parseInt(width);
      }

      slidesField.style.transform = `translateX(-${offset}px)`;

      if (slideIndex == slides.length){
         slideIndex = 1;
      } else {
         slideIndex += 1;
      }

      if (slides.length < 10) {
         current.textContent = `0${slideIndex}`;
      } else {
         current.textContent = slideIndex;
      }

      dots.forEach(dot => dot.style.opacity = '.5');
      dots[slideIndex - 1].style.opacity = '1';
   });

   prev.addEventListener('click', () => {
      if (offset === 0) {
         offset = parseInt(width) * (slides.length - 1);
      }else {
         offset -= parseInt(width);
      }

      slidesField.style.transform = `translateX(-${offset}px)`;

      if(slideIndex === 1) {
         slideIndex = slides.length;
      } else {
         slideIndex -= 1;
      }

      if (slides.length < 10) {
         current.textContent = `0${slideIndex}`;
      } else {
         current.textContent = slideIndex;
      }

      dots.forEach(dot => dot.style.opacity = '.5');
      dots[slideIndex - 1].style.opacity = '1';
   });

   dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
         const slideTo = e.target.getAttribute('data-slide-to');

         slideIndex = slideTo;
         offset = parseInt(width) * (slideTo - 1);

         slidesField.style.transform = `translateX(-${offset}px)`;

         if (slides.length < 10) {
            current.textContent = `0${slideIndex}`;
         } else {
            current.textContent = slideIndex;
         }

         dots.forEach(dot => dot.style.opacity = '.5');
         dots[slideIndex - 1].style.opacity = '1';
      });
   });

});