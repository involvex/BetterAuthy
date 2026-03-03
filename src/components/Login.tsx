import './Login.css';
import { startGitHubOAuth } from '../util/oauth';

export function Login() {
  return (
    <div className="flex justify-center items-center flex-col">
      <GitHubLogin />
    </div>
  );
}

export function GitHubLogin() {
  return (
    <button className="gsi-material-button" onClick={() => startGitHubOAuth()}>
      <div className="gsi-material-button-state"></div>
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ display: 'block' }}>
            <path fill="#181717" d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1 1.6.7 1.9 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 016 0C17.4 3 18.4 3.3 18.4 3.3c.6 1.6.2 2.8.1 3.1.8.9 1.2 2 1.2 3.3 0 4.5-2.7 5.5-5.3 5.8.4.3.8 1 .8 2v3c0 .3.2.7.8.6A12 12 0 0012 .5z" />
          </svg>
        </div>
        <span className="gsi-material-button-contents">Sign in with GitHub</span>
        <span style={{ display: 'none' }}>Sign in with GitHub</span>
      </div>
    </button>
  );
}
