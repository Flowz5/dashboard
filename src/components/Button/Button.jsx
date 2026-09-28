import './Button.css';

const Button = ({ children, onClick, className = '', id = '' }) => {
  return (
    <button id={id} className={`custom-button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
