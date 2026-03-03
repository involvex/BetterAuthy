import { FaSignOutAlt } from 'react-icons/fa';
import { clearSession } from '../../util/session';

export function Logout() {
  return (
    <button
      className="icon bg-danger"
      onClick={async () => {
        try {
          clearSession();
          window.location.reload();
        } catch (err) {
          console.error(err);
        }
      }}
    >
      <FaSignOutAlt />
    </button>
  );
}
