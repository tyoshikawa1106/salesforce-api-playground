import { createRequire } from "node:module";

const require = createRequire(`${process.cwd()}/package.json`);
const { configs } = require("@salesforce-ux/eslint-plugin-slds");

const config = [...configs["flat/recommended-css"]];

export default config;
