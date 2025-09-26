import { Page } from '../page.js'
import { urlSuffix } from '../../url.js'

class AccreditationExporterHomePage extends Page {
  open() {
    return super.open(
      `/extended-producer-responsibilities-apply-for-accreditation-as-a-packaging-waste-exporter-${urlSuffix}/form-guidance`
    )
  }
}

export default new AccreditationExporterHomePage()
