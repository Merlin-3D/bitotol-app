import _, { isEmpty } from 'lodash'
import { DateTime } from 'luxon'

export const formatDateTime = (dateString: string, hours?: boolean) => {
  if (!isEmpty(dateString)) {
    const date = DateTime.fromISO(dateString)
    return hours ? date.toFormat('dd/MM/yyyy HH:mm') : date.toFormat('dd/MM/yyyy')
  }

  return ''
}
