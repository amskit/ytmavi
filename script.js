document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("download-form");
  const input = document.getElementById("video-url");
  const resultsContainer = document.getElementById("results");
  const loadingIndicator = document.getElementById("loading-indicator");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const videoUrl = input.value.trim();
    if (!videoUrl) {
      alert("Please enter a valid video URL.");
      return;
    }

    // UI Reset
    resultsContainer.classList.add("hidden");
    loadingIndicator.classList.remove("hidden");

    // API کال
    fetch(`https://youtube-video-info.p.rapidapi.com/dl?id=${extractVideoId(videoUrl)}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'YOUR_API_KEY_HERE', // اپنی API Key لگائیں
        'X-RapidAPI-Host': 'youtube-video-info.p.rapidapi.com'
      }
    })
      .then(response => response.json())
      .then(data => {
        loadingIndicator.classList.add("hidden");
        resultsContainer.innerHTML = "";
        resultsContainer.classList.remove("hidden");

        if (!data || !data.links) {
          resultsContainer.innerHTML = "<p>Video info not found.</p>";
          return;
        }

        // 🎥 ویڈیو کا ٹائٹل، تھمبنیل اور تفصیل
        resultsContainer.innerHTML += `
          <div class="video-info">
            <img src="${data.thumbnail.high}" alt="Thumbnail" class="thumbnail">
            <div class="video-details">
              <h3>${data.title}</h3>
              <p>${data.description || "No description available."}</p>
            </div>
          </div>
          <h4>Available Formats:</h4>
        `;

        // 🔽 تمام ڈاؤنلوڈ آپشنز
        data.links.forEach(link => {
          const sizeMB = (link.size / (1024 * 1024)).toFixed(2);
          const audioIcon = link.audio === false
            ? `<span class="audio-icon silent">🔇 No Audio</span>`
            : `<span class="audio-icon">🔊 With Audio</span>`;

          resultsContainer.innerHTML += `
            <div class="quality-option">
              <div class="quality-left">
                <strong>${link.quality}</strong> (${link.container.toUpperCase()}) - ${sizeMB} MB
                ${audioIcon}
              </div>
              <a href="${link.url}" target="_blank" class="download-button">Download</a>
            </div>
          `;
        });
      })
      .catch(error => {
        loadingIndicator.classList.add("hidden");
        resultsContainer.innerHTML = "<p>Error fetching video info. Please try again.</p>";
      });
  });

  function extractVideoId(url) {
    const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regExp);
    return match && match[1] ? match[1] : "";
  }
});
