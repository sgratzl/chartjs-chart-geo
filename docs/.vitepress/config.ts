import { defineConfig } from 'vitepress';
import { name, description, repository, license, author } from '../../package.json';
import typedocSidebar from '../api/typedoc-sidebar.json';

const cleanName = name.replace('@sgratzl/', '');

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: cleanName,
  description,
  base: `/${cleanName}/`,
  useWebFonts: false,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Examples', link: '/examples/' },
      { text: 'API', link: '/api/' },
      { text: 'Related Plugins', link: '/related' },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Basic', link: '/examples/' },
          { text: 'Choropleth US Map', link: '/examples/choropleth' },
          { text: 'Bubble Map', link: '/examples/bubbleMap' },
          { text: 'Custom Color Scale', link: '/examples/custom' },
          { text: 'Legend Customization', link: '/examples/legend' },
          { text: 'Tooltip Center', link: '/examples/center' },
          { text: 'Projection Offset', link: '/examples/offset' },
          { text: 'Equal Earth Projection', link: '/examples/projection' },
          { text: 'World Atlas', link: '/examples/earth' },
          { text: 'Bubble Map Area Mode', link: '/examples/area' },
        ],
      },
      {
        text: 'API',
        collapsed: true,
        items: typedocSidebar,
      },
    ],

    socialLinks: [{ icon: 'github', link: repository.url.replace('.git', '') }],

    footer: {
      message: `Released under the <a href="${repository.url.replace(
        '.git',
        ''
      )}/tree/main/LICENSE">${license} license</a>.`,
      copyright: `Copyright © 2019-present <a href="${author.url}">${author.name}</a>`,
    },

    editLink: {
      pattern: `${repository.url.replace('.git', '')}/edit/main/docs/:path`,
    },

    search: {
      provider: 'local',
    },
  },
});
