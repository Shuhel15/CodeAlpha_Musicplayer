class MusicPlayer {
constructor(tracks) {
this.tracks = tracks;
this.currentTrackIndex = 0;
this.isPlaying = false;
this.currentTime = 0;
this.volume = 70;
this.isShuffled = false;
this.isRepeated = false;
this.playInterval = null;

this.initializeElements();
this.setupEventListeners();
this.updateTrackInfo();
this.generatePlaylist();
this.generateVisualizationBars();
}

initializeElements() {
this.vinylRecord = document.getElementById('vinylRecord');
this.trackCover = document.getElementById('trackCover');
this.trackTitle = document.getElementById('trackTitle');
this.trackArtist = document.getElementById('trackArtist');
this.currentTimeDisplay = document.getElementById('currentTime');
this.totalTimeDisplay = document.getElementById('totalTime');
this.progressSlider = document.getElementById('progressSlider');
this.volumeSlider = document.getElementById('volumeSlider');
this.volumeDisplay = document.getElementById('volumeDisplay');
this.visualizationBars = document.getElementById('visualizationBars');
this.playlistContainer = document.getElementById('playlistContainer');

this.playBtn = document.getElementById('playBtn');
this.playIcon = document.getElementById('playIcon');
this.prevBtn = document.getElementById('prevBtn');
this.nextBtn = document.getElementById('nextBtn');
this.shuffleBtn = document.getElementById('shuffleBtn');
this.repeatBtn = document.getElementById('repeatBtn');
}

setupEventListeners() {
this.playBtn.addEventListener('click', () => this.togglePlayPause());
this.prevBtn.addEventListener('click', () => this.previousTrack());
this.nextBtn.addEventListener('click', () => this.nextTrack());
this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
this.progressSlider.addEventListener('input', (e) => {
this.currentTime = parseInt(e.target.value);
if (this.audio) {
this.audio.currentTime = this.currentTime;
}
this.updateTimeDisplay();
});
this.volumeSlider.addEventListener('input', (e) => {
this.volume = parseInt(e.target.value);
this.volumeDisplay.textContent = this.volume;
if (this.audio) {
this.audio.volume = this.volume / 100;
}
});
document.addEventListener('keydown', (e) => {
switch (e.code) {
case 'Space':
    e.preventDefault();
    this.togglePlayPause();
    break;
case 'ArrowLeft':
    this.previousTrack();
    break;
case 'ArrowRight':
    this.nextTrack();
    break;
}
});
}

togglePlayPause() {
this.isPlaying = !this.isPlaying;
if (this.isPlaying) {
this.play();
} else {
this.pause();
}
this.updatePlayButton();
this.updateVinylAnimation();
this.updateVisualization();
}

play() {
const currentFile = this.tracks[this.currentTrackIndex].file;

// Agar audio yo'q bo'lsa — yaratamiz
if (!this.audio) {
this.audio = new Audio(currentFile);
this.audio.volume = this.volume / 100;

this.audio.addEventListener('timeupdate', () => {
this.currentTime = Math.floor(this.audio.currentTime);
this.updateTimeDisplay();
this.updateProgressSlider();

if (this.currentTime >= this.audio.duration) {
this.handleTrackEnd();
}
});

this.audio.addEventListener('ended', () => {
this.handleTrackEnd();
});

this.audio.addEventListener('error', (e) => {
console.error('Audio error:', e);
alert('Failed to load audio file. Please check the file path or availability.');
});

this.audio.currentTime = this.currentTime || 0;
} else {
// Agar yangi trek bo'lsa — src ni yangilaymiz
if (this.audio.src !== location.origin + '/' + currentFile) {
this.audio.src = currentFile;
this.audio.load();
this.audio.currentTime = this.currentTime || 0;
}
}

this.audio.play().catch((error) => {
console.error('Playback failed:', error);
alert('Playback failed. Ensure the audio file is accessible and try again.');
});

this.isPlaying = true;
this.updatePlayButton();
this.updateVinylAnimation();
this.updateVisualization();
}

pause() {
if (this.audio) {
this.audio.pause();
this.currentTime = this.audio.currentTime;
}

this.isPlaying = false;
this.updatePlayButton();
this.updateVinylAnimation();
this.updateVisualization();
}


handleTrackEnd() {
if (this.isRepeated) {
this.currentTime = 0;
if (this.audio) this.audio.currentTime = 0;
this.play();
} else {
this.nextTrack();
}
}

previousTrack() {
this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
this.changeTrack();
}

nextTrack() {
if (this.isShuffled) {
this.currentTrackIndex = Math.floor(Math.random() * this.tracks.length);
} else {
this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
}
this.changeTrack();
}

changeTrack() {
if (this.audio) {
this.audio.pause();
}
this.currentTime = 0;
this.updateTrackInfo();
this.updateProgressSlider();
this.updateTimeDisplay();
this.play();
this.updatePlaylistActiveItem();
}

updateTrackInfo() {
const track = this.tracks[this.currentTrackIndex];
this.trackTitle.textContent = track.title;
this.trackArtist.textContent = track.artist;
this.trackCover.textContent = track.cover || '🎵';
this.totalTimeDisplay.textContent = this.formatTime(track.duration);
this.progressSlider.max = track.duration;
this.progressSlider.value = 0;
}

updatePlayButton() {
this.playIcon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
}

updateVinylAnimation() {
if (this.isPlaying) {
this.vinylRecord.classList.add('vinyl-spinning');
this.vinylRecord.classList.remove('vinyl-paused');
} else {
this.vinylRecord.classList.remove('vinyl-spinning');
this.vinylRecord.classList.add('vinyl-paused');
}
}

updateTimeDisplay() {
this.currentTimeDisplay.textContent = this.formatTime(this.currentTime);
}

updateProgressSlider() {
this.progressSlider.value = this.currentTime;
}

toggleShuffle() {
this.isShuffled = !this.isShuffled;
this.shuffleBtn.classList.toggle('active', this.isShuffled);
}

toggleRepeat() {
this.isRepeated = !this.isRepeated;
this.repeatBtn.classList.toggle('active', this.isRepeated);
}

formatTime(seconds) {
const mins = Math.floor(seconds / 60);
const secs = seconds % 60;
return `${mins}:${secs.toString().padStart(2, '0')}`;
}

generatePlaylist() {
this.playlistContainer.innerHTML = '';
this.tracks.forEach((track, i) => {
const item = document.createElement('div');
item.classList.add('playlist-item');
item.dataset.index = i;

const cover = document.createElement('div');
cover.classList.add('playlist-item-cover');
cover.textContent = track.cover || '🎵';

const info = document.createElement('div');
info.classList.add('playlist-item-info');

const title = document.createElement('div');
title.classList.add('playlist-item-title');
title.textContent = track.title;

const artist = document.createElement('div');
artist.classList.add('playlist-item-artist');
artist.textContent = track.artist;

const duration = document.createElement('div');
duration.classList.add('playlist-item-duration');
duration.textContent = this.formatTime(track.duration);

info.appendChild(title);
info.appendChild(artist);

item.appendChild(cover);
item.appendChild(info);
item.appendChild(duration);

item.addEventListener('click', () => {
this.currentTrackIndex = i;
this.changeTrack();
});

this.playlistContainer.appendChild(item);
});
this.updatePlaylistActiveItem();
}

updatePlaylistActiveItem() {
const items = this.playlistContainer.querySelectorAll('.playlist-item');
items.forEach(item => item.classList.remove('active'));
const currentItem = this.playlistContainer.querySelector(`.playlist-item[data-index="${this.currentTrackIndex}"]`);
if (currentItem) currentItem.classList.add('active');
}

generateVisualizationBars() {
this.visualizationBars.innerHTML = '';
for (let i = 0; i < 20; i++) {
const bar = document.createElement('div');
bar.classList.add('vis-bar');
this.visualizationBars.appendChild(bar);
}
}

updateVisualization() {
const bars = this.visualizationBars.children;
if (this.isPlaying && this.audio) {
for (let i = 0; i < bars.length; i++) {
bars[i].classList.add('active');
bars[i].style.transform = `scaleY(${0.5 + Math.random() * 0.5})`;
}
} else {
for (let i = 0; i < bars.length; i++) {
bars[i].classList.remove('active');
bars[i].style.transform = `scaleY(0.5)`;
}
}
}
}

