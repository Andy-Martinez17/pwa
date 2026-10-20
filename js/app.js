const DEFAULT_IMAGE = "./imagenes/placeholder.jpg";


let deferredPrompt = null;


function initInstallPrompt() {
  const installBanner = document.getElementById('install-banner');
  const installBtn = document.getElementById('install-btn');
  const cancelBtn = document.getElementById('cancel-install-btn');

  if (!installBanner || !installBtn || !cancelBtn) return;

  
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  
  if (isInstalled) {
    installBanner.classList.add('hidden');
    return;
  }

 
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBanner.classList.remove('hidden');
  });

  
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Resultado de la instalación: ${outcome}`);

    deferredPrompt = null;
    installBanner.classList.add('hidden');
  });

  
  cancelBtn.addEventListener('click', () => {
    installBanner.classList.add('hidden');
  });

  
  window.addEventListener('appinstalled', () => {
    console.log('¡La PWA se instaló exitosamente!');
    installBanner.classList.add('hidden');
    deferredPrompt = null;
  });
}


async function fetchAllPokemonCatalog() {
  try {
    
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0');
    if (!response.ok) throw new Error('Error al conectar con la PokéAPI');
    
    const data = await response.json();

    
    return data.results.map((pokemon) => {
      
      const urlParts = pokemon.url.split('/').filter(Boolean);
      const id = urlParts[urlParts.length - 1];

      return {
        id: Number(id),
        name: pokemon.name,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      };
    });
  } catch (error) {
    console.error('Error al obtener el catálogo de la API:', error);
    return [];
  }
}


function createCardTemplate(pokemon) {
  return `
    <article class="card">
      <div class="card__image-container">
        <img class="card__image" src="${pokemon.imageUrl}" alt="${pokemon.name}" loading="lazy" onerror="this.src='${DEFAULT_IMAGE}'">
      </div>
      <div class="card__content">
        <h2 class="card__title">#${pokemon.id} ${pokemon.name.toUpperCase()}</h2>
        <a href="detalle.html?id=${pokemon.id}" class="card__button">Ver más</a>
      </div>
    </article>
  `;
}


async function renderCards(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '<p>Cargando el catálogo completo de Pokémones...</p>';

  const pokemons = await fetchAllPokemonCatalog();

  if (pokemons.length === 0) {
    container.innerHTML = '<p>⚠️ No se pudieron cargar los datos. Verifica tu conexión a internet.</p>';
    return;
  }

  const cardsHTML = pokemons.map(pokemon => createCardTemplate(pokemon)).join('');
  container.innerHTML = cardsHTML;
}


function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get('id'));
}


async function renderDetail(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const id = getIdFromUrl();
  if (!id) {
    container.innerHTML = `
      <p>No se encontró el Pokémon.</p>
      <a href="./index.html" class="card__button">Volver al catálogo</a>
    `;
    return;
  }

  container.innerHTML = '<p>Cargando detalles...</p>';

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!response.ok) throw new Error('Pokémon no encontrado');
    
    const pokemon = await response.json();
    const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default || DEFAULT_IMAGE;
    const types = pokemon.types.map(t => t.type.name).join(', ');
    const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');

    container.innerHTML = `
      <article class="card" style="max-width: 500px; margin: 0 auto;">
        <div class="card__image-container" style="height: 320px;">
          <img class="card__image" src="${imageUrl}" alt="${pokemon.name}">
        </div>
        <div class="card__content">
          <h2 class="card__title">#${pokemon.id} ${pokemon.name.toUpperCase()}</h2>
          <p class="card__description"><strong>Tipos:</strong> ${types}</p>
          <p class="card__description"><strong>Altura:</strong> ${pokemon.height} | <strong>Peso:</strong> ${pokemon.weight}</p>
          <p class="card__description"><strong>Habilidades:</strong> ${abilities}</p>
          <a href="./index.html" class="card__button" style="margin-top: 15px; display: inline-block;">Volver al catálogo</a>
        </div>
      </article>
    `;
  } catch (error) {
    console.error('Error al cargar el detalle:', error);
    container.innerHTML = `
      <p>⚠️ No se pudo cargar la información del Pokémon (revisa tu conexión).</p>
      <a href="./index.html" class="card__button">Volver al catálogo</a>
    `;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  initInstallPrompt();

  if (document.getElementById('card-container')) {
    renderCards('card-container');
  }

  if (document.getElementById('detail-container')) {
    renderDetail('detail-container');
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./serviceworker.js')
      .then(reg => console.log('Service Worker registrado', reg))
      .catch(err => console.error('Error en Service Worker', err));
  }
});