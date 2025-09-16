console.log('Lets write JavaScript');
let currentNaat = new Audio();
let naats;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getNaats(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`) 
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    naats = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            naats.push(element.href.split(`/${folder}/`)[1])
        }
    }
 console.log(response)


    // Show all the naats in the playlist
    let naatUL = document.querySelector(".naatlist").getElementsByTagName("ul")[0]
    naatUL.innerHTML = ""
    for (const naat of naats) {
        naatUL.innerHTML = naatUL.innerHTML + `<li data-file="${naat}"><img class="invert" width="34" src="naat.svg" alt="">
                            <div class="info">
                                <div> ${naat.replaceAll("%20", " ")}</div>
                                <div>Reciter</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each naat
    Array.from(document.querySelector(".naatlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const file = e.getAttribute('data-file');
            if (file) playNaat(file);
        })
    })

    return naats
}

const playNaat = (track, pause = false) => {
    currentNaat.src = `/${currFolder}/` + track
    if (!pause) {
        currentNaat.play()
        play.src = "paused.svg"
    }
    document.querySelector(".naatinfo").innerHTML = decodeURI(track)
    document.querySelector(".naattime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    console.log("displaying albums")
    let a = await fetch(`/naats/`).catch(()=>null)
    if (!a) return;
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    // Optional static covers by folder name (use files that exist in your project)
    const COVER_MAP = {
        Junaidjamsheed: 'bgimage.png',
        Atifaslam: 'bgimage.png',
        MaherZain: 'bgimage.png',
        Nusrat: 'bgimage.png'
    };
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        // pick subfolders only
        if (e.href.includes("/naats/") && !e.href.match(/\.(mp3|wav|m4a|htaccess)$/i)) {
            let folder = e.href.split("/").filter(Boolean).pop();
            // Build a simple card; fallback cover if none
            const coverSrc = COVER_MAP[folder] || `/naats/${folder}/cover.jpg`;
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
                </div>

            <img src="${coverSrc}" alt="${folder} cover" onerror="this.src='naat.svg'">
            <h2>${folder}</h2>
            <p>Playlist: ${folder}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Naats")
            naats = await getNaats(`naats/${item.currentTarget.dataset.folder}`)  
            playNaat(naats[0])

        })
    })
}

async function main() {
    // Get the list of all the naats
    await getNaats("naats/Junaidjamsheed")
    playNaat(naats[0], true)

    // Display all the albums on the page
    await displayAlbums()


    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentNaat.paused) {
            currentNaat.play()
            play.src = "paused.svg"
        }
        else {
            currentNaat.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentNaat.addEventListener("timeupdate", () => {
        document.querySelector(".naattime").innerHTML = `${secondsToMinutesSeconds(currentNaat.currentTime)} / ${secondsToMinutesSeconds(currentNaat.duration)}`
        document.querySelector(".circle").style.left = (currentNaat.currentTime / currentNaat.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentNaat.currentTime = ((currentNaat.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentNaat.pause()
        console.log("Previous clicked")
        let index = naats.indexOf(currentNaat.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playNaat(naats[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentNaat.pause()
        console.log("Next clicked")

        let index = naats.indexOf(currentNaat.src.split("/").slice(-1)[0])
        if ((index + 1) < naats.length) {
            playNaat(naats[index + 1])
        }
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentNaat.volume = parseInt(e.target.value) / 100
        if (currentNaat.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentNaat.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentNaat.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })





}

main() 