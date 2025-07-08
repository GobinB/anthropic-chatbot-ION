export function EmptyScreen() {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="flex flex-col gap-4 rounded-2xl bg-blue-50 sm:p-8 p-4 text-sm sm:text-base">
        <h1 className="text-2xl sm:text-3xl tracking-tight font-semibold max-w-fit inline-block text-blue-800">
          💧 ION Water Support Assistant
        </h1>
        <p className="leading-normal text-blue-900">
          Welcome to ION Water's technical support assistant. I'm here to help you troubleshoot 
          water meter connectivity issues and navigate your device infrastructure.
        </p>
        <div className="space-y-3">
          <h3 className="font-semibold text-blue-800">I can help you with:</h3>
          <ul className="space-y-2 text-blue-900">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Device status analysis and connectivity troubleshooting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Root cause analysis for offline meters and infrastructure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Step-by-step troubleshooting procedures for gateways, routers, and meters</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>Understanding device hierarchy and data patterns</span>
            </li>
          </ul>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Getting Started:</strong> Upload your device CSV file below to get started with personalized troubleshooting assistance based on your actual device data.
          </p>
        </div>
      </div>
    </div>
  )
}
