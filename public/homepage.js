import { html } from 'html-express-js';

export const view = (data, state) => html`
  <!DOCTYPE html>
  <html lang="en">
    <head>
      ${state.includes.head}
      <title>${data.title}</title>
    </head>

    <body>
      <h1>This is the homepage</h1>
    </body>
  </html>
`;
