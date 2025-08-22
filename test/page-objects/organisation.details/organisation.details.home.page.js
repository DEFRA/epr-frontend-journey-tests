import { Page } from 'page-objects/page.js'

class OrganisationDetailsHomePage extends Page {
  open() {
    return super.open(
      '/form/preview/draft/demo-for-pepr-extended-producer-responsibilities-provide-your-organisation-details-ea/form-guidance'
    )
  }
}

export default new OrganisationDetailsHomePage()
