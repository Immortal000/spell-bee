import axios from "axios";

export default async function categorize() {
  let hard_words = [];
  let easy_words = [];
  const response = await axios.get("https://spell-bee-backend.vercel.app/get/words");
  const data = await response.data;

  for (let word in data) {
    if (data[word] > 8) {
      easy_words.push(word);
    } else {
      hard_words.push(word);
    }
  }

  return { hard_words, easy_words };
}
