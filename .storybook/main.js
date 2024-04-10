const path = require("path");

module.exports = {
    stories: [
        "../stories/**/*.stories.mdx",
        "../stories/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
    ],
    framework: "@storybook/react",
    babel: async (options) => {
        return {
            ...options,
            plugins: options.plugins.filter(
                (x) =>
                    !(
                        typeof x === "string" &&
                        x.includes("plugin-transform-classes")
                    )
            ),
        };
    },
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto",
        });

        config.resolve.alias = {
            ...config.resolve.alias,
            "@": path.resolve(__dirname, "../lib"),
        };

        config.module.rules.push({
            test: /\.scss$/,
            use: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        modules: { auto: true },
                    },
                },
                "sass-loader",
            ],
            include: path.resolve(__dirname, "../"),
        });

        return config;
    },
    staticDirs: [
        { from: "../lib/__test__/test_files/正常フロー", to: "files" },
    ],
};