async function loadTracksFromAudioFolder() {
const fileNames = [
"audio/01 Mundiyan - Baaghi 2.mp3",
"audio/02 Kamariya - Stree.mp3",
"audio/04 Ek Do Teen - Baaghi 2.mp3",
"audio/04 Proper Patola - Namaste England.mp3",
"audio/06 Get Ready To Fight Again - Baaghi 2.mp3",
"audio/'Abhi Toh Party Shuru Hui Hai' FULL VIDEO Song Khoobsurat Badshah Aastha.mp3",
"audio/Shape of You.mp3"
];

const tracks = [];
for (const file of fileNames) {
const track = {
file,
title: file.split('/').pop().replace(/\.[^/.]+$/, ""),
artist: "Unknown",
cover: "🎵",
duration: 0
};

await new Promise((resolve) => {
const audio = new Audio(file);
audio.addEventListener('loadedmetadata', () => {
track.duration = Math.floor(audio.duration);
resolve();
});
audio.addEventListener('error', () => {
console.error(`Failed to load metadata for ${file}`);
track.duration = 0;
resolve();
});
});

tracks.push(track);
}
return tracks;
}

(async () => {
const tracks = await loadTracksFromAudioFolder();
const player = new MusicPlayer(tracks);
})();


// Background image changer
const images = [
'url("https://images.wallpapersden.com/image/download/ai-landscape-2023-digital-art_bmVubGiUmZqaraWkpJRmbmpnrWZmZ2U.jpg")',
'url("https://images.fastcompany.com/image/upload/f_webp,q_auto,c_fit/wp-cms/uploads/2023/10/adobecreators2023.jpg")',
'url("https://t3.ftcdn.net/jpg/08/08/39/00/360_F_808390035_jPKb4fKJgcbTKKcLW292kakHfsgEqKGq.jpg")',
'url("https://img.freepik.com/premium-photo/silhouette-tree-reflects-beauty-nature-tranquil-summer-night-generated-by-ai_24640-131619.jpg")'
];

let index = 0;
const bg1 = document.querySelector('.bg1');
const bg2 = document.querySelector('.bg2');
let showingBg1 = true;

function changeBackground() {
index = (index + 1) % images.length;
const nextImage = images[index];

if (showingBg1) {
bg2.style.backgroundImage = nextImage;
bg2.style.opacity = 1;
bg1.style.opacity = 0;
} else {
bg1.style.backgroundImage = nextImage;
bg1.style.opacity = 1;
bg2.style.opacity = 0;
}

showingBg1 = !showingBg1;
}

bg1.style.backgroundImage = images[0];
bg1.style.opacity = 1;
bg2.style.opacity = 0;

setInterval(changeBackground, 50000);




