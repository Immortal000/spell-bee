import axios from "axios";

export default async function getMeaning(word) {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`);
    const data = await response?.data[0];

    return {
      pheonetics: data?.phonetics[0]?.text,
      audio: data?.phonetics[0]?.audio,
      meaning: data.meanings[0]?.definitions[0]?.definition,
      word: data?.word,
    };
  } catch (error) {
    return {
      error: error,
      pheonetics: "",
      audio: "",
      meaning: "Meaning of this word not found",
      word: "",
    };
  }
}
