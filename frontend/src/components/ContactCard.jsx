import { Phone, MapPin, Building2 } from 'lucide-react'

export function ContactCard({ contact }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
        <Building2 className="h-5 w-5 text-red-600" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{contact.department}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          {contact.localGov}
        </p>
        <div className="mt-2 space-y-1">
          {contact.phones?.map((phone, i) => (
            <a
              key={i}
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <Phone className="h-3.5 w-3.5" />
              {phone}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
