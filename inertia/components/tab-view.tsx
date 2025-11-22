import classNames from 'classnames'
import Spinner from './spinner'

export interface TabHeader {
  value: string | number
  label: string
}

interface TabViewProps {
  currentValue: string | number
  headers: TabHeader[]
  loading?: boolean
  tabList: { [key: string]: React.ReactNode }
  onChange: (value: TabHeader) => void
}

export default function TabView({
  currentValue,
  headers,
  loading,
  tabList,
  onChange,
}: TabViewProps) {
  return (
    <div className="h-full">
      <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200">
        <ul className="flex flex-wrap -mb-px">
          {headers.map((header) => {
            return (
              <li className="me-2" key={header.value}>
                <span
                  onClick={() => onChange(header)}
                  className={classNames(
                    header.value === currentValue ? `text-green-600 border-green-600` : '',
                    'inline-block p-4 border-b-2 cursor-pointer rounded-t-lg active'
                  )}
                  aria-current="page"
                >
                  {header.label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="px-4 py-3 lg:h-[calc(100%-40px)] overflow-auto ">
        {loading ? (
          <div className="flex flex-row justify-center items-center h-full">
            <Spinner size="xl" />
          </div>
        ) : (
          Object.keys(tabList).map((key) => {
            if (currentValue === key) {
              return tabList[currentValue]
            }
          })
        )}
      </div>
    </div>
  )
}
