// ── 1. AUTH CHECK
const currentUser = localStorage.getItem('musify_session');
if (!currentUser) {
  window.location.replace('auth.html');
  throw new Error('Not authenticated');
}

// ── 2. PERSISTENCE HELPERS
function getAccounts() {
  return JSON.parse(localStorage.getItem('musify_accounts') || '{}');
}
function saveAccounts(accounts) {
  localStorage.setItem('musify_accounts', JSON.stringify(accounts));
}
function getUserData() {
  const accounts = getAccounts();
  return accounts[currentUser]?.data || { favorites: [0], queue: [], albums: [], currentIndex: 0 };
}
function persistState() {
  const accounts = getAccounts();
  if (!accounts[currentUser]) return;
  accounts[currentUser].data = {
    favorites:    [...favorites],
    queue:        [...queue],
    albums:       albums.map(a => ({ name: a.name, cover: a.cover || null, songs: [...a.songs] })),
    currentIndex: state.currentIndex,
  };
  saveAccounts(accounts);
}

// ── 3. SONGS
const SONGS = [
  { title: 'Pa-umaga',            artist: 'Al James',                              img: 'images/Pa-umaga.jpg',             audio: 'audio/Pa-umaga.mp3' },
  { title: 'PSG',                 artist: 'Al James',                              img: 'images/PSG.jpg',                  audio: 'audio/PSG.mp3' },
  { title: 'Latina',              artist: 'Al James',                              img: 'images/Latina.jpg',               audio: 'audio/Latina.mp3' },
  { title: 'Ngayong Gabi',        artist: 'Al James',                              img: 'images/Ngayong Gabi.jpg',         audio: 'audio/NgayonGabi.mp3' },
  { title: 'Repeat',              artist: 'Al James',                              img: 'images/repeat.jpg',               audio: 'audio/Repeat.mp3' },
  { title: 'supernatural',        artist: 'Ariana Grande',                         img: 'images/supernatural.jpg',         audio: 'audio/supernatural.mp3' },
  { title: 'Beauty And A Beat',   artist: 'Justin Bieber, Nikki Minaj',            img: 'images/JB.jpg',                   audio: 'audio/BeautyAndABeat.mp3' },
  { title: 'The Fate of Ophelia', artist: 'Taylor Swift',                          img: 'images/ophelia.jpg',              audio: 'audio/Ophelia.mp3' },
  { title: 'Cruel Summer',        artist: 'Taylor Swift',                          img: 'images/cruelsummer.jpg',          audio: 'audio/Cruel Summer.mp3' },
  { title: 'Opalite',             artist: 'Taylor Swift',                          img: 'images/opalite.jpg',              audio: 'audio/Opalite.mp3' },
  { title: 'Alipin',              artist: 'Khel Pangilinan',                       img: 'images/Alipin.jpg',               audio: 'audio/Alipin.mp3' },
  { title: 'Life Is Good',        artist: 'Future, Drake',                         img: 'images/Life Is Good.jpg',         audio: 'audio/Life Is Good.mp3' },
  { title: 'Mask Off',            artist: 'Future, Kendrick Lamar',                img: 'images/Mask Off.jpg',             audio: 'audio/Mask Off.mp3' },
  { title: 'Like That',           artist: 'Future, Metro Boomin, Kendrick Lamar',  img: 'images/Like That.jpg',            audio: 'audio/Like That.mp3' },
  { title: 'Timeless',            artist: 'The Weeknd, Playboi Carti',             img: 'images/Timeless.jpg',             audio: 'audio/Timeless.mp3' },
  { title: 'Bye(Altare Remix)',    artist: 'Ariana Grande',                        img: 'images/Bye.jpg',                  audio: 'audio/Bye.mp3' },
  { title: 'Swimming Pool',       artist: 'Kendrick Lamar',                        img: 'images/Swimming Pool.jpg',        audio: 'audio/Swimming Pool.mp3' },
  { title: 'First Class',         artist: 'Jack Harlow',                           img: 'images/First Class.jpg',          audio: 'audio/First Class.mp3' },
  { title: 'Girl You Loud',       artist: 'Chris Brown',                           img: 'images/Girl You Loud.jpg',        audio: 'audio/Girl You Loud.mp3' },
  { title: 'Aces x Dna',          artist: 'Kendrick Lamar, Prd Djk',              img: 'images/Aces X Dna.jpg',           audio: 'audio/Aces x Dna (sped up).mp3' },
  { title: 'Lap Of God',          artist: 'Benji(UK)',                             img: 'images/Lap Of God.jpg',           audio: 'audio/Lap Of God.mp3' },
  { title: 'May I Ask',           artist: 'Luke Chiang',                           img: 'images/May I Ask.jpg',            audio: 'audio/May I Ask.mp3' },
  { title: 'Body Back',           artist: 'Gryffin',                               img: 'images/Body Back.jpg',            audio: 'audio/Body Back.mp3' },
  { title: 'Please Dont Go',      artist: 'Beauz',                                 img: 'images/Please Dont Go.jpg',       audio: 'audio/Please Dont Go.mp3' },
  { title: 'Raindance',           artist: 'Dave, Tems',                            img: 'images/Raindance.jpg',            audio: 'audio/Raindance.mp3' },
  { title: 'Next To You',         artist: 'Chris Brown, Justin Bieber',            img: 'images/Next To You.jpg',          audio: 'audio/Next To You.mp3' },
  { title: 'All The Stars',       artist: 'Kendrick Lamar, Sza',                   img: 'images/All The Stars.jpg',        audio: 'audio/All The Stars.mp3' },
  { title: 'Company',             artist: 'Justin Bieber',                         img: 'images/Company.jpg',              audio: 'audio/Company.mp3' },
  { title: 'Reminder',            artist: 'The Weeknd',                            img: 'images/Reminder.jpg',             audio: 'audio/Reminder.mp3' },
  { title: 'We Dont Talk Anymore',artist: 'Charlie Puth, Selena Gomez',            img: 'images/We Dont Talk Anymore.jpg', audio: 'audio/We Dont Talk Anymore.mp3' },
  { title: 'Kunan Mong Pic',      artist: 'O SIDE MAFIA, BRGR ft. Al James',       img: 'images/kunan mo pic.jpg',         audio: 'audio/kunan mo pic.mp3' },
];

