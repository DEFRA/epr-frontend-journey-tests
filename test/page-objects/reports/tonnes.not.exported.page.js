import { $ } from '@wdio/globals'
import { ReportDataBasePage } from './report-data.base.page.js'

class TonnesNotExportedPage extends ReportDataBasePage {
  async enterTonnage(value) {
    await $('#tonnageNotExported').setValue(value)
  }
}

export default new TonnesNotExportedPage()
