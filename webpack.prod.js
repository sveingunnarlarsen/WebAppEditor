const presetEnv = require.resolve("@babel/preset-env");
const presetReact = require.resolve("@babel/preset-react");
const classPropPlugin = require.resolve("@babel/plugin-proposal-class-properties");
const tsPreset = require.resolve("@babel/preset-typescript");
const porpDecorators = require.resolve("@babel/plugin-proposal-decorators");

module.exports = {
	mode: "production",
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".jsx", ".d.ts"]
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
				test: /\.(png|jpe?g|gif|svg)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name(fileName) {
								return `.${fileName}`;
							},
							emitFile: false
						}
					}
				]
			}
		]
	}
};
