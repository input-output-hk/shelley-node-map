module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': `<rootDir>/jest/preprocess.js`
  },
  moduleNameMapper: {
    '.+\\.(css|styl|less|sass|scss)$': `identity-obj-proxy`,
    '.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': `<rootDir>/jest/__mocks__/file-mock.js`
  },
  testPathIgnorePatterns: [`node_modules`, `.cache`],
  transformIgnorePatterns: [`node_modules/(?!(gatsby)/)`],
  globals: {
    __PATH_PREFIX__: ``
  },
  testURL: 'https://www.something.com/',
  setupFilesAfterEnv: ['<rootDir>/jest/setup.js'],
  snapshotSerializers: ['enzyme-to-json/serializer']
}
