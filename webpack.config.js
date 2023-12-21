const path = require("path");
const fs = require("fs");

module.exports = {
    devServer: {
        static: {
            directory: path.join(__dirname, "src"),
            staticOptions: {
                extensions: ["html"],
            },
        },
        historyApiFallback: {
            rewrites: [
                {
                    from: /\//,
                    to: context => customDirectoryIndex(context)
                },
            ],
        },

        compress: true,
        port: 80,
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: "development",
    target: "web",
};

function customDirectoryIndex(context)
{
    const parts = context.parsedUrl.path.split("/");
    const filePath = context.parsedUrl.path + parts[parts.length - 2] + ".html";

    if (fs.existsSync(path.join(__dirname, "src", filePath)))
    {
        return filePath;
    }
    return "404.html";
}