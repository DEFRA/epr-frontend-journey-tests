import { Page } from 'page-objects/page'

class OrganisationDetailsRecyclingExporterPage extends Page {
  async reprocessor() {
    await $('#WVADkQ').click()
  }

  async exporter() {
    await $('#WVADkQ-2').click()
  }

  async reprocessorAndExporter() {
    await $('#WVADkQ-3').click()
  }

  async noneOfAbove() {
    await $('#WVADkQ-4').click()
  }
}

export default new OrganisationDetailsRecyclingExporterPage()
