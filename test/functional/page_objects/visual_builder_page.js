// import Keys from 'leadfoot/keys';

export function VisualBuilderPageProvider({ getService, getPageObjects }) {
  const find = getService('find');
  const retry = getService('retry');
  const log = getService('log');
  const testSubjects = getService('testSubjects');
  const PageObjects = getPageObjects(['common', 'header']);

  class VisualBuilderPage {

    async resetPage() {
      const fromTime = '2015-09-19 06:31:44.000';
      const toTime = '2015-09-22 18:31:44.000';
      log.debug('navigateToApp visualize');
      await PageObjects.common.navigateToUrl('visualize', 'new');
      await PageObjects.header.waitUntilLoadingHasFinished();
      log.debug('clickVisualBuilderChart');
      await find.clickByPartialLinkText('Visual Builder');
      log.debug('Set absolute time range from \"' + fromTime + '\" to \"' + toTime + '\"');
      await PageObjects.header.setAbsoluteRange(fromTime, toTime);
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async clickMetric() {
      const button = await testSubjects.find('metricTsvbTypeBtn');
      await button.click();
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async clickPanelOptions() {
      const button = await testSubjects.find('panelOptions');
      await button.click();
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async clickData() {
      const button = await testSubjects.find('tsvbDataPanel');
      await button.click();
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async clickMarkdown() {
      const button = await testSubjects.find('markdownTsvbTypeBtn');
      await button.click();
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async getMetricValue() {
      const metricValue = await find.byCssSelector('.rhythm_metric__primary-value');
      return metricValue.getVisibleText();
    }

    async enterMarkdown(markdown) {
      const input = await find.byCssSelector('.vis_editor__markdown-editor textarea');
      await input.type(markdown);
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async getMarkdownText() {
      const el = await find.byCssSelector('.vis_editor__visualization');
      return await el.getVisibleText();
    }

    async clickMarkdownData() {
      await testSubjects.click('markdownDataBtn');
    }

    async clickSeriesOption(nth = 0) {
      const el = await testSubjects.findAll('seriesOptions');
      await el[nth].click();
      await PageObjects.common.sleep(300);
    }

    async clearOffsetSeries() {
      const el = await testSubjects.find('offsetTimeSeries');
      await el.clearValue();
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async enterOffsetSeries(value) {
      const el = await testSubjects.find('offsetTimeSeries');
      await el.clearValue();
      await el.type(value);
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async getRhythmChartLegendValue() {
      const metricValue = await find.byCssSelector('.rhythm_chart__legend_value');
      await metricValue.session.moveMouseTo(metricValue);
      return await metricValue.getVisibleText();
    }

    async clickGauge() {
      await testSubjects.click('gaugeTsvbTypeBtn');
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async getGaugeLabel() {
      const gaugeLabel = await find.byCssSelector('.thorHalfGauge__label');
      return await gaugeLabel.getVisibleText();
    }

    async getGaugeCount() {
      const gaugeCount = await find.byCssSelector('.thorHalfGauge__value');
      return await gaugeCount.getVisibleText();
    }

    async clickTopN()
    {
      await testSubjects.click('top_nTsvbTypeBtn');
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async getTopNLabel() {
      const topNLabel = await find.byCssSelector('.rhythm_top_n__label');
      return await topNLabel.getVisibleText();
    }

    async getTopNCount() {
      const gaugeCount = await find.byCssSelector('.rhythm_top_n__value');
      return await gaugeCount.getVisibleText();
    }

    async clickTable() {
      await testSubjects.click('tableTsvbTypeBtn');
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async createNewMetric(nth = 0) {
      return await retry.try(async () => {
        const elements = await testSubjects.findAll('addMetricAddBtn');
        await elements[nth].click();
        await PageObjects.header.waitUntilLoadingHasFinished();
        const aggs = await testSubjects.findAll('aggSelector');
        if (aggs.length < 2) {
          throw new Error('there should be more then one aggSelectors');
        }
      });
    }

    async createNewSeries(nth = 0) {
      return await retry.try(async () => {
        const elements = await testSubjects.findAll('addSeriesAddBtn');
        await elements[nth].click();
        await PageObjects.header.waitUntilLoadingHasFinished();
        const aggs = await testSubjects.findAll('aggSelector');
        if (aggs.length < 2) {
          throw new Error('there should be more then one aggSelectors');
        }
      });
    }

    async createNewColorRule(nth = 0) {
      return await retry.try(async () => {
        const elements = await testSubjects.findAll('colorRulesAddBtn');
        await elements[nth].click();
        await PageObjects.header.waitUntilLoadingHasFinished();
        const aggs = await testSubjects.findAll('colorRule');
        if (aggs.length < 2) {
          throw new Error('there should be more then one color rules');
        }
      });
    }

    async selectColor(color, nth = 0) {
      const elements = await testSubjects.findAll('colorPicker');
      let swatch = await elements[nth].findByCssSelector('.vis_editor__color_picker-swatch-empty');
      if (!swatch || swatch.length === 0) {
        swatch = await elements[nth].findByCssSelector('.vis_editor__color_picker-swatch');
      }
      swatch.click();
      const input = await elements[nth].findByCssSelector('.color_picker__body input');
      await input.clearValue();
      await input.type(color);
      const cover = await elements[nth].findByCssSelector('.vis_editor__color_picker-cover');
      await cover.click();
      return await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async getBackgroundColor() {
      const element = await find.byCssSelector('.dashboard__visualization');
      return await element.getAttribute('style');
    }

    async getForegroundColor() {
      const element = await find.byCssSelector('.rhythm_metric__primary-value');
      return await element.getAttribute('style');
    }


    async _selectByTestSubject(subject, type, nth = 0) {
      const elements = await testSubjects.findAll(subject);
      const input = await elements[nth].findByCssSelector('.Select-input input');
      await input.type(type);
      const option = await elements[nth].findByCssSelector('.Select-option');
      await option.click();
      return await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async selectColorRuleOp(op, nth = 0) {
      return await this._selectByTestSubject('colorRule', op, nth);
    }

    async setColorRuleValue(value, nth = 0) {
      const rules = await testSubjects.findAll('colorRule');
      const input = await rules[nth].findByCssSelector('.color_rules__input');
      await input.clearValue();
      await input.type(String(value));
      return await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async selectAggType(type, nth = 0) {
      return await this._selectByTestSubject('aggSelector', type, nth);
    }

    async selectMetric(type, nth = 0) {
      return await this._selectByTestSubject('metricSelector', type, nth);
    }

    async fillInExpression(expression, nth = 0) {
      const expressions = await testSubjects.findAll('mathExpression');
      await expressions[nth].type(expression);
      return await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async setStaticValue(value, nth = 0) {
      const statics = await testSubjects.findAll('staticValue');
      await statics[nth].type(String(value));
      return await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async fillInVariable(name = 'test', metric = 'count', nth = 0) {
      const elements = await testSubjects.findAll('varRow');
      const input = await elements[nth].findByCssSelector('.vis_editor__calc_vars-name input');
      await input.type(name);
      const select = await elements[nth].findByCssSelector('.Select-input input');
      await select.type(metric);
      const option = await elements[nth].findByCssSelector('.Select-option');
      await option.click();
      return await PageObjects.header.waitUntilLoadingHasFinished();
    }


    async selectGroupByField(fieldName) {
      const element = await testSubjects.find('groupByField');
      const input = await element.findByCssSelector('.Select-input input');
      await input.type(fieldName);
      const option = await element.findByCssSelector('.Select-option');
      await option.click();
    }

    async setLabelValue(value) {
      const el = await testSubjects.find('columnLabelName');
      await el.clearValue();
      await el.type(value);
      await PageObjects.header.waitUntilLoadingHasFinished();
    }

    async getViewTable() {
      const tableView = await testSubjects.find('tableView');
      return await tableView.getVisibleText();
    }


  }

  return new VisualBuilderPage();
}
