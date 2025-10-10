import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    overflow: hidden;
  }

  body {
    margin: 0;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: var(--color-surface);
    color: var(--color-header);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  button, input {
    font: inherit;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  #root {
    height: 100%;
    overflow: hidden;
  }
`;
