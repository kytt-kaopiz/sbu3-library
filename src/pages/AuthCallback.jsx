import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store'

export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { setToken, fetchMe, toast } = useStore()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setToken(token)
      fetchMe().then(() => {
        toast('Đăng nhập thành công! 🎉')
        navigate('/dashboard')
      })
    } else {
      toast('Đăng nhập thất bại', 'error')
      navigate('/')
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500">Đang xử lý đăng nhập...</p>
    </div>
  )
}
