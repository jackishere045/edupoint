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
      className="border rounded px-2 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    >
      <option value="">All Categories</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.name}>
          {cat.name}
        </option>
      ))}
    </select>

  )
}