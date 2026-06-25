var ejs = require('ejs');
var path = require('path');
var fs = require('fs');

// Check if running as SEA
let isSEA = false;
let getAsset = null;
try {
  const sea = require('node:sea');
  getAsset = sea.getAsset;
  isSEA = true;
} catch (err) {
  // Not running as SEA
}

/**
 * Load template content from SEA or file system
 * @param {string} templateName - Template filename (e.g., '_base.ejs', 'top')
 * @returns {string} - Template content
 */
function loadTemplate(templateName) {
  if (isSEA) {
    // Normalize template name for SEA asset key
    let assetKey = templateName;
    if (!assetKey.endsWith('.ejs')) {
      assetKey = assetKey + '.ejs';
    }
    assetKey = 'templates/' + assetKey.replace(/^_/, 'base').replace('.ejs', '');
    const assetData = getAsset(assetKey);
    // Convert ArrayBuffer to Buffer, then to string
    return Buffer.from(assetData).toString('utf-8');
  } else {
    // Load from external file
    const templatePath = path.join(__dirname, '../../resources/templates/', templateName);
    const fullPath = templatePath.endsWith('.ejs') ? templatePath : templatePath + '.ejs';
    return fs.readFileSync(fullPath, 'utf-8');
  }
}

/**
 * Render EJS template with SEA support
 * @param {string} templateName - Template filename (e.g., '_base.ejs')
 * @param {object} data - Template data
 * @param {function} callback - Callback function (err, output)
 */
function renderTemplate(templateName, data, callback) {
  try {
    const templateContent = loadTemplate(templateName);

    // Custom include function for EJS
    const includeFunc = function(includePath, includeData) {
      const includeContent = loadTemplate(includePath);
      const compiled = ejs.compile(includeContent, {
        filename: includePath,
        client: false
      });
      return compiled(Object.assign({}, data, includeData || {}));
    };

    // Compile and render template with custom include function
    const compiled = ejs.compile(templateContent, {
      filename: templateName,
      client: false
    });

    const output = compiled(Object.assign({}, data, { include: includeFunc }));
    callback(null, output);
  } catch (err) {
    callback(err);
  }
}

module.exports = { renderTemplate };
