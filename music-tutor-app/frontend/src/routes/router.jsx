import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import RootLayout from "../Layout/RootLayout";
import Home from "../pages/Home";
import About from "../pages/About";
import ContactLayout from "../Layout/ContactLayout";
import FindTutors from "../pages/FindTutors";
import Register from '../pages/Register';
import TutorRegisterForm from "../components/TutorRegisterForm";
import StudentRegisterForm from "../components/StudentRegisterForm";


const router =  createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout/>}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<ContactLayout />}/>
      <Route path="findTutors" element={<FindTutors />}/>
      {/* register link in navbar */}
      <Route path="register" element={<Register/>}/>
      {/* links to registration forms */}
      <Route path="register/tutor" element={<TutorRegisterForm/>}/>
      <Route path="register/student" element={<StudentRegisterForm/>}/>

    </Route>
  )
);

export default router;
