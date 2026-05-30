<script lang="ts">
  import { Toaster } from 'svelte-sonner'
</script>

<Toaster
  position="bottom-right"
  toastOptions={{
    style: 'background: #111; color: #fafafa; border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; font-family: "SF Pro Display", "Geist Sans", sans-serif; font-size: 0.875rem;',
    class: 'my-toast',
  }}
  closeButton={true}
  richColors={false}
  duration={3000}
/>
