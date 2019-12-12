const presetEnv = require.resolve("@babel/preset-env");
const presetReact = require.resolve("@babel/preset-react");
const classPropPlugin = require.resolve("@babel/plugin-proposal-class-properties");
const tsPreset = require.resolve("@babel/preset-typescript");
const porpDecorators = require.resolve("@babel/plugin-proposal-decorators");

module.exports = {
	mode: "development",
	devtool: "eval-source-map",
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx"]
	},
	module: {
		rules: [
			{
				test: /\.(js|ts|jsx|tsx)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [presetEnv, tsPreset, presetReact],
						plugins: [[porpDecorators, {legacy: true}], [classPropPlugin, {loose: true}]]
					}
				}
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.(png|jpe?g|svg)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name(fileName) {
								fileName = `preview/${fileName.slice(fileName.indexOf("/", 1) + 1)}`;
								return fileName;
							},
							emitFile: false
						}
					}
				]
			}
		]
	}
};
