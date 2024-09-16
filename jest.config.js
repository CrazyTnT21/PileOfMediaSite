/**
 * @type {import("jest").Config}
 */
const config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+.tsx?$": ["ts-jest", {
      useEsm: true
    }],
  },
  moduleNameMapper: {
    '(.+)\\.js': '$1'
  },

  extensionsToTreatAsEsm: ['.ts']
}
export default config;
