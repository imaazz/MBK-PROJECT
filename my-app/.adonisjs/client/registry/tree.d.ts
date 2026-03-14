/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  buyer: {
    catalog: typeof routes['buyer.catalog']
    draft: typeof routes['buyer.draft']
    purchaseOrders: {
      index: typeof routes['buyer.purchase_orders.index']
      show: typeof routes['buyer.purchase_orders.show']
    }
  }
  newAccount: {
    create: typeof routes['new_account.create']
    store: typeof routes['new_account.store']
  }
  session: {
    create: typeof routes['session.create']
    store: typeof routes['session.store']
    destroy: typeof routes['session.destroy']
  }
  catalog: {
    catalog: {
      index: typeof routes['catalog.catalog.index']
    }
  }
  procurement: {
    drafts: {
      create: typeof routes['procurement.drafts.create']
      show: typeof routes['procurement.drafts.show']
      updateHeader: typeof routes['procurement.drafts.update_header']
      lines: {
        add: typeof routes['procurement.drafts.lines.add']
        update: typeof routes['procurement.drafts.lines.update']
        remove: typeof routes['procurement.drafts.lines.remove']
      }
      submit: typeof routes['procurement.drafts.submit']
    }
    orders: {
      index: typeof routes['procurement.orders.index']
      show: typeof routes['procurement.orders.show']
      transition: typeof routes['procurement.orders.transition']
    }
  }
}
