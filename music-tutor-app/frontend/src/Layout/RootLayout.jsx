import React from 'react'
import NavBar from '../components/NavBar'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return (
    <>
      <NavBar />
      <div className='content px-4 w-full bg-slate-100'>
        <Outlet/>
        </div>
    </>
  )
}

export default RootLayout
