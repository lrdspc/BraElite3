import { InspectionForm } from '@/components/inspection/InspectionForm'

export default function NewInspectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold mb-6">Nova Vistoria</h2>
      <InspectionForm />
    </div>
  )
}
