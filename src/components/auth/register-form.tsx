import * as React from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils.js"
import { Button } from "@/components/ui/button.js"
import { Input } from "@/components/ui/input.js"
import { Label } from "@/components/ui/label.js"
import { Icons } from "@/components/ui/icons.js"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "http://localhost:54321"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface RegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RegisterForm({ className, ...props }: RegisterFormProps) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  })

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      // Register with Supabase
      const { error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: "USER" // Default role for new users
          }
        }
      })

      if (signUpError) {
        setError(signUpError.message || "Registration failed. Please try again.")
      } else {
        // Create user profile
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Insert into profiles table
          const { error: profileError } = await supabase.from("profiles").insert([
            {
              id: user.id,
              full_name: formData.fullName,
              email: formData.email,
              updated_at: new Date().toISOString()
            }
          ])
          
          if (profileError) {
            console.error("Error creating profile:", profileError)
          }
        }
        
        // Success - navigate to login page with success message
        navigate("/login?registered=true")
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              value={formData.fullName}
              onChange={handleInputChange}
              data-testid="fullname-input"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={formData.email}
              onChange={handleInputChange}
              data-testid="email-input"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={isLoading}
              value={formData.password}
              onChange={handleInputChange}
              data-testid="password-input"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={isLoading}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              data-testid="confirm-password-input"
              required
            />
          </div>
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="register-button"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Account
          </Button>
        </div>
      </form>
    </div>
  )
}
