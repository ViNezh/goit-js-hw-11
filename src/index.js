import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
//
const formEl = document.querySelector('.search-form');
const gallery=document.querySelector('.gallery');
formEl.addEventListener('submit', onFormSubmit);
function onFormSubmit(evt) {
  evt.preventDefault();
gallery.innerHTML='';
  const searchReq = formEl.elements.searchQuery.value;
  getPhoto(searchReq)
    .then((data) => {
      gallery.insertAdjacentHTML('beforeend',makeMarkup(data.hits))
      let galleryPhoto = new SimpleLightbox('.gallery_link',
    {    navText:    ['&lsaquo;','&rsaquo;'],    }
  );
    })
    .catch(error => console.log(error));
}

async function getPhoto(request) {
  const url = 'https://pixabay.com/api/?';
  const searchParams = new URLSearchParams({
    key: '38856418-a7b3dde49805ba60b9b57505c',
    q: request,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: 1,
    per_page: 40,
  });
  try {
    const getData = await axios.get(`${url}${searchParams}`);
    return getData.data;
  } catch (error) {
    console.log(error.message);
  }
}
function makeMarkup(arr){
return arr.map(({webformatURL,largeImageURL,tags,likes,views,comments,downloads})=>
    `<div class="photo-card">
    <a href="${largeImageURL}" class="gallery_link">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" width="300px" height="200px"/>
      </a>
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
  `
).join(' ')
};