const saved = getUserData();
const audioPlayer = new Audio();
audioPlayer.volume = 0.7;

const favorites = new Set(saved.favorites ?? [0]);
const queue     = [...(saved.queue ?? [])];
const albums    = (saved.albums ?? []).map(a => ({ name: a.name, cover: a.cover || null, songs: new Set(a.songs ?? []) }));

const state = {
  currentIndex: saved.currentIndex ?? 0,
  isPlaying:    false,
  isRepeat:     false,
  isShuffled:   false,
  shuffleOrder: [],
  progress:     0,
  totalTime:    0,
  currentView:  'playlist',
};

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// ── Desktop player elements
const playerPanel   = $('.player-panel');
const playerArt     = $('#playerArt');
const playerSong    = $('#playerSong');
const playerArtist  = $('#playerArtist');
const likeBtn       = $('#likeBtn');
const shuffleBtn    = $('#shuffleBtn');
const playPauseBtn  = $('#playPauseBtn');
const prevBtn       = $('#prevBtn');
const nextBtn       = $('#nextBtn');
const repeatBtn     = $('#repeatBtn');
const progressBar   = $('#progressBar');
const progressFill  = $('#progressFill');
const progressThumb = $('#progressThumb');
const currentTimeEl = $('#currentTime');
const totalTimeEl   = $('#totalTime');
const searchInput   = $('#searchInput');
const navLinks      = $$('.nav-link');
const volumeSlider  = $('#volumeSlider');

const playlistSection  = $('#playlistSection');
const favoritesSection = $('#favoritesSection');
const queueSection     = $('#queueSection');
const favoritesGrid    = $('#favoritesGrid');
const queueGrid        = $('#queueGrid');

// ── Mini player elements
const miniPlayer       = $('#miniPlayer');
const miniArt          = $('#miniArt');
const miniSong         = $('#miniSong');
const miniArtist       = $('#miniArtist');
const miniProgressFill = $('#miniProgressFill');
const miniPlayPauseBtn = $('#miniPlayPauseBtn');
const miniPrevBtn      = $('#miniPrevBtn');
const miniNextBtn      = $('#miniNextBtn');

// ── Bottom nav
const bottomNav      = $('#bottomNav');
const bottomNavItems = $$('.bottom-nav__item');

