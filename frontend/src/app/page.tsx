import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <main className="flex flex-col items-center gap-8 text-center p-8">
        <h1 className="text-4xl font-bold text-gray-800">🤖 AI Agent Platform</h1>
        <p className="text-gray-500 max-w-sm">
          Multi-agent AI platform สำหรับสร้างเอกสารและ Web App อัตโนมัติ
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/todos"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            📝 Todo List
          </Link>
        </div>
      </main>
    </div>
  );
}
