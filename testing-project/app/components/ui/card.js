export function Card({ className = "", children }) {
    return (
      <div className={`rounded-xl border border-gray-700 bg-gray-900 p-4 ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ className = "", children }) {
    return <div className={`${className}`}>{children}</div>;
  }
  