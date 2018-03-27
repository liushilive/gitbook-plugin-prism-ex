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


### `theme`
Override the default syntax highlighting styles.

The CSS file path may be relative to the `node_modules` folder or to the book's source folder (if you want to provide a custom style that is bundled with the book's files instead of being provided by an installable module).

```json
"pluginsConfig": {
  "prism": {
    "theme": "prismjs/themes/prism-solarizedlight.css"
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

### `cssClasses`
Appends a space-separated list of CSS classes to each fenced code block (those whose PRE element has a CODE element as a direct child).

This is meant to be used with some plugins that require a specific CSS class to be applied to the PRE element, in order for the plugin to be activated on that block.

```json
"pluginsConfig": {
  "prism": {
    "cssClasses": "line-numbers"
  }
}
```

## Prism Plugins

You may specify a list of Prism plugins on the `pluginsConfig.prism.plugin` configuration property on `book.json`.

That property should be an array where each element may be either:

1. a string with the plugin name (ex: "line-numbers");
2. an array of CSS and/or JS files; each file path may be relative to `node_modules` or to the book's source folder.

#### The simplest case

In this basic example, we're loading the `line-numbers` Prism plugin.

###### booj.json

```json
{
  "plugins": ["-highlight", "prism-ext"],

  "pluginsConfig": {
    "prism": {
      "plugins": ["line-numbers"],
      "cssClasses": "line-numbers"
    }
  }
}
```

> Note: the `cssClasses` value is required by this specific Prism plugin.

#### A more complex case

In this example, we're loading:

1. the `line-numbers` and `show-invisibles` Prism plugins,
2. a custom syntax theme from the `prism-ASH` GitBook plugin,
3. a custom Prism plugin embedded on the book itself, on the `src` folder, comprised of a CSS and a JS file.

###### booj.json

```json
{
  "plugins": ["-highlight", "prism-ext", "prism-ASH"],

    "pluginsConfig": {
    "prism": {
      "theme": "syntax-highlighting/assets/css/prism/prism-tomorrow-night-bright.css",
      "plugins": ["line-numbers", "show-invisibles", ["src/my-plugin.css", "src/my-plugin.js"]],
      "cssClasses": "line-numbers my-example-class"
    }
  }
}
``` 

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