// ── Full-screen modal elements
const playerModal       = $('#playerModal');
const modalClose        = $('#modalClose');
const modalArt          = $('#modalArt');
const modalSong         = $('#modalSong');
const modalArtist       = $('#modalArtist');
const modalLikeBtn      = $('#modalLikeBtn');
const modalShuffleBtn   = $('#modalShuffleBtn');
const modalPlayPauseBtn = $('#modalPlayPauseBtn');
const modalPrevBtn      = $('#modalPrevBtn');
const modalNextBtn      = $('#modalNextBtn');
const modalRepeatBtn    = $('#modalRepeatBtn');
const modalMenuBtn      = $('#modalMenuBtn');
const modalProgressBar  = $('#modalProgressBar');
const modalFill2        = $('#modalProgressFill2');
const modalThumb        = $('#modalProgressThumb');
const modalCurrentTime  = $('#modalCurrentTime');
const modalTotalTime    = $('#modalTotalTime');
const modalVolSlider    = $('#modalVolumeSlider');

// ── 6. USERNAME + LOGOUT
const sidebarUsername = $('#sidebarUsername');
if (sidebarUsername) sidebarUsername.textContent = currentUser.toUpperCase();

$('#logoutBtn')?.addEventListener('click', () => {
  persistState();
  localStorage.removeItem('musify_session');
  window.location.replace('auth.html');
});
$('#mobileLogoutBtn')?.addEventListener('click', () => {
  persistState();
  localStorage.removeItem('musify_session');
  window.location.replace('auth.html');
});

// ── 7. SEARCH DROPDOWN
const searchWrapper     = $('#searchWrapper');
const searchDropdown    = $('#searchDropdown');
const searchResultsList = $('#searchResultsList');

function renderSearchDropdown(query) {
  const q = query.trim().toLowerCase();
  if (!q) { searchDropdown.classList.remove('visible'); return; }
  const matches = SONGS.map((song, idx) => ({ song, idx }))
    .filter(({ song }) => song.title.toLowerCase().includes(q) || song.artist.toLowerCase().includes(q));
  searchResultsList.innerHTML = '';
  if (matches.length === 0) {
    searchResultsList.innerHTML = `<div class="search-no-results">No results for "<strong>${query}</strong>"</div>`;
  } else {
    matches.forEach(({ song, idx }) => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      if (idx === state.currentIndex) item.classList.add('active-result');
      item.innerHTML = `
        <div class="search-result-item__art"><img src="${song.img}" alt="${song.title}" loading="lazy"></div>
        <div class="search-result-item__info">
          <div class="search-result-item__title">${song.title}</div>
          <div class="search-result-item__artist">${song.artist}</div>
        </div>
        <div class="search-result-item__play">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </div>`;
      item.addEventListener('click', () => {
        loadSong(idx);
        if (!state.isPlaying) togglePlayPause(); else startTicker();
        closeSearchDropdown();
      });
      searchResultsList.appendChild(item);
    });
  }
  searchDropdown.classList.add('visible');
}

function closeSearchDropdown() {
  searchDropdown.classList.remove('visible');
  searchInput.value = '';
}

searchInput.addEventListener('input', () => renderSearchDropdown(searchInput.value));
document.addEventListener('click', (e) => { if (!searchWrapper.contains(e.target)) searchDropdown.classList.remove('visible'); });
searchWrapper.addEventListener('click', (e) => e.stopPropagation());
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeSearchDropdown(); searchInput.blur(); }
  if (e.key === 'Enter') { const first = searchResultsList.querySelector('.search-result-item'); if (first) first.click(); }
});

// ── 8. ALBUM COVER UPLOAD
let pendingAlbumCover   = null;
const albumCoverPreview = $('#albumCoverPreview');
const albumCoverInput   = $('#albumCoverInput');

albumCoverPreview.addEventListener('click', () => albumCoverInput.click());
albumCoverInput.addEventListener('change', () => {
  const file = albumCoverInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    pendingAlbumCover = e.target.result;
    albumCoverPreview.innerHTML = `<img src="${pendingAlbumCover}" alt="Cover">`;
  };
  reader.readAsDataURL(file);
});

// ── 9. ALBUMS
const albumsSection    = $('#albumsSection');
const albumsList       = $('#albumsList');
const albumDetail      = $('#albumDetail');
const albumDetailGrid  = $('#albumDetailGrid');
const albumDetailTitle = $('#albumDetailTitle');
const albumDetailCover = $('#albumDetailCover');
const newAlbumInput    = $('#newAlbumInput');

let openAlbumIdx = null;

newAlbumInput.addEventListener('keydown', (e) => {
  e.stopPropagation();
  if (e.key === 'Enter') document.getElementById('createAlbumBtn').click();
});

