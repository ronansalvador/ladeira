// import React, { useState } from 'react'
// import Image from 'next/image'
// import styles from './style.module.css'
// import eye from '../../../../public/eye.svg'
// import eyeSlash from '../../../../public/eye-slash.svg'

// interface PasswordInputProps {
//   placeholder: string
//   passwordValue: string
//   setPassword: (password: string) => void
// }

// const PasswordInput: React.FC<PasswordInputProps> = ({
//   placeholder,
//   passwordValue,
//   setPassword,
// }) => {
//   const [showPassword, setShowPassword] = useState(false)

//   return (
//     <div className={styles.password_input}>
//       <input
//         type={showPassword ? 'text' : 'password'}
//         name="password"
//         id="password"
//         placeholder={placeholder}
//         value={passwordValue}
//         onChange={(e) => setPassword(e.target.value)}
//         autoComplete="current-password"
//       />

//       <button
//         className={styles.show_password}
//         type="button"
//         onClick={() => setShowPassword(!showPassword)}
//       >
//         {/* Substitua os paths de 'eye' e 'eyeSlash' pelos caminhos corretos das suas imagens */}
//         <Image
//           src={showPassword ? eye : eyeSlash}
//           alt="toggle password visibility"
//           width={24} // Ajuste conforme necessário
//           height={24} // Ajuste conforme necessário
//         />
//       </button>
//     </div>
//   )
// }

// export default PasswordInput
import React, { useState } from 'react'
import Image from 'next/image'
import eye from '../../../../public/eye.svg'
import eyeSlash from '../../../../public/eye-slash.svg'

interface PasswordInputProps {
  placeholder: string
  passwordValue: string
  setPassword: (password: string) => void
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder,
  passwordValue,
  setPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? 'text' : 'password'}
        name="password"
        id="password"
        placeholder={placeholder}
        value={passwordValue}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-3 flex items-center justify-center text-gray-500 hover:text-gray-700"
      >
        <Image
          src={showPassword ? eyeSlash : eye}
          alt="toggle password visibility"
          width={22}
          height={22}
        />
      </button>
    </div>
  )
}

export default PasswordInput
