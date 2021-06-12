<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />
  <h1 v-if="loading">Loading in words...</h1>
  <div v-else class="spell-bee">
    <h1>Spell Bee</h1>
    <div class="spell">
      <div class="options">
        <select @change="changeMode" v-model="easy">
          <option :value="true" selected>Easy</option>
          <option :value="false">Hard</option>
        </select>

        <button @click="saveWordBank" class="btn">Save Word Bank</button>
      </div>

      <div class="card-colder">
        <div class="arrow">
          <i class="fas fa-arrow-circle-left fa-2x" @click="previous"></i>
        </div>
        <div class="spell-card">
          <div>
            <!-- Input Holder -->
            <div class="word-input">
              <input type="text" placeholder="your guess" v-model="guess" />
              <i class="fas fa-check" @click="check"></i>
            </div>
            <!-- Word Holder -->
            <div class="word-holder">
              <div class="reveal reveal-word" @click="wordHidden = !wordHidden">
                <h2>Reveal Word</h2>
                <i class="fas fa-caret-down" v-if="wordHidden"></i>
                <i class="fas fa-caret-up" v-else></i>
              </div>
              <div class="word revealed" v-if="!wordHidden">
                <h3>{{ currentWord.toUpperCase() }}</h3>
                <p>{{ phonetic }}</p>
              </div>
            </div>
            <!-- Meaning Holder -->
            <div class="meaning-holder">
              <div class="reveal reveal-meaning" @click="meaningHidden = !meaningHidden">
                <h2>Show Meaning</h2>
                <i class="fas fa-caret-down" v-if="meaningHidden"></i>
                <i class="fas fa-caret-up" v-else></i>
              </div>
              <div class="word-meaning revealed" v-if="!meaningHidden">
                <h3>{{ meaning.replaceAll(currentWord, "_______") }}</h3>
                <i class="fas fa-volume-up speaker" @click="speakMeaning"></i>
              </div>
            </div>
            <!-- Word Origin Holder -->
            <div class="origin-holder">
              <div class="reveal reveal-origin" @click="originHidden = !originHidden">
                <h2>Show Origin</h2>
                <i class="fas fa-caret-down" v-if="originHidden"></i>
                <i class="fas fa-caret-up" v-else></i>
              </div>
              <div class="word-origin revealed" v-if="!originHidden">
                <h3>{{ origin }}</h3>
                <i class="fas fa-volume-up speaker" @click="speakOrigin" v-if="!originSpeaking"></i>
                <i class="fas fa-pause" v-else @click="pauseSpeak"></i>
              </div>
            </div>
            <!-- Audio Player -->
            <div class="audio-play">
              <audio controls autoplay id="audio" ref="audioSrc">
                <source :src="audioUrl" type="audio/ogg" id="audio-source" />
              </audio>
            </div>
            <!-- Word Bank -->
            <div class="wordbank-controls">
              <button @click="addWordBank" class="btn">Add this word to my word bank</button>
            </div>
          </div>
        </div>
        <div class="arrow">
          <i class="fas fa-arrow-circle-right fa-2x" @click="next"></i>
        </div>
      </div>
    </div>
    <div class="bank">
      <h1>Your Word Bank</h1>
      <table>
        <thead>
          <tr>
            <th>Word</th>
            <th>Meaning</th>
            <th>Origin</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="info in wordBank" :key="info.word">
            <td>
              <a :href="info.link" target="_">{{ info.word }}</a>
            </td>
            <td>{{ info.meaning }}</td>
            <td>{{ info.origin }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import getMeaning from "./functions/getMeaning";
import getOrigin from "./functions/getOrigin";
import categorize from "./functions/categorize";
import arrayShuffle from "array-shuffle";
import { saveAs } from "file-saver";

export default defineComponent({
  name: "App",
  data() {
    return {
      guess: "",
      hidden: false,
      currentWord: "",
      loading: false,
      wordHidden: true,
      meaningHidden: true,
      originHidden: true,
      hard_words: [],
      easy_words: [],
      words: [],
      index: 0,
      audioUrl: "",
      meaning: "",
      phonetic: "",
      origin: "",
      originSpeaking: false,
      synth: window.speechSynthesis,
      easy: true,
      wordBank: [],
    };
  },
  async mounted() {
    this.loading = true;
    const { hard_words, easy_words } = await categorize();
    this.hard_words = hard_words;
    this.easy_words = easy_words;
    this.words = arrayShuffle(this.easy_words);
    this.currentWord = this.words[this.index];
    await this.getInfo();
    this.loading = false;
  },
  methods: {
    async getInfo() {
      this.wordHidden = true;
      this.meaningHidden = true;
      this.originHidden = true;
      const wordData = await getMeaning(this.currentWord);
      this.meaning = wordData.meaning;
      this.audioUrl = wordData["audio"];
      this.phonetic = wordData["pheonetics"];
      this.currentWord = wordData.word == "" ? this.currentWord : wordData.word;
      if (this.audioUrl == "") {
        this.speak(this.currentWord);
      }
      if (this.$refs.audioSrc) {
        this.$refs.audioSrc.load();
        this.$refs.audioSrc.play();
      }
      const origin = await getOrigin(this.currentWord);
      this.origin = origin;
    },
    async next() {
      this.index = this.index != this.words.length - 1 ? this.index + 1 : 0;
      this.currentWord = this.words[this.index];
      await this.getInfo();
    },

    async previous() {
      this.index = this.index != 0 ? this.index - 1 : this.words.length - 1;
      this.currentWord = this.words[this.index];
      await this.getInfo();
    },

    speak(text) {
      let utterThis = new SpeechSynthesisUtterance(text);
      this.synth.speak(utterThis);
    },

    speakMeaning() {
      this.speak(this.meaning);
    },

    speakOrigin() {
      this.originSpeaking = true;
      this.speak(this.origin);
    },

    pauseSpeak() {
      window.speechSynthesis.pause();
    },

    resumeSpeak() {
      window.speechSynthesis.resume();
    },

    async check() {
      if (this.guess == this.currentWord) {
        this.guess = "";
        await this.next();
      }
    },

    async changeMode() {
      console.log(this.easy);
      if (this.easy) {
        this.words = this.easy_words;
        this.words = arrayShuffle(this.words);
        this.index = 0;
        this.currentWord = this.words[this.index];
        await this.getInfo();
      } else {
        this.words = this.hard_words;
        this.words = arrayShuffle(this.words);
        this.index = 0;
        this.currentWord = this.words[this.index];
        await this.getInfo();
      }
    },

    addWordBank() {
      const alreadyAv = sessionStorage.getItem("words");
      let parsed;
      let newItem = {
        word: this.currentWord,
        meaning: this.meaning,
        origin: this.origin,
        link: `https://www.oxfordlearnersdictionaries.com/us/definition/english/${this.currentWord}`,
      };
      if (alreadyAv) {
        parsed = JSON.parse(alreadyAv);
        parsed.push(newItem);
        sessionStorage.setItem("words", JSON.stringify(parsed));
      } else {
        let newArr = [newItem];
        sessionStorage.setItem("words", JSON.stringify(newArr));
      }
      this.wordBank = parsed;
    },

    saveWordBank() {
      let finalText = "";
      const wordBank = JSON.parse(sessionStorage.getItem("words"));
      for (let info of wordBank) {
        let newInfo = `Word: ${info.word} \nMeaning: ${info.meaning} \nOrigin: ${info.origin}\nAdditional Information: ${info.link}\n-------------------------------- \n`;
        finalText = finalText + newInfo;
      }

      let blob = new Blob([finalText], { type: "text/plain;charset=utf-8" });
      saveAs(blob, "wordbank.txt");
    },
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.spell-bee {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 60%;
  height: 90%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.spell-card {
  width: 300px;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
}

.word-input {
  width: 250px;
  display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;
}

.word-input i {
  font-size: 20px;
  cursor: pointer;
}

.spell-card input[type="text"] {
  border-radius: 5px;
  border: 1px solid black;
  outline: none;
  padding: 5px;
  width: 85%;
}

.card-colder {
  display: flex;
  justify-content: space-evenly;
  width: 350px;
  align-content: center;
  align-items: center;
}

.arrow {
  cursor: pointer;
  margin: 5px;
}

.audio-play {
  width: 250px;
}

.audio-play audio {
  width: 100%;
}

.reveal {
  border: 1px solid black;
  padding: 10px;
  height: 20px;
  align-content: center;
  align-items: center;
  margin: 5px 0;

  display: flex;
  justify-content: space-between;

  cursor: pointer;
}

.revealed {
  border: 1px solid black;
  margin-top: -5px;
  margin-bottom: 5px;
}

.speaker {
  cursor: pointer;
}

.btn {
  border: 1px solid black;
  padding: 10px;
  outline: none;
  background: transparent;
}

select {
  padding: 10px;
}

.bank {
  margin: auto;
}

.spell {
  margin: auto;
}

.bank table {
  /* border: 1px solid black; */
  border-collapse: collapse;
}

.bank table th,
td {
  padding: 10px;
  border: 1px solid black;
}

button {
  cursor: pointer;
}
</style>
