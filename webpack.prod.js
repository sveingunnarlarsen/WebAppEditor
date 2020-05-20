const presetEnv = require.resolve("@babel/preset-env");
const presetReact = require.resolve("@babel/preset-react");
const classPropPlugin = require.resolve("@babel/plugin-proposal-class-properties");
const tsPreset = require.resolve("@babel/preset-typescript");
const porpDecorators = require.resolve("@babel/plugin-proposal-decorators");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const webpack = require("webpack");

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
		path: "/build",
		publicPath: `/webapp/${settings.appName}/build/`
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
								console.log("FIleName: " + fileName);
								if(fileName.includes("codicon.ttf")) {
									return "codicon.ttf";
								}
								return `.${fileName}`;
							},
							emitFile: true
						}
					}
				]
			}
		]
	},
	plugins: [
		//new MonacoWebpackPlugin({ languages: ['abap', 'apex', 'azcli', 'bat', 'cameligo', 'clojure', 'coffee', 'cpp', 'csharp', 'csp', 'css', 'dockerfile', 'fsharp', 'go', 'graphql', 'handlebars', 'html', 'ini', 'java', 'javascript', 'json', 'kotlin', 'less', 'lua', 'markdown', 'mips', 'msdax', 'mysql', 'objective-c', 'pascal', 'pascaligo', 'perl', 'pgsql', 'php', 'postiats', 'powerquery', 'powershell', 'pug', 'python', 'r', 'razor', 'redis', 'redshift', 'restructuredtext', 'ruby', 'rust', 'sb', 'scheme', 'scss', 'shell', 'solidity', 'sophia', 'sql', 'st', 'swift', 'tcl', 'twig', '!typescript', 'vb', 'xml', 'yaml'] }),
		new webpack.DefinePlugin({
			ROOTPATH: JSON.stringify(`/webapp/${settings.appName}`)
		}),
	]
});
