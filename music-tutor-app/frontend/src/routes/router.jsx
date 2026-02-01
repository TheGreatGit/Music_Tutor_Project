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
import Register from "../pages/Register";
import TutorRegisterForm from "../components/TutorRegisterForm";
import StudentRegisterForm from "../components/StudentRegisterForm";
import LoginUserForm from "../pages/LoginUserForm";
import CalendarTestPage from "../pages/CalendarTestPage";
import TutorProfilePage from "../pages/TutorProfilePage";
import SocketTestPage from "../pages/socketTestPage";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<ContactLayout />} />
      <Route path="findTutors" element={<FindTutors />} />
      {/* route for individual tutors */}
      <Route path="tutors/:tutorId" element={<TutorProfilePage />} />
      {/* for the register-link in navbar */}
      <Route path="register" element={<Register />} />
      {/* links to registration forms */}
      <Route path="register/tutor" element={<TutorRegisterForm />} />
      <Route path="register/student" element={<StudentRegisterForm />} />
      <Route path="login" element={<LoginUserForm />} />

      <Route path="/socket-test" element={<SocketTestPage />} />
    </Route>,
  ),
);

export default router;
