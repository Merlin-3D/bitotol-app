import { Head, router, useForm, usePage } from '@inertiajs/react'
import { isArray, isEmpty } from 'lodash'
import Alert from '~/components/alert'
import Input from '~/components/input'
import logoBlack from '~/assets/logo/logo_black.png'

export default function Home() {
  const { props } = usePage<{ params: { [key: string]: string } }>()

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    password: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/login', {
      preserveScroll: true,
    })
  }


  return (
    <>
      <Head title="Login" />

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-12">
        {/* Logo et titre */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-20 w-20 rounded-xl flex items-center justify-center">
            <a href="/" className="flex items-center text-gray-900">
              <img src={logoBlack} alt="" className="h-full w-full" />
            </a>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Accédez à votre espace d’administration sécurisé
          </p>
        </div>

        {!isEmpty(props.error) &&
          !isArray(props.error) &&
          ((props.error as any).code === 'E_INVALID_CREDENTIALS' ? (
            <Alert type="error" className="mb-4" message={'Email ou mot de passe incorrect.'} />
          ) : (props.error as any).code === 'E_RUNTIME_EXCEPTION' ? (
            <Alert type="error" className="mb-4" message={'Erreur lors de la connexion.'} />
          ) : (
            <Alert type="error" className="mb-4" message={props.error as any} />
          ))}

        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Votre nom
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="email"
                required
                className={`block w-full px-4 py-2 border ${
                  errors.name ? 'border-red-400' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-[#288FC4] focus:border-[#288FC4] sm:text-sm text-gray-900`}
                placeholder="Votre nom"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`block w-full px-4 py-2 border ${
                  errors.password ? 'border-red-400' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-[#288FC4] focus:border-[#288FC4] sm:text-sm text-gray-900`}
                placeholder="********"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={processing}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-500 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                Se connecter
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} Kaisen. — Tous droits réservés
        </p>
      </div>
    </>
  )
}
