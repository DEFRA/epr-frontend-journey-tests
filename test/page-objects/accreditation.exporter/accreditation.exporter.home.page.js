import { Page } from 'page-objects/page.js'

class AccreditationExporterHomePage extends Page {
  open() {
    return super.open(
      '/form/preview/draft/demo-for-pepr-extended-producer-responsibilities-apply-for-accreditation-as-a-packaging-waste-exporter-ea/form-guidance'
    )
  }
}

export default new AccreditationExporterHomePage()
