const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const heading = $('.header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');

const player = $('.player');
const playlistBtn = $('.playlist');
const playBtn = $('.btn-toggle-play');
const range = $('.progress');

const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom:false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {} ,
    songs: [
        {
            name: "32 Bars",
            singer: "The Night",
            path: "./assets/music/32_Bars_The_Night.mp3",
            image: "./assets/img/theNight_img.jpg"
        },
        {
            name: "Sống cho hết thời thanh xuân",
            singer: "Bạn có tài mà",
            path: "./assets/music/SCHTTX_BCTM.mp3",
            image: "./assets/img/schttx_img.jpg"
        },
        {
            name: "Thói quen",
            singer: "Butcher",
            path: "./assets/music/Thoi_Quen_Butcher.mp3",
            image: "./assets/img/thóiQuen_img.jpg"
        },
        {
            name: "No Internet",
            singer: "7UPPERCUTS",
            path: "./assets/music/No_Internet.mp3",
            image: "./assets/img/noInternet_img.jpg"
        },
        {
            name: "Cried",
            singer: "Vsoul",
            path: "./assets/music/Cried_Vsoul.mp3",
            image: "./assets/img/cried_img.jpg"
        },
        {
            name: "GAOS",
            singer: "Power Rangers",
            path: "./assets/music/Gaos.mp3",
            image: "./assets/img/Gao_img.jpg"
        }
    ],
    settings: function(key, value){
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function(){
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active':''}" data-index="${index}">
                <div class="thumb"
                style="background-image: url(${song.image}) ;">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`
        })
        playlistBtn.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this,"currentSong", {
            get: function() {
                return this.songs[this.currentIndex]
            }
        });
    },
    handleEvents: function() {
        // Thu/Phóng CD
        const cdWidth = cd.offsetWidth;
        // CD Rotate
        const cdRotate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            
            duration: 10000,
            iterations: Infinity
        });
        cdRotate.pause();
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px': 0;
            cd.style.opacity = newCdWidth/cdWidth;
        },
        // Play/Pause
        playBtn.onclick = function() {
            if (app.isPlaying){
                audio.pause()
            } else {
                audio.play()
            }
        },
        // Song Played
        audio.onplay = function() {
            app.isPlaying = true;
            player.classList.add('playing');
            cdRotate.play();
        },
        // Song Paused
        audio.onpause = function() {
            app.isPlaying = false;
            player.classList.remove('playing');
            cdRotate.pause();
        },
        // Song Progress
        audio.ontimeupdate = function() {
            if (audio.duration){
                const progress = Math.floor(audio.currentTime / audio.duration * 100);
                range.value = progress;
            }
        },
        // Song Seek
        range.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        // Click Next Song
        nextBtn.onclick = function() {
            if (app.isRandom){
                app.playRandom()
            } else {
                app.nextSong();
            }
            app.render();
            app.scrollToActiveSong();
            audio.play();
        }
        // Click Prev Song
        prevBtn.onclick = function() {
            if (app.isRandom) {
                app.playRandom()
            } else {
                app.prevSong();
            }
            app.render();
            app.scrollToActiveSong();
            audio.play();
        }
        // Click Random Song
        randomBtn.onclick = function(e) {
            app.isRandom = ! app.isRandom;
            app.settings('isRandom', app.isRandom);
            randomBtn.classList.toggle('active', app.isRandom);
        }
        // Click Repeat Song
        repeatBtn.onclick = function(e) {
            app.isRepeat = ! app.isRepeat;
            app.settings('isRepeat', app.isRepeat);
            repeatBtn.classList.toggle('active', app.isRepeat);

        }
        // Audio on Ended
        audio.onended = function() {
            if (app.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        // Click To Song
        playlistBtn.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');

            if (songNode || e.target.closest('.option')) {
                if (songNode){
                    app.currentIndex = Number(songNode.getAttribute('data-index'));
                    app.render();
                    app.loadCurrentSong();
                    audio.play();
                }
            } else {

            }
        }
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        
        randomBtn.classList.toggle('active', app.isRandom);
        repeatBtn.classList.toggle('active', app.isRepeat);
    },
    // Next Song
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    // Random Song
    playRandom: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        },100)
    },
    star: function() {
        // Load Config
        this.loadConfig();
        // Định nghĩa thuộc tính
        this.defineProperties();
        // Xử lý sự kiện
        this.handleEvents();
        // LoadCurrentSong đầu tiên
        this.loadCurrentSong();
        // Load trang
        this.render();
    }

}

app.star();