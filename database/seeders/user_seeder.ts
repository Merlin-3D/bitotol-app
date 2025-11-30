import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await User.createMany([
      {
        name: 'admin',
        password: 'admin@2025',
      },
      {
        name: 'muriel',
        password: '1970',
      },
      {
        name: 'amandine',
        password: '1995',
      },
    ])
  }
}
