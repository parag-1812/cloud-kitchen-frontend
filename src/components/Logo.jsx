/**
 * Crave brand logo — a warm gradient tile with a double "spark" mark,
 * suggesting the AI conjuring exactly the dish you crave.
 */
function Logo({ size = 40 }) {
  const id = "craveGrad";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Crave"
    >
      <defs>
        <linearGradient id={id} x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A3E" />
          <stop offset="0.55" stopColor="#FF6A3C" />
          <stop offset="1" stopColor="#F5423C" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${id})`} />
      {/* main spark */}
      <path
        d="M21 9c1.7 7 3.4 8.7 10.4 10.4C24.4 21.1 22.7 22.8 21 29.8 19.3 22.8 17.6 21.1 10.6 19.4 17.6 17.7 19.3 16 21 9Z"
        fill="#fff"
      />
      {/* small spark */}
      <path
        d="M33.5 26c.9 3.4 1.7 4.2 5.1 5.1-3.4.9-4.2 1.7-5.1 5.1-.9-3.4-1.7-4.2-5.1-5.1 3.4-.9 4.2-1.7 5.1-5.1Z"
        fill="#fff"
        fillOpacity="0.92"
      />
    </svg>
  );
}

export default Logo;
