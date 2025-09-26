import { Page } from '../page.js'
import { urlSuffix } from '../../url.js'

class OrganisationDetailsHomePage extends Page {
  open() {
    return super.open(
      `/extended-producer-responsibilities-submit-your-organisation-details-${urlSuffix}/form-guidance`
    )
  }
}

export default new OrganisationDetailsHomePage()
