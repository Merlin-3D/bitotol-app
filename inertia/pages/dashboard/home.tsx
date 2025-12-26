import AdminLayout from '../layouts/layout'
import { Link, router } from '@inertiajs/react'
import {
  formatDateTime,
  formatNumber,
  getDaysUntilExpiration,
  getExpirationStyle,
  billingStatus,
} from '../utils/common'
import Badge from '~/components/badge'
import Button from '~/components/button'
import { ProductResponse, BillingResponse } from '../utils/entities'
import { AlertTwotone, EyeIcon, ProductIcon, InvoiceIcon } from '~/components/icons'
import _ from 'lodash'

interface DashboardProps {
  stats: {
    totalProducts: number
    totalCustomers: number
    totalBillings: number
    totalWarehouses: number
    totalBillingAmount: number
  }
  alerts: {
    outOfStockProducts: ProductResponse[]
    lowStockProducts: ProductResponse[]
    expiredProducts: ProductResponse[]
    expiringSoonProducts: ProductResponse[]
  }
  recentBillings: BillingResponse[]
}

export default function Home({ stats, alerts, recentBillings }: DashboardProps) {
  const totalAlerts =
    alerts.outOfStockProducts.length +
    alerts.lowStockProducts.length +
    alerts.expiredProducts.length +
    alerts.expiringSoonProducts.length

  return (
    <AdminLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Produits & Services</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <ProductIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Factures</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBillings}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <InvoiceIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Emplacements</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWarehouses}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg
                  className="h-8 w-8 text-orange-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatNumber(stats.totalBillingAmount)} FCFA
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Alertes */}
        {totalAlerts > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTwotone className="h-6 w-6 text-red-500" />
                Alertes ({totalAlerts})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Produits en rupture de stock */}
              {alerts.outOfStockProducts.length > 0 && (
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-red-700 mb-2">
                    Produits en rupture de stock ({alerts.outOfStockProducts.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.outOfStockProducts.map((product) => {
                      const totalQuantity = _.sumBy(product.stocks, 'virtualQuantity')
                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 bg-red-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <ProductIcon className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">{product.name}</span>
                          </div>
                          <span className="text-sm text-red-600 font-semibold">
                            Stock: {totalQuantity}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {alerts.outOfStockProducts.length >= 10 && (
                    <Button
                      label="Voir tous"
                      color="secondary"
                      onClick={() => router.visit('/dashboard/products')}
                      className="mt-2"
                    />
                  )}
                </div>
              )}

              {/* Produits avec stock faible */}
              {alerts.lowStockProducts.length > 0 && (
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="font-semibold text-orange-700 mb-2">
                    Rupture de stock ({alerts.lowStockProducts.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.lowStockProducts.map((product) => {
                      const totalQuantity = _.sumBy(product.stocks, 'virtualQuantity')
                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 bg-orange-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <ProductIcon className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">{product.name}</span>
                          </div>
                          <span className="text-sm text-orange-600 font-semibold">
                            Stock: {totalQuantity}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {alerts.lowStockProducts.length >= 10 && (
                    <Button
                      label="Voir tous"
                      color="secondary"
                      onClick={() => router.visit('/dashboard/products')}
                      className="mt-2"
                    />
                  )}
                </div>
              )}

              {/* Produits expirés */}
              {alerts.expiredProducts.length > 0 && (
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-red-700 mb-2">
                    Produits expirés ({alerts.expiredProducts.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.expiredProducts.map((product) => {
                      const daysUntilExpiration = getDaysUntilExpiration(product.expiredAt)
                      const expirationStyle = getExpirationStyle(daysUntilExpiration)
                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 bg-red-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <ProductIcon className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-medium">{product.name}</span>
                          </div>
                          <Badge type={expirationStyle.badge as any} text={expirationStyle.text} />
                        </div>
                      )
                    })}
                  </div>
                  {alerts.expiredProducts.length >= 10 && (
                    <Button
                      label="Voir tous"
                      color="secondary"
                      onClick={() => router.visit('/dashboard/products')}
                      className="mt-2"
                    />
                  )}
                </div>
              )}

              {/* Produits proches de l'expiration */}
              {alerts.expiringSoonProducts.length > 0 && (
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h3 className="font-semibold text-yellow-700 mb-2">
                    Expiration proche ({alerts.expiringSoonProducts.length})
                  </h3>
                  <div className="space-y-2">
                    {alerts.expiringSoonProducts.map((product) => {
                      const daysUntilExpiration = getDaysUntilExpiration(product.expiredAt)
                      const expirationStyle = getExpirationStyle(daysUntilExpiration)
                      return (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 bg-yellow-50 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <ProductIcon className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm font-medium">{product.name}</span>
                          </div>
                          <Badge type={expirationStyle.badge as any} text={expirationStyle.text} />
                        </div>
                      )
                    })}
                  </div>
                  {alerts.expiringSoonProducts.length >= 10 && (
                    <Button
                      label="Voir tous"
                      color="secondary"
                      onClick={() => router.visit('/dashboard/products')}
                      className="mt-2"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Factures récentes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <InvoiceIcon className="h-6 w-6" />
              Factures récentes
            </h2>
            <Button
              label="Voir toutes"
              color="secondary"
              onClick={() => router.visit('/dashboard/billings')}
            />
          </div>

          {recentBillings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réf.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBillings.map((billing) => (
                    <tr key={billing.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link href={`/dashboard/billings/${billing.id}`}>{billing.code}</Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {billing.thirdParties?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(billing.billingDate || billing.createdAt, false)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(Number(billing.amountIncludingVat || 0))} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex item-start">
                          <Badge
                            type={
                              billingStatus.find((item) => item.status === billing.status)
                                ?.type as any
                            }
                            text={
                              billingStatus.find((item) => item.status === billing.status)?.name ||
                              billing.status
                            }
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          label=""
                          color="info"
                          onClick={() => router.visit(`/dashboard/billings/${billing.id}`)}
                          icon={<EyeIcon className="h-4 w-4" />}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Aucune facture récente</p>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
