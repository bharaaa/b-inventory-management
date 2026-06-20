import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { timeAgo } from "../helpers/timeAgo";
import { formatDate } from "../helpers/formatDate";

export default function InventoryDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openSort, setOpenSort] = useState(false);
  const [sortBy, setSortBy] = useState("last_updated_desc");
  const [sorting, setSorting] = useState(false);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      case "stock_asc":
        return a.stock_count - b.stock_count;
      case "stock_desc":
        return b.stock_count - a.stock_count;
      case "last_updated_asc":
        return new Date(a.last_updated) - new Date(b.last_updated);
      case "last_updated_desc":
      default:
        return new Date(b.last_updated) - new Date(a.last_updated);
    }
  });

  const sortOptions = {
    last_updated_desc: "Last Updated (Newest)",
    last_updated_asc: "Last Updated (Oldest)",
    name_asc: "Name (A-Z)",
    name_desc: "Name (Z-A)",
    stock_asc: "Stock (Low → High)",
    stock_desc: "Stock (High → Low)",
  };

  async function fetchItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
    } else {
      setItems(data);
    }

    setLoading(false);
  }

  const handleSortChange = (key) => {
    setSorting(true);

    setTimeout(() => {
      setSortBy(key);
      setSorting(false);
      setOpenSort(false);
    }, 250);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-semibold text-gray-800">
              B Inventory Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Track and manage your stock items
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-400 rounded-lg text-sm w-40 sm:w-56 hover:ring-1 focus:outline-none focus:ring-1 focus:border-black transition-all duration-200"
            />
          </div>
        </div>

        <div className="relative my-2 flex">
          <button
            onClick={() => setOpenSort(!openSort)}
            className="p-2 border rounded-lg hover:bg-gray-100 transition-all text-xs text-gray-400 duration-200"
          >
            ⇅ Sort
          </button>

          {openSort && (
            <div className="absolute left-0 mt-10 w-52 bg-white border rounded-lg shadow-md z-10">
              {Object.entries(sortOptions).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleSortChange(key)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-gray-100 ${
                    sortBy === key
                      ? "text-blue-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white shadow-md rounded-2xl p-4">
          <div className="overflow-x-clip">
            <table className="min-w-full text-sm text-left">
              <thead className="sticky top-0 bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 w-10">ID</th>
                  <th className="px-4 py-3 w-50">Name</th>
                  <th className="px-4 py-3 w-30">Stock</th>
                  <th className="px-4 py-3 w-55">Last Updated</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {loading || sorting ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse h-14">
                      <td className="px-4 py-3 w-10">
                        <div className="h-4 bg-gray-200 rounded w-10"></div>
                      </td>
                      <td className="px-4 py-3 w-50">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </td>
                      <td className="px-4 py-3 w-30">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-4 py-3 w-55">
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-400">
                      No inventory data
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-400">
                      No items found for "
                      <span className="font-medium text-gray-600">
                        {search}
                      </span>
                      "
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition h-14"
                    >
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {item.id}
                      </td>
                      <td className="px-4 py-3 text-gray-800">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold">
                          {item.stock_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        <div className="flex flex-col">
                          <span className="hidden sm:block font-medium text-gray-700">
                            {timeAgo(item.last_updated)}
                          </span>
                          <span className="text-xs sm:text-gray-400 text-gray-700">
                            {formatDate(item.last_updated)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
