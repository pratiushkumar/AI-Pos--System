import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ShoppingCart, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '@/Redux Toolkit/features/auth/authThunk'
import { getUserProfile } from '../../../Redux Toolkit/features/user/userThunks'
import { startShift } from '../../../Redux Toolkit/features/shiftReport/shiftReportThunks'
import { ThemeToggle } from '../../../components/theme-toggle'
import { forgotPassword } from '../../../Redux Toolkit/features/auth/authThunk'
import backgroundVideo from '../../../assets/137243-766338213_medium.mp4'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [forgotEmail, setForgotEmail] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { error, loading } = useSelector((state) => state.auth)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const resultAction = await dispatch(login(formData))
      if (login.fulfilled.match(resultAction)) {
        toast({
          title: "Success",
          description: "Login successful!",
        })

        const user=resultAction.payload.user;

        console.log('Login success:', resultAction.payload.user.role)
        dispatch(getUserProfile(resultAction.payload.jwt)); 
        
        
        // Redirect based on user role
        const userRole = user.role
        if (userRole === 'ROLE_BRANCH_CASHIER') {
          navigate('/cashier')
          dispatch(startShift(user.branchId))
        
        } else if (userRole === 'ROLE_STORE_ADMIN' || userRole === 'ROLE_STORE_MANAGER') {
          navigate('/store')
        } else if (userRole === 'ROLE_BRANCH_MANAGER' || userRole === 'ROLE_BRANCH_ADMIN') {
          navigate('/branch')
        } else {
          // Unknown role, redirect to landing page
          navigate('/')
        }
      } else {
        toast({
          title: "Error",
          description: resultAction.payload || 'Login failed',
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || 'Login failed',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()

    try {
      const resultAction = await dispatch(forgotPassword(forgotEmail))
       if (forgotPassword.fulfilled.match(resultAction)) {
        toast({
          title: "Success",
          description: "Password reset email sent!",
        })
      }else{
        console.log("error", error)
        toast({
        title: "Error",
        description: error || 'Failed to send reset email',
        variant: "destructive",
      })
      }
    } catch (error) {
      console.log("error", error)
      toast({
        title: "Error",
        description: error || 'Failed to send reset email',
        variant: "destructive",
      })
      return
    }

    
    
  }

  const resetForgotPassword = () => {
    setShowForgotPassword(false)
    setEmailSent(false)
    setForgotEmail('')
  }

  return (
    <div className="relative flex min-h-screen text-foreground overflow-hidden">
      {/* Background Video */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source src={backgroundVideo} type="video/mp4" />
      </video>

      {/* Right side is completely unobstructed video! */}

      {/* Left Side: Transparent Glass Form Container */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 sm:p-16 relative z-10 bg-black/40 dark:bg-black/60 backdrop-blur-xl border-r border-white/20 shadow-2xl">
        
        {/* Top Header & Navigation */}
        <div className="flex justify-between items-center bg-transparent">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <ShoppingCart className="w-8 h-8 text-[#1F811F]" />
            <span className="text-2xl font-bold tracking-tight text-[#1F811F]">Pos ai</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Home
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Form Center Wrapper */}
        <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center py-10">
          
          {/* Email Sent Success */}
          {emailSent ? (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#1F811F]" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Check Your Email</h3>
              <p className="text-muted-foreground mb-8 text-lg">
                We've sent password reset instructions to <strong>{forgotEmail}</strong>
              </p>
              <div className="space-y-4">
                <Button onClick={resetForgotPassword} className="w-full h-12 text-lg bg-[#1F811F] hover:bg-[#186618] shadow-lg">
                  Back to Log In
                </Button>
                <p className="text-sm text-foreground/80">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button onClick={() => setEmailSent(false)} className="text-[#1F811F] hover:underline font-semibold">
                    try again
                  </button>
                </p>
              </div>
            </div>
          ) : showForgotPassword ? (
            /* Forgot Password Form */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-semibold mb-8">Reset Password</h1>
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div>
                  <Input
                    type="email"
                    id="forgot-email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="h-14 px-4 text-base focus-visible:ring-[#1F811F] transition-all bg-background/30 backdrop-blur-sm border-foreground/20 shadow-inner placeholder:text-foreground/50"
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="flex space-x-3 mt-8">
                  <Button type="button" variant="outline" className="flex-1 h-12 text-base border-foreground/20 bg-background/50 hover:bg-background/80" onClick={resetForgotPassword}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 h-12 text-base bg-[#1F811F] hover:bg-[#186618] text-white shadow-lg" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            /* Login Form */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-[2.5rem] font-semibold mb-8 text-foreground drop-shadow-sm">Log in</h1>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-14 px-4 text-base focus-visible:ring-[#1F811F] transition-all bg-background/30 backdrop-blur-sm border-foreground/20 shadow-inner placeholder:text-foreground/50 hover:bg-background/40"
                    placeholder="Email"
                    required
                  />
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-14 px-4 pr-12 text-base focus-visible:ring-[#1F811F] transition-all bg-background/30 backdrop-blur-sm border-foreground/20 shadow-inner placeholder:text-foreground/50 hover:bg-background/40"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-foreground/60 hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-medium bg-[#1F811F] hover:bg-[#186618] text-white transition-all shadow-[0_8px_30px_rgb(31,129,31,0.3)] hover:shadow-[0_8px_30px_rgb(31,129,31,0.5)] mt-2 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Log In'
                  )}
                </Button>
              </form>

              {/* Extras */}
              <div className="mt-8 text-[15px]">
                <span className="text-foreground/80">New user or forgot your password? </span>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline inline-block font-medium drop-shadow-sm"
                >
                  Access your account
                </button>
              </div>

              {/* Divider */}
              <div className="mt-10 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-foreground/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-transparent text-foreground/70 tracking-wide">Or continue with</span>
                </div>
              </div>

              {/* Social Logins */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center gap-2 hover:bg-background/90 font-medium border-foreground/20 bg-background/50 shadow-sm backdrop-blur-sm"
                  onClick={() => window.location.href = "http://localhost:5000/oauth2/authorization/google"}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center gap-2 hover:bg-background/90 font-medium border-foreground/20 bg-background/50 shadow-sm backdrop-blur-sm"
                  onClick={() => window.location.href = "http://localhost:5000/oauth2/authorization/github"}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  GitHub
                </Button>
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-12 flex items-center justify-center gap-2 text-foreground/80 hover:text-foreground hover:bg-background/60"
                  onClick={() => toast({ title: "OTP Mode", description: "Email OTP feature arriving soon!" })}
                >
                  <Mail className="w-4 h-4" />
                  Continue with Email OTP
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-foreground/70 text-center space-y-3">
          <p className="max-w-xs mx-auto drop-shadow-sm">
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a> and{' '}
            <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> apply.
          </p>
          <div className="flex justify-center items-center space-x-6 drop-shadow-sm">
            <a href="#" className="flex items-center hover:text-foreground transition-colors">
              <span className="mr-2 text-base">🇺🇸</span> United States (English)
            </a>
            <a href="#" className="hover:text-foreground transition-colors">Help Center</a>
          </div>
        </div>
        
      </div>

      {/* Right Side: Completely Empty and Transparent to allow unhindered view of the background video */}
      {/* Right Side: Completely Empty and Transparent to allow unhindered view of the background video */}
      <div className="hidden lg:block lg:w-1/2 relative bg-black/40 dark:bg-black/60 backdrop-blur-xl border-l border-white/10 shadow-2xl pointer-events-none"></div>

    </div>
  )
}

export default Login 