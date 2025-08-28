import { Page } from 'page-objects/page.js'
import { urlSuffix } from '../../url.js'

class OrganisationDetailsHomePage extends Page {
  open() {
    return super.open(
      `/form/preview/draft/demo-for-pepr-extended-producer-responsibilities-provide-your-organisation-details-${urlSuffix}/form-guidance`
    )
  }
}

export default new OrganisationDetailsHomePage()
