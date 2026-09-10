import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Categories from "./pages/Categories";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Help from "./pages/Help";
import Support from "./pages/Support";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import Terms from "./pages/Terms";
import ScrollToTopButton from "./components/ScrollToTopButton";
import Promotions from "./pages/Promotions";

import AdminDashboard from "./admin/AdminDashboard";
import AdminProducts from "./admin/AdminProducts";
import AdminAddProduct from "./admin/AdminAddProduct";
import AdminEditProduct from "./admin/AdminEditProduct";
import AdminLayout from "./admin/AdminLayout";
import AdminOrders from "./admin/AdminOrders";
import AdminSales from "./admin/AdminSales";
import AdminCategories from "./admin/AdminCategories";
import AdminUsers from "./admin/AdminUsers";
import AdminSettings from "./admin/AdminSettings";
import AdminStatistics from "./admin/AdminStatistics";
import AdminNotifications from "./admin/AdminNotifications";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* BOUTIQUE */}
        <Route path="/" element={<Home />} />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
  path="/favorites"
  element={<Favorites />}
/>

<Route
  path="/about"
  element={<About />}
/>

<Route
  path="/order-tracking"
  element={<OrderTracking />}
/>

<Route path="/support" element={<Support />} />

<Route path="/help" element={<Help />} />

<Route
  path="/terms"
  element={<Terms />}
/>

<Route
  path="/promotions"
  element={<Promotions />}
/>
        <Route
          path="/checkout"
          element={<Checkout />}
        />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route
  path="/my-orders"
  element={<MyOrders />}
/>

        {/* ADMINISTRATION */}
       <Route path="/admin" element={<AdminLayout />}>

  <Route
    index
    element={<AdminDashboard />}
  />

  <Route
    path="products"
    element={<AdminProducts />}
  />

  <Route
    path="products/add"
    element={<AdminAddProduct />}
  />

  <Route
    path="products/edit/:id"
    element={<AdminEditProduct />}
  />

  <Route
  path="/admin/orders"
  element={<AdminOrders />}
/>

<Route
  path="/admin/sales"
  element={<AdminSales />}
/>

<Route
  path="categories"
  element={<AdminCategories />}
/>

<Route
  path="users"
  element={<AdminUsers />}
/>

<Route
  path="settings"
  element={<AdminSettings />}
/>

<Route
  path="statistics"
  element={<AdminStatistics />}
/>

<Route
  path="/admin/notifications"
  element={<AdminNotifications />}
/>

</Route>
      </Routes>
      <ScrollToTopButton />
      <Footer />
    </BrowserRouter>
  );
}

export default App;