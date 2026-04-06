import React, { useEffect, useState } from 'react'
import StudentCrudForm from './StudentCrudForm'

const StudentHomeSection = ({user}) => {
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(()=>{
    const controller = new AbortController();

    getStudent = async()=>{
      const res = await fetch()
    }

    return ()=>controller.abort()
  },[])
  return (
 
        <StudentCrudForm/>
    
  )
}


export default StudentHomeSection