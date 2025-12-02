import type { HttpContext } from '@adonisjs/core/http'
import _ from 'lodash'
import Billings from '#models/billings'
import BillingItem from '#models/billing_item'
import { BillingStatus, MovementType, ProductType } from '#models/enum/product_enum'
import BillingPayment from '#models/billing_payment'
import * as validator from '#validators/stocks'
import ThirdParties from '#models/third_parties'
import { getBillingDetails } from '#services/common'
import Stock from '#models/stock'
import Movement from '#models/movement'
import Product from '#models/product'
import PDFDocument from 'pdfkit'
import { DateTime } from 'luxon'

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

  // Dans votre BillingsController
  async createCredit({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(validator.BillingsCreditStore)

      // Vérifier que la facture parent existe
      const parentBilling = await Billings.findOrFail(data.parentBillingId)

      // Le montant remboursable maximum est le montant total de la facture
      // Cela permet de rembourser aussi ce qui a déjà été payé
      const maxRefundable = Number(parentBilling.amountIncludingVat || 0)

      // Vérifier que la facture a un montant
      if (maxRefundable <= 0) {
        return response.status(400).send({
          code: 'INVALID_REFUND_AMOUNT',
          message: "Impossible de créer un avoir : la facture n'a pas de montant.",
        })
      }

      if (!data.isFullRefund) {
        const refundAmount = Number(data.amountIncludingVat)

        if (refundAmount <= 0) {
          return response.status(400).send({
            code: 'INVALID_REFUND_AMOUNT',
            message: 'Le montant du remboursement doit être supérieur à 0',
          })
        }

        if (refundAmount > maxRefundable) {
          return response.status(400).send({
            code: 'INVALID_REFUND_AMOUNT',
            message: `Le montant du remboursement (${refundAmount} FCFA) ne peut pas dépasser le montant total de la facture (${maxRefundable} FCFA)`,
          })
        }
      }

      // Calculer le code de l'avoir
      const creditCode = `AVOIR-${parentBilling.code}-${DateTime.now().toFormat('yyyyMMdd-HHmmss')}`

      // Création de la facture d'avoir
      const billing = await new Billings()
        .merge({
          ..._.omit(data, ['billingItem']),
          code: creditCode,
          // Réinitialiser les montants de paiement
          allocatedPrice: 0,
          remainingPrice: data.amountIncludingVat ? Number(data.amountIncludingVat) : 0,
        })
        .save()

      // Gestion des items de facturation pour l'avoir
      for (const item of data.billingItem) {
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

      // Mettre à jour le statut de la facture parent si remboursement complet
      if (data.isFullRefund) {
        parentBilling.status = BillingStatus.CREDIT_NOTE
        await parentBilling.save()
      }

      return response.send(billing)
    } catch (error) {
      console.log(error)
      return response.status(500).send({
        code: 'CREDIT_CREATION_ERROR',
        message: "Erreur lors de la création de l'avoir",
      })
    }
  }

  async validateCredit({ params, request, response }: HttpContext) {
    const { id } = params

    try {
      const data = await request.validateUsing(validator.BillingsCreditStatus)
      const parentBilling = await Billings.findOrFail(data.parentBillingId)
      const currentBilling = await Billings.findOrFail(id)

      if (currentBilling.isFullRefund) {
        // Remboursement complet
        parentBilling.allocatedPrice = Number(parentBilling.amountIncludingVat)
        parentBilling.remainingPrice = 0
        parentBilling.status = BillingStatus.PAID

        currentBilling.status = BillingStatus.CREDIT_BACK
        currentBilling.allocatedPrice = Number(currentBilling.amountIncludingVat)
        currentBilling.remainingPrice = 0
      } else {
        // Remboursement partiel
        const creditAmount = Number(currentBilling.amountIncludingVat)
        const currentAllocatedPrice = Number(parentBilling.allocatedPrice || 0)
        const currentRemainingPrice = Number(parentBilling.remainingPrice || 0)
        const totalAmount = Number(parentBilling.amountIncludingVat || 0)

        // Valider que le montant du remboursement ne dépasse pas le montant total
        if (creditAmount > totalAmount) {
          return response.status(400).send({
            code: 'INVALID_REFUND_AMOUNT',
            message: `Le montant du remboursement (${creditAmount} FCFA) dépasse le montant total de la facture (${totalAmount} FCFA)`,
          })
        }

        // Mettre à jour l'avoir (crédit)
        currentBilling.allocatedPrice = creditAmount
        currentBilling.remainingPrice = 0
        currentBilling.status = BillingStatus.CREDIT_BACK

        // Mise à jour de la facture parent
        // Si le remboursement dépasse le montant restant, on rembourse aussi une partie de ce qui a été payé
        if (creditAmount <= currentRemainingPrice) {
          // Le remboursement ne concerne que le montant restant
          parentBilling.allocatedPrice = currentAllocatedPrice + creditAmount
          parentBilling.remainingPrice = Math.max(0, currentRemainingPrice - creditAmount)
        } else {
          // Le remboursement dépasse le montant restant, on rembourse aussi une partie de ce qui a été payé
          // const refundFromRemaining = currentRemainingPrice
          const refundFromAllocated = creditAmount - currentRemainingPrice

          // Le montant alloué diminue (car on rembourse une partie de ce qui a été payé)
          parentBilling.allocatedPrice = Math.max(0, currentAllocatedPrice - refundFromAllocated)
          // Le montant restant devient 0 (tout est remboursé)
          parentBilling.remainingPrice = 0
        }

        // Mettre à jour le statut de la facture parent
        if (parentBilling.remainingPrice <= 0) {
          // Si tout est remboursé, la facture est considérée comme payée
          parentBilling.remainingPrice = 0
          parentBilling.status = BillingStatus.PAID
        } else if (parentBilling.allocatedPrice > 0) {
          // Si une partie a été payée/remboursée, statut partiellement payé
          parentBilling.status = BillingStatus.PAID_PARTIALLY
        } else {
          // Sinon, reste en statut validé
          parentBilling.status = BillingStatus.VALIDATE
        }
      }

      await parentBilling.save()
      await currentBilling.save()

      // Charger les relations pour la réponse
      const billing = await Billings.query()
        .where('id', id)
        .preload('user')
        .preload('thirdParties')
        .preload('billingItem')
        .preload('childrenBillings')
        .preload('parentBilling')
        .preload('billingPayments')
        .firstOrFail()

      return response.send(billing)
    } catch (error) {
      console.error('Validation credit error:', error)
      return response.status(error.status || 500).send({
        code: error.code || 'VALIDATION_ERROR',
        message:
          error.messages?.errors?.[0]?.message ||
          'Une erreur est survenue lors du traitement du remboursement.',
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
  async update({ params, response, request, auth }: HttpContext) {
    const { id } = params
    try {
      const data = await request.validateUsing(validator.BillingsUpdate)

      const billing = await Billings.findByOrFail('id', id)

      billing.refBillingSupplier = data.refBillingSupplier ? data.refBillingSupplier : null
      billing.description = data.description
      billing.billingDate = data.billingDate
      billing.status = data.status
      billing.type = data.type

      await billing.save()

      if (data.status === BillingStatus.VALIDATE) {
        const items = await BillingItem.query().where('billingsId', billing.id)

        for (const item of items) {
          const stock = await Stock.query().where('productId', item.productId).first()

          if (stock) {
            if (stock.physicalQuantity < item.quantity) {
              throw new Error(`Insufficient stock for product ${item.productId}`)
            }
            await Movement.create({
              stockId: stock.id,
              title: `Vente du produit`,
              code: `POS-${billing.code}`,
              movementQuantity: `${item.quantity}`,
              movementType: MovementType.OUT,
              //@ts-ignore
              userId: auth.user!.id!,
              amount: item.quantity * item.price,
            })

            await stock
              .merge({
                physicalQuantity: stock.physicalQuantity - item.quantity,
                virtualQuantity: stock.virtualQuantity - item.quantity,
              })
              .save()
          }
        }
      }

      return await Billings.query()
        .where('id', id)
        //@ts-ignore
        .preload('user')
        //@ts-ignore
        .preload('thirdParties')
        //@ts-ignore
        .preload('billingItem')

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
    const product = await Product.findByOrFail('id', data.productId)
    const { billing, products, item } = await getBillingDetails(billingSelected.id)
    const customers = await ThirdParties.query().orderBy('created_at', 'desc')

    if (product.type === ProductType.PRODUCT) {
      const stock = await Stock.query().where('productId', data.productId).first()

      if (stock) {
        if (stock!.physicalQuantity < data.quantity) {
          return inertia.render(
            'billings/details/index',
            {
              billing,
              products,
              item,
              customers,
              csrfToken: request.csrfToken,
              message: 'Stock insuffisant pour ce produit',
            },
            { title: 'Détails' }
          )
        }
      }
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

    return inertia.render(
      'billings/details/index',
      { billing, products, item, customers, csrfToken: request.csrfToken, message: '' },
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

  async exportPdf({ request, response }: HttpContext) {
    try {
      const query = Billings.query() //@ts-ignore
        .preload('thirdParties')

      // Appliquer les mêmes filtres que dans la méthode billings
      const status = request.qs().status
      const customerId = request.qs().customerId
      const type = request.qs().type
      const dateFrom = request.qs().dateFrom
      const dateTo = request.qs().dateTo
      const amountMin = request.qs().amountMin
      const amountMax = request.qs().amountMax
      const reference = request.qs().reference

      if (status) {
        query.where('status', status)
      }

      if (customerId) {
        query.where('thirdPartiesId', customerId)
      }

      if (type) {
        query.where('type', type)
      }

      if (dateFrom) {
        query.where('billingDate', '>=', dateFrom)
      }

      if (dateTo) {
        query.where('billingDate', '<=', dateTo)
      }

      if (amountMin) {
        query.where('amountIncludingVat', '>=', amountMin)
      }

      if (amountMax) {
        query.where('amountIncludingVat', '<=', amountMax)
      }

      if (reference) {
        query.where('code', 'ilike', `%${reference}%`)
      }

      const billings = await query.orderBy('created_at', 'desc')

      // Récupérer le nom du client si un filtre est appliqué
      let customerName = null
      if (customerId) {
        const customer = await ThirdParties.find(customerId)
        if (customer) customerName = customer.name
      }

      // Créer le document PDF avec Promise
      return new Promise<void>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 })
        const buffers: Buffer[] = []

        doc.on('data', (chunk) => buffers.push(chunk))
        doc.on('end', () => {
          try {
            const pdfData = Buffer.concat(buffers)
            response.header('Content-Type', 'application/pdf')
            response.header(
              'Content-Disposition',
              `attachment; filename="factures_${DateTime.now().toFormat('yyyy-MM-dd')}.pdf"`
            )
            response.send(pdfData)
            resolve()
          } catch (error) {
            reject(error)
          }
        })
        doc.on('error', reject)

        // En-tête du document
        doc.fontSize(20).text('Liste des Factures', { align: 'center' })
        doc.moveDown()

        // Informations de filtrage
        const filterInfo: string[] = []
        if (status) filterInfo.push(`Statut: ${status}`)
        if (customerName) filterInfo.push(`Client: ${customerName}`)
        if (type) filterInfo.push(`Type: ${type}`)
        if (dateFrom) filterInfo.push(`Date début: ${dateFrom}`)
        if (dateTo) filterInfo.push(`Date fin: ${dateTo}`)
        if (amountMin) filterInfo.push(`Montant min: ${amountMin} FCFA`)
        if (amountMax) filterInfo.push(`Montant max: ${amountMax} FCFA`)
        if (reference) filterInfo.push(`Réf.: ${reference}`)

        if (filterInfo.length > 0) {
          doc.fontSize(10).text(`Filtres appliqués: ${filterInfo.join(', ')}`, { align: 'left' })
          doc.moveDown()
        }

        doc.fontSize(10).text(`Date d'export: ${DateTime.now().toFormat('dd/MM/yyyy HH:mm')}`, {
          align: 'left',
        })
        doc.fontSize(10).text(`Total: ${billings.length} facture(s)`, { align: 'left' })
        doc.moveDown(2)

        // Tableau des factures
        let yPosition = doc.y
        const startX = 50
        const colWidths = [80, 100, 100, 80, 100, 80]
        const headers = ['Réf.', 'Client', 'Date facturation', 'Montant TTC', 'Statut']

        // En-têtes du tableau
        doc.fontSize(10).font('Helvetica-Bold')
        let xPosition = startX
        headers.forEach((header, index) => {
          doc.text(header, xPosition, yPosition, { width: colWidths[index], align: 'left' })
          xPosition += colWidths[index] + 10
        })
        yPosition += 20

        // Ligne de séparation
        doc.moveTo(startX, yPosition).lineTo(550, yPosition).stroke()
        yPosition += 10

        // Données des factures
        doc.font('Helvetica')
        for (const billing of billings) {
          if (yPosition > 700) {
            // Nouvelle page si nécessaire
            doc.addPage()
            yPosition = 50
          }

          const billingDate = billing.billingDate
            ? DateTime.fromISO(billing.billingDate).toFormat('dd/MM/yyyy')
            : 'N/A'
          // const createdAt = billing.createdAt
          //   ? DateTime.fromJSDate(billing.createdAt.toJSDate()).toFormat('dd/MM/yyyy')
          //   : 'N/A'
          const amount = billing.amountIncludingVat
            ? `${Number.parseFloat(billing.amountIncludingVat)} FCFA`
            : '0 FCFA'

          const rowData = [
            billing.code || 'N/A',
            billing.thirdParties?.name || 'N/A',
            billingDate,
            amount,
            billing.status
              ? [
                  {
                    name: 'Brouillon (à valider)',
                    status: BillingStatus.DRAFT,
                    type: 'secondary',
                  },
                  {
                    name: 'Impayée',
                    status: BillingStatus.VALIDATE,
                    type: 'warning',
                  },
                  {
                    name: 'Abandonnée',
                    status: BillingStatus.ABANDONED,
                    type: 'danger',
                  },
                  {
                    name: 'Règlement commencé',
                    status: BillingStatus.BEGIN,
                    type: 'primary',
                  },
                  {
                    name: 'Payée (partiellement)',
                    status: BillingStatus.PAID_PARTIALLY,
                    type: 'info',
                  },
                  {
                    name: 'Payée',
                    status: BillingStatus.PAID,
                    type: 'success',
                  },
                  {
                    name: 'Avoir remboursée',
                    status: BillingStatus.CREDIT_BACK,
                    type: 'teal',
                  },
                ].find((item) => item.status === billing.status)?.name!
              : 'N/A',
          ]

          xPosition = startX
          rowData.forEach((data, index) => {
            doc.fontSize(9).text(data || 'N/A', xPosition, yPosition, {
              width: colWidths[index],
              align: 'left',
            })
            xPosition += colWidths[index] + 10
          })
          yPosition += 20
        }

        // Finaliser le PDF
        doc.end()
      })
    } catch (error) {
      console.log(error)
      return response.status(500).send({
        code: 'EXPORT_ERROR',
        message: 'Erreur lors de la génération du PDF',
      })
    }
  }
}
