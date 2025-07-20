export default function KategoriFilter({
  categories,
  selectedCategory,
  onSelectCategory
}: {
  categories: { id: string; name: string }[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}) {
  return (
    <select
      value={selectedCategory}
      onChange={(e) => onSelectCategory(e.target.value)}
      className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Categories</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  )
}
