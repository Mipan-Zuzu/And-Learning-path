import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import ErrorPages from "./pages/ErorPages";
import RegisterPage from "./pages/RegisterPages";
import LoginPage from "./pages/LoginPage";
import Main from "./pages/Main"
import ProtectedRoute from "./service/RequireLogin"
import Dashboard from "./pages/Dhasboard";
import SuccsesLogin from "./pages/SuccsesLogin";


const router = createBrowserRouter([

  {
    path : "/register",
    element : <RegisterPage/>,
  },

  {
    path : "/",
    element : <LoginPage />,
    errorElement : <ErrorPages />
  },

  {
  path: "/home",
  element: (
    <ProtectedRoute>
      <Main />
    </ProtectedRoute>
  ),
  },
  {
    path : "/dashboard",
    element : (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  )
  },
  {
    path : "/profile",
    element : (
      <ProtectedRoute>
        <SuccsesLogin />
      </ProtectedRoute>
    )
  }


])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
);
