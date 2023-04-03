import axios from 'axios';

const KEY = '34890929-c294eed46e5ac027db1a12ad9';
export async function fetchPhoto(name, page = 1, perPage = 40) {
  const url = `https://pixabay.com/api/?key=${KEY}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;
  try {
    const response = await axios.get(url);
    const totalPages = Math.ceil(response.data.totalHits / perPage);
    console.log(totalPages);
    const totalHits = response.data.totalHits;
    console.log(totalHits)
    return { photos: response.data.hits, totalPages, totalHits: response.data.totalHits };
  } catch (error) {
    console.log(error);
    return { photos: [], totalPages: 0, totalHits: 0 };
  }
}
