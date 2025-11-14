
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
      <div className="flex-shrink-0">
        <Logo className="w-6 h-6 "/>
      </div>
  
      <ul className='flex flex-row  rounded-3xl shadow-[0_0_30px_0_rgba(0,0,0,0.1)]'>
        <li className='m-4'><NavLink to="/">Home</NavLink></li>
        <li className='m-4'><NavLink to="/about">About</NavLink></li>
        <li className='m-4'><NavLink to="/contact">Contact</NavLink></li>
        <li className='m-4'><NavLink to="/findTutors">Find a tutor</NavLink></li>
      </ul>
      
      <div className=" flex items-center gap-3">
        <NavLink to="/register" className="px-4 py-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition"> Register</NavLink>
        {user? (<LogOutButton />) : (<><button className='px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 transition cursor-pointer'>Log in</button></>)}
      </div>

    </nav>
  )
}

export default NavBar