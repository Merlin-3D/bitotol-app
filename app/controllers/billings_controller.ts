import type { HttpContext } from '@adonisjs/core/http'
import _ from 'lodash'
import Billings from '#models/billings'
import BillingItem from '#models/billing_item'
import { BillingStatus } from '#models/enum/product_enum'
import BillingPayment from '#models/billing_payment'
import * as validator from '#validators/stocks'
import ThirdParties from '#models/third_parties'
import { getBillingDetails } from '#services/common'

export default class BillingsController {
  /**
   * Handle form submission for the create action
   */
  async store({ auth, request, response }: HttpContext) {
    const data = await request.validateUsing(validator.BillingsStore)
    const billing = await new Billings()
      .merge({
        type: data.type,
        thirdPartiesId: data.thirdPartiesId,
        billingDate: data.billingDate,
        description: data.description,
        status: data.status ? data.status : BillingStatus.DRAFT,
        //@ts-ignore
        userId: auth.user?.id,
      })
      .save()

    return response.redirect(`/dashboard/billings/${billing.id}`)
  }

  async createCredit({ request, response }: HttpContext) {
    // Validation des données entrantes
    const data = await request.validateUsing(validator.BillingsCreditStore)

    // Création de la facture d'avoir
    const billing = await new Billings().merge(_.omit(data, 'billingItem')).save()

    // Gestion des items de facturation pour l'avoir
    for (const item of data.billingItem) {
      // Création des items dans la facture d'avoir
      await BillingItem.create({
        billingsId: billing.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        discount: item.discount,
        tva: item.tva,
      })
    }
    // Réponse avec les détails de la facture d'avoir
    return response.send(billing)
  }

  async validateCredit({ params, request, response }: HttpContext) {
    const { id } = params

    try {
      const data = await request.validateUsing(validator.BillingsCreditStatus)

      const parentBilling = await Billings.findOrFail(data.parentBillingId)
      const currentBilling = await Billings.findOrFail(id)

      if (currentBilling.isFullRefund) {
        // Le prix restant de la facture parent est mis à 0
        parentBilling.allocatedPrice = parentBilling.remainingPrice
        parentBilling.remainingPrice = 0
        parentBilling.status = BillingStatus.PAID // Facture totalement payée/remboursée
        currentBilling.status = BillingStatus.CREDIT_BACK
        currentBilling.allocatedPrice = currentBilling.remainingPrice
        currentBilling.remainingPrice = 0
      } else {
        // Cas 2 : Remboursement partiel

        currentBilling.allocatedPrice = currentBilling.remainingPrice
        currentBilling.remainingPrice = 0
        currentBilling.status = BillingStatus.CREDIT_BACK // Avoir remboursée
        // Mise à jour du montant restant de la facture parent en fonction du montant total remboursé
        parentBilling.allocatedPrice! += currentBilling.allocatedPrice!

        parentBilling.remainingPrice! -= currentBilling.allocatedPrice!
        // Si tout est remboursé, statut payé, sinon partiellement payé
        if (parentBilling.remainingPrice! <= 0) {
          parentBilling.remainingPrice = 0
          parentBilling.status = BillingStatus.PAID // Facture complètement remboursée
        } else {
          parentBilling.status = BillingStatus.PAID_PARTIALLY // Facture partiellement remboursée
        }
      }
      await parentBilling.save()
      await currentBilling.save()

      const billing = await Billings.query()
        .where('id', id)
        //@ts-ignore
        .preload('user')
        //@ts-ignore
        .preload('thirdParties')
        .preload('billingItem')
        .preload('childrenBillings')
        //@ts-ignore
        .preload('parentBilling')
        .preload('billingPayments')
        .first()

      return response.send(billing)
    } catch (error) {
      console.log(error)
      return response.status(error.status || 500).send({
        code: error.code,
        message: error.messages || 'Une erreur est survenue lors du traitement du remboursement.',
      })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const { id } = params

    try {
      const billing = await Billings.query()
        .where('id', id)
        //@ts-ignore
        .preload('user')
        //@ts-ignore
        .preload('thirdParties')
        .preload('billingItem')
        .preload('childrenBillings')
        //@ts-ignore
        .preload('parentBilling')
        .preload('billingPayments')
        .first()

      let itemData: any[] = []
      //@ts-ignore
      for (const item of billing.billingItem) {
        const vatRate = 0
        const vatAmount = item.$extras.pivot_price * vatRate

        const billingitem = {
          ..._.omit(item.$original, ['metadata', 'createdAt', 'updatedAt']),
          quantity: item.$extras.pivot_quantity,
          productId: item.$extras.pivot_product_id,
          price: item.$extras.pivot_price,
          priceIncludingVat: item.$extras.pivot_price + vatAmount,
          total: item.$extras.pivot_total,
          order_supplier_id: item.$extras.pivot_order_supplier_id,
          discount: item.$extras.pivot_discount,
          billingItemId: item.$extras.pivot_id,
          tva: item.$extras.pivot_tva,
          amountExcludingVat: item.$extras.pivot_price * item.$extras.pivot_quantity,
          // purchasePrice: { ..._.omit(purchasePrice!.$original, ['discount', 'price', 'tva']) },
        }
        itemData = [...itemData, billingitem]
      }

      return response.send({
        billing,
        item: itemData,
      })
    } catch (error) {
      console.log(error)
      response.status(error.status).send({
        code: error.code,
        message: error.messages,
      })
    }
  }

  /**
   * Edit individual record
   */
  async edit({ params, request, inertia }: HttpContext) {
    const { id } = params

    const data = await request.validateUsing(validator.BillingsUpdate)

    const billingFind = await Billings.findByOrFail('id', id)

    if (!billingFind) {
      return
    }

    billingFind.refBillingSupplier = data.refBillingSupplier ? data.refBillingSupplier : null
    billingFind.description = data.description
    billingFind.billingDate = data.billingDate
    billingFind.status = data.status
    billingFind.type = data.type

    await billingFind.save()

    const customers = await ThirdParties.query().orderBy('created_at', 'desc')
    const { billing, products, item } = await getBillingDetails(id)
    return inertia.render(
      'billings/details/index',
      { billing, products, item, customers, csrfToken: request.csrfToken },
      { title: 'Détails' }
    )
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, response, request }: HttpContext) {
    const { id } = params
    try {
      const data = await request.validateUsing(validator.BillingsUpdate)

      const billing = await Billings.findByOrFail('id', id)

      if (!billing) {
        response.status(404).send({
          message: 'Aucune facture',
        })
      }

      billing.refBillingSupplier = data.refBillingSupplier ? data.refBillingSupplier : null
      billing.description = data.description
      billing.billingDate = data.billingDate
      billing.status = data.status
      billing.type = data.type

      await billing.save()
      return await Billings.query()
        .where('id', id)
        //@ts-ignore
        .preload('user')
        .preload('billingItem')
        .preload('billingPayments')
        .preload('childrenBillings')
        //@ts-ignore
        .preload('parentBilling')
        .first()
    } catch (error) {
      console.log(error)
      response.status(error.status).send({
        code: error.code,
        message: error.messages,
      })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, inertia }: HttpContext) {
    const { id } = params
    const billing = await Billings.findByOrFail('id', id)
    await billing.delete()
    const billings = await Billings.query() //@ts-ignore
      .preload('thirdParties')
      .orderBy('created_at', 'desc')
    const customers = await ThirdParties.query().orderBy('created_at', 'desc')

    return inertia.render('billings/index', { billings, customers }, { title: 'Billings' })
  }

