import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async login({ request, response, inertia, auth }: HttpContext) {
    const { name, password } = request.only(['name', 'password'])

    try {
      const user = await User.verifyCredentials(name, password)
      if (!user) {
        return inertia.render('home', {
          error: 'Le nom ou le mot de passe incorrect.',
          success: null,
        })
      }

      await auth.use('web').login(user)
      return response.redirect('/dashboard/home')
    } catch (error) {
      return inertia.render('home', {
        error: error.messages || error,
        success: null,
      })
    }
  }

  async logout({ response, auth, session }: HttpContext) {
    await auth.use('web').logout()
    session.clear()
    return response.redirect('/login')
  }
}
