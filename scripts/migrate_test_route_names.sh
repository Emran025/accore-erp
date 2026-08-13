#!/usr/bin/env bash
set -euo pipefail

find /home/ubuntu/accore-erp/backend/tests -type f -name '*.php' -print0 \
  | xargs -0 sed -i \
      -e "s/route('api\./route('v2./g" \
      -e "s/route('v2\.accounts\./route('v2.coa./g" \
      -e "s/route('v2\.ar\.customers\./route('v2.crm.customers./g" \
      -e "s/route('v2\.ar\.ledger')/route('v2.crm.ledger')/g" \
      -e "s/route('v2\.ar\.transactions')/route('v2.ar.transactions.index')/g" \
      -e "s/route('v2\.benefits\./route('v2.payroll.benefits./g" \
      -e "s/route('v2\.compensation\./route('v2.payroll.compensation./g" \
      -e "s/route('v2\.categories\./route('v2.inventory.categories./g" \
      -e "s/route('v2\.invoice_details')/route('v2.invoices.details')/g" \
      -e "s/route('v2\.payroll\.approve')/route('v2.payroll.cycles.approve')/g" \
      -e "s/route('v2\.payroll\.payment')/route('v2.payroll.cycles.pay')/g" \
      -e "s/route('v2\.products\./route('v2.inventory.products./g" \
      -e "s/route('v2\.recurring\./route('v2.gl.recurring./g" \
      -e "s/route('v2\.sales_representatives\.transactions\./route('v2.sales_representatives.transaction./g" \
      -e "s/route('v2\.settings\.zatca')/route('v2.settings.zatca.show')/g" \
      -e "s/route('v2\.zatca\.onboard')/route('v2.settings.zatca.onboard')/g"