  async addBillingItem({ request, inertia }: HttpContext) {
    const data = await request.validateUsing(validator.BillingItemCreate)
    const billingSelected = await Billings.findByOrFail('id', data.billingsId)
    // const product = await Product.findByOrFail('id', data.productId)

    const vatRate = data?.tva ? Number(data.tva) / 100 : 0
    const discountRate = data?.discount ? Number(data.discount) / 100 : 0

    // Calcul du prix total avant remise
    const totalPriceBeforeDiscount = data.price * data.quantity

    // Application de la remise au prix total
    const totalPriceAfterDiscount = totalPriceBeforeDiscount * (1 - discountRate)

    // Montant de TVA sur le montant après remise
    const vatAmount = totalPriceAfterDiscount * vatRate

    // Total TTC (Prix total après remise + TVA)
    const totalPriceTTC = totalPriceAfterDiscount + vatAmount

    await BillingItem.create({
      billingsId: data.billingsId,
      productId: data.productId,
      quantity: data.quantity,
      price: data.price, // Prix unitaire après remise
      total: totalPriceTTC, // Total TTC
      discount: data.discount,
      tva: data.tva,
    })

    // Montant total de la commande avant TVA et après TVA
    const amountExcludingVat = billingSelected.amountExcludingVat! + totalPriceBeforeDiscount
    const vatAmountOrder = billingSelected.vatAmount! + totalPriceBeforeDiscount * vatRate
    const amountIncludingVat = amountExcludingVat + vatAmountOrder

    billingSelected.allocatedPrice = 0
    billingSelected.amountExcludingVat = amountExcludingVat
    billingSelected.vatAmount = vatAmountOrder
    billingSelected.amountIncludingVat = amountIncludingVat
    billingSelected.remainingPrice = Number.parseFloat(amountIncludingVat)
    await billingSelected.save()

    const { billing, products, item } = await getBillingDetails(billingSelected.id)
    const customers = await ThirdParties.query().orderBy('created_at', 'desc')

    return inertia.render(
      'billings/details/index',
      { billing, products, item, customers, csrfToken: request.csrfToken },
      { title: 'Détails' }
    )
  }

