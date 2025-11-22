const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
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

    // Logout
    router.post('/logout', [AuthController, 'logout'])
  })
  .use([middleware.auth()])
  .prefix('/dashboard')
