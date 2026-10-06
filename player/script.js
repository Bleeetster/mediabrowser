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
  const mediaInfo = await fetch("/api/mediainfo?file=" + encodeURIComponent(currentFilename()))

  if (mediaInfo.type === "video") {
    const video = document.createElement('video');
    video.src = '/api/media?file=' + encodeURIComponent(mediaInfo.name)
    mediaContainer.replaceChildren(video)
  }
  else {
    const image = document.createElement('img')
    image.src = '/api/media?file=' + encodeURIComponent(mediaInfo.name)
    mediaContainer.replaceChildren(image)
  }
}



async function loadAllMedia() {
  try {
    const mediaDirectory = await fetch("/api/loadMedia")
  } catch (error) {
    console.error(error)
    throw Error("COULD_NOT_FETCH_FROM_BACKEND")
  }
  sessionStorage.setItem("mediaDirectory", mediaDirectory)
}

function findMediaFileInArray() {
  const mediaTree = JSON.parse(sessionStorage.getItem("mediaDirectory"));
  const mediaName = currentFilename();
  const indexOfCurrentMedia = mediaTree.indexOf(mediaName)
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
  const mediaFileName = mediaTree[currentIndex]
  const search = window.location.search;
  let query = new URLSearchParams(search)
  query.set("watch", encodeURIComponent(mediaFileName))
  window.location.search = query.toString();
  playMediaFile()
}
function goPrevious() {
  const mediaTree = JSON.parse(sessionStorage.getItem("mediaDirectory"));
  if (currentIndex <= 0) return;
  currentIndex -= 1
  const mediaFileName = mediaTree[currentIndex]
  const search = window.location.search;
  let query = new URLSearchParams(search)
  query.set("watch", encodeURIComponent(mediaFileName))
  window.location.search = query.toString();
  playMediaFile()
}


document.addEventListener("DOMContentLoaded", () => {
  sessionStorage.setItem("mediaDirectory", JSON.stringify(new Array("/media/file.mp4", "/file.mp4", "/media/another/wowSoMuchMedia/supersecretphoto.jpeg")))
  currentIndex = findMediaFileInArray();
  playMediaFile();
  nextButton.addEventListener("click", goNext)
  previousButton.addEventListener("click", goPrevious)
})
