import React, { useEffect, useState } from 'react'

import AssemblySetup from './AssemblySetup';
import Login from './Login';
import axios from 'axios';
import { URL } from './BaseURL';
import SetupSteps from './SetupSteps';

function SystemStart() {
const [activation ,setactivation]=useState(true)
const [getActivationData , setgetActivationData]=useState()

useEffect(()=>{
    
    axios.get(URL).then(res=>setgetActivationData(res.data)) .catch(err=>console.log(URL))

},[])

useEffect(()=>{

    if(getActivationData){

        setactivation(getActivationData[0].state)
    }

},[getActivationData])
  return (

    <div className=''>
    {activation ? 

            <>
            <div className=''>
             
             <Login/>
             </div>
            
            </>
            : 
           // <AssemblySetup/>
           <SetupSteps/>
        }

</div>
  )
}

export default SystemStart