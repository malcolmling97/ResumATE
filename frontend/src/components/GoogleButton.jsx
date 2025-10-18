import React from "react"

const GoogleButton = ({ onClick, disabled = false }) => {
  

  return (
    <button
      type="button"
      className="w-full bg-white text-black px-4 py-2 mt-2 border border-[#A9A9A9] rounded-lg text-base font-normal cursor-pointer flex items-center justify-center gap-2 transition-colors duration-300 hover:bg-[#EEF5FE] hover:border-[#CBE0FA]"
      onClick={onClick}
      disabled={disabled}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google Logo"
        width={20}
        height={20}
        className="inline-block"
      />
      <span>Continue with Google</span>
    </button>
  )
}

export default GoogleButton