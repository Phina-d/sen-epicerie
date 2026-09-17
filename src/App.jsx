import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

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
import Promotions from "./pages/Promotions";
import AdminLogin from "./pages/AdminLogin";

import ScrollToTopButton from "./components/ScrollToTopButton";

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

import { AuthProvider, useAuth } from "./context/AuthContext";


/* =========================================
   ROUTE ADMIN PROTÉGÉE
========================================= */

function AdminRoute({ children }) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-loading">
          Vérification de la session...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }

  return children;
}


/* =========================================
   CONTENU PRINCIPAL DE L'APPLICATION
========================================= */

function AppContent() {
  const location = useLocation();

  const isAdminLogin =
    location.pathname === "/admin/login";

  return (
    <>
      {!isAdminLogin && <Navbar />}

      <Routes>

        {/* ================================
            CONNEXION ADMIN
        ================================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* ================================
            BOUTIQUE
        ================================= */}

        <Route
          path="/"
          element={<Home />}
        />

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

        <Route
          path="/support"
          element={<Support />}
        />

        <Route
          path="/help"
          element={<Help />}
        />

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

        <Route
          path="/order/:id"
          element={<OrderDetails />}
        />

        <Route
          path="/my-orders"
          element={<MyOrders />}
        />


        {/* ================================
            ADMINISTRATION PROTÉGÉE
        ================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >

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
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="sales"
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
            path="notifications"
            element={<AdminNotifications />}
          />

        </Route>

      </Routes>

      <ScrollToTopButton />

      {!isAdminLogin && <Footer />}
    </>
  );
}


/* =========================================
   APPLICATION
========================================= */

function App() {

  /*
    Vite connaît automatiquement la base
    de l'application.

    En développement :
    /

    Sur GitHub Pages :
    /sen-epicerie/
  */

  const basename =
    import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <AuthProvider>

      <BrowserRouter basename={basename}>

        <AppContent />

      </BrowserRouter>

    </AuthProvider>
  );
}

export default App;