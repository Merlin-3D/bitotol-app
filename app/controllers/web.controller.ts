import type { HttpContext } from '@adonisjs/core/http'

export default class WebController {
  async login({ inertia }: HttpContext) {
    return inertia.render('home', {}, { title: 'Login' })
  }

  async dashboard({ inertia }: HttpContext) {
    return inertia.render('dashboard/home', {}, { title: 'Dashboard' })
  }

  async customers({ inertia }: HttpContext) {
    return inertia.render('customers/index', {}, { title: 'Clients' })
  }

  async customersDetails({ inertia }: HttpContext) {
    return inertia.render('customers/details/index', {}, { title: 'Détails' })
  }
}