function renderAlbumsList() {
  albumDetail.style.display = 'none';
  albumsList.style.display  = '';
  albumsList.innerHTML      = '';
  openAlbumIdx              = null;
  if (albums.length === 0) {
    albumsList.innerHTML = '<p class="empty-msg">No albums yet. Type a name above and hit + Create Album.</p>';
    return;
  }
  albums.forEach((album, idx) => {
    const card = document.createElement('div');
    card.className = 'album-row';
    const coverHTML = album.cover ? `<img src="${album.cover}" alt="${album.name}">` : '🎵';
    card.innerHTML = `
      <div class="album-row__cover">
        ${coverHTML}
        <div class="album-row__overlay">
          <button class="play-btn mini" aria-label="Open album">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          </button>
        </div>
        <button class="album-delete-btn" title="Delete album">✕</button>
      </div>
      <div class="album-row__info">
        <p class="album-row__name">${album.name}</p>
        <p class="album-row__count">${album.songs.size} song${album.songs.size !== 1 ? 's' : ''}</p>
      </div>`;
    card.addEventListener('click', (e) => { if (e.target.closest('.album-delete-btn')) return; openAlbum(idx); });
    card.querySelector('.album-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      albums.splice(idx, 1);
      persistState();
      renderAlbumsList();
      showToast('🗑️ Album deleted');
    });
    albumsList.appendChild(card);
  });
}

function openAlbum(idx) {
  openAlbumIdx = idx;
  const album  = albums[idx];
  albumsList.style.display  = 'none';
  albumDetail.style.display = '';
  albumDetailTitle.textContent = album.name;
  albumDetailCover.innerHTML = album.cover ? `<img src="${album.cover}" alt="${album.name}">` : '🎵';
  renderAlbumDetail();
}

function renderAlbumDetail() {
  const album = albums[openAlbumIdx];
  albumDetailGrid.innerHTML = '';
  if (album.songs.size === 0) {
    albumDetailGrid.innerHTML = '<p class="empty-msg">No songs yet. Play a song then click + Add Current Song.</p>';
    return;
  }
  album.songs.forEach((songIdx) => {
    const card = buildCard(songIdx, { removable: true, removeBadge: 'Remove from Album' });
    card.querySelector('.card__remove')?.addEventListener('click', (e) => {
      e.stopPropagation();
      album.songs.delete(songIdx);
      persistState();
      renderAlbumDetail();
      showToast('🗑️ Removed from album');
    });
    albumDetailGrid.appendChild(card);
  });
  highlightActiveCard();
}

$('#createAlbumBtn').addEventListener('click', () => {
  const name = newAlbumInput.value.trim();
  if (!name) { showToast('⚠️ Enter an album name first'); return; }
  albums.push({ name, songs: new Set(), cover: pendingAlbumCover });
  newAlbumInput.value = '';
  pendingAlbumCover   = null;
  albumCoverPreview.innerHTML = '<span class="cover-placeholder">🖼️</span>';
  albumCoverInput.value = '';
  persistState();
  renderAlbumsList();
  showToast(`✅ Album "${name}" created`);
});

$('#backToAlbums').addEventListener('click', renderAlbumsList);

$('#addToAlbumBtn').addEventListener('click', () => {
  const album = albums[openAlbumIdx];
  if (album.songs.has(state.currentIndex)) { showToast('⚠️ Already in this album'); return; }
  album.songs.add(state.currentIndex);
  persistState();
  renderAlbumDetail();
  showToast(`🎵 "${SONGS[state.currentIndex].title}" added to album`);
});

// ── 10. HELPERS
function fmtTime(secs) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function showToast(msg) {
  let toast = document.getElementById('musifyToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'musifyToast'; toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

function buildShuffleOrder(currentIdx) {
  const indices = [...Array(SONGS.length).keys()].filter(i => i !== currentIdx);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return [currentIdx, ...indices];
}

function buildCard(songIndex, opts = {}) {
  const song = SONGS[songIndex];
  const card = document.createElement('div');
  card.className         = 'music-card';
  card.dataset.songIndex = songIndex;
  card.innerHTML = `
    <div class="card__thumb">
      <img src="${song.img}" alt="${song.title}" loading="lazy">
      <div class="card__overlay">
        <button class="play-btn mini" aria-label="Play">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
      ${opts.removable ? `<button class="card__remove" title="${opts.removeBadge || 'Remove'}">✕</button>` : ''}
    </div>
    <p class="card__name">${song.title}</p>
    <p class="card__sub">${song.artist}</p>`;
  card.addEventListener('click', (e) => {
    if (e.target.closest('.card__remove')) return;
    if (state.currentIndex === songIndex && state.isPlaying) { togglePlayPause(); return; }
    loadSong(songIndex);
    if (!state.isPlaying) togglePlayPause(); else startTicker();
  });
  card.querySelector('.play-btn.mini')?.addEventListener('click', (e) => { e.stopPropagation(); card.click(); });
  return card;
}

function renderFavorites() {
  favoritesGrid.innerHTML = '';
  if (favorites.size === 0) {
    favoritesGrid.innerHTML = '<p class="empty-msg">No favorites yet. Click 🖤 to add songs!</p>';
    return;
  }
  favorites.forEach((idx) => {
    const card = buildCard(idx, { removable: true, removeBadge: 'Remove from Favorites' });
    card.querySelector('.card__remove')?.addEventListener('click', (e) => {
      e.stopPropagation();
      favorites.delete(idx);
      persistState();
      if (state.currentIndex === idx) syncLikeButton(idx);
      renderFavorites();
      showToast('💔 Removed from Favorites');
    });
    favoritesGrid.appendChild(card);
  });
  highlightActiveCard();
}

function renderQueue() {
  queueGrid.innerHTML = '';
  if (queue.length === 0) {
    queueGrid.innerHTML = '<p class="empty-msg">Queue is empty. Click ☰ on any song to add!</p>';
    return;
  }
  queue.forEach((songIdx, qPos) => {
    const card = buildCard(songIdx, { removable: true, removeBadge: 'Remove from Queue' });
    const badge = document.createElement('span');
    badge.className   = 'card__queue-badge';
    badge.textContent = qPos + 1;
    card.querySelector('.card__thumb').appendChild(badge);
    card.querySelector('.card__remove')?.addEventListener('click', (e) => {
      e.stopPropagation();
      queue.splice(qPos, 1);
      persistState();
      renderQueue();
      showToast('🗑️ Removed from Queue');
    });
    queueGrid.appendChild(card);
  });
  highlightActiveCard();
}

function showView(view) {
  state.currentView = view;
  playlistSection.style.display  = view === 'playlist'  ? '' : 'none';
  favoritesSection.style.display = view === 'favorites' ? '' : 'none';
  queueSection.style.display     = view === 'queue'     ? '' : 'none';
  albumsSection.style.display    = view === 'albums'    ? '' : 'none';
  if (view === 'favorites') renderFavorites();
  if (view === 'queue')     renderQueue();
  if (view === 'albums')    renderAlbumsList();
  closeSearchDropdown();
}

// ── 11. PLAYER CORE
function syncMiniPlayer() {
  const song = SONGS[state.currentIndex];
  if (!song) return;
  miniArt.src             = song.img;
  miniSong.textContent    = song.title;
  miniArtist.textContent  = song.artist;
}

function syncMiniPlayPauseIcon() {
  const iconPlay  = miniPlayPauseBtn.querySelector('.mini-icon-play');
  const iconPause = miniPlayPauseBtn.querySelector('.mini-icon-pause');
  iconPlay.style.display  = state.isPlaying ? 'none' : '';
  iconPause.style.display = state.isPlaying ? '' : 'none';
}

function syncModalUI() {
  const song = SONGS[state.currentIndex];
  if (!song) return;
  modalArt.src            = song.img;
  modalSong.textContent   = song.title;
  modalArtist.textContent = song.artist;
  syncModalLike();
  syncModalPlayPause();
  syncModalProgress();
  modalShuffleBtn.classList.toggle('active', state.isShuffled);
  modalRepeatBtn.classList.toggle('active',  state.isRepeat);
  modalVolSlider.value = audioPlayer.volume * 100;
  playerModal.classList.toggle('is-playing', state.isPlaying);
}

function syncModalLike() {
  modalLikeBtn.classList.toggle('active', favorites.has(state.currentIndex));
}

function syncModalPlayPause() {
  const iconPlay  = modalPlayPauseBtn.querySelector('.modal-icon-play');
  const iconPause = modalPlayPauseBtn.querySelector('.modal-icon-pause');
  iconPlay.style.display  = state.isPlaying ? 'none' : '';
  iconPause.style.display = state.isPlaying ? '' : 'none';
  playerModal.classList.toggle('is-playing', state.isPlaying);
}

function syncModalProgress() {
  const pct = (state.progress * 100).toFixed(2) + '%';
  modalFill2.style.width  = pct;
  modalThumb.style.left   = pct;
  modalCurrentTime.textContent = fmtTime(state.progress * (state.totalTime || 0));
  modalTotalTime.textContent   = fmtTime(state.totalTime || 0);
}

function loadSong(index) {
  const song = SONGS[index];
  if (!song) return;
  state.currentIndex        = index;
  state.progress            = 0;
  playerArt.src             = song.img;
  playerArt.alt             = song.title;
  playerSong.textContent    = song.title;
  playerArtist.textContent  = song.artist;
  currentTimeEl.textContent = '0:00';
  syncLikeButton(index);
  syncMiniPlayer();
  if (playerModal.classList.contains('open')) syncModalUI();
  updateProgress();
  highlightActiveCard();
  audioPlayer.src = song.audio;
  audioPlayer.load();
  audioPlayer.addEventListener('loadedmetadata', () => {
    state.totalTime         = audioPlayer.duration;
    totalTimeEl.textContent = fmtTime(audioPlayer.duration);
    if (playerModal.classList.contains('open')) syncModalProgress();
  }, { once: true });
  playerArt.style.opacity    = '0';
  playerArt.style.transition = 'opacity 0.35s ease';
  requestAnimationFrame(() => { playerArt.style.opacity = '1'; });
  persistState();
}

function syncLikeButton(index) {
  likeBtn.classList.toggle('active', favorites.has(index));
}

function updateProgress() {
  const pct = (state.progress * 100).toFixed(2) + '%';
  progressFill.style.width  = pct;
  progressThumb.style.left  = pct;
  currentTimeEl.textContent = fmtTime(state.progress * state.totalTime);
  miniProgressFill.style.width = pct;
  if (playerModal.classList.contains('open')) syncModalProgress();
}

audioPlayer.addEventListener('timeupdate', () => {
  if (!audioPlayer.duration) return;
  state.progress  = audioPlayer.currentTime / audioPlayer.duration;
  state.totalTime = audioPlayer.duration;
  totalTimeEl.textContent = fmtTime(audioPlayer.duration);
  updateProgress();
});

audioPlayer.addEventListener('ended', () => {
  if (state.isRepeat) { audioPlayer.currentTime = 0; audioPlayer.play(); }
  else playNext();
});

audioPlayer.addEventListener('error', () => showToast('⚠️ Audio file not found'));

function startTicker() { audioPlayer.play().catch(() => showToast('⚠️ Click anywhere first')); }
function stopTicker()  { audioPlayer.pause(); }

function togglePlayPause() {
  state.isPlaying = !state.isPlaying;
  const iconPlay  = playPauseBtn.querySelector('.icon-play');
  const iconPause = playPauseBtn.querySelector('.icon-pause');
  iconPlay.style.display  = state.isPlaying ? 'none' : '';
  iconPause.style.display = state.isPlaying ? '' : 'none';
  playPauseBtn.classList.toggle('playing', state.isPlaying);
  playerPanel.classList.toggle('is-playing', state.isPlaying);
  if (state.isPlaying) startTicker(); else stopTicker();
  syncMiniPlayPauseIcon();
  syncModalPlayPause();
}

function playNext() {
  let nextIdx;
  if (queue.length > 0) {
    nextIdx = queue.shift();
    persistState();
    if (state.currentView === 'queue') renderQueue();
  } else if (state.isShuffled && state.shuffleOrder.length) {
    const pos = state.shuffleOrder.indexOf(state.currentIndex);
    nextIdx = state.shuffleOrder[(pos + 1) % state.shuffleOrder.length];
  } else {
    nextIdx = (state.currentIndex + 1) % SONGS.length;
  }
  loadSong(nextIdx);
  if (state.isPlaying) startTicker();
}

function playPrev() {
  if (audioPlayer.currentTime > 3) { audioPlayer.currentTime = 0; return; }
  let prevIdx;
  if (state.isShuffled && state.shuffleOrder.length) {
    const pos = state.shuffleOrder.indexOf(state.currentIndex);
    prevIdx = state.shuffleOrder[(pos - 1 + state.shuffleOrder.length) % state.shuffleOrder.length];
  } else {
    prevIdx = (state.currentIndex - 1 + SONGS.length) % SONGS.length;
  }
  loadSong(prevIdx);
  if (state.isPlaying) startTicker();
}

function highlightActiveCard() {
  document.querySelectorAll('.music-card').forEach((card) => {
    const idx = parseInt(card.dataset.songIndex ?? card.dataset.index ?? -1);
    card.classList.toggle('active', idx === state.currentIndex);
  });
  $$('#artistGrid .music-card').forEach((card, i) => {
    card.classList.toggle('active', i === state.currentIndex);
  });
}

function seekProgress(e) {
  const rect     = progressBar.getBoundingClientRect();
  const x        = clamp(e.clientX - rect.left, 0, rect.width);
  const fraction = x / rect.width;
  state.progress = fraction;
  if (audioPlayer.duration) audioPlayer.currentTime = fraction * audioPlayer.duration;
  updateProgress();
}

// ── 12. EVENT LISTENERS — Desktop player
$$('#artistGrid .music-card').forEach((card, index) => {
  card.dataset.index = index;
  card.addEventListener('click', () => {
    if (state.currentIndex === index && state.isPlaying) { togglePlayPause(); return; }
    loadSong(index);
    if (!state.isPlaying) togglePlayPause(); else startTicker();
  });
  card.querySelector('.play-btn.mini')?.addEventListener('click', (e) => { e.stopPropagation(); card.click(); });
});

playPauseBtn.addEventListener('click', togglePlayPause);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

repeatBtn.addEventListener('click', () => {
  state.isRepeat = !state.isRepeat;
  repeatBtn.classList.toggle('active', state.isRepeat);
  modalRepeatBtn.classList.toggle('active', state.isRepeat);
  showToast(state.isRepeat ? '🔁 Repeat on' : '🔁 Repeat off');
});

shuffleBtn.addEventListener('click', () => {
  state.isShuffled = !state.isShuffled;
  shuffleBtn.classList.toggle('active', state.isShuffled);
  modalShuffleBtn.classList.toggle('active', state.isShuffled);
  if (state.isShuffled) { state.shuffleOrder = buildShuffleOrder(state.currentIndex); showToast('🔀 Shuffle on'); }
  else { state.shuffleOrder = []; showToast('🔀 Shuffle off'); }
});

likeBtn.addEventListener('click', () => {
  const liked = favorites.has(state.currentIndex);
  if (liked) { favorites.delete(state.currentIndex); likeBtn.classList.remove('active'); showToast('💔 Removed from Favorites'); }
  else { favorites.add(state.currentIndex); likeBtn.classList.add('active'); showToast('🖤 Added to Favorites'); }
  syncModalLike();
  persistState();
  if (state.currentView === 'favorites') renderFavorites();
});

$('#menuBtn').addEventListener('click', () => {
  const idx = state.currentIndex;
  if (queue.includes(idx)) { showToast('⚠️ Already in Queue'); return; }
  queue.push(idx);
  persistState();
  showToast(`☰ "${SONGS[idx].title}" added to Queue`);
  if (state.currentView === 'queue') renderQueue();
});

volumeSlider.addEventListener('input', () => { audioPlayer.volume = volumeSlider.value / 100; });

let isDragging = false;
progressBar.addEventListener('mousedown', (e) => { isDragging = true; seekProgress(e); stopTicker(); });
document.addEventListener('mousemove', (e) => { if (isDragging) seekProgress(e); });
document.addEventListener('mouseup',   ()  => { if (isDragging) { isDragging = false; if (state.isPlaying) startTicker(); } });

// Sidebar nav (desktop + tablet)
navLinks.forEach((link) => {
  if (!link.dataset.section) return;
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach((l) => l.classList.remove('active'));
    link.classList.add('active');
    bottomNavItems.forEach(b => b.classList.toggle('active', b.dataset.section === link.dataset.section));
    showView(link.dataset.section);
  });
});

