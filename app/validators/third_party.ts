import vine from '@vinejs/vine'

export const thirdPartiesStore = vine.compile(
  vine.object({
    name: vine.string().nullable(),
    email: vine.string().optional(),
    address: vine.string().nullable(),
    phone: vine.string().nullable(),
    description: vine.string().optional(),
  })
)
