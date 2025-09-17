'use strict';

// DOM Element Selection
const takePhotoBtn = document.getElementById('take-photo-btn');
const mediaContainer = document.getElementById('media-container');
const cameraFeed = document.getElementById('camera-feed');
const photoCanvas = document.getElementById('photo-canvas');
const imagePlaceholder = document.getElementById('image-placeholder');
const resultsContainer = document.getElementById('results-container');
const analyzingLoader = document.getElementById('analyzing-loader');

// Food suggestion dictionary
const food_suggestions = {
    "Angry": "How about something crunchy like chips or spicy chaat?",
    "Disgusted": "Maybe some mint tea or a fresh salad?",
    "Fearful": "Comfort food helps — try a bowl of warm soup!",
    "Happy": "Celebrate with ice cream or your favorite dessert!",
    "Neutral": "Maybe a sandwich or smoothie to keep you going?",
    "Sad": "Chocolate or comfort food like biryani can lift your mood!",
    "Surprised": "Surprise yourself with sushi or a fun snack!"
};

// Mock Data (for Simulation)
const mockMoodData = [
  {
    mood: "Happy",
    emoji: "😊",
    confidence: 92,
    food: [
      { name: "Chocolate Brownie", type: "order", link: "#" },
      { name: "Masala Dosa", type: "recipe", link: "#" }
    ],
    music: [
      { title: "Happy", artist: "Pharrell Williams", link: "#" },
      { title: "Can't Stop the Feeling!", artist: "Justin Timberlake", link: "#" }
    ]
  },
  {
    mood: "Sad",
    emoji: "😢",
    confidence: 85,
    food: [
      { name: "Ice Cream", type: "order", link: "#" },
      { name: "Soup", type: "recipe", link: "#" }
    ],
    music: [
      { title: "Someone Like You", artist: "Adele", link: "#" },
      { title: "Fix You", artist: "Coldplay", link: "#" }
    ]
  },
  {
    mood: "Surprised",
    emoji: "😮",
    confidence: 88,
    food: [
      { name: "Pizza", type: "order", link: "#" },
      { name: "Sushi", type: "recipe", link: "#" }
    ],
    music: [
      { title: "Don't Stop Me Now", artist: "Queen", link: "#" },
      { title: "Wake Me Up", artist: "Avicii", link: "#" }
    ]
  },
  {
    mood: "Angry",
    emoji: "😠",
    confidence: 80,
    food: [
      { name: "Burger", type: "order", link: "#" },
      { name: "Fries", type: "recipe", link: "#" }
    ],
    music: [
      { title: "Stronger", artist: "Kanye West", link: "#" },
      { title: "Lose Yourself", artist: "Eminem", link: "#" }
    ]
  }
];

// Global variable to track current stream
let currentStream = null;
let isCapturing = false;

// Event listener for the main button
takePhotoBtn.addEventListener('click', async function handlePhotoCapture() {
  // If already capturing, this is the capture action
  if (isCapturing && currentStream) {
    capturePhoto();
    return;
  }

  // Start camera
  try {
    // Update button to show starting camera
    takePhotoBtn.innerHTML = '<i class="fa fa-video"></i> Starting Camera...';
    takePhotoBtn.disabled = true;

    // Request camera access
    currentStream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      } 
    });

    // Hide placeholder and show live camera feed
    imagePlaceholder.style.display = 'none';
    
    // Remove any existing captured images
    const existingImg = mediaContainer.querySelector('img');
    if (existingImg) existingImg.remove();
    
    cameraFeed.srcObject = currentStream;
    cameraFeed.classList.remove('hidden');

    // Wait for video to be ready
    await new Promise((resolve) => {
      cameraFeed.onloadedmetadata = () => {
        cameraFeed.play();
        resolve();
      };
    });

    // Update button to capture photo
    takePhotoBtn.innerHTML = '<i class="fa fa-camera"></i> Capture Photo';
    takePhotoBtn.disabled = false;
    isCapturing = true;

  } catch (err) {
    console.error('Camera error:', err);
    let errorMessage = 'Camera access failed. ';
    
    if (err.name === 'NotAllowedError') {
      errorMessage += 'Please allow camera access and try again.';
    } else if (err.name === 'NotFoundError') {
      errorMessage += 'No camera found on this device.';
    } else if (err.name === 'NotSupportedError') {
      errorMessage += 'Camera not supported on this browser.';
    } else {
      errorMessage += 'Please check your camera settings.';
    }
    
    alert(errorMessage);
    resetButton();
  }
});

