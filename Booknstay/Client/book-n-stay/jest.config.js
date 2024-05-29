module.exports = {
    roots: ["<rootDir>/src"],
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.{js,jsx,mjs}", "!**/node_modules/**", "!src/interceptor.js","!src/App.js","!src/UserService.js","!src/HotelService.js","!src/AdminService.js","!**/GoogleSignIn/**", "!src/reportWebVitals.js"],
    coverageDirectory: "coverage",
    coverageReporters: ["html", "text", "text-summary", "cobertura", "lcov"],
    moduleFileExtensions: ["js", "json", "jsx", "module.css", "css"],
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["\\\\node_modules\\\\"],
    verbose: false,
    transformIgnorePatterns: ["node_modules/(?!axios)/"],
    moduleNameMapper: {
      "\\.(jpg|jpeg|png|gif)$": "identity-obj-proxy",
    },
    transform: {
      "^.+\\.js$": "babel-jest",
      '^.+\\.jsx?$': 'babel-jest',
      "^.+\\.jsx$": "babel-jest",
      ".+\\.(css|styl|less|sass|scss)$": "<rootDir>/node_modules/jest-css-modules-transform",
      
    },
    setupFilesAfterEnv: [ "react-dom/test-utils"]
  };