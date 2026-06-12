import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { ContactCard } from '../../components/ContactCard'

const DEPARTMENTS = [
  'Fire',
  'Police',
  'Flood',
  'Ambulance',
  'Landslide',
  'Earthquake'
]

export function ContactListPage() {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('')

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Emergency Contacts</h1>
        <p className="mt-1 text-sm text-gray-600">
          Tap a number to call directly
        </p>
      </div>
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-red-500 focus:outline-none"
          />
        </div>
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
        >
          <option value="">All</option>
          {DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        <ContactCard
          contact={{
            department: 'Fire',
            localGov: 'Butwal',
            phones: ['+977-9857000001', '+977-9857000002']
          }}
        />
        <ContactCard
          contact={{
            department: 'Police',
            localGov: 'Butwal',
            phones: ['+977-9857000010']
          }}
        />
      </div>
    </div>
  )
}
