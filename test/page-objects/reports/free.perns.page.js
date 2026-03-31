import { $ } from '@wdio/globals'
import { ReportDataBasePage } from './report-data.base.page.js'

class FreePernPage extends ReportDataBasePage {
  async enterTonnage(value) {
    await $('#freeTonnage').setValue(value)
  }
}

export default new FreePernPage()
