import { Outlet } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";

import "../styles/AdminLayout.css";

function AdminLayout() {
  return (
    <div className="admin-layout">

      <AdminSidebar />

      <div className="admin-layout-content">

        <Outlet />

      </div>

    </div>
  );
}

export default AdminLayout;