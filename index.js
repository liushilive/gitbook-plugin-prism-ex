var Prism = require('prismjs');
var languages = require('prismjs').languages;
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

var DEFAULT_LANGUAGE = 'markup';
var MAP_LANGUAGES = {
  'py': 'python',
  'js': 'javascript',
  'rb': 'ruby',
  'cs': 'csharp',
  'sh': 'bash',
  'html': 'markup'
};

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
  blocks: {
    code: function (block) {

      var highlighted = '';
      var userDefined = getConfig(this, 'pluginsConfig.prism.lang', {});
      var userIgnored = getConfig(this, 'pluginsConfig.prism.ignore', []);

      // Normalize language id
      var lang = block.kwargs.language || DEFAULT_LANGUAGE;
      lang = userDefined[lang] || MAP_LANGUAGES[lang] || lang;

      // Check to see if the lang is ignored
      if (userIgnored.indexOf(lang) > -1) {
        return block.body;
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
        var dom = JSDOM.fragment(`<pre class="line-numbers"><code class="language-${lang}"></code></pre>`);
        var code = dom.querySelector('code');
        code.textContent = block.body;
        Prism.highlightElement(code);
        highlighted = code.innerHTML;
      } catch (e) {
        console.warn('Failed to highlight:');
        console.warn(e);
        highlighted = block.body;
      }

      return highlighted;
    }
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
      global.document = (new JSDOM().window.document);
      var jsFiles = getConfig(book, 'pluginsConfig.prism.plugins', []);
      jsFiles.forEach(function (jsFile) {
        console.log('Loading Prism plugin', jsFile);
        require(jsFile);
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

      var fragment = JSDOM.fragment(page.content);
      var $ = fragment.querySelectorAll.bind(fragment);
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
        addLangCaption(fragment);
      }
      $('pre').forEach(function (node) {
        changed = true;
        var classes = node.className ? node.className.split(' ') : [];
        classes.push('language-');
        if (cssClasses) {
          classes.push(cssClasses);
        }
        node.className = classes.join(' ');
        if (langCaptions) {
          var e = node.querySelector('code');
          var match = e.getAttribute('class').match(/lang-(\w+)/);
          if (match && match[1]) {
            node.setAttribute('lang', match[1].toUpperCase());
          }
        }
      });

      if (changed) {
        page.content = toHTML(fragment);
      }

      return page;
    }
  }
};

function toHTML (fragment) {
  var out = [];
  for (var e of fragment.children) {
    out.push(e.outerHTML);
  }
  return out.join('');
}

function addLangCaption (node) {
  var style = document.createElement('style');
  style.textContent = `
.markdown-section pre[lang]::before {
    content: attr(lang);
    position: absolute;
    display: block;
    color: #BBB;
    right: 0;
    top: 0;
    padding: 5px 10px;
    font-weight: normal;
    font-size: 12px;
    border-bottom-left-radius: 7px;
    background: rgba(0,0,0,0.01);
}
.markdown-section pre[lang].dark::before {
    background: rgba(255,255,255,0.2);
}`;
  node.prepend(style);
}
