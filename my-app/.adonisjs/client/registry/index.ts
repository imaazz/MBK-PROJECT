/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'buyer.catalog': {
    methods: ["GET","HEAD"],
    pattern: '/buyer/catalog',
    tokens: [{"old":"/buyer/catalog","type":0,"val":"buyer","end":""},{"old":"/buyer/catalog","type":0,"val":"catalog","end":""}],
    types: placeholder as Registry['buyer.catalog']['types'],
  },
  'buyer.draft': {
    methods: ["GET","HEAD"],
    pattern: '/buyer/draft',
    tokens: [{"old":"/buyer/draft","type":0,"val":"buyer","end":""},{"old":"/buyer/draft","type":0,"val":"draft","end":""}],
    types: placeholder as Registry['buyer.draft']['types'],
  },
  'buyer.purchase_orders.index': {
    methods: ["GET","HEAD"],
    pattern: '/buyer/purchase-orders',
    tokens: [{"old":"/buyer/purchase-orders","type":0,"val":"buyer","end":""},{"old":"/buyer/purchase-orders","type":0,"val":"purchase-orders","end":""}],
    types: placeholder as Registry['buyer.purchase_orders.index']['types'],
  },
  'buyer.purchase_orders.show': {
    methods: ["GET","HEAD"],
    pattern: '/buyer/purchase-orders/:id',
    tokens: [{"old":"/buyer/purchase-orders/:id","type":0,"val":"buyer","end":""},{"old":"/buyer/purchase-orders/:id","type":0,"val":"purchase-orders","end":""},{"old":"/buyer/purchase-orders/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['buyer.purchase_orders.show']['types'],
  },
  'new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.create']['types'],
  },
  'new_account.store': {
    methods: ["POST"],
    pattern: '/signup',
    tokens: [{"old":"/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['new_account.store']['types'],
  },
  'session.create': {
    methods: ["GET","HEAD"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.create']['types'],
  },
  'session.store': {
    methods: ["POST"],
    pattern: '/login',
    tokens: [{"old":"/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['session.store']['types'],
  },
  'session.destroy': {
    methods: ["POST"],
    pattern: '/logout',
    tokens: [{"old":"/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['session.destroy']['types'],
  },
  'catalog.catalog.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/catalog/items',
    tokens: [{"old":"/api/catalog/items","type":0,"val":"api","end":""},{"old":"/api/catalog/items","type":0,"val":"catalog","end":""},{"old":"/api/catalog/items","type":0,"val":"items","end":""}],
    types: placeholder as Registry['catalog.catalog.index']['types'],
  },
  'procurement.drafts.create': {
    methods: ["POST"],
    pattern: '/api/procurement/drafts',
    tokens: [{"old":"/api/procurement/drafts","type":0,"val":"api","end":""},{"old":"/api/procurement/drafts","type":0,"val":"procurement","end":""},{"old":"/api/procurement/drafts","type":0,"val":"drafts","end":""}],
    types: placeholder as Registry['procurement.drafts.create']['types'],
  },
  'procurement.drafts.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/procurement/drafts/:id',
    tokens: [{"old":"/api/procurement/drafts/:id","type":0,"val":"api","end":""},{"old":"/api/procurement/drafts/:id","type":0,"val":"procurement","end":""},{"old":"/api/procurement/drafts/:id","type":0,"val":"drafts","end":""},{"old":"/api/procurement/drafts/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['procurement.drafts.show']['types'],
  },
  'procurement.drafts.update_header': {
    methods: ["PATCH"],
    pattern: '/api/procurement/drafts/:id/header',
    tokens: [{"old":"/api/procurement/drafts/:id/header","type":0,"val":"api","end":""},{"old":"/api/procurement/drafts/:id/header","type":0,"val":"procurement","end":""},{"old":"/api/procurement/drafts/:id/header","type":0,"val":"drafts","end":""},{"old":"/api/procurement/drafts/:id/header","type":1,"val":"id","end":""},{"old":"/api/procurement/drafts/:id/header","type":0,"val":"header","end":""}],
    types: placeholder as Registry['procurement.drafts.update_header']['types'],
  },
  'procurement.drafts.lines.add': {
    methods: ["POST"],
    pattern: '/api/procurement/drafts/:id/lines',
    tokens: [{"old":"/api/procurement/drafts/:id/lines","type":0,"val":"api","end":""},{"old":"/api/procurement/drafts/:id/lines","type":0,"val":"procurement","end":""},{"old":"/api/procurement/drafts/:id/lines","type":0,"val":"drafts","end":""},{"old":"/api/procurement/drafts/:id/lines","type":1,"val":"id","end":""},{"old":"/api/procurement/drafts/:id/lines","type":0,"val":"lines","end":""}],
    types: placeholder as Registry['procurement.drafts.lines.add']['types'],
  },
  'procurement.drafts.lines.update': {
    methods: ["PATCH"],
    pattern: '/api/procurement/drafts/:id/lines/:lineId',
    tokens: [{"old":"/api/procurement/drafts/:id/lines/:lineId","type":0,"val":"api","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":0,"val":"procurement","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":0,"val":"drafts","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":1,"val":"id","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":0,"val":"lines","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":1,"val":"lineId","end":""}],
    types: placeholder as Registry['procurement.drafts.lines.update']['types'],
  },
  'procurement.drafts.lines.remove': {
    methods: ["DELETE"],
    pattern: '/api/procurement/drafts/:id/lines/:lineId',
    tokens: [{"old":"/api/procurement/drafts/:id/lines/:lineId","type":0,"val":"api","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":0,"val":"procurement","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":0,"val":"drafts","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":1,"val":"id","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":0,"val":"lines","end":""},{"old":"/api/procurement/drafts/:id/lines/:lineId","type":1,"val":"lineId","end":""}],
    types: placeholder as Registry['procurement.drafts.lines.remove']['types'],
  },
  'procurement.drafts.submit': {
    methods: ["POST"],
    pattern: '/api/procurement/drafts/:id/submit',
    tokens: [{"old":"/api/procurement/drafts/:id/submit","type":0,"val":"api","end":""},{"old":"/api/procurement/drafts/:id/submit","type":0,"val":"procurement","end":""},{"old":"/api/procurement/drafts/:id/submit","type":0,"val":"drafts","end":""},{"old":"/api/procurement/drafts/:id/submit","type":1,"val":"id","end":""},{"old":"/api/procurement/drafts/:id/submit","type":0,"val":"submit","end":""}],
    types: placeholder as Registry['procurement.drafts.submit']['types'],
  },
  'procurement.orders.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/procurement/purchase-orders',
    tokens: [{"old":"/api/procurement/purchase-orders","type":0,"val":"api","end":""},{"old":"/api/procurement/purchase-orders","type":0,"val":"procurement","end":""},{"old":"/api/procurement/purchase-orders","type":0,"val":"purchase-orders","end":""}],
    types: placeholder as Registry['procurement.orders.index']['types'],
  },
  'procurement.orders.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/procurement/purchase-orders/:id',
    tokens: [{"old":"/api/procurement/purchase-orders/:id","type":0,"val":"api","end":""},{"old":"/api/procurement/purchase-orders/:id","type":0,"val":"procurement","end":""},{"old":"/api/procurement/purchase-orders/:id","type":0,"val":"purchase-orders","end":""},{"old":"/api/procurement/purchase-orders/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['procurement.orders.show']['types'],
  },
  'procurement.orders.transition': {
    methods: ["POST"],
    pattern: '/api/procurement/purchase-orders/:id/status',
    tokens: [{"old":"/api/procurement/purchase-orders/:id/status","type":0,"val":"api","end":""},{"old":"/api/procurement/purchase-orders/:id/status","type":0,"val":"procurement","end":""},{"old":"/api/procurement/purchase-orders/:id/status","type":0,"val":"purchase-orders","end":""},{"old":"/api/procurement/purchase-orders/:id/status","type":1,"val":"id","end":""},{"old":"/api/procurement/purchase-orders/:id/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['procurement.orders.transition']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
