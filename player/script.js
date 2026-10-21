import { apiFormater } from "/api/apiFormater.js";
const api = new apiFormater()
// buttons
const backButton = document.getElementsByClassName("btn-back")[0];
const nextButton = document.getElementsByClassName("btn-next")[0];
const previousButton = document.getElementsByClassName("btn-previous")[0];
//media container
const mediaContainer = document.getElementsByClassName("media-container")[0];
const bottomBar = document.getElementsByClassName("bottom-bar")[0];
let currentIndex = 0;

function currentFilename() {
  const search = window.location.search;
  const query = new URLSearchParams(search)
  const fileName = decodeURIComponent(query.get("watch"))
  if (fileName === 'null') throw Error("THERE_IS_NO_FILENAME")
  return fileName
}


const mockVideofile = {
  name: "filename.mp4",
  type: "video"
}

const mockImagefile = {
  name: "imagefile.jpeg",
  type: "image"
}

async function playMediaFile() {
  // 
  // TODO connect to backend endpoint

  // using mockfile for now;
  // No you dumbass
  const mediaTree = JSON.parse(sessionStorage.getItem("mediaDirectory"))
  const mediaInfo = mediaTree[currentIndex]

  if (mediaInfo.type.includes("video")) {
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.defaultMuted = false;
    video.loop = true;
    video.src = '/api/media?file=' + encodeURIComponent(mediaInfo.path)
    mediaContainer.replaceChildren(video)
  }
  else {
    const image = document.createElement('img')
    image.src = '/api/media?file=' + encodeURIComponent(mediaInfo.path)
    mediaContainer.replaceChildren(image)
  }
}



async function loadAllMedia() {
  const mediaDirectory = await api.loadAllMedia()
  sessionStorage.setItem("mediaDirectory", JSON.stringify(mediaDirectory))
}

function findMediaFileInArray() {
  const mediaTree = JSON.parse(sessionStorage.getItem("mediaDirectory"));
  const mediaName = currentFilename();
  const indexOfCurrentMedia = mediaTree.findIndex(media => media.path === mediaName)
  console.log(indexOfCurrentMedia)

  if (indexOfCurrentMedia < 0) {
    throw Error("FILE_NOT_FOUND")
  }
  return indexOfCurrentMedia;
}


function goNext() {
  const mediaTree = JSON.parse(sessionStorage.getItem("mediaDirectory"));
  if (currentIndex >= mediaTree.length - 1) return;
  currentIndex += 1
  const mediaFilePath = mediaTree[currentIndex].path
  const search = window.location.search;
  let query = new URLSearchParams(search)
  query.set("watch", encodeURIComponent(mediaFilePath))
  window.location.search = query.toString();
  playMediaFile()
}
function goPrevious() {
  const mediaTree = JSON.parse(sessionStorage.getItem("mediaDirectory"));
  if (currentIndex <= 0) return;
  currentIndex -= 1
  const mediaFilePath = mediaTree[currentIndex].path
  const search = window.location.search;
  let query = new URLSearchParams(search)
  query.set("watch", encodeURIComponent(mediaFilePath))
  window.location.search = query.toString();
  playMediaFile()
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadAllMedia()
  currentIndex = findMediaFileInArray();
  playMediaFile();
  nextButton.addEventListener("click", goNext)
  previousButton.addEventListener("click", goPrevious)
})
