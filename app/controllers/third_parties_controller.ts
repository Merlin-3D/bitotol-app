import type { HttpContext } from '@adonisjs/core/http'
import * as validator from '#validators/third_party'
import _ from 'lodash'
import { DateTime } from 'luxon'
import ThirdParties from '#models/third_parties'

export default class ThirdPartiesController {
  /**
   * Display a list of resource
   */
  // async index({ response }: HttpContext) {
  //   try {

  //   } catch (error) {
  //     response.status(error.status).send(error)
  //   }
  // }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, inertia }: HttpContext) {
    try {
      const data = await request.validateUsing(validator.thirdPartiesStore)

      const thirdParties = await new ThirdParties().merge(data).save()
      const customers = await ThirdParties.query().orderBy('created_at', 'desc')
      return inertia.render('customers/index', { thirdParties, customers }, { title: 'Clients' })
    } catch (error) {
      return inertia.render('customers/index', { error }, { title: 'Clients' })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const { id } = params

    try {
      return await ThirdParties.findByOrFail('id', id)
    } catch (error) {
      response.status(error.status || 500).send({
        code: error.code,
        message: error.messages,
      })
    }
  }

  /**
   * Edit individual record
   */
  async edit({}: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ request, inertia }: HttpContext) {
    try {
      const { q } = request.qs()
      const thirdParties = await ThirdParties.findByOrFail('id', q)
      const payload = await request.validateUsing(validator.thirdPartiesStore)

      if (!thirdParties) {
        return null
      }
      thirdParties.name = payload.name
      thirdParties.email = payload.email ? payload.email : thirdParties.email
      thirdParties.address = payload.address
      thirdParties.phone = payload.phone
      thirdParties.description = payload.description
        ? payload.description
        : thirdParties.description
      thirdParties.updatedAt = DateTime.now()

      await thirdParties.save()
      const customers = await ThirdParties.query().orderBy('created_at', 'desc')
      return inertia.render('customers/index', { thirdParties, customers }, { title: 'Clients' })
    } catch (error) {
      return inertia.render('customers/index', { error }, { title: 'Clients' })
    }
  }

  /**
   * Delete record
   */
  async destroy({ request, inertia }: HttpContext) {
    try {
      const { q } = request.qs()
      const thirdParties = await ThirdParties.findByOrFail('id', q)
      await thirdParties.delete()
      const customers = await ThirdParties.query().orderBy('created_at', 'desc')
      return inertia.render('customers/index', { thirdParties, customers }, { title: 'Clients' })
    } catch (error) {
      return inertia.render('customers/index', { error }, { title: 'Clients' })
    }
  }
}
