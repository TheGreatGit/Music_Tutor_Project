import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import RootLayout from "../Layout/RootLayout";
import Home from "../pages/Home";
import Products from "../pages/Products";
import About from "../pages/About";

import ContactLayout from "../Layout/ContactLayout";
import RegisterUserForm from "../components/RegisterUserForm";
import LoginUserForm from "../pages/Login";
import FindTutors from "../pages/FindTutors";

const router =  createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout/>}>
      <Route index element={<Home />} />
      <Route path="products" element={<Products />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<ContactLayout />}/>
      <Route path='registerUser' element={<RegisterUserForm/>} />
      <Route path="loginUser" element={<LoginUserForm />}/>
      <Route path="loginUser" element={<LoginUserForm />}/>
      <Route path="findTutors" element={<FindTutors />}/>
    </Route>
  )
);

export default router;
