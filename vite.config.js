// eslint-disable-next-line import/no-extraneous-dependencies
import vitePugPlugin from "vite-plugin-pug-transformer";
// import crossword from "dev/crosswords/ftimes_17095.json";

// const locals = {
//   title: crossword.info.title,
//   source: crossword.info.source,
//   setterTitle: crossword.info.setter.title,
// };

const locals = {
  title: "Financial Times 17,095",
  source:
    "https://www.fifteensquared.net/2022/05/16/financial-times-17095-by-alberich/",
  setterTitle: "Alberich",
};

export default {
  plugins: [vitePugPlugin({ pugLocals: locals })],
};
