/* eslint-disable no-multi-str */
var Prism = require('prismjs');
var languages = require('prismjs').languages;
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
const jsdom = require('jsdom');
const JSDOM = jsdom.jsdom;

const DEFAULT_LANGUAGE = 'markup';
const MAP_LANGUAGES = {
  'py': 'python',
  'js': 'javascript',
  'rb': 'ruby',
  'cs': 'csharp',
  'sh': 'bash',
  'html': 'markup'
};
const PLUGIN_ASSETS = {
  'autolinker': ['prism-autolinker.css', 'prism-autolinker.min.js'],
  'autoloader': ['prism-autoloader.min.js'],
  'command-line': ['prism-command-line.css', 'prism-command-line.min.js'],
  'copy-to-clipboard': ['prism-copy-to-clipboard.min.js'],
  'custom-class': ['prism-custom-class.min.js'],
  'data-uri-highlight': ['prism-data-uri-highlight.min.js'],
  'file-highlight': ['prism-file-highlight.min.js'],
  'highlight-keywords': ['prism-highlight-keywords.min.js'],
  'ie8': ['prism-ie8.css', 'prism-ie8.min.js'],
  'jsonp-highlight': ['prism-jsonp-highlight.min.js'],
  'keep-markup': ['prism-keep-markup.min.js'],
  'line-highlight': ['prism-line-highlight.css', 'prism-line-highlight.min.js'],
  'line-numbers': ['prism-line-numbers.css', 'prism-line-numbers.min.js'],
  'normalize-whitespace': ['prism-normalize-whitespace.min.js'],
  'previewer-angle': ['prism-previewer-angle.css', 'prism-previewer-angle.min.js'],
  'previewer-base': ['prism-previewer-base.css', 'prism-previewer-base.min.js'],
  'previewer-color': ['prism-previewer-color.css', 'prism-previewer-color.min.js'],
  'previewer-easing': ['prism-previewer-easing.css', 'prism-previewer-easing.min.js'],
  'previewer-gradient': ['prism-previewer-gradient.css', 'prism-previewer-gradient.min.js'],
  'previewer-time': ['prism-previewer-time.css', 'prism-previewer-time.min.js'],
  'remove-initial-line-feed': ['prism-remove-initial-line-feed.min.js'],
  'show-invisibles': ['prism-show-invisibles.css', 'prism-show-invisibles.min.js'],
  'show-language': ['prism-show-language.min.js'],
  'toolbar': ['prism-toolbar.css', 'prism-toolbar.min.js'],
  'unescaped-markup': ['prism-unescaped-markup.css', 'prism-unescaped-markup.min.js'],
  'wpd': ['prism-wpd.css', 'prism-wpd.min.js']
};
var blocks;

// Base languages syntaxes (as of prism@1.6.0), extended by other syntaxes.
// They need to be required before the others.
var PRELUDE = [
  'clike', 'javascript', 'markup', 'c', 'ruby', 'css',
  // The following depends on previous ones
  'java', 'php'
];
PRELUDE.map(requireSyntax);

/**
 * Load the syntax definition for a language id
 */
function requireSyntax(lang) {
  require('prismjs/components/prism-' + lang + '.js');
}

function getConfig(context, property, defaultValue) {
  var config = context.config ? /* 3.x */ context.config : /* 2.x */ context.book.config;
  return config.get(property, defaultValue);
}

function isEbook(book) {
  // 2.x
  if (book.options && book.options.generator) {
    return book.options.generator === 'ebook';
  }

  // 3.x
  return book.output.name === 'ebook';
}

function getAssets() {

  var cssFiles = getConfig(this, 'pluginsConfig.prism.css', []);
  var cssFolder = null;
  var cssNames = [];
  var cssName = null;

  if (cssFiles.length === 0) {
    cssFiles.push('prismjs/themes/prism.css');
  }

  cssFiles.forEach(function (cssFile) {
    var cssPath = require.resolve(cssFile);
    cssFolder = path.dirname(cssPath);
    cssName = path.basename(cssPath);
    cssNames.push(cssName);
  });

  return {
    assets: cssFolder,
    css: cssNames
  };
}

