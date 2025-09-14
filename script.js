// 1. DOM Element Selection
const startCameraBtn = document.getElementById('start-camera-btn');
const scanMoodBtn = document.getElementById('scan-mood-btn');
const cameraFeed = document.getElementById('camera-feed');
const photoCanvas = document.getElementById('photo-canvas');
const guidanceMessage = document.getElementById('guidance-message');
const resultsContainer = document.getElementById('results-container');

// 2. Camera Logic
startCameraBtn.addEventListener('click', startCamera);

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    cameraFeed.srcObject = stream;
    startCameraBtn.classList.add('hidden');
    guidanceMessage.classList.add('hidden');
    scanMoodBtn.classList.remove('hidden');
  } catch (error) {
    guidanceMessage.textContent = 'Camera access denied or failed. Please check your browser settings.';
    console.error('Error accessing camera:', error);
  }
}

// 3. Image Capture & Analysis Logic
scanMoodBtn.addEventListener('click', scanMood);

function scanMood() {
  guidanceMessage.textContent = 'Analyzing...';
  guidanceMessage.classList.remove('hidden');

  const context = photoCanvas.getContext('2d');
  photoCanvas.width = cameraFeed.videoWidth;
  photoCanvas.height = cameraFeed.videoHeight;
  context.drawImage(cameraFeed, 0, 0, photoCanvas.width, photoCanvas.height);

  // Stop the camera stream
  if (cameraFeed.srcObject) {
    const stream = cameraFeed.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    cameraFeed.srcObject = null;
  }

  getMoodAnalysis().then(data => {
    updateResultsUI(data);
    guidanceMessage.classList.add('hidden');
  });
}

// 4. Displaying Results
function updateResultsUI(data) {
  resultsContainer.innerHTML = ''; // Clear previous results

  const moodResult = document.createElement('h3');
  moodResult.textContent = `Looks like you're feeling ${data.mood}!`;

  const foodRecommendation = document.createElement('p');
  foodRecommendation.textContent = `How about some comforting ${data.food.name} to lift your spirits?`;

  const deliveryLinks = document.createElement('div');
  deliveryLinks.className = 'delivery-links';
  deliveryLinks.innerHTML = `
    <a href="${data.food.links.zomato}" target="_blank">Order on Zomato</a>
    <a href="${data.food.links.swiggy}" target="_blank">Order on Swiggy</a>
  `;

  const musicHeader = document.createElement('h4');
  musicHeader.textContent = 'Here are some music to match your current vibe:';

  const songRecommendations = document.createElement('div');
  songRecommendations.className = 'song-recommendations';
  data.music.forEach(song => {
    songRecommendations.innerHTML += `<a href="${song.link}" target="_blank">${song.title} by ${song.artist}</a>`;
  });

  resultsContainer.appendChild(moodResult);
  resultsContainer.appendChild(foodRecommendation);
  resultsContainer.appendChild(deliveryLinks);
  resultsContainer.appendChild(musicHeader);
  resultsContainer.appendChild(songRecommendations);

  resultsContainer.classList.remove('hidden');
}

// 5. Mock Data (for Simulation)
const mockMoodData = [
  {
    mood: "Happy",
    food: { name: "Pizza", links: { zomato: "#", swiggy: "#" } },
    music: [
      { title: "Happy", artist: "Pharrell Williams", link: "#" },
      { title: "Don't Stop Me Now", artist: "Queen", link: "#" },
    ],
  },
  {
    mood: "Sad",
    food: { name: "Ice Cream", links: { zomato: "#", swiggy: "#" } },
    music: [
      { title: "Someone Like You", artist: "Adele", link: "#" },
      { title: "Fix You", artist: "Coldplay", link: "#" },
    ],
  },
  {
    mood: "Stressed",
    food: { name: "Dark Chocolate", links: { zomato: "#", swiggy: "#" } },
    music: [
      { title: "Weightless", artist: "Marconi Union", link: "#" },
      { title: "Clair de Lune", artist: "Claude Debussy", link: "#" },
    ],
  },
  {
    mood: "Energetic",
    food: { name: "a Smoothie", links: { zomato: "#", swiggy: "#" } },
    music: [
        { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", link: "#" },
        { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", link: "#" },
    ],
  },
];

function getMoodAnalysis() {
  return new Promise(resolve => {
    setTimeout(() => {
      const randomMood = mockMoodData[Math.floor(Math.random() * mockMoodData.length)];
      resolve(randomMood);
    }, 2000);
  });
}
