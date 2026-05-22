import { AuthForm } from '@/components/auth/AuthForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm p-8 border rounded-xl shadow-sm">
        <h1 className="text-2xl font-bold mb-2">สมัครสมาชิก</h1>
        <p className="text-muted-foreground text-sm mb-6">เริ่มจัดการแผนของคุณ</p>
        <AuthForm mode="register" />
      </div>
    </div>
  )
}
