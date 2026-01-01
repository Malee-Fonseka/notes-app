import React, {useState} from 'react'
import {FaRegEye, FaRegEyeSlash} from 'react-icons/fa6';

const PasswordInput = ({value, onChange, placeholder}) => {

  const [isShowPassword, setIsShowPassword] = useState(false)

  const toggleShowwPassword = () => {
    setIsShowPassword(!isShowPassword)
  }

  return (
    <div className="flex items-center bg-transparent border-[1.5px] px-5 rounded mb-3 select-none">
      <input 
        value={value}
        onChange={onChange}
        type={isShowPassword ? "text" : "password"}
        placeholder={placeholder || "Password"}
        className="w-full text-sm bg-transparent py-3 mr-3 rounded outline-none select-none"
      />

      { isShowPassword ? (
        <FaRegEye
        size={22}
        className="text-primary cursor-pointer"
        onClick={toggleShowwPassword}
      />
    ) : (
      <FaRegEyeSlash
      size={22}
      className="text-slate-400 cursor-pointer"
      onClick={toggleShowwPassword}
    />
    )
  }
    </div>
  )
}

export default PasswordInput