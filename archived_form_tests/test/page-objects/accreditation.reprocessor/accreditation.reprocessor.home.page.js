import { Page } from '../page.js'
import { urlSuffix } from '../../url.js'

class AccreditationReprocessorHomePage extends Page {
  open() {
    return super.open(
      `/extended-producer-responsibilities-apply-for-accreditation-as-a-packaging-waste-reprocessor-${urlSuffix}/form-guidance`
    )
  }
}

export default new AccreditationReprocessorHomePage()
