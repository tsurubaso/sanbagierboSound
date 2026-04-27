
export default function SearchBar({ value, onChange, placeholder = "🔍 Rechercher..." }) {
  return (
    <div className="mb-6">
      <input
        type="text"
        value={value}        // controlled
        onChange={onChange}  // propagate to parent
        placeholder={placeholder}
        className="w-full max-w-md px-4 py-2 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-gray-600"
      />
    </div>
  );
}