// Mini player controls
miniPlayPauseBtn.addEventListener('click', togglePlayPause);
miniPrevBtn.addEventListener('click', playPrev);
miniNextBtn.addEventListener('click', playNext);

// Open modal when tapping mini player info/art (not the control buttons)
miniPlayer.addEventListener('click', (e) => {
  if (e.target.closest('.mini-ctrl')) return;
  syncModalUI();
  playerModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});

// Bottom nav
bottomNavItems.forEach((btn) => {
  if (!btn.dataset.section) return;
  btn.addEventListener('click', () => {
    bottomNavItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    navLinks.forEach(l => { if (l.dataset.section) l.classList.toggle('active', l.dataset.section === btn.dataset.section); });
    showView(btn.dataset.section);
  });
});

// ── FULL-SCREEN MODAL controls
modalClose.addEventListener('click', () => {
  playerModal.classList.remove('open');
  document.body.style.overflow = '';
});

// Swipe down to close
let touchStartY = 0;
playerModal.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; }, { passive: true });
playerModal.addEventListener('touchend',   (e) => {
  if (e.changedTouches[0].clientY - touchStartY > 80) {
    playerModal.classList.remove('open');
    document.body.style.overflow = '';
  }
}, { passive: true });

modalPlayPauseBtn.addEventListener('click', togglePlayPause);
modalPrevBtn.addEventListener('click', () => { playPrev(); setTimeout(syncModalUI, 80); });
modalNextBtn.addEventListener('click', () => { playNext(); setTimeout(syncModalUI, 80); });

