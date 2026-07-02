/**
 * Sonner setup since it's installed via package.json. We don't need a heavy local implementation if sonner is available.
 * But wait, I didn't import it in App.tsx. I should add Sonner Toaster to App.tsx.
 */
import { Toaster as SonnerToaster } from 'sonner'
export const Toaster = () => {
  return (
    <SonnerToaster 
      theme="dark" 
      toastOptions={{
        className: 'bg-card border-border text-foreground',
      }}
    />
  )
}
