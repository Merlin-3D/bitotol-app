import Billings from '#models/billings'
import Movement from '#models/movement'
import Product from '#models/product'
import Stock from '#models/stock'
import ThirdParties from '#models/third_parties'
import Warehouses from '#models/warehouses'
import { getBillingDetails, getProductsList, getWarehouseList } from '#services/common'
import type { HttpContext } from '@adonisjs/core/http'
import _ from 'lodash'
import { DateTime } from 'luxon'
import PDFDocument from 'pdfkit'
import { BillingStatus } from '#models/enum/product_enum'

export default class WebController {
  async login({ inertia }: HttpContext) {
    return inertia.render('home', {}, { title: 'Login' })
  }

  async dashboard({ inertia }: HttpContext) {
    // Statistiques générales
    const totalProducts = await Product.query().count('* as total')
    const totalCustomers = await ThirdParties.query().count('* as total')
    const totalBillings = await Billings.query().count('* as total')
    const totalWarehouses = await Warehouses.query().count('* as total')

    // Calculer le montant total des factures (exclure Draft et Abandoned)
    const billings = await Billings.query()
      .whereNot('status', BillingStatus.DRAFT)
      .whereNot('status', BillingStatus.ABANDONED)
    const totalBillingAmount = billings.reduce((sum, billing) => {
      const amount = billing.amountIncludingVat ? Number.parseFloat(billing.amountIncludingVat) : 0
      return sum + amount
    }, 0)

    // Produits en rupture de stock
    const allProducts = await getProductsList()
    const outOfStockProducts = allProducts.filter((product) => {
      if (product.type !== 'P') return false // Seulement les produits, pas les services
      const totalQuantity = _.sumBy(product.stocks, 'virtualQuantity')
      const limitStock = product.limitStockAlert ? product.limitStockAlert : 0
      return totalQuantity <= limitStock && totalQuantity > 0
    })

    // Produits avec stock faible (inférieur à la limite d'alerte)
    const lowStockProducts = allProducts.filter((product) => {
      if (product.type !== 'P') return false
      const totalQuantity = _.sumBy(product.stocks, 'virtualQuantity')
      const limitStock = product.limitStockAlert ? product.limitStockAlert : 0
      return totalQuantity > 0 && totalQuantity <= limitStock * 1.2 && totalQuantity > limitStock
    })

    // Produits expirés ou proches de l'expiration
    const today = DateTime.now()
    const expiredProducts = allProducts.filter((product) => {
      if (!product.expiredAt) return false
      const expirationDate = DateTime.fromISO(product.expiredAt)
      return expirationDate < today
    })

    const expiringSoonProducts = allProducts.filter((product) => {
      if (!product.expiredAt) return false
      const expirationDate = DateTime.fromISO(product.expiredAt)
      const daysUntilExpiration = expirationDate.diff(today, 'days').days
      return daysUntilExpiration >= 0 && daysUntilExpiration <= 30
    })

    // Factures récentes (dernières 30 jours)
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 })
    const recentBillings = await Billings.query()
      .where('created_at', '>=', thirtyDaysAgo.toISO()!)
      .orderBy('created_at', 'desc')
      .limit(10)
      //@ts-ignore
      .preload('thirdParties')

    return inertia.render(
      'dashboard/home',
      {
        stats: {
          totalProducts: totalProducts[0].$extras.total,
          totalCustomers: totalCustomers[0].$extras.total,
          totalBillings: totalBillings[0].$extras.total,
          totalWarehouses: totalWarehouses[0].$extras.total,
          totalBillingAmount,
        },
        alerts: {
          outOfStockProducts: outOfStockProducts.slice(0, 10),
          lowStockProducts: lowStockProducts.slice(0, 10),
          expiredProducts: expiredProducts.slice(0, 10),
          expiringSoonProducts: expiringSoonProducts.slice(0, 10),
        },
        recentBillings,
      },
      { title: 'Dashboard' }
    )
  }

  async customers({ inertia, request }: HttpContext) {
    const query = ThirdParties.query()

    // Filtre de recherche
    const search = request.qs().search

    if (search) {
      query.where((queryData) => {
        queryData
          .where('name', 'ilike', `%${search}%`)
          .orWhere('client_code', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`)
          .orWhere('phone', 'ilike', `%${search}%`)
      })
    }

    const customers = await query.orderBy('created_at', 'desc')
    return inertia.render('customers/index', { customers }, { title: 'Clients' })
  }

  async customersDetails({ inertia }: HttpContext) {
    return inertia.render('customers/details/index', {}, { title: 'Détails' })
  }

  async warehouses({ inertia }: HttpContext) {
    const warehouses = await getWarehouseList()

    return inertia.render('warehouse/index', { warehouses }, { title: 'Emplacement' })
  }

  async warehousesDetails({ params, inertia }: HttpContext) {
    const { id } = params

    const warehouse = await Warehouses.query().where('id', id).first()

    if (!warehouse) {
      return inertia.render(
        'warehouse/details/index',
        { warehouse, movements: [] },
        { title: 'Emplacement' }
      )
    }

    const stocks = await Stock.query()
      .where('warehousesId', warehouse.id)
      //@ts-ignore
      .preload('product')

    const movements = await Movement.query()
      .innerJoin('stocks', 'movements.stock_id', 'stocks.id')
      .where('stocks.warehouses_id', id)
      //@ts-ignore
      .preload('stock', (stockQuery) => {
        //@ts-ignore
        stockQuery.preload('product')
      })

    return inertia.render(
      'warehouse/details/index',
      { warehouse: { ...warehouse.$original, stocks }, movements },
      { title: 'Emplacement' }
    )
  }

  async products({ inertia, request }: HttpContext) {
    const query = Product.query()
      //@ts-ignore
      .preload('warehouse')
      //@ts-ignore
      .preload('user')

    // Filtres
    const type = request.qs().type
    const warehouseId = request.qs().warehouseId
    const search = request.qs().search

    if (type) {
      query.where('type', type)
    }

    if (warehouseId) {
      query.where('warehousesId', warehouseId)
    }

    if (search) {
      query.where((queryData) => {
        queryData.where('name', 'ilike', `%${search}%`).orWhere('reference', 'ilike', `%${search}%`)
      })
    }

    const productsFind = await query.orderBy('created_at', 'desc')

    let products: any[] = []

    if (productsFind) {
      for (const product of productsFind) {
        const stocks = await Stock.query()
          .where('productId', product.id)
          //@ts-ignore
          .preload('warehouse')

        products = [
          ...products,
          {
            ...product.$original,
            ...product.$preloaded,
            stocks,
          },
        ]
      }
    }

    const warehouses = await getWarehouseList()

    return inertia.render('products/index', { products, warehouses }, { title: 'Produits' })
  }

  async productsDetails({ params, inertia }: HttpContext) {
    const { id } = params

    const product = await Product.query()
      .where('id', id)
      .preload('warehouse')
      //@ts-ignore
      .preload('user')
      .first()

    const stocks = await Stock.query()
      .where('productId', id)
      //@ts-ignore
      .preload('warehouse')

    // Calculer le PMP et la valorisation d'achat pour chaque stock
    const stocksWithPMP = await Promise.all(
      stocks.map(async (stock) => {
        const stockHistory = await Stock.query()
          .where('productId', id)
          .where('warehousesId', stock.warehousesId) // Filtrer par le même entrepôt
          //@ts-ignore
          .where('createdAt', '<=', stock.createdAt) // Inclure uniquement les stocks jusqu'à la date de création actuelle
          .orderBy('createdAt', 'asc') // Trier par date de création pour un calcul correct

        let totalWeightedPrice = 0
        let totalQuantity = 0

        stockHistory.forEach((sh) => {
          totalWeightedPrice += sh.unitPurchasePrice * sh.physicalQuantity
          totalQuantity += sh.physicalQuantity
        })

        const pmp = totalQuantity ? totalWeightedPrice / totalQuantity : 0

        // Calculer la valorisation d'achat
        const valorisationAchat = stock.physicalQuantity * stock.unitPurchasePrice

        return {
          ...stock.toJSON(),
          pmp, // Ajouter le PMP à chaque entrée de stock
          valorisationAchat, // Ajouter la valorisation d'achat à chaque entrée de stock
        }
      })
    )

    let movements: any[] = []

    for (const element of _.map(stocks, 'id')) {
      const item = await Movement.query()
        .where('stockId', element)
        //@ts-ignore
        .preload('user')

      movements = [...movements, ...item]
    }
    const warehouses = await getWarehouseList()

    return inertia.render(
      'products/details/index',
      {
        product,
        warehouses,
        movements: _.orderBy(_.flattenDeep(movements), ['createdAt'], ['desc']),
        stocks: stocksWithPMP,
      },
      { title: 'Produit' }
    )
  }

  async stocks({ inertia }: HttpContext) {
    const products = await getProductsList()

    return inertia.render('stocks/index', { products }, { title: 'Produits' })
  }

  async movements({ inertia }: HttpContext) {
    const movements = await Movement.query()
      .orderBy('movements.updated_at', 'desc')
      .innerJoin('stocks', 'movements.stock_id', 'stocks.id')
      //@ts-ignore
      .preload('stock', (stockQuery) => {
        //@ts-ignore
        stockQuery.preload('product')
      })

    return inertia.render('movement/index', { movements }, { title: 'Movement' })
  }

  async billings({ inertia, request }: HttpContext) {
    const query = Billings.query() //@ts-ignore
      .preload('thirdParties')

    // Filtres
    const status = request.qs().status
    const customerId = request.qs().customerId
    const type = request.qs().type
    const dateFrom = request.qs().dateFrom
    const dateTo = request.qs().dateTo
    const amountMin = request.qs().amountMin
    const amountMax = request.qs().amountMax

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

    const billings = await query.orderBy('created_at', 'desc')
    const customers = await ThirdParties.query().orderBy('created_at', 'desc')

    return inertia.render('billings/index', { billings, customers }, { title: 'Billings' })
  }

  async billingDetails({ params, inertia, request }: HttpContext) {
    const { id } = params
    const customers = await ThirdParties.query().orderBy('created_at', 'desc')
    const { billing, products, item } = await getBillingDetails(id)
    return inertia.render(
      'billings/details/index',
      { billing, products, item, customers, csrfToken: request.csrfToken },
      { title: 'Détails' }
    )
  }

  async inventory({ inertia, request }: HttpContext) {
    const query = Stock.query()
      //@ts-ignore
      .preload('product')
      //@ts-ignore
      .preload('warehouse')

    // Filtres
    const dateFrom = request.qs().dateFrom
    const dateTo = request.qs().dateTo
    const warehouseId = request.qs().warehouseId

    if (dateFrom) {
      query.where('created_at', '>=', dateFrom)
    }

    if (dateTo) {
      query.where('created_at', '<=', dateTo)
    }

    if (warehouseId) {
      query.where('warehousesId', warehouseId)
    }

    const stocks = await query.orderBy('created_at', 'desc')

    // Formater les données pour l'inventaire
    const inventory = stocks.map((stock) => ({
      id: stock.id,
      productId: stock.productId,
      warehousesId: stock.warehousesId,
      product: stock.product,
      warehouse: stock.warehouse,
      physicalQuantity: stock.physicalQuantity,
      virtualQuantity: stock.virtualQuantity,
      unitPurchasePrice: stock.unitPurchasePrice,
      createdAt: stock.createdAt.toISO()!,
      updatedAt: stock.updatedAt?.toISO() || stock.createdAt.toISO()!,
    }))

    const warehouses = await getWarehouseList()

    return inertia.render('inventory/index', { inventory, warehouses }, { title: 'Inventaire' })
  }

  async exportInventoryPdf({ request, response }: HttpContext) {
    try {
      const query = Stock.query()
        //@ts-ignore
        .preload('product')
        //@ts-ignore
        .preload('warehouse')

      // Filtres
      const dateFrom = request.qs().dateFrom
      const dateTo = request.qs().dateTo
      const warehouseId = request.qs().warehouseId

      if (dateFrom) {
        query.where('created_at', '>=', dateFrom)
      }

      if (dateTo) {
        query.where('created_at', '<=', dateTo)
      }

      if (warehouseId) {
        query.where('warehousesId', warehouseId)
      }

      const stocks = await query.orderBy('created_at', 'desc')

      // Récupérer le nom de l'emplacement si un filtre est appliqué
      let warehouseName = null
      if (warehouseId) {
        const warehouse = await Warehouses.find(warehouseId)
        if (warehouse) warehouseName = warehouse.name
      }

      // Créer le document PDF avec Promise
      return new Promise<void>((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 })
        const buffers: Buffer[] = []

        doc.on('data', (chunk: Buffer) => buffers.push(chunk))
        doc.on('end', () => {
          try {
            const pdfData = Buffer.concat(buffers)
            response.header('Content-Type', 'application/pdf')
            response.header(
              'Content-Disposition',
              `attachment; filename="inventaire_${DateTime.now().toFormat('yyyy-MM-dd')}.pdf"`
            )
            response.send(pdfData)
            resolve()
          } catch (error) {
            reject(error)
          }
        })
        doc.on('error', reject)

        // En-tête du document
        doc.fontSize(20).text("Fiche d'Inventaire", { align: 'center' })
        doc.moveDown()

        // Informations de filtrage
        const filterInfo: string[] = []
        if (warehouseName) filterInfo.push(`Emplacement: ${warehouseName}`)
        if (dateFrom) filterInfo.push(`Date début: ${dateFrom}`)
        if (dateTo) filterInfo.push(`Date fin: ${dateTo}`)

        if (filterInfo.length > 0) {
          doc.fontSize(10).text(`Filtres appliqués: ${filterInfo.join(', ')}`, { align: 'left' })
          doc.moveDown()
        }

        doc.fontSize(10).text(`Date d'export: ${DateTime.now().toFormat('dd/MM/yyyy HH:mm')}`, {
          align: 'left',
        })
        doc.fontSize(10).text(`Total: ${stocks.length} article(s)`, { align: 'left' })
        doc.moveDown(2)

        // Calculer les totaux
        const totalValue = stocks.reduce(
          (sum, stock) => sum + stock.physicalQuantity * stock.unitPurchasePrice,
          0
        )
        const totalPhysicalQuantity = stocks.reduce((sum, stock) => sum + stock.physicalQuantity, 0)

        // Résumé
        doc.fontSize(12).font('Helvetica-Bold').text('Résumé', { align: 'left' })
        doc.font('Helvetica').fontSize(10)
        doc.text(`Nombre d'articles: ${stocks.length}`, { align: 'left' })
        doc.text(`Quantité totale physique: ${totalPhysicalQuantity}`, { align: 'left' })
        doc.text(`Valeur totale: ${totalValue} FCFA`, { align: 'left' })
        doc.moveDown(2)

        // Tableau de l'inventaire
        let yPosition = doc.y
        const startX = 50
        const colWidths = [100, 100, 80, 80, 80, 100]
        const headers = [
          'Produit',
          'Emplacement',
          'Qté Physique',
          'Qté Virtuelle',
          'Prix unit.',
          'Totale',
        ]

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

        // Données de l'inventaire
        doc.font('Helvetica')
        for (const stock of stocks) {
          if (yPosition > 700) {
            // Nouvelle page si nécessaire
            doc.addPage()
            yPosition = 50
          }

          const totalValueItem = stock.physicalQuantity * stock.unitPurchasePrice

          const rowData = [
            stock.product?.name || 'N/A',
            stock.warehouse?.name || 'N/A',
            stock.physicalQuantity.toString(),
            stock.virtualQuantity.toString(),
            `${stock.unitPurchasePrice} FCFA`,
            `${totalValueItem} FCFA`,
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
