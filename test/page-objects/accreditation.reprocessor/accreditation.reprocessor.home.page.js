import { Page } from 'page-objects/page.js'

class AccreditationReprocessorHomePage extends Page {
  open() {
    return super.open(
      '/form/preview/draft/demo-for-pepr-extended-producer-responsibilities-apply-for-accreditation-as-a-packaging-waste-reprocessor-ea/form-guidance'
    )
  }
}

export default new AccreditationReprocessorHomePage()