  async updateBillingItem({ params, request, response }: HttpContext) {
    const { id } = params
    try {
      const data = await request.validateUsing(validator.BillingItemUpdate)
      const billingItem = await BillingItem.findByOrFail('id', id)
      if (!billingItem) {
        return response.status(404).send({
          message: 'Aucun élément de commande',
        })
      }

      const billing = await Billings.findByOrFail('id', billingItem.billingsId)
      if (!billing) {
        return response.status(404).send({
          message: 'Aucune commande',
        })
      }

      const vatRate = data?.tva ? Number(data.tva) / 100 : 0
      const discountRate = data?.discount ? Number(data.discount) / 100 : 0

      // Calcul du prix total avant remise
      const totalPriceBeforeDiscount = data.price * data.quantity

      // Application de la remise au prix total
      const totalPriceAfterDiscount = totalPriceBeforeDiscount * (1 - discountRate)

      // Montant de TVA sur le montant après remise
      const vatAmount = totalPriceAfterDiscount * vatRate

      // Total TTC (Prix total après remise + TVA)
      const totalPriceTTC = totalPriceAfterDiscount + vatAmount

      const beforePrice = billingItem.price
      const beforeQuantity = billingItem.quantity

      billingItem.tva = data.tva
      billingItem.price = data.price
      billingItem.quantity = data.quantity
      billingItem.discount = data.discount
      billingItem.total = totalPriceTTC
      const priceIncludingVat = totalPriceAfterDiscount + vatAmount

      await billingItem.save()

      const oldItemPrice = beforePrice * beforeQuantity

      // Remise à jour des montants de la commande avant remise
      const beforeOrderPriceExcludingVat = billing.amountExcludingVat
        ? Number.parseFloat(billing.amountExcludingVat!)
        : 0

      const beforeOrderPrice = beforeOrderPriceExcludingVat - oldItemPrice

      // Calcul du nouveau montant de la commande après mise à jour de l'item
      const newItemPrice = totalPriceBeforeDiscount
      const newOrderPriceExcludingVat = beforeOrderPrice + newItemPrice

      // Nouveau montant de TVA pour la commande
      const newVatAmountOrder = newOrderPriceExcludingVat * vatRate

      // Nouveau montant total TTC pour la commande
      const newOrderPriceIncludingVat = newOrderPriceExcludingVat + newVatAmountOrder

      // Mise à jour des montants de la commande
      billing.amountExcludingVat = newOrderPriceExcludingVat.toFixed(2)
      billing.vatAmount = newVatAmountOrder.toFixed(2)
      billing.amountIncludingVat = newOrderPriceIncludingVat.toFixed(2)
      billing.remainingPrice = newOrderPriceIncludingVat
      billing.allocatedPrice = 0 // Cela semble être constant, ajustez selon les besoins

      await billing.save()

      return response.send({
        ...billingItem.$original,
        priceIncludingVat: priceIncludingVat.toFixed(2),
        amountExcludingVat: billing.amountExcludingVat,
        vatAmount: billing.vatAmount,
        amountIncludingVat: billing.amountIncludingVat,
        remainingPrice: billing.remainingPrice.toFixed(2),
        allocatedPrice: billing.allocatedPrice.toFixed(2),
      })
    } catch (error) {
      console.log(error)
      response.status(error.status).send({
        code: error.code,
        message: error.messages,
      })
    }
  }

