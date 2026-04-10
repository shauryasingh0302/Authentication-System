import { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-toastify'
import { AppContext } from '../context/AppContext';
import axios from 'axios'

function Login() {

    const navigate = useNavigate()

    const {backendUrl, setIsLoggedin, getUserData} = useContext(AppContext)

    const [state, setState] = useState('Login')
    const [name, setName]=useState('')
    const [email, setEmail]=useState('')
    const [password, setPassword]=useState('')
    
    const onSubmitHandler = async (e)=>{
        try {
            e.preventDefault();
            axios.defaults.withCredentials = true

            if(state==='Signup'){
                const {data} = await axios.post(backendUrl + '/api/auth/register', {name, email, password})

                if(data.success){
                    setIsLoggedin(true)
                    navigate('/')
                    getUserData()
                } else {
                    toast.error(data.message)

                }

            } else {

                const {data} = await axios.post(backendUrl + '/api/auth/login', {email, password})

                if(data.success){
                    setIsLoggedin(true)
                    getUserData()
                    navigate('/')
                } else {
                    toast.error(data.message)
                }

            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message)
        }
    }

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-linear-to-br from-blue-200 to-purple-400'>
        <img onClick={()=>navigate('/')} src={assets.logo} className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'/>
        <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
            <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state==='Signup' ? 'Create account':'Login'}</h2>
            <p className='text-center text-sm mb-6'>{state==='Signup' ? 'Create your account':'Login to your account!'}</p>

            <form onSubmit={onSubmitHandler}>
                {state==='Signup' && (
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.person_icon}/>
                    <input onChange={e => setName(e.target.value)} value={name} className='bg-transparent outline-none flex-1 w-full min-w-0' type='text' placeholder='Full Name' required/>
                    </div>
                )}
                
                <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                    <img src={assets.mail_icon}/>
                    <input onChange={e => setEmail(e.target.value)} value={email} className='bg-transparent outline-none flex-1 w-full min-w-0' type='email' placeholder='Email Address' required/>
                </div>

                <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                    <img src={assets.lock_icon}/>
                    <input onChange={e => setPassword(e.target.value)} value={password} className='bg-transparent outline-none flex-1 w-full min-w-0' type='password' placeholder='Password' required/>
                </div>

                <p onClick={()=> navigate('/reset-password')} className='mb-4 text-indigo-500 cursor-pointer'>Forgot password?</p>

                <button className='w-full py-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-900'>{state}</button>

            </form>

            {state==='Signup'?(
                <p className='text-gray-400 text-center text-xs mt-4'>Already have an account?{' '}<span onClick={()=> setState('Login')} className='text-blue-400 cursor-pointer underline'>Login here</span></p>
            ):(
                <p className='text-gray-400 text-center text-xs mt-4'>Don't have an account?{' '}<span onClick={()=> setState('Signup')} className='text-blue-400 cursor-pointer underline'>Signup here</span></p>
            )}
            
        </div>
    </div>
  )
}

export default Login