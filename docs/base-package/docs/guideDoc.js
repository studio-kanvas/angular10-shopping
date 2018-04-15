const {startCase} = require('lodash');

module.exports = exports = class GuideDoc {
  constructor(fileInfo) {
    const {baseName, content} = fileInfo;
    this.chapter = 'guide';
    this.docType = 'markdown';
    this.name = startCase(baseName).replace(/ /g, '');
    this.computedName = baseName;
    this.content = content;
    this.template = 'component.ts';
    this.path = this.computedName + '.component';
    this.ngTemplatePath = './' + this.path + '.html';
    this.startingLine = 1;
  }
};
