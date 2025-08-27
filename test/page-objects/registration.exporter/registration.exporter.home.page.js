import { Page } from 'page-objects/page.js'

class RegistrationExporterHomePage extends Page {
  open() {
    return super.open(
      '/form/preview/draft/demo-for-pepr-extended-producer-responsibilities-register-as-a-packaging-waste-exporter-ea/form-guidance'
    )
  }
}

export default new RegistrationExporterHomePage()
