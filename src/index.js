import Notiflix from 'notiflix';
import { fetchPhoto } from "./fetchPhoto";
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';



const photoGallery = document.querySelector('.gallery')
const searchForm = document.getElementById('search-form');
const searchInput = document.querySelector('.form__field');
const loadMoreBtn = document.querySelector('.load-more');

loadMoreBtn.style.display = 'none';
let prevSearchQuery = ''; 
let page = 1;
let totalPages = 0;

searchForm.addEventListener('submit', async (evt) => {
  evt.preventDefault();
  photoGallery.innerHTML = '';
  const searchQuery = searchInput.value.trim();
  if (searchQuery.length === 0) {
    renderPhoto([]);
    return;
  }

  prevSearchQuery = searchQuery;
  try {
    const photos = await fetchPhoto(searchQuery,  page);
    totalPages = Math.ceil(photos.totalHits / 40);
    if (photos.photos.length === 0) {
      Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      return;
    }
    if(photos.photos.length>=1){
      Notiflix.Notify.success(`Hooray! We found ${photos.totalHits} images.`);
    }
    console.log(photos)
    renderPhoto(photos);

  } catch (error) {
    console.log(error);
  }
});

loadMoreBtn.addEventListener('click', async () => {
  if (page === totalPages) {
    loadMoreBtn.style.display = 'none';
    return;
  }
  try {
    page++;
    const photos = await fetchPhoto(prevSearchQuery, page);
    totalPages = Math.ceil(photos.totalHits / 40);
    renderPhoto(photos);
    console.log('page',page)
    if (page === totalPages) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    console.log(error)
  }
});


console.log(totalPages)


const gallery = new SimpleLightbox('.gallery a');
gallery.refresh();
function renderPhoto(photos) {
  if (photos.length === 0) {
    photoGallery.innerHTML = '';
    return;
  }
  const photoItem = photos.photos.map(photo => {
    const { comments, likes, downloads, webformatURL,largeImageURL, views, tags = {} } = photo;
    return `
      <a href="${largeImageURL}" class="photo-card-link animate__animated animate__fadeIn">
        <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item">
              <b>Likes
              ${likes}</b>
            </p>
            <p class="info-item">
              <b>Views
              ${views}</b>
            </p>
            <p class="info-item">
              <b>Comments
              ${comments}</b>
            </p>
            <p class="info-item">
              <b>Downloads
              ${downloads}</b>
            </p>
          </div>
        </div>
      </a>
    `;
  }).join('');

  photoGallery.insertAdjacentHTML('beforeend', photoItem);

  const lightbox = new SimpleLightbox('.photo-card-link', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250, 
  });

  if (photos.photos.length < 40) {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.")
  } else {
    loadMoreBtn.style.display = 'block';
  }
  const { height: cardHeight } = document.querySelector('.photo-card');
  window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
}



let loading = false;

function checkScroll() {
  if (loading) return;
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
    loading = true;
    page++;
    fetchPhoto(prevSearchQuery, page)
      .then(photos => {
        renderPhoto(photos);
        loading = false;
      });
  }
}

window.addEventListener('scroll', checkScroll);