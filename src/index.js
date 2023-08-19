// Імпорт бібліотек та стилів
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
//Створення посилань на елементи сторінки
const formEl = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
// Константа кількості карток на сторінці
const PHOTOS_PER_PAGE = 40;
// Змінна кількості сторінок відповідно до кількості карток
let totalPages = 0;
// Змінна номеру сторінкі з картками
let currentPage = 1;
// Створюємо пустий об'єкт для роботи з SimpleLightBox
let galleryPhoto = {};

// Додаємо прослуховування подій на кнопках
loadMore.addEventListener('click', handlerLoadMore);
formEl.addEventListener('submit', onFormSubmit);

// Обробка події відправки форми
function onFormSubmit(evt) {
  // Заборона базових дій браузера
  evt.preventDefault();
  // Приховуємо кнопку Load-more на час запиту(у випадку повторної відправки форми)
  loadMore.classList.add('is-hidden');
  // Очищуємо галерею карток(у випадку повторної відправки форми)
  gallery.innerHTML = '';
  // Отримуємо значення поля input для запиту
  const searchReq = formEl.elements.searchQuery.value;
  // Скидаємо лічильник сторінок(у випадку повторної відправки форми)
  currentPage = 1;
  // Виконуємо запит за значенням input та номером сторінки
  getPhoto(searchReq, currentPage)
    .then(data => {
      // Перевірка, якщо отримали порожній масив даних, то виводимо повідомлення
      if (data.hits.length === 0) {
        Notiflix.Notify.warning(
          'Sorry, there are no images matching your search query. Please try again.',
          {
            width: '560px',
            position: 'center-center',
            fontSize: '32px',
            timeout: 6000,
          }
        );
        return;
      }
      // Розраховуємо кількість сторінок відповідно до загальної кількості у відповіді та заданої кількості карток на сторінці
      totalPages = Math.ceil(data.totalHits / PHOTOS_PER_PAGE);
      // Заповнюємо сторінку картками з зображеннями
      gallery.insertAdjacentHTML('beforeend', makeMarkup(data.hits));
      // Створюємо галерею карток за допомогою SimpleLightbox
      galleryPhoto = new SimpleLightbox('.gallery_link', {
        navText: ['&lsaquo;', '&rsaquo;'],
      });
      // Виводимо повідомлення про кількість знайдених зображень
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      // Робимо видимою кнопку Load-more
      loadMore.classList.remove('is-hidden');
      // Викликаємо прокручування сторінки після запиту
      scrolling();
      // Викликаємо функцію перевірки кількості сторінок
      endOfPages();
    })
    .catch(error => {
      onErrorCath();
    });
}

// Функція обробки події при натисненні кноки Load-more
function handlerLoadMore() {
  // Приховуємо кнопку на час запиту нової колекції зображень
  loadMore.classList.add('is-hidden');
  // Збільшуємо лічильник сторінок на 1
  currentPage += 1;
  // Отримуємо значення поля input для запиту
  const searchReq = formEl.elements.searchQuery.value;
  // Виконуємо запит за значенням input та номером сторінки
  getPhoto(searchReq, currentPage)
    .then(data => {
      gallery.insertAdjacentHTML('beforeend', makeMarkup(data.hits));
      // Оновлюємо галерею SimpleLightBox
      galleryPhoto.refresh();
      // Робимо видимою кнопку Load-more
      loadMore.classList.remove('is-hidden');
      // Викликаємо прокручування сторінки після запиту
      scrolling();
      // Викликаємо функцію перевірки кількості сторінок
      endOfPages();
    })
    .catch(error => {
      onErrorCath();
    });
}
// Асинхронна функція запиту на бекенд
async function getPhoto(request, currentPage) {
  // Базовий URL
  const url = 'https://pixabay.com/api/?';
  // Створюємо список параметрів для запиту
  const searchParams = new URLSearchParams({
    key: '38856418-a7b3dde49805ba60b9b57505c',
    q: request,
    image_type: 'photo',
    min_width: '320px',
    min_height: '300px',
    orientation: 'horizontal',
    safesearch: true,
    page: currentPage,
    per_page: PHOTOS_PER_PAGE,
  });
  try {
    // Запит на бекенд за допомогою axios
    const getData = await axios.get(`${url}${searchParams}`);
    return getData.data;
  } catch (error) {
    onErrorCath();
  }
}

// Функція створення розмітки колекції карток.
function makeMarkup(arr) {
  // Використовуючи масив отриманих значень створюємо розмітку
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
        <a href="${largeImageURL}" class="gallery-link">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300px" height="200px" />
        </a>
        <div class="info">
          <p class="info-item">
            <b>Likes: <br />
              ${likes}</b>
          </p>
          <p class="info-item">
            <b>Views: <br />
              ${views}</b>
          </p>
          <p class="info-item">
            <b>Comments: <br />
              ${comments}</b>
          </p>
          <p class="info-item">
            <b>Downloads: <br />
              ${downloads}</b>
          </p>
        </div>
      </div>`
    )
    .join(' ');
}

// Функція перевірки, якщо користувач дійшов до кінця колекції, ховайємо кнопку і виводимо повідомлення
function endOfPages() {
  if (totalPages === currentPage) {
    loadMore.classList.add('is-hidden');
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results.",
      {
        width: '640px',
        position: 'center-top',
        fontSize: '18px',
        timeout: 3000,
      }
    );
  }
}
// Функція плавного прокручування сторінки після запиту і відтворення кожної наступної групи зображень.
function scrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
// Функція обробки помилки запитів
function onErrorCath() {
  Notiflix.Report.failure(
    'ERROR',
    'Oops! Something went wrong! Try reloading the page!',
    'Okay'
  );
  const errBTN = document.querySelector('.notiflix-report-button');
  errBTN.addEventListener('click', evt => {
    location.reload();
  });
}
