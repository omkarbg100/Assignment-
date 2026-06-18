import { useEffect, useState } from "react";

const format = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

const CountdownTimer = ({ expiresAt, onExpire }) => {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
  );

  useEffect(() => {
    if (remaining === 0) {
      onExpire?.();
      return undefined;
    }

    const timer = setInterval(() => {
      const next = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-medium text-violet-800">
      Reservation expires in {format(remaining)}
    </div>
  );
};

export default CountdownTimer;
