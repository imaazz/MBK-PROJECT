import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'buyer.catalog': { paramsTuple?: []; params?: {} }
    'buyer.draft': { paramsTuple?: []; params?: {} }
    'buyer.purchase_orders.index': { paramsTuple?: []; params?: {} }
    'buyer.purchase_orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'catalog.catalog.index': { paramsTuple?: []; params?: {} }
    'procurement.drafts.create': { paramsTuple?: []; params?: {} }
    'procurement.drafts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.drafts.update_header': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.drafts.lines.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.drafts.lines.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'lineId': ParamValue} }
    'procurement.drafts.lines.remove': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'lineId': ParamValue} }
    'procurement.drafts.submit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.orders.index': { paramsTuple?: []; params?: {} }
    'procurement.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.orders.transition': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'buyer.catalog': { paramsTuple?: []; params?: {} }
    'buyer.draft': { paramsTuple?: []; params?: {} }
    'buyer.purchase_orders.index': { paramsTuple?: []; params?: {} }
    'buyer.purchase_orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'catalog.catalog.index': { paramsTuple?: []; params?: {} }
    'procurement.drafts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.orders.index': { paramsTuple?: []; params?: {} }
    'procurement.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'buyer.catalog': { paramsTuple?: []; params?: {} }
    'buyer.draft': { paramsTuple?: []; params?: {} }
    'buyer.purchase_orders.index': { paramsTuple?: []; params?: {} }
    'buyer.purchase_orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'new_account.create': { paramsTuple?: []; params?: {} }
    'session.create': { paramsTuple?: []; params?: {} }
    'catalog.catalog.index': { paramsTuple?: []; params?: {} }
    'procurement.drafts.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.orders.index': { paramsTuple?: []; params?: {} }
    'procurement.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'new_account.store': { paramsTuple?: []; params?: {} }
    'session.store': { paramsTuple?: []; params?: {} }
    'session.destroy': { paramsTuple?: []; params?: {} }
    'procurement.drafts.create': { paramsTuple?: []; params?: {} }
    'procurement.drafts.lines.add': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.drafts.submit': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.orders.transition': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'procurement.drafts.update_header': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'procurement.drafts.lines.update': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'lineId': ParamValue} }
  }
  DELETE: {
    'procurement.drafts.lines.remove': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'lineId': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}