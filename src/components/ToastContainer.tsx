import { ToastContainer as ReactToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { X } from 'lucide-react'

export function ToastContainer() {
  return (
    <ReactToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar
      closeButton={CloseButton}
      toastClassName="!bg-primary !text-primary text-sm border border-primary"
    />
  )
}

function CloseButton({
  closeToast,
}: {
  closeToast: (event: React.MouseEvent<HTMLElement>) => void
}) {
  return (
    <button
      type="button"
      aria-label="Close Toast"
      className="text-lg opacity-50 hover:opacity-100"
      onClick={closeToast}
    >
      <X size={16} className="inline-block -translate-y-0.5" />
    </button>
  )
}
