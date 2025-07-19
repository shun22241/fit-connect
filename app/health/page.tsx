export default function HealthCheckPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Health Check</h1>
      <p>✅ The app is running!</p>
      <p>Build time: {new Date().toISOString()}</p>
    </div>
  )
}
