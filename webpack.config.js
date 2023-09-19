import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
const { loader } = MiniCssExtractPlugin;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/index.mjs",

    devServer: {
      static: {
        directory: join(__dirname, "sample"),
      },
      compress: true,
    },

    mode: "development",

    module: {
      rules: [
        {
          test: /\.less$/,
          use: [
            isProduction ? loader : "style-loader",
            "css-loader",
            "less-loader",
          ],
        },
      ],
    },

    // Add an instance of the MiniCssExtractPlugin to the plugins list
    // But remember - only for production!
    plugins: isProduction
      ? [new MiniCssExtractPlugin({ filename: "crosswords.css" })]
      : [],

    output: {
      path: resolve(__dirname, "dist"),
      filename: "crosswords.js",
    },
  };
};
