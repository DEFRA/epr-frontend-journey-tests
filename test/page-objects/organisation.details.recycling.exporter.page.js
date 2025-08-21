import { Page } from 'page-objects/page'

class OrganisationDetailsRecyclingExporterPage extends Page {
  reprocessor() {
    $('#WVADkQ').click()
  }

  exporter() {
    $('#WVADkQ-2').click()
  }

  reprocessorAndExporter() {
    $('#WVADkQ-3').click()
  }

  noneOfAbove() {
    $('#WVADkQ-4').click()
  }
}

export default new OrganisationDetailsRecyclingExporterPage()
