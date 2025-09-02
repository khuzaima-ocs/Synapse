'use client'

import { useData } from '@/lib/data-store'

export default function TestDebugPage() {
  const { tools } = useData()

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug: Tools Data</h1>
      
      <div className="space-y-4">
        {tools.map((tool) => (
          <div key={tool.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{tool.name}</h3>
            <p className="text-sm text-gray-600">{tool.description}</p>
            <div className="mt-2">
              <strong>Type:</strong> {tool.type}
            </div>
            <div className="mt-2">
              <strong>Function Names:</strong> {tool.functionNames ? JSON.stringify(tool.functionNames) : 'None'}
            </div>
            <div className="mt-2">
              <strong>Has Function Schema:</strong> {tool.functionSchema ? 'Yes' : 'No'}
            </div>
            <div className="mt-2">
              <strong>Schema:</strong> {tool.schema ? 'Present' : 'None'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
