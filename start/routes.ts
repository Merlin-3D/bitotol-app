const AuthController = () => import('#controllers/auth_controller')
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
const WebController = () => import('#controllers/web.controller')

router.get('/', [WebController, 'login'])
// router.get('/login', [WebController, 'login'])
router.post('/login', [AuthController, 'login'])

router
  .group(() => {
    // router.post('/logout', [AuthController, 'logout'])

    router
      .group(() => {
        // Web route
        router.get('/home', [WebController, 'dashboard'])
        router.get('/customers', [WebController, 'customers'])
        router.get('/customers/:id/details', [WebController, 'customersDetails'])

        // Logout
        router.post('/logout', [AuthController, 'logout'])
      })
      .use([middleware.auth()])
  })
  .prefix('/dashboard')
