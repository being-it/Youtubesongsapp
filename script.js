function findSongs() {
  const apiKeys = [
    "AIzaSyCsUokIgrsCpJo952ikoW7lZFJEQKUsXrA",
    "AIzaSyC1vkCb8pdaIZjK1O9fZGma5x91LSRS31Q"
  ];

  const input = document.getElementById("songs").value.trim();
  if (input === "") {
    alert("Please enter at least one song name.");
    return;
  }
  const songs = input.split(",").map(song => song.trim()).filter(song => song !== "");
  if (songs.length === 0) {
    alert("Please enter at least one valid song name.");
    return;
  }
  if (songs.length > 50) {
    alert("Maximum number of songs you can search at a time is 50.");
    return;
  }

  const output = document.getElementById("output");
  output.innerHTML = "";

  const videoList = [];
  const promises = [];

  songs.forEach((song, index) => {
    const apiKeyIndex = index % apiKeys.length;
    const apiKey = apiKeys[apiKeyIndex];
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      song
    )}&type=video&key=${apiKey}`;

    const promise = fetch(url)
      .then((response) => {
        if (response.status === 403) {
          throw new Error(`API key limit exceeded for "${apiKey}".`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.items.length === 0) {
          throw new Error(`No video found for "${song}".`);
        }
        const videoId = data.items[0].id.videoId;
        const videoTitle = data.items[0].snippet.title;
        const videoThumbnail = data.items[0].snippet.thumbnails.default.url;
        const videoLink = `https://www.youtube.com/watch?v=${videoId}`;

        videoList.push({
          videoId: videoId,
          videoTitle: videoTitle,
          videoThumbnail: videoThumbnail,
          videoLink: videoLink,
          originalIndex: index
        });
      })
      .catch((error) => {
        console.log(error);
        const errorMessage = document.createElement("p");
        errorMessage.textContent = `Error finding video for "${song}".`;
        output.appendChild(errorMessage);
      });

    promises.push(promise);
  });

  Promise.all(promises)
    .then(() => {
      videoList.sort((a, b) => a.originalIndex - b.originalIndex);

      videoList.forEach((video, index) => {
        const songItem = document.createElement("li");
        songItem.classList.add("song");
        const number = document.createElement("span");
        number.classList.add("song-number");
        number.textContent = `${index + 1}. `;
        const title = document.createElement("span");
        title.classList.add("song-title");
        title.textContent = video.videoTitle;
        const thumbnail = document.createElement("img");
        thumbnail.src = video.videoThumbnail;
        thumbnail.alt = video.videoTitle;
        const link = document.createElement("a");
        link.href = video.videoLink;
        link.textContent = "Watch on YouTube";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.classList.add("song-link");
        songItem.appendChild(number);
        songItem.appendChild(thumbnail);
        songItem.appendChild(title);
        songItem.appendChild(link);
        output.appendChild(songItem);
      });

      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("container");
      buttonContainer.classList.add("container-view");

      const viewPlaylistButton = document.createElement("button");
      viewPlaylistButton.textContent = "View Playlist";
      viewPlaylistButton.classList.add("button");
      viewPlaylistButton.addEventListener("click", () => {
        const videoIds = videoList.map((video) => video.videoId).join(",");
        const playlistUrl = `http://www.youtube.com/watch_videos?video_ids=${videoIds}`;
        window.open(playlistUrl, "_blank");
      });

      const spacingElement = document.createElement("span");
      spacingElement.classList.add("button-spacing");

      const copyLinkButton = document.createElement("button");
      copyLinkButton.textContent = "Copy Playlist Link";
      copyLinkButton.classList.add("button");
      copyLinkButton.addEventListener("click", copyPlaylistLink);

      buttonContainer.appendChild(viewPlaylistButton);
      buttonContainer.appendChild(spacingElement);
      buttonContainer.appendChild(copyLinkButton);
      output.appendChild(buttonContainer);
    })
    .catch(() => {
      output.innerHTML = "";
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "An error occurred while searching for videos.";
      output.appendChild(errorMessage);
    });

  function copyPlaylistLink() {
    const videoIds = videoList.map((video) => video.videoId).join(",");
    const playlistUrl = `http://www.youtube.com/watch_videos?video_ids=${videoIds}`;

    const textarea = document.createElement("textarea");
    textarea.value = playlistUrl;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    alert("Playlist link copied to clipboard!");
  }
}
