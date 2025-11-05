
import { useContext } from 'react'
import Logo from './Logo'
import { NavLink, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import LogOutButton from './LogOutButton'

const NavBar = () => {
  // run any hooks at top of component!

  // get user context!
  const {user} = useContext(UserContext);

  const navigate = useNavigate()

  return (
    <nav className='flex flex-row justify-between px-4 py-2'>
      <Logo className="w-6 h-6 "/>
      <ul className='flex flex-row  rounded-3xl shadow-[0_0_30px_0_rgba(0,0,0,0.1)]'>
        <li className='m-4'><NavLink to="/">Home</NavLink></li>
        <li className='m-4'><NavLink to="/products">Products</NavLink></li>
        <li className='m-4'><NavLink to="/about">About</NavLink></li>
        <li className='m-4'><NavLink to="/contact">Contact</NavLink></li>
        <li className='m-4'><NavLink to="/findTutors">Find a tutor</NavLink></li>
        { user ? (<></>):(<>        <li className='m-4'><NavLink to="/registerUser">Register as user</NavLink></li>
        <li className='m-4'><NavLink to="/loginUser">Log in as user</NavLink></li></>)}
      </ul>
      {user? (<LogOutButton />) : (<></>)}
      <button onClick={()=>navigate('/about')} className="text-white px-3  rounded-3xl bg-black  hover:bg-sky-600">Get Started</button>
    </nav>
  )
}

export default NavBar