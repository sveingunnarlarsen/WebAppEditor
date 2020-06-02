const presetEnv = require.resolve("@babel/preset-env");
const presetReact = require.resolve("@babel/preset-react");
const classPropPlugin = require.resolve("@babel/plugin-proposal-class-properties");
const tsPreset = require.resolve("@babel/preset-typescript");
const porpDecorators = require.resolve("@babel/plugin-proposal-decorators");
const webpack = require("webpack");
const htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = settings => ({
	mode: "production",
	entry: {
		"editor.worker": 'monaco-editor/esm/vs/editor/editor.worker.js',
    	"json.worker": 'monaco-editor/esm/vs/language/json/json.worker',
    	"css.worker": 'monaco-editor/esm/vs/language/css/css.worker',
    	"html.worker": 'monaco-editor/esm/vs/language/html/html.worker',
    	"ts.worker": 'monaco-editor/esm/vs/language/typescript/ts.worker',
  	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: "/",
		publicPath: `/webapp/${settings.appName}/`
  	},
	resolve: {
		symlinks: false,
		extensions: [".ts", ".tsx", ".js", ".jsx", ".d.ts"]
	},
	module: {
		rules: [
			{
				test: /\.(js|ts|jsx|tsx|d.ts)$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
					options: {
						presets: [presetEnv, tsPreset, presetReact],
						plugins: [[porpDecorators, { legacy: true }], [classPropPlugin, { loose: true }]]
					}
				}
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			},
			{
				test: /\.(png|jpe?g|gif|svg|ttf)$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name(fileName) {
								if(fileName.includes("codicon.ttf")) {
									return "codicon.ttf";
								}
								return `.${fileName}`;
							}
						}
					}
				]
			}
		]
	},
	plugins: [		
		new webpack.DefinePlugin({
			ROOTPATH: JSON.stringify(`/webapp/${settings.appName}`)
		}),
		new htmlWebpackPlugin({
			templateContent: settings.htmlTemplate
		})
	]
});