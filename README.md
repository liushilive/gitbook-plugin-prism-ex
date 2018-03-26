GitBook plugin for [Prism](http://prismjs.com/) with support for Prism plugins
==============

[![NPM](http://img.shields.io/npm/v/gitbook-plugin-prism-ext.svg?style=flat-square&label=npm)](https://www.npmjs.com/package/gitbook-plugin-prism-ext)

This plugin hilights the syntax of code blocks using the Prism highlighter.

Rendering is performed at build time, NOT at runtime on the browser. This allows the plugin to also run when generating PDF books.

Prism plugins are also supported but, as rendering is done at build time, plugins that generate interactive elements will not work properly; they will render (even for PDFs), but no interactivity is supported.

> **Technical note:** supporting Prism plugins on GitBook is not trivial, as they were designed for operation on the browser only, so a DOM representation of the document must be provided to them. This plugin provides such DOM trough an emulation that runs on NodeJS at build time, so that plugins operate as expected.  

##### Before
<img src='http://i.imgur.com/cbk6O52.png'>

##### After
<img src='http://i.imgur.com/S1YMlee.png'>

## Usage

Add the plugin to your `book.json`, and disable default GitBook code highlighting:

```json
{
  "plugins": ["prism-ext", "-highlight"]
}
```

## Options


### `css`
Override default styles.  All css files must reside in the same folder.

```json
"pluginsConfig": {
  "prism": {
    "css": [
      "prismjs/themes/prism-solarizedlight.css"
    ]
  }
}
```

### `lang`
Support non-standard syntax prefixes by aliasing existing prefixes.

```json
"pluginsConfig": {
  "prism": {
    "lang": {
      "flow": "typescript"
    }
  }
}
```

### `ignore`
Due to other plugins using code block notion to denote other functionality, you can ignore certain langs

```json
"pluginsConfig": {
  "prism": {
    "ignore": [
      "mermaid",
      "eval-js"
    ]
  }
}
```

## Prism Plugins

> **Note:** currently, you must also use the `custom-js-css` plugin to load the plugin's scripts and stylesheets. Soon, this plugin will support that feature natively.

#### book.json example

In this example, we're loading the `line-numbers` plugin and a custom theme from the `prism-ASH` plugin.

```json
{
  "plugins": [ "-highlight", "prism-ext", "prism-ASH", "custom-js-css" ],

    "pluginsConfig": {
    "prism": {
      "css": [
        "syntax-highlighting/assets/css/prism/prism-tomorrow-night-bright.css"
      ],
      "plugins": [
        "prismjs/plugins/line-numbers/prism-line-numbers.js"
      ],
      "cssClasses": "line-numbers",
      "langCaptions": true
    },
    "custom-js-css": {
      "js": [],
      "css": [
        "node_modules/prismjs/plugins/line-numbers/prism-line-numbers.css"
      ]
    }
  }
}
``` 

##### Important rules

1. `"custom-js-css"` must come **after** both the `"prism-ext"` and the theme plugin, otherwise CSS styles from the
theme will override styles of the Prism plugins.
2. Put the URL of each plugin's stylesheet on the `custom-js-css.css` array.
3. Put the URL of each plugin's javascript on the `prism.plugins` array.
4. Put the  URL of the Prism theme's stylesheet on the `prism.css` array (only one stylesheet, please).
5. Set `prism.cssClasses` to a space delimited list of class names that should be appended to the class of each code block's `pre` element.

> Some plugins require a specific class on that element to enable its functionality. You must specify that class on `prism.cssClasses`, as the Prism plugin is currently unable to do it automatically.<br>
> For instance, on the example above, the`line-numbers` plugin requires the `line-numbers` class.

#### The `langCaptions` pseudo-plugin

The Prism plugin provides an additional feature that displays the language name of each code block on its upper right
corner.

Set `pluginsConfig.langCaptions` to `true` on `book.json` to enable it.

Add the `dark` CSS class to `prism.cssClasses` if you're using a dark theme.

## Prism Themes

[https://github.com/PrismJS/prism](https://github.com/PrismJS/)

#### Okaidia <small>`prismjs/themes/prism-okaidia.css`</small>
![Okaidia](http://i.imgur.com/uhe0yQY.png)

#### Solarized Light <small>`prismjs/themes/prism-solarizedlight.css`</small>
![Solarized Light](http://i.imgur.com/71sT5XB.png)

#### Tomorrow <small>`prismjs/themes/prism-tomorrow.css`</small>
![Tomorrow](http://i.imgur.com/Li3AHXU.png)

#### Dark <small>`prismjs/themes/prism-dark.css`</small>
![Dark](http://i.imgur.com/vA5P6fy.png)

#### Coy <small>`prismjs/themes/prism-coy.css`</small>
![Coy](http://i.imgur.com/kSJP9tq.png)

## Atelierbram Themes

[https://github.com/atelierbram/syntax-highlighting](https://github.com/atelierbram/syntax-highlighting)

#### Base16 Ocean Dark <small>`syntax-highlighting/assets/css/prism/prism-base16-ocean.dark.css`</small>
![Base16 Ocean Dark](http://i.imgur.com/REJCdrA.png)

#### Google Light <small>`syntax-highlighting/assets/css/prism/prism-base16-google.light.css`</small>
![Google Light](http://i.imgur.com/TyBYmSu.png)

#### Xonokai <small>`syntax-highlighting/assets/css/prism/prism-xonokai.css`</small>
![Google Light](http://i.imgur.com/fPjEEv8.png)

## Credits

Based on [gaearon/gitbook-plugin-prism](https://github.com/gaearon/gitbook-plugin-prism), which was based on [google_code_prettify](https://github.com/spricity/google_code_prettify).

## License

Apache 2