module.exports = {
  book: getAssets,

  ebook: function () {

    // Adding prism-ebook.css to the CSS collection forces Gitbook
    // reference to it in the html markup that is converted into a PDF.
    var assets = getAssets.call(this);
    assets.css.push('prism-ebook.css');
    return assets;
  },

  hooks: {

    // Manually copy prism-ebook.css into the temporary directory that Gitbook uses for inlining
    // styles from this plugin. The getAssets() (above) function can't be leveraged because
    // ebook-prism.css lives outside the folder referenced by this plugin's config.
    //
    // @Inspiration https://github.com/GitbookIO/plugin-styles-less/blob/master/index.js#L8
    init: function () {

      var book = this;

      // Load Prism plugins
      global.Prism = Prism;
      global.self = global;
      global.document = JSDOM();
      var plugins = getConfig(book, 'pluginsConfig.prism.plugins', []);
      plugins.forEach(function (plugin) {
        // Custom plugin
        var files;
        if (typeof plugin === 'string') {
          files = PLUGIN_ASSETS[plugin];
          if (files === undefined) {
            console.error('error: plugin "' + plugin + '" not found');
            return;
          }
        } else if (typeof plugin === 'object' && plugin.length) { // check if it's an array
          files = plugin;
          plugin = path.basename(files[0]);
        } else {
          console.error('error: invalid  "pluginsConfig.prism.plugins" setting');
          return;
        }

        console.log('info: loading Prism plugin', '"' + plugin + '"...');
        for (var i = 0; i < files.length; ++i) {
          /** @type {string} */
          var file = files[i];
          if (file.match(/.js$/i))
            require(file);
          else if (file.match(/.css$/i)) {

          }
          else {
            console.error('error: invalid  file type "pluginsConfig.prism.plugins" setting');
            return;
          }
        }

      });

      if (!isEbook(book)) {
        return;
      }

      var outputDirectory = path.join(book.output.root(), '/gitbook/gitbook-plugin-prism');
      var outputFile = path.resolve(outputDirectory, 'prism-ebook.css');
      var inputFile = path.resolve(__dirname, './prism-ebook.css');
      mkdirp.sync(outputDirectory);

      try {
        fs.writeFileSync(outputFile, fs.readFileSync(inputFile));
      } catch (e) {
        console.warn('Failed to write prism-ebook.css. See https://git.io/v1LHY for side effects.');
        console.warn(e);
      }

    },

    page: function (page) {
      blocks = {};
      var doc = JSDOM(page.content);
      var book = this.book;
      var $ = doc.querySelectorAll.bind(doc);
      var changed = false;

      // Prism css styles target the <code> and <pre> blocks using
      // a substring CSS selector:
      //
      //    code[class*="language-"], pre[class*="language-"]
      //
      // Adding "language-" to <pre> element should be sufficient to trigger
      // correct color theme.

      var cssClasses = getConfig(this, 'pluginsConfig.prism.cssClasses');
      var langCaptions = getConfig(this, 'pluginsConfig.prism.langCaptions');
      if (langCaptions) {
        changed = true;
        addLangCaptionStyles($('head')[0]);
      }
      $('pre').forEach(function (preElement, i) {
        var code = preElement.querySelector('code');
        if (!code) return;
        // From here on, only PRE > CODE blocks are processed.
        changed = true;
        if (cssClasses) preElement.className = preElement.className ? preElement.className + ' ' + cssClasses : cssClasses;

        var _class = code.getAttribute('class');
        if (_class) {
          var match = _class.match(/lang-(\w+)/);
          if (match && match[1]) preElement.setAttribute('lang', match[1]);
        }
        //
        highlight(code, book, 'CH' + i);
      });

      if (changed) {
        page.content = toHTML(doc);
      }

      return page;
    }
  },

  blocks: {
    /**
     * Processes `code` blocks. These match `<pre><code>` sections of the document.
     * If the block has an ID embedded on the start of its content, use that ID to fectch a previously highlighted HTML
     * block from the `blocks` dictionary.
     * @param {{body:string,kwargs:Object,args:Array,blocks:Array}} block
     * @returns {{body:string,kwargs:Object,args:Array,blocks:Array}}
     */
    code: function (block) {
      var m = block.body.match(/^#(CH\d+)#$/);
      if (m) block.body = blocks[m[1]];
      else block.body = escapeString(block.body);
      return block;
    }
  }

};

/**
 * Highlights a section of source code.
 *
 * Note: the DOM changes that are performed here will be later on discarded by GitBook, so we need to save them on
 * the `blocks` dictionary and re-apply them later when the template engine is processing `code` blocks.
 * @param {HTMLElement} codeElement
 * @param {Object} book
 * @param {string} id A code block ID used for saving this block and retrieving it later.
 * @returns {boolean} True if the block was highlighted.
 */
function highlight (codeElement, book, id) {

  var userDefined = getConfig(book, 'pluginsConfig.prism.lang', {});
  var userIgnored = getConfig(book, 'pluginsConfig.prism.ignore', []);
  var preElement = codeElement.parentElement;

  // Normalize language id
  var lang = preElement.getAttribute('lang') || DEFAULT_LANGUAGE;
  lang = userDefined[lang] || MAP_LANGUAGES[lang] || lang;

  // Check to see if the lang is ignored
  if (userIgnored.indexOf(lang) > -1) {
    return false;
  }

  // Try and find the language definition in components folder
  if (!languages[lang]) {
    try {
      requireSyntax(lang);
    } catch (e) {
      console.warn('Failed to load prism syntax: ' + lang);
      console.warn(e);
    }
  }

  if (!languages[lang]) lang = DEFAULT_LANGUAGE;

  // Check against html, prism "markup" works for this
  if (lang === 'html') {
    lang = 'markup';
  }

  try {
    Prism.highlightElement(codeElement);
  } catch (e) {
    console.warn('Failed to highlight:');
    console.warn(e);
    return false;
  }

  // Save the highlighted block for later use.
  blocks[id] = codeElement.innerHTML;
  // Replace the block by an ID reference.
  codeElement.textContent = '#' + id + '#';
  return true;
}

function toHTML (fragment) {
  var out = [];
  var ch = fragment.children;
  for (var i = 0, m = ch.length; i < m; ++i) {
    out.push(ch.item(i).outerHTML);
  }
  return out.join('');
}

// Escaping regexes
const AMP_REGEX = /&/g,
  NBSP_REGEX = /\u00a0/g,
  DOUBLE_QUOTE_REGEX = /"/g,
  LT_REGEX = /</g,
  GT_REGEX = />/g;

// Escape string
function escapeString(str, attrMode) {
  str = str
    .replace(AMP_REGEX, '&amp;')
    .replace(NBSP_REGEX, '&nbsp;');

  if (attrMode) str = str.replace(DOUBLE_QUOTE_REGEX, '&quot;');

  else {
    str = str
      .replace(LT_REGEX, '&lt;')
      .replace(GT_REGEX, '&gt;');
  }

  return str;
}

function addLangCaptionStyles (node) {
  var style = document.createElement('style');
  style.textContent = '\
.markdown-section pre[lang]::before {\
    content: attr(lang);\
    position: absolute;\
    display: block;\
    color: #BBB;\
    right: 0;\
    top: 0;\
    padding: 5px 10px;\
    font-weight: normal;\
    font-size: 12px;\
    border-bottom-left-radius: 7px;\
    background: rgba(0,0,0,0.01);\
    text-transform: uppercase\
}\
.markdown-section pre[lang].dark::before {\
    background: rgba(255,255,255,0.2);\
}';
  node.appendChild(style);
}
