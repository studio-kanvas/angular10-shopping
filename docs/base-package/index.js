const {Package} = require('dgeni');
const basePkg = require('dgeni-packages/base');
const jsDocsPkg = require('dgeni-packages/jsdoc');
const njPkg = require('dgeni-packages/nunjucks');
const gitPkg = require('dgeni-packages/git');

const {OUTPUT, APP, BASE, TEMPLATES, SITE, ASSETS} = require('../config');

module.exports = exports = new Package('cartBase', [basePkg, jsDocsPkg, njPkg, gitPkg])
  .processor({name: 'adding-modules', $runAfter: ['adding-extra-docs'], $runBefore: ['extra-docs-added']})
  .processor({name: 'modules-added', $runAfter: ['adding-modules'], $runBefore: ['extra-docs-added']})
  .processor({name: 'adding-routes', $runAfter: ['modules-added'], $runBefore: ['extra-docs-added']})
  .processor({name: 'routes-added', $runAfter: ['adding-routes'], $runBefore: ['extra-docs-added']})
  .processor(require('./processors/copySite'))
  .processor(require('./processors/addGitInfo'))
  .processor(require('./processors/navigationMap'))
  //.processor(require('./processors/removeExtraSpace'))
  .factory(require('./services/customDocs'))
  .factory(require('./services/copyFolder'))
  .factory(require('./services/staticAssets'))
  .config(function (readFilesProcessor, writeFilesProcessor) {
    readFilesProcessor.basePath = BASE;
    readFilesProcessor.sourceFiles = [];
    writeFilesProcessor.outputFolder = APP;
  })
  .config(function (templateFinder, templateEngine, computePathsProcessor) {
    templateFinder.templateFolders = TEMPLATES;
    templateFinder.templatePatterns = [
      '${doc.template}',
      '${doc.ngType}.md',
      '${doc.ngType}.ts',
      '${doc.docType}.md',
      '${doc.docType}.html',
      '${doc.docType}.ts',
      'common.ts'
    ];
    templateEngine.config.tags = {
      variableStart: '{$',
      variableEnd: '$}'
    };
    computePathsProcessor.pathTemplates = [
      {
        docTypes: ['function', 'var', 'const', 'let', 'enum', 'value-module'],
        outputPathTemplate: 'api/${docType}/${computedName}.md',
        pathTemplate: '${moduleDoc.path}/${computedName}.md'
      },
      {
        docTypes: ['ngModule', 'ngRoute'],
        getOutputPath: function (doc) {
          if (doc.location) {
            if (doc.docType === 'ngModule') {
              return `${doc.pkg}/${doc.location}/${doc.file}.ts`
            }
            return `${doc.pkg}/${doc.location}/routes.ts`;
          }
          if (doc.docType === 'ngModule') {
            return `${doc.pkg}/${doc.file}.ts`
          }
          return `${doc.pkg}/routes.ts`;
        },
        pathTemplate: '${ngType}.ts'
      },
      {
        docTypes: ['ngComponent'],
        getOutputPath: function (doc) {
          if (doc.location) {
            return `${doc.pkg}/${doc.location}/routes/${doc.computedName}.component.ts`
          }
          return `${doc.pkg}/routes/${doc.computedName}.component.ts`
        },
        pathTemplate: '${ngType}.ts'
      },
      {
        docTypes: ['toc'],
        outputPathTemplate: 'shared/services/toc.data.ts',
        pathTemplate: '${docType}.ts'
      },
      {
        docTypes: ['info-service'],
        outputPathTemplate: 'shared/services/info-service.ts',
        pathTemplate: '${docType}.ts'
      },
      {
        docTypes: ['ngTemplate'],
        getOutputPath: function (doc) {
          const {location, pkg} = doc.component;
          const folder = location ? '/' + location : '';
          return `${pkg}${folder}/routes/${doc.computedName}.component.html`
        },
        pathTemplate: '${docType}.html'
      },
      {
        docTypes: ['md-file'],
        getOutputPath: function (doc) {
          return `${ASSETS}/${doc.computedName}.md`
        },
        pathTemplate: '${docType}.md'
      }
    ];
  })
  .config(function (computeIdsProcessor, gitData, packageInfo) {
    gitData.package = packageInfo;
    computeIdsProcessor.idTemplates.push({
      docTypes: ['ngModule', 'ngRoute', 'ngComponent', 'toc', 'info-service'],
      getId: function (doc) {
        return doc.name
      },
      getAliases: function (doc) {
        return [doc.id];
      }
    });
  })
  .config(function (customDocs) {
    customDocs.addDocs([
      require('./docs/guideDoc'),
      require('./docs/ngTemplate'),
      require('./docs/ngComponentDoc'),
      require('./docs/ngLazyRoute'),
      require('./docs/ngModuleDoc'),
      require('./docs/ngRouteDoc'),
      require('./docs/guideMarkdownDoc'),
      require('./docs/tocDoc'),
      require('./docs/infoServiceDoc'),
    ]);
  })
  .config(function (staticAssets) {
    staticAssets.add(SITE, OUTPUT);
  });

