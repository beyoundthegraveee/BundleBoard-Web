"use client"

import * as React from "react"
import { X, Trash2, ArrowRight, ShoppingBag, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

interface CartItem {
  id: string
  name: string
  price: number
  category: string
  previewImage: string
}

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { data: session } = useSession()
  const [cartItems, setCartItems] = React.useState<CartItem[]>([])
  const [isRedirecting, setIsRedirecting] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("bundleboard_cart")
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("❌ Failed to parse cart data from localStorage:", error)
        }
      }
    }
  }, [isOpen])

  const total = cartItems.reduce((sum, item) => sum + item.price, 0)

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem("bundleboard_cart", JSON.stringify(updatedCart))
    window.dispatchEvent(new Event("cart_updated"))
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isRedirecting) return
    if (!session || !(session as any).accessToken) {
      alert("Please sign in to proceed with your purchase.")
      return
    }

    setIsRedirecting(true)
    
    try {
      const currentSession = session as any;
      
      const input = {
        userId: parseInt(currentSession.user?.id, 10),
        currency: "USD",
        collectionIds: cartItems.map(item => parseInt(item.id, 10))
      }

      const response = await fetch("http://localhost:8080/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentSession.accessToken}`
        },
        body: JSON.stringify({
          query: `
            mutation CreateCheckoutSession($input: PaymentRequest!) {
              createCheckoutSession(input: $input)
            }
          `,
          variables: { input }
        })
      })

      const result = await response.json()
      
      if (result.errors) {
        console.error("❌ GraphQL validation error:", result.errors)
        alert(`Checkout initialization failed: ${result.errors[0].message}`)
        setIsRedirecting(false)
        return
      }

      const stripeUrl = result.data?.createCheckoutSession

      if (stripeUrl) {
        setCartItems([]) 
        localStorage.removeItem("bundleboard_cart")
        window.dispatchEvent(new Event("cart_updated"))

        window.location.href = stripeUrl
      } else {
        throw new Error("Stripe URL not found in response")
      }

    } catch (error) {
      console.error("❌ Critical error during payment session initialization:", error)
      alert("Unable to connect to the payment server. Please try again later.")
      setIsRedirecting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 font-sans text-foreground">
      <div 
        className="absolute inset-0 bg-background/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-card border-l border-border/60 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 rounded-none">
        
        <div>
          <div className="flex justify-between items-center border-b border-border/40 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider">Your Cart</h2>
              <span className="text-[10px] font-semibold bg-muted px-1.5 py-0.5 border border-border/40 text-muted-foreground">
                {cartItems.length}
              </span>
            </div>
            <button 
              onClick={onClose}
              disabled={isRedirecting}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-none disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-3 border border-border/40 bg-background rounded-none group relative overflow-hidden"
                >
                  <div className="w-16 h-16 bg-muted border border-border/40 shrink-0 overflow-hidden rounded-none">
                    <img src={item.previewImage} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="space-y-0.5">
                      <span className="block text-[8px] font-semibold text-muted-foreground uppercase tracking-wide">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-xs uppercase text-foreground truncate tracking-tight pr-6">
                        {item.name}
                      </h4>
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    disabled={isRedirecting}
                    className="absolute top-3 right-3 text-muted-foreground/60 hover:text-destructive transition-colors p-1 disabled:opacity-30"
                    aria-label="Remove item"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-16 border border-dashed border-border/40 text-muted-foreground/50 uppercase font-semibold text-[10px] tracking-widest">
                Your shopping cart is empty
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border/40 pt-5 space-y-4 bg-card">
          <div className="flex justify-between items-baseline">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Subtotal Value</span>
            <div className="text-xl font-bold tracking-tight text-foreground">
              USD ${total.toFixed(2)}
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground leading-normal uppercase">
            Taxation and license certificates will be generated automatically upon checkout initialization.
          </p>

          <button 
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || isRedirecting}
            className={cn(
              "w-full py-4 bg-primary text-primary-foreground font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 rounded-none shadow-sm transition-all hover:opacity-90 active:scale-[0.99]",
              (cartItems.length === 0 || isRedirecting) && "opacity-30 cursor-not-allowed pointer-events-none"
            )}
          >
            {isRedirecting ? (
              <>
                Connecting to Stripe... <Loader2 size={13} className="animate-spin" />
              </>
            ) : (
              <>
                Proceed to Checkout <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}