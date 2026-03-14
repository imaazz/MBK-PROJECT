/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'
import CatalogController from '#controllers/catalog_controller'
import ProcurementController from '#controllers/procurement_controller'

router.on('/').renderInertia('home', {}).as('home')

// Buyer UI pages
router.on('/buyer/catalog').renderInertia('buyer/catalog', {}).as('buyer.catalog')
router.on('/buyer/draft').renderInertia('buyer/draft', {}).as('buyer.draft')
router.on('/buyer/purchase-orders').renderInertia('buyer/purchase_orders/index', {}).as(
  'buyer.purchase_orders.index'
)
router.on('/buyer/purchase-orders/:id').renderInertia('buyer/purchase_orders/show', {}).as(
  'buyer.purchase_orders.show'
)

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
  })
  .use(middleware.auth())

// Catalog service (synchronous API)
router
  .group(() => {
    router.get('items', [CatalogController, 'index'])
  })
  .prefix('/api/catalog')
  .as('catalog')

// Procurement service (synchronous API)
router
  .group(() => {
    router.post('drafts', [ProcurementController, 'createDraft']).as('drafts.create')
    router.get('drafts/:id', [ProcurementController, 'show']).as('drafts.show')
    router.patch('drafts/:id/header', [ProcurementController, 'updateDraftHeader']).as('drafts.update_header')
    router.post('drafts/:id/lines', [ProcurementController, 'addLine']).as('drafts.lines.add')
    router.patch('drafts/:id/lines/:lineId', [ProcurementController, 'updateLine']).as('drafts.lines.update')
    router.delete('drafts/:id/lines/:lineId', [ProcurementController, 'removeLine']).as('drafts.lines.remove')
    router.post('drafts/:id/submit', [ProcurementController, 'submitDraft']).as('drafts.submit')

    router.get('purchase-orders', [ProcurementController, 'listOrders']).as('orders.index')
    router.get('purchase-orders/:id', [ProcurementController, 'show']).as('orders.show')
    router.post('purchase-orders/:id/status', [ProcurementController, 'transitionStatus']).as('orders.transition')
  })
  .prefix('/api/procurement')
  .as('procurement')
