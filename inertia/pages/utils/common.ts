import { ProductType } from '#models/enum/product_enum'
import _, { isEmpty } from 'lodash'
import { DateTime } from 'luxon'

export const formatDateTime = (dateString: string, hours?: boolean) => {
  if (!isEmpty(dateString)) {
    const date = DateTime.fromISO(dateString)
    return hours ? date.toFormat('dd/MM/yyyy HH:mm') : date.toFormat('dd/MM/yyyy')
  }

  return ''
}

export function formatNumber(value: number): string {
  if (value) {
    return new Intl.NumberFormat('fr-FR').format(value)
  }
  return '0'
}

export const getDaysUntilExpiration = (expiredAt: string | null | undefined): number | null => {
  if (!expiredAt) return null

  const expirationDate = new Date(expiredAt)
  const today = new Date()
  const diffTime = expirationDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Fonction pour déterminer le style en fonction des jours restants
export const getExpirationStyle = (days: number | null) => {
  if (days === null) return { badge: 'default', text: 'N/A', color: 'gray' }
  if (days <= 0) return { badge: 'danger', text: 'Expiré', color: 'red' }
  if (days <= 7) return { badge: 'danger', text: `${days}j`, color: 'red' }
  if (days <= 30) return { badge: 'warning', text: `${days}j`, color: 'orange' }
  return { badge: 'success', text: `${days}j`, color: 'green' }
}

export const productType = [
  {
    name: 'PRODUIT',
    value: ProductType.PRODUCT,
  },
  {
    name: 'SERVICE',
    value: ProductType.SERVICE,
  },
]

export const movementType = [
  {
    name: 'Ajouter',
    value: 'enter',
  },
  {
    name: 'Rétirer',
    value: 'out',
  },
  {
    name: 'Origine',
    value: 'reception',
  },
  {
    name: 'Origine',
    value: 'reception-out',
  },
  {
    name: 'Origine',
    value: 'shipping-create',
  },
  {
    name: 'Origine',
    value: 'shipping',
  },
  {
    name: 'Origine',
    value: 'shipping-cancel',
  },
]
