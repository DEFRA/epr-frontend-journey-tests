import { Page } from 'page-objects/page.js'
import { urlSuffix } from '../../url.js'

class RegistrationExporterHomePage extends Page {
  open() {
    return super.open(
      `/form/preview/draft/demo-for-pepr-extended-producer-responsibilities-register-as-a-packaging-waste-exporter-${urlSuffix}/form-guidance`
    )
  }
}

export default new RegistrationExporterHomePage()