function capturePhoto() {
  if (!currentStream) return;

  // Show analyzing loader instead of changing button text
  analyzingLoader.classList.remove('hidden');
  takePhotoBtn.disabled = true;
  isCapturing = false;

  // Capture the current frame
  const canvas = document.createElement('canvas');
  canvas.width = cameraFeed.videoWidth || 640;
  canvas.height = cameraFeed.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(cameraFeed, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL('image/png');

  // Stop camera feed and hide video
  currentStream.getTracks().forEach(track => track.stop());
  currentStream = null;
  cameraFeed.classList.add('hidden');
  cameraFeed.srcObject = null;

  // Display captured image
  const capturedImg = document.createElement('img');
  capturedImg.src = imageData;
  capturedImg.style.width = '100%';
  capturedImg.style.height = '100%';
  capturedImg.style.objectFit = 'cover';
  capturedImg.style.transform = 'scaleX(-1)'; // Mirror the captured image
  mediaContainer.appendChild(capturedImg);

  // Simulate mood analysis
  getMoodAnalysis().then(data => {
    // Hide analyzing loader
    analyzingLoader.classList.add('hidden');
    updateResultsUI(data);
    resetButton();
  });

  canvas.remove();
}

function resetButton() {
  takePhotoBtn.innerHTML = '<i class="fa fa-camera-retro"></i> Take Another Photo';
  takePhotoBtn.disabled = false;
  isCapturing = false;
  currentStream = null;
}

/**
 * SIMULATED BACKEND CALL
 * This is a placeholder for a real API call. It resolves with
 * hardcoded "Happy" data to match the screenshot.
 */
function getMoodAnalysis() {
  return new Promise(resolve => {
    setTimeout(() => {
      const randomMood = mockMoodData[Math.floor(Math.random() * mockMoodData.length)];
      resolve(randomMood);
    }, 2000); // Simulate 2-second analysis
  });
}

function updateResultsUI(data) {
  const suggestionText = food_suggestions[data.mood] || "";
  
  // Generate Music recommendations HTML
  const musicHTML = data.music.map((item, index) => `
    <div class="recommendation-item">
      <span>${index + 1}. ${item.name}</span>
      <a href="${item.link}" target="_blank" class="btn btn-primary item-link">Play on Spotify</a>
    </div>
  `).join('');

  // Generate Food recommendations HTML
  const foodHTML = data.food.map((item, index) => `
    <div class="recommendation-item">
      <span>${index + 1}. ${item.name}</span>
      ${item.type === 'order'
        ? `<a href="#" target="_blank" class="btn btn-secondary item-link">Order Online</a>`
        : `<a href="#" target="_blank" class="btn btn-secondary item-link">Order Online</a>`
      }
    </div>
  `).join('');

  // Final results HTML structure
  const resultsHTML = `
    <div class="detection-info">
      <h2 class="detected-emotion">Detected Emotion: ${data.mood} ${data.emoji}</h2>
      <p class="confidence">Confidence: ${data.confidence}%</p>
    </div>
    
    <div class="recommendation-card">
      <h3>Food Recommendations</h3>
      <p style="margin-bottom:1rem;color:#6c757d;font-size:0.95rem;">${suggestionText}</p>
      ${foodHTML}
    </div>

    <div class="recommendation-card">
      <h3>Music Recommendations</h3>
      ${musicHTML}
    </div>
  `;

  resultsContainer.innerHTML = resultsHTML;

  // Show results and footer, hide controls
  resultsContainer.classList.remove('hidden');
  appFooter.classList.remove('hidden');
  document.querySelector('.controls').classList.add('hidden');

  // Change the canvas to a static image display
  const finalImage = new Image();
  finalImage.src = photoCanvas.toDataURL('image/png');
  finalImage.style.width = '100%';
  finalImage.style.height = '100%';
  finalImage.style.objectFit = 'cover';
  
  mediaContainer.innerHTML = ''; // Clear canvas/video
  mediaContainer.appendChild(finalImage); // Append final image
}