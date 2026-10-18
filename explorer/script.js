// make breadcrumbs
// -> fetch current directory
// -> 
// make watch history column
// make explorer itself

const filesDiv = document.getElementsByClassName("files")[0];
const breadcrumbsNav = document.getElementsByClassName("breadcrumbs")[0]

function renderBreadcrumbs() {
  breadcrumbsNav.replaceChildren()
  const currentDir = getCurrentDirectory();
  let currentDirParts = currentDir.split("/")
  if (currentDir === '/') currentDirParts.pop()
  currentDirParts.forEach((part, partIndex) => {
    const crumbElement = document.createElement('span');
    crumbElement.className = "breadCrumbs__item"
    crumbElement.textContent = part
    if (part === "") crumbElement.textContent = "Home"
    const separator = document.createElement("span")
    separator.textContent = "/"
    separator.className = "breadcrumbs__sep"
    breadcrumbsNav.appendChild(crumbElement)

    crumbElement.addEventListener('click', () => {
      let directory = currentDirParts.slice(0, currentDirParts.indexOf(part) + 1)
      console.log(directory.join('/') || '/')
      goTo(directory.join('/') || '/')
    })

    if (partIndex === currentDirParts.length - 1) {
      crumbElement.className += " breadcrumbs__item--current"
      const amountOfFiles = filesDiv.getElementsByClassName("file").length
      const toolbar = document.getElementsByClassName("toolbar__title")[0];
      const toolbarCount = toolbar.getElementsByClassName("toolbar__count")[0];
      toolbar.textContent = crumbElement.textContent
      toolbarCount.textContent = amountOfFiles + " files"
      toolbar.append(toolbarCount)
    } else {
      breadcrumbsNav.appendChild(separator)
    }
  })
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

function getCurrentDirectory() {
  return sessionStorage.getItem("CurrentDirectory") || "/"
}

const mockEntry2 = {
  name: "/mockfile",
  meta: {
    amountOfFiles: 14
  }
}

const mockEntry1 = {
  name: "/mockfile/mockfile2.mp4",
  meta: {
    size: 12023000,
    thumbnail: "photo"
  }
}

function makeEntriesFromCurrentDir() {
  const mediaDirectory = sessionStorage.getItem("mediaDirectory")
  // const mediaDirectory = new Array("/media/file.mp4", "/file.mp4", "/media/another/wowSoMuchMedia/supersecretphoto.jpeg", "/file2.mp4", "/photo.jpeg")
  const currentDirectory = getCurrentDirectory()
  const filesFromCurrentDirectory = mediaDirectory.filter(file => file.startsWith(currentDirectory))
  const dirMap = new Map()
  const fileMap = new Map()
  let currentDir = currentDirectory
  filesFromCurrentDirectory.forEach(file => {
    if (currentDirectory != "/") {
      relativeFile = file.slice(currentDirectory.length)
      currentDir = currentDirectory + "/"
    }
    else
      relativeFile = file
    console.log(relativeFile)
    const partsOfName = relativeFile.split("/")
    if (relativeFile.includes("/", 1)) { // removing first /
      const dir = {
        name: partsOfName[1],
        path: currentDir + partsOfName[1],
        type: "directory",
        meta: {
          amountOfFiles: filesFromCurrentDirectory.filter(f => f.includes(file)).length,
          thumbnail: "./favicon.ico"
        }
      }
      dirMap.set(dir.name, dir)
    }
    else {
      const f = {
        name: partsOfName[1],
        path: currentDir + partsOfName[1],
        type: "media",
        meta: {
          size: 123, // add size from backend
          thumbnail: "photo" // add thumbnail from backend
        }
      }
      fileMap.set(f.name, f)
    }
  })
  return new Array(...dirMap.values(), ...fileMap.values())
}

function renderEntries() {
  filesDiv.replaceChildren();
  const entries = makeEntriesFromCurrentDir();
  for (let entry of entries) {
    const entryElement = document.createElement("a");
    entryElement.className = "file"
    const entryIconElement = document.createElement("div")
    entryIconElement.className = "file__icon"
    const thumbnail = document.createElement('img');
    thumbnail.src = entry.meta.thumbnail
    entryIconElement.appendChild(thumbnail)
    entryElement.appendChild(entryIconElement)

    const entryNameElement = document.createElement("div")
    entryNameElement.className = "file__name"
    entryNameElement.textContent = entry.name
    entryElement.appendChild(entryNameElement)

    const entryMetaElement = document.createElement("div")
    entryMetaElement.className = "file__meta"
    if (entry.meta.size) {
      // const sizes = ["", "KB", "MB", "GB"]
      // const sizeText = entry.meta.size / 1024
      entryMetaElement.textContent = "Size: " + entry.meta.size
    }
    else {
      entryMetaElement.textContent = entry.meta.amountOfFiles + " files"
    }
    entryElement.appendChild(entryMetaElement)

    filesDiv.appendChild(entryElement)
    if (entry.type === "directory") entryElement.addEventListener("click", () => { goTo(entry.path) })
    else (
      entryElement.href = "player?watch=" + encodeURIComponent(entry.path)
    )
  }
}

function goTo(directory) {
  sessionStorage.setItem("CurrentDirectory", directory);
  renderEntries()
  renderBreadcrumbs()
}

function refresh() {
  renderEntries();
  renderBreadcrumbs();
}


document.addEventListener('DOMContentLoaded', () => {
  loadAllMedia()
  renderEntries()
  renderBreadcrumbs()
})
