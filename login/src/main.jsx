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


const router = createBrowserRouter([

  {
    path : "/",
    element : <h1>Welcome to landing page</h1>,
    errorElement: <ErrorPages />
  },

  {
    path : "/register",
    element : <RegisterPage/>,
  },

  {
    path : "/login",
    element : <LoginPage />,
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
    element : <Dashboard />
  },
  {
    path : "/settings",
    element : ""
  }


])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>
);