modalRepeatBtn.addEventListener('click', () => {
  state.isRepeat = !state.isRepeat;
  repeatBtn.classList.toggle('active', state.isRepeat);
  modalRepeatBtn.classList.toggle('active', state.isRepeat);
  showToast(state.isRepeat ? '🔁 Repeat on' : '🔁 Repeat off');
});

modalShuffleBtn.addEventListener('click', () => {
  state.isShuffled = !state.isShuffled;
  shuffleBtn.classList.toggle('active', state.isShuffled);
  modalShuffleBtn.classList.toggle('active', state.isShuffled);
  if (state.isShuffled) { state.shuffleOrder = buildShuffleOrder(state.currentIndex); showToast('🔀 Shuffle on'); }
  else { state.shuffleOrder = []; showToast('🔀 Shuffle off'); }
});

modalLikeBtn.addEventListener('click', () => {
  const liked = favorites.has(state.currentIndex);
  if (liked) { favorites.delete(state.currentIndex); showToast('💔 Removed from Favorites'); }
  else { favorites.add(state.currentIndex); showToast('🖤 Added to Favorites'); }
  syncLikeButton(state.currentIndex);
  syncModalLike();
  persistState();
  if (state.currentView === 'favorites') renderFavorites();
});

modalMenuBtn.addEventListener('click', () => {
  const idx = state.currentIndex;
  if (queue.includes(idx)) { showToast('⚠️ Already in Queue'); return; }
  queue.push(idx);
  persistState();
  showToast(`☰ "${SONGS[idx].title}" added to Queue`);
  if (state.currentView === 'queue') renderQueue();
});

