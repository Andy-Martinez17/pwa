const cardsData = [
  {
    id: 1,
    title: "Cafe uno",
    description: "Cafe de la mas alta calida",
    detail: "información detallada de este café: origen, proceso, notas de cata, etc..",
    image: "./imagenes/51c66849566e471e62530c0df2777c1b.jpg",
  },
  {
    id: 2,
    title: "cafe 2",
    description: "Cafe de la mas alta calida",
    detail: "Información detallada del cafe 2.",
    image: "./imagenes/A_small_cup_of_coffee.jpg",
  },
  {
    id: 3,
    title: "cafe 3",
    description: "Cafe de la mas alta calida.",
    detail: "Información detallada del cafe 3.",
    image: "./imagenes/cup-coffee.jpg",
  },
  {
    id: 4,
    title: "cafe 4",
    description: "Cafe de la mas alta calida",
    detail: "Información detallada del cafe 4.",
    image: "./imagenes/steaming-hot-coffee-in-white-cup-surrounded-by-scattered-coffee-beans-on-wooden-surface-photo.jpg",
  },
  {
    id: 5,
    title: "cafe 5",
    description: "Cafe de la mas alta calida",
    detail: "Información detallada del cafe 5.",
    image: "./imagenes/images (1).jpg",
  },
  {
    id: 6,
    title: "cafe 6",
    description: "Cafe de la mas alta calida",
    detail: "Información detallada del cafe 6.",
    image: "./imagenes/images (2).jpg",
  },
  {
    id: 7,
    title: "cafe 7",
    description: "Cafe de la mas alta calida",
    detail: "Información detallada del cafe 7.",
    image: "./imagenes/images (3).jpg",
  },
  {
    id: 8,
    title: "cafe 8",
    description: "Cafe de la mas alta calida",
    detail: "Información detallada del cafe 8.",
    image: "./imagenes/images.jpg",
  },
  {
    id: 9,
    title: "cafe 9",
    description: "Cafe de la mas alta calida",
    detail: "Información detallada del cafe 9.",
    image: "./imagenes/pexels-intitupac-5373242.jpg",
  },
  {
    id: 10,
    title: "cafe 10",
    description: "Cafe de la mas alta calida",
    detail: "Información detallada del cafe 10.",
    image: "./imagenes/pexels-mikegz-400576129-35018055.jpg",
  }
];

const DEFAULT_IMAGE = "./imagenes/placeholder.jpg";

function createCardTemplate(item) {
  const imageUrl = item.image && item.image.trim() !== "" ? item.image : DEFAULT_IMAGE;

  return `
    <article class="card">
      <div class="card__image-container">
        <img class="card__image" src="${imageUrl}" alt="${item.alt || item.title}" loading="lazy">
      </div>
      <div class="card__content">
        <h2 class="card__title">${item.title}</h2>
        <p class="card__description">${item.description}</p>
        <a href="detalle.html?id=${item.id}" class="card__button">Ver más</a>
      </div>
    </article>
  `;
}

function renderCards(dataList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const cardsHTML = dataList.map(item => createCardTemplate(item)).join('');
  container.innerHTML = cardsHTML;
}

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get('id'));
}

function renderDetail(item, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!item) {
    container.innerHTML = `
      <p>No se encontró el producto.</p>
      <a href="./index.html" class="card__button">Volver al catálogo</a>
    `;
    return;
  }

  const imageUrl = item.image && item.image.trim() !== "" ? item.image : DEFAULT_IMAGE;

  container.innerHTML = `
    <article class="card" style="max-width: 500px; margin: 0 auto;">
      <div class="card__image-container" style="height: 320px;">
        <img class="card__image" src="${imageUrl}" alt="${item.alt || item.title}">
      </div>
      <div class="card__content">
        <h2 class="card__title">${item.title}</h2>
        <p class="card__description">${item.detail || item.description}</p>
        <a href="./index.html" class="card__button">Volver al catálogo</a>
      </div>
    </article>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('card-container')) {
    renderCards(cardsData, 'card-container');
  }

  if (document.getElementById('detail-container')) {
    const id = getIdFromUrl();
    const item = cardsData.find(c => c.id === id);
    renderDetail(item, 'detail-container');
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./serviceworker.js')
      .then(reg => console.log('Service Worker registrado', reg))
      .catch(err => console.error('Error en Service Worker', err));
  }
});