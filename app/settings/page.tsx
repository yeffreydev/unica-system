import Link from "next/link";
import Container from "../ui/Container";
export default function SettingsPage() {
  return (
    <Container>
      <h1 className="text-2xl font-bold">System Settings</h1>

      <div className="my-4">
        <label className="block mb-2 font-medium">Dark Mode</label>
        <input type="checkbox" />
      </div>

      <div className="my-4">
        <label className="block mb-2 font-medium">System Name</label>
        <input type="text" className="border p-2 w-full" />
      </div>

      <div className="my-4">
        <label className="block mb-2 font-medium">Logo</label>
        <img
          src="https://img
.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg"
          alt="Logo"
          width={100}
          height={100}
        />
      </div>

      <div className="my-4">
        <h2 className="font-medium">Additional Properties</h2>

        <button className="mt-2 bg-blue-500 text-white py-1 px-4 rounded">
          Add Property
        </button>
      </div>

      <button className="mt-4 bg-green-500 text-white py-2 px-6 rounded">
        Save Settings
      </button>
    </Container>
  );
}
