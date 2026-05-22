import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-8 border rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-2">เข้าสู่ระบบ</h1>
        <p className="text-muted-foreground text-sm mb-6">ยินดีต้อนรับกลับมา</p>
        <AuthForm mode="login" />
      </div>
    </div>
  )
}
