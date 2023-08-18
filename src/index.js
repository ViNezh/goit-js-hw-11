import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
//
const formEl = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMore = document.querySelector('.load-more');
const PHOTOS_PER_PAGE = 40;
let totalPages = 0;
let currentPage = 1;
let galleryPhoto = {};

loadMore.addEventListener('click', handlerLoadMore);
formEl.addEventListener('submit', onFormSubmit);

function onFormSubmit(evt) {
  loadMore.classList.add('is-hidden');
  evt.preventDefault();
  gallery.innerHTML = '';
  const searchReq = formEl.elements.searchQuery.value;
  currentPage = 1;
  getPhoto(searchReq, currentPage)
    .then(data => {
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
      totalPages = Math.ceil(data.totalHits / data.hits.length);
      console.log(totalPages);
      gallery.insertAdjacentHTML('beforeend', makeMarkup(data.hits));
      galleryPhoto = new SimpleLightbox('.gallery_link', {
        navText: ['&lsaquo;', '&rsaquo;'],
      });
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      loadMore.classList.remove('is-hidden');
      scrolling();
      endOfPages();
    })
    .catch(error => console.log(error));
}

function handlerLoadMore() {
  loadMore.classList.add('is-hidden');
  currentPage += 1;
  const searchReq = formEl.elements.searchQuery.value;
  getPhoto(searchReq, currentPage)
    .then(data => {
      gallery.insertAdjacentHTML('beforeend', makeMarkup(data.hits));
      galleryPhoto.refresh();
      loadMore.classList.remove('is-hidden');
      scrolling();
      endOfPages();
    })
    .catch(error => console.log(error));
}

async function getPhoto(request, currentPage) {
  const url = 'https://pixabay.com/api/?';
  const searchParams = new URLSearchParams({
    key: '38856418-a7b3dde49805ba60b9b57505c',
    q: request,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: currentPage,
    per_page: PHOTOS_PER_PAGE,
  });
  try {
    const getData = await axios.get(`${url}${searchParams}`);
    return getData.data;
  } catch (error) {
    console.log(error.message);
  }
}
function makeMarkup(arr) {
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
        `<a href="${largeImageURL}" class="gallery_link">
        <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300px" height="200px"/>
           <div class="info">
        <p class="info-item">
          <b>Likes:${likes}</b>
        </p>
        <p class="info-item">
          <b>Views:${views}</b>
        </p>
        <p class="info-item">
          <b>Comments:${comments}</b>
        </p>
        <p class="info-item">
          <b>Downloads:${downloads}</b>
        </p>
      </div>
    </div>
     </a>
  `
    )
    .join(' ');
}
function endOfPages() {
  if (totalPages === currentPage) {
    Notiflix.Notify.warning(
      "We're sorry, but you've reached the end of search results.",
      {
        width: '640px',
        position: 'center-top',
        fontSize: '18px',
        timeout: 3000,
      }
    );
    loadMore.classList.add('is-hidden');
  }
}
function scrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
