const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const BillingsController = () => import('#controllers/billings_controller')
const StocksController = () => import('#controllers/stocks_controller')
const ProductsController = () => import('#controllers/products_controller')
const WarehousesController = () => import('#controllers/warehouses_controller')
const ThirdPartiesController = () => import('#controllers/third_parties_controller')
const WebController = () => import('#controllers/web.controller')

router.get('/', [WebController, 'login'])
router.get('/login', [WebController, 'login'])
router.post('/login', [AuthController, 'login'])

router
  .group(() => {
    // Web route
    router.get('/home', [WebController, 'dashboard'])
    router.get('/customers', [WebController, 'customers'])
    router.get('/customers/:id/details', [WebController, 'customersDetails'])
    router.post('/customers', [ThirdPartiesController, 'store'])
    router.put('/customers', [ThirdPartiesController, 'update'])
    router.delete('/customers', [ThirdPartiesController, 'destroy'])

    //warehouse
    router.get('/warehouses', [WebController, 'warehouses'])
    router.post('/warehouses', [WarehousesController, 'store'])
    router.get('/warehouses/:id', [WebController, 'warehousesDetails'])
    router.put('/warehouses/:id', [WarehousesController, 'update'])
    router.delete('/warehouses/:id', [WarehousesController, 'destroy'])
    router.get('/products', [WebController, 'products'])
    router.post('/products', [ProductsController, 'store'])
    router.get('/products/:id', [WebController, 'productsDetails'])
    router.post('/products/:id', [StocksController, 'store'])
    router.put('/products/:id', [ProductsController, 'update'])
    router.delete('/products/:id', [ProductsController, 'destroy'])
    router.get('/stocks', [WebController, 'stocks'])
    router.get('/movements', [WebController, 'movements'])
    router.get('/billings', [WebController, 'billings'])
    router.post('/billings', [BillingsController, 'store'])
    router.get('/billings/:id', [WebController, 'billingDetails'])
    router.post('/billings/:id', [BillingsController, 'addBillingItem'])
    router.delete('billings/:id', [BillingsController, 'destroy'])
    router.put('billings/item/:id/update', [BillingsController, 'updateBillingItem'])
    router.delete('billings/item/:id', [BillingsController, 'destroyBillingItem'])
    router.put('billings-credit/:id/status', [BillingsController, 'validateCredit'])
    router.put('billings/:id/status', [BillingsController, 'update'])
    router.post('billing-payment', [BillingsController, 'addPayment'])
    router.post('billings/credit', [BillingsController, 'createCredit'])
    router.delete('billing-payment/:id/remove', [BillingsController, 'removePayment'])
    router.put('billings/:id', [BillingsController, 'edit'])

    // Logout
    router.post('/logout', [AuthController, 'logout'])
  })
  .use([middleware.auth()])
  .prefix('/dashboard')