  async destroyBillingItem({ params, response }: HttpContext) {
    try {
      const { id } = params
      const billingItem = await BillingItem.findByOrFail('id', id)
      const billing = await Billings.findByOrFail('id', billingItem.billingsId)

      // Helpers
      const toNumber = (v: any) => {
        const n = Number(v ?? 0)
        return Number.isFinite(n) ? n : 0
      }
      const roundTo2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

      // Valeurs normalisées
      const unitPrice = toNumber(billingItem.price) // prix unitaire (excl. TVA)
      const quantity = toNumber(billingItem.quantity) // quantité
      const itemTotalProvided = toNumber(billingItem.total) // total fourni (si présent, peut être TTC)
      // TVA peut être string "0", null, undefined, etc. Interpréter comme pourcentage.
      const tvaPercent = toNumber(billingItem.tva) // ex: 18 pour 18%
      const vatRate = tvaPercent / 100 // 0.18

      // Calculs corrects basés sur la quantité
      const amountExcluding = roundTo2(unitPrice * quantity) // montant HT pour cet item
      const vatAmountForItem = roundTo2(amountExcluding * vatRate) // TVA pour cet item
      // Si billingItem.total est renseigné et qu'il représente TTC, tu peux l'utiliser.
      // Sinon, on calcule amountIncluding à partir de HT + TVA.
      const amountIncluding =
        itemTotalProvided > 0
          ? roundTo2(itemTotalProvided)
          : roundTo2(amountExcluding + vatAmountForItem)

      // Valeurs courantes dans la facture — normaliser avant opération
      const currentAmountExcludingVat = toNumber(billing.amountExcludingVat)
      const currentVatAmount = toNumber(billing.vatAmount)
      const currentAmountIncludingVat = toNumber(billing.amountIncludingVat)

      // Mise à jour : soustraire les montants de l'item supprimé
      const newAmountExcludingVat = roundTo2(currentAmountExcludingVat - amountExcluding)
      const newVatAmount = roundTo2(currentVatAmount - vatAmountForItem)
      const newAmountIncludingVat = roundTo2(currentAmountIncludingVat - amountIncluding)

      // S'assurer que les totaux ne deviennent pas négatifs
      billing.amountExcludingVat = String(Math.max(0, newAmountExcludingVat).toFixed(2))
      billing.vatAmount = String(Math.max(0, newVatAmount).toFixed(2))
      billing.amountIncludingVat = String(Math.max(0, newAmountIncludingVat).toFixed(2))

      // remainingPrice et allocatedPrice selon logique métier :
      // ici on met remainingPrice = nouveau montant TTC restant, allocatedPrice remis à 0 comme avant
      billing.remainingPrice = Math.max(0, newAmountIncludingVat)
      billing.allocatedPrice = 0

      await billing.save()
      await billingItem.delete()

      return response.send({
        id,
        amountExcludingVat: billing.amountExcludingVat,
        vatAmount: billing.vatAmount,
        amountIncludingVat: billing.amountIncludingVat,
        remainingPrice: billing.remainingPrice,
        allocatedPrice: billing.allocatedPrice,
      })
    } catch (error) {
      return response.status(error.status || 500).send({
        code: error.code,
        message: error.messages || error.message,
      })
    }
  }

  //Billing Payment
  async addPayment({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(validator.BillingPaymentCreate)

      const billing = await Billings.findByOrFail('id', data.billingsId)
      if (!billing) {
        return response.status(404).send({
          message: 'Aucune facture',
        })
      }

      billing.remainingPrice = billing.remainingPrice! - data.amount
      billing.allocatedPrice = billing.allocatedPrice! + data.amount

      if (Number.parseFloat(billing.amountIncludingVat!) > billing.allocatedPrice) {
        billing.status = BillingStatus.BEGIN
      } else {
        billing.status = BillingStatus.PAID
      }
      await billing.save()

      await BillingPayment.create({
        billingsId: data.billingsId,
        paymentDate: data.paymentDate,
        comment: data.comment,
        oldAmount: data.oldAmount,
        amount: data.amount,
      })

      return await Billings.query().where('id', billing.id).first()
    } catch (error) {
      console.log(error)
      return response.status(error.status || 500).send({
        code: error.code,
        message: error.messages,
      })
    }
  }

  async removePayment({ params, response }: HttpContext) {
    const { id } = params

    try {
      const billingPayment = await BillingPayment.findByOrFail('id', id)
      if (!billingPayment) {
        return response.status(404).send({
          message: 'Aucun paiement',
        })
      }

      const billing = await Billings.findByOrFail('id', billingPayment.billingsId)
      if (!billing) {
        return response.status(404).send({
          message: 'Aucune facture',
        })
      }

      billing.remainingPrice = billing.remainingPrice! + billingPayment.amount!
      billing.allocatedPrice = billing.allocatedPrice! - billingPayment.amount!

      if (billing.allocatedPrice === 0) {
        billing.status = BillingStatus.VALIDATE
      } else if (Number.parseFloat(billing.amountIncludingVat!) > billing.allocatedPrice) {
        billing.status = BillingStatus.BEGIN
      }
      await billing.save()

      await billingPayment.delete()
      return await Billings.query()
        .where('id', billing.id)
        //@ts-ignore
        .preload('billingPayments')
        .first()
    } catch (error) {
      console.log(error)
      return response.status(error.status || 500).send({
        code: error.code,
        message: error.messages,
      })
    }
  }
}
