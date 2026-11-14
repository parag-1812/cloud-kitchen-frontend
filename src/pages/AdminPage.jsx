import { useEffect, useMemo, useState } from "react";
import {
  getStats,
  getAllOrders,
  getKitchenDirectory,
  getSupplierDirectory,
  getCustomerDirectory,
} from "../api/adminApi";

const rs = (n) => `Rs. ${Number(n || 0).toFixed(0)}`;

/** Group an array of rows by their `area` field, areas sorted alphabetically. */
function groupByArea(rows) {
  const map = {};
  for (const r of rows) (map[r.area] = map[r.area] || []).push(r);
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
}

function AdminPage() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [kitchens, setKitchens] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // filters
  const [kSearch, setKSearch] = useState("");
  const [kArea, setKArea] = useState("All");
  const [kType, setKType] = useState("All");
  const [sSearch, setSSearch] = useState("");
  const [sArea, setSArea] = useState("All");
  const [cSearch, setCSearch] = useState("");
  const [cArea, setCArea] = useState("All");

  async function fetchAll() {
    setIsLoading(true);
    setError("");
    try {
      const [st, od, ki, su, cu] = await Promise.all([
        getStats(),
        getAllOrders(),
        getKitchenDirectory(),
        getSupplierDirectory(),
        getCustomerDirectory(),
      ]);
      setStats(st);
      setOrders(od);
      setKitchens(ki);
      setSuppliers(su);
      setCustomers(cu);
    } catch (err) {
      setError("Could not load admin data. Is order-engine running?");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const areasOf = (rows) => ["All", ...Array.from(new Set(rows.map((r) => r.area))).sort()];

  const filteredKitchens = useMemo(
    () =>
      kitchens.filter(
        (k) =>
          (kArea === "All" || k.area === kArea) &&
          (kType === "All" || (kType === "Veg" ? k.vegetarianOnly : !k.vegetarianOnly)) &&
          k.name.toLowerCase().includes(kSearch.toLowerCase())
      ),
    [kitchens, kArea, kType, kSearch]
  );
  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter(
        (s) => (sArea === "All" || s.area === sArea) && s.name.toLowerCase().includes(sSearch.toLowerCase())
      ),
    [suppliers, sArea, sSearch]
  );
  const filteredCustomers = useMemo(
    () =>
      customers.filter(
        (c) => (cArea === "All" || c.area === cArea) && c.username.toLowerCase().includes(cSearch.toLowerCase())
      ),
    [customers, cArea, cSearch]
  );

  const sortedOrders = [...orders].sort((a, b) => b.orderId - a.orderId);

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="panel-header">
          <h2>Admin Console</h2>
          <button className="btn secondary" onClick={fetchAll} disabled={isLoading}>
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="stat-grid">
          <div className="stat-tile">
            <span className="stat-label">Orders</span>
            <span className="stat-value">{stats.totalOrders ?? 0}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Kitchens</span>
            <span className="stat-value">{kitchens.length}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Suppliers</span>
            <span className="stat-value">{suppliers.length}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Customers</span>
            <span className="stat-value">{customers.length}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">GMV</span>
            <span className="stat-value">{rs(stats.gmv ?? stats.totalRevenue)}</span>
          </div>
          <div className="stat-tile accent">
            <span className="stat-label">Platform Revenue</span>
            <span className="stat-value">{rs(stats.platformRevenue)}</span>
          </div>
        </div>

        <div className="seg" style={{ marginTop: 18 }}>
          {["overview", "kitchens", "suppliers", "customers"].map((t) => (
            <button key={t} className={`seg-btn ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      {tab === "overview" ? (
        <section className="panel">
          <div className="panel-header"><h2>All Orders</h2></div>
          {sortedOrders.length === 0 ? (
            <p className="meta-line">No orders yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>ID</th><th>Dish</th><th>Customer</th><th>Kitchen</th><th>Status</th><th>Price</th></tr>
                </thead>
                <tbody>
                  {sortedOrders.map((o) => (
                    <tr key={o.orderId}>
                      <td>#{o.orderId}</td>
                      <td>{o.dishSummary || `${o.items?.length ?? 0} item(s)`}</td>
                      <td>#{o.customerId}</td>
                      <td>{o.kitchenName || `#${o.kitchenId}`}</td>
                      <td><span className={`badge status-${o.status?.toLowerCase()}`}>{o.status}</span></td>
                      <td>{rs(o.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {tab === "kitchens" ? (
        <section className="panel">
          <div className="panel-header"><h2>Kitchens · {filteredKitchens.length}</h2></div>
          <div className="filter-bar">
            <input placeholder="Search name…" value={kSearch} onChange={(e) => setKSearch(e.target.value)} />
            <select value={kArea} onChange={(e) => setKArea(e.target.value)}>
              {areasOf(kitchens).map((a) => <option key={a}>{a}</option>)}
            </select>
            <select value={kType} onChange={(e) => setKType(e.target.value)}>
              <option value="All">All types</option>
              <option value="Veg">Veg-only</option>
              <option value="NonVeg">Veg + Non-veg</option>
            </select>
          </div>
          {groupByArea(filteredKitchens).map(([area, rows]) => (
            <div className="area-group" key={area}>
              <h4 className="area-title">📍 {area} · {rows.length}</h4>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Location</th><th>Stock items</th></tr></thead>
                  <tbody>
                    {rows.map((k) => (
                      <tr key={k.id}>
                        <td>#{k.id}</td>
                        <td>{k.name}</td>
                        <td><span className={`badge ${k.vegetarianOnly ? "status-delivered" : "status-requested"}`}>{k.vegetarianOnly ? "VEG" : "VEG+NONVEG"}</span></td>
                        <td>{k.latitude.toFixed(4)}, {k.longitude.toFixed(4)}</td>
                        <td>{k.stockCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "suppliers" ? (
        <section className="panel">
          <div className="panel-header"><h2>Suppliers · {filteredSuppliers.length}</h2></div>
          <div className="filter-bar">
            <input placeholder="Search name…" value={sSearch} onChange={(e) => setSSearch(e.target.value)} />
            <select value={sArea} onChange={(e) => setSArea(e.target.value)}>
              {areasOf(suppliers).map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          {groupByArea(filteredSuppliers).map(([area, rows]) => (
            <div className="area-group" key={area}>
              <h4 className="area-title">📍 {area} · {rows.length}</h4>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Supplies</th></tr></thead>
                  <tbody>
                    {rows.map((s) => (
                      <tr key={s.id}>
                        <td>#{s.id}</td>
                        <td>{s.name}</td>
                        <td>{s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</td>
                        <td>{s.stockCount} items</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {tab === "customers" ? (
        <section className="panel">
          <div className="panel-header"><h2>Customers · {filteredCustomers.length}</h2></div>
          <div className="filter-bar">
            <input placeholder="Search username…" value={cSearch} onChange={(e) => setCSearch(e.target.value)} />
            <select value={cArea} onChange={(e) => setCArea(e.target.value)}>
              {areasOf(customers).map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          {groupByArea(filteredCustomers).map(([area, rows]) => (
            <div className="area-group" key={area}>
              <h4 className="area-title">📍 {area} · {rows.length}</h4>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>ID</th><th>Username</th><th>Orders</th><th>Total spent</th></tr></thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c.id}>
                        <td>#{c.id}</td>
                        <td>{c.username}</td>
                        <td>{c.orders}</td>
                        <td>{rs(c.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default AdminPage;
