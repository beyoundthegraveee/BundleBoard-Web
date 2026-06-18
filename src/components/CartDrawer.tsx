"use client"

import * as React from "react"
import { X, Trash2, ArrowRight, ShoppingBag, Loader2, Download } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useMutation } from "@apollo/client/react"
import { CreateCheckoutSessionDocument } from "@/graphql/generated"

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
  const router = useRouter()
  const [cartItems, setCartItems] = React.useState<CartItem[]>([])
  const [executeCreateCheckout, { loading: isRedirecting }] = useMutation(CreateCheckoutSessionDocument)

  React.useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem("bundleboard_cart")
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart))
        } catch (error) {
          console.error("❌ Failed to parse cart data:", error)
        }
      } else {
        setCartItems([])
      }
    }

    loadCart()

    window.addEventListener("cartUpdate", loadCart)
    return () => window.removeEventListener("cartUpdate", loadCart)
  }, [isOpen])

  const total = cartItems.reduce((sum, item) => sum + item.price, 0)
  const isFreeCart = total === 0 && cartItems.length > 0;

  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem("bundleboard_cart", JSON.stringify(updatedCart))
    window.dispatchEvent(new Event("cartUpdate")) 
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isRedirecting) return
    
    if (!session) {
      toast.error("Please sign in to proceed.")
      return
    }

    try {
      const currentSession = session as any;
      const { data } = await executeCreateCheckout({
        variables: {
          input: {
            userId: String(currentSession.user?.id), 
            currency: "USD",
            collectionIds: cartItems.map(item => String(item.id)) 
          }
        }
      })

      const returnedUrl = data?.createCheckoutSession

      if (returnedUrl) {
        setCartItems([]) 
        localStorage.removeItem("bundleboard_cart")
        window.dispatchEvent(new Event("cartUpdate"))
        if (returnedUrl.startsWith('http')) {
           window.location.href = returnedUrl
        } else {
           router.push(returnedUrl)
           onClose()
        }
      } else {
        throw new Error("Target URL not found in response")
      }

    } catch (error: any) {
      console.error("❌ Critical error during payment session initialization:", error)
      toast.error(error.message || "Unable to process the request. Please try again later.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 font-sans text-foreground flex justify-end">
      <div 
        className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative h-full w-full sm:w-[400px] bg-card border-l border-border/60 p-4 sm:p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300 rounded-none">
        
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex justify-between items-center border-b border-border/40 pb-3 sm:pb-4 mb-4 sm:mb-6 shrink-0">
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

          <div className="flex-1 overflow-y-auto pr-1 space-y-3 sm:space-y-4 custom-scrollbar pb-4">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 border border-border/40 bg-background rounded-none group relative overflow-hidden"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted border border-border/40 shrink-0 overflow-hidden rounded-none">
                    <img src={item.previewImage} alt="" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div className="space-y-0.5">
                      <span className="block text-[8px] font-semibold text-muted-foreground uppercase tracking-wide">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-[11px] sm:text-xs uppercase text-foreground truncate tracking-tight pr-6">
                        {item.name}
                      </h4>
                    </div>
                    <div className="text-[11px] sm:text-xs font-bold text-foreground">
                      {item.price === 0 ? "FREE" : `$${item.price.toFixed(2)}`}
                    </div>
                  </div>

                  <button 
                    onClick={() => removeItem(item.id)}
                    disabled={isRedirecting}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 text-muted-foreground/60 hover:text-destructive transition-colors p-1 disabled:opacity-30"
                    aria-label="Remove item"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 sm:py-16 border border-dashed border-border/40 text-muted-foreground/50 uppercase font-semibold text-[10px] tracking-widest mt-2">
                Your shopping cart is empty
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border/40 pt-4 sm:pt-5 space-y-3 sm:space-y-4 bg-card shrink-0 mt-auto">
          <div className="flex justify-between items-baseline">
            <span className="text-[9px] sm:text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Subtotal Value</span>
            <div className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {isFreeCart ? "FREE" : `USD $${total.toFixed(2)}`}
            </div>
          </div>

          <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-relaxed uppercase">
            {isFreeCart 
              ? "Assets will be instantly added to your library."
              : "Taxation and license certificates will be generated automatically upon checkout initialization."
            }
          </p>

          <button 
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || isRedirecting}
            className={cn(
              "w-full py-3.5 sm:py-4 bg-primary text-primary-foreground font-bold uppercase text-[11px] sm:text-xs tracking-widest flex items-center justify-center gap-2 rounded-none shadow-sm transition-all hover:opacity-90 active:scale-[0.99]",
              (cartItems.length === 0 || isRedirecting) && "opacity-30 cursor-not-allowed pointer-events-none"
            )}
          >
            {isRedirecting ? (
              <>
                Processing... <Loader2 size={13} className="animate-spin" />
              </>
            ) : isFreeCart ? (
              <>
                Get For Free <Download size={13} />
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