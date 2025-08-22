import { Page } from 'page-objects/page.js'

class OrganisationDetailsRecyclingExporterPage extends Page {
  async reprocessor() {
    await super.radioInputElement(1).click()
  }

  async exporter() {
    await super.radioInputElement(2).click()
  }

  async reprocessorAndExporter() {
    await super.radioInputElement(3).click()
  }

  async noneOfAbove() {
    await super.radioInputElement(4).click()
  }
}

export default new OrganisationDetailsRecyclingExporterPage()