modalVolSlider.addEventListener('input', () => {
  audioPlayer.volume = modalVolSlider.value / 100;
  volumeSlider.value = modalVolSlider.value;
});

// Modal progress bar seek (touch + mouse)
let isDraggingModal = false;
function seekModal(clientX) {
  const rect     = modalProgressBar.getBoundingClientRect();
  const x        = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const fraction = x / rect.width;
  state.progress = fraction;
  if (audioPlayer.duration) audioPlayer.currentTime = fraction * audioPlayer.duration;
  syncModalProgress();
}
modalProgressBar.addEventListener('mousedown',  (e) => { isDraggingModal = true; seekModal(e.clientX); });
modalProgressBar.addEventListener('touchstart', (e) => { isDraggingModal = true; seekModal(e.touches[0].clientX); }, { passive: true });
document.addEventListener('mousemove',  (e) => { if (isDraggingModal) seekModal(e.clientX); });
document.addEventListener('touchmove',  (e) => { if (isDraggingModal) seekModal(e.touches[0].clientX); }, { passive: true });
document.addEventListener('mouseup',    ()  => { isDraggingModal = false; });
document.addEventListener('touchend',   ()  => { isDraggingModal = false; });

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  const active = document.activeElement;
  if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
  switch (e.code) {
    case 'Space':      e.preventDefault(); togglePlayPause(); break;
    case 'ArrowRight': e.preventDefault(); playNext();        break;
    case 'ArrowLeft':  e.preventDefault(); playPrev();        break;
    case 'KeyR':       repeatBtn.click();                     break;
    case 'KeyL':       likeBtn.click();                       break;
    case 'KeyS':       shuffleBtn.click();                    break;
  }
});

// ── 13. INIT
(function init() {
  loadSong(state.currentIndex);
  syncLikeButton(state.currentIndex);
  syncMiniPlayer();
  syncMiniPlayPauseIcon();
  highlightActiveCard();
  showView('playlist');
  console.info(`%c🎵 Musify — Welcome back, ${currentUser}!`, 'color:#7c83ff;font-weight:bold;');
})();
