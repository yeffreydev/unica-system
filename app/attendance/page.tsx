import Container from "../ui/Container";

export default function AttendancePage() {
  return (
    <Container>
      <div className="min-h-screen bg-gray-100 p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Llamado de Lista</h1>
          <p className="text-sm text-gray-600">
            Fecha del evento:{" "}
            <span className="font-medium">17 de Enero, 2025</span>
          </p>
        </header>

        <div className="bg-white rounded-lg shadow">
          <table className="w-full table-auto border-collapse">
            <thead className="bg-gray-200 text-gray-600 text-sm uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2 border text-left">
                  Nombres y Apellidos
                </th>
                <th className="px-4 py-2 border text-center">Falta</th>
                <th className="px-4 py-2 border text-center">Tardanza</th>
                <th className="px-4 py-2 border text-center">Assistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              <tr>
                <td className="px-4 py-2 border">Juan Perez</td>
                <td className="px-4 py-2 border text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-500 focus:ring-red-400"
                  />
                </td>
                <td className="px-4 py-2 border text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                  />
                </td>
                <td className="px-4 py-2 border text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                  />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border">María Gómez</td>
                <td className="px-4 py-2 border text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-red-500 focus:ring-red-400"
                  />
                </td>
                <td className="px-4 py-2 border text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                  />
                </td>
                <td className="px-4 py-2 border text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-yellow-500 focus:ring-yellow-400"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
