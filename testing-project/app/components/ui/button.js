export function Button({ children, className = "", variant = "default", ...props }) {
    let baseClasses = "rounded-xl py-2 px-4 font-semibold transition ";
  
    let variantClasses = "";
    if (variant === "default") {
      variantClasses = "bg-blue-600 hover:bg-blue-700 text-white";
    } else if (variant === "outline") {
      variantClasses = "border border-gray-500 text-white hover:bg-gray-800";
    }
  
    return (
      <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
        {children}
      </button>
    );
  }
